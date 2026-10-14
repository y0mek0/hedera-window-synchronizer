function makeRpcUrl(value) {
  const url = new URL(value || process.env.HWS_EVM_RPC_URL || 'https://testnet.hashio.io/api');
  if (url.protocol !== 'https:' || !['testnet.hashio.io', 'mainnet.hashio.io'].includes(url.hostname)) throw new Error('EVM RPC URL is not allowlisted');
  return url.toString();
}

async function rpcCall(method, params = [], baseUrl) {
  const response = await fetch(makeRpcUrl(baseUrl), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }) });
  if (!response.ok) throw new Error(`EVM RPC ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(`EVM RPC ${payload.error.code}: ${payload.error.message}`);
  return payload.result;
}

const getChainId = (baseUrl) => rpcCall('eth_chainId', [], baseUrl);
const getBlockNumber = (baseUrl) => rpcCall('eth_blockNumber', [], baseUrl);
const getBalance = (address, tag = 'latest', baseUrl) => rpcCall('eth_getBalance', [address, tag], baseUrl);

module.exports = { makeRpcUrl, rpcCall, getChainId, getBlockNumber, getBalance };
