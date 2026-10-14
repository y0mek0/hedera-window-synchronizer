const crypto = require('node:crypto');

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { headers: { 'user-agent': 'hedera-window-synchronizer/0.1.0', accept: 'application/json' }, ...options });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function readPublicSource({ bus, connectorId, scenario, options }) {
  bus.publish('stage', { scenario: scenario.id, stage: 'read', connectorId });
  let source;
  if (connectorId === 'devops-release') {
    const repo = process.env.HWS_GITHUB_REPO || 'hashgraph/hedera-services';
    const [release, issues] = await Promise.all([
      fetchJson(`https://api.github.com/repos/${repo}/releases/latest`),
      fetchJson(`https://api.github.com/repos/${repo}/issues?state=open&per_page=5`)
    ]);
    source = { provider: 'github', repo, release: { tag: release.tag_name, name: release.name, publishedAt: release.published_at }, openIssues: issues.map((item) => ({ number: item.number, title: item.title })) };
  } else if (connectorId === 'web3-market') {
    const price = await fetchJson('https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd');
    source = { provider: 'coingecko', asset: 'HBAR', priceUsd: price['hedera-hashgraph']?.usd ?? null, observedAt: new Date().toISOString() };
  } else if (connectorId === 'document') {
    source = { provider: 'local-demo-document', document: process.env.HWS_DOCUMENT_NAME || 'demo-document.txt', content: process.env.HWS_DOCUMENT_CONTENT || 'Hedera Window Synchronizer document proof' };
  } else if (connectorId === 'payment') {
    source = { provider: 'hedera-payment-intent', network: options.network, intent: 'testnet demo payment proof', amount: process.env.HWS_PAYMENT_AMOUNT || '1 hbar' };
  } else {
    source = { provider: 'manual', connectorId, observedAt: new Date().toISOString() };
  }
  bus.publish('source-read', { scenario: scenario.id, connectorId, source });
  return source;
}

function normalize(source, scenario) {
  return { schema: 'hws-proof-v1', scenario: scenario.id, source, normalizedAt: new Date().toISOString() };
}

function hashNormalized(normalized) {
  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

module.exports = { fetchJson, readPublicSource, normalize, hashNormalized };
