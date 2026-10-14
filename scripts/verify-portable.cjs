const fs = require('node:fs');
const path = require('node:path');

const release = path.join(process.cwd(), 'release');
const rootExecutables = fs.existsSync(release) ? fs.readdirSync(release).filter((name) => name.toLowerCase().endsWith('.exe')) : [];
const exe = rootExecutables.length ? path.join(release, rootExecutables[0]) : null;
const unpackedExe = path.join(release, 'win-unpacked', 'Hedera Window Synchronizer.exe');
if (!fs.existsSync(release)) throw new Error('release directory is missing; run npm run package:portable first');
if ((!exe || !fs.existsSync(exe)) && !fs.existsSync(unpackedExe)) throw new Error('portable executable is missing');
const forbidden = [];
for (const name of ['.env', '.env.local']) {
  if (fs.existsSync(path.join(release, name))) forbidden.push(name);
}
if (forbidden.length) throw new Error(`secret files included in release: ${forbidden.join(', ')}`);
const target = exe && fs.existsSync(exe) ? exe : unpackedExe;
const stat = fs.statSync(target);
if (stat.size < 1024 * 1024) throw new Error(`executable is unexpectedly small: ${stat.size} bytes`);
console.log(`portable package ok: ${target} (${stat.size} bytes), no local env files`);
