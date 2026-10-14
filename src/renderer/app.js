const STAGES = ['read', 'normalize', 'hash', 'write to HCS', 'check'];
const state = {
  config: null,
  options: null,
  runtime: null,
  events: [],
  stage: null,
  scenario: null,
  records: [],
  activeScenario: null
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function currentScenario() {
  return state.config?.scenarios?.scenarios?.find((item) => item.id === state.activeScenario) || null;
}

function renderScenarios() {
  const strip = $('scenario-strip');
  strip.innerHTML = '';
  for (const scenario of state.config.scenarios.scenarios) {
    const button = document.createElement('button');
    button.className = 'scenario-button';
    button.textContent = scenario.label;
    button.dataset.scenario = scenario.id;
    button.addEventListener('click', () => runScenario(scenario.id));
    strip.appendChild(button);
  }
}

function renderProfiles() {
  const select = $('profile-select');
  select.innerHTML = Object.entries(state.config.windows.profiles).map(([id, profile]) => `<option value="${escapeHtml(id)}">${escapeHtml(profile.label)}</option>`).join('');
  select.value = state.options.profile;
  select.addEventListener('change', async () => {
    await window.hws.setProfile(select.value);
    applyProfileVisibility(select.value);
  });
  $('mode-select').value = state.options.mode;
  $('mode-select').addEventListener('change', async () => {
    await window.hws.setMode($('mode-select').value);
    renderCommentary();
  });
}

function applyProfileVisibility(profileId) {
  const profile = state.config.windows.profiles[profileId];
  const enabled = new Set(profile.panels);
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    const isEnabled = enabled.has(panel.dataset.panel);
    const layout = profile.layout?.[panel.dataset.panel];
    panel.style.display = isEnabled ? 'flex' : 'none';
    if (layout) {
      panel.style.gridColumn = `${layout.column} / span ${layout.columnSpan || 1}`;
      panel.style.gridRow = `${layout.row} / span ${layout.rowSpan || 1}`;
    }
  });
  const maxColumn = Math.max(...Object.values(profile.layout || {}).map((item) => item.column + (item.columnSpan || 1) - 1), 1);
  const maxRow = Math.max(...Object.values(profile.layout || {}).map((item) => item.row + (item.rowSpan || 1) - 1), 1);
  $('panel-grid').style.gridTemplateColumns = `repeat(${maxColumn}, minmax(0, 1fr))`;
  $('panel-grid').style.gridTemplateRows = `repeat(${maxRow}, minmax(0, 1fr))`;
}

function renderStatus() {
  const status = state.runtime?.status || 'idle';
  $('status-text').textContent = status.toUpperCase();
  $('status-dot').className = `status-dot ${status === 'error' ? 'error' : status === 'running' ? 'live' : ''}`;
  const scenario = currentScenario();
  $('scenario-text').textContent = scenario ? `${scenario.label} · ${state.options.mode}` : 'Choose a scenario or run the complete configured sequence.';
  $('stage-text').textContent = state.stage ? state.stage.toUpperCase() : '—';
  document.querySelectorAll('.scenario-button').forEach((button) => button.classList.toggle('active', button.dataset.scenario === state.activeScenario));
}

function renderCommentary() {
  const scenario = currentScenario();
  const record = [...state.records].reverse().find((item) => item.scenario === state.activeScenario);
  const body = $('commentary-body');
  if (!scenario) {
    body.innerHTML = '<div><div class="kicker">READY TO SYNCHRONIZE</div><p class="hero">Choose a scenario, or run the configured sequence from one control room.</p><p class="copy">Every connector follows the same visible path: read the source, normalize the event, create a SHA-256 fingerprint, publish a proof, and check it through Hedera evidence.</p></div><div class="meta">The control room keeps presentation, runtime facts, proof state, and public evidence connected without opening unexpected browser windows.</div>';
    return;
  }
  const liveText = state.options.mode === 'live' ? 'The next proof is submitted to Hedera Testnet.' : 'Dry-run mode keeps the full flow visible without submitting a transaction.';
  const endText = record ? (record.hashMatch ? 'The recorded digest matches the public verification response.' : 'The record needs review: the public digest did not match.') : liveText;
  body.innerHTML = `<div><div class="kicker">CURRENT SCENARIO</div><p class="hero">${escapeHtml(scenario.label)}</p><p class="copy">${escapeHtml(scenario.description)}</p><p class="copy">${escapeHtml(endText)}</p></div><div class="meta">Source adapters can change. The proof path stays the same. The selected profile controls which views are visible.</div>`;
}

function renderDeveloper() {
  const mode = state.options?.mode || 'dry-run';
  $('developer-body').innerHTML = `<div class="kicker">LOCAL RUNTIME</div><p class="hero">One BAT file opens the room.</p><p class="copy">Profile: ${escapeHtml(state.options.profile)}<br>Network: Hedera ${escapeHtml(state.options.network)}<br>Mode: ${escapeHtml(mode)}</p><div class="meta">Add a connector through config/windows.json or point a custom panel at your own process. Secrets stay in .env.local.</div>`;
}

function renderProof() {
  const currentIndex = state.stage ? STAGES.indexOf(state.stage) : -1;
  $('proof-body').innerHTML = `<div class="flow">${STAGES.map((stage, index) => `<div class="flow-step ${index < currentIndex ? 'done' : ''} ${stage === state.stage ? 'active' : ''}"><span>${escapeHtml(stage)}</span><span>${index < currentIndex ? 'DONE' : stage === state.stage ? 'NOW' : 'WAITING'}</span></div>`).join('')}</div><div class="meta">HCS publication and Mirror Node checking are visible as separate stages. In live mode the connector stops with an explicit error if required Testnet values are missing.</div>`;
}

function renderActivity() {
  const rows = state.events.slice(-16).reverse().map((event) => {
    const detail = event.stage || event.label || event.error || event.record?.sequence || event.record?.hash || event.connectorId || '';
    return `<div class="activity-row"><strong>${escapeHtml(event.type)}</strong><span>${escapeHtml(detail)}</span></div>`;
  }).join('');
  const records = state.records.slice(-3).reverse().map((record) => `<div class="record"><strong>${escapeHtml(record.scenario)}</strong><span>${escapeHtml(record.mode)} · sequence ${escapeHtml(record.sequence || '—')} · hash match ${escapeHtml(record.hashMatch)}</span><code>${escapeHtml(record.hash)}</code></div>`).join('');
  $('activity-body').innerHTML = `${records}${rows || '<div class="meta">No events yet.</div>'}`;
}

function renderCustom() {
  const enabled = state.config.windows.connectors.filter((item) => item.enabled);
  $('custom-body').innerHTML = `<div class="kicker">EXTENSION POINT</div><p class="hero">${enabled.length} connectors loaded.</p><p class="copy">${enabled.map((item) => escapeHtml(item.label)).join('<br>')}</p><div class="meta">New connectors can be added without changing the window layout. The event bus exposes the same stage names to every panel.</div>`;
}

function updateEvidence(record) {
  if (!record) return;
  if (record.hashscanUrl) {
    $('hashscan-empty').classList.add('hidden');
    $('hashscan-view').src = record.hashscanUrl;
  }
  if (record.mirrorUrl) {
    $('mirror-empty').classList.add('hidden');
    $('mirror-view').src = record.mirrorUrl;
  }
}

function renderAll() {
  renderStatus();
  renderCommentary();
  renderDeveloper();
  renderProof();
  renderActivity();
  renderCustom();
}

async function runScenario(id) {
  state.activeScenario = id;
  renderAll();
  try { await window.hws.run(id); } catch (error) { state.runtime = { ...(state.runtime || {}), status: 'error' }; state.events.push({ type: 'run-failed', error: error.message }); renderAll(); }
}

function consume(event) {
  state.events.push(event);
  if (event.type === 'scenario-started') { state.activeScenario = event.scenario; state.scenario = event; state.runtime = { ...(state.runtime || {}), status: 'running' }; state.stage = null; }
  if (event.type === 'stage') { state.stage = event.stage; state.runtime = { ...(state.runtime || {}), status: 'running' }; }
  if (event.type === 'proof-record') { state.records.push(event.record); state.runtime = { ...(state.runtime || {}), status: 'complete' }; updateEvidence(event.record); }
  if (event.type === 'scenario-complete') { state.runtime = { ...(state.runtime || {}), status: 'complete' }; }
  if (event.type === 'run-failed') { state.runtime = { ...(state.runtime || {}), status: 'error' }; }
  if (event.type === 'run-stopped') { state.runtime = { ...(state.runtime || {}), status: 'stopped' }; }
  renderAll();
}

$('run-all').addEventListener('click', async () => {
  try { await window.hws.runAll(); } catch (error) { consume({ type: 'run-failed', error: error.message }); }
});
$('stop-run').addEventListener('click', () => window.hws.stop());

(async () => {
  const bootstrap = await window.hws.bootstrap();
  state.config = bootstrap.config;
  state.options = bootstrap.options;
  state.runtime = bootstrap.state;
  renderScenarios();
  renderProfiles();
  applyProfileVisibility(state.options.profile);
  renderAll();
  window.hws.onEvent(consume);
})();
