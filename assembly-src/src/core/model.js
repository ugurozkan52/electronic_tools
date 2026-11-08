'use strict';
// Intermediate board model shared by the IPC-2581 reader and the pcbdata builder.
// Coordinates: mm, Y down (iBOM convention).

const G = require('./geometry');

function newModel() {
  return {
    edges: [],
    silk: { F: [], B: [] },
    fab: { F: [], B: [] },
    tracks: { F: [], B: [] },
    inner: [], // [{ name, tracks, zones }] in stackup order
    zones: { F: [], B: [] },
    comps: {},
    freePads: { F: [], B: [] },
    holes: [],
    nets: new Set(),
    warnings: [],
    info: { componentAttrs: true, source: 'ipc2581' },
  };
}

function ensureComp(model, ref) {
  if (!model.comps[ref]) model.comps[ref] = { ref, pads: [], drawings: [] };
  return model.comps[ref];
}

// Merge TH pads that appear on both outer layers and attach drill info
function finalizePads(model) {
  const holeIndex = new Map();
  const key = (x, y) => Math.round(x * 20) + ',' + Math.round(y * 20);
  for (const h of model.holes) {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const k = (Math.round(h.pos[0] * 20) + dx) + ',' + (Math.round(h.pos[1] * 20) + dy);
      if (!holeIndex.has(k)) holeIndex.set(k, h);
    }
  }
  const findHole = (p) => holeIndex.get(key(p[0], p[1]));

  function mergeList(pads) {
    const out = [];
    const byKey = new Map();
    for (const p of pads) {
      const k = (p._pin || '') + '@' + key(p.pos[0], p.pos[1]);
      const ex = byKey.get(k);
      if (ex && !ex.layers.includes(p.layers[0])) {
        ex.layers.push(p.layers[0]);
        // keep the larger shape for display
        if (p.size && ex.size && p.size[0] * p.size[1] > ex.size[0] * ex.size[1]) {
          const layers = ex.layers;
          Object.assign(ex, p, { layers });
        }
        continue;
      }
      byKey.set(k, p);
      out.push(p);
    }
    for (const p of out) {
      if (p._ps === false) continue;                       // padstack without a drill: SMD
      const h = findHole(p.pos);
      if (h && !viaAt.has(key(h.pos[0], h.pos[1]))) {
        p.type = 'th';
        if (h.slot) {
          const len = Math.hypot(h.slot[1][0] - h.slot[0][0], h.slot[1][1] - h.slot[0][1]) + h.d;
          const ang = (Math.atan2(h.slot[1][1] - h.slot[0][1], h.slot[1][0] - h.slot[0][0]) * 180) / Math.PI;
          p.drillshape = 'oblong';
          // drill size is in pad-local frame; pad angle rotates it
          const rel = -ang - (p.angle || 0);
          const horiz = Math.abs(Math.cos((rel * Math.PI) / 180)) > 0.7;
          p.drillsize = horiz ? [G.round(len), G.round(h.d)] : [G.round(h.d), G.round(len)];
        } else {
          p.drillshape = 'circle';
          p.drillsize = [G.round(h.d), G.round(h.d)];
        }
        if (p.layers.length === 1) p.layers = ['F', 'B'];
        h._used = true;
      }
    }
    // Pads whose land is offset from its drill: the hole is not at pad.pos. Exporters disagree
    // on how a pad offset is written (KiCad's IPC-2581 writer adds the pad-local offset to the
    // location; rotated footprints then put the land beside the hole, even outside the board).
    // The pad is re-anchored on its hole; its land stays where written when that is on the board,
    // otherwise the reading of the offset that keeps the land on the board around the hole is used.
    // The offset goes to iBOM's pad.offset (pad-local, applied after the pad rotation).
    const bb = boardBox();
    const onBoard = (p, c) => !bb || landCorners(p, c).every((q) => q[0] >= bb.minx - 0.05 && q[0] <= bb.maxx + 0.05 && q[1] >= bb.miny - 0.05 && q[1] <= bb.maxy + 0.05);
    for (const p of out) {
      if (p.type === 'th' || !p.size || p._ps === false) continue;
      const h = nearHole(p);
      if (!h) continue;
      // castellated holes sit on the board edge: their pads legitimately reach over it
      if (bb && Math.min(h.pos[0] - bb.minx, bb.maxx - h.pos[0], h.pos[1] - bb.miny, bb.maxy - h.pos[1]) < Math.max(h.d, 0.6)) continue;
      const e = [p.pos[0] - h.pos[0], p.pos[1] - h.pos[1]];
      const a = p.shape === 'custom' ? (p._rot || 0) : (p.angle || 0);
      const R = (v, ang) => G.rot(v, -ang);                 // pad-local → board (drawPad convention)
      let land = null;
      if (onBoard(p, p.pos)) {
        if (holeInLand(p, p.pos, h.pos)) land = e;          // offset written correctly: only attach the hole
      } else {
        const cands = model.source === 'kicad' ? [R(e, a), [-e[0], -e[1]], R(e, -a), R(e, 2 * a)] : [[-e[0], -e[1]], R(e, a), R(e, -a), R(e, 2 * a)];
        for (const c of cands) {
          const at = [h.pos[0] + c[0], h.pos[1] + c[1]];
          if (onBoard(p, at) && holeInLand(p, at, h.pos)) { land = c; model.offsetPads = (model.offsetPads || 0) + 1; break; }
        }
      }
      if (!land) continue;
      p.offset = p.shape === 'custom' ? [G.round(land[0]), G.round(land[1])] : (() => { const l = G.rot(land, a); return [G.round(l[0]), G.round(l[1])]; })();
      if (Math.abs(p.offset[0]) < 1e-6 && Math.abs(p.offset[1]) < 1e-6) delete p.offset;
      p.pos = h.pos.slice();
      p.type = 'th';
      p.drillshape = 'circle';
      p.drillsize = [G.round(h.d), G.round(h.d)];
      if (p.layers.length === 1) p.layers = ['F', 'B'];
      h._used = true;
    }
    return out;
  }
  // board outline bounding box (from Profile segments / arcs)
  function boardBox() {
    const b = { minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity };
    const add = (x, y) => { if (isFinite(x) && isFinite(y)) { b.minx = Math.min(b.minx, x); b.maxx = Math.max(b.maxx, x); b.miny = Math.min(b.miny, y); b.maxy = Math.max(b.maxy, y); } };
    for (const e of model.edges || []) {
      if (e.svgpath) { const n = e.svgpath.match(/-?\d+(\.\d+)?(e-?\d+)?/gi) || []; for (let i = 0; i + 1 < n.length; i += 2) add(+n[i], +n[i + 1]); }
      if (e.start) add(e.start[0], e.start[1]);
      if (e.end) add(e.end[0], e.end[1]);
      if (e.center && e.radius) { add(e.center[0] - e.radius, e.center[1] - e.radius); add(e.center[0] + e.radius, e.center[1] + e.radius); }
    }
    return b.minx < b.maxx && b.miny < b.maxy ? b : null;
  }
  function landCorners(p, c) {
    let local;
    if (p.shape === 'custom' && p.polygons) local = [].concat(...p.polygons);
    else { const w = p.size[0] / 2, h = p.size[1] / 2; local = [[-w, -h], [w, -h], [w, h], [-w, h]]; }
    const a = p.shape === 'custom' ? 0 : (p.angle || 0);
    return local.map((q) => { const v = G.rot(q, -a); return [c[0] + v[0], c[1] + v[1]]; });
  }
  // closest unused plated hole near a pad (within the pad's own size)
  function nearHole(p) {
    const r = Math.max(p.size[0], p.size[1]) * 0.75 + 0.2;
    let best = null, bd = Infinity;
    for (const h of model.holes) {
      if (h._used || !h.plated || h.via || viaAt.has(key(h.pos[0], h.pos[1]))) continue;
      const d = Math.hypot(h.pos[0] - p.pos[0], h.pos[1] - p.pos[1]);
      if (d > 0.01 && d <= r && d < bd) { best = h; bd = d; }
    }
    return best;
  }
  // is point q inside the land of pad p placed at centre c?
  function holeInLand(p, c, q) {
    const d = [q[0] - c[0], q[1] - c[1]];
    if (p.shape === 'custom' && p.polygons) return p.polygons.some((poly) => G.pointInPoly ? G.pointInPoly(d, poly) : pip(d, poly));
    const l = G.rot(d, p.angle || 0);                     // board → pad-local
    return Math.abs(l[0]) <= p.size[0] / 2 + 1e-6 && Math.abs(l[1]) <= p.size[1] / 2 + 1e-6;
  }
  function pip(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // drill holes that belong to vias (via pads were turned into zero-length tracks)
  const viaAt = new Set();
  for (const side of ['F', 'B']) for (const t of model.tracks[side]) if (t.start && t.end && t.start[0] === t.end[0] && t.start[1] === t.end[1]) viaAt.add(key(t.start[0], t.start[1]));
  for (const ref in model.comps) {
    const c = model.comps[ref];
    c.pads = mergeList(c.pads);
    // a surface-mount pad lives only on its component's side, even if the file lists it on both
    // (only when the file has drill data or says the padstack has no drill; otherwise a pad on
    // both sides is the only hint that it is a through-hole pad)
    if (c.side === 'F' || c.side === 'B') c.pads.forEach((p) => { if (p.type !== 'th' && p.layers.length > 1 && (p._ps === false || model.holes.length)) p.layers = [c.side]; });
  }
  model.freePads.F = mergeList(model.freePads.F.concat(model.freePads.B));
  model.freePads.B = [];
  // vias get drill size for untented display
  for (const side of ['F', 'B']) {
    for (const t of model.tracks[side]) {
      if (t.start && t.end && t.start[0] === t.end[0] && t.start[1] === t.end[1]) {
        const h = findHole(t.start);
        if (h) { t.drillsize = G.round(h.d); h._used = true; }
      }
    }
  }
  // Holes without pad or via (mounting holes, NPTH, vias without outer pads):
  // drawn as hole markers (zero length "via" whose ring equals the drill).
  const seen = new Set();
  for (const h of model.holes) {
    if (h._used) continue;
    const k = key(h.pos[0], h.pos[1]);
    if (seen.has(k)) continue;
    seen.add(k);
    const ring = h.via ? h.d * 1.8 : h.d;
    for (const side of ['F', 'B']) model.tracks[side].push({ start: h.pos, end: h.pos, width: G.round(ring), drillsize: G.round(h.d) });
  }
}

module.exports = { newModel, ensureComp, finalizePads };
