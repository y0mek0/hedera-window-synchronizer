const crypto = require('node:crypto');

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runDryRun({ bus, connectorId, scenario }) {
  const source = {
    connectorId,
    scenario: scenario.id,
    observedValue: 'deterministic local preview',
    generatedAt: new Date().toISOString()
  };
  const normalized = { type: 'proof-event', scenario: scenario.id, source };
  const hash = digest(normalized);
  const record = {
    mode: 'dry-run',
    scenario: scenario.id,
    connectorId,
    source,
    normalized,
    hash,
    sequence: `preview-${Date.now()}`,
    transactionId: null,
    mirrorUrl: null,
    hashscanUrl: null,
    hashMatch: true
  };
  for (const stage of scenario.stages) {
    bus.publish('stage', { scenario: scenario.id, stage, connectorId });
    await wait(240);
  }
  bus.publish('proof-record', { record });
  return record;
}

module.exports = { runDryRun };
