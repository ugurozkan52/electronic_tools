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
    part(kind, x, y, rot, name, value) {
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
      if (rot !== 0) { b.text(x + 16, y - 2, name, 'start', 'nm'); b.text(x + 16, y + 13, value, 'start', 'vl'); }
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
    s.term(14, 110, 'Vdrv', 'l', sv(G, 'vd', 'V')); s.wire([14, 110], [50, 110]); s.part('R', 80, 110, 0, 'Rb', iv(items, 1)); s.wire([110, 110], [170, 110]); s.dot(140, 110);
    s.text(140, 104, iv(items, 3) && 'I_B ' + iv(items, 3), 'middle', 'vl');
    s.wire([140, 30], [140, 50]); s.part('R', 140, 80, 90, 'Rbe', '10 kΩ'); s.dot(140, 30);
    s.text(0, 246, tt('Yüksek taraf: emiter besleme tarafında', 'High-side: emitter on the supply side'), 'start', 'vl');
  }
  return s.svg;
}
function schBjtIc(G, items) {
  const s = newSch(300, 270);
  s.wire([210, 30], [250, 30]); s.term(250, 30, 'Vcc', 'r', sv(G, 'vcc', 'V')); s.part('R', 210, 60, 90, 'Rc', sv(G, 'rc', 'Ω'));
  const q = s.bjt(170, 130, false, false, 'Q1'); s.wire([210, 30], q.top); s.wire(q.bot, [210, 170]); s.part('R', 210, 200, 90, 'Re', sv(G, 're', 'Ω')); s.gnd(210, 230);
  s.text(226, 92, iv(items, 0) && 'I_C ' + iv(items, 0), 'start', 'vl'); s.text(262, 138, iv(items, 2) && 'V_CE ' + iv(items, 2), 'start', 'vl');
  s.term(14, 130, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 130], [50, 130]); s.part('R', 80, 130, 0, 'Rb', sv(G, 'rb', 'Ω')); s.wire([110, 130], [170, 130]);
  s.text(140, 124, iv(items, 3) && 'I_B ' + iv(items, 3), 'middle', 'vl');
  return s.svg;
}
function schBjtDiv(G, items) {
  const s = newSch(300, 270);
  s.wire([60, 30], [250, 30]); s.term(250, 30, 'Vcc', 'r', sv(G, 'vcc', 'V')); s.dot(210, 30);
  s.wire([60, 30], [60, 50]); s.part('R', 60, 80, 90, 'R1', sv(G, 'r1', 'Ω')); s.dot(60, 130); s.part('R', 60, 180, 90, 'R2', sv(G, 'r2', 'Ω')); s.gnd(60, 210);
  s.part('R', 210, 60, 90, 'Rc', sv(G, 'rc', 'Ω')); const q = s.bjt(170, 130, false, false, 'Q1');
  s.wire([60, 130], [170, 130]); s.wire(q.bot, [210, 170]); s.part('R', 210, 200, 90, 'Re', sv(G, 're', 'Ω')); s.gnd(210, 230);
  s.text(226, 92, iv(items, 0) && 'I_C ' + iv(items, 0), 'start', 'vl'); s.text(262, 138, iv(items, 1) && 'V_CE ' + iv(items, 1), 'start', 'vl'); s.text(226, 172, iv(items, 3) && 'V_E ' + iv(items, 3), 'start', 'vl');
  return s.svg;
}

/* ---- MOSFET ---- */
function schMosGate(G, items) {
  const n = G.s('tp') === 'n', hi = G.s('pos') === 'high', s = newSch(340, 260), vs = sv(G, 'vs', 'V'), vg = iv(items, 0);
  if (n && !hi) {
    s.wire([210, 30], [250, 30]); s.term(250, 30, 'Vs', 'r', vs); s.part('R', 210, 60, 90, tt('Yük', 'Load')); const m = s.mos(170, 130, false, false, 'N-MOS'); s.wire([210, 30], m.top); s.wire(m.bot, [210, 175]); s.gnd(210, 175);
    s.term(14, 130, 'Vdrv', 'l', sv(G, 'vd', 'V')); s.wire([14, 130], [50, 130]); s.part('R', 80, 130, 0, 'Rg', sv(G, 'rg', 'Ω')); s.wire([110, 130], [170, 130]); s.dot(140, 130);
    s.text(140, 122, vg && 'V_GS ' + vg, 'middle', 'vl'); s.wire([140, 130], [140, 150]); s.part('R', 140, 180, 90, 'Rgs', '10–100 kΩ'); s.gnd(140, 210);
    s.text(0, 246, tt('Düşük taraf', 'Low-side'), 'start', 'vl');
  } else if (!n && hi) {
    s.wire([140, 30], [250, 30]); s.term(250, 30, 'Vs', 'r', vs);
    const m = s.mos(170, 110, true, true, 'P-MOS'); s.wire([210, 30], m.top); s.dot(210, 30); s.wire(m.bot, [210, 150]); s.part('R', 210, 180, 90, tt('Yük', 'Load')); s.gnd(210, 210);
    s.term(14, 110, 'Vdrv', 'l', sv(G, 'vd', 'V')); s.wire([14, 110], [50, 110]); s.part('R', 80, 110, 0, 'Rg', sv(G, 'rg', 'Ω')); s.wire([110, 110], [170, 110]); s.dot(140, 110);
    s.text(140, 102, vg && '|V_GS| ' + vg, 'middle', 'vl'); s.wire([140, 30], [140, 50]); s.part('R', 140, 80, 90, 'Rgs', '10–100 kΩ'); s.dot(140, 30);
    s.text(0, 246, tt('Yüksek taraf: gate 0 V → açık', 'High-side: gate 0 V → on'), 'start', 'vl');
  } else if (n && hi) {
    s.wire([210, 30], [250, 30]); s.term(250, 30, 'Vs', 'r', vs); const m = s.mos(170, 130, false, false, 'N-MOS'); s.wire([210, 30], m.top); s.wire(m.bot, [210, 170]); s.dot(210, 170); s.part('R', 210, 200, 90, tt('Yük', 'Load')); s.gnd(210, 230);
    s.box(-8, 95, 78, 70, tt('Gate sürücü', 'Gate driver'), 'V_G > ' + (vs || 'Vs')); s.wire([70, 130], [80, 130]); s.part('R', 100, 130, 0, 'Rg', sv(G, 'rg', 'Ω')); s.wire([130, 130], [170, 130]); s.dot(145, 130);
    s.wire([145, 130], [145, 150]); s.part('R', 145, 180, 90, 'Rgs', '10–100 kΩ'); s.wire([145, 210], [145, 235], [210, 235]); s.dot(210, 235);
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
  s.wire([140, 130], [140, 150]); s.part('R', 140, 180, 90, 'Rgs', '10–100 kΩ'); s.gnd(140, 210);
  if (!sw) s.text(226, 92, iv(items, 2) && 'I_g(pk) ' + iv(items, 2), 'start', 'vl');
  return s.svg;
};
function schRevPol(G, items) {
  const s = newSch(300, 260);
  s.term(210, 24, 'Vbat', null, sv(G, 'vb', 'V')); const m = s.mos(170, 130, true, false, 'P-MOS'); s.wire([210, 24], m.top);
  s.text(262, 138, 'R_DS(on) ' + sv(G, 'rds', 'Ω'), 'start', 'vl'); s.text(262, 152, iv(items, 0) && tt('düşüm ', 'drop ') + iv(items, 0), 'start', 'vl');
  s.wire(m.bot, [210, 170]); s.part('R', 210, 200, 90, tt('Yük', 'Load'), sv(G, 'i', 'A')); s.gnd(210, 230);
  s.wire([170, 130], [140, 130]); s.dot(140, 130); s.wire([140, 130], [140, 150]); s.part('R', 140, 180, 90, 'Rg', '100 kΩ'); s.gnd(140, 210);
  s.text(0, 252, tt('Drain batarya tarafında, source yük tarafında; gate GND\'ye çekilir', 'Drain on the battery side, source on the load side; gate pulled to GND'), 'start', 'vl');
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
  const s = newSch(320, 175), range = sv(G, 'vmin', 'V') && sv(G, 'vmax', 'V') ? sv(G, 'vmin', 'V') + ' … ' + sv(G, 'vmax', 'V') : '';
  s.term(14, 50, 'Vin', 'l', range); s.wire([14, 50], [50, 50]); s.part('R', 80, 50, 0, 'Rs', iv(items, 1)); s.wire([110, 50], [250, 50]); s.dot(150, 50); s.wire([150, 50], [150, 70]); s.part('Z', 150, 100, 90, 'Dz', sv(G, 'vz', 'V')); s.wire([150, 130], [150, 140]); s.gnd(150, 140);
  s.dot(220, 50); s.wire([220, 50], [220, 70]); s.part('R', 220, 100, 90, tt('Yük', 'Load'), sv(G, 'ilmax', 'A') && 'I_L ≤ ' + sv(G, 'ilmax', 'A')); s.wire([220, 130], [220, 140]); s.gnd(220, 140); s.term(250, 50, 'Vout', 'r', sv(G, 'vz', 'V'));
  s.text(150, 158, iv(items, 2) && 'I_Z(max) ' + iv(items, 2), 'middle', 'vl');
  return s.svg;
}
function schTvs(G, items) {
  const s = newSch(300, 190);
  s.wire([30, 60], [30, 71]); s.source(30, 85); s.wire([30, 99], [30, 150]); s.gnd(30, 150); s.text(48, 88, tt('Sürge', 'Surge'), 'start', 'nm'); s.text(48, 102, sv(G, 'vs', 'V'), 'start', 'vl');
  s.wire([30, 60], [60, 60]); s.part('R', 90, 60, 0, 'Rs', sv(G, 'rs', 'Ω')); s.wire([120, 60], [215, 60]); s.dot(150, 60); s.wire([150, 60], [150, 70]); s.part('TVS', 150, 100, 90, 'TVS', sv(G, 'vbr', 'V') && 'V_BR ' + sv(G, 'vbr', 'V')); s.wire([150, 130], [150, 150]); s.dot(150, 150);
  s.wire([215, 60], [215, 75]); s.box(190, 75, 60, 60, tt('Yük', 'Load')); s.wire([215, 135], [215, 150]); s.wire([30, 150], [215, 150]);
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
  s.text(80, 14, tt('Düşük taraf algılama', 'Low-side sensing'), 'middle', 'nm'); s.term(80, 30, 'Vs'); s.wire([80, 30], [80, 50]); s.box(58, 50, 44, 44, tt('Yük', 'Load'), isFinite(I) ? I + ' A' : ''); s.wire([80, 94], [80, 110]); s.part('R', 80, 140, 90, 'Rs', rs); s.gnd(80, 170); s.dot(80, 110);
  s.text(112, 150, vsen && 'Vsense ' + vsen, 'start', 'vl');
  s.text(320, 14, tt('Yüksek taraf algılama', 'High-side sensing'), 'middle', 'nm'); s.term(320, 30, 'Vs'); s.wire([320, 30], [320, 40]); s.part('R', 320, 70, 90, 'Rs', rs); s.wire([320, 100], [320, 115]); s.box(298, 115, 44, 44, tt('Yük', 'Load'), isFinite(I) ? I + ' A' : ''); s.wire([320, 159], [320, 170]); s.gnd(320, 170);
  s.text(352, 82, vsen && 'Vsense ' + vsen, 'start', 'vl');
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
  const s = newSch(300, 175);
  s.term(14, 40, 'Vin', 'l', sv(G, 'v1', 'V')); s.wire([14, 40], [60, 40]); s.part('D', 90, 40, 0, 'D'); s.wire([120, 40], [230, 40]); s.dot(150, 40); s.wire([150, 40], [150, 55]); s.part('C', 150, 85, 90, 'C hold-up', iv(items, 0)); s.wire([150, 115], [150, 130]); s.wire([150, 130], [230, 130]); s.gnd(150, 130);
  s.wire([230, 40], [230, 55]); s.box(205, 55, 50, 55, tt('Yük', 'Load'), sv(G, 'p', 'W')); s.wire([230, 110], [230, 130]);
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
  s.wire(oa.plus, [190, oa.plus[1]], [190, 165]); s.gnd(190, 165); s.text(250, 100, iv(items, 0) && 'A_v = ' + iv(items, 0), 'middle', 'nm');
  return s.svg;
}
function schOpNon(G, items) {
  const s = newSch(380, 230), oa = s.opamp(210, 116, true);
  s.term(14, 100, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 100], [210, 100]);
  s.wire(oa.minus, [180, 132]); s.dot(180, 132); s.wire([180, 132], [130, 132]); s.part('R', 130, 162, 90, 'R1', sv(G, 'r1', 'Ω')); s.gnd(130, 192);
  s.wire([180, 132], [180, 190], [220, 190]); s.part('R', 250, 190, 0, 'Rf', sv(G, 'rf', 'Ω')); s.wire([280, 190], [320, 190], [320, 116]); s.wire(oa.out, [320, 116]); s.dot(320, 116); s.wire([320, 116], [350, 116]); s.term(350, 116, 'Vout', 'r', iv(items, 2));
  s.text(250, 80, iv(items, 0) && 'A_v = ' + iv(items, 0), 'middle', 'nm');
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
  s.text(250, inv ? 100 : 80, iv(items, 2) && 'A_v = ' + iv(items, 2), 'middle', 'nm');
  return s.svg;
}
function schOpCmp(G, items) {
  const s = newSch(340, 190), oa = s.opamp(190, 90, true);
  s.term(14, 74, 'Vin', 'l', sv(G, 'vin', 'V')); s.wire([14, 74], [190, 74]); s.term(14, 106, 'Vref', 'l', sv(G, 'vref', 'V')); s.wire([14, 106], [190, 106]); s.wire(oa.out, [300, 90]); s.term(300, 90, 'Vout', 'r', iv(items, 0));
  s.text(0, 175, tt('Açık çevrim: Vin > Vref → çıkış üst ray, Vin < Vref → alt ray', 'Open loop: Vin > Vref → output at the upper rail, Vin < Vref → lower rail'), 'start', 'vl');
  return s.svg;
}
function schOpSchmitt(G, items) {
  const non = G.s('tp') !== 'inv', s = newSch(380, 240), th = iv(items, 1) && iv(items, 2) ? tt('Eşikler: ', 'Thresholds: ') + iv(items, 2) + ' / ' + iv(items, 1) : '';
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
    s.text(0, 232, tt('Evirici Schmitt: giriş − uçta, R1/R2 bölücüsü + uçta', 'Inverting Schmitt: input on the − input, R1/R2 divider on the + input'), 'start', 'vl'); s.text(0, 246, th, 'start', 'nm');
  }
  return s.svg;
}
function schOpSum(G, items) {
  const s = newSch(380, 200), oa = s.opamp(230, 116, false);
  [['V1', 40, 'v1', 'r1'], ['V2', 80, 'v2', 'r2'], ['V3', 120, 'v3', 'r3']].forEach(([n, y, vid, id]) => { s.term(14, y, n, 'l', sv(G, vid, 'V')); s.wire([14, y], [40, y]); s.part('R', 70, y, 0, id.toUpperCase(), sv(G, id, 'Ω')); s.wire([100, y], [140, y]); });
  s.wire([140, 20], [140, 120]); s.wire([140, 100], [230, 100]); s.dot(140, 100);
  s.wire([140, 20], [180, 20]); s.part('R', 210, 20, 0, 'Rf', sv(G, 'rf', 'Ω')); s.wire([240, 20], [340, 20], [340, 116]); s.wire(oa.out, [340, 116]); s.dot(340, 116); s.wire([340, 116], [366, 116]); s.term(366, 116, 'Vout', 'r', iv(items, 0));
  s.wire(oa.plus, [210, oa.plus[1]], [210, 168]); s.gnd(210, 168);
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

const SCH_BIND = {
  'transistor.bs': schBjtSwitch, 'transistor.ic': schBjtIc, 'transistor.vd': schBjtDiv,
  'mosfet.mg': schMosGate, 'mosfet.ms': schMosLow('sw'), 'mosfet.mr': schMosLow('rg'), 'mosfet.rp': schRevPol,
  'diode.led': schLed, 'diode.zn': schZener, 'diode.tv': schTvs, 'resistor.dv': schDivider, 'resistor.cs': schShunt,
  'capacitor.rc': schRc, 'capacitor.hu': schHold, 'inductor.bb': schConverter,
  'opamp.inv': schOpInv, 'opamp.nin': schOpNon, 'opamp.gd': schOpGd, 'opamp.cmp': schOpCmp, 'opamp.sch': schOpSchmitt, 'opamp.sum': schOpSum, 'opamp.dif': schOpDiff, 'opamp.int': schOpInt,
};
Object.assign(SCH_MAP, SCH_BIND);
