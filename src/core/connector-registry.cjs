const { runDryRun } = require('../connectors/dry-run.cjs');
const { readPublicSource } = require('../connectors/public-source.cjs');
const { submitHcsProof } = require('../connectors/hcs-proof.cjs');
const native = require('../connectors/hedera-native.cjs');
const mirror = require('../connectors/mirror-node.cjs');
const hashscan = require('../connectors/hashscan.cjs');
const evm = require('../connectors/evm-jsonrpc.cjs');

function createConnectorRegistry({ bus, options }) {
  return {
    connections: { native, mirror, hashscan, evm },
    async run(connectorId, scenario) {
      const connector = scenario.connector;
      if (options.mode === 'dry-run') return runDryRun({ bus, connectorId, scenario });
      if (connector === 'hcs-proof' || connector === 'devops-release' || connector === 'web3-market' || connector === 'document' || connector === 'payment') {
        const source = await readPublicSource({ bus, connectorId, scenario, options });
        return submitHcsProof({ bus, connectorId, scenario, source, options });
      }
      throw new Error(`Unknown connector: ${connector}`);
    }
  };
}

module.exports = { createConnectorRegistry };
