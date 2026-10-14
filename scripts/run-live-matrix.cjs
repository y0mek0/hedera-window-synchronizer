const { loadConfig, runtimeOptions } = require('../src/core/config.cjs');
const { SynchronizerBus } = require('../src/core/event-bus.cjs');
const { createConnectorRegistry } = require('../src/core/connector-registry.cjs');

async function main() {
  const config = loadConfig();
  const options = { ...runtimeOptions(), mode: 'live', network: 'testnet' };
  const bus = new SynchronizerBus();
  const registry = createConnectorRegistry({ bus, options });
  const results = [];
  for (const scenario of config.scenarios.scenarios) {
    process.stdout.write(`running ${scenario.id}...\n`);
    const record = await registry.run(scenario.id, scenario);
    results.push({ scenario: record.scenario, sequence: record.sequence, transactionId: record.transactionId, hashMatch: record.hashMatch, mirrorUrl: record.mirrorUrl, hashscanUrl: record.hashscanUrl });
    process.stdout.write(`${JSON.stringify(results.at(-1))}\n`);
  }
  if (results.length !== config.scenarios.scenarios.length || results.some((item) => !item.hashMatch || !item.transactionId || !item.sequence)) process.exitCode = 1;
  process.stdout.write(`live matrix complete: ${results.filter((item) => item.hashMatch).length}/${results.length} verified\n`);
}

main().catch((error) => { console.error(`live matrix failed: ${error.message}`); process.exitCode = 1; });
