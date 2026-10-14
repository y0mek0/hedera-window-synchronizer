const assert = require('node:assert/strict');
const { loadConfig, runtimeOptions } = require('../src/core/config.cjs');
const { panelGrid, safeBounds } = require('../src/core/geometry.cjs');
const { SynchronizerBus } = require('../src/core/event-bus.cjs');
const { runDryRun } = require('../src/connectors/dry-run.cjs');

(async () => {
  const config = loadConfig();
  assert.equal(config.windows.windows.length, 7);
  assert.equal(config.scenarios.scenarios.length, 4);
  assert.deepEqual(panelGrid({}, config.windows.profiles['control-room'].panels), { columns: 4, rows: 2 });
  assert.deepEqual(safeBounds({ x: -50, y: -50, width: 5000, height: 5000 }, { x: 0, y: 0, width: 1920, height: 1080 }), { x: 0, y: 0, width: 1920, height: 1080 });
  const events = [];
  const bus = new SynchronizerBus();
  bus.on('event', (event) => events.push(event));
  const record = await runDryRun({ bus, connectorId: 'web3-market', scenario: config.scenarios.scenarios[1] });
  assert.equal(record.mode, 'dry-run');
  assert.equal(record.hashMatch, true);
  assert.equal(events.filter((event) => event.type === 'stage').length, 5);
  assert.equal(events.at(-1).type, 'proof-record');
  console.log('smoke ok: config, geometry, event bus, dry-run proof pipeline');
})().catch((error) => { console.error(error); process.exitCode = 1; });
