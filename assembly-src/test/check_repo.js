'use strict';
// Repository consistency checks that need no test data and no Electron:
//   node test/check_repo.js
// 1. window.asm API parity: every preload.js method exists in web/backend.js, and every IPC
//    channel it uses has a handler in main.js (the three places must stay in step).
// 2. version parity: package.json "version" == kicad-plugin exporter.py VERSION.
// 3. every JS file under src/core, src/main, src/renderer (own code) and web/ parses.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

// --- 1. API parity
const preload = read('src', 'main', 'preload.js');
const main = read('src', 'main', 'main.js');
const backend = read('web', 'backend.js');
const preloadBody = preload.slice(preload.indexOf('exposeInMainWorld'));
const methods = [...preloadBody.matchAll(/^ {2}(\w+): /gm)].map((m) => m[1]);
const apiStart = backend.indexOf('const api = {');
const apiBody = backend.slice(apiStart, backend.indexOf('\n};', apiStart));
const backendKeys = new Set([...apiBody.matchAll(/^ {2}(\w+)[:,(]/gm)].map((m) => m[1]));
ok(methods.length > 20, `preload methods found (${methods.length})`);
const missing = methods.filter((m) => !backendKeys.has(m));
ok(!missing.length, 'web/backend.js implements every preload method' + (missing.length ? ' — missing: ' + missing.join(', ') : ''));
const channels = [...preloadBody.matchAll(/ipcRenderer\.(?:invoke|send|sendSync)\('([^']+)'/g)].map((m) => m[1]);
const noHandler = channels.filter((c) => !new RegExp(`ipcMain\\.(?:handle|on)\\(\\s*'${c.replace(/[:/]/g, '\\$&')}'`).test(main));
ok(!noHandler.length, 'main.js handles every preload channel' + (noHandler.length ? ' — missing: ' + noHandler.join(', ') : ''));

// --- 2. version parity
const pkgVer = JSON.parse(read('package.json')).version;
const py = read('kicad-plugin', 'montaj_kicad', 'exporter.py');
const pyVer = (py.match(/^VERSION\s*=\s*"([^"]+)"/m) || [])[1];
ok(pkgVer === pyVer, `version parity: package.json ${pkgVer} / exporter.py ${pyVer}`);

// --- 3. syntax
const skip = new Set(['lib', 'ibom', 'node_modules', 'fonts']);
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(path.join(d, e.name)); }
    else if (e.name.endsWith('.js')) files.push(path.join(d, e.name));
  }
})(path.join(ROOT, 'src'));
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) { if (e.name !== 'shims') walk(path.join(d, e.name)); } else if (e.name.endsWith('.js')) files.push(path.join(d, e.name)); } })(path.join(ROOT, 'web'));
const bad = [];
for (const f of files) {
  try { new vm.Script(fs.readFileSync(f, 'utf8').replace(/^#!.*/, ''), { filename: f }); } catch (e) { bad.push(path.relative(ROOT, f) + ': ' + e.message); }
}
ok(!bad.length, `${files.length} JS files parse` + (bad.length ? '\n  ' + bad.join('\n  ') : ''));

process.exit(fails ? 1 : 0);
