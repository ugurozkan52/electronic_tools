/* CircuitJS text → SPICE netlist / LTspice schematic (.asc) converters and a download helper.
   Shared by the Components and Filters pages (no other dependencies). */

/* ---- CircuitJS text → SPICE netlist (LTspice .cir) ----
   Nodes are the end points of the CircuitJS elements; wires merge them, grounds become node 0, the output marker becomes "out".
   Element conventions are the ones used by the SIM generators above (see the comment there). */
function cjsToSpice(text, title) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean), els = lines.map((l) => l.split(/\s+/));
  const key = (x, y) => x + ',' + y, parent = {};
  const find = (k) => { while (parent[k] !== undefined && parent[k] !== k) k = parent[k]; return k; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
  const touch = (k) => { if (parent[k] === undefined) parent[k] = k; };
  const grounds = new Set();
  for (const t of els) { if (t[0] === 'w') { touch(key(t[1], t[2])); touch(key(t[3], t[4])); union(key(t[1], t[2]), key(t[3], t[4])); } else if (t[0] === 'g') { touch(key(t[1], t[2])); grounds.add(key(t[1], t[2])); } }
  const names = {}; let nn = 0; const outs = [];
  for (const t of els) if (t[0] === 'O') outs.push(key(t[1], t[2]));
  const node = (x, y) => {
    const k = key(x, y); touch(k); const r = find(k);
    for (const g of grounds) if (find(g) === r) return '0';
    if (names[r] === undefined) { const oi = outs.findIndex((o) => find(o) === r); names[r] = oi >= 0 ? (oi ? 'out' + (oi + 1) : 'out') : 'N' + String(++nn).padStart(3, '0'); }
    return names[r];
  };
  const f = (v) => { const x = Number(v); return Number.isFinite(x) ? String(Number(x.toPrecision(6))) : v; };
  const out = ['* ' + title, '* Elektronik Araçlar – Components; CircuitJS devresinden üretildi / generated from the CircuitJS circuit'], models = {}, cnt = {};
  const id = (p) => p + (cnt[p] = (cnt[p] || 0) + 1);
  let analysis = null, dt = 1e-6, fmin = Infinity;
  const vt = 0.02585, isFor = (vf, n) => f(0.01 / Math.exp(vf / (n * vt)));
  for (const t of els) {
    const k = t[0];
    if (k === '$') { dt = Number(t[2]) || dt; continue; }
    if (k === 'w' || k === 'g' || k === 'O' || k === 'o') continue;
    const a = () => node(t[1], t[2]), b = () => node(t[3], t[4]);
    if (k === 'r') out.push(id('R') + ' ' + a() + ' ' + b() + ' ' + f(t[6]));
    else if (k === 'c') out.push(id('C') + ' ' + a() + ' ' + b() + ' ' + f(t[6]));
    else if (k === 'l') out.push(id('L') + ' ' + a() + ' ' + b() + ' ' + f(t[6]));
    else if (k === 'R') out.push(id('V') + ' ' + a() + ' 0 DC ' + f(t[8]));
    else if (k === 'i') out.push(id('I') + ' ' + a() + ' ' + b() + ' DC ' + f(t[6]));
    else if (k === 'd' || k === '162') { const vf = Number(t[6]) || 0.7, m = (k === '162' ? 'DLED' : 'DF') + f(vf).replace('.', 'p'); models[m] = '.model ' + m + ' D(Is=' + isFor(vf, 1.5) + ' N=1.5)'; out.push(id('D') + ' ' + a() + ' ' + b() + ' ' + m); }
    else if (k === 'z') { const vz = Number(t[7]) || 5.1, m = 'DZ' + f(vz).replace('.', 'p'); models[m] = '.model ' + m + ' D(Is=1e-14 N=1.2 BV=' + f(vz) + ' Ibv=5m)'; out.push(id('D') + ' ' + a() + ' ' + b() + ' ' + m); }
    else if (k === 't') { // base at p1; NPN collector above p2, PNP emitter above p2
      const pnp = Number(t[6]) < 0, x = Number(t[3]), y = Number(t[4]), top = node(x, y - 16), bot = node(x, y + 16), m = pnp ? 'QP' : 'QN';
      models[m] = '.model ' + m + ' ' + (pnp ? 'PNP' : 'NPN') + '(BF=' + f(t[9] || 100) + ' IS=1e-14)';
      out.push(id('Q') + ' ' + (pnp ? bot : top) + ' ' + a() + ' ' + (pnp ? top : bot) + ' ' + m);
    } else if (k === 'f') { // gate at p1; N: drain above p2; P (flag 1): source above; flag 8 flips
      const fl = Number(t[5]), p = !!(fl & 1), flip = !!(fl & 8), x = Number(t[3]), y = Number(t[4]), top = node(x, y - 16), bot = node(x, y + 16);
      let drain = p ? bot : top, src = p ? top : bot; if (flip) { const q = drain; drain = src; src = q; }
      const m = (p ? 'MP' : 'MN') + f(t[6]).replace('.', 'p').replace('-', 'm'); models[m] = '.model ' + m + ' ' + (p ? 'PMOS' : 'NMOS') + '(VTO=' + f(p ? -Math.abs(Number(t[6])) : t[6]) + ' KP=' + f(t[7] || 0.02) + ' LAMBDA=0.01)';
      out.push(id('M') + ' ' + drain + ' ' + a() + ' ' + src + ' ' + src + ' ' + m);
    } else if (k === 'a') { // ideal op-amp with rail clamps: behavioural source
      const x = Number(t[1]), y = Number(t[2]), plusTop = Number(t[5]) & 1, np = node(x, plusTop ? y - 16 : y + 16), nm = node(x, plusTop ? y + 16 : y - 16);
      out.push(id('B') + ' ' + b() + ' 0 V=limit(' + f(t[8] || 1e6) + '*(V(' + np + ')-V(' + nm + ')), ' + f(t[7] ?? -15) + ', ' + f(t[6] ?? 15) + ')');
    } else if (k === 'v') { // p2 is +; waveform 1 sine, 2 square, 3 triangle
      const wf = Number(t[6]), fr = Number(t[7]), amp = Number(t[8]), bias = Number(t[9]) || 0, duty = Number(t[11]) || 0.5, per = 1 / fr; fmin = Math.min(fmin, fr);
      let spec; if (wf === 1) spec = 'SIN(' + f(bias) + ' ' + f(amp) + ' ' + f(fr) + ')';
      else if (wf === 3) spec = 'PULSE(' + f(bias - amp) + ' ' + f(bias + amp) + ' 0 ' + f(per / 2) + ' ' + f(per / 2) + ' 1n ' + f(per) + ')';
      else spec = 'PULSE(' + f(bias - amp) + ' ' + f(bias + amp) + ' 0 ' + f(Math.min(10e-9, per / 1000)) + ' ' + f(Math.min(10e-9, per / 1000)) + ' ' + f(duty * per) + ' ' + f(per) + ')';
      out.push(id('V') + ' ' + b() + ' ' + a() + ' ' + spec); analysis = analysis || 'tran';
    } else if (k === '170') { // log sweep → AC analysis
      out.push(id('V') + ' ' + a() + ' 0 AC 1'); analysis = '.ac dec 100 ' + f(t[6]) + ' ' + f(t[7]);
    } else out.push('* ' + t.join(' ') + '  (çevrilmedi / not converted)');
  }
  for (const m in models) out.push(models[m]);
  if (analysis === 'tran') { const T = 5 / fmin; out.push('.tran 0 ' + f(T) + ' 0 ' + f(Math.min(dt * 4, T / 2000))); }
  else if (analysis) out.push(analysis);
  else out.push('.op');
  out.push('.end');
  return out.join('\n') + '\n';
}
function downloadText(name, text) {
  const blob = new Blob([text], { type: 'text/plain' }), url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

/* ---- CircuitJS text → LTspice schematic (.asc) ----
   The CircuitJS geometry is kept and scaled ×2 (both use a 16-unit grid), wires stay wires, every part becomes the stock
   LTspice symbol. Pin offsets are those of LTspice's lib/sym/*.asy at R0. Orientation: R90 (x,y)→(−y,x), R180 (−x,−y),
   R270 (y,−x), M180 (x,−y). The op-amp is an ideal behavioural source (bv) drawn inside a triangle, joined by net labels. */
const ASC_SYM = {   // [symbol, pin1 (R0), pin2 (R0), instance prefix]
  r: ['res', [16, 16], [16, 96], 'R'], c: ['cap', [16, 0], [16, 64], 'C'], l: ['ind', [16, 16], [16, 96], 'L'],
  d: ['diode', [16, 0], [16, 64], 'D'], 162: ['LED', [16, 0], [16, 64], 'D'], z: ['zener', [16, 0], [16, 64], 'D'],
  v: ['voltage', [0, 16], [0, 96], 'V'], i: ['current', [0, 0], [0, 80], 'I'], bv: ['bv', [0, 16], [0, 96], 'B'],
};
const ASC_ROT = { R0: ([x, y]) => [x, y], R90: ([x, y]) => [-y, x], R180: ([x, y]) => [-x, -y], R270: ([x, y]) => [y, -x], M180: ([x, y]) => [x, -y] };
function cjsToAsc(text, title) {
  const ascii = (t) => String(t).normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/µ/g, 'u').replace(/Ω/g, 'Ohm').replace(/[^\x20-\x7e]/g, '');
  const f = (v) => { const x = Number(v); return Number.isFinite(x) ? String(Number(x.toPrecision(6))) : v; };
  const els = text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split(/\s+/));
  const out = [], cnt = {}, models = {}, K = 2, P = (v) => Number(v) * K;
  const id = (p) => p + (cnt[p] = (cnt[p] || 0) + 1);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const seen = (x, y) => { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); };
  const wire = (a, b) => { if (a[0] === b[0] && a[1] === b[1]) return; out.push('WIRE ' + a[0] + ' ' + a[1] + ' ' + b[0] + ' ' + b[1]); seen(...a); seen(...b); };
  const flag = (p, name) => { out.push('FLAG ' + p[0] + ' ' + p[1] + ' ' + name); seen(...p); };
  const symbol = (sym, org, rot, name, value) => { out.push('SYMBOL ' + sym + ' ' + org[0] + ' ' + org[1] + ' ' + rot, 'SYMATTR InstName ' + name); if (value != null) out.push('SYMATTR Value ' + value); seen(...org); };
  // two-terminal part between A (pin1 side) and B, centred on the segment, joined to both ends with wires
  const two = (kind, A, B, value, name) => {
    const [sym, p1, p2, pre] = ASC_SYM[kind], dx = Math.sign(B[0] - A[0]), dy = Math.sign(B[1] - A[1]);
    const rot = dy > 0 ? 'R0' : dy < 0 ? 'R180' : dx < 0 ? 'R90' : 'R270', T = ASC_ROT[rot], q1 = T(p1), q2 = T(p2);
    const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], org = [M[0] - (q1[0] + q2[0]) / 2, M[1] - (q1[1] + q2[1]) / 2];
    const pin1 = [org[0] + q1[0], org[1] + q1[1]], pin2 = [org[0] + q2[0], org[1] + q2[1]];
    symbol(sym, org, rot, name || id(pre), value); wire(A, pin1); wire(pin2, B); return { pin1, pin2 };
  };
  const dirOf = (t) => { const dx = Math.sign(Number(t[3]) - Number(t[1])), dy = Math.sign(Number(t[4]) - Number(t[2])); return [dx, dy]; };
  const source = (t, value) => { // rail / sweep: + on the node, − on ground, laid out in the CircuitJS direction
    const A = [P(t[1]), P(t[2])], [dx, dy] = dirOf(t), B = [A[0] + dx * 80, A[1] + dy * 80];
    const r = two('v', A, B, value); flag(r.pin2, '0');
  };
  const par = {}, fnd = (q) => { while (par[q] !== undefined && par[q] !== q) q = par[q]; return q; }, key = (x, y) => x + ',' + y;
  for (const t of els) if (t[0] === 'w') { const a = fnd(key(t[1], t[2])), b = fnd(key(t[3], t[4])); if (a !== b) par[a] = b; }
  const gset = new Set(els.filter((t) => t[0] === 'g').map((t) => fnd(key(t[1], t[2]))));
  const onGnd = (x, y) => gset.has(fnd(key(x, y)));
  const outRoots = els.filter((t) => t[0] === 'O').map((t) => fnd(key(t[1], t[2])));   // op-amp labels on the output net are called out, out2…
  const outName = (x, y) => { const i = outRoots.indexOf(fnd(key(x, y))); return i < 0 ? null : i ? 'out' + (i + 1) : 'out'; };
  let opn = 0, outn = 0, dt = 1e-6;
  const vt = 0.02585, isFor = (vf, n) => f(0.01 / Math.exp(vf / (n * vt)));
  for (const t of els) {
    const k = t[0], A = () => [P(t[1]), P(t[2])], B = () => [P(t[3]), P(t[4])];
    if (k === '$') dt = Number(t[2]) || dt;
    else if (k === 'w') wire(A(), B());
    else if (k === 'g') flag(A(), '0');
    else if (k === 'O') flag(A(), outn++ ? 'out' + outn : 'out');
    else if (k === 'o') continue;
    else if (k === 'r' || k === 'c' || k === 'l') two(k, A(), B(), f(t[6]));
    else if (k === 'd' || k === '162') { const vf = Number(t[6]) || 0.7, m = (k === '162' ? 'DLED' : 'DF') + f(vf).replace('.', 'p'); models[m] = '.model ' + m + ' D(Is=' + isFor(vf, 1.5) + ' N=1.5)'; two(k, A(), B(), m); }
    else if (k === 'z') { const vz = Number(t[7]) || 5.1, m = 'DZ' + f(vz).replace('.', 'p'); models[m] = '.model ' + m + ' D(Is=1e-14 N=1.2 BV=' + f(vz) + ' Ibv=5m)'; two('z', A(), B(), m); }
    else if (k === 'i') two('i', A(), B(), f(t[6]));
    else if (k === 'R') source(t, f(t[8]));
    else if (k === '170') source(t, 'AC 1');
    else if (k === 'v') { // CircuitJS: point2 is +
      const wf = Number(t[6]), fr = Number(t[7]), amp = Number(t[8]), bias = Number(t[9]) || 0, duty = Number(t[11]) || 0.5, per = 1 / fr, edge = Math.min(10e-9, per / 1000);
      const spec = wf === 1 ? 'SIN(' + f(bias) + ' ' + f(amp) + ' ' + f(fr) + ')' : wf === 3 ? 'PULSE(' + f(bias - amp) + ' ' + f(bias + amp) + ' 0 ' + f(per / 2) + ' ' + f(per / 2) + ' 1n ' + f(per) + ')'
        : 'PULSE(' + f(bias - amp) + ' ' + f(bias + amp) + ' 0 ' + f(edge) + ' ' + f(edge) + ' ' + f(duty * per) + ' ' + f(per) + ')';
      two('v', B(), A(), spec);
    } else if (k === 't') { // base at point1; NPN collector above, PNP emitter above (LTspice pnp has C on top → mirrored)
      const pnp = Number(t[6]) < 0, X = P(t[3]), Y = P(t[4]), m = pnp ? 'QP' : 'QN';
      models[m] = '.model ' + m + ' ' + (pnp ? 'PNP' : 'NPN') + '(BF=' + f(t[9] || 100) + ' IS=1e-14)';
      if (!pnp) { symbol('npn', [X - 64, Y - 48], 'R0', id('Q'), m); } else symbol('pnp', [X - 64, Y + 48], 'M180', id('Q'), m);
      wire([X, Y - 32], [X, Y - 48]); wire([X, Y + 32], [X, Y + 48]); wire(A(), [X - 64, Y]);
    } else if (k === 'f') { // gate at point1; N: drain on top; P (flag 1): source on top; flag 8 swaps
      const fl = Number(t[5]), p = !!(fl & 1), flip = !!(fl & 8), X = P(t[3]), Y = P(t[4]), sTop = p !== flip;   // LTspice R0: drain on top
      const m = (p ? 'MP' : 'MN') + f(t[6]).replace('.', 'p').replace('-', 'm');
      models[m] = '.model ' + m + ' ' + (p ? 'PMOS' : 'NMOS') + '(VTO=' + f(p ? -Math.abs(Number(t[6])) : t[6]) + ' KP=' + f(t[7] || 0.02) + ' LAMBDA=0.01)';
      if (!sTop) symbol(p ? 'pmos' : 'nmos', [X - 48, Y - 48], 'R0', id('M'), m); else symbol(p ? 'pmos' : 'nmos', [X - 48, Y + 48], 'M180', id('M'), m);
      const gy = sTop ? Y - 32 : Y + 32;
      wire([X, Y - 32], [X, Y - 48]); wire([X, Y + 32], [X, Y + 48]); wire(A(), [X - 48, Y]); wire([X - 48, Y], [X - 48, gy]);
    } else if (k === 'a') { // ideal op-amp: labelled inputs/output, bv inside a drawn triangle
      const x1 = P(t[1]), y1 = P(t[2]), x2 = P(t[3]), plusTop = Number(t[5]) & 1, n = ++opn, cy1 = Number(t[2]), cx1 = Number(t[1]);
      const gp = onGnd(cx1, plusTop ? cy1 - 16 : cy1 + 16), gn = onGnd(cx1, plusTop ? cy1 + 16 : cy1 - 16), np = gp ? '0' : outName(cx1, plusTop ? cy1 - 16 : cy1 + 16) || 'op' + n + '_p', nm = gn ? '0' : outName(cx1, plusTop ? cy1 + 16 : cy1 - 16) || 'op' + n + '_n', no = outName(t[3], t[4]) || 'op' + n + '_o';
      if (!gp) flag([x1, plusTop ? y1 - 32 : y1 + 32], np); if (!gn) flag([x1, plusTop ? y1 + 32 : y1 - 32], nm); flag([x2, y1], no);
      out.push('LINE Normal ' + x1 + ' ' + (y1 - 64) + ' ' + x1 + ' ' + (y1 + 64), 'LINE Normal ' + x1 + ' ' + (y1 - 64) + ' ' + x2 + ' ' + y1, 'LINE Normal ' + x1 + ' ' + (y1 + 64) + ' ' + x2 + ' ' + y1);
      out.push('TEXT ' + (x1 + 6) + ' ' + (plusTop ? y1 - 32 : y1 + 32) + ' Left 2 ;+', 'TEXT ' + (x1 + 6) + ' ' + (plusTop ? y1 + 32 : y1 - 32) + ' Left 2 ;-');
      const cx = Math.round((x1 + x2) / 2 / 16) * 16 - 16, org = [cx, y1 - 56];
      symbol('bv', org, 'R0', id('B'), 'V=limit(' + f(t[8] || 1e6) + '*(V(' + np + ')-V(' + nm + ')),' + f(t[7] ?? -15) + ',' + f(t[6] ?? 15) + ')');
      flag([cx, y1 - 40], no); flag([cx, y1 + 40], '0');
    }
  }
  // directives: analysis from the SPICE converter (same rules), models collected above
  const dirs = cjsToSpice(text, title).split('\n').filter((l) => /^\.(tran|ac|op)\b/.test(l));
  const y0 = (isFinite(maxY) ? maxY : 0) + 64, x0 = isFinite(minX) ? minX : 0;
  out.push('TEXT ' + x0 + ' ' + y0 + ' Left 2 ;' + ascii(title) + ' - Elektronik Araclar / Components');
  [...dirs, ...Object.values(models)].forEach((d, i) => out.push('TEXT ' + x0 + ' ' + (y0 + 32 * (i + 1)) + ' Left 2 !' + d));
  return ['Version 4', 'SHEET 1 ' + Math.max(880, (isFinite(maxX) ? maxX : 0) + 200) + ' ' + Math.max(680, y0 + 64 + 32 * dirs.length), ...out].join('\r\n') + '\r\n';
}
