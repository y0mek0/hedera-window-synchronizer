const { Client, PrivateKey, TopicId, TopicMessageSubmitTransaction, TransactionId } = require('@hashgraph/sdk');
const { normalize, hashNormalized } = require('./public-source.cjs');

function parsePrivateKey(value) {
  if (!value) throw new Error('HEDERA_PRIVATE_KEY is missing');
  if (value.startsWith('0x')) return PrivateKey.fromStringECDSA(value);
  try { return PrivateKey.fromStringDer(value); } catch { return PrivateKey.fromString(value); }
}

async function fetchMirrorProof(url, expectedHash) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const payload = await response.json();
      const decoded = payload.message ? Buffer.from(payload.message, 'base64').toString('utf8') : '';
      if (decoded.includes(expectedHash)) return { payload, hashMatch: true };
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  return { payload: null, hashMatch: false };
}

async function submitHcsProof({ bus, connectorId, scenario, source, options }) {
  bus.publish('stage', { scenario: scenario.id, stage: 'normalize', connectorId });
  const normalized = normalize(source, scenario);
  bus.publish('normalized', { scenario: scenario.id, connectorId, normalized });
  bus.publish('stage', { scenario: scenario.id, stage: 'hash', connectorId });
  const hash = hashNormalized(normalized);
  bus.publish('hashed', { scenario: scenario.id, connectorId, hash });
  if (options.network !== 'testnet') throw new Error('Only Hedera Testnet is enabled in this release');
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY || !process.env.HEDERA_TOPIC_ID) {
    throw new Error('Live mode requires HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, and HEDERA_TOPIC_ID in .env.local');
  }
  const client = Client.forTestnet().setOperator(process.env.HEDERA_ACCOUNT_ID, parsePrivateKey(process.env.HEDERA_PRIVATE_KEY));
  try {
    const message = JSON.stringify({ schema: 'hws-proof-v1', scenario: scenario.id, connectorId, hash, sourceSummary: source, recordedAt: new Date().toISOString() });
    bus.publish('stage', { scenario: scenario.id, stage: 'write to HCS', connectorId });
    const response = await new TopicMessageSubmitTransaction().setTopicId(TopicId.fromString(process.env.HEDERA_TOPIC_ID)).setMessage(message).setTransactionId(TransactionId.generate(process.env.HEDERA_ACCOUNT_ID)).execute(client);
    const receipt = await response.getReceipt(client);
    const sequence = receipt.topicSequenceNumber?.toString();
    const topicId = process.env.HEDERA_TOPIC_ID;
    const transactionId = response.transactionId.toString();
    const mirrorUrl = `${options.mirrorNode}/api/v1/topics/${topicId}/messages/${sequence}`;
    const hashscanUrl = `${options.hashscan}/transaction/${transactionId}`;
    bus.publish('stage', { scenario: scenario.id, stage: 'check', connectorId });
    const mirrorResult = await fetchMirrorProof(mirrorUrl, hash);
    const hashMatch = mirrorResult.hashMatch;
    const record = { mode: 'live', scenario: scenario.id, connectorId, source, normalized, hash, sequence, transactionId, mirrorUrl, hashscanUrl, hashMatch };
    bus.publish('proof-record', { record });
    return record;
  } finally {
    client.close();
  }
}

module.exports = { submitHcsProof };
