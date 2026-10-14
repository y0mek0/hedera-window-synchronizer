const fs = require('node:fs');
const path = require('node:path');
const configPath = path.resolve(__dirname, '..', 'config', 'windows.json');
const scenariosPath = path.resolve(__dirname, '..', 'config', 'scenarios.json');
const windows = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
const requiredRoles = ['commentary', 'developer', 'proof', 'activity', 'hashscan', 'mirror', 'custom'];
if (windows.version !== 1) throw new Error('Unsupported windows config version');
if (!windows.profiles || !windows.profiles['control-room']) throw new Error('control-room profile is required');
const ids = new Set();
for (const item of windows.windows) {
  if (!item.id || ids.has(item.id)) throw new Error(`Duplicate or missing window id: ${item.id}`);
  ids.add(item.id);
  if (!['panel', 'window'].includes(item.mode || 'panel')) throw new Error(`Unsupported window mode: ${item.mode}`);
  if (!requiredRoles.includes(item.role)) throw new Error(`Unsupported role: ${item.role}`);
}
for (const profile of Object.values(windows.profiles)) {
  if (!Array.isArray(profile.panels) || !profile.panels.length) throw new Error('Every profile needs panels');
  if (!profile.layout) throw new Error('Every profile needs a layout map');
  for (const id of profile.panels) {
    if (!ids.has(id)) throw new Error(`Profile references unknown panel: ${id}`);
    const slot = profile.layout[id];
    if (!slot || slot.column < 1 || slot.row < 1) throw new Error(`Profile has invalid layout slot: ${id}`);
  }
}
const scenarioIds = new Set();
for (const scenario of scenarios.scenarios) {
  if (!scenario.id || scenarioIds.has(scenario.id)) throw new Error(`Duplicate or missing scenario id: ${scenario.id}`);
  scenarioIds.add(scenario.id);
  if (!Array.isArray(scenario.stages) || scenario.stages.join('|') !== 'read|normalize|hash|write to HCS|check') throw new Error(`Invalid stages: ${scenario.id}`);
}
console.log(`config ok: ${windows.windows.length} panels, ${Object.keys(windows.profiles).length} profiles, ${scenarios.scenarios.length} scenarios`);
