const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, '.env.local') });
const checks = [
  ['Node', process.version],
  ['mode', process.env.HWS_MODE || 'dry-run'],
  ['network', process.env.HEDERA_NETWORK || 'testnet'],
  ['HEDERA_ACCOUNT_ID', process.env.HEDERA_ACCOUNT_ID ? 'set' : 'missing'],
  ['HEDERA_PRIVATE_KEY', process.env.HEDERA_PRIVATE_KEY ? 'set' : 'missing'],
  ['HEDERA_TOPIC_ID', process.env.HEDERA_TOPIC_ID ? 'set' : 'missing']
];
console.log(checks.map(([key, value]) => `${key}: ${value}`).join('\n'));
if (!fs.existsSync(path.join(root, 'config', 'windows.json'))) process.exitCode = 1;
if ((process.env.HWS_MODE || 'dry-run') === 'live' && (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY || !process.env.HEDERA_TOPIC_ID)) {
  console.error('live mode requires Hedera values in .env.local');
  process.exitCode = 1;
}
