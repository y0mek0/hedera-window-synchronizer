const assert = require('node:assert/strict');
const { transactionUrl, topicUrl, accountUrl, tokenUrl, contractUrl } = require('../src/connectors/hashscan.cjs');
const { makeBaseUrl } = require('../src/connectors/mirror-node.cjs');
const { makeRpcUrl } = require('../src/connectors/evm-jsonrpc.cjs');
const { createConnectorRegistry } = require('../src/core/connector-registry.cjs');

assert.equal(transactionUrl('0.0.2@1.2', 'testnet'), 'https://hashscan.io/testnet/transaction/0.0.2%401.2');
assert.equal(topicUrl('0.0.3', 'testnet'), 'https://hashscan.io/testnet/topic/0.0.3');
assert.equal(accountUrl('0.0.4', 'testnet'), 'https://hashscan.io/testnet/account/0.0.4');
assert.equal(tokenUrl('0.0.5', 'testnet'), 'https://hashscan.io/testnet/token/0.0.5');
assert.equal(contractUrl('0.0.6', 'testnet'), 'https://hashscan.io/testnet/contract/0.0.6');
assert.equal(makeBaseUrl('https://testnet.mirrornode.hedera.com'), 'https://testnet.mirrornode.hedera.com');
assert.equal(makeRpcUrl('https://testnet.hashio.io/api'), 'https://testnet.hashio.io/api');
assert.throws(() => makeBaseUrl('https://example.com'));
assert.throws(() => makeRpcUrl('https://example.com'));
const registry = createConnectorRegistry({ bus: { publish() {} }, options: { mode: 'dry-run' } });
assert.deepEqual(Object.keys(registry.connections).sort(), ['evm', 'hashscan', 'mirror', 'native']);
console.log('connector checks ok: HashScan, Mirror Node, EVM allowlists, registry capabilities');
