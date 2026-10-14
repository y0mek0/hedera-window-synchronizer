const NETWORKS = {
  testnet: 'https://hashscan.io/testnet',
  mainnet: 'https://hashscan.io/mainnet'
};

function base(network = 'testnet') {
  if (!NETWORKS[network]) throw new Error(`Unsupported HashScan network: ${network}`);
  return NETWORKS[network];
}

function encode(value) { return encodeURIComponent(String(value)); }
const transactionUrl = (id, network) => `${base(network)}/transaction/${encode(id)}`;
const accountUrl = (id, network) => `${base(network)}/account/${encode(id)}`;
const topicUrl = (id, network) => `${base(network)}/topic/${encode(id)}`;
const tokenUrl = (id, network) => `${base(network)}/token/${encode(id)}`;
const contractUrl = (id, network) => `${base(network)}/contract/${encode(id)}`;

module.exports = { base, transactionUrl, accountUrl, topicUrl, tokenUrl, contractUrl };
