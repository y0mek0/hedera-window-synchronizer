const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { loadConfig, runtimeOptions, resolvePath } = require('./core/config.cjs');
const { SynchronizerBus } = require('./core/event-bus.cjs');
const { safeBounds } = require('./core/geometry.cjs');
const { applyProfileUpdate } = require('./core/profile-config.cjs');
const { createConnectorRegistry } = require('./core/connector-registry.cjs');

let mainWindow;
const childWindows = new Map();
let config;
let options;
let bus;
let registry;
let state;
let running = false;

function initialState() {
  return { status: 'idle', mode: options.mode, profile: options.profile, scenario: null, stage: null, records: [], events: [], error: null };
}

function broadcast(event) {
  const windows = [mainWindow, ...childWindows.values()];
  for (const window of windows) {
    if (window && !window.isDestroyed()) window.webContents.send('hws:event', event);
  }
}

function emit(type, payload = {}) {
  const event = bus.publish(type, payload);
  state.events = [...state.events.slice(-79), event];
  if (type === 'stage') state.stage = payload.stage;
  if (type === 'scenario-started') { state.scenario = payload.scenario; state.status = 'running'; state.error = null; }
  if (type === 'proof-record') { state.records = [...state.records, payload.record]; state.status = 'complete'; state.stage = 'check'; }
  if (type === 'run-stopped') state.status = 'stopped';
  if (type === 'run-failed') { state.status = 'error'; state.error = payload.error; }
  broadcast(event);
  return event;
}

function setupBus() {
  bus = new SynchronizerBus();
  bus.on('event', (event) => {
    if (event.type === 'stage' || event.type === 'source-read' || event.type === 'normalized' || event.type === 'hashed' || event.type === 'proof-record') {
      broadcast(event);
    }
  });
}

function createMainWindow() {
  const display = screen.getPrimaryDisplay().workArea;
  const profile = config.windows.profiles[options.profile] || config.windows.profiles[config.windows.app.defaultProfile];
  const bounds = safeBounds(profile.bounds, display);
  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#050505',
    title: 'Hedera Window Synchronizer',
    webPreferences: {
      preload: resolvePath('src/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false
    }
  });
  mainWindow.loadFile(resolvePath('src/renderer/index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createConfiguredChildWindows() {
  const display = screen.getPrimaryDisplay().workArea;
  for (const item of config.windows.windows) {
    if (item.mode !== 'window' || !item.visible) continue;
    const bounds = safeBounds(item.bounds || { x: 100, y: 100, width: 760, height: 560 }, display);
    const child = new BrowserWindow({
      ...bounds,
      minWidth: 520,
      minHeight: 360,
      backgroundColor: '#050505',
      title: item.label,
      parent: mainWindow,
      webPreferences: { preload: resolvePath('src/preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: false }
    });
    child.loadFile(resolvePath('src/renderer/window.html'), { query: { windowId: item.id, role: item.role, label: item.label, profile: options.profile } });
    child.on('closed', () => childWindows.delete(item.id));
    childWindows.set(item.id, child);
  }
}

async function runOne(scenarioId) {
  if (running) throw new Error('A scenario is already running');
  const scenario = config.scenarios.scenarios.find((item) => item.id === scenarioId);
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);
  running = true;
  state.status = 'running';
  emit('scenario-started', { scenario: scenario.id, label: scenario.label, description: scenario.description });
  try {
    const record = await registry.run(scenario.connector, scenario);
    emit('scenario-complete', { scenario: scenario.id, record });
    return record;
  } catch (error) {
    emit('run-failed', { scenario: scenario.id, error: error instanceof Error ? error.message : String(error) });
    throw error;
  } finally {
    running = false;
  }
}

async function runAll() {
  if (running) throw new Error('A scenario is already running');
  const results = [];
  for (const scenario of config.scenarios.scenarios) {
    if (state.status === 'stopped') break;
    results.push(await runOne(scenario.id));
    await new Promise((resolve) => setTimeout(resolve, 650));
  }
  return results;
}

function registerIpc() {
  ipcMain.handle('hws:bootstrap', () => ({ config, options, state }));
  ipcMain.handle('hws:run', async (_event, scenarioId) => runOne(scenarioId));
  ipcMain.handle('hws:run-all', async () => runAll());
  ipcMain.handle('hws:stop', () => { state.status = 'stopped'; emit('run-stopped'); return state; });
  ipcMain.handle('hws:set-mode', (_event, mode) => { if (!['dry-run', 'live'].includes(mode)) throw new Error('Unsupported mode'); options.mode = mode; state.mode = mode; emit('mode-changed', { mode }); return mode; });
  ipcMain.handle('hws:set-profile', (_event, profile) => { if (!config.windows.profiles[profile]) throw new Error(`Unknown profile: ${profile}`); options.profile = profile; state.profile = profile; emit('profile-changed', { profile }); return profile; });
  ipcMain.handle('hws:save-profile', (_event, payload) => {
    const profileId = payload?.profileId;
    const profile = applyProfileUpdate(config.windows, payload);
    fs.writeFileSync(resolvePath('config/windows.json'), `${JSON.stringify(config.windows, null, 2)}\n`, 'utf8');
    if (profileId === options.profile && mainWindow && !mainWindow.isDestroyed()) {
      const display = screen.getPrimaryDisplay().workArea;
      mainWindow.setBounds(safeBounds(profile.bounds, display));
    }
    emit('profile-saved', { profile: profileId });
    return { profileId, profile };
  });
}

app.whenReady().then(() => {
  config = loadConfig();
  options = runtimeOptions();
  state = initialState();
  setupBus();
  registry = createConnectorRegistry({ bus, options });
  registerIpc();
  createMainWindow();
  createConfiguredChildWindows();
  if (process.env.HWS_AUTORUN === '1') setTimeout(() => runAll().catch((error) => console.error(error)), 1200);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createMainWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
