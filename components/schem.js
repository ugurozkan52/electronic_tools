/* Schematics for the calculator cards. SCH_MAP['<component>.<calc id>'] = (G, items) => <svg>.
   G reads the calculator inputs, items are its computed results ([big, label, cls] rows), so every value in the drawing follows the form. */
function newSch(w, h) {
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `-60 0 ${w + 140} ${h}`); svg.setAttribute('class', 'sch'); svg.setAttribute('role', 'img'); svg.style.maxWidth = Math.round((w + 140) * 1.5) + 'px';
  const el = (tag, a, txt, parent) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; (parent || svg).appendChild(e); return e; };
  const st = { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const b = {
    svg,
    wire(...p) { el('polyline', Object.assign({ points: p.map((q) => q.join(',')).join(' ') }, st)); },
    dot(x, y) { el('circle', { cx: x, cy: y, r: 3.4, fill: 'currentColor' }); },
    text(x, y, t, anchor, cls) { if (t === '' || t == null) return; el('text', { x, y, 'text-anchor': anchor || 'middle', class: cls || '' }, t); },
    // terminal: side 'l' / 'r' put name (+ value) beside it, no side puts them above
    term(x, y, name, side, val) {
      el('circle', { cx: x, cy: y, r: 3.8, fill: 'var(--card)', stroke: 'currentColor', 'stroke-width': 1.8 });
      if (side === 'l') { b.text(x - 9, val ? y - 1 : y + 4, name, 'end', 'tm'); b.text(x - 9, y + 12, val, 'end', 'vl'); }
      else if (side === 'r') { b.text(x + 9, val ? y - 1 : y + 4, name, 'start', 'tm'); b.text(x + 9, y + 12, val, 'start', 'vl'); }
      else { b.text(x, val ? y - 20 : y - 9, name, 'middle', 'tm'); b.text(x, y - 8, val, 'middle', 'vl'); }
    },
    gnd(x, y) { b.wire([x, y], [x, y + 7]); b.wire([x - 12, y + 7], [x + 12, y + 7]); b.wire([x - 7.5, y + 12], [x + 7.5, y + 12]); b.wire([x - 3, y + 17], [x + 3, y + 17]); },
    // two-terminal part, 60 long incl. leads; rot 0 = horizontal (left→right), 90 = vertical (top→bottom), -90 = vertical (bottom→top)
    part(kind, x, y, rot, name, value, left) {
      const g = el('g', { transform: `translate(${x},${y})${rot ? ` rotate(${rot})` : ''}` }), p = (d, ex) => el('path', Object.assign({ d }, st, ex || {}), null, g);
      if (kind === 'R') p('M-30 0H-20L-16 -7L-8 7L0 -7L8 7L16 -7L20 0H30');
      else if (kind === 'C') { p('M-30 0H-4M4 0H30'); p('M-4 -11V11M4 -11V11', { 'stroke-width': 2.6 }); }
      else if (kind === 'L') p('M-30 0H-20A5 5 0 0 1 -10 0A5 5 0 0 1 0 0A5 5 0 0 1 10 0A5 5 0 0 1 20 0H30');
      else if (kind === 'S') p('M-30 0H-12M12 0H30M-12 0L10 -13');
      else if (kind === 'D' || kind === 'Z' || kind === 'LED') {
        p('M-30 0H-10M10 0H30'); p('M-10 -9V9L10 0Z'); p('M10 -9V9');
        if (kind === 'Z') p('M10 -9L14 -12M10 9L6 12');
        if (kind === 'LED') { p('M-3 -12L6 -22M3 -12L12 -22'); p('M6 -22L2 -21M6 -22L5 -18M12 -22L8 -21M12 -22L11 -18'); }
      } else if (kind === 'TVS') { p('M-30 0H-14M14 0H30'); p('M-14 -8V8L-1 0Z'); p('M14 -8V8L1 0Z'); p('M-1 -9V9M1 -9V9'); }
      if (rot !== 0 && left) { b.text(x - 16, y - 2, name, 'end', 'nm'); b.text(x - 16, y + 13, value, 'end', 'vl'); }
      else if (rot !== 0) { const lx = x + (kind === 'LED' ? 28 : 16); b.text(lx, y - 2, name, 'start', 'nm'); b.text(lx, y + 13, value, 'start', 'vl'); }
      else { b.text(x, y - 16, name, 'middle', 'nm'); b.text(x, y + 28, value, 'middle', 'vl'); }
    },
    box(x, y, w, h, label, sub) { el('rect', { x, y, width: w, height: h, rx: 4, fill: 'var(--card)', stroke: 'currentColor', 'stroke-width': 1.8 }); b.text(x + w / 2, y + h / 2 + (sub ? 0 : 4), label, 'middle', 'nm'); b.text(x + w / 2, y + h / 2 + 14, sub, 'middle', 'vl'); },
    source(x, y) { el('circle', Object.assign({ cx: x, cy: y, r: 14 }, st)); el('path', Object.assign({ d: `M${x - 8} ${y}a4 4 0 0 1 8 0a4 4 0 0 0 8 0` }, st)); },
    // op-amp: inputs on the left (x), output on the right (x+64); plusTop puts "+" on the upper input
    opamp(x, y, plusTop) {
      el('polygon', Object.assign({ points: `${x},${y - 32} ${x},${y + 32} ${x + 64},${y}` }, st, { fill: 'var(--card)' }));
      const yp = plusTop ? y - 16 : y + 16, yn = plusTop ? y + 16 : y - 16;
      b.text(x + 8, yp + 5, '+', 'start', 'oa'); b.text(x + 8, yn + 5, '−', 'start', 'oa'); b.text(x + 30, y - 20, '+V', 'middle', 'vl'); b.text(x + 30, y + 29, '−V', 'middle', 'vl');
      return { plus: [x, yp], minus: [x, yn], out: [x + 64, y] };
    },
    // BJT: base at (x,y); top pin (x+40,y-40), bottom pin (x+40,y+40). flip=false: collector on top (NPN style), flip=true: emitter on top (PNP style)
    bjt(x, y, pnp, flip, name) {
      b.wire([x, y], [x + 16, y]); b.wire([x + 16, y - 18], [x + 16, y + 18]);
      b.wire([x + 16, y - 8], [x + 40, y - 26], [x + 40, y - 40]); b.wire([x + 16, y + 8], [x + 40, y + 26], [x + 40, y + 40]);
      const ey = flip ? -1 : 1, ax = x + 16 + 24 * 0.62, ay = y + ey * (8 + 18 * 0.62), dx = 24, dy = ey * 18, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, dir = pnp ? -1 : 1;
      const hx = ax + dir * ux * 6, hy = ay + dir * uy * 6, px = -uy, py = ux;
      el('polygon', { points: `${hx},${hy} ${ax - dir * ux * 2 + px * 4},${ay - dir * uy * 2 + py * 4} ${ax - dir * ux * 2 - px * 4},${ay - dir * uy * 2 - py * 4}`, fill: 'currentColor' });
      b.text(x + 52, y + 4, name || (pnp ? 'PNP' : 'NPN'), 'start', 'nm');
      return { b: [x, y], top: [x + 40, y - 40], bot: [x + 40, y + 40] };
    },
    // MOSFET: gate at (x,y); N: drain top / source bottom; flip=true: source on top (P-channel high side)
    mos(x, y, pch, flip, name) {
      b.wire([x, y], [x + 14, y]); b.wire([x + 14, y - 16], [x + 14, y + 16]);
      b.wire([x + 20, y - 18], [x + 20, y - 10]); b.wire([x + 20, y - 4], [x + 20, y + 4]); b.wire([x + 20, y + 10], [x + 20, y + 18]);
      b.wire([x + 20, y - 14], [x + 40, y - 14], [x + 40, y - 40]); b.wire([x + 20, y + 14], [x + 40, y + 14], [x + 40, y + 40]);
      b.wire([x + 20, y], [x + 34, y], [x + 34, flip ? y - 14 : y + 14]);
      if (!pch) el('polygon', { points: `${x + 20},${y} ${x + 27},${y - 4} ${x + 27},${y + 4}`, fill: 'currentColor' });
      else el('polygon', { points: `${x + 28},${y} ${x + 21},${y - 4} ${x + 21},${y + 4}`, fill: 'currentColor' });
      b.text(x + 52, y + 4, name || (pch ? 'P-MOS' : 'N-MOS'), 'start', 'nm');
      return { g: [x, y], top: [x + 40, y - 40], bot: [x + 40, y + 40] };
    },
  };
  return b;
}
const sv = (G, id, u) => { const v = G.v(id); return isFinite(v) ? eng(v, u) : ''; };       // an input as text, e.g. "4.7 kΩ"
const iv = (items, i) => { const r = items && items[i]; return r && r[0] && String(r[0]) !== '—' ? String(r[0]) : ''; }; // a computed result as text
const nz = (a, b) => (a !== '' && a != null ? a : b);

/* ---- BJT ---- */
function schBjtSwitch(G, items) {
  const pnp = G.s('tp') === 'pnp', s = newSch(330, 250), rl = G.v('rl'), ic = sv(G, 'ic', 'A'), rlv = rl > 0 ? eng(rl, 'Ω') : '';
  if (!pnp) {
    s.wire([210, 30], [250, 30]); s.term(250, 30, 'Vcc', 'r', sv(G, 'vcc', 'V')); s.part('R', 210, 60, 90, nz(rlv && 'RL', tt('Yük', 'Load')), rlv);
    const q = s.bjt(170, 130, false, false, 'Q1 NPN'); s.wire([210, 30], q.top); s.wire(q.bot, [210, 175]); s.gnd(210, 175);
    s.text(226, 92, ic && 'I_C ' + ic, 'start', 'vl');
    s.term(14, 130, 'Vdrv', 'l', sv(G, 'vd', 'V')); s.wire([14, 130], [50, 130]); s.part('R', 80, 130, 0, 'Rb', iv(items, 1)); s.wire([110, 130], [170, 130]); s.dot(140, 130);
    s.text(140, 124, iv(items, 3) && 'I_B ' + iv(items, 3), 'middle', 'vl');
    s.wire([140, 130], [140, 150]); s.part('R', 140, 180, 90, 'Rbe', '10 kΩ'); s.gnd(140, 210);
    s.text(0, 246, tt('Düşük taraf: yük kollektörde', 'Low-side: load in the collector'), 'start', 'vl');
  } else {
    s.wire([140, 30], [250, 30]); s.term(250, 30, 'Vcc', 'r', sv(G, 'vcc', 'V'));
    const q = s.bjt(170, 110, true, true, 'Q1 PNP'); s.wire([210, 30], q.top); s.dot(210, 30);
    s.wire(q.bot, [210, 150]); s.part('R', 210, 180, 90, nz(rlv && 'RL', tt('Yük', 'Load')), rlv); s.gnd(210, 210); s.text(226, 150, ic && 'I_C ' + ic, 'start', 'vl');
    s.term(14, 110, 'Vdrv', 'l', sv(G, 'vd', 'V')); s.wire([14, 110], [50, 110]); s.part('R', 80, 110, 0, 'Rb', iv(items, 1)); s.wire([100, 110], [170, 110]); s.dot(140, 110);
    s.text(140, 126, iv(items, 3) && 'I_B ' + iv(items, 3), 'middle', 'vl');
    s.wire([140, 30], [140, 50]); s.part('R', 140, 80, 90, 'Rbe', '10 kΩ'); s.dot(140, 30);
    s.text(0, 246, tt('Yüksek taraf: emiter besleme tarafında', 'High-side: emitter on the supply side'), 'start', 'vl');
  }
  return s.svg;
}
// the switch schematic reads the polarity from G.s('tp'); the NPN/PNP calculators force it
const bjtT = (tp, G) => ({ v: G.v, r: G.r, s: (k) => (k === 'tp' ? tp : G.s(k)) });
// collector / emitter resistor column: NPN has R_C on top and R_E to ground, PNP mirrors it (emitter on the supply)
function bjtColumn(s, G, pnp, name) {
  s.wire([210, 30], [250, 30]); s.term(250, 30, 'Vcc', 'r', sv(G, 'vcc', 'V'));
  s.part('R', 210, 60, 90, pnp ? 'Re' : 'Rc', sv(G, pnp ? 're' : 'rc', 'Ω'));
  const q = s.bjt(170, 130, pnp, pnp, name); s.wire([210, 30], q.top); s.wire(q.bot, [210, 170]);
  s.part('R', 210, 200, 90, pnp ? 'Rc' : 'Re', sv(G, pnp ? 'rc' : 're', 'Ω')); s.gnd(210, 230);
  return q;
}
function schBjtIc(G, items) {
  const pnp = G.s('tp') === 'pnp', s = newSch(300, 270); bjtColumn(s, G, pnp, pnp ? 'Q1 PNP' : 'Q1 NPN');
  s.text(pnp ? 272 : 226, pnp ? 212 : 92, iv(items, 0) && 'I_C ' + iv(items, 0), 'start', 'vl'); s.text(222, 150, iv(items, 2) && 'V_CE ' + iv(items, 2), 'start', 'vl');
  s.term(14, 130, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 130], [50, 130]); s.part('R', 80, 130, 0, 'Rb', sv(G, 'rb', 'Ω')); s.wire([110, 130], [170, 130]);
  s.text(140, 124, iv(items, 3) && 'I_B ' + iv(items, 3), 'middle', 'vl');
  return s.svg;
}
function schBjtDiv(G, items) {
  const pnp = G.s('tp') === 'pnp', s = newSch(300, 270); bjtColumn(s, G, pnp, pnp ? 'Q1 PNP' : 'Q1 NPN'); s.dot(210, 30);
  s.wire([60, 30], [210, 30]); s.wire([60, 30], [60, 50]); s.part('R', 60, 80, 90, 'R1', sv(G, 'r1', 'Ω')); s.dot(60, 130); s.part('R', 60, 180, 90, 'R2', sv(G, 'r2', 'Ω')); s.gnd(60, 210);
  s.wire([60, 130], [170, 130]);
  s.text(pnp ? 272 : 226, pnp ? 212 : 92, iv(items, 0) && 'I_C ' + iv(items, 0), 'start', 'vl'); s.text(222, 150, iv(items, 1) && 'V_CE ' + iv(items, 1), 'start', 'vl'); s.text(226, pnp ? 92 : 172, iv(items, 3) && 'V_E ' + iv(items, 3), 'start', 'vl');
  return s.svg;
}

/* ---- MOSFET ---- */
// the gate-drive schematic is shared by the N and P calculators: force the channel / position it draws
const mosCh = (tp, pos, G) => ({ v: G.v, r: G.r, s: (k) => (k === 'tp' ? tp : k === 'pos' && pos ? pos : G.s(k)) });
function schMosGate(G, items) {
  const n = G.s('tp') === 'n', hi = G.s('pos') === 'high', s = newSch(340, 260), vs = sv(G, 'vs', 'V'), vg = iv(items, 0);
  if (n && !hi) {
    s.wire([210, 30], [250, 30]); s.term(250, 30, 'Vs', 'r', vs); s.part('R', 210, 60, 90, tt('Yük', 'Load')); const m = s.mos(170, 130, false, false, 'N-MOS'); s.wire([210, 30], m.top); s.wire(m.bot, [210, 175]); s.gnd(210, 175);
    s.term(14, 130, 'Vdrv', 'l', sv(G, 'vd', 'V')); s.wire([14, 130], [50, 130]); s.part('R', 80, 130, 0, 'Rg', sv(G, 'rg', 'Ω')); s.wire([110, 130], [170, 130]); s.dot(140, 130);
    s.text(140, 122, vg && 'V_GS ' + vg, 'middle', 'vl'); s.wire([140, 130], [140, 150]); s.part('R', 140, 180, 90, 'Rgs', '10–100k'); s.gnd(140, 210);
    s.text(0, 246, tt('Düşük taraf', 'Low-side'), 'start', 'vl');
  } else if (!n && hi) {
    s.wire([140, 30], [250, 30]); s.term(250, 30, 'Vs', 'r', vs);
    const m = s.mos(170, 110, true, true, 'P-MOS'); s.wire([210, 30], m.top); s.dot(210, 30); s.wire(m.bot, [210, 150]); s.part('R', 210, 180, 90, tt('Yük', 'Load')); s.gnd(210, 210);
    s.term(14, 110, 'Vdrv', 'l', sv(G, 'vd', 'V')); s.wire([14, 110], [40, 110]); s.part('R', 70, 110, 0, 'Rg', sv(G, 'rg', 'Ω')); s.wire([100, 110], [170, 110]); s.dot(140, 110);
    s.text(140, 126, vg && '|V_GS| ' + vg, 'middle', 'vl'); s.wire([140, 30], [140, 50]); s.part('R', 140, 80, 90, 'Rgs', '10–100k', true); s.dot(140, 30);
    s.text(0, 246, tt('Yüksek taraf: gate 0 V → açık', 'High-side: gate 0 V → on'), 'start', 'vl');
  } else if (n && hi) {
    s.wire([210, 30], [250, 30]); s.term(250, 30, 'Vs', 'r', vs); const m = s.mos(170, 130, false, false, 'N-MOS'); s.wire([210, 30], m.top); s.wire(m.bot, [210, 170]); s.dot(210, 170); s.part('R', 210, 200, 90, tt('Yük', 'Load')); s.gnd(210, 230);
    s.box(-44, 100, 114, 60, tt('Gate sürücü', 'Gate driver'), 'V_G > ' + (vs || 'Vs')); s.wire([70, 130], [80, 130]); s.part('R', 100, 130, 0, 'Rg', sv(G, 'rg', 'Ω')); s.wire([130, 130], [170, 130]); s.dot(145, 130);
    s.wire([145, 130], [145, 150]); s.part('R', 145, 180, 90, 'Rgs', '10–100k'); s.wire([145, 210], [145, 235], [210, 235]); s.dot(210, 235);
    s.text(0, 252, tt('Yüksek taraf: bootstrap / şarj pompası', 'High-side: bootstrap / charge pump'), 'start', 'vl');
  } else {
    s.text(170, 120, tt('P-kanal düşük taraf yaygın değildir (gate negatif gerilim ister).', 'P-channel low-side is uncommon (the gate needs a negative voltage).'), 'middle', 'vl');
  }
  return s.svg;
}
// N-MOSFET low-side switch: 'sw' (switch current / loss) and 'rg' (gate resistor) variants
const schMosLow = (kind) => (G, items) => {
  const s = newSch(300, 250), sw = kind === 'sw';
  s.wire([210, 30], [250, 30]); s.term(250, 30, sw ? 'Vdd' : 'Vdd', 'r', sw ? sv(G, 'vdd', 'V') : ''); s.part('R', 210, 60, 90, tt('Yük', 'Load'), sw ? sv(G, 'rl', 'Ω') : '');
  const m = s.mos(170, 130, false, false, 'N-MOS'); s.wire([210, 30], m.top); s.wire(m.bot, [210, 175]); s.gnd(210, 175);
  if (sw) { s.text(226, 92, iv(items, 0) && 'I_D ' + iv(items, 0), 'start', 'vl'); s.text(262, 138, 'R_DS(on) ' + nz(iv(items, 2), sv(G, 'rds', 'Ω')), 'start', 'vl'); s.text(262, 152, iv(items, 1) && 'V_DS ' + iv(items, 1), 'start', 'vl'); }
  s.term(14, 130, 'Vdrv', 'l', sw ? sv(G, 'vgs', 'V') && '' : sv(G, 'vd', 'V')); s.wire([14, 130], [50, 130]); s.part('R', 80, 130, 0, 'Rg', sw ? '' : nz(iv(items, 1), iv(items, 0))); s.wire([110, 130], [170, 130]); s.dot(140, 130);
  s.wire([140, 130], [140, 150]); s.part('R', 140, 180, 90, 'Rgs', '10–100k'); s.gnd(140, 210);
  if (!sw) s.text(226, 92, iv(items, 2) && 'I_g(pk) ' + iv(items, 2), 'start', 'vl');
  return s.svg;
};
// P-MOSFET high-side switch: 'sw' (switch current / loss) and 'rg' (gate resistor) variants
const schMosHigh = (kind) => (G, items) => {
  const s = newSch(300, 250), sw = kind === 'sw';
  s.wire([140, 30], [250, 30]); s.term(250, 30, 'Vdd', 'r', sw ? sv(G, 'vdd', 'V') : '');
  const m = s.mos(170, 110, true, true, 'P-MOS'); s.wire([210, 30], m.top); s.dot(210, 30); s.wire(m.bot, [210, 150]); s.part('R', 210, 180, 90, tt('Yük', 'Load'), sw ? sv(G, 'rl', 'Ω') : ''); s.gnd(210, 210);
  if (sw) { s.text(226, 166, iv(items, 0) && 'I_D ' + iv(items, 0), 'start', 'vl'); s.text(262, 104, 'R_DS(on) ' + nz(iv(items, 2), sv(G, 'rds', 'Ω')), 'start', 'vl'); s.text(262, 118, iv(items, 1) && '|V_DS| ' + iv(items, 1), 'start', 'vl'); }
  s.term(14, 110, 'Vdrv', 'l', sw ? '' : sv(G, 'vd', 'V')); s.wire([14, 110], [40, 110]); s.part('R', 70, 110, 0, 'Rg', sw ? '' : nz(iv(items, 1), iv(items, 0))); s.wire([100, 110], [170, 110]); s.dot(140, 110);
  s.wire([140, 30], [140, 50]); s.part('R', 140, 80, 90, 'Rgs', '10–100k', true); s.dot(140, 30);
  if (!sw) s.text(226, 166, iv(items, 2) && 'I_g(pk) ' + iv(items, 2), 'start', 'vl');
  s.text(0, 246, tt('Yüksek taraf: gate aşağı çekilince iletir, Rgs beslemeye çeker (kapalı)', 'High-side: conducts when the gate is pulled low; Rgs pulls it to the supply (off)'), 'start', 'vl');
  return s.svg;
};
function schRevPol(G, items) {
  const s = newSch(300, 272);
  s.term(210, 24, 'Vbat', null, sv(G, 'vb', 'V')); const m = s.mos(170, 130, true, false, 'P-MOS'); s.wire([210, 24], m.top);
  s.text(262, 138, 'R_DS(on) ' + sv(G, 'rds', 'Ω'), 'start', 'vl'); s.text(262, 152, iv(items, 0) && tt('düşüm ', 'drop ') + iv(items, 0), 'start', 'vl');
  s.wire(m.bot, [210, 170]); s.part('R', 210, 200, 90, tt('Yük', 'Load'), sv(G, 'i', 'A')); s.gnd(210, 230);
  s.wire([170, 130], [140, 130]); s.dot(140, 130); s.wire([140, 130], [140, 150]); s.part('R', 140, 180, 90, 'Rg', '100 kΩ'); s.gnd(140, 210);
  s.text(0, 266, tt('Drain batarya tarafında, source yük tarafında; gate GND\'ye çekilir', 'Drain on the battery side, source on the load side; gate pulled to GND'), 'start', 'vl');
  return s.svg;
}

/* ---- diode / passive circuits ---- */
function schLed(G, items) {
  const s = newSch(300, 170), n = G.r('n');
  s.term(14, 50, 'Vs', 'l', sv(G, 'vs', 'V')); s.wire([14, 50], [50, 50]); s.part('R', 80, 50, 0, 'R', iv(items, 1)); s.wire([110, 50], [150, 50], [150, 70]);
  s.part('LED', 150, 100, 90, 'LED' + (n > 1 ? ' ×' + n : ''), sv(G, 'vf', 'V')); s.wire([150, 130], [150, 140]); s.gnd(150, 140);
  s.text(210, 96, 'I_F', 'start', 'nm'); s.text(210, 111, iv(items, 2) || sv(G, 'i', 'A'), 'start', 'vl'); s.wire([200, 80], [200, 118]); s.wire([200, 118], [196, 112]); s.wire([200, 118], [204, 112]);
  return s.svg;
}
function schZener(G, items) {
  const s = newSch(320, 190), range = sv(G, 'vmin', 'V') && sv(G, 'vmax', 'V') ? sv(G, 'vmin', 'V') + ' … ' + sv(G, 'vmax', 'V') : '';
  s.term(14, 50, 'Vin', 'l', range); s.wire([14, 50], [50, 50]); s.part('R', 80, 50, 0, 'Rs', iv(items, 1)); s.wire([110, 50], [250, 50]); s.dot(150, 50); s.wire([150, 50], [150, 70]); s.part('Z', 150, 100, -90, 'Dz', sv(G, 'vz', 'V')); s.wire([150, 130], [150, 140]); s.gnd(150, 140);
  s.dot(220, 50); s.wire([220, 50], [220, 70]); s.part('R', 220, 100, 90, tt('Yük', 'Load'), sv(G, 'ilmax', 'A') && 'I_L ≤ ' + sv(G, 'ilmax', 'A')); s.wire([220, 130], [220, 140]); s.gnd(220, 140); s.term(250, 50, 'Vout', 'r', sv(G, 'vz', 'V'));
  s.text(150, 182, iv(items, 2) && 'I_Z(max) ' + iv(items, 2), 'middle', 'vl');
  return s.svg;
}
function schTvs(G, items) {
  const s = newSch(340, 190);
  s.wire([30, 60], [30, 71]); s.source(30, 85); s.wire([30, 99], [30, 150]); s.gnd(30, 150); s.text(10, 88, tt('Sürge', 'Surge'), 'end', 'nm'); s.text(10, 102, sv(G, 'vs', 'V'), 'end', 'vl');
  s.wire([30, 60], [60, 60]); s.part('R', 90, 60, 0, 'Rs', sv(G, 'rs', 'Ω')); s.wire([120, 60], [265, 60]); s.dot(150, 60); s.wire([150, 60], [150, 70]); s.part('TVS', 150, 100, 90, 'TVS', sv(G, 'vbr', 'V') && 'V_BR ' + sv(G, 'vbr', 'V')); s.wire([150, 130], [150, 150]); s.dot(150, 150);
  s.wire([265, 60], [265, 75]); s.box(240, 75, 60, 60, tt('Yük', 'Load')); s.wire([265, 135], [265, 150]); s.wire([30, 150], [265, 150]);
  s.text(150, 170, (iv(items, 0) && 'V_C ' + iv(items, 0)) + (iv(items, 1) ? '  ·  I_PP ' + iv(items, 1) : ''), 'middle', 'vl');
  return s.svg;
}
function schDivider(G, items) {
  const s = newSch(260, 190);
  s.term(14, 30, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 30], [110, 30]); s.part('R', 110, 60, 90, 'R1', sv(G, 'r1', 'Ω')); s.dot(110, 90); s.part('R', 110, 120, 90, 'R2', sv(G, 'r2', 'Ω')); s.gnd(110, 150); s.wire([110, 90], [200, 90]); s.term(200, 90, 'Vout', 'r', iv(items, 0));
  return s.svg;
}
function schShunt(G, items) {
  const s = newSch(430, 200), rs = sv(G, 'r', 'Ω'), I = G.r('imax'), vsen = iv(items, 0);
  s.text(80, 14, tt('Düşük taraf algılama', 'Low-side sensing'), 'middle', 'nm'); s.term(80, 30, 'Vs', 'r'); s.wire([80, 30], [80, 50]); s.box(58, 50, 44, 44, tt('Yük', 'Load'), isFinite(I) ? I + ' A' : ''); s.wire([80, 94], [80, 110]); s.part('R', 80, 140, 90, 'Rs', rs); s.gnd(80, 170); s.dot(80, 110);
  s.text(96, 106, vsen && 'Vsense ' + vsen, 'start', 'vl');
  s.text(320, 14, tt('Yüksek taraf algılama', 'High-side sensing'), 'middle', 'nm'); s.term(320, 30, 'Vs', 'r'); s.wire([320, 30], [320, 40]); s.part('R', 320, 70, 90, 'Rs', rs); s.wire([320, 100], [320, 115]); s.box(298, 115, 44, 44, tt('Yük', 'Load'), isFinite(I) ? I + ' A' : ''); s.wire([320, 159], [320, 170]); s.gnd(320, 170);
  s.text(336, 112, vsen && 'Vsense ' + vsen, 'start', 'vl');
  return s.svg;
}
function schInrush(G, items) {
  const s = newSch(380, 190), rl = G.v('rl') > 0;
  s.term(14, 40, 'Vin', 'l', sv(G, 'v', 'V')); s.wire([14, 40], [30, 40]); s.part('S', 60, 40, 0, tt('Takma', 'Plug-in')); s.wire([90, 40], [100, 40]); s.part('R', 130, 40, 0, 'Rs', sv(G, 'rs', 'Ω'));
  if (rl) { s.wire([160, 40], [170, 40]); s.part('R', 200, 40, 0, 'NTC/Rlim', sv(G, 'rl', 'Ω')); s.wire([230, 40], [260, 40]); } else s.wire([160, 40], [260, 40]);
  s.dot(260, 40); s.part('C', 260, 70, 90, 'C', sv(G, 'c', 'F')); s.wire([260, 100], [260, 130]); s.gnd(260, 130);
  s.wire([260, 40], [340, 40]); s.wire([340, 40], [340, 55]); s.box(320, 55, 40, 44, tt('Yük', 'Load')); s.wire([340, 99], [340, 130]); s.wire([260, 130], [340, 130]);
  s.text(0, 172, iv(items, 0) && 'I_pk = ' + iv(items, 0) + (iv(items, 2) ? '  ·  τ = ' + iv(items, 2) : ''), 'start', 'nm');
  return s.svg;
}
function schRc(G, items) {
  const s = newSch(280, 170);
  s.wire([30, 40], [30, 71]); s.source(30, 85); s.wire([30, 99], [30, 130]); s.gnd(30, 130); s.text(48, 88, 'V', 'start', 'nm'); s.text(48, 102, sv(G, 'v', 'V'), 'start', 'vl');
  s.wire([30, 40], [60, 40]); s.part('R', 90, 40, 0, 'R', sv(G, 'r', 'Ω')); s.wire([120, 40], [200, 40]); s.dot(200, 40); s.part('C', 200, 70, 90, 'C', sv(G, 'c', 'F')); s.wire([200, 100], [200, 130]); s.wire([30, 130], [200, 130]);
  s.text(215, 40, 'Vc', 'start', 'nm'); s.text(215, 156, iv(items, 0) && 'τ = ' + iv(items, 0), 'start', 'vl');
  return s.svg;
}
function schHold(G, items) {
  const s = newSch(340, 175);
  s.term(14, 40, 'Vin', 'l', sv(G, 'v1', 'V')); s.wire([14, 40], [60, 40]); s.part('D', 90, 40, 0, 'D'); s.wire([120, 40], [280, 40]); s.dot(150, 40); s.wire([150, 40], [150, 55]); s.part('C', 150, 85, 90, 'C hold-up', iv(items, 0)); s.wire([150, 115], [150, 130]); s.wire([150, 130], [280, 130]); s.gnd(150, 130);
  s.wire([280, 40], [280, 55]); s.box(255, 55, 50, 55, tt('Yük', 'Load'), sv(G, 'p', 'W')); s.wire([280, 110], [280, 130]);
  s.text(150, 160, G.v('t') > 0 ? tt('Hold-up süresi ', 'Hold-up time ') + sv(G, 't', 's') + ' · V ≥ ' + sv(G, 'v2', 'V') : '', 'middle', 'vl');
  return s.svg;
}
function schConverter(G, items) {
  const buck = G.s('tp') !== 'boost', s = newSch(380, 190), f = sv(G, 'f', 'Hz');
  if (buck) {
    s.term(14, 40, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 40], [30, 40]); s.part('S', 60, 40, 0, 'S', iv(items, 2) && 'D = ' + iv(items, 2)); s.wire([90, 40], [150, 40]); s.dot(150, 40); s.part('L', 190, 40, 0, 'L', iv(items, 0)); s.wire([220, 40], [300, 40]); s.dot(270, 40);
    s.wire([150, 40], [150, 55]); s.part('D', 150, 85, -90, 'D'); s.wire([150, 115], [150, 140]); s.dot(150, 140);
    s.wire([270, 40], [270, 55]); s.part('C', 270, 85, 90, 'C'); s.wire([270, 115], [270, 140]); s.wire([150, 140], [330, 140]); s.gnd(150, 140);
    s.wire([300, 40], [330, 40]); s.dot(300, 40); s.wire([330, 40], [330, 60]); s.box(305, 60, 50, 60, tt('Yük', 'Load'), sv(G, 'vo', 'V')); s.wire([330, 120], [330, 140]);
  } else {
    s.term(14, 40, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 40], [30, 40]); s.part('L', 60, 40, 0, 'L', iv(items, 0)); s.wire([90, 40], [150, 40]); s.dot(150, 40); s.wire([150, 40], [150, 55]); s.part('S', 150, 85, 90, 'S', iv(items, 2) && 'D = ' + iv(items, 2)); s.wire([150, 115], [150, 140]); s.dot(150, 140);
    s.wire([150, 40], [180, 40]); s.part('D', 210, 40, 0, 'D'); s.wire([240, 40], [300, 40]); s.dot(270, 40); s.wire([270, 40], [270, 55]); s.part('C', 270, 85, 90, 'C'); s.wire([270, 115], [270, 140]); s.wire([150, 140], [330, 140]); s.gnd(150, 140);
    s.wire([300, 40], [330, 40]); s.dot(300, 40); s.wire([330, 40], [330, 60]); s.box(305, 60, 50, 60, tt('Yük', 'Load'), sv(G, 'vo', 'V')); s.wire([330, 120], [330, 140]);
  }
  s.text(0, 175, [f && 'f = ' + f, iv(items, 4) && 'I_pk = ' + iv(items, 4), sv(G, 'io', 'A') && 'I_out = ' + sv(G, 'io', 'A')].filter(Boolean).join('  ·  '), 'start', 'vl');
  return s.svg;
}

/* ---- op-amp circuits ---- */
function schOpInv(G, items) {
  const s = newSch(380, 200), oa = s.opamp(210, 116, false);
  s.term(14, 100, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 100], [40, 100]); s.part('R', 70, 100, 0, 'Rin', sv(G, 'rin', 'Ω')); s.wire([100, 100], [210, 100]); s.dot(130, 100);
  s.wire([130, 100], [130, 40], [170, 40]); s.part('R', 200, 40, 0, 'Rf', sv(G, 'rf', 'Ω')); s.wire([230, 40], [320, 40], [320, 116]); s.wire(oa.out, [320, 116]); s.dot(320, 116); s.wire([320, 116], [350, 116]); s.term(350, 116, 'Vout', 'r', iv(items, 2));
  s.wire(oa.plus, [190, oa.plus[1]], [190, 165]); s.gnd(190, 165); s.text(250, 176, iv(items, 0) && 'A_v = ' + iv(items, 0), 'middle', 'nm');
  return s.svg;
}
function schOpNon(G, items) {
  const s = newSch(380, 230), oa = s.opamp(210, 116, true);
  s.term(14, 100, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 100], [210, 100]);
  s.wire(oa.minus, [180, 132]); s.dot(180, 132); s.wire([180, 132], [130, 132]); s.part('R', 130, 162, 90, 'R1', sv(G, 'r1', 'Ω')); s.gnd(130, 192);
  s.wire([180, 132], [180, 190], [220, 190]); s.part('R', 250, 190, 0, 'Rf', sv(G, 'rf', 'Ω')); s.wire([280, 190], [320, 190], [320, 116]); s.wire(oa.out, [320, 116]); s.dot(320, 116); s.wire([320, 116], [350, 116]); s.term(350, 116, 'Vout', 'r', iv(items, 2));
  s.text(250, 64, iv(items, 0) && 'A_v = ' + iv(items, 0), 'middle', 'nm');
  return s.svg;
}
function schOpGd(G, items) { // gain design: draws the chosen circuit with the calculated R_f
  const inv = G.s('tp') === 'inv', r = sv(G, 'r', 'Ω'), rf = nz(iv(items, 1), iv(items, 0)), s = newSch(380, 230), oa = s.opamp(210, 116, !inv);
  if (inv) {
    s.term(14, 100, 'Vin', 'l'); s.wire([14, 100], [40, 100]); s.part('R', 70, 100, 0, 'Rin', r); s.wire([100, 100], [210, 100]); s.dot(130, 100);
    s.wire([130, 100], [130, 40], [170, 40]); s.part('R', 200, 40, 0, 'Rf', rf); s.wire([230, 40], [320, 40], [320, 116]); s.wire(oa.out, [320, 116]); s.dot(320, 116); s.wire([320, 116], [350, 116]); s.term(350, 116, 'Vout', 'r');
    s.wire(oa.plus, [190, oa.plus[1]], [190, 165]); s.gnd(190, 165);
  } else {
    s.term(14, 100, 'Vin', 'l'); s.wire([14, 100], [210, 100]); s.wire(oa.minus, [180, 132]); s.dot(180, 132); s.wire([180, 132], [130, 132]); s.part('R', 130, 162, 90, 'R1', r); s.gnd(130, 192);
    s.wire([180, 132], [180, 190], [220, 190]); s.part('R', 250, 190, 0, 'Rf', rf); s.wire([280, 190], [320, 190], [320, 116]); s.wire(oa.out, [320, 116]); s.dot(320, 116); s.wire([320, 116], [350, 116]); s.term(350, 116, 'Vout', 'r');
  }
  s.text(250, inv ? 176 : 64, iv(items, 2) && 'A_v = ' + iv(items, 2), 'middle', 'nm');
  return s.svg;
}
function schOpCmp(G, items) {
  const s = newSch(340, 190), oa = s.opamp(190, 90, true);
  s.term(14, 74, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 74], [190, 74]); s.term(14, 106, 'Vref', 'l', sv(G, 'vref', 'V')); s.wire([14, 106], [190, 106]); s.wire(oa.out, [300, 90]); s.term(300, 90, 'Vout', 'r', iv(items, 0));
  s.text(0, 175, tt('Açık çevrim: Vin > Vref → çıkış üst ray, Vin < Vref → alt ray', 'Open loop: Vin > Vref → output at the upper rail, Vin < Vref → lower rail'), 'start', 'vl');
  return s.svg;
}
function schOpSchmitt(G, items) {
  const non = G.s('tp') !== 'inv', s = newSch(380, non ? 240 : 275), th = iv(items, 1) && iv(items, 2) ? tt('Eşikler: ', 'Thresholds: ') + iv(items, 2) + ' / ' + iv(items, 1) : '';
  if (non) {
    const oa = s.opamp(230, 116, true);
    s.term(14, 100, 'Vin', 'l'); s.wire([14, 100], [40, 100]); s.part('R', 70, 100, 0, 'R1', sv(G, 'r1', 'Ω')); s.wire([100, 100], [230, 100]); s.dot(130, 100);
    s.wire([130, 100], [130, 40], [170, 40]); s.part('R', 200, 40, 0, 'R2', sv(G, 'r2', 'Ω')); s.wire([230, 40], [340, 40], [340, 116]); s.wire(oa.out, [340, 116]); s.dot(340, 116); s.wire([340, 116], [366, 116]); s.term(366, 116, 'Vout', 'r');
    s.term(14, 132, 'Vref', 'l', sv(G, 'vref', 'V')); s.wire([14, 132], [230, 132]);
    s.text(0, 215, tt('Evirmeyen Schmitt: giriş R1 ile, geri besleme R2 ile + girişe', 'Non-inverting Schmitt: input via R1, feedback via R2 to the + input'), 'start', 'vl'); s.text(0, 232, th, 'start', 'nm');
  } else {
    const oa = s.opamp(230, 116, false);
    s.term(14, 100, 'Vin', 'l'); s.wire([14, 100], [230, 100]);
    s.wire(oa.plus, [200, 132]); s.dot(200, 132); s.wire([200, 132], [150, 132]); s.part('R', 150, 162, 90, 'R1', sv(G, 'r1', 'Ω')); s.wire([150, 192], [150, 198]); s.term(150, 198, 'Vref', 'l', sv(G, 'vref', 'V'));
    s.wire(oa.out, [320, 116]); s.dot(320, 116); s.wire([320, 116], [320, 200], [280, 200]); s.part('R', 250, 200, 0, 'R2', sv(G, 'r2', 'Ω')); s.wire([220, 200], [200, 200], [200, 132]); s.wire([320, 116], [350, 116]); s.term(350, 116, 'Vout', 'r');
    s.text(0, 252, tt('Evirici Schmitt: giriş − uçta, R1/R2 bölücüsü + uçta', 'Inverting Schmitt: input on the − input, R1/R2 divider on the + input'), 'start', 'vl'); s.text(0, 268, th, 'start', 'nm');
  }
  return s.svg;
}
function schOpSum(G, items) {
  const s = newSch(380, 250), oa = s.opamp(230, 136, false);
  [['V1', 90, 'v1', 'r1'], ['V2', 150, 'v2', 'r2'], ['V3', 210, 'v3', 'r3']].forEach(([n, y, vid, id]) => { s.term(14, y, n, 'l', sv(G, vid, 'V')); s.wire([14, y], [40, y]); s.part('R', 70, y, 0, id.toUpperCase(), sv(G, id, 'Ω')); s.wire([100, y], [140, y]); });
  s.wire([140, 30], [140, 210]); s.wire([140, 120], [230, 120]); s.dot(140, 120); s.dot(140, 150); s.dot(140, 90);
  s.wire([140, 30], [180, 30]); s.part('R', 210, 30, 0, 'Rf', sv(G, 'rf', 'Ω')); s.wire([240, 30], [340, 30], [340, 136]); s.wire(oa.out, [340, 136]); s.dot(340, 136); s.wire([340, 136], [366, 136]); s.term(366, 136, 'Vout', 'r', iv(items, 0));
  s.wire(oa.plus, [210, oa.plus[1]], [210, 188]); s.gnd(210, 188);
  return s.svg;
}
function schOpDiff(G, items) {
  const s = newSch(380, 270), oa = s.opamp(230, 116, false);
  s.term(14, 100, 'V1', 'l', sv(G, 'v1', 'V')); s.wire([14, 100], [40, 100]); s.part('R', 70, 100, 0, 'R1', sv(G, 'r1', 'Ω')); s.wire([100, 100], [230, 100]); s.dot(150, 100);
  s.wire([150, 100], [150, 40], [190, 40]); s.part('R', 220, 40, 0, 'R2', sv(G, 'r2', 'Ω')); s.wire([250, 40], [340, 40], [340, 116]); s.wire(oa.out, [340, 116]); s.dot(340, 116); s.wire([340, 116], [366, 116]); s.term(366, 116, 'Vout', 'r', iv(items, 0));
  s.term(14, 170, 'V2', 'l', sv(G, 'v2', 'V')); s.wire([14, 170], [40, 170]); s.part('R', 70, 170, 0, 'R3', sv(G, 'r1', 'Ω')); s.wire([100, 170], [160, 170]); s.dot(160, 170); s.wire([160, 170], [160, 132], [230, 132]);
  s.wire([160, 170], [160, 190]); s.part('R', 160, 220, 90, 'R4', sv(G, 'r2', 'Ω')); s.gnd(160, 250);
  return s.svg;
}
function schOpInt(G, items) {
  const s = newSch(380, 200), oa = s.opamp(210, 116, false);
  s.term(14, 100, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 100], [40, 100]); s.part('R', 70, 100, 0, 'R', sv(G, 'r', 'Ω')); s.wire([100, 100], [210, 100]); s.dot(130, 100);
  s.wire([130, 100], [130, 40], [170, 40]); s.part('C', 200, 40, 0, 'C', sv(G, 'c', 'F')); s.wire([230, 40], [320, 40], [320, 116]); s.wire(oa.out, [320, 116]); s.dot(320, 116); s.wire([320, 116], [350, 116]); s.term(350, 116, 'Vout', 'r', iv(items, 0));
  s.wire(oa.plus, [190, oa.plus[1]], [190, 165]); s.gnd(190, 165);
  return s.svg;
}

/* ---- active RC filters: passive section + unity-gain buffer ---- */
function schOpBuf(s, x, y) {   // buffer at (x,y): + input on top, − tied to the output; returns the output node x
  const oa = s.opamp(x, y, true), ox = x + 110;
  s.wire(oa.minus, [x - 30, y + 16], [x - 30, y + 74], [ox, y + 74], [ox, y]); s.wire(oa.out, [ox, y]); s.dot(ox, y);
  return { inY: oa.plus[1], ox };
}
// R·C pairs of the 8-channel example boards (1 Hz … 10 MHz), drawn as a reference strip under the filter schematics
const OP_EX_STRIP = [['1 Hz', '158 kΩ', '1 µF'], ['10 Hz', '15.8 kΩ', '1 µF'], ['100 Hz', '1.58 kΩ', '1 µF'], ['1 kHz', '1.58 kΩ', '100 nF'], ['10 kHz', '158 Ω', '100 nF'], ['100 kHz', '158 Ω', '12 nF'], ['1 MHz', '158 Ω', '1 nF'], ['10 MHz', '158 Ω', '100 pF']];
function schExStrip(s, y, w) {
  s.text(-50, y, tt('Örnek kart değerleri (R · C → f_c):', 'Example board values (R · C → f_c):'), 'start', 'nm');
  const step = (w + 100) / 4;
  OP_EX_STRIP.forEach(([f, r, c], i) => { const x = -50 + (i % 4) * step, yy = y + 16 + Math.floor(i / 4) * 15; s.text(x, yy, f + ': ' + r + ' · ' + c, 'start', 'vl'); });
}
function schOpSk(G, items) {
  const lp = G.s('__kind') !== 'hp', s = newSch(430, 290), oa = s.opamp(260, 116, true), ox = 370;
  const a = lp ? ['R', 'R1', sv(G, 'r1', 'Ω')] : ['C', 'C1', sv(G, 'c1', 'F')], b = lp ? ['R', 'R2', sv(G, 'r2', 'Ω')] : ['C', 'C2', sv(G, 'c2', 'F')];
  const fb = lp ? ['C', 'C1', sv(G, 'c1', 'F')] : ['R', 'R1', sv(G, 'r1', 'Ω')], gnd = lp ? ['C', 'C2', sv(G, 'c2', 'F')] : ['R', 'R2', sv(G, 'r2', 'Ω')];
  s.term(14, 100, 'Vin', 'l'); s.wire([14, 100], [40, 100]); s.part(a[0], 70, 100, 0, a[1], a[2]); s.wire([100, 100], [110, 100]); s.dot(110, 100); s.part(b[0], 140, 100, 0, b[1], b[2]); s.wire([170, 100], [260, 100]); s.dot(190, 100);
  s.wire([190, 100], [190, 130]); s.part(gnd[0], 190, 160, 90, gnd[1], gnd[2]); s.gnd(190, 190);
  s.wire([110, 100], [110, 40], [150, 40]); s.part(fb[0], 180, 40, 0, fb[1], fb[2]); s.wire([210, 40], [ox, 40], [ox, 116]);
  s.wire(oa.minus, [252, 132], [252, 200], [ox, 200], [ox, 116]); s.wire(oa.out, [ox, 116]); s.dot(ox, 116); s.wire([ox, 116], [400, 116]); s.term(400, 116, 'Vout', 'r', iv(items, 0) && 'f_c = ' + iv(items, 0));
  s.text(300, 80, iv(items, 1) && 'Q = ' + iv(items, 1), 'middle', 'nm');
  schExStrip(s, 240, 430);
  return s.svg;
}
function schOpLp(G, items) {
  const s = newSch(380, 290), b = schOpBuf(s, 210, 116); schExStrip(s, 240, 380);
  s.term(14, 100, 'Vin', 'l'); s.wire([14, 100], [40, 100]); s.part('R', 70, 100, 0, 'R', sv(G, 'r', 'Ω')); s.wire([100, 100], [210, 100]); s.dot(110, 100);
  s.wire([110, 100], [110, 130]); s.part('C', 110, 160, 90, 'C', sv(G, 'c', 'F')); s.gnd(110, 190);
  s.wire([b.ox, 116], [350, 116]); s.term(350, 116, 'Vout', 'r', iv(items, 0) && 'f_c = ' + iv(items, 0));
  return s.svg;
}
function schOpHp(G, items) {
  const s = newSch(380, 290), b = schOpBuf(s, 210, 116); schExStrip(s, 240, 380);
  s.term(14, 100, 'Vin', 'l'); s.wire([14, 100], [40, 100]); s.part('C', 70, 100, 0, 'C', sv(G, 'c', 'F')); s.wire([100, 100], [210, 100]); s.dot(110, 100);
  s.wire([110, 100], [110, 130]); s.part('R', 110, 160, 90, 'R', sv(G, 'r', 'Ω')); s.gnd(110, 190);
  s.wire([b.ox, 116], [350, 116]); s.term(350, 116, 'Vout', 'r', iv(items, 0) && 'f_c = ' + iv(items, 0));
  return s.svg;
}
function schOpBp(G, items) {
  const s = newSch(520, 290), b = schOpBuf(s, 210, 116); schExStrip(s, 240, 520);
  s.term(14, 100, 'Vin', 'l'); s.wire([14, 100], [40, 100]); s.part('C', 70, 100, 0, 'C1', sv(G, 'c1', 'F')); s.wire([100, 100], [210, 100]); s.dot(110, 100);
  s.wire([110, 100], [110, 130]); s.part('R', 110, 160, 90, 'R1', sv(G, 'r1', 'Ω')); s.gnd(110, 190);
  s.part('R', b.ox + 30 + 20, 116, 0, 'R2', sv(G, 'r2', 'Ω')); s.wire([b.ox, 116], [b.ox + 20, 116]); const nx = b.ox + 80; s.wire([nx, 116], [nx + 20, 116]); s.dot(nx + 20, 116);
  s.wire([nx + 20, 116], [nx + 20, 130]); s.part('C', nx + 20, 160, 90, 'C2', sv(G, 'c2', 'F')); s.gnd(nx + 20, 190);
  s.wire([nx + 20, 116], [nx + 60, 116]); s.term(nx + 60, 116, 'Vout', 'r', iv(items, 0) && 'f_0 = ' + iv(items, 0));
  s.text(140, 60, 'f_L = ' + iv(items, 1), 'middle', 'nm'); s.text(nx + 20, 60, 'f_H = ' + iv(items, 2), 'middle', 'nm');
  return s.svg;
}

const SCH_BIND = {
  'transistor.bsn': (G, i) => schBjtSwitch(bjtT('npn', G), i), 'transistor.icn': (G, i) => schBjtIc(bjtT('npn', G), i), 'transistor.vdn': (G, i) => schBjtDiv(bjtT('npn', G), i),
  'transistor.bsp': (G, i) => schBjtSwitch(bjtT('pnp', G), i), 'transistor.icp': (G, i) => schBjtIc(bjtT('pnp', G), i), 'transistor.vdp': (G, i) => schBjtDiv(bjtT('pnp', G), i),
  'mosfet.mgn': (G, i) => schMosGate(mosCh('n', null, G), i), 'mosfet.msn': schMosLow('sw'), 'mosfet.mrn': schMosLow('rg'),
  'mosfet.mgp': (G, i) => schMosGate(mosCh('p', 'high', G), i), 'mosfet.msp': schMosHigh('sw'), 'mosfet.mrp': schMosHigh('rg'), 'mosfet.rp': schRevPol,
  'diode.led': schLed, 'diode.zn': schZener, 'diode.tv': schTvs, 'resistor.dv': schDivider, 'resistor.cs': schShunt,
  'capacitor.rc': schRc, 'capacitor.ir': schInrush, 'capacitor.hu': schHold, 'inductor.bb': schConverter,
  'opamp.inv': schOpInv, 'opamp.nin': schOpNon, 'opamp.gd': schOpGd, 'opamp.cmp': schOpCmp, 'opamp.sch': schOpSchmitt, 'opamp.sum': schOpSum, 'opamp.dif': schOpDiff, 'opamp.int': schOpInt, 'opamp.alp': schOpLp, 'opamp.ahp': schOpHp, 'opamp.abp': schOpBp, 'opamp.skl': (G, i) => schOpSk({ v: G.v, r: G.r, s: (k) => (k === '__kind' ? 'lp' : G.s(k)) }, i), 'opamp.skh': (G, i) => schOpSk({ v: G.v, r: G.r, s: (k) => (k === '__kind' ? 'hp' : G.s(k)) }, i),
};
Object.assign(SCH_MAP, SCH_BIND);

/* ---- CircuitJS export: SIM_MAP['<component>.<calc id>'] = (G, items) => circuit text ----
   Elements sit on CircuitJS's 16-unit grid. MOSFET 'f x1 y1 x2 y2 flags vth': gate at (x1,y1), channel centred on
   (x2,y2) with one terminal 16 above and one 16 below (N: drain above / source below; P: source above / drain below). */
const SIM = {
  n: (x) => String(Number(Number(x).toPrecision(6))),
  rail: (x, y, v) => 'R ' + x + ' ' + y + ' ' + x + ' ' + (y - 32) + ' 0 0 40 ' + SIM.n(v) + ' 0 0 0.5',
  r: (a, b, c, d, v) => 'r ' + a + ' ' + b + ' ' + c + ' ' + d + ' 0 ' + SIM.n(v),
  w: (a, b, c, d) => 'w ' + a + ' ' + b + ' ' + c + ' ' + d + ' 0',
  g: (x, y) => 'g ' + x + ' ' + y + ' ' + x + ' ' + (y + 32) + ' 0',
  // square-wave gate driver 0 … v (point1 = −, point2 = +)
  sq: (x, y, v, f) => 'v ' + x + ' ' + (y + 64) + ' ' + x + ' ' + y + ' 0 2 ' + SIM.n(f || 1000) + ' ' + SIM.n(v / 2) + ' ' + SIM.n(v / 2) + ' 0 0.5',
  mos: (x, y, p, vth) => 'f ' + (x - 64) + ' ' + y + ' ' + x + ' ' + y + ' ' + (p ? 1 : 0) + ' ' + SIM.n(vth || 2),
  head: (f) => '$ 1 ' + SIM.n(1 / ((f || 1000) * 400)) + ' 6.499443210467817 50 5.0 50',
  val: (G, id, def) => { const v = G.v(id); return v > 0 && isFinite(v) ? v : def; },
};
// N-MOSFET, low-side: supply → load → drain, source on GND; gate from a 0…Vdrv square source through Rg, Rgs pull-down
function simMosLow(G, o) {
  const Vs = SIM.val(G, o.vs, 12), RL = SIM.val(G, o.rl, 100), Vd = SIM.val(G, o.vd, 5), Rg = SIM.val(G, o.rg, 10), f = SIM.val(G, o.f, 1000), vth = SIM.val(G, 'vth', 2);
  return [SIM.head(f), SIM.rail(304, 48, Vs), SIM.r(304, 48, 304, 144, RL), SIM.mos(304, 160, false, vth), SIM.g(304, 176),
    SIM.sq(112, 160, Vd, f), SIM.g(112, 224), SIM.w(112, 160, 160, 160), SIM.r(160, 160, 240, 160, Rg), SIM.r(240, 160, 240, 240, 1e5), SIM.g(240, 240),
    'O 304 144 352 144 0', 'o 5 64 0 34 ' + SIM.n(Vd) + ' 9.765625E-5 0 -1', 'o 3 64 0 34 ' + SIM.n(Vs) + ' 9.765625E-5 1 -1'].join('\n');
}
// N-MOSFET, high-side without bootstrap: shows that V_GS = V_drv − V_source is not enough
function simMosHighN(G, o) {
  const Vs = SIM.val(G, o.vs, 12), RL = SIM.val(G, o.rl, 100), Vd = SIM.val(G, o.vd, 5), Rg = SIM.val(G, o.rg, 10), f = SIM.val(G, o.f, 1000), vth = SIM.val(G, 'vth', 2);
  return [SIM.head(f), SIM.rail(304, 48, Vs), SIM.w(304, 48, 304, 112), SIM.mos(304, 128, false, vth), SIM.r(304, 144, 304, 240, RL), SIM.g(304, 240),
    SIM.sq(112, 128, Vd, f), SIM.g(112, 192), SIM.w(112, 128, 160, 128), SIM.r(160, 128, 240, 128, Rg),
    'O 304 144 352 144 0', 'o 6 64 0 34 ' + SIM.n(Vd) + ' 9.765625E-5 0 -1', 'o 3 64 0 34 ' + SIM.n(Vs) + ' 9.765625E-5 1 -1'].join('\n');
}
// P-MOSFET, high-side: source on the supply, drain → load → GND; Rgs pull-up to the supply, gate pulled down through Rg by a 0…Vdrv source
function simMosHighP(G, o) {
  const Vs = SIM.val(G, o.vs, 12), RL = SIM.val(G, o.rl, 100), Vd = SIM.val(G, o.vd, 5), Rg = SIM.val(G, o.rg, 10), f = SIM.val(G, o.f, 1000), vth = SIM.val(G, 'vth', 2);
  const lines = [SIM.head(f), SIM.rail(304, 48, Vs), SIM.w(304, 48, 304, 112), SIM.mos(304, 128, true, vth), SIM.r(304, 144, 304, 240, RL), SIM.g(304, 240)];
  lines.push(SIM.r(240, 128, 240, 48, 1e5), SIM.w(240, 48, 304, 48),
    SIM.sq(112, 128, Vd, f), SIM.g(112, 192), SIM.w(112, 128, 160, 128), SIM.r(160, 128, 240, 128, Rg),
    'O 304 144 352 144 0', 'o 9 64 0 34 ' + SIM.n(Vd) + ' 9.765625E-5 0 -1', 'o 3 64 0 34 ' + SIM.n(Vs) + ' 9.765625E-5 1 -1');
  return lines.join('\n');
}
function simOpFilt(kind, G) {
  const n = SIM.n, L = [], c = (a, b, cc, d, v) => 'c ' + a + ' ' + b + ' ' + cc + ' ' + d + ' 0 ' + n(v) + ' 0';
  let fl, fh;
  if (kind === 'bp') { fl = 1 / (2 * Math.PI * G.v('r1') * G.v('c1')); fh = 1 / (2 * Math.PI * G.v('r2') * G.v('c2')); }
  else fl = fh = 1 / (2 * Math.PI * G.v('r') * G.v('c'));
  if (!(fl > 0 && fh > 0)) throw new Error('R, C');
  const fmin = fl / 10, fmax = fh * 10;
  L.push('$ 1 ' + n(1 / (fmax * 50)) + ' 6.499443210467817 50 5.0 50', '170 112 160 80 160 3 ' + n(fmin) + ' ' + n(fmax) + ' 1 ' + n(8 / fmin));
  const outX = kind === 'bp' ? 512 : 416;
  L.push('O ' + outX + ' 176 ' + (outX + 64) + ' 176 0');     // element 1: output marker
  if (kind === 'lp') L.push(SIM.r(112, 160, 208, 160, G.v('r')), c(208, 160, 208, 256, G.v('c')));
  else L.push(c(112, 160, 208, 160, kind === 'bp' ? G.v('c1') : G.v('c')), SIM.r(208, 160, 208, 256, kind === 'bp' ? G.v('r1') : G.v('r')));
  L.push(SIM.g(208, 256), SIM.w(208, 160, 272, 160), 'a 272 176 416 176 1 15 -15 1000000 0', SIM.w(416, 176, 416, 240), SIM.w(416, 240, 272, 240), SIM.w(272, 240, 272, 192));
  if (kind === 'bp') L.push(SIM.r(416, 176, 512, 176, G.v('r2')), c(512, 176, 512, 272, G.v('c2')), SIM.g(512, 272));
  L.push('o 0 128 0 34 0.5 9.765625E-5 0 -1', 'o 1 128 0 34 0.5 9.765625E-5 1 -1');
  return L.join('\n');
}
const SIM_MAP = {
  'opamp.alp': (G) => simOpFilt('lp', G), 'opamp.ahp': (G) => simOpFilt('hp', G), 'opamp.abp': (G) => simOpFilt('bp', G),
  'mosfet.mgn': (G) => (G.s('pos') === 'high' ? simMosHighN : simMosLow)(G, { vs: 'vs', vd: 'vd', rg: 'rg', f: 'f', rl: '' }),
  'mosfet.msn': (G) => simMosLow(G, { vs: 'vdd', rl: 'rl', vd: 'vgs', rg: '', f: 'f' }),
  'mosfet.mrn': (G) => simMosLow(G, { vd: 'vd', rg: '', f: '' }),
  'mosfet.mgp': (G) => simMosHighP(G, { vs: 'vs', vd: 'vd', rg: 'rg', f: 'f', rl: '' }),
  'mosfet.msp': (G) => simMosHighP(G, { vs: 'vdd', rl: 'rl', vd: 'vgs', rg: '', f: 'f' }),
  'mosfet.mrp': (G) => simMosHighP(G, { vd: 'vd', rg: '', f: '' }),
};

/* ---- CircuitJS export for the remaining schematic cards ----
   Conventions verified in CircuitJS: 't' base at point1, collector 16 above / emitter 16 below point2 (NPN, pnp=1); PNP (pnp=-1)
   has the emitter above. 'd'/'162'/'z' with flags 1: anode at point1, cathode at point2, forward drop follows. 'a' output at point2,
   flags 1 puts + on the upper input. 'v' point2 is +; waveform 1 sine, 2 square, 3 triangle (amplitude, bias, phase, duty). */
Object.assign(SIM, {
  cap: (a, b, c, d, v) => 'c ' + a + ' ' + b + ' ' + c + ' ' + d + ' 0 ' + SIM.n(v) + ' 0',
  ind: (a, b, c, d, v) => 'l ' + a + ' ' + b + ' ' + c + ' ' + d + ' 0 ' + SIM.n(v) + ' 0',
  dio: (a, b, c, d, vf) => 'd ' + a + ' ' + b + ' ' + c + ' ' + d + ' 1 ' + SIM.n(vf || 0.7),
  led: (a, b, c, d, vf) => '162 ' + a + ' ' + b + ' ' + c + ' ' + d + ' 1 ' + SIM.n(vf || 2) + ' 1 0 0 0.01',
  zen: (a, b, c, d, vz) => 'z ' + a + ' ' + b + ' ' + c + ' ' + d + ' 1 0.805904783 ' + SIM.n(vz),
  bjt: (bx, by, x, y, pnp, beta) => 't ' + bx + ' ' + by + ' ' + x + ' ' + y + ' 0 ' + (pnp ? -1 : 1) + ' -4 0.6 ' + SIM.n(beta || 100),
  mosb: (x, y, flags, vth, beta) => 'f ' + (x - 64) + ' ' + y + ' ' + x + ' ' + y + ' ' + flags + ' ' + SIM.n(vth) + (beta > 0 ? ' ' + SIM.n(beta) : ''),
  opa: (x, y, plusTop, vp, vn) => 'a ' + x + ' ' + y + ' ' + (x + 128) + ' ' + y + ' ' + (plusTop ? 1 : 0) + ' ' + SIM.n(vp) + ' ' + SIM.n(vn) + ' 1000000 0',
  // sources standing on (x,y): + terminal at (x,y), − at (x,y+64)
  wave: (x, y, wf, f, lo, hi, duty) => 'v ' + x + ' ' + (y + 64) + ' ' + x + ' ' + y + ' 0 ' + wf + ' ' + SIM.n(f) + ' ' + SIM.n((hi - lo) / 2) + ' ' + SIM.n((hi + lo) / 2) + ' 0 ' + SIM.n(duty == null ? 0.5 : duty),
  sine: (x, y, amp, f) => SIM.wave(x, y, 1, f, -amp, amp),
  out: (x, y) => 'O ' + x + ' ' + y + ' ' + (x + 48) + ' ' + y + ' 0',
  sc: (i, max, pos) => 'o ' + i + ' 64 0 34 ' + SIM.n(max || 5) + ' 9.765625E-5 ' + (pos || 0) + ' -1',
  // log sweep header + source for a frequency response; the source is element 0
  sweep: (fmin, fmax) => ['$ 1 ' + SIM.n(1 / (fmax * 50)) + ' 6.499443210467817 50 5.0 50', '170 112 160 80 160 3 ' + SIM.n(fmin) + ' ' + SIM.n(fmax) + ' 1 ' + SIM.n(8 / fmin)],
});
const V = SIM.val;   // V(G, id, default)

const SIM_MORE = {
  /* ---- resistor ---- */
  'resistor.dv': (G) => [SIM.head(), SIM.rail(208, 48, V(G, 'vin', 12)), SIM.r(208, 48, 208, 144, V(G, 'r1', 1e4)), SIM.r(208, 144, 208, 240, V(G, 'r2', 3300)), SIM.g(208, 240), SIM.out(208, 144)].join('\n'),
  'resistor.cs': (G) => { // low-side and high-side sensing side by side, 12 V supply, load sized for I_max
    const rs = V(G, 'r', 0.01), I = V(G, 'imax', 1), vs = 12, rl = Math.max((vs - I * rs) / I, 1e-3);
    return [SIM.head(), SIM.rail(208, 48, vs), SIM.r(208, 48, 208, 144, rl), SIM.r(208, 144, 208, 240, rs), SIM.g(208, 240), SIM.out(208, 144),
      SIM.rail(400, 48, vs), SIM.r(400, 48, 400, 144, rs), SIM.r(400, 144, 400, 240, rl), SIM.g(400, 240), SIM.out(400, 144)].join('\n'); },
  /* ---- capacitor ---- */
  'capacitor.rc': (G) => { // square wave with a period of 20 τ: full charge and discharge visible
    const R = V(G, 'r', 1e4), C = V(G, 'c', 1e-7), v = V(G, 'v', 5), f = 1 / (20 * R * C);
    return [SIM.head(f), SIM.wave(112, 160, 2, f, 0, v), SIM.out(208, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, R), SIM.cap(208, 160, 208, 256, C), SIM.g(208, 256), SIM.sc(0, v), SIM.sc(1, v, 1)].join('\n'); },
  'capacitor.ir': (G) => {
    const C = V(G, 'c', 4.7e-4), v = V(G, 'v', 24), rs = V(G, 'rs', 0.1), rl = G.v('rl') > 0 ? G.v('rl') : 0, tr = G.v('tr') > 0 ? G.v('tr') : 0, tau = (rs + rl) * C, per = 20 * Math.max(tau, tr / 4);
    const src = tr > 0 ? 'v 112 224 112 160 0 3 ' + SIM.n(1 / per) + ' ' + SIM.n(v / 2) + ' ' + SIM.n(v / 2) + ' 0 0.5' : SIM.wave(112, 160, 2, 1 / per, 0, v);
    return ['$ 1 ' + SIM.n(per / 4000) + ' 6.499443210467817 50 5.0 50', src, SIM.out(304, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, rs), rl > 0 ? SIM.r(208, 160, 304, 160, rl) : SIM.w(208, 160, 304, 160),
      SIM.cap(304, 160, 304, 256, C), SIM.g(304, 256), SIM.sc(0, v), SIM.sc(1, v, 1)].join('\n'); },
  'capacitor.hu': (G) => { // input drops out for half of a 10·t period; the diode keeps the capacitor from discharging back
    const P = V(G, 'p', 10), t = V(G, 't', 0.02), v1 = V(G, 'v1', 12), v2 = V(G, 'v2', 9), e = V(G, 'e', 90) / 100;
    const C = 2 * P * t / ((v1 * v1 - v2 * v2) * e), RL = v1 * v1 / P, f = 1 / (10 * t);
    return [SIM.head(f), SIM.wave(112, 160, 2, f, 0, v1), SIM.out(304, 160), SIM.g(112, 224), SIM.dio(112, 160, 208, 160, 0.7), SIM.cap(208, 160, 208, 256, C), SIM.g(208, 256),
      SIM.w(208, 160, 304, 160), SIM.r(304, 160, 304, 256, RL), SIM.g(304, 256), SIM.sc(0, v1), SIM.sc(1, v1, 1)].join('\n'); },
  /* ---- inductor ---- */
  'inductor.bb': (G) => { // buck: ideal switch node as a square source; boost: N-MOS low-side switch + diode
    const vin = V(G, 'vin', 12), vo = V(G, 'vo', 5), io = V(G, 'io', 2), f = V(G, 'f', 5e5), r = V(G, 'r', 30) / 100, RL = vo / io, C = 1e-4;
    if (G.s('tp') !== 'boost') {
      const D = vo / vin, L = (vin - vo) * D / (f * io * r);
      return ['$ 1 ' + SIM.n(1 / (f * 50)) + ' 6.499443210467817 50 5.0 50', SIM.wave(112, 160, 2, f, 0, vin, D), SIM.out(304, 160), SIM.g(112, 224), SIM.ind(112, 160, 240, 160, L), SIM.cap(240, 160, 240, 256, C), SIM.g(240, 256),
        SIM.w(240, 160, 304, 160), SIM.r(304, 160, 304, 256, RL), SIM.g(304, 256), SIM.sc(0, vin), SIM.sc(1, vo * 1.2, 1)].join('\n');
    }
    const D = 1 - vin / vo, L = vin * D / (f * (io / (1 - D)) * r);
    return ['$ 1 ' + SIM.n(1 / (f * 50)) + ' 6.499443210467817 50 5.0 50', SIM.wave(176, 176, 2, f, 0, 10, D), SIM.out(400, 160), SIM.g(176, 240), SIM.rail(112, 160, vin), SIM.ind(112, 160, 240, 160, L),
      SIM.mosb(240, 176, 0, 2, 2), SIM.g(240, 192), SIM.dio(240, 160, 336, 160, 0.7), SIM.cap(336, 160, 336, 256, C), SIM.g(336, 256),
      SIM.w(336, 160, 400, 160), SIM.r(400, 160, 400, 256, RL), SIM.g(400, 256), SIM.sc(0, 10), SIM.sc(1, vo * 1.2, 1)].join('\n'); },
  'inductor.lc': (G) => { // parallel tank driven through 1 kΩ by a log sweep around f_0
    const L = V(G, 'l', 1e-5), C = V(G, 'c', 1e-10), f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
    return [...SIM.sweep(f0 / 10, f0 * 10), SIM.out(208, 160), SIM.r(112, 160, 208, 160, 1000), SIM.ind(208, 160, 208, 256, L), SIM.w(208, 160, 272, 160), SIM.cap(272, 160, 272, 256, C),
      SIM.g(208, 256), SIM.g(272, 256), 'o 0 128 0 34 0.5 9.765625E-5 0 -1', 'o 1 128 0 34 0.5 9.765625E-5 1 -1'].join('\n'); },
  /* ---- diode ---- */
  'diode.led': (G) => { const vs = V(G, 'vs', 5), vf = V(G, 'vf', 2), i = V(G, 'i', 0.02), nL = Math.min(Math.max(Math.round(V(G, 'n', 1)), 1), 8), R = Math.max((vs - nL * vf) / i, 1e-3);
    const L = [SIM.head(), SIM.rail(208, 48, vs), SIM.r(208, 48, 208, 128, R)]; for (let k = 0; k < nL; k++) L.push(SIM.led(208, 128 + 64 * k, 208, 192 + 64 * k, vf)); L.push(SIM.g(208, 128 + 64 * nL)); return L.join('\n'); },
  'diode.zn': (G) => { const vmin = V(G, 'vmin', 12), vmax = V(G, 'vmax', 15), vz = V(G, 'vz', 5.1), il = V(G, 'ilmax', 0.02), iz = V(G, 'izmin', 0.005), Rs = (vmin - vz) / (il + iz);
    return [SIM.head(), SIM.rail(208, 48, vmax), SIM.r(208, 48, 208, 144, Rs > 0 ? Rs : 100), SIM.zen(208, 240, 208, 144, vz), SIM.g(208, 240), SIM.w(208, 144, 304, 144),
      SIM.r(304, 144, 304, 240, il > 0 ? vz / il : 1e9), SIM.g(304, 240), SIM.out(304, 144)].join('\n'); },
  'diode.tv': (G) => { // 20 µs surge pulses (10 kHz, 20 % duty) through the source resistance into the TVS and a 1 kΩ load
    const vs = V(G, 'vs', 1000), rs = V(G, 'rs', 2), vbr = V(G, 'vbr', 6.4), f = 1e4;
    return [SIM.head(f), SIM.wave(112, 160, 2, f, 0, vs, 0.2), SIM.out(304, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, rs), SIM.zen(208, 256, 208, 160, vbr), SIM.g(208, 256),
      SIM.w(208, 160, 304, 160), SIM.r(304, 160, 304, 256, 1000), SIM.g(304, 256), SIM.sc(0, vs), SIM.sc(1, vbr * 2, 1)].join('\n'); },
  /* ---- mosfet (remaining) ---- */
  'mosfet.mdn': (G) => simMosId(false, G), 'mosfet.mdp': (G) => simMosId(true, G),
  'mosfet.rp': (G) => { // flipped P-MOS (flags 9): drain on the battery side, source to the load, gate to GND
    const vb = V(G, 'vb', 12), i = V(G, 'i', 5), rds = V(G, 'rds', 0.015), vth = 2, beta = 1 / (rds * Math.max(vb - vth, 0.5));
    return [SIM.head(), SIM.rail(304, 48, vb), SIM.w(304, 48, 304, 144), SIM.mosb(304, 160, 9, vth, beta), SIM.r(304, 176, 304, 272, vb / i), SIM.g(304, 272),
      SIM.r(240, 160, 240, 256, 1e5), SIM.g(240, 256), SIM.out(304, 176)].join('\n'); },
  /* ---- transistor (NPN / PNP) ---- */
  'transistor.bsn': (G) => simBjtSw(false, G), 'transistor.bsp': (G) => simBjtSw(true, G),
  'transistor.icn': (G) => simBjtIc(false, G), 'transistor.icp': (G) => simBjtIc(true, G),
  'transistor.vdn': (G) => simBjtDiv(false, G), 'transistor.vdp': (G) => simBjtDiv(true, G),
  /* ---- op-amp ---- */
  'opamp.inv': (G) => simOpAmp(true, V(G, 'rin', 1e4), V(G, 'rf', 4.7e4), V(G, 'vin', 0.5), V(G, 'vp', 12), V(G, 'vn', -12)),
  'opamp.nin': (G) => simOpAmp(false, V(G, 'r1', 1e4), V(G, 'rf', 4.7e4), V(G, 'vin', 0.5), V(G, 'vp', 12), V(G, 'vn', -12)),
  'opamp.gd': (G) => { const inv = G.s('tp') === 'inv', g = V(G, 'g', 10), r = V(G, 'r', 1e4); return simOpAmp(inv, r, inv ? g * r : (g - 1) * r, 0.2, 12, -12); },
  'opamp.cmp': (G) => { // triangle 0…V+ against the reference: output toggles at V_ref
    const vref = V(G, 'vref', 2.5), vp = V(G, 'vp', 5), vn = G.v('vn') || 0, f = 100;
    return [SIM.head(f), SIM.wave(112, 176, 3, f, Math.min(vn, 0), vp), SIM.out(400, 192), SIM.g(112, 240), SIM.w(112, 176, 272, 176), SIM.opa(272, 192, true, vp, vn),
      SIM.rail(208, 208, vref), SIM.w(208, 208, 272, 208), SIM.sc(0, vp), SIM.sc(1, vp, 1)].join('\n'); },
  'opamp.sch': (G) => { const non = G.s('tp') !== 'inv', r1 = V(G, 'r1', 1e4), r2 = V(G, 'r2', 1e5), vref = V(G, 'vref', 2.5), vp = V(G, 'vp', 5), vn = G.v('vn') || 0, f = 100;
    const L = [SIM.head(f), SIM.wave(112, 176, 3, f, Math.min(vn, 0), vp), SIM.out(400, 192), SIM.g(112, 240)];
    if (non) L.push(SIM.r(112, 176, 240, 176, r1), SIM.w(240, 176, 272, 176), SIM.opa(272, 192, true, vp, vn), SIM.w(240, 176, 240, 112), SIM.r(240, 112, 400, 112, r2), SIM.w(400, 112, 400, 192), SIM.rail(208, 208, vref), SIM.w(208, 208, 272, 208));
    else L.push(SIM.w(112, 176, 272, 176), SIM.opa(272, 192, false, vp, vn), SIM.rail(144, 208, vref), SIM.r(144, 208, 240, 208, r1), SIM.w(240, 208, 272, 208), SIM.w(400, 192, 400, 272), SIM.r(400, 272, 240, 272, r2), SIM.w(240, 272, 240, 208));
    L.push(SIM.sc(0, vp), SIM.sc(1, vp, 1)); return L.join('\n'); },
  'opamp.sum': (G) => { const rf = V(G, 'rf', 1e4), L = [SIM.head(), SIM.out(400, 192), SIM.opa(272, 192, false, 12, -12), SIM.g(272, 208), SIM.w(208, 176, 240, 176), SIM.w(240, 176, 272, 176), SIM.w(240, 176, 240, 96), SIM.r(240, 96, 400, 96, rf), SIM.w(400, 96, 400, 192)];
    [['v1', 'r1', 128], ['v2', 'r2', 176], ['v3', 'r3', 224]].forEach(([v, r, y]) => { if (!(G.v(v) > 0 || G.v(v) < 0)) return; L.push(SIM.rail(96, y, G.v(v)), SIM.r(96, y, 208, y, V(G, r, 1e4))); if (y !== 176) L.push(SIM.w(208, y, 208, 176)); });
    return L.join('\n'); },
  'opamp.dif': (G) => { const r1 = V(G, 'r1', 1e4), r2 = V(G, 'r2', 1e5), v1 = G.v('v1') || 0, v2 = G.v('v2') || 0;
    return [SIM.head(), SIM.out(400, 192), SIM.opa(272, 192, false, 12, -12), SIM.rail(96, 176, v1), SIM.r(96, 176, 240, 176, r1), SIM.w(240, 176, 272, 176), SIM.w(240, 176, 240, 96), SIM.r(240, 96, 400, 96, r2), SIM.w(400, 96, 400, 192),
      SIM.rail(96, 240, v2), SIM.r(96, 240, 208, 240, r1), SIM.w(208, 240, 208, 208), SIM.w(208, 208, 272, 208), SIM.r(208, 208, 208, 304, r2), SIM.g(208, 304)].join('\n'); },
  'opamp.int': (G) => { // ±V_in square wave with half-period t: the output ramps by V_in·t/(RC) each half
    const R = V(G, 'r', 1e4), C = V(G, 'c', 1e-7), vin = V(G, 'vin', 1), t = V(G, 't', 5e-3), vp = V(G, 'vp', 12), f = 1 / (2 * t);
    return [SIM.head(f), SIM.wave(112, 176, 2, f, -vin, vin), SIM.out(400, 192), SIM.g(112, 240), SIM.r(112, 176, 240, 176, R), SIM.w(240, 176, 272, 176), SIM.opa(272, 192, false, vp, -vp), SIM.g(272, 208),
      SIM.w(240, 176, 240, 112), SIM.cap(240, 112, 400, 112, C), SIM.w(400, 112, 400, 192), SIM.sc(0, vin), SIM.sc(1, vp, 1)].join('\n'); },
};
function simMosId(p, G) { // square-law MOSFET with K from the datasheet point: fixed V_GS and V_DS rails
  const vgs = V(G, 'vgs', 5), vds = V(G, 'vds', 12), vth = V(G, 'vth', 2), idr = V(G, 'idr', 10), vgr = V(G, 'vgr', 4), beta = 2 * idr / Math.pow(Math.max(vgr - vth, 0.1), 2);
  return [SIM.head(), SIM.rail(304, 48, vds), SIM.w(304, 48, 304, 144), SIM.mosb(304, 160, p ? 1 : 0, vth, beta), SIM.g(304, 176), SIM.rail(240, 160, p ? vds - vgs : vgs)].join('\n');
}
function simBjtSw(pnp, G) { // 1 kHz drive: NPN low-side (load in the collector) or PNP high-side; base resistor as calculated, 10 kΩ base–emitter
  const vd = V(G, 'vd', pnp ? 0 : 3.3), vcc = V(G, 'vcc', 12), vbe = V(G, 'vbe', 0.8), vces = V(G, 'vces', 0.2), bf = V(G, 'bf', 10), hfe = V(G, 'hfe', 100), f = 1000;
  let ic = G.v('ic'); if (!(ic > 0)) { const rl = G.v('rl'); ic = rl > 0 ? (vcc - vces) / rl : 0.1; }
  const RL = (vcc - vces) / ic, vrb = pnp ? vcc - vd - vbe : vd - vbe, Rb = Math.max(vrb, 0.1) / (ic / bf);
  const L = [SIM.head(f), SIM.out(304, pnp ? 160 : 128), SIM.rail(304, 48, vcc)];
  if (!pnp) L.push(SIM.r(304, 48, 304, 128, RL), SIM.bjt(240, 144, 304, 144, false, hfe), SIM.g(304, 160), SIM.wave(112, 144, 2, f, 0, vd), SIM.g(112, 208), SIM.r(112, 144, 176, 144, Rb), SIM.w(176, 144, 240, 144), SIM.r(176, 144, 176, 240, 1e4), SIM.g(176, 240));
  else L.push(SIM.w(304, 48, 304, 128), SIM.bjt(240, 144, 304, 144, true, hfe), SIM.r(304, 160, 304, 256, RL), SIM.g(304, 256), SIM.wave(112, 144, 2, f, vd, vcc), SIM.g(112, 208), SIM.r(112, 144, 176, 144, Rb), SIM.w(176, 144, 240, 144), SIM.r(176, 144, 176, 48, 1e4), SIM.w(176, 48, 304, 48));
  L.push(SIM.sc(1, vcc, 1)); return L.join('\n');
}
function simBjtIc(pnp, G) { // fixed base current: V_in through R_B (PNP: measured down from the emitter rail)
  const vcc = V(G, 'vcc', 12), rc = V(G, 'rc', 470), vin = V(G, 'vin', 5), rb = V(G, 'rb', 1e5), re = G.v('re') > 0 ? G.v('re') : 0, b = V(G, 'b', 200);
  const L = [SIM.head(), SIM.out(304, pnp ? 160 : 128), SIM.rail(304, 48, vcc)];
  if (!pnp) L.push(SIM.r(304, 48, 304, 128, rc), SIM.bjt(240, 144, 304, 144, false, b), re > 0 ? SIM.r(304, 160, 304, 240, re) : SIM.w(304, 160, 304, 240), SIM.g(304, 240), SIM.rail(112, 144, vin));
  else L.push(re > 0 ? SIM.r(304, 48, 304, 128, re) : SIM.w(304, 48, 304, 128), SIM.bjt(240, 144, 304, 144, true, b), SIM.r(304, 160, 304, 240, rc), SIM.g(304, 240), SIM.rail(112, 144, vcc - vin));
  L.push(SIM.r(112, 144, 240, 144, rb)); return L.join('\n');
}
function simBjtDiv(pnp, G) { // divider bias; the PNP is the mirror image (R1 top, R2 bottom in both)
  const vcc = V(G, 'vcc', 12), r1 = V(G, 'r1', 4.7e4), r2 = V(G, 'r2', 1e4), rc = V(G, 'rc', 2200), re = V(G, 're', 1000), b = V(G, 'b', 200);
  const L = [SIM.head(), SIM.out(304, pnp ? 160 : 128), SIM.rail(304, 48, vcc), SIM.w(304, 48, 176, 48), SIM.r(176, 48, 176, 144, r1), SIM.r(176, 144, 176, 240, r2), SIM.g(176, 240), SIM.w(176, 144, 240, 144)];
  if (!pnp) L.push(SIM.r(304, 48, 304, 128, rc), SIM.bjt(240, 144, 304, 144, false, b), SIM.r(304, 160, 304, 240, re), SIM.g(304, 240));
  else L.push(SIM.r(304, 48, 304, 128, re), SIM.bjt(240, 144, 304, 144, true, b), SIM.r(304, 160, 304, 240, rc), SIM.g(304, 240));
  return L.join('\n');
}
function simOpAmp(inv, rin, rf, vin, vp, vn) { // 1 kHz sine of amplitude V_in into an inverting or non-inverting stage
  const f = 1000, L = [SIM.head(f), SIM.sine(112, 176, vin, f), SIM.out(400, 192), SIM.g(112, 240)];
  if (inv) L.push(SIM.r(112, 176, 240, 176, rin), SIM.w(240, 176, 272, 176), SIM.opa(272, 192, false, vp, vn), SIM.g(272, 208), SIM.w(240, 176, 240, 112), SIM.r(240, 112, 400, 112, rf), SIM.w(400, 112, 400, 192));
  else L.push(SIM.w(112, 176, 272, 176), SIM.opa(272, 192, true, vp, vn), SIM.w(272, 208, 224, 208), SIM.r(224, 208, 224, 304, rin), SIM.g(224, 304), SIM.w(240, 208, 240, 256), SIM.r(240, 256, 400, 256, rf), SIM.w(400, 256, 400, 192), SIM.w(224, 208, 240, 208));
  const pk = Math.max(Math.abs(vp), Math.abs(vn)); L.push(SIM.sc(0, vin * 1.2), SIM.sc(1, pk, 1)); return L.join('\n');
}
function simOpSk(lp, G) {
  const R1 = G.v('r1'), R2 = G.v('r2'), C1 = G.v('c1'), C2 = G.v('c2'); if (!(R1 > 0 && R2 > 0 && C1 > 0 && C2 > 0)) throw new Error('R, C');
  const fc = 1 / (2 * Math.PI * Math.sqrt(R1 * R2 * C1 * C2)), P = (k, ...a) => (k === 'R' ? SIM.r : SIM.cap)(...a);
  const s1 = lp ? ['R', R1] : ['C', C1], s2 = lp ? ['R', R2] : ['C', C2], g = lp ? ['C', C2] : ['R', R2], fb = lp ? ['C', C1] : ['R', R1];
  return [...SIM.sweep(fc / 10, fc * 10), SIM.out(448, 176), P(s1[0], 112, 160, 208, 160, s1[1]), P(s2[0], 208, 160, 304, 160, s2[1]), SIM.w(304, 160, 320, 160), SIM.opa(320, 176, true, 15, -15),
    P(g[0], 304, 160, 304, 256, g[1]), SIM.g(304, 256), SIM.w(208, 160, 208, 96), P(fb[0], 208, 96, 448, 96, fb[1]), SIM.w(448, 96, 448, 176),
    SIM.w(320, 192, 320, 240), SIM.w(320, 240, 448, 240), SIM.w(448, 240, 448, 176), 'o 0 128 0 34 0.5 9.765625E-5 0 -1', 'o 1 128 0 34 0.5 9.765625E-5 1 -1'].join('\n');
}
SIM_MORE['opamp.skl'] = (G) => simOpSk(true, G); SIM_MORE['opamp.skh'] = (G) => simOpSk(false, G);
Object.assign(SIM_MAP, SIM_MORE);

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
      out.push(id('B') + ' ' + b() + ' 0 V=limit(' + f(t[8] || 1e6) + '*(V(' + np + ')-V(' + nm + ')), ' + f(t[7]) + ', ' + f(t[6]) + ')');
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

/* ---- representative circuits for the remaining (tabular / thermal) cards, so every card can be opened in a simulator ---- */
const SIM_REST = {
  'resistor.pw': (G) => [SIM.head(), SIM.rail(208, 48, V(G, 'v', 5)), SIM.r(208, 48, 208, 144, V(G, 'r', 1e4)), SIM.g(208, 144), SIM.out(208, 48)].join('\n'),
  'resistor.es': (G) => [SIM.head(), SIM.rail(208, 48, 5), SIM.r(208, 48, 208, 144, V(G, 'v', 1e3)), SIM.g(208, 144), SIM.out(208, 48)].join('\n'),
  'capacitor.es': (G) => { const C = V(G, 'v', 1e-6), fc = 1 / (2 * Math.PI * 1e3 * C); return [...SIM.sweep(fc / 10, fc * 10), SIM.out(208, 160), SIM.r(112, 160, 208, 160, 1e3), SIM.cap(208, 160, 208, 256, C), SIM.g(208, 256), 'o 0 128 0 34 0.5 9.765625E-5 0 -1', 'o 1 128 0 34 0.5 9.765625E-5 1 -1'].join('\n'); },
  'inductor.es': (G) => { const L = V(G, 'v', 1e-5), fc = 1e3 / (2 * Math.PI * L); return [...SIM.sweep(fc / 10, fc * 10), SIM.out(208, 160), SIM.r(112, 160, 208, 160, 1e3), SIM.ind(208, 160, 208, 256, L), SIM.g(208, 256), 'o 0 128 0 34 0.5 9.765625E-5 0 -1', 'o 1 128 0 34 0.5 9.765625E-5 1 -1'].join('\n'); },
  'capacitor.z': (G) => { // ESL–ESR–C series model driven through 10 Ω: the node voltage follows |Z| and dips at the SRF
    const C = V(G, 'c', 1e-7), esr = V(G, 'esr', 0.01), esl = V(G, 'esl', 1e-9), f = V(G, 'f', 1e6), f0 = 1 / (2 * Math.PI * Math.sqrt(esl * C)), fmin = Math.min(f, f0) / 30, fmax = Math.min(Math.max(f, f0) * 30, 5e9);
    return [...SIM.sweep(fmin, fmax), SIM.out(208, 160), SIM.r(112, 160, 208, 160, 10), SIM.ind(208, 160, 208, 208, esl), SIM.r(208, 208, 208, 256, esr), SIM.cap(208, 256, 208, 304, C), SIM.g(208, 304), 'o 0 128 0 34 0.5 9.765625E-5 0 -1', 'o 1 128 0 34 0.5 9.765625E-5 1 -1'].join('\n'); },
  'capacitor.dr': (G) => { const vdc = V(G, 'vdc', 12), vac = V(G, 'vac', 0.5), f = 1000; // DC bias plus AC ripple across the capacitor
    return [SIM.head(f), 'v 112 224 112 160 0 1 ' + SIM.n(f) + ' ' + SIM.n(vac * Math.SQRT2) + ' ' + SIM.n(vdc) + ' 0 0.5', SIM.out(208, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, 1), SIM.cap(208, 160, 208, 256, 1e-6), SIM.g(208, 256), SIM.sc(0, vdc * 1.2), SIM.sc(1, vdc * 1.2, 1)].join('\n'); },
  'capacitor.rl': (G) => { const i = V(G, 'i', 1), esr = V(G, 'esr', 0.1), f = 1e5, C = 1e-4, z = Math.sqrt(esr * esr + 1 / Math.pow(2 * Math.PI * f * C, 2)); // ripple current I_rms through ESR + C at 100 kHz
    return [SIM.head(f), SIM.sine(112, 160, i * Math.SQRT2 * z, f), SIM.out(208, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, 1e-3), SIM.r(208, 160, 208, 208, esr), SIM.cap(208, 208, 208, 256, C), SIM.g(208, 256), SIM.sc(0, i * z * 2), SIM.sc(1, i * z * 2, 1)].join('\n'); },
  'inductor.en': (G) => { const L = V(G, 'l', 1e-5), i = V(G, 'i', 1), f = V(G, 'f', 1e5), dcr = V(G, 'dcr', 0.05), z = Math.sqrt(Math.pow(2 * Math.PI * f * L, 2) + dcr * dcr); // sine chosen for the given peak current
    return [SIM.head(f), SIM.sine(112, 160, i * z, f), SIM.out(208, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, dcr), SIM.ind(208, 160, 208, 256, L), SIM.g(208, 256), SIM.sc(0, i * z * 1.2), SIM.sc(1, i * z * 1.2, 1)].join('\n'); },
  'inductor.tr': (G) => { const i = V(G, 'i', 3), dcr = V(G, 'dcr', 0.02); return [SIM.head(), SIM.rail(208, 48, i * dcr), SIM.r(208, 48, 208, 144, dcr), SIM.ind(208, 144, 208, 240, 1e-5), SIM.g(208, 240), SIM.out(208, 48)].join('\n'); },
  'inductor.al': (G) => { const L = V(G, 'l', 1e-4), i = V(G, 'i', 3), f = 1e4, vin = 4 * f * L * i; // square wave sized so the triangular current peaks at I
    return [SIM.head(f), SIM.wave(112, 160, 2, f, -vin, vin), SIM.out(208, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, 1e-3), SIM.ind(208, 160, 208, 256, L), SIM.g(208, 256), SIM.sc(0, vin * 1.2), SIM.sc(1, vin * 1.2, 1)].join('\n'); },
  'inductor.ac': (G) => { // Wheeler: L[µH] = r²·n² / (9r + 10·len) with r, len in inches; shown resonating with 100 pF
    const r = V(G, 'd', 10) / 2 / 25.4, len = V(G, 'len', 10) / 25.4, n = V(G, 'n', 10), L = (r * r * n * n / (9 * r + 10 * len)) * 1e-6, C = 1e-10, f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
    return [...SIM.sweep(f0 / 10, f0 * 10), SIM.out(208, 160), SIM.r(112, 160, 208, 160, 1e3), SIM.ind(208, 160, 208, 256, L), SIM.w(208, 160, 272, 160), SIM.cap(272, 160, 272, 256, C), SIM.g(208, 256), SIM.g(272, 256), 'o 0 128 0 34 0.5 9.765625E-5 0 -1', 'o 1 128 0 34 0.5 9.765625E-5 1 -1'].join('\n'); },
  'diode.pw': (G) => { const i = V(G, 'i', 3), vf = V(G, 'vf', 0.45), d = V(G, 'd', 100) / 100, f = 1000, vs = 5, R = Math.max((vs - vf) / i, 1e-3); // pulsed forward current with the given duty
    return [SIM.head(f), SIM.wave(112, 160, 2, f, 0, vs, d), SIM.out(208, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, R), SIM.dio(208, 160, 208, 256, vf), SIM.g(208, 256), SIM.sc(0, vs), SIM.sc(1, vf * 2, 1)].join('\n'); },
  'diode.lk': (G) => { const vr = V(G, 'vr', 40); return [SIM.head(), SIM.rail(208, 48, vr), SIM.r(208, 48, 208, 144, 1e3), SIM.dio(208, 240, 208, 144, 0.7), SIM.g(208, 240), SIM.out(208, 144)].join('\n'); },
  'diode.rr': (G) => { const v = V(G, 'v', 400), f = V(G, 'f', 1e5); // hard switching ±V through 100 Ω (the simulator's diode is ideal: no recovery charge)
    return [SIM.head(f), SIM.wave(112, 160, 2, f, -v, v), SIM.out(208, 160), SIM.g(112, 224), SIM.r(112, 160, 208, 160, 100), SIM.dio(208, 160, 208, 256, 0.7), SIM.g(208, 256), SIM.sc(0, v), SIM.sc(1, v, 1)].join('\n'); },
  'transistor.pdn': (G) => simBjtPd(false, G), 'transistor.pdp': (G) => simBjtPd(true, G),
  'opamp.bw': (G) => { const gbw = V(G, 'gbw', 1e6), g = V(G, 'g', 10), vpk = V(G, 'vpk', 5), f = gbw / g / 10, r1 = 1e3; // gain stage driven at a tenth of its closed-loop corner (ideal op-amp model)
    return [SIM.head(f), SIM.sine(112, 176, vpk / g, f), SIM.out(400, 192), SIM.g(112, 240), SIM.w(112, 176, 272, 176), SIM.opa(272, 192, true, 15, -15), SIM.w(272, 208, 224, 208), SIM.r(224, 208, 224, 304, r1), SIM.g(224, 304), SIM.w(240, 208, 240, 256), SIM.r(240, 256, 400, 256, Math.max(g - 1, 1e-3) * r1), SIM.w(400, 256, 400, 192), SIM.w(224, 208, 240, 208), SIM.sc(0, vpk / g * 1.2), SIM.sc(1, vpk * 1.2, 1)].join('\n'); },
  'opamp.dc': (G) => { // offset as a DC source in series with the + input, bias currents injected into both inputs; output = V_OS·(1+R_f/R_in) + I_B·R_f
    const rin = V(G, 'rin', 1e4), rf = V(G, 'rf', 1e5), vos = V(G, 'vos', 1) * 1e-3, ib = V(G, 'ib', 50) * 1e-9;
    return [SIM.head(), SIM.out(400, 192), SIM.rail(208, 176, vos), SIM.w(208, 176, 272, 176), SIM.opa(272, 192, true, 15, -15), SIM.w(272, 208, 240, 208), SIM.r(240, 208, 240, 304, rin), SIM.g(240, 304), SIM.w(240, 208, 240, 112), SIM.r(240, 112, 400, 112, rf), SIM.w(400, 112, 400, 192),
      'i 176 304 176 208 0 ' + SIM.n(ib), SIM.g(176, 304), SIM.w(176, 208, 240, 208)].join('\n'); },
};
function simBjtPd(pnp, G) { // V_CE and I_C set by the collector rail and a 10 Ω collector resistor; base pulsed with the conduction ratio
  const ic = V(G, 'ic', 0.5), vce = V(G, 'vce', 5), d = V(G, 'd', 100) / 100, f = 1000, vcc = vce + ic * 10, rb = (5 - 0.7) / (ic / 100);
  const L = [SIM.head(f), SIM.out(304, pnp ? 160 : 128), SIM.rail(304, 48, vcc)];
  if (!pnp) L.push(SIM.r(304, 48, 304, 128, 10), SIM.bjt(240, 144, 304, 144, false, 100), SIM.g(304, 160), SIM.wave(112, 144, 2, f, 0, 5, d), SIM.g(112, 208), SIM.r(112, 144, 240, 144, rb));
  else L.push(SIM.w(304, 48, 304, 128), SIM.bjt(240, 144, 304, 144, true, 100), SIM.r(304, 160, 304, 256, 10), SIM.g(304, 256), SIM.wave(112, 144, 2, f, vcc - 5, vcc, d), SIM.g(112, 208), SIM.r(112, 144, 240, 144, rb));
  L.push(SIM.sc(1, vcc, 1)); return L.join('\n');
}
Object.assign(SIM_MAP, SIM_REST);

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
      const gp = onGnd(cx1, plusTop ? cy1 - 16 : cy1 + 16), gn = onGnd(cx1, plusTop ? cy1 + 16 : cy1 - 16), np = gp ? '0' : 'op' + n + '_p', nm = gn ? '0' : 'op' + n + '_n', no = 'op' + n + '_o';
      if (!gp) flag([x1, plusTop ? y1 - 32 : y1 + 32], np); if (!gn) flag([x1, plusTop ? y1 + 32 : y1 - 32], nm); flag([x2, y1], no);
      out.push('LINE Normal ' + x1 + ' ' + (y1 - 64) + ' ' + x1 + ' ' + (y1 + 64), 'LINE Normal ' + x1 + ' ' + (y1 - 64) + ' ' + x2 + ' ' + y1, 'LINE Normal ' + x1 + ' ' + (y1 + 64) + ' ' + x2 + ' ' + y1);
      out.push('TEXT ' + (x1 + 6) + ' ' + (plusTop ? y1 - 32 : y1 + 32) + ' Left 2 ;+', 'TEXT ' + (x1 + 6) + ' ' + (plusTop ? y1 + 32 : y1 - 32) + ' Left 2 ;-');
      const cx = Math.round((x1 + x2) / 2 / 16) * 16 - 16, org = [cx, y1 - 56];
      symbol('bv', org, 'R0', id('B'), 'V=limit(' + f(t[8] || 1e6) + '*(V(' + np + ')-V(' + nm + ')),' + f(t[7]) + ',' + f(t[6]) + ')');
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
