// 3D render check of the web build (screenshots for visual review):
//   node web/build.js && BACKUP=<backup.json from the Data dialog> node test/shot3d_web.js <outPrefix>
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..', 'dist-web');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.png': 'image/png', '.ttf': 'font/ttf' };
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]).replace(/^\/m/, ''); if (u.endsWith('/')) u += 'index.html'; const f = path.join(ROOT, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r));
  const B = `http://127.0.0.1:${srv.address().port}/m/`;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 1, locale: 'tr-TR' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(B); await p.waitForSelector('#btn-new');
  await p.click('#btn-datadir'); await p.waitForSelector('.modal');
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('.modal-foot >> text=Yedeği geri yükle…')]);
  await fc.setFiles(process.env.BACKUP || path.join(process.env.SHOTS || '/tmp', 'w-backup.json'));
  await p.waitForFunction(() => document.querySelectorAll('#projects > *').length > 0);
  await p.evaluate(() => asm.listProjects().then((l) => asm.startSession({ projectId: l[0].id, serial: 'R1', operator: 'X' })));
  await p.waitForURL(/viewer/); await p.waitForFunction(() => typeof V3D !== 'undefined' && document.getElementById('bombody').childElementCount > 0);
  if (process.env.DARK) await p.evaluate(() => { document.getElementById('darkmodeCheckbox').click(); });
  await p.click('#d3-btn'); await p.waitForFunction(() => V3D.state.ready, null, { timeout: 60000 });
  await p.waitForTimeout(1500);
  const out = process.argv[2] || '/tmp/r3d';
  const c = await p.$('#asm3d');
  await c.screenshot({ path: out + '-iso.png' });
  await p.click('text=Üstten'); await p.waitForTimeout(1200); await c.screenshot({ path: out + '-top.png' });
  await p.click('text=İzo'); await p.waitForTimeout(800);
  await p.evaluate(() => { const S = V3D.state; S.camera.position.lerp(S.controls.target, 0.6); S.controls.update(); });
  await p.waitForTimeout(800); await c.screenshot({ path: out + '-close.png' });
  console.log(await p.evaluate(() => { const S = V3D.state; let e = 0, segs = 0; S.scene.traverse((o) => { if (o.userData && o.userData.edges) { e++; segs += o.geometry.attributes.position.count / 2; } }); return { e, segs, skipped: S.edgesSkipped, parts: S.parts.length }; }));
  await p.selectOption('#asm3d-style', 'tech'); await p.waitForTimeout(900); await c.screenshot({ path: out + '-tech.png' });
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
