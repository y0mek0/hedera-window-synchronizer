function makeBaseUrl(value) {
  const url = new URL(value || 'https://testnet.mirrornode.hedera.com');
  if (url.protocol !== 'https:' || !['testnet.mirrornode.hedera.com', 'mainnet.mirrornode.hedera.com'].includes(url.hostname)) throw new Error('Mirror Node URL is not allowlisted');
  return url.toString().replace(/\/$/, '');
}

async function mirrorGet(pathname, baseUrl = process.env.HWS_MIRROR_NODE) {
  const url = `${makeBaseUrl(baseUrl)}${pathname}`;
  const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'hedera-window-synchronizer/0.1.0' } });
  if (!response.ok) throw new Error(`Mirror Node ${response.status}: ${pathname}`);
  return response.json();
}

const getAccount = (accountId, baseUrl) => mirrorGet(`/api/v1/accounts/${encodeURIComponent(accountId)}`, baseUrl);
const getTransaction = (transactionId, baseUrl) => mirrorGet(`/api/v1/transactions/${encodeURIComponent(transactionId)}`, baseUrl);
const getTopicMessage = (topicId, sequence, baseUrl) => mirrorGet(`/api/v1/topics/${encodeURIComponent(topicId)}/messages/${encodeURIComponent(sequence)}`, baseUrl);

module.exports = { makeBaseUrl, mirrorGet, getAccount, getTransaction, getTopicMessage };
