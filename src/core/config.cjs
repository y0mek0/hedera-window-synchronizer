const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const ROOT = path.resolve(__dirname, '..', '..');

dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadConfig() {
  return {
    windows: readJson('config/windows.json'),
    scenarios: readJson('config/scenarios.json')
  };
}

function runtimeOptions() {
  return {
    mode: process.env.HWS_MODE || 'dry-run',
    profile: process.env.HWS_PROFILE || 'control-room',
    network: process.env.HEDERA_NETWORK || 'testnet',
    mirrorNode: process.env.HWS_MIRROR_NODE || 'https://testnet.mirrornode.hedera.com',
    hashscan: process.env.HWS_HASHSCAN || 'https://hashscan.io/testnet'
  };
}

function resolvePath(relativePath) {
  return path.join(ROOT, relativePath);
}

module.exports = { ROOT, loadConfig, runtimeOptions, resolvePath };
