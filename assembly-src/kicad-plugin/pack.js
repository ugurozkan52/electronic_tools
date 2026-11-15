#!/usr/bin/env node
// Packs the KiCad plugin as a KiCad Plugin and Content Manager (PCM) zip, with the desktop app inside:
//   metadata.json            PCM metadata (identifier, version, KiCad ≥ 8)
//   plugins/                 montaj_kicad/*.py + icons (installed by KiCad to 3rdparty/plugins/<identifier>/)
//   plugins/app/             the packaged desktop app (electron-builder win-unpacked), found by exporter.find_app()
// Install in KiCad: Plugin and Content Manager → "Install from File…".
// Usage: node kicad-plugin/pack.js <win-unpacked dir> <out.zip>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');

const [appDir, outZip] = process.argv.slice(2).map((p) => p && path.resolve(p));
if (!appDir || !outZip) { console.error('usage: node kicad-plugin/pack.js <win-unpacked dir> <out.zip>'); process.exit(2); }
if (!fs.existsSync(appDir) || !fs.readdirSync(appDir).some((f) => /montaj.*\.exe$/i.test(f))) { console.error('app not found in ' + appDir); process.exit(1); }

const root = path.join(__dirname, '..'), pkg = require(path.join(root, 'package.json'));
const src = path.join(__dirname, 'montaj_kicad');
const pyVer = (fs.readFileSync(path.join(src, 'exporter.py'), 'utf8').match(/^VERSION = "([^"]+)"/m) || [])[1];
if (pyVer !== pkg.version) { console.error('version mismatch: package.json ' + pkg.version + ' / exporter.py ' + pyVer); process.exit(1); }

const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'montaj-kicad-'));
try {
  const plugins = path.join(stage, 'plugins');
  fs.mkdirSync(plugins);
  for (const f of fs.readdirSync(src)) {
    if (f === '__pycache__' || f === 'montaj_kicad.json' || f.endsWith('.pyc')) continue;   // no caches, no local config
    fs.copyFileSync(path.join(src, f), path.join(plugins, f));
  }
  fs.cpSync(appDir, path.join(plugins, 'app'), { recursive: true });
  const meta = {
    $schema: 'https://go.kicad.org/pcm/schemas/v1',
    name: 'Montaj Görüntüleyici',
    description: 'IPC-2581 + BOM + STEP export and assembly / hardware test viewer',
    description_full: 'Exports the board as IPC-2581, BOM and STEP with kicad-cli and opens it in Montaj Görüntüleyici: '
      + 'interactive assembly (pick and place) tracking and step-by-step hardware test procedure. Windows x64; the desktop app is included.',
    identifier: 'com.anova.montajgoruntuleyici',
    type: 'plugin',
    author: { name: pkg.author || 'Montaj Görüntüleyici' },
    license: pkg.license || 'MIT',
    resources: {},
    versions: [{ version: pkg.version, status: 'stable', kicad_version: '8.0', platforms: ['windows'] }],
  };
  fs.writeFileSync(path.join(stage, 'metadata.json'), JSON.stringify(meta, null, 2) + '\n');
  fs.mkdirSync(path.dirname(outZip), { recursive: true });
  if (fs.existsSync(outZip)) fs.unlinkSync(outZip);
  const z7 = require('7zip-bin').path7za;   // ships with electron-builder
  execFileSync(z7, ['a', '-tzip', '-mx=7', '-mcu=on', outZip, '.' + path.sep + '*'], { cwd: stage, stdio: ['ignore', 'ignore', 'inherit'] });
  console.log('KiCad plugin package: ' + outZip + ' (' + (fs.statSync(outZip).size / 1048576).toFixed(1) + ' MB)');
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
