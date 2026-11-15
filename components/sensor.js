/* Inertial / environmental sensors: gyroscope, accelerometer, magnetometer, barometer and navigation grades.
   Each sensor is its own component with parent 'sensor' (shown as sub-tabs under the "Sensör" part).
   Shared tools: Allan deviation (test plan, model curve, analysis of logged data) and a log–log plot. */

/* ---------------- shared: log–log plot ---------------- */
function llPlot(o) { // o: {title, xlab, ylab, series:[{pts:[[x,y]…], col, name, dash, w}], marks:[{x,y,label}], fx, fy}
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), W = 640, H = 340, L = 64, R = 16, T = 26, B = 42, pw = W - L - R, ph = H - T - B;
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('role', 'img');
  const el = (tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; };
  const all = o.series.flatMap((s) => s.pts).filter(([x, y]) => x > 0 && y > 0 && isFinite(x) && isFinite(y));
  if (!all.length) return svg;
  const lx0 = Math.floor(Math.log10(Math.min(...all.map((p) => p[0])))), lx1 = Math.ceil(Math.log10(Math.max(...all.map((p) => p[0]))));
  const ly0 = Math.floor(Math.log10(Math.min(...all.map((p) => p[1]))) - 0.15), ly1 = Math.ceil(Math.log10(Math.max(...all.map((p) => p[1]))) + 0.15);
  const X = (x) => L + (Math.log10(x) - lx0) / Math.max(lx1 - lx0, 1) * pw, Y = (y) => T + (ly1 - Math.log10(y)) / Math.max(ly1 - ly0, 1) * ph;
  el('rect', { x: L, y: T, width: pw, height: ph, fill: 'var(--card)', stroke: 'var(--line)' });
  for (let d = lx0; d <= lx1; d++) { const x = X(Math.pow(10, d)); el('line', { x1: x, y1: T, x2: x, y2: T + ph, stroke: 'var(--line)' }); el('text', { x, y: T + ph + 16, 'text-anchor': 'middle' }, (o.fx || ((v) => String(v)))(Math.pow(10, d))); }
  for (let d = ly0; d <= ly1; d++) { const y = Y(Math.pow(10, d)); el('line', { x1: L, y1: y, x2: L + pw, y2: y, stroke: 'var(--line)' }); el('text', { x: L - 6, y: y + 4, 'text-anchor': 'end' }, (o.fy || ((v) => sig(v, 3)))(Math.pow(10, d))); }
  el('text', { x: L + pw / 2, y: H - 4, 'text-anchor': 'middle' }, o.xlab); el('text', { x: 14, y: T + ph / 2, transform: 'rotate(-90 14 ' + (T + ph / 2) + ')', 'text-anchor': 'middle' }, o.ylab);
  el('text', { x: L, y: 16, class: 'ttl' }, o.title);
  for (const s of o.series) { const p = s.pts.filter(([x, y]) => x > 0 && y > 0 && isFinite(y)); if (p.length < 2) continue; el('path', { d: p.map(([x, y], i) => (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1)).join(' '), fill: 'none', stroke: s.col, 'stroke-width': s.w || 2, 'stroke-dasharray': s.dash || '', 'stroke-linejoin': 'round' }); }
  for (const m of o.marks || []) { if (!(m.x > 0 && m.y > 0)) continue; el('circle', { cx: X(m.x), cy: Y(m.y), r: 4, fill: m.col || 'var(--c)' }); el('text', { x: X(m.x) + 7, y: Y(m.y) - 7, class: 'ttl' }, m.label); }
  return svg;
}
function plotBox(svg, legend, extra) {
  const w = document.createElement('div'); w.appendChild(svg);
  if (legend && legend.length) { const lg = document.createElement('div'); lg.className = 'plot-leg'; legend.forEach(([c, n, dash]) => { const s = document.createElement('span'), i = document.createElement('i'); i.style.background = c; if (dash) i.style.opacity = 0.6; s.append(i, document.createTextNode(n)); lg.appendChild(s); }); w.appendChild(lg); }
  if (extra) w.appendChild(extra);
  return w;
}
const logTaus = (t0, t1, n) => Array.from({ length: n }, (_, i) => Math.pow(10, Math.log10(t0) + (Math.log10(t1) - Math.log10(t0)) * i / (n - 1)));

/* ---------------- shared: Allan deviation ---------------- */
// model σ(τ) from the standard noise terms (IEEE Std 952): quantization Q, white noise N (random walk), bias instability B, rate random walk K, rate ramp R
function adModel(t, p) { const v = (p.q ? 3 * p.q * p.q / (t * t) : 0) + (p.n ? p.n * p.n / t : 0) + (p.b ? Math.pow(0.664 * p.b, 2) : 0) + (p.k ? p.k * p.k * t / 3 : 0) + (p.r ? p.r * p.r * t * t / 2 : 0); return Math.sqrt(v); }
// overlapping Allan deviation of a rate signal y sampled every t0 (octave-spaced cluster sizes)
function adevOverlap(y, t0) {
  const n = y.length, th = new Float64Array(n + 1); for (let i = 0; i < n; i++) th[i + 1] = th[i] + y[i] * t0;
  const out = []; let last = 0;
  for (let mf = 1; mf <= (n - 1) / 2; mf *= 1.26) {   // ≈ 10 points per decade
    const m = Math.round(mf); if (m === last) continue; last = m;
    let s = 0; const N = n + 1 - 2 * m; if (N < 2) break;
    for (let k = 0; k < N; k++) { const d = th[k + 2 * m] - 2 * th[k + m] + th[k]; s += d * d; }
    const tau = m * t0; out.push([tau, Math.sqrt(s / (2 * tau * tau * N)), Math.floor(n / m)]);
  }
  return out;
}
// read white noise (σ·√τ on the −½ slope, taken at τ = 1 s), bias instability (min / 0.664) and rate random walk (+½ slope)
function adFit(ad) {
  const sl = ad.map((p, i) => (i && i < ad.length - 1 ? Math.log(ad[i + 1][1] / ad[i - 1][1]) / Math.log(ad[i + 1][0] / ad[i - 1][0]) : NaN));
  const wn = ad.filter((p, i) => sl[i] < -0.35 && sl[i] > -0.65).map((p) => p[1] * Math.sqrt(p[0]));
  const rr = ad.filter((p, i) => p[2] >= 8 && sl[i] > 0.35 && sl[i] < 0.65).map((p) => p[1] * Math.sqrt(3 / p[0]));
  const med = (a) => { if (!a.length) return NaN; const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
  // the minimum is taken only where the estimate is trustworthy: at least 8 independent clusters (≈ ±25 %)
  const ok = ad.map((p) => p[2] >= 8); let mi = -1; ad.forEach((p, i) => { if (ok[i] && (mi < 0 || p[1] < ad[mi][1])) mi = i; }); if (mi < 0) mi = 0;
  return { n: med(wn), b: ad.length ? ad[mi][1] / 0.664 : NaN, tauMin: ad.length ? ad[mi][0] : NaN, k: med(rr) };
}
// test-plan arithmetic: clusters, estimate uncertainty 1/√(2(K−1)), recommended duration, data size
function allanPlanCompute(G, unitNote) {
  const fs = G.v('fs'), T = G.r('th') * 3600, tau = G.r('tau'), ch = G.r('ch') || 1, by = G.r('by') || 4;
  if (!(fs > 0 && T > 0 && tau > 0)) return [['—', tt('Örnekleme hızı, süre ve τ girin', 'Enter sample rate, duration and τ')]];
  const K = T / tau, err = K > 1 ? 1 / Math.sqrt(2 * (K - 1)) : Infinity, need = (e) => tau * (1 + 1 / (2 * e * e));
  const items = [[sig(err * 100, 3) + ' %', tt('τ_maks\'ta Allan sapması belirsizliği (1σ)', 'Allan deviation uncertainty at τ_max (1σ)'), 'big ' + (err <= 0.1 ? 'good' : err <= 0.25 ? 'warn' : 'bad')],
    [sig(Math.floor(K), 4), tt('τ_maks\'ta bağımsız küme sayısı K = T/τ', 'Independent clusters at τ_max, K = T/τ')],
    [sig(need(0.1) / 3600, 3) + ' h', tt('±%10 için gereken süre', 'Duration needed for ±10 %')], [sig(need(0.25) / 3600, 3) + ' h', tt('±%25 için gereken süre', 'Duration needed for ±25 %')],
    [sig(fs * T, 4), tt('Toplam örnek (kanal başına)', 'Total samples (per channel)')], [eng(fs * T * ch * by, 'B'), tt('Ham veri boyutu', 'Raw data size')],
    [sig(T / 2 / 3600, 3) + ' h', tt('Hesaplanabilen en büyük τ (T/2)', 'Largest computable τ (T/2)')]];
  if (unitNote) items.push(['—', unitNote]);
  return items;
}
const ALLAN_PLAN_FIELDS = [
  { id: 'fs', tr: 'Örnekleme hızı', en: 'Sample rate', def: '200', u: 'F', ud: 0, help: ['Ham veriyi sensörün en yüksek hızında ve iç filtreler kapalıyken kaydedin. Sonradan ortalamayla düşürmek her zaman mümkündür.', 'Log raw data at the sensor\'s highest rate with internal filters off. Averaging down later is always possible.'] },
  { id: 'th', tr: 'Kayıt süresi (saat)', en: 'Record length (hours)', def: '6' },
  { id: 'tau', tr: 'İlgilenilen en büyük τ (s)', en: 'Largest τ of interest (s)', def: '1000', help: ['Bias kararsızlığının minimumunun beklendiği τ\'nun birkaç katı. MEMS için 100–3000 s, FOG/RLG için 10⁴ s ve üzeri.', 'A few times the τ where the bias-instability minimum is expected. 100–3000 s for MEMS, 10⁴ s and more for FOG/RLG.'] },
  { id: 'ch', tr: 'Kanal sayısı', en: 'Channels', def: '7', help: ['Örn. 3 jiroskop + 3 ivme + sıcaklık = 7.', 'E.g. 3 gyro + 3 accel + temperature = 7.'] },
  { id: 'by', tr: 'Bayt / örnek / kanal', en: 'Bytes / sample / channel', def: '4' },
];
const ALLAN_PLAN_NOTE = (extra) => [
  'Test düzeni: sensör titreşimden yalıtılmış masaya sıkıca bağlanır, sabit sıcaklıkta (termal kabin, ±0,1 °C) 30–60 dk ısındırılır, sonra hareketsiz olarak saatlerce ham veri kaydedilir; sıcaklık da kaydedilir. Kayıttan önce/ sonra veri boşluğu ve doyma kontrol edilir. Sonuç log–log Allan sapma eğrisi olarak çizilir: −½ eğim beyaz gürültü (ARW/VRW, τ = 1 s\'deki değer), düz dip bias kararsızlığı (min / 0,664), +½ eğim rate random walk. ' + (extra ? extra[0] : ''),
  'Test setup: the sensor is clamped to a vibration-isolated table, warmed up for 30–60 min at constant temperature (thermal chamber, ±0.1 °C), then raw data are logged while static for hours, temperature included. Check for gaps and saturation before/after. The result is plotted as a log–log Allan deviation: −½ slope white noise (ARW/VRW, value at τ = 1 s), flat floor bias instability (min / 0.664), +½ slope rate random walk. ' + (extra ? extra[1] : ''),
];

/* Allan analysis of logged data: paste or load a text/CSV column, compute, fit and plot (state kept per card). */
const AD_STATE = {};
// analysis cached per card: recomputed only when the data or the sample rate changes (compute runs before the plot)
function adAnalyse(cid, G) {
  const st = AD_STATE[cid], fs = G.v('fs'); if (!st || !st.data || st.data.length <= 20 || !(fs > 0)) return null;
  const key = st.data.length + '|' + fs + '|' + st.name + '|' + (st.ver || 0); if (st.key === key) return st.result;
  const ad = adevOverlap(st.data, 1 / fs); st.key = key; st.result = { ad, fit: adFit(ad), n: st.data.length }; return st.result;
}
function allanDataPlot(cid, cfg) { // cfg: {unit:[tr,en] of the input, conv(fit, unitSel) -> result rows, model(G) -> params or null}
  return (G) => {
    const st = AD_STATE[cid] || (AD_STATE[cid] = { data: null, name: '' });
    const wrap = document.createElement('div');
    const tools = document.createElement('div'); tools.className = 'plot-tools';
    const ta = document.createElement('textarea'); ta.className = 'sel'; ta.rows = 3; ta.style.width = '100%'; ta.placeholder = tt('Her satıra bir ölçüm (ya da CSV): ' + tt(...cfg.unit) + '. Sütun seçimi aşağıda.', 'One measurement per line (or CSV): ' + tt(...cfg.unit) + '. Choose the column below.');
    ta.addEventListener('input', (e) => e.stopPropagation());
    const parse = (txt) => { const col = Math.max(1, Math.round(G.r('col') || 1)) - 1, out = []; for (const line of txt.split(/\r?\n/)) { const c = line.split(/[,;\t ]+/).filter(Boolean); const v = Number((c[col] || '').replace(',', '.')); if (Number.isFinite(v)) out.push(v); } return out; };
    const load = (txt, name) => { st.data = parse(txt); st.name = name; st.ver = (st.ver || 0) + 1; recalcAll(); };
    ta.addEventListener('change', (e) => { e.stopPropagation(); load(ta.value, tt('yapıştırılan veri', 'pasted data')); });
    const fi = document.createElement('input'); fi.type = 'file'; fi.accept = '.csv,.txt,.dat,.log'; fi.addEventListener('change', async (e) => { e.stopPropagation(); const f = fi.files[0]; if (f) load(await f.text(), f.name); });
    fi.addEventListener('input', (e) => e.stopPropagation());
    const demo = document.createElement('button'); demo.type = 'button'; demo.className = 'btn'; demo.textContent = tt('Örnek veri üret', 'Generate sample data');
    demo.title = tt('Model değerlerinden (beyaz gürültü + Gauss-Markov bias + rate random walk) 2 saatlik sentetik kayıt üretir', 'Generates a 2-hour synthetic log from the model values (white noise + Gauss–Markov bias + rate random walk)');
    demo.onclick = () => { const p = cfg.model(G) || {}, fs = G.v('fs') || 100, t0 = 1 / fs, n = Math.min(Math.round(7200 * fs), 1500000), y = new Float64Array(n), rnd = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      const Tc = 200, beta = Math.exp(-t0 / Tc), sgm = (p.b || 0) / 0.62, qg = sgm * Math.sqrt(1 - beta * beta); let gm = 0, rw = 0;
      for (let i = 0; i < n; i++) { gm = beta * gm + qg * rnd(); rw += (p.k || 0) * Math.sqrt(t0) * rnd(); y[i] = (p.n || 0) / Math.sqrt(t0) * rnd() + gm + rw; }
      st.data = Array.from(y); st.name = tt('sentetik veri', 'synthetic data'); st.ver = (st.ver || 0) + 1; recalcAll(); };
    const clr = document.createElement('button'); clr.type = 'button'; clr.className = 'btn'; clr.textContent = tt('Temizle', 'Clear'); clr.onclick = () => { st.data = null; recalcAll(); };
    const lab = document.createElement('label'); lab.className = 'btn'; lab.style.cursor = 'pointer'; lab.append(document.createTextNode(tt('Dosya yükle…', 'Load file…'))); fi.style.display = 'none'; lab.appendChild(fi);
    tools.append(lab, demo, clr);
    const hint = document.createElement('span'); hint.className = 'hint'; tools.appendChild(hint);
    const fs = G.v('fs'), t0 = fs > 0 ? 1 / fs : NaN, p = cfg.model(G);
    const series = [], legend = [], marks = [];
    let res = null;
    res = adAnalyse(cid, G);
    if (res) {
      const ad = res.ad, fit = res.fit;
      series.push({ pts: ad.map((q) => [q[0], q[1]]), col: 'var(--c)', name: 'data', w: 2.4 }); legend.push(['var(--c)', tt('Ölçülen Allan sapması', 'Measured Allan deviation') + ' (' + st.name + ', ' + sig(st.data.length, 4) + ' ' + tt('örnek', 'samples') + ', ' + sig(st.data.length * t0 / 3600, 3) + ' h)']);
      if (fit.n > 0) marks.push({ x: 1, y: fit.n, label: tt('τ=1 s', 'τ=1 s') });
      if (fit.tauMin > 0) marks.push({ x: fit.tauMin, y: fit.b * 0.664, label: tt('min (bias kararsızlığı)', 'min (bias instability)'), col: '#d97706' });
      hint.textContent = tt('Sonuçlar kartın sonuç kutularında; birim girişteki birimdir.', 'Results are in the result tiles; units follow the input unit.');
    } else hint.textContent = tt('Statik kaydı yükleyin ya da örnek veri üretin.', 'Load a static log or generate sample data.');
    if (p) { const taus = res ? logTaus(res.ad[0][0], res.ad[res.ad.length - 1][0], 60) : logTaus(t0 > 0 ? t0 : 0.01, 1e4, 60); series.push({ pts: taus.map((t) => [t, adModel(t, p)]), col: 'var(--mute)', dash: '6 4', name: 'model', w: 1.6 }); legend.push(['var(--mute)', tt('Veri sayfası modeli', 'Datasheet model'), true]); }
    const svg = llPlot({ title: tt('Allan sapması σ(τ)', 'Allan deviation σ(τ)'), xlab: tt('Ortalama süresi τ (s)', 'Averaging time τ (s)'), ylab: 'σ(τ) [' + tt(...cfg.unit) + ']', series: series.length ? series : [{ pts: [[0.01, 1], [1e4, 1e-3]], col: 'transparent' }], marks, fx: (v) => (v >= 1 ? String(v) : String(Number(v.toPrecision(1)))) });
    wrap.append(plotBox(svg, legend), tools, ta);
    return wrap;
  };
}
function allanDataCompute(cid, cfg) {
  return (G) => {
    const r = adAnalyse(cid, G);
    if (!r) return [['—', tt('Veri yok: aşağıdan dosya yükleyin, yapıştırın ya da örnek veri üretin', 'No data: load a file, paste, or generate sample data below')]];
    return cfg.conv(r.fit, G, r);
  };
}
const AD_FIELDS = (unitSel, model) => [{ id: 'fs', tr: 'Örnekleme hızı', en: 'Sample rate', def: '100', u: 'F', ud: 0 }, unitSel, { id: 'col', tr: 'Veri sütunu (CSV)', en: 'Data column (CSV)', def: '1' }, ...model];

/* ---------------- gyroscope ---------------- */
const GYRO_GRADE = (bi) => (bi <= 0.001 ? ['Stratejik', 'Strategic'] : bi <= 0.01 ? ['Navigasyon', 'Navigation'] : bi <= 1 ? ['Taktik', 'Tactical'] : bi <= 10 ? ['Endüstriyel', 'Industrial'] : ['Tüketici', 'Consumer']);
CMP.gyro = {
  parent: 'sensor', name: ['Jiroskop', 'Gyroscope'],
  title: ['Jiroskop Seçimi, Parametreleri ve Allan Variance', 'Gyroscope Selection, Parameters and Allan Variance'],
  sub: ['Açısal hız sensörü: bias kararsızlığı, ARW, ölçek faktörü, g-duyarlılığı; teknoloji karşılaştırması, sınıf seçimi ve Allan variance test/analiz araçları.', 'Angular-rate sensor: bias instability, ARW, scale factor, g-sensitivity; technology comparison, grade selection and Allan variance test/analysis tools.'],
  params: [
    ['Ölçüm aralığı', 'Range', '°/s', 'Doymadan ölçülebilen en büyük açısal hız. Aracın en hızlı dönüşünün en az 1,5–2 katı seçin; gereksiz geniş aralık gürültü ve ölçek hatasını büyütür.', 'Largest angular rate measured without saturation. Pick at least 1.5–2× the vehicle\'s fastest rotation; an unnecessarily wide range raises noise and scale error.', '±125 … ±2000 °/s (MEMS), ±400–1000 (FOG)'],
    ['Bias kararsızlığı (in-run)', 'Bias instability (in-run)', '°/h', 'Sabit sıcaklıkta çalışma sırasında bias\'ın dalgalanması; Allan eğrisinin minimumunun 0,664\'e bölümü. Bias\'ın kestirilebileceği en iyi doğruluk; sınıfı belirleyen ana parametredir.', 'Bias wander during operation at constant temperature; the Allan curve minimum divided by 0.664. The best accuracy to which the bias can be estimated; the main grade-defining parameter.', 'tüketici > 10 · taktik 0,1–1 · navigasyon ≤ 0,01'],
    ['Açısal rastgele yürüyüş (ARW)', 'Angle random walk (ARW)', '°/√h', 'Beyaz gürültünün integrali: açı hatası σ = ARW·√t. Gürültü yoğunluğuna eşittir (°/s/√Hz = °/√s; ×60 → °/√h). Allan eğrisinde −½ eğimli bölgenin τ = 1 s değeri.', 'Integral of white noise: angle error σ = ARW·√t. Equal to the noise density (°/s/√Hz = °/√s; ×60 → °/√h). The τ = 1 s value of the −½-slope region of the Allan curve.', '0,002 … 3 °/√h'],
    ['Gürültü yoğunluğu', 'Noise density', '°/s/√Hz', 'Bant başına gürültü; σ = ND·√(BW veya örnekleme hızı). Örnek: 0,005 °/s/√Hz × √100 Hz = 0,05 °/s RMS.', 'Noise per bandwidth; σ = ND·√(BW or sample rate). Example: 0.005 °/s/√Hz × √100 Hz = 0.05 °/s RMS.', '0,0001 … 0,02 °/s/√Hz'],
    ['Açılış bias tekrarlanabilirliği', 'Turn-on bias repeatability', '°/h', 'Her açılışta değişen başlangıç bias\'ı. Destekli sistem (GNSS) her açılışta kestirir; desteksiz navigasyon ve gyrocompassing için kritiktir.', 'Initial bias that changes at every power-up. An aided system (GNSS) estimates it after start-up; critical for unaided navigation and gyrocompassing.', '1–3× in-run'],
    ['Bias sıcaklık duyarlılığı', 'Bias temperature sensitivity', '°/h/°C veya °/s (aralıkta)', 'Sıcaklıkla bias değişimi; termal kalibrasyonla (look-up tablo/polinom) düzeltilir, ancak in-run kararsızlık sınırına kadar.', 'Bias change with temperature; corrected by thermal calibration (look-up table/polynomial), but only down to the in-run instability.', '0,01 … 1 °/s tam sıcaklık aralığında (MEMS)'],
    ['Rate random walk (RRW)', 'Rate random walk (RRW)', '°/h/√h', 'Bias\'ın uzun vadeli rastgele yürüyüşü; Allan eğrisinde +½ eğim. Uzun desteksiz süreler için önemlidir.', 'Long-term random walk of the bias; +½ slope on the Allan curve. Matters for long unaided periods.', '—'],
    ['Ölçek faktörü hatası', 'Scale factor error', 'ppm', 'Çıkış/giriş oranındaki hata; 1000 ppm = %0,1. Hızlı dönen sistemde açı hatası = SF hatası × toplam açı.', 'Error in the output/input ratio; 1000 ppm = 0.1 %. In a rotating system, angle error = SF error × total angle.', '50 … 5000 ppm'],
    ['Ölçek doğrusalsızlığı', 'Scale factor nonlinearity', 'ppm / %FS', 'Ölçek faktörünün aralık boyunca sabit olmaması.', 'Variation of the scale factor across the range.', '10 … 1000 ppm'],
    ['Eksenler arası duyarlılık / hizasızlık', 'Cross-axis sensitivity / misalignment', 'mrad / %', 'Bir eksenin diğer eksendeki girişi görmesi; kalibrasyon matrisi ile düzeltilir. Sistem düzeyi hizalaması ayrıca gerekir.', 'An axis responding to input on another axis; corrected by the calibration matrix. System-level alignment is needed separately.', '0,05 … 1 %'],
    ['g-duyarlılığı', 'g-sensitivity', '°/h/g', 'Doğrusal ivmeyle bias kayması; ivmeölçerle gerçek zamanlı düzeltilebilir. Yüksek dinamikli araçlarda önemli.', 'Bias shift with linear acceleration; can be corrected in real time with the accelerometer. Important on high-dynamic vehicles.', '0,1 … 100 °/h/g'],
    ['g²-duyarlılığı (titreşim doğrultma)', 'g²-sensitivity (vibration rectification)', '°/h/g²', 'Titreşimin bias\'ta kalıcı kayma oluşturması. Motorlu / pervaneli araçlarda titreşim izolasyonu ile birlikte değerlendirin.', 'Vibration producing a lasting bias shift. Evaluate together with vibration isolation on engine / propeller vehicles.', '0,01 … 10 °/h/g²'],
    ['Kalibrasyon (sensör modeli)', 'Calibration (sensor model)', '—', 'Doğrusal model: düzeltilmiş = S·M·(ham − b); S ölçek faktörü (köşegen), M hizasızlık/eksenler arası (6 terim), b bias. En küçük kareler ile kestirilir; sıcaklık (look-up/polinom), doğrusalsızlık, g-duyarlılığı ve sıcaklık değişim hızı terimleri eklenebilir. Ömür boyunca en çok değişen terim bias\'tır.', 'Linear model: corrected = S·M·(raw − b); S scale factor (diagonal), M misalignment/cross-axis (6 terms), b bias. Estimated by least squares; temperature (look-up/polynomial), nonlinearity, g-sensitivity and thermal-ramp terms can be added. Bias is the term that changes most over life.', '—'],
    ['Kalibrasyon / karakterizasyon testleri', 'Calibration / characterisation tests', '—', 'Rate table (1–3 eksen) ile ölçek ve hizasızlık; termal kabinde sıcaklık kalibrasyonu; Allan variance (gürültü, bias kararsızlığı); sarsıcı (shaker) ile sinüs taramasında bant genişliği (−3 dB) ve g / g²-duyarlılığı.', 'Rate table (1–3 axis) for scale and misalignment; thermal-chamber temperature calibration; Allan variance (noise, bias instability); shaker sine sweep for bandwidth (−3 dB) and g / g²-sensitivity.', '—'],
    ['Titreşim ve aralık aşımı', 'Vibration and over-range', '—', 'Titreşim tepe değeri aralığı aşarsa ölçüm kırpılır ve bias\'a doğrultulur; ham sensör görünümünde aralık aşımı görülürse aralığı büyütün (Orientus: ivme 2/4/16 g, jiroskop 250/500/2000 °/s seçilebilir) veya izolatör kullanın.', 'If vibration peaks exceed the range the signal clips and rectifies into bias; if the raw view shows over-range, increase the range (Orientus: accel 2/4/16 g, gyro 250/500/2000 °/s selectable) or use isolators.', '—'],
    ['Bant genişliği / gecikme', 'Bandwidth / latency', 'Hz / ms', '−3 dB frekansı; kontrol döngüsünün bant genişliğinin 5–10 katı olmalı. Toplam gecikme = filtre + iletişim.', '−3 dB frequency; should be 5–10× the control-loop bandwidth. Total latency = filter + communication.', '50 … 500 Hz'],
  ],
  tech: {
    title: ['Jiroskop teknolojileri', 'Gyroscope technologies'],
    head: [['Teknoloji', 'Technology'], ['Bias kararsızlığı', 'Bias instability'], ['ARW', 'ARW'], ['Boyut / güç', 'Size / power'], ['Maliyet', 'Cost'], ['Sınıf', 'Grade'], ['Tipik kullanım', 'Typical use']],
    rows: [
      [['MEMS (tüketici)', 'MEMS (consumer)'], '10–100 °/h', '0,3–1 °/√h', ['mm³, mW', 'mm³, mW'], ['çok düşük', 'very low'], ['Tüketici', 'Consumer'], ['Telefon, giyilebilir, oyuncak dron', 'Phone, wearable, toy drone']],
      [['MEMS (endüstriyel)', 'MEMS (industrial)'], '1–10 °/h', '0,1–0,5 °/√h', ['cm³, 0,1–1 W', 'cm³, 0.1–1 W'], ['düşük', 'low'], ['Endüstriyel', 'Industrial'], ['AHRS, robot, İHA, GNSS/INS', 'AHRS, robot, UAV, GNSS/INS']],
      [['MEMS (taktik, ör. rezonans halka)', 'MEMS (tactical, e.g. resonant ring)'], '0,1–1 °/h', '0,02–0,1 °/√h', ['cm³, 1 W', 'cm³, 1 W'], ['orta', 'medium'], ['Taktik', 'Tactical'], ['Güdümlü mühimmat, ölçme, İHA', 'Guided munitions, survey, UAV']],
      [['Fiber optik (FOG)', 'Fibre-optic (FOG)'], '0,001–1 °/h', '0,0005–0,05 °/√h', ['dm³, 2–10 W', 'dm³, 2–10 W'], ['yüksek', 'high'], ['Taktik–navigasyon', 'Tactical–navigation'], ['Denizcilik, kara aracı, uçak', 'Marine, land vehicle, aircraft']],
      [['Halka lazer (RLG)', 'Ring laser (RLG)'], '0,001–0,01 °/h', '0,0005–0,005 °/√h', ['dm³, 10–20 W', 'dm³, 10–20 W'], ['çok yüksek', 'very high'], ['Navigasyon', 'Navigation'], ['Ticari/askerî uçak, gemi', 'Commercial/military aircraft, ship']],
      [['Örnek: Orientus (MEMS AHRS)', 'Example: Orientus (MEMS AHRS)'], '3 °/h', '0,24 °/√h (0,004 °/s/√Hz)', ['±250/500/2000 °/s, 400 Hz', '±250/500/2000 °/s, 400 Hz'], ['—', '—'], ['Endüstriyel', 'Industrial'], ['AHRS', 'AHRS']],
      [['Örnek: Motus (MEMS IMU)', 'Example: Motus (MEMS IMU)'], '0,2 °/h', '0,1 °/√h (6 °/h/√Hz)', ['±475 °/s, 200 Hz', '±475 °/s, 200 Hz'], ['—', '—'], ['Taktik', 'Tactical'], ['İHA, gimbal, AUV/ROV', 'UAV, gimbal, AUV/ROV']],
      [['Yarım küre rezonatör (HRG)', 'Hemispherical resonator (HRG)'], '< 0,001 °/h', '< 0,0005 °/√h', ['dm³, düşük güç', 'dm³, low power'], ['çok yüksek', 'very high'], ['Navigasyon–stratejik', 'Navigation–strategic'], ['Uzay, denizaltı, stratejik', 'Space, submarine, strategic']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'uav', opts: [['cons', 'Tüketici / hareket algılama', 'Consumer / motion sensing'], ['ahrs', 'Yönelim (AHRS), GNSS destekli', 'Attitude (AHRS), GNSS-aided'], ['uav', 'İHA / robot navigasyonu', 'UAV / robot navigation'], ['stab', 'Gimbal / platform stabilizasyonu', 'Gimbal / platform stabilisation'], ['dr', 'GNSS kesintisinde dakikalarca ölü hesap', 'Minutes of dead reckoning in GNSS outages'], ['gc', 'Gyrocompassing (kuzey bulma)', 'Gyrocompassing (north finding)'], ['nav', 'Saatlerce desteksiz navigasyon', 'Hours of unaided navigation']] },
      { id: 'dyn', tr: 'En yüksek dönüş hızı', en: 'Highest rotation rate', def: 'm', opts: [['l', '< 100 °/s', '< 100 °/s'], ['m', '100–500 °/s', '100–500 °/s'], ['h', '> 500 °/s (mühimmat, spor)', '> 500 °/s (munitions, sport)']] },
      { id: 'vib', tr: 'Titreşim ortamı', en: 'Vibration environment', def: 'n', opts: [['n', 'Düşük', 'Low'], ['h', 'Yüksek (motor, pervane, palet)', 'High (engine, propeller, tracks)']] },
    ],
    run(v) {
      const R = { cons: ['MEMS (tüketici sınıfı)', 'MEMS (consumer grade)', 'Hareket algılamada bias kararsızlığı önemsizdir; düşük güç ve maliyet belirleyicidir.', 'Bias instability hardly matters for motion sensing; power and cost decide.'],
        ahrs: ['MEMS (endüstriyel, ≤ 10 °/h)', 'MEMS (industrial, ≤ 10 °/h)', 'GNSS ve ivmeölçer/manyetometre bias\'ı sürekli kestirir; ARW ve titreşim davranışı önemlidir.', 'GNSS and accel/mag estimate the bias continuously; ARW and vibration behaviour matter.'],
        uav: ['MEMS (endüstriyel–taktik, 1–5 °/h)', 'MEMS (industrial–tactical, 1–5 °/h)', 'Kısa GNSS kesintilerini taşımak için düşük ARW ve iyi g-duyarlılığı arayın.', 'Look for low ARW and good g-sensitivity to ride through short GNSS outages.'],
        stab: ['Düşük gürültülü MEMS (ARW < 0,2 °/√h, BW > 200 Hz)', 'Low-noise MEMS (ARW < 0.2 °/√h, BW > 200 Hz)', 'Stabilizasyonda gürültü yoğunluğu ve bant genişliği/gecikme bias\'tan önemlidir.', 'For stabilisation, noise density and bandwidth/latency matter more than bias.'],
        dr: ['Taktik sınıf MEMS veya FOG (≤ 1 °/h)', 'Tactical MEMS or FOG (≤ 1 °/h)', 'Desteksiz sürede yönelim hatası ≈ BI·t + ARW·√t; konum hatası t³ ile büyür.', 'Unaided attitude error ≈ BI·t + ARW·√t; position error grows with t³.'],
        gc: ['≤ 0,1° için navigasyon sınıfı FOG/RLG (≤ 0,01 °/h); ≈ 1° için taktik', '≤ 0.1°: navigation-grade FOG/RLG (≤ 0.01 °/h); ≈ 1°: tactical', 'Dünya dönüşü 15,04 °/h·cos(enlem); 1° baş için bias < ≈ 0,26 °/h·cos(enlem). Hizalama süresini ARW belirler (hesaplayıcıya bakın).', 'Earth rate is 15.04 °/h·cos(latitude); 1° heading needs bias < ≈ 0.26 °/h·cos(lat). ARW sets the alignment time (see the calculator).'],
        nav: ['Navigasyon sınıfı RLG/FOG/HRG', 'Navigation-grade RLG/FOG/HRG', 'Saatlik ~1 deniz mili desteksiz drift için ≤ 0,01 °/h jiroskop ve ≤ 10 µg (in-run) ivmeölçer gerekir.', '~1 nmi/h unaided drift needs ≤ 0.01 °/h gyros and ≤ 10 µg (in-run) accelerometers.'] }[v.app];
      const why = [[R[2], R[3]]];
      if (v.dyn === 'h') why.push(['> 500 °/s: ±2000 °/s aralıklı MEMS; FOG\'ların çoğu ±500–1000 °/s ile sınırlıdır. Ölçek doğrusalsızlığına bakın.', '> 500 °/s: ±2000 °/s MEMS; most FOGs are limited to ±500–1000 °/s. Check scale-factor nonlinearity.']);
      if (v.vib === 'h') why.push(['Yüksek titreşim: g- ve g²-duyarlılığı düşük (titreşim doğrultması küçük) model seçin, mekanik izolatör kullanın ve rezonans frekansını titreşim tayfının dışında tutun.', 'High vibration: choose low g- and g²-sensitivity (small vibration rectification), use mechanical isolators and keep the resonance outside the vibration spectrum.']);
      return { main: [R[0], R[1]], why };
    },
  },
  calcGroups: [
    ['conv', 'Gürültü dönüşümü', 'Noise conversion', 'Gürültü yoğunluğu, ARW ve örnekleme hızındaki σ arasında dönüşüm.', 'Conversion between noise density, ARW and σ at a sample rate.'],
    ['err', 'Hata bütçesi', 'Error budget', 'Desteksiz yönelim/baş hatası ve gyrocompassing doğruluğu.', 'Unaided attitude/heading error and gyrocompassing accuracy.'],
    ['allan', 'Allan variance', 'Allan variance', 'Test planı, veri sayfası modelinin eğrisi ve kaydedilmiş statik verinin analizi (ARW, bias kararsızlığı, RRW).', 'Test plan, the datasheet-model curve and analysis of logged static data (ARW, bias instability, RRW).'],
  ],
  calcs: [
    { id: 'gcv', group: 'conv', title: ['ARW ↔ gürültü yoğunluğu ↔ σ', 'ARW ↔ noise density ↔ σ'], sub: ['ND [°/s/√Hz] = ARW [°/√s] = ARW [°/√h] / 60;  σ = ND·√f_s', 'ND [°/s/√Hz] = ARW [°/√s] = ARW [°/√h] / 60;  σ = ND·√f_s'],
      fields: [{ id: 'arw', tr: 'ARW (°/√h)', en: 'ARW (°/√h)', def: '0.3', help: ['Veri sayfasında °/s/√Hz verilmişse 60 ile çarpın; mdps/√Hz ise önce 1000\'e bölün.', 'If the datasheet gives °/s/√Hz multiply by 60; for mdps/√Hz divide by 1000 first.'] }, { id: 'fs', tr: 'Örnekleme hızı / bant', en: 'Sample rate / bandwidth', def: '100', u: 'F', ud: 0 }, { id: 't', tr: 'İntegrasyon süresi', en: 'Integration time', def: '60', u: 'T', ud: 2 }],
      compute(G) { const arw = G.r('arw'), fs = G.v('fs'), t = G.v('t'); if (!(arw > 0)) return [['—', tt('ARW girin', 'Enter ARW')]]; const nd = arw / 60;
        const it = [[sig(nd, 4) + ' °/s/√Hz', tt('Gürültü yoğunluğu', 'Noise density'), 'big'], [sig(nd * 1000, 4) + ' mdps/√Hz', tt('Aynı değer, mdps/√Hz', 'Same value, mdps/√Hz')], [sig(nd * 3600, 4) + ' °/h/√Hz', tt('Aynı değer, °/h/√Hz', 'Same value, °/h/√Hz')]];
        if (fs > 0) it.push([sig(nd * Math.sqrt(fs), 4) + ' °/s', tt('Bu hızda tek örnek gürültüsü σ (RMS)', 'Single-sample noise σ at this rate (RMS)')]);
        if (t > 0) it.push([sig(arw * Math.sqrt(t / 3600), 4) + ' °', tt('Bu sürede açı rastgele yürüyüşü (1σ)', 'Angle random walk over this time (1σ)')]);
        return it; } },
    { id: 'gerr', group: 'err', title: ['Desteksiz yönelim / baş hatası', 'Unaided attitude / heading error'], sub: ['Δθ(t) ≈ √((ARW·√t)² + (BI·t)²) + b_rep·t + SF·θ_toplam', 'Δθ(t) ≈ √((ARW·√t)² + (BI·t)²) + b_rep·t + SF·θ_total'],
      fields: [{ id: 'bi', tr: 'Bias kararsızlığı (°/h)', en: 'Bias instability (°/h)', def: '5' }, { id: 'arw', tr: 'ARW (°/√h)', en: 'ARW (°/√h)', def: '0.3' }, { id: 'rep', tr: 'Kalan bias (kestirilmemiş, °/h, isteğe bağlı)', en: 'Residual bias (not estimated, °/h, optional)', def: '', help: ['GNSS kesintisinden önce filtre bias\'ı kestirdiyse 0; soğuk açılışta açılış tekrarlanabilirliği.', '0 if the filter estimated the bias before the GNSS outage; turn-on repeatability after a cold start.'] }, { id: 'sf', tr: 'Ölçek faktörü hatası (ppm)', en: 'Scale factor error (ppm)', def: '500' }, { id: 'rot', tr: 'Bu sürede toplam dönüş (°)', en: 'Total rotation over the time (°)', def: '360' }, { id: 't', tr: 'Desteksiz süre', en: 'Unaided time', def: '60', u: 'T', ud: 2 }],
      compute(G) { const bi = G.r('bi'), arw = G.r('arw') || 0, rep = G.r('rep') || 0, sf = G.r('sf') || 0, rot = G.r('rot') || 0, t = G.v('t'); if (!(bi >= 0 && t > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const a = arw * Math.sqrt(t / 3600), b = bi * t / 3600, r = rep * t / 3600, s = sf * 1e-6 * rot, tot = Math.hypot(a, b) + r + s;
        return [[sig(tot, 3) + ' °', tt('Toplam açı hatası (yaklaşık)', 'Total angle error (approx.)'), 'big'], [sig(a, 3) + ' °', tt('ARW katkısı (1σ)', 'ARW share (1σ)')], [sig(b, 3) + ' °', tt('Bias kararsızlığı katkısı', 'Bias-instability share')], [sig(r, 3) + ' °', tt('Kalan bias katkısı', 'Residual-bias share')], [sig(s, 3) + ' °', tt('Ölçek faktörü katkısı', 'Scale-factor share')], [tt(...GYRO_GRADE(bi)), tt('Bias kararsızlığına göre sınıf', 'Grade by bias instability')]]; } },
    { id: 'ggc', group: 'err', title: ['Gyrocompassing (kuzey bulma) doğruluğu', 'Gyrocompassing (north-finding) accuracy'], sub: ['Ω_E = 15,041 °/h;  Δψ_bias ≈ b / (Ω_E·cos φ);  Δψ_ARW ≈ ARW / (Ω_E·cos φ·√T) [rad]', 'Ω_E = 15.041 °/h;  Δψ_bias ≈ b / (Ω_E·cos φ);  Δψ_ARW ≈ ARW / (Ω_E·cos φ·√T) [rad]'],
      fields: [{ id: 'b', tr: 'Etkin gyro bias\'ı (°/h)', en: 'Effective gyro bias (°/h)', def: '0.01', help: ['Hizalama süresi boyunca ortalanan bias: bias kararsızlığı ve açılış tekrarlanabilirliği.', 'Bias averaged over the alignment time: bias instability and turn-on repeatability.'] }, { id: 'lat', tr: 'Enlem (°)', en: 'Latitude (°)', def: '39.9' }, { id: 'acc', tr: 'İstenen baş doğruluğu (°, isteğe bağlı)', en: 'Required heading accuracy (°, optional)', def: '1' }, { id: 'arw', tr: 'ARW (°/√h)', en: 'ARW (°/√h)', def: '0.002' }, { id: 'ta', tr: 'Hizalama süresi', en: 'Alignment time', def: '300', u: 'T', ud: 2, help: ['Durağan hizalama süresi; ARW kaynaklı baş gürültüsü σ ≈ ARW / (Ω_E·cos φ·√T).', 'Static alignment time; ARW-driven heading noise σ ≈ ARW / (Ω_E·cos φ·√T).'] }],
      compute(G) { const b = G.r('b'), lat = G.r('lat') || 0, acc = G.r('acc'), we = 15.041 * Math.cos(lat * Math.PI / 180); if (!(b > 0) || !(we > 0.01)) return [['—', tt('Bias ve enlem girin (kutupta yapılamaz)', 'Enter bias and latitude (not possible at the poles)')]];
        const arw = G.r('arw') || 0, Ta = G.v('ta'), dB = Math.atan(b / we) * 180 / Math.PI, dN = Ta > 0 ? Math.atan(arw * 60 / Math.sqrt(Ta) / we) * 180 / Math.PI : 0, dpsi = Math.hypot(dB, dN);   // ARW [°/√h]·60/√T[s] = rate noise in °/h
        const it = [[sig(dpsi, 3) + ' °', tt('Baş belirsizliği (bias + ARW)', 'Heading uncertainty (bias + ARW)'), 'big ' + (acc > 0 ? (dpsi <= acc ? 'good' : 'bad') : '')], [sig(dB, 3) + ' °', tt('Bias katkısı', 'Bias share')], [sig(dN, 3) + ' °', tt('ARW katkısı (bu hizalama süresinde)', 'ARW share (for this alignment time)')], [sig(we, 4) + ' °/h', tt('Yatay dünya dönüş bileşeni Ω_E·cos φ', 'Horizontal Earth-rate component Ω_E·cos φ')], [sig(dpsi * 60, 3) + ' ′', tt('Aynı değer, açı dakikası', 'Same value, arc minutes')]];
        if (acc > 0) it.push([sig(we * Math.tan(acc * Math.PI / 180), 3) + ' °/h', tt('Bu doğruluk için gereken bias', 'Bias needed for this accuracy')], [tt(...GYRO_GRADE(we * Math.tan(acc * Math.PI / 180))), tt('Gereken sınıf', 'Required grade')]);
        return it; } },
    { id: 'gap', group: 'allan', title: ['Allan variance test planı', 'Allan variance test plan'], sub: ['K = T/τ küme;  belirsizlik ≈ 1/√(2(K−1));  ±%10 için T ≈ 51·τ', 'K = T/τ clusters;  uncertainty ≈ 1/√(2(K−1));  ±10 % needs T ≈ 51·τ'],
      fields: ALLAN_PLAN_FIELDS, note: ALLAN_PLAN_NOTE(['Jiroskopta Dünya dönüşü (15 °/h·sin φ düşey eksende) sabit bir bias gibi görünür; Allan eğrisini etkilemez ama ortalamayı kaydırır.', 'For gyros, Earth rate (15 °/h·sin φ on the vertical axis) appears as a constant bias; it does not affect the Allan curve but shifts the mean.']),
      compute(G) { return allanPlanCompute(G); } },
    { id: 'gam', group: 'allan', title: ['Allan sapma modeli (veri sayfasından)', 'Allan deviation model (from the datasheet)'], sub: ['σ²(τ) = 3Q²/τ² + N²/τ + (0,664·B)² + K²τ/3 + R²τ²/2', 'σ²(τ) = 3Q²/τ² + N²/τ + (0.664·B)² + K²τ/3 + R²τ²/2'],
      plot: (G) => { const p = gyroModel(G), taus = logTaus(0.01, 1e5, 80); const sv = [{ pts: taus.map((t) => [t, adModel(t, p) * 3600]), col: 'var(--c)', w: 2.4 }];
        const parts = [['n', '#2563eb', tt('ARW (−½)', 'ARW (−½)')], ['b', '#d97706', tt('Bias kararsızlığı (0)', 'Bias instability (0)')], ['k', '#9333ea', tt('RRW (+½)', 'RRW (+½)')]];
        parts.forEach(([k, c]) => { if (p[k] > 0) sv.push({ pts: taus.map((t) => [t, adModel(t, { [k]: p[k] }) * 3600]), col: c, dash: '4 4', w: 1.2 }); });
        return plotBox(llPlot({ title: tt('Jiroskop Allan sapması (model)', 'Gyro Allan deviation (model)'), xlab: tt('τ (s)', 'τ (s)'), ylab: 'σ(τ) [°/h]', series: sv, marks: [{ x: 1, y: adModel(1, p) * 3600, label: 'τ=1 s' }] }), [['var(--c)', tt('Toplam', 'Total')], ...parts.filter(([k]) => p[k] > 0).map(([, c, n]) => [c, n, true])]); },
      fields: [{ id: 'arw', tr: 'ARW (°/√h)', en: 'ARW (°/√h)', def: '0.3' }, { id: 'bi', tr: 'Bias kararsızlığı (°/h)', en: 'Bias instability (°/h)', def: '5' }, { id: 'rrw', tr: 'RRW (°/h/√h, isteğe bağlı)', en: 'RRW (°/h/√h, optional)', def: '5' }],
      compute(G) { const p = gyroModel(G); let mi = 1, mv = Infinity; for (const t of logTaus(0.01, 1e5, 200)) { const v = adModel(t, p); if (v < mv) { mv = v; mi = t; } }
        return [[sig(mv * 3600, 3) + ' °/h', tt('Eğrinin minimumu (= 0,664·BI + diğer terimler)', 'Curve minimum (= 0.664·BI + other terms)'), 'big'], [sig(mi, 3) + ' s', tt('Minimumun τ\'su (test planında τ_maks bunun birkaç katı)', 'τ of the minimum (τ_max in the test plan is a few times this)')], [sig(adModel(1, p) * 3600, 3) + ' °/h', tt('σ(1 s)', 'σ(1 s)')], [tt(...GYRO_GRADE(G.r('bi'))), tt('Sınıf (BI)', 'Grade (BI)')]]; } },
    { id: 'gad', group: 'allan', title: ['Allan sapması: kayıtlı veri analizi', 'Allan deviation: analysis of logged data'], sub: ['Örtüşen Allan sapması; ARW = σ(τ)·√τ (−½ eğim), BI = min σ / 0,664, RRW = σ·√(3/τ) (+½ eğim)', 'Overlapping Allan deviation; ARW = σ(τ)·√τ (−½ slope), BI = min σ / 0.664, RRW = σ·√(3/τ) (+½ slope)'],
      fields: AD_FIELDS({ id: 'un', tr: 'Veri birimi', en: 'Data unit', def: 'dps', sel: [['dps', '°/s', '°/s'], ['rads', 'rad/s', 'rad/s'], ['mdps', 'mdps', 'mdps'], ['dph', '°/h', '°/h']] },
        [{ id: 'arw', tr: 'Karşılaştırma: veri sayfası ARW (°/√h)', en: 'Compare: datasheet ARW (°/√h)', def: '0.3' }, { id: 'bi', tr: 'Karşılaştırma: veri sayfası BI (°/h)', en: 'Compare: datasheet BI (°/h)', def: '5' }]),
      note: ['Dosya: her satır bir örnek; birden çok sütun varsa "Veri sütunu" ile seçin (ör. x-ekseni jiroskop = 2). Veri ham ve filtresiz, sabit hızda, boşluksuz olmalıdır. Analiz tarayıcıda yapılır; veri gönderilmez.', 'File: one sample per line; with several columns pick one with "Data column" (e.g. x gyro = 2). Data must be raw, unfiltered, at a constant rate and gap-free. Analysis runs in the browser; nothing is uploaded.'],
      plot: allanDataPlot('gad', { unit: ['veri birimi', 'data unit'], model: (G) => { const k = gyroUnit(G); return { n: (G.r('arw') || 0) / 60 * Math.PI / 180 / k.toRad, b: (G.r('bi') || 0) / 3600 * Math.PI / 180 / k.toRad }; } }),
      compute: allanDataCompute('gad', { conv: (fit, G) => { const k = gyroUnit(G), dps = (x) => x * k.toRad * 180 / Math.PI; const arw = dps(fit.n) * 60, bi = dps(fit.b) * 3600, rrw = dps(fit.k) * 3600 * 60;
        return [[isFinite(arw) ? sig(arw, 3) + ' °/√h' : '—', tt('ARW (ölçülen)', 'ARW (measured)'), 'big'], [isFinite(bi) ? sig(bi, 3) + ' °/h' : '—', tt('Bias kararsızlığı (ölçülen)', 'Bias instability (measured)'), 'big'], [sig(fit.tauMin, 3) + ' s', tt('Minimumun τ\'su', 'τ of the minimum')], [isFinite(rrw) ? sig(rrw, 3) + ' °/h/√h' : tt('görünmüyor (daha uzun kayıt)', 'not visible (longer log)'), 'RRW'], [isFinite(arw) ? sig(arw / 60, 3) + ' °/s/√Hz' : '—', tt('Gürültü yoğunluğu', 'Noise density')], [isFinite(bi) ? tt(...GYRO_GRADE(bi)) : '—', tt('Sınıf (ölçülen BI)', 'Grade (measured BI)')]]; } }) },
  ],
};
function gyroModel(G) { return { n: (G.r('arw') || 0) / 60, b: (G.r('bi') || 0) / 3600, k: (G.r('rrw') || 0) / 3600 / 60 }; }   // in °/s units: N [°/s·√s] = ARW/60, B [°/s] = BI/3600, K [°/s/√s] = RRW/216000; ×3600 for °/h
function gyroUnit(G) { return { dps: { toRad: Math.PI / 180 }, rads: { toRad: 1 }, mdps: { toRad: Math.PI / 180 / 1000 }, dph: { toRad: Math.PI / 180 / 3600 } }[G.s('un')] || { toRad: Math.PI / 180 }; }

/* ---------------- accelerometer ---------------- */
const G0 = 9.80665;
const ACC_GRADE = (ug) => (ug <= 1 ? ['Stratejik', 'Strategic'] : ug <= 10 ? ['Navigasyon', 'Navigation'] : ug <= 50 ? ['Taktik', 'Tactical'] : ug <= 200 ? ['Endüstriyel', 'Industrial'] : ['Tüketici', 'Consumer']);
CMP.accel = {
  parent: 'sensor', name: ['İvmeölçer', 'Accelerometer'],
  title: ['İvmeölçer Seçimi, Parametreleri ve Allan Variance', 'Accelerometer Selection, Parameters and Allan Variance'],
  sub: ['Doğrusal ivme / eğim sensörü: bias kararsızlığı, VRW, ölçek faktörü, titreşim doğrultma; teknoloji karşılaştırması ve Allan variance araçları.', 'Linear acceleration / tilt sensor: bias instability, VRW, scale factor, vibration rectification; technology comparison and Allan variance tools.'],
  params: [
    ['Ölçüm aralığı', 'Range', 'g', 'Doymadan ölçülen en büyük ivme. Titreşim tepe değerlerini de kapsamalı; doyma bias\'ta kalıcı kayma (doğrultma) oluşturur.', 'Largest acceleration measured without saturation. Must cover vibration peaks too; saturation causes a lasting bias shift (rectification).', '±2 … ±200 g'],
    ['Bias kararsızlığı (in-run)', 'Bias instability (in-run)', 'µg', 'Sabit sıcaklıkta bias dalgalanması (Allan minimumu / 0,664). Eğim doğruluğu ≈ bias/g [rad]; 100 µg ≈ 0,0057°.', 'Bias wander at constant temperature (Allan minimum / 0.664). Tilt accuracy ≈ bias/g [rad]; 100 µg ≈ 0.0057°.', 'tüketici > 100 · taktik 10–50 · navigasyon ≤ 10'],
    ['Hız rastgele yürüyüşü (VRW)', 'Velocity random walk (VRW)', 'm/s/√h', 'Beyaz gürültünün integrali: hız hatası σ = VRW·√t. 1 µg/√Hz ≈ 0,000588 m/s/√h.', 'Integral of white noise: velocity error σ = VRW·√t. 1 µg/√Hz ≈ 0.000588 m/s/√h.', '0,005 … 0,5 m/s/√h'],
    ['Gürültü yoğunluğu', 'Noise density', 'µg/√Hz', 'σ = ND·√BW. Titreşim ölçümünde ve eğim gürültüsünde belirleyici.', 'σ = ND·√BW. Decisive for vibration measurement and tilt noise.', '10 … 300 µg/√Hz (MEMS)'],
    ['Açılış bias tekrarlanabilirliği', 'Turn-on bias repeatability', 'mg', 'Açılıştan açılışa bias farkı; desteksiz navigasyon ve hassas eğimde kritik.', 'Bias change between power-ups; critical for unaided navigation and precise tilt.', '0,05 … 20 mg'],
    ['Bias sıcaklık katsayısı', 'Bias temperature coefficient', 'mg/°C', 'Sıcaklıkla bias değişimi; termal kalibrasyonla düşürülür.', 'Bias change with temperature; reduced by thermal calibration.', '0,005 … 0,5 mg/°C'],
    ['Ölçek faktörü hatası / sıcaklık', 'Scale factor error / tempco', 'ppm, ppm/°C', 'Yüksek ivmeli manevralarda hız hatasına dönüşür.', 'Turns into velocity error during high-g manoeuvres.', '100 … 5000 ppm'],
    ['Doğrusalsızlık', 'Nonlinearity', '%FS, µg/g²', 'İkinci dereceden katsayı titreşimde bias\'a doğrultulur.', 'The second-order coefficient rectifies vibration into bias.', '0,1 … 1 %FS'],
    ['Titreşim doğrultma hatası (VRE)', 'Vibration rectification error (VRE)', 'µg/g²rms', 'Titreşimin ortalamada bias oluşturması; titreşimli platformda en önemli hata olabilir.', 'Vibration producing an average bias; can be the dominant error on vibrating platforms.', '1 … 1000 µg/g²'],
    ['Eksenler arası duyarlılık', 'Cross-axis sensitivity', '%', 'Diğer eksendeki ivmenin görünmesi; kalibrasyonla düzeltilir.', 'Acceleration on another axis appearing; corrected by calibration.', '0,1 … 2 %'],
    ['Bant genişliği / ODR', 'Bandwidth / ODR', 'Hz', 'Navigasyon için 100–400 Hz; titreşim ölçümü için kHz. Örtüşmeyi önlemek için iç filtre ODR/2\'nin altında olmalı.', '100–400 Hz for navigation; kHz for vibration measurement. Internal filter must sit below ODR/2 to avoid aliasing.', '50 … 10 000 Hz'],
    ['Kalibrasyon (sensör modeli)', 'Calibration (sensor model)', '—', 'Doğrusal model: düzeltilmiş = S·M·(ham − b); S ölçek faktörü (köşegen), M hizasızlık/eksenler arası (6 terim), b bias. En küçük kareler ile kestirilir; sıcaklık (look-up/polinom), doğrusalsızlık ve sıcaklık değişim hızı terimleri eklenebilir. Ömür boyunca en çok değişen terim bias\'tır.', 'Linear model: corrected = S·M·(raw − b); S scale factor (diagonal), M misalignment/cross-axis (6 terms), b bias. Estimated by least squares; temperature (look-up/polynomial), nonlinearity and thermal-ramp terms can be added. Bias is the term that changes most over life.', '—'],
    ['Kalibrasyon / karakterizasyon testleri', 'Calibration / characterisation tests', '—', 'Tumble test (eksenler ±1 g ve dik konumlarda) ile bias, ölçek ve hizasızlık; termal kabinde sıcaklık kalibrasyonu; Allan variance; sarsıcı ile sinüs taramasında bant genişliği.', 'Tumble test (axes at ±1 g and perpendicular) for bias, scale and misalignment; thermal-chamber temperature calibration; Allan variance; shaker sine sweep for bandwidth.', '—'],
    ['Titreşim ve aralık aşımı', 'Vibration and over-range', '—', 'Titreşim tepe değeri aralığı aşarsa ölçüm kırpılır ve bias\'a doğrultulur; ham sensör görünümünde aralık aşımı görülürse aralığı büyütün (Orientus: ivme 2/4/16 g, jiroskop 250/500/2000 °/s seçilebilir) veya izolatör kullanın.', 'If vibration peaks exceed the range the signal clips and rectifies into bias; if the raw view shows over-range, increase the range (Orientus: accel 2/4/16 g, gyro 250/500/2000 °/s selectable) or use isolators.', '—'],
    ['Şok dayanımı', 'Shock survival', 'g', 'Düşme/çarpma dayanımı (genelde 10 000 g, 0,1 ms).', 'Drop / impact survival (typically 10 000 g, 0.1 ms).', '1 000 … 20 000 g'],
  ],
  tech: {
    title: ['İvmeölçer teknolojileri', 'Accelerometer technologies'],
    head: [['Teknoloji', 'Technology'], ['Bias kararsızlığı', 'Bias instability'], ['Gürültü', 'Noise'], ['Bant', 'Bandwidth'], ['Maliyet', 'Cost'], ['Sınıf', 'Grade'], ['Tipik kullanım', 'Typical use']],
    rows: [
      [['MEMS kapasitif (tüketici)', 'MEMS capacitive (consumer)'], '50–500 µg', '100–300 µg/√Hz', 'DC–1 kHz', ['çok düşük', 'very low'], ['Tüketici', 'Consumer'], ['Telefon, giyilebilir, adım sayar', 'Phone, wearable, pedometer']],
      [['MEMS kapasitif (endüstriyel)', 'MEMS capacitive (industrial)'], '10–100 µg', '20–100 µg/√Hz', 'DC–500 Hz', ['düşük', 'low'], ['Endüstriyel', 'Industrial'], ['AHRS, eğim, İHA, robot', 'AHRS, tilt, UAV, robot']],
      [['MEMS kapalı çevrim / navigasyon MEMS', 'MEMS closed-loop / navigation MEMS'], '2–20 µg', '5–25 µg/√Hz', 'DC–300 Hz', ['orta', 'medium'], ['Taktik–navigasyon', 'Tactical–navigation'], ['INS, ölçme, sondaj', 'INS, survey, drilling']],
      [['Kuvars servo (sarkaçlı)', 'Quartz servo (pendulous)'], '1–25 µg', '1–10 µg/√Hz', 'DC–300 Hz', ['yüksek', 'high'], ['Navigasyon', 'Navigation'], ['Uçak/gemi INS', 'Aircraft/ship INS']],
      [['Titreşen kiriş (VBA, rezonans)', 'Vibrating beam (VBA, resonant)'], '1–10 µg', '1–10 µg/√Hz', 'DC–1 kHz', ['yüksek', 'high'], ['Navigasyon–stratejik', 'Navigation–strategic'], ['Yüksek dinamikli INS', 'High-dynamic INS']],
      [['Örnek: Orientus (MEMS AHRS)', 'Example: Orientus (MEMS AHRS)'], '20 µg', '100 µg/√Hz', '400 Hz', ['—', '—'], ['Taktik (in-run)', 'Tactical (in-run)'], ['±2/4/16 g; başlangıç bias\'ı < 5 mg', '±2/4/16 g; initial bias < 5 mg']],
      [['Örnek: Motus (MEMS IMU)', 'Example: Motus (MEMS IMU)'], '8 µg', '2 µg/√Hz', '250 Hz', ['—', '—'], ['Navigasyon (in-run)', 'Navigation (in-run)'], ['±10 g; başlangıç bias\'ı < 0,45 mg', '±10 g; initial bias < 0.45 mg']],
      [['Piezoelektrik (IEPE)', 'Piezoelectric (IEPE)'], ['DC ölçmez', 'no DC'], '10–100 µg/√Hz', '1 Hz–20 kHz', ['orta', 'medium'], ['—', '—'], ['Titreşim, şok, durum izleme', 'Vibration, shock, condition monitoring']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'tilt', opts: [['cons', 'Hareket / adım algılama', 'Motion / step detection'], ['tilt', 'Hassas eğim (inklinometre)', 'Precise tilt (inclinometer)'], ['ahrs', 'AHRS / GNSS destekli INS', 'AHRS / GNSS-aided INS'], ['nav', 'Desteksiz navigasyon', 'Unaided navigation'], ['vib', 'Titreşim / durum izleme', 'Vibration / condition monitoring']] },
      { id: 'rng', tr: 'İvme / titreşim seviyesi', en: 'Acceleration / vibration level', def: 'l', opts: [['l', '< 4 g', '< 4 g'], ['m', '4–16 g', '4–16 g'], ['h', '> 16 g (darbe, motor)', '> 16 g (impact, engine)']] },
    ],
    run(v) {
      const R = { cons: ['Tüketici MEMS (±2–16 g)', 'Consumer MEMS (±2–16 g)', 'Düşük güç ve FIFO/olay kesmesi önemli; bias önemsiz.', 'Low power and FIFO/event interrupts matter; bias does not.'],
        tilt: ['Düşük gürültülü, düşük bias sıcaklık katsayılı MEMS (±2 g)', 'Low-noise MEMS with low bias tempco (±2 g)', 'Eğim hatası ≈ bias/g: 0,01° için ≈ 175 µg kararlı bias gerekir; termal kalibrasyon şart.', 'Tilt error ≈ bias/g: 0.01° needs ≈ 175 µg stable bias; thermal calibration is a must.'],
        ahrs: ['Endüstriyel–taktik MEMS (≤ 50 µg)', 'Industrial–tactical MEMS (≤ 50 µg)', 'VRW ve VRE (titreşim doğrultma) belirleyici.', 'VRW and VRE (vibration rectification) are decisive.'],
        nav: ['Kuvars servo veya navigasyon MEMS (≤ 10 µg in-run)', 'Quartz servo or navigation MEMS (≤ 10 µg in-run)', 'Desteksiz konum hatası ½·b·t²; 10 µg kalan bias 10 dk\'da ≈ 18 m, 25 µg ≈ 44 m.', 'Unaided position error ½·b·t²; 10 µg residual bias gives ≈ 18 m in 10 min, 25 µg ≈ 44 m.'],
        vib: ['Piezo (IEPE) veya geniş bantlı MEMS', 'Piezo (IEPE) or wide-band MEMS', 'Bant genişliği ve gürültü yoğunluğu belirleyici; DC gerekmiyorsa piezo.', 'Bandwidth and noise density decide; piezo if DC is not needed.'] }[v.app];
      const why = [[R[2], R[3]]];
      if (v.rng === 'h') why.push(['> 16 g: doyma titreşimi doğrultur; aralığı tepe titreşimin 2 katı seçin ve mekanik filtre kullanın.', '> 16 g: saturation rectifies vibration; choose range 2× the peak vibration and use mechanical filtering.']);
      return { main: [R[0], R[1]], why };
    },
  },
  calcGroups: [
    ['conv', 'Gürültü dönüşümü', 'Noise conversion', 'µg/√Hz, VRW ve σ arasında dönüşüm.', 'Conversion between µg/√Hz, VRW and σ.'],
    ['err', 'Hata bütçesi', 'Error budget', 'Eğim doğruluğu ve desteksiz hız/konum hatası.', 'Tilt accuracy and unaided velocity/position error.'],
    ['allan', 'Allan variance', 'Allan variance', 'Test planı ve kayıtlı statik verinin analizi (VRW, bias kararsızlığı).', 'Test plan and analysis of logged static data (VRW, bias instability).'],
  ],
  calcs: [
    { id: 'acv', group: 'conv', title: ['Gürültü yoğunluğu ↔ VRW ↔ σ', 'Noise density ↔ VRW ↔ σ'], sub: ['VRW [m/s/√h] = ND [µg/√Hz]·9,80665e−6·60;  σ = ND·√BW', 'VRW [m/s/√h] = ND [µg/√Hz]·9.80665e−6·60;  σ = ND·√BW'],
      fields: [{ id: 'nd', tr: 'Gürültü yoğunluğu (µg/√Hz)', en: 'Noise density (µg/√Hz)', def: '60' }, { id: 'bw', tr: 'Bant genişliği / ODR', en: 'Bandwidth / ODR', def: '100', u: 'F', ud: 0 }, { id: 't', tr: 'İntegrasyon süresi', en: 'Integration time', def: '60', u: 'T', ud: 2 }],
      compute(G) { const nd = G.r('nd'), bw = G.v('bw'), t = G.v('t'); if (!(nd > 0)) return [['—', tt('Gürültü yoğunluğu girin', 'Enter noise density')]]; const vrw = nd * 1e-6 * G0 * 60;
        const it = [[sig(vrw, 4) + ' m/s/√h', 'VRW', 'big'], [sig(vrw / 60, 4) + ' m/s/√s', tt('VRW, m/s/√s', 'VRW, m/s/√s')]];
        if (bw > 0) it.push([sig(nd * Math.sqrt(bw), 4) + ' µg', tt('Bu bantta σ (RMS)', 'σ in this band (RMS)')], [sig(Math.atan(nd * 1e-6 * Math.sqrt(bw)) * 180 / Math.PI, 3) + ' °', tt('Eğim gürültüsü (1σ, tek örnek)', 'Tilt noise (1σ, single sample)')]);
        if (t > 0) it.push([sig(vrw * Math.sqrt(t / 3600), 4) + ' m/s', tt('Bu sürede hız rastgele yürüyüşü (1σ)', 'Velocity random walk over this time (1σ)')]);
        return it; } },
    { id: 'aerr', group: 'err', title: ['Eğim doğruluğu ve desteksiz hız/konum hatası', 'Tilt accuracy and unaided velocity/position error'], sub: ['Eğim ≈ b/g;  Δv = b·t;  Δp = ½·b·t² (+ VRW: σ_p = VRW·t^1,5/√3)', 'Tilt ≈ b/g;  Δv = b·t;  Δp = ½·b·t² (+ VRW: σ_p = VRW·t^1.5/√3)'],
      fields: [{ id: 'b', tr: 'Kalan bias (µg)', en: 'Residual bias (µg)', def: '50' }, { id: 'vrw', tr: 'VRW (m/s/√h)', en: 'VRW (m/s/√h)', def: '0.04' }, { id: 't', tr: 'Desteksiz süre', en: 'Unaided time', def: '60', u: 'T', ud: 2 }],
      note: ['Konum hatası kısa süreler için (≲ 10 dk) geçerlidir; daha uzun sürede Schuler salınımı (84,4 dk) hatayı sınırlar ama jiroskop hatası baskın hale gelir.', 'The position error holds for short times (≲ 10 min); longer, the Schuler oscillation (84.4 min) bounds it but gyro error becomes dominant.'],
      compute(G) { const b = G.r('b'), vrw = G.r('vrw') || 0, t = G.v('t'); if (!(b >= 0 && t > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]]; const a = b * 1e-6 * G0;
        return [[sig(0.5 * a * t * t, 3) + ' m', tt('Bias kaynaklı konum hatası', 'Bias-driven position error'), 'big'], [sig(Math.atan(b * 1e-6) * 180 / Math.PI, 3) + ' °', tt('Eğim hatası', 'Tilt error')], [sig(a * t, 3) + ' m/s', tt('Hız hatası', 'Velocity error')], [sig(vrw / 60 * Math.pow(t, 1.5) / Math.sqrt(3), 3) + ' m', tt('VRW kaynaklı konum (1σ)', 'VRW-driven position (1σ)')], [tt(...ACC_GRADE(b)), tt('Bias\'a göre sınıf', 'Grade by bias')]]; } },
    { id: 'aap', group: 'allan', title: ['Allan variance test planı', 'Allan variance test plan'], sub: ['K = T/τ küme;  belirsizlik ≈ 1/√(2(K−1))', 'K = T/τ clusters;  uncertainty ≈ 1/√(2(K−1))'], fields: ALLAN_PLAN_FIELDS,
      note: ALLAN_PLAN_NOTE(['İvmeölçerde her eksen yerçekimine göre sabit konumda kalmalı (eğim değişirse bias gibi görünür); masanın eğimi ve sıcaklık kaydedilir.', 'For accelerometers each axis must stay fixed relative to gravity (a tilt change looks like bias); log table tilt and temperature.']), compute(G) { return allanPlanCompute(G); } },
    { id: 'aad', group: 'allan', title: ['Allan sapması: kayıtlı veri analizi', 'Allan deviation: analysis of logged data'], sub: ['VRW = σ(1 s); BI = min σ / 0,664', 'VRW = σ(1 s); BI = min σ / 0.664'],
      fields: AD_FIELDS({ id: 'un', tr: 'Veri birimi', en: 'Data unit', def: 'g', sel: [['g', 'g', 'g'], ['mg', 'mg', 'mg'], ['ms2', 'm/s²', 'm/s²']] }, [{ id: 'vrw', tr: 'Karşılaştırma: VRW (m/s/√h)', en: 'Compare: VRW (m/s/√h)', def: '0.04' }, { id: 'bi', tr: 'Karşılaştırma: BI (µg)', en: 'Compare: BI (µg)', def: '40' }]),
      note: ['Dosya: her satır bir örnek; birden çok sütun varsa "Veri sütunu" ile seçin. Analiz tarayıcıda yapılır.', 'File: one sample per line; pick a column with "Data column" when there are several. Analysis runs in the browser.'],
      plot: allanDataPlot('aad', { unit: ['veri birimi', 'data unit'], model: (G) => { const k = accUnit(G); return { n: (G.r('vrw') || 0) / 60 / k, b: (G.r('bi') || 0) * 1e-6 * G0 / k }; } }),
      compute: allanDataCompute('aad', { conv: (fit, G) => { const k = accUnit(G), vrw = fit.n * k * 60, bi = fit.b * k / G0 * 1e6;
        return [[isFinite(vrw) ? sig(vrw, 3) + ' m/s/√h' : '—', tt('VRW (ölçülen)', 'VRW (measured)'), 'big'], [isFinite(bi) ? sig(bi, 3) + ' µg' : '—', tt('Bias kararsızlığı (ölçülen)', 'Bias instability (measured)'), 'big'], [sig(fit.tauMin, 3) + ' s', tt('Minimumun τ\'su', 'τ of the minimum')], [isFinite(vrw) ? sig(vrw / 60 / G0 * 1e6, 3) + ' µg/√Hz' : '—', tt('Gürültü yoğunluğu', 'Noise density')], [isFinite(bi) ? tt(...ACC_GRADE(bi)) : '—', tt('Sınıf (ölçülen BI)', 'Grade (measured BI)')]]; } }) },
  ],
};
function accUnit(G) { return { g: G0, mg: G0 / 1000, ms2: 1 }[G.s('un')] || G0; }   // data unit → m/s²

/* ---------------- magnetometer ---------------- */
CMP.mag = {
  parent: 'sensor', name: ['Manyetometre', 'Magnetometer'],
  title: ['Manyetometre Seçimi, Parametreleri ve Kalibrasyon', 'Magnetometer Selection, Parameters and Calibration'],
  sub: ['Manyetik alan / pusula sensörü: gürültü, ofset, hard/soft iron kalibrasyonu, baş açısı hata bütçesi ve Allan variance.', 'Magnetic field / compass sensor: noise, offset, hard/soft-iron calibration, heading error budget and Allan variance.'],
  params: [
    ['Ölçüm aralığı', 'Range', 'µT / G', 'Dünya alanı 25–65 µT (0,25–0,65 G). Motor, hoparlör ve akım taşıyan iletkenler yakınında ±1–8 G aralık gerekebilir; doyma kalıcı ofset (perming) bırakabilir.', 'Earth field is 25–65 µT (0.25–0.65 G). Near motors, speakers and current-carrying conductors ±1–8 G may be needed; saturation can leave a lasting offset (perming).', '±0,8 … ±16 G'],
    ['Gürültü / gürültü yoğunluğu', 'Noise / noise density', 'nT RMS, nT/√Hz', 'Baş açısı gürültüsü ≈ σ_B / B_yatay [rad]. Yatay alan 20 µT iken 100 nT → 0,29°.', 'Heading noise ≈ σ_B / B_horizontal [rad]. With 20 µT horizontal field, 100 nT → 0.29°.', '1 … 500 nT RMS'],
    ['Çözünürlük', 'Resolution', 'nT/LSB', 'Bir LSB\'nin alan karşılığı; gürültüden küçük olmalı.', 'Field per LSB; should be below the noise.', '1 … 150 nT/LSB'],
    ['Ofset (sıfır alan çıkışı)', 'Offset (zero-field output)', 'µT', 'Sensörün kendi ofseti; kalibrasyonda hard-iron ile birlikte kestirilir.', 'Sensor\'s own offset; estimated together with hard-iron during calibration.', '±0,1 … ±10 µT'],
    ['Ofset sıcaklık kayması', 'Offset temperature drift', 'nT/°C', 'Sıcaklıkla ofset değişimi; set/reset (AMR) veya kopyalama (chopping) ile azaltılır.', 'Offset change with temperature; reduced by set/reset (AMR) or chopping.', '1 … 100 nT/°C'],
    ['Ölçek faktörü / doğrusalsızlık', 'Scale factor / nonlinearity', '%, %FS', 'Eksenler arası kazanç farkı baş hatasına ikinci harmonik olarak yansır.', 'Gain mismatch between axes shows up as a second-harmonic heading error.', '0,1 … 2 %'],
    ['Eksenler arası duyarlılık', 'Cross-axis sensitivity', '%', 'Soft-iron matrisiyle birlikte kalibre edilir.', 'Calibrated together with the soft-iron matrix.', '0,1 … 2 %'],
    ['Histerezis / perming', 'Hysteresis / perming', 'nT', 'Güçlü alana maruz kaldıktan sonra kalan ofset; set/reset darbesiyle silinir.', 'Offset remaining after exposure to a strong field; cleared by a set/reset pulse.', '—'],
    ['ODR / bant', 'ODR / bandwidth', 'Hz', 'Pusula için 10–100 Hz yeterli; ortalama gürültüyü √N azaltır.', '10–100 Hz is enough for a compass; averaging reduces noise by √N.', '10 … 1000 Hz'],
    ['Hard-iron etkisi', 'Hard-iron effect', 'µT', 'Kart üzerindeki kalıcı mıknatıs ve DC akımların sabit ofseti; elipsoidin merkezi kayar. Kalibrasyonla çıkarılır.', 'Constant offset of permanent magnets and DC currents on the board; shifts the ellipsoid centre. Removed by calibration.', '1 … 100 µT'],
    ['Statik / dinamik manyetik girişim', 'Static / dynamic magnetic interference', '—', 'Statik: araca bağlı çelik ve mıknatıslar; montajdan sonra yapılan manyetik kalibrasyonla giderilir. Dinamik: yüksek akımlı kablolar, motorlar, servolar, solenoidler ve sensörle birlikte hareket etmeyen çelik kütleler; kalibrasyonla giderilemez. Araç çalışırken ama dururken ham manyetometre değerleri dalgalanıyorsa dinamik girişim vardır; sensörü uzaklaştırın ya da manyetometreyi devre dışı bırakıp başka baş kaynağı kullanın.', 'Static: steel and magnets fixed to the vehicle; removed by a magnetic calibration after installation. Dynamic: high-current wiring, motors, servos, solenoids and steel masses that do not move with the sensor; calibration cannot remove it. If raw magnetometer values fluctuate while the vehicle runs but stands still, dynamic interference is present; move the sensor away or disable the magnetometer and use another heading source.', '—'],
    ['Soft-iron etkisi', 'Soft-iron effect', '—', 'Yakındaki ferromanyetik malzemenin alanı yönlendirmesi; küre elipsoide döner. 3×3 matrisle düzeltilir.', 'Nearby ferromagnetic material bending the field; the sphere becomes an ellipsoid. Corrected by a 3×3 matrix.', '—'],
  ],
  tech: {
    title: ['Manyetometre teknolojileri', 'Magnetometer technologies'],
    head: [['Teknoloji', 'Technology'], ['Gürültü', 'Noise'], ['Ofset kararlılığı', 'Offset stability'], ['Güç', 'Power'], ['Maliyet', 'Cost'], ['Tipik kullanım', 'Typical use']],
    rows: [
      [['Hall etkisi', 'Hall effect'], '100–500 nT', ['zayıf', 'poor'], ['düşük', 'low'], ['çok düşük', 'very low'], ['Telefon pusulası, kapak algılama', 'Phone compass, lid detection']],
      [['AMR (anizotropik)', 'AMR (anisotropic)'], '1–10 nT/√Hz', ['iyi (set/reset ile)', 'good (with set/reset)'], ['orta', 'medium'], ['düşük', 'low'], ['Pusula, AHRS, araç algılama', 'Compass, AHRS, vehicle detection']],
      [['TMR / GMR', 'TMR / GMR'], '0,1–5 nT/√Hz', ['orta', 'fair'], ['düşük', 'low'], ['düşük–orta', 'low–medium'], ['Düşük güçlü hassas pusula', 'Low-power precise compass']],
      [['Manyeto-endüktif', 'Magneto-inductive'], '~10 nT', ['iyi', 'good'], ['düşük', 'low'], ['orta', 'medium'], ['Pusula, robot', 'Compass, robot']],
      [['Örnek: Orientus / Motus (AHRS içi)', 'Example: Orientus / Motus (inside the AHRS)'], '210 µG/√Hz = 21 nT/√Hz', ['—', '—'], ['—', '—'], ['—', '—'], ['±2/4/8 G (Orientus), ±8 G (Motus); 110 Hz', '±2/4/8 G (Orientus), ±8 G (Motus); 110 Hz']],
      [['Fluxgate', 'Fluxgate'], '5–20 pT/√Hz', ['çok iyi', 'very good'], ['yüksek', 'high'], ['yüksek', 'high'], ['Jeofizik, uzay, hassas baş', 'Geophysics, space, precise heading']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'comp', opts: [['cons', 'Telefon / basit pusula', 'Phone / simple compass'], ['comp', 'AHRS / araç pusulası (≤ 1°)', 'AHRS / vehicle compass (≤ 1°)'], ['prec', 'Hassas baş (≤ 0,3°)', 'Precise heading (≤ 0.3°)'], ['geo', 'Jeofizik / anomali ölçümü', 'Geophysics / anomaly survey']] },
      { id: 'env', tr: 'Manyetik ortam', en: 'Magnetic environment', def: 'm', opts: [['c', 'Temiz (kompozit gövde)', 'Clean (composite body)'], ['m', 'Orta (PCB akımları, vidalar)', 'Moderate (PCB currents, screws)'], ['d', 'Kirli (motor, çelik gövde)', 'Dirty (motors, steel body)']] },
    ],
    run(v) {
      const R = { cons: ['Hall / AMR çip', 'Hall / AMR chip', 'Kullanıcı kalibrasyonu (8 hareketi) ile ±5° tipik.', '±5° typical with user calibration (figure-8).'], comp: ['AMR veya TMR (≤ 10 nT/√Hz)', 'AMR or TMR (≤ 10 nT/√Hz)', 'Hard/soft-iron kalibrasyonu ve eğim kompanzasyonu (ivmeölçer) gerekir.', 'Needs hard/soft-iron calibration and tilt compensation (accelerometer).'], prec: ['Düşük gürültülü AMR/TMR veya fluxgate', 'Low-noise AMR/TMR or fluxgate', 'Eğim hatası baş hatasına eklenir; eğimi 0,1° içinde bilmek gerekir.', 'Tilt error adds to heading error; tilt must be known to within 0.1°.'], geo: ['Fluxgate (veya optik pompalı)', 'Fluxgate (or optically pumped)', 'pT düzeyi gürültü ve çok kararlı ofset gerekir.', 'Needs pT-level noise and very stable offset.'] }[v.app];
      const why = [[R[2], R[3]]];
      if (v.env === 'd') why.push(['Kirli ortam: sensörü motor ve yüksek akımlı hatlardan uzağa (direk/kanat ucu) taşıyın, aralığı büyük seçin, sahada kalibrasyon yapın ve manyetometreyi GNSS çift anten başı ile destekleyin.', 'Dirty environment: move the sensor away from motors and high-current lines (mast/wing tip), choose a larger range, calibrate in place and back it with dual-antenna GNSS heading.']);
      else if (v.env === 'm') why.push(['Akım taşıyan izleri ve ferromanyetik parçaları (vida, konnektör kabuğu) sensörden ≥ 2–3 cm uzak tutun.', 'Keep current-carrying traces and ferromagnetic parts (screws, connector shells) ≥ 2–3 cm away from the sensor.']);
      return { main: [R[0], R[1]], why };
    },
  },
  calcGroups: [
    ['head', 'Baş açısı hatası', 'Heading error', 'Alan hatası, gürültü ve eğim hatasının baş açısına etkisi.', 'Effect of field error, noise and tilt error on heading.'],
    ['allan', 'Allan variance', 'Allan variance', 'Test planı ve kayıtlı statik verinin analizi.', 'Test plan and analysis of logged static data.'],
  ],
  calcs: [
    { id: 'mhe', group: 'head', title: ['Baş açısı hata bütçesi', 'Heading error budget'], sub: ['B_yatay = B·cos(I);  Δψ ≈ atan(δB / B_yatay);  eğim katkısı ≈ Δθ·tan(I)', 'B_h = B·cos(I);  Δψ ≈ atan(δB / B_h);  tilt share ≈ Δθ·tan(I)'],
      fields: [{ id: 'b', tr: 'Toplam alan B (µT)', en: 'Total field B (µT)', def: '48', help: ['Türkiye\'de ≈ 46–50 µT, eğim açısı ≈ 55–60°. NOAA/WMM hesaplayıcısından bulunabilir.', 'In Turkey ≈ 46–50 µT, inclination ≈ 55–60°. Available from the NOAA/WMM calculator.'] }, { id: 'inc', tr: 'Eğim (inclination) açısı (°)', en: 'Inclination angle (°)', def: '57' }, { id: 'n', tr: 'Gürültü (nT RMS)', en: 'Noise (nT RMS)', def: '50' }, { id: 'res', tr: 'Kalibrasyon sonrası kalan alan hatası (nT)', en: 'Residual field error after calibration (nT)', def: '200' }, { id: 'tilt', tr: 'Eğim (tilt) hatası (°)', en: 'Tilt error (°)', def: '0.2' }],
      compute(G) { const B = G.r('b') * 1000, inc = (G.r('inc') || 0) * Math.PI / 180, n = G.r('n') || 0, res = G.r('res') || 0, tl = G.r('tilt') || 0; if (!(B > 0)) return [['—', tt('Alan değerini girin', 'Enter the field')]];
        const Bh = B * Math.cos(inc), d = (x) => Math.atan(x / Bh) * 180 / Math.PI, an = d(n), ar = d(res), at = tl * Math.tan(inc), tot = Math.sqrt(an * an + ar * ar + at * at);
        return [[sig(tot, 3) + ' °', tt('Toplam baş hatası (RSS)', 'Total heading error (RSS)'), 'big'], [sig(Bh / 1000, 3) + ' µT', tt('Yatay alan', 'Horizontal field')], [sig(an, 3) + ' °', tt('Gürültü katkısı', 'Noise share')], [sig(ar, 3) + ' °', tt('Kalan kalibrasyon hatası katkısı', 'Residual calibration share')], [sig(at, 3) + ' °', tt('Eğim hatası katkısı (en kötü yön)', 'Tilt-error share (worst heading)')]]; } },
    { id: 'map', group: 'allan', title: ['Allan variance test planı', 'Allan variance test plan'], sub: ['K = T/τ küme;  belirsizlik ≈ 1/√(2(K−1))', 'K = T/τ clusters;  uncertainty ≈ 1/√(2(K−1))'], fields: ALLAN_PLAN_FIELDS,
      note: ALLAN_PLAN_NOTE(['Manyetometrede test manyetik olarak sessiz bir yerde (tercihen manyetik kalkan / mu-metal kutu) yapılır; yakındaki araç, asansör ve güç kabloları alan değişimi olarak görünür.', 'For magnetometers, test in a magnetically quiet place (ideally a mu-metal shield); nearby vehicles, lifts and power cables show up as field changes.']), compute(G) { return allanPlanCompute(G); } },
    { id: 'mad', group: 'allan', title: ['Allan sapması: kayıtlı veri analizi', 'Allan deviation: analysis of logged data'], sub: ['Beyaz gürültü = σ(1 s) [birim/√Hz]; ofset kararsızlığı = min σ / 0,664', 'White noise = σ(1 s) [unit/√Hz]; offset instability = min σ / 0.664'],
      fields: AD_FIELDS({ id: 'un', tr: 'Veri birimi', en: 'Data unit', def: 'ut', sel: [['ut', 'µT', 'µT'], ['nt', 'nT', 'nT'], ['g', 'G (gauss)', 'G (gauss)']] }, [{ id: 'nd', tr: 'Karşılaştırma: gürültü yoğunluğu (nT/√Hz)', en: 'Compare: noise density (nT/√Hz)', def: '5' }]),
      plot: allanDataPlot('mad', { unit: ['veri birimi', 'data unit'], model: (G) => ({ n: (G.r('nd') || 0) / magUnit(G) }) }),
      compute: allanDataCompute('mad', { conv: (fit, G) => { const k = magUnit(G), nd = fit.n * k, bi = fit.b * k; return [[isFinite(nd) ? sig(nd, 3) + ' nT/√Hz' : '—', tt('Gürültü yoğunluğu (ölçülen)', 'Noise density (measured)'), 'big'], [isFinite(bi) ? sig(bi, 3) + ' nT' : '—', tt('Ofset kararsızlığı', 'Offset instability'), 'big'], [sig(fit.tauMin, 3) + ' s', tt('Minimumun τ\'su', 'τ of the minimum')]]; } }) },
  ],
};
function magUnit(G) { return { ut: 1000, nt: 1, g: 1e5 }[G.s('un')] || 1000; }   // data unit → nT

/* ---------------- barometer ---------------- */
const isaAlt = (p, p0) => 44330.77 * (1 - Math.pow(p / p0, 0.190263));
CMP.baro = {
  parent: 'sensor', name: ['Barometre', 'Barometer'],
  title: ['Barometrik Basınç Sensörü Seçimi ve Parametreleri', 'Barometric Pressure Sensor Selection and Parameters'],
  sub: ['Mutlak basınç / irtifa sensörü: mutlak ve bağıl doğruluk, gürültü, sıcaklık katsayısı; ISA irtifa hesabı ve Allan variance.', 'Absolute pressure / altitude sensor: absolute and relative accuracy, noise, temperature coefficient; ISA altitude and Allan variance.'],
  params: [
    ['Basınç aralığı', 'Pressure range', 'hPa', 'Deniz seviyesinde ≈ 1013 hPa; 10 km\'de ≈ 265 hPa. Uygulamanın en yüksek irtifasını kapsamalı.', '≈ 1013 hPa at sea level; ≈ 265 hPa at 10 km. Must cover the highest altitude of the application.', '300 … 1100 hPa (260–1260)'],
    ['Mutlak doğruluk', 'Absolute accuracy', 'hPa', 'Gerçek basınca göre hata; deniz seviyesinde 1 hPa ≈ 8,4 m irtifa.', 'Error against true pressure; at sea level 1 hPa ≈ 8.4 m of altitude.', '±0,3 … ±1 hPa'],
    ['Bağıl doğruluk', 'Relative accuracy', 'hPa', 'İki ölçüm arası farkın doğruluğu (aynı sıcaklıkta); kat/yükseklik değişimi için önemli olan budur.', 'Accuracy of a difference between two readings (same temperature); this is what matters for floor/height changes.', '±0,02 … ±0,12 hPa'],
    ['RMS gürültü', 'RMS noise', 'Pa', 'Belirli aşırı örnekleme (OSR) ve IIR filtre ayarında; 1 Pa ≈ 8,4 cm.', 'At a given oversampling (OSR) and IIR filter setting; 1 Pa ≈ 8.4 cm.', '0,3 … 5 Pa'],
    ['Sıcaklık katsayısı', 'Temperature coefficient', 'Pa/K', 'Sıcaklık değişimi bağıl irtifa hatasına dönüşür; sensör hava akışından ve ısı kaynaklarından korunmalı.', 'Temperature change becomes relative altitude error; shield the sensor from airflow and heat sources.', '±0,5 … ±1,5 Pa/K'],
    ['Uzun vadeli kararlılık', 'Long-term stability', 'hPa/yıl', 'Yıllık kayma; mutlak irtifa için periyodik QNH düzeltmesi gerekir.', 'Yearly drift; absolute altitude needs periodic QNH correction.', '±0,1 … ±1 hPa/yıl'],
    ['Lehim kayması', 'Solder drift', 'hPa', 'Reflow sonrası ofset kayması; montaj sonrası kalibrasyonla giderilir.', 'Offset shift after reflow; removed by post-assembly calibration.', '±0,2 … ±1 hPa'],
    ['ODR / aşırı örnekleme / IIR', 'ODR / oversampling / IIR', 'Hz', 'Gürültü ↔ gecikme ödünleşimi; dikey hız için 25–50 Hz ve IIR kapalı/düşük tercih edilir.', 'Noise ↔ latency trade-off; for vertical speed prefer 25–50 Hz with IIR off/low.', '1 … 200 Hz'],
    ['Akım tüketimi', 'Current consumption', 'µA', 'ODR ve OSR ile artar; pilli cihazlarda belirleyici.', 'Rises with ODR and OSR; decisive for battery devices.', '1 … 1000 µA'],
  ],
  tech: {
    title: ['Basınç sensörü teknolojileri', 'Pressure sensor technologies'],
    head: [['Teknoloji', 'Technology'], ['Gürültü', 'Noise'], ['Mutlak doğruluk', 'Absolute accuracy'], ['Kararlılık', 'Stability'], ['Maliyet', 'Cost'], ['Tipik kullanım', 'Typical use']],
    rows: [
      [['MEMS piezorezistif', 'MEMS piezoresistive'], '1–5 Pa', '±0,5–1 hPa', ['orta', 'fair'], ['çok düşük', 'very low'], ['Telefon, giyilebilir, hava istasyonu', 'Phone, wearable, weather station']],
      [['MEMS kapasitif', 'MEMS capacitive'], '0,3–2 Pa', '±0,3–0,5 hPa', ['iyi', 'good'], ['düşük', 'low'], ['Dron, kat tespiti, irtifa', 'Drone, floor detection, altitude']],
      [['Rezonans (silikon / kuvars)', 'Resonant (silicon / quartz)'], '< 0,1 Pa', '±0,01–0,05 hPa', ['çok iyi', 'very good'], ['yüksek', 'high'], ['Hava veri bilgisayarı, meteoroloji referansı', 'Air-data computer, meteorological reference']],
    ],
  },
  wiz: {
    fields: [{ id: 'app', tr: 'Uygulama', en: 'Application', def: 'drone', opts: [['wx', 'Hava durumu / mutlak basınç', 'Weather / absolute pressure'], ['floor', 'Kat tespiti (≤ 1 m bağıl)', 'Floor detection (≤ 1 m relative)'], ['drone', 'Dron irtifa tutma / dikey hız', 'Drone altitude hold / vertical speed'], ['air', 'Hava veri / altimetre', 'Air data / altimeter']] }],
    run(v) {
      const R = { wx: ['Mutlak doğruluğu ±0,5 hPa olan MEMS', 'MEMS with ±0.5 hPa absolute accuracy', 'Uzun vadeli kararlılık ve nem korumalı paket önemli.', 'Long-term stability and a humidity-protected package matter.'], floor: ['Düşük gürültülü MEMS (≤ 1 Pa, bağıl ±0,06 hPa)', 'Low-noise MEMS (≤ 1 Pa, relative ±0.06 hPa)', 'Bağıl doğruluk ve sıcaklık katsayısı belirleyici; hava basıncı değişimi referans istasyonla düzeltilir.', 'Relative accuracy and temperature coefficient decide; weather pressure changes are corrected by a reference station.'], drone: ['Düşük gürültülü kapasitif MEMS', 'Low-noise capacitive MEMS', 'Pervane hava akışı ve güneş ısınmasından köpük/kapakla koruyun; ivmeölçerle birleştirin.', 'Shield it from propwash and sunlight with foam/cover; fuse with the accelerometer.'], air: ['Rezonans (silikon/kuvars) sensör', 'Resonant (silicon/quartz) sensor', 'Statik port, sıcaklık kompanzasyonu ve sertifikasyon gereksinimleri belirleyici.', 'Static port, temperature compensation and certification requirements decide.'] }[v.app];
      return { main: [R[0], R[1]], why: [[R[2], R[3]]] };
    },
  },
  calcGroups: [
    ['alt', 'İrtifa', 'Altitude', 'ISA modeliyle basınçtan irtifa, irtifa çözünürlüğü ve sıcaklık etkisi.', 'Altitude from pressure with the ISA model, altitude resolution and temperature effect.'],
    ['allan', 'Allan variance', 'Allan variance', 'Test planı ve kayıtlı statik verinin analizi.', 'Test plan and analysis of logged static data.'],
  ],
  calcs: [
    { id: 'balt', group: 'alt', title: ['Basınçtan irtifa (ISA)', 'Altitude from pressure (ISA)'], sub: ['h = 44330,8·(1 − (P/P₀)^0,190263);  dh/dP ≈ −R·T/(g·M·P)', 'h = 44330.8·(1 − (P/P₀)^0.190263);  dh/dP ≈ −R·T/(g·M·P)'],
      fields: [{ id: 'p', tr: 'Ölçülen basınç (hPa)', en: 'Measured pressure (hPa)', def: '900' }, { id: 'p0', tr: 'Deniz seviyesi basıncı QNH (hPa)', en: 'Sea-level pressure QNH (hPa)', def: '1013.25' }, { id: 'n', tr: 'Sensör gürültüsü (Pa RMS)', en: 'Sensor noise (Pa RMS)', def: '1.5' }, { id: 'acc', tr: 'Mutlak doğruluk (hPa)', en: 'Absolute accuracy (hPa)', def: '0.5' }, { id: 'tc', tr: 'Sıcaklık katsayısı (Pa/K)', en: 'Temperature coefficient (Pa/K)', def: '1' }, { id: 'dt', tr: 'Sıcaklık değişimi (K)', en: 'Temperature change (K)', def: '10' }],
      compute(G) { const p = G.r('p'), p0 = G.r('p0') || 1013.25, n = G.r('n') || 0, acc = G.r('acc') || 0, tc = G.r('tc') || 0, dt = G.r('dt') || 0; if (!(p > 0)) return [['—', tt('Basıncı girin', 'Enter the pressure')]];
        const h = isaAlt(p, p0), dhdp = (isaAlt(p - 0.01, p0) - isaAlt(p + 0.01, p0)) / 0.02;   // m per hPa
        return [[sig(h, 5) + ' m', tt('ISA irtifası', 'ISA altitude'), 'big'], [sig(dhdp, 3) + ' m/hPa', tt('Bu basınçta duyarlılık', 'Sensitivity at this pressure')], [sig(n / 100 * dhdp * 100, 3) + ' cm', tt('Gürültü kaynaklı irtifa gürültüsü (1σ)', 'Altitude noise from sensor noise (1σ)')], [sig(acc * dhdp, 3) + ' m', tt('Mutlak irtifa belirsizliği', 'Absolute altitude uncertainty')], [sig(tc * dt / 100 * dhdp, 3) + ' m', tt('Sıcaklık değişiminin bağıl irtifa hatası', 'Relative altitude error from the temperature change')], [sig(p0 - p, 4) + ' hPa', tt('QNH\'ye göre fark', 'Difference to QNH')]]; } },
    { id: 'bap', group: 'allan', title: ['Allan variance test planı', 'Allan variance test plan'], sub: ['K = T/τ küme;  belirsizlik ≈ 1/√(2(K−1))', 'K = T/τ clusters;  uncertainty ≈ 1/√(2(K−1))'], fields: ALLAN_PLAN_FIELDS,
      note: ALLAN_PLAN_NOTE(['Barometrede ortam basıncı hava durumuyla değişir (saatte ~1 hPa); uzun τ için sensörü sabit basınçlı kapalı bir hazneye koyun veya referans sensörle farkı analiz edin.', 'For barometers, ambient pressure changes with the weather (~1 hPa per hour); for long τ place the sensor in a sealed constant-pressure chamber or analyse the difference to a reference sensor.']), compute(G) { return allanPlanCompute(G); } },
    { id: 'bad', group: 'allan', title: ['Allan sapması: kayıtlı veri analizi', 'Allan deviation: analysis of logged data'], sub: ['Beyaz gürültü = σ(1 s) [Pa/√Hz]; bias kararsızlığı = min σ / 0,664', 'White noise = σ(1 s) [Pa/√Hz]; bias instability = min σ / 0.664'],
      fields: AD_FIELDS({ id: 'un', tr: 'Veri birimi', en: 'Data unit', def: 'pa', sel: [['pa', 'Pa', 'Pa'], ['hpa', 'hPa', 'hPa']] }, [{ id: 'nd', tr: 'Karşılaştırma: gürültü yoğunluğu (Pa/√Hz)', en: 'Compare: noise density (Pa/√Hz)', def: '0.3' }]),
      plot: allanDataPlot('bad', { unit: ['veri birimi', 'data unit'], model: (G) => ({ n: (G.r('nd') || 0) / (G.s('un') === 'hpa' ? 100 : 1) }) }),
      compute: allanDataCompute('bad', { conv: (fit, G) => { const k = G.s('un') === 'hpa' ? 100 : 1, nd = fit.n * k, bi = fit.b * k; return [[isFinite(nd) ? sig(nd, 3) + ' Pa/√Hz' : '—', tt('Gürültü yoğunluğu (ölçülen)', 'Noise density (measured)'), 'big'], [isFinite(bi) ? sig(bi, 3) + ' Pa' : '—', tt('Bias kararsızlığı', 'Bias instability'), 'big'], [isFinite(bi) ? sig(bi * 0.084, 3) + ' m' : '—', tt('İrtifa karşılığı (deniz seviyesi)', 'Altitude equivalent (sea level)')], [sig(fit.tauMin, 3) + ' s', tt('Minimumun τ\'su', 'τ of the minimum')]]; } }) },
  ],
};

/* ---------------- navigation grades ---------------- */
const NAV_GRADES = [   // [name tr, en, gyro BI °/h, ARW °/√h, accel BI µg, VRW m/s/√h, unaided drift tr, en, tech tr, en, use tr, en]
  ['Tüketici', 'Consumer', '> 10', '> 0,5', '> 200', '> 0,1', 'saniyeler içinde kullanılamaz', 'unusable within seconds', 'MEMS', 'MEMS', 'Telefon, giyilebilir, oyun', 'Phone, wearable, gaming'],
  ['Endüstriyel', 'Industrial', '1–10', '0,1–0,5', '50–200', '0,05–0,1', 'dakikalar içinde km', 'km within minutes', 'MEMS', 'MEMS', 'AHRS, robot, İHA, tarım', 'AHRS, robot, UAV, agriculture'],
  ['Taktik', 'Tactical', '0,01–1', '0,002–0,1', '10–50', '0,005–0,05', 'dakikalar içinde yüzlerce m; saatlik desteksiz kullanım için yetersiz', 'hundreds of m within minutes; not enough for hours unaided', 'yüksek sınıf MEMS, FOG', 'high-end MEMS, FOG', 'Güdümlü mühimmat, İHA, ölçme', 'Guided munitions, UAV, survey'],
  ['Navigasyon', 'Navigation', '0,001–0,01', '0,0005–0,002', '1–10', '0,001–0,005', '≈ 1 deniz mili/saat (≈ 1,85 km/h)', '≈ 1 nmi/h (≈ 1.85 km/h)', 'RLG, FOG, HRG', 'RLG, FOG, HRG', 'Ticari/askerî uçak, gemi', 'Commercial/military aircraft, ship'],
  ['Stratejik', 'Strategic', '< 0,001', '< 0,0005', '< 1', '< 0,001', 'günlerce ≪ 1 deniz mili/saat', '≪ 1 nmi/h over days', 'RLG, ESG, HRG, kuvars VBA', 'RLG, ESG, HRG, quartz VBA', 'Denizaltı, stratejik füze, uzay', 'Submarine, strategic missile, space'],
];
CMP.navgrade = {
  parent: 'sensor', name: ['Navigasyon sınıfları', 'Navigation grades'],
  title: ['IMU / INS Navigasyon Sınıfları', 'IMU / INS Navigation Grades'],
  sub: ['Tüketici, endüstriyel, taktik, navigasyon ve stratejik sınıflar: jiroskop/ivmeölçer kriterleri, desteksiz drift, sınıf belirleme ve desteksiz INS hata hesabı.', 'Consumer, industrial, tactical, navigation and strategic grades: gyro/accel criteria, unaided drift, grade classification and unaided INS error.'],
  params: [
    ['Sınıfı belirleyen ana kriter', 'Main grade criterion', '°/h', 'Jiroskop bias kararsızlığı (in-run, Allan minimumu). Desteksiz navigasyonda yönelim hatası ve dolayısıyla konum hatası buna bağlıdır.', 'Gyro bias instability (in-run, Allan minimum). Unaided attitude error, and therefore position error, depends on it.', '—'],
    ['İkincil kriterler', 'Secondary criteria', '—', 'ARW (kısa süre gürültüsü), ivmeölçer bias kararsızlığı ve VRW, ölçek faktörü, açılış tekrarlanabilirliği, sıcaklık davranışı.', 'ARW (short-term noise), accelerometer bias instability and VRW, scale factor, turn-on repeatability, temperature behaviour.', '—'],
    ['Desteksiz konum hatası (kısa süre)', 'Unaided position error (short term)', 'm', 'İvmeölçer bias\'ı: ½·b·t²; jiroskop bias\'ı (eğim hatası yerçekimini sızdırır): ⅙·g·ω_b·t³. Uzun sürede Schuler salınımı (84,4 dk) hatayı sınırlar.', 'Accelerometer bias: ½·b·t²; gyro bias (tilt error leaks gravity): ⅙·g·ω_b·t³. Longer, the Schuler oscillation (84.4 min) bounds it.', '—'],
    ['Destekli (GNSS/INS) çalışma', 'Aided (GNSS/INS) operation', '—', 'GNSS varken düşük sınıf IMU da iyi sonuç verir; sınıf, GNSS kesintisinde ne kadar süre taşınabileceğini belirler.', 'With GNSS a lower-grade IMU still performs well; the grade sets how long it can coast through a GNSS outage.', '—'],
    ['Gyrocompassing', 'Gyrocompassing', '°/h', 'Baş hatası ≈ bias / (15,04 °/h·cos φ). 1° için ≈ 0,2 °/h (taktik) teorik olarak yeter; 0,1° ve altı için navigasyon sınıfı (≈ 0,01 °/h → ≈ 0,05°) gerekir. ARW hizalama süresini belirler.', 'Heading error ≈ bias / (15.04 °/h·cos φ). For 1° about 0.2 °/h (tactical) is enough in theory; 0.1° and better needs navigation grade (≈ 0.01 °/h → ≈ 0.05°). ARW sets the alignment time.', '—'],
    ['İvmeölçer kriteri hakkında', 'About the accelerometer criterion', 'µg', 'Güncel MEMS ivmeölçerlerin in-run bias kararsızlığı birkaç µg\'a inebilir (örn. Motus 8 µg); bu yüzden sınıf esas olarak jiroskopla belirlenir. Açılış bias\'ı ve sıcaklık kayması (Orientus: başlangıç bias\'ı < 5 mg) desteksiz performansta daha belirleyici olabilir.', 'The in-run bias instability of current MEMS accelerometers can reach a few µg (e.g. Motus 8 µg), so the grade is set mainly by the gyro. Turn-on bias and temperature drift (Orientus: initial bias < 5 mg) can matter more for unaided performance.', '—'],
    ['İhracat kontrolü', 'Export control', '—', 'Taktik ve üstü IMU/jiroskoplar çift kullanımlı ürün listelerinde (ör. Wassenaar, EAR/ITAR) olabilir; tedarik ve ihracat lisansını erken kontrol edin.', 'Tactical and higher IMUs/gyros can be on dual-use lists (e.g. Wassenaar, EAR/ITAR); check procurement and export licensing early.', '—'],
  ],
  tech: {
    title: ['Navigasyon sınıfları (tipik aralıklar)', 'Navigation grades (typical ranges)'],
    head: [['Sınıf', 'Grade'], ['Gyro BI (°/h)', 'Gyro BI (°/h)'], ['ARW (°/√h)', 'ARW (°/√h)'], ['İvme BI (µg)', 'Accel BI (µg)'], ['VRW (m/s/√h)', 'VRW (m/s/√h)'], ['Desteksiz drift', 'Unaided drift'], ['Teknoloji', 'Technology'], ['Tipik kullanım', 'Typical use']],
    rows: [...NAV_GRADES.map((g) => [[g[0], g[1]], g[2], g[3], g[4], g[5], [g[6], g[7]], [g[8], g[9]], [g[10], g[11]]]),
      [['Örnek: Motus (MEMS IMU, v2.5.0) → taktik', 'Example: Motus (MEMS IMU, v2.5.0) → tactical'], '0,2', '0,1 (6 °/h/√Hz)', '8', '0,0012 (2 µg/√Hz)', ['GNSS destekli: 0,8 m yatay', 'GNSS-aided: 0.8 m horizontal'], 'MEMS', ['İHA, gimbal, AUV/ROV, hidrografi', 'UAV, gimbal, AUV/ROV, hydrography']],
      [['Örnek: Orientus (MEMS AHRS, v1.6) → endüstriyel', 'Example: Orientus (MEMS AHRS, v1.6) → industrial'], '3', '0,24 (0,004 °/s/√Hz)', '20', '0,059 (100 µg/√Hz)', ['roll/pitch 0,2°, baş 0,5° (statik)', 'roll/pitch 0.2°, heading 0.5° (static)'], 'MEMS', ['AHRS, araç, deniz, robot', 'AHRS, vehicle, marine, robot']]],
  },
  wiz: {
    fields: [
      { id: 'gap', tr: 'GNSS kesintisinde gereken süre', en: 'Time needed through a GNSS outage', def: 'm', opts: [['n', 'Yok (GNSS her zaman var)', 'None (GNSS always available)'], ['s', '< 10 s', '< 10 s'], ['m', '10 s – 2 dk', '10 s – 2 min'], ['l', '2 – 30 dk', '2 – 30 min'], ['h', 'Saatler', 'Hours']] },
      { id: 'north', tr: 'Manyetometresiz kuzey bulma', en: 'North finding without magnetometer', def: 'n', opts: [['n', 'Gerekmiyor', 'Not needed'], ['y', 'Gerekli (gyrocompassing)', 'Needed (gyrocompassing)']] },
    ],
    run(v) {
      const g = v.north === 'y' ? 3 : { n: 1, s: 1, m: 2, l: 2, h: 3 }[v.gap], G = NAV_GRADES[g];
      const why = [[ 'Önerilen sınıfın kriterleri: jiroskop BI ' + G[2] + ' °/h, ivme BI ' + G[4] + ' µg; desteksiz drift ' + G[6] + '.', 'Criteria of the suggested grade: gyro BI ' + G[2] + ' °/h, accel BI ' + G[4] + ' µg; unaided drift ' + G[7] + '.' ]];
      if (v.gap === 'n') why.push(['GNSS sürekliyse endüstriyel MEMS yeterlidir; yönelim için manyetometre veya çift antenli GNSS ekleyin.', 'With continuous GNSS an industrial MEMS is enough; add a magnetometer or dual-antenna GNSS for heading.']);
      if (v.north === 'y') why.push(['Gyrocompassing ile ≤ 0,1° baş için ≤ 0,01 °/h jiroskop gerekir; ≈ 1° yeterliyse taktik sınıf (≈ 0,2 °/h) da olur. Daha düşük sınıfta çift antenli GNSS ile baş bulunur.', 'Gyrocompassing to ≤ 0.1° heading needs ≤ 0.01 °/h gyros; if ≈ 1° is enough a tactical grade (≈ 0.2 °/h) works. With a lower grade use dual-antenna GNSS heading.']);
      why.push(['Taktik ve üstü sınıflarda ihracat lisansı gerekebilir.', 'Tactical and higher grades may need an export licence.']);
      return { main: [G[0] + ' sınıfı (' + G[8] + ')', G[1] + ' grade (' + G[9] + ')'], why };
    },
  },
  calcGroups: [
    ['cls', 'Sınıf belirleme', 'Classification', 'Veri sayfası değerlerinden sınıfı parametre parametre bulur.', 'Finds the grade parameter by parameter from datasheet values.'],
    ['ins', 'Desteksiz INS hatası', 'Unaided INS error', 'GNSS kesintisinde konum ve yönelim hatasının büyümesi.', 'Growth of position and attitude error during a GNSS outage.'],
  ],
  calcs: [
    { id: 'ncl', group: 'cls', title: ['Veri sayfasından sınıf belirleme', 'Grade from the datasheet'], sub: ['Her parametre ayrı sınıflanır; IMU\'nun sınıfı en zayıf kritik parametreyle sınırlıdır', 'Each parameter is graded separately; the IMU is limited by its weakest critical parameter'],
      fields: [{ id: 'gbi', tr: 'Jiroskop bias kararsızlığı (°/h)', en: 'Gyro bias instability (°/h)', def: '0.2' }, { id: 'arw', tr: 'ARW (°/√h)', en: 'ARW (°/√h)', def: '0.1', help: ['Veri sayfası °/h/√Hz veriyorsa 60 ile bölün (Motus: 6 °/h/√Hz → 0,1 °/√h).', 'If the datasheet gives °/h/√Hz divide by 60 (Motus: 6 °/h/√Hz → 0.1 °/√h).'] }, { id: 'abi', tr: 'İvmeölçer bias kararsızlığı (µg)', en: 'Accel bias instability (µg)', def: '8' }, { id: 'vrw', tr: 'VRW (m/s/√h)', en: 'VRW (m/s/√h)', def: '0.0012', help: ['µg/√Hz × 0,000588 (Motus: 2 µg/√Hz → 0,0012 m/s/√h).', 'µg/√Hz × 0.000588 (Motus: 2 µg/√Hz → 0.0012 m/s/√h).'] }],
      note: ['Varsayılan değerler Advanced Navigation Motus veri sayfasından (v2.5.0): jiroskop 0,2 °/h ve 6 °/h/√Hz, ivmeölçer 8 µg ve 2 µg/√Hz. Sonuç: jiroskop taktik, ivmeölçer navigasyon düzeyinde; IMU bütününde taktik sınıf.', 'Defaults are from the Advanced Navigation Motus datasheet (v2.5.0): gyro 0.2 °/h and 6 °/h/√Hz, accelerometer 8 µg and 2 µg/√Hz. Result: gyro tactical, accelerometer navigation level; the IMU as a whole is tactical grade.'],
      compute(G) {
        const lvl = (v, th) => (!(v > 0) ? -1 : v <= th[0] ? 4 : v <= th[1] ? 3 : v <= th[2] ? 2 : v <= th[3] ? 1 : 0), nm = (i) => (i < 0 ? '—' : tt(NAV_GRADES[i][0], NAV_GRADES[i][1]));
        const a = lvl(G.r('gbi'), [0.001, 0.01, 1, 10]), b = lvl(G.r('arw'), [0.0005, 0.002, 0.1, 0.5]), c = lvl(G.r('abi'), [1, 10, 50, 200]), d = lvl(G.r('vrw'), [0.001, 0.005, 0.05, 0.1]);
        const all = [a, b, c, d].filter((x) => x >= 0); if (!all.length) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const cls = (x) => (x >= 3 ? 'good' : x === 2 ? 'warn' : '');
        return [[nm(Math.min(...all)), tt('IMU sınıfı (en zayıf parametre)', 'IMU grade (weakest parameter)'), 'big ' + cls(Math.min(...all))], [nm(a), tt('Jiroskop BI', 'Gyro BI'), cls(a)], [nm(b), 'ARW', cls(b)], [nm(c), tt('İvme BI', 'Accel BI'), cls(c)], [nm(d), 'VRW', cls(d)]];
      } },
    { id: 'nins', group: 'ins', title: ['Desteksiz INS hata büyümesi', 'Unaided INS error growth'], sub: ['Δp ≈ ½·b_a·t² + ⅙·g·ω_b·t³ + g·ARW·t^2,5/√20 + VRW·t^1,5/√3 (t ≪ 84 dk)', 'Δp ≈ ½·b_a·t² + ⅙·g·ω_b·t³ + g·ARW·t^2.5/√20 + VRW·t^1.5/√3 (t ≪ 84 min)'],
      fields: [{ id: 'gbi', tr: 'Kalan jiroskop bias\'ı (°/h)', en: 'Residual gyro bias (°/h)', def: '1' }, { id: 'arw', tr: 'ARW (°/√h)', en: 'ARW (°/√h)', def: '0.08' }, { id: 'abi', tr: 'Kalan ivme bias\'ı (µg)', en: 'Residual accel bias (µg)', def: '20' }, { id: 'vrw', tr: 'VRW (m/s/√h)', en: 'VRW (m/s/√h)', def: '0.03' }, { id: 't', tr: 'GNSS kesinti süresi', en: 'GNSS outage time', def: '60', u: 'T', ud: 2 }, { id: 'lim', tr: 'İzin verilen konum hatası (m, isteğe bağlı)', en: 'Allowed position error (m, optional)', def: '10' }],
      note: ['Kısa süre yaklaşımıdır (Schuler periyodu 84,4 dk\'nın çok altında) ve hizalama/ölçek hatalarını içermez. Navigasyon sınıfında 1 saatte ≈ 1 deniz mili beklenir; bu hesap o süre için geçerli değildir.', 'Short-time approximation (well below the 84.4 min Schuler period); excludes alignment and scale errors. Navigation grade gives ≈ 1 nmi in 1 hour; this formula does not apply that long.'],
      plot: (G) => { const p = insErr(G), T = G.v('t') || 60, ts = logTaus(Math.max(T / 1000, 0.1), T * 3, 60);
        const sv = [{ pts: ts.map((t) => [t, insErr(G, t).tot]), col: 'var(--c)', w: 2.4 }, { pts: ts.map((t) => [t, insErr(G, t).acc]), col: '#2563eb', dash: '4 4', w: 1.2 }, { pts: ts.map((t) => [t, insErr(G, t).gyr]), col: '#d97706', dash: '4 4', w: 1.2 }, { pts: ts.map((t) => [t, insErr(G, t).rw]), col: '#9333ea', dash: '4 4', w: 1.2 }];
        return plotBox(llPlot({ title: tt('Desteksiz konum hatası', 'Unaided position error'), xlab: tt('Süre (s)', 'Time (s)'), ylab: tt('Konum hatası (m)', 'Position error (m)'), series: sv, marks: [{ x: T, y: p.tot, label: sig(p.tot, 3) + ' m' }] }), [['var(--c)', tt('Toplam', 'Total')], ['#2563eb', tt('İvme bias ½bt²', 'Accel bias ½bt²'), true], ['#d97706', tt('Jiroskop bias ⅙gωt³', 'Gyro bias ⅙gωt³'), true], ['#9333ea', tt('ARW + VRW (1σ)', 'ARW + VRW (1σ)'), true]]); },
      compute(G) { const t = G.v('t'); if (!(t > 0)) return [['—', tt('Süreyi girin', 'Enter the time')]]; const p = insErr(G, t), lim = G.r('lim');
        const it = [[sig(p.tot, 3) + ' m', tt('Toplam konum hatası', 'Total position error'), 'big ' + (lim > 0 ? (p.tot <= lim ? 'good' : 'bad') : '')], [sig(p.acc, 3) + ' m', tt('İvme bias katkısı', 'Accel-bias share')], [sig(p.gyr, 3) + ' m', tt('Jiroskop bias katkısı', 'Gyro-bias share')], [sig(p.rw, 3) + ' m', tt('Gürültü katkısı (1σ)', 'Noise share (1σ)')], [sig((G.r('gbi') || 0) * t / 3600, 3) + ' °', tt('Baş hatası (bias·t)', 'Heading error (bias·t)')]];
        if (lim > 0) { let lo = 0.01, hi = 1e5; for (let i = 0; i < 60; i++) { const m = Math.sqrt(lo * hi); if (insErr(G, m).tot > lim) hi = m; else lo = m; } it.push([sig(lo, 3) + ' s', tt('Sınır aşılana kadar süre', 'Time until the limit is exceeded')]); }
        return it; } },
  ],
};
function insErr(G, t) { t = t != null ? t : G.v('t'); const ba = (G.r('abi') || 0) * 1e-6 * G0, wb = (G.r('gbi') || 0) * Math.PI / 180 / 3600, arw = (G.r('arw') || 0) * Math.PI / 180 / 60, vrw = (G.r('vrw') || 0) / 60;
  const acc = 0.5 * ba * t * t, gyr = G0 * wb * t * t * t / 6, rw = Math.hypot(G0 * arw * Math.pow(t, 2.5) / Math.sqrt(20), vrw * Math.pow(t, 1.5) / Math.sqrt(3)); return { acc, gyr, rw, tot: acc + gyr + rw }; }

/* ---------------- axes and attitude: sensor/body frame, NED, roll/pitch/heading (with drawings) ----------------
   Conventions as in the Advanced Navigation (Orientus) and VectorNav (VN-100) manuals: right-handed, X forward, Y right, Z down;
   heading about Z, pitch about Y, roll about X; rotations applied heading → pitch → roll (Z-Y-X); heading 0 = X towards north. */
const D2R = Math.PI / 180;
function dcmNB(r, p, h) {   // body → NED, C = Rz(h)·Ry(p)·Rx(r)
  const cr = Math.cos(r), sr = Math.sin(r), cp = Math.cos(p), sp = Math.sin(p), ch = Math.cos(h), shh = Math.sin(h);
  return [[cp * ch, sr * sp * ch - cr * shh, cr * sp * ch + sr * shh], [cp * shh, sr * sp * shh + cr * ch, cr * sp * shh - sr * ch], [-sp, sr * cp, cr * cp]];
}
const mv = (M, v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
const mT = (M) => [[M[0][0], M[1][0], M[2][0]], [M[0][1], M[1][1], M[2][1]], [M[0][2], M[1][2], M[2][2]]];
function quatOf(r, p, h) { const c = (a) => Math.cos(a / 2), s = (a) => Math.sin(a / 2);
  return [c(r) * c(p) * c(h) + s(r) * s(p) * s(h), s(r) * c(p) * c(h) - c(r) * s(p) * s(h), c(r) * s(p) * c(h) + s(r) * c(p) * s(h), c(r) * c(p) * s(h) - s(r) * s(p) * c(h)]; }
function svgEl(w, h) { const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.setAttribute('role', 'img');
  const el = (tag, a, txt, parent) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; (parent || svg).appendChild(e); return e; };
  const arrow = (x1, y1, x2, y2, col, w2, dash) => { el('line', { x1, y1, x2, y2, stroke: col, 'stroke-width': w2 || 2.2, 'stroke-dasharray': dash || '' }); const a = Math.atan2(y2 - y1, x2 - x1), L = 9;
    el('polygon', { points: [[x2, y2], [x2 - L * Math.cos(a - 0.4), y2 - L * Math.sin(a - 0.4)], [x2 - L * Math.cos(a + 0.4), y2 - L * Math.sin(a + 0.4)]].map((q) => q.join(',')).join(' '), fill: col }); };
  return { svg, el, arrow };
}
// oblique projection of NED: north into the page (up-left), east to the right, down = screen down
const projNED = (cx, cy, L) => (v) => [cx + L * (v[1] * 0.97 - v[0] * 0.55), cy + L * (v[2] * 0.95 - v[0] * 0.42 - v[1] * 0.12)];
const AX_COL = { x: '#dc2626', y: '#16a34a', z: '#2563eb' };
function attitudeView(G) {
  const rd = G.r('roll') || 0, pd = G.r('pitch') || 0, hd = G.r('head') || 0, C = dcmNB(rd * D2R, pd * D2R, hd * D2R);
  const { svg, el, arrow } = svgEl(640, 380), P = projNED(330, 200, 150), tp = (v) => P(mv(C, v));
  el('text', { x: 16, y: 20, class: 'ttl' }, tt('Gövde çerçevesi NED\'e göre', 'Body frame relative to NED') + ' (roll ' + sig(rd, 4) + '°, pitch ' + sig(pd, 4) + '°, heading ' + sig(hd, 4) + '°)');
  for (let i = -2; i <= 2; i++) { const a = P([i * 0.6, -1.3, 0]), b = P([i * 0.6, 1.3, 0]), c = P([-1.3, i * 0.6, 0]), d = P([1.3, i * 0.6, 0]); el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: 'var(--line)' }); el('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1], stroke: 'var(--line)' }); }
  const O = P([0, 0, 0]);
  [['N', [1.45, 0, 0]], ['E', [0, 1.45, 0]], ['D', [0, 0, 1.05]]].forEach(([n, v]) => { const q = P(v); arrow(O[0], O[1], q[0], q[1], 'var(--mute)', 1.6, '6 4'); el('text', { x: q[0] + 6, y: q[1] + 4, class: 'ttl' }, n); });
  const body = [[1.0, 0, 0], [0.15, 0.95, 0], [-0.25, 0.95, 0], [-0.55, 0.12, 0], [-0.8, 0.35, 0], [-0.9, 0.35, 0], [-0.85, 0, 0], [-0.9, -0.35, 0], [-0.8, -0.35, 0], [-0.55, -0.12, 0], [-0.25, -0.95, 0], [0.15, -0.95, 0]];
  el('polygon', { points: body.map((v) => tp(v).join(',')).join(' '), fill: 'var(--c)', 'fill-opacity': 0.28, stroke: 'var(--c)', 'stroke-width': 1.6 });
  el('polygon', { points: [[-0.55, 0, 0], [-0.88, 0, 0], [-0.88, 0, -0.38]].map((v) => tp(v).join(',')).join(' '), fill: 'var(--c)', 'fill-opacity': 0.5, stroke: 'var(--c)' });   // fin points up (−Z)
  [['Xb ' + tt('(ileri, roll)', '(forward, roll)'), [1.35, 0, 0], AX_COL.x], ['Yb ' + tt('(sağ, pitch)', '(right, pitch)'), [0, 1.25, 0], AX_COL.y], ['Zb ' + tt('(aşağı, heading)', '(down, heading)'), [0, 0, 0.95], AX_COL.z]].forEach(([n, v, c]) => { const q = tp(v); arrow(O[0], O[1], q[0], q[1], c, 2.6); el('text', { x: q[0] + 6, y: q[1] - 4, fill: c, 'font-weight': 700, 'font-size': 12 }, n); });
  el('text', { x: 16, y: 362 }, tt('Kesikli gri: NED (Kuzey, Doğu, Aşağı). Renkli: gövde eksenleri. Sıra: önce heading (Z), sonra pitch (Y), sonra roll (X).', 'Dashed grey: NED (North, East, Down). Coloured: body axes. Order: heading (Z) first, then pitch (Y), then roll (X).'));
  return svg;
}
function framesDrawing() {   // static: Earth + ECEF + local NED, and the right-hand rules / positive rotations
  const { svg, el, arrow } = svgEl(680, 330);
  el('text', { x: 16, y: 20, class: 'ttl' }, tt('ECEF, coğrafi konum ve yerel NED çerçevesi', 'ECEF, geodetic position and the local NED frame'));
  const cx = 160, cy = 180, R = 110; el('circle', { cx, cy, r: R, fill: 'var(--c-bg)', stroke: 'var(--mute)' });
  el('ellipse', { cx, cy, rx: R, ry: 26, fill: 'none', stroke: 'var(--mute)', 'stroke-dasharray': '4 4' }); el('text', { x: cx + 40, y: cy + 42 }, tt('ekvator', 'equator'));
  el('ellipse', { cx, cy, rx: 34, ry: R, fill: 'none', stroke: 'var(--mute)', 'stroke-dasharray': '4 4' }); el('text', { x: cx - 92, y: cy - 60 }, tt('meridyen', 'meridian'));
  arrow(cx, cy, cx, cy - R - 34, 'var(--ink)', 1.6); el('text', { x: cx - 8, y: cy - R - 30, class: 'ttl', 'text-anchor': 'end' }, 'Z_ECEF');
  arrow(cx, cy, cx + R + 26, cy + 18, 'var(--ink)', 1.6); el('text', { x: cx + R - 6, y: cy + 38, class: 'ttl' }, 'X_ECEF (0°, 0°)');
  arrow(cx, cy, cx - 70, cy + 50, 'var(--ink)', 1.6); el('text', { x: cx - 150, y: cy + 72, class: 'ttl' }, 'Y_ECEF (0°, 90°E)');
  const px = cx + 58, py = cy - 82; el('line', { x1: cx, y1: cy, x2: px, y2: py, stroke: 'var(--mute)', 'stroke-dasharray': '2 3' }); el('circle', { cx: px, cy: py, r: 4, fill: 'var(--c)' });
  el('text', { x: px + 14, y: py + 26 }, tt('P (enlem φ, boylam λ, h)', 'P (lat φ, lon λ, h)'));
  arrow(px, py, px - 30, py - 46, AX_COL.x, 2.4); el('text', { x: px - 46, y: py - 50, fill: AX_COL.x, 'font-weight': 700 }, 'N');
  arrow(px, py, px + 52, py - 8, AX_COL.y, 2.4); el('text', { x: px + 56, y: py - 6, fill: AX_COL.y, 'font-weight': 700 }, 'E');
  arrow(px, py, px - 24, py + 38, AX_COL.z, 2.4); el('text', { x: px - 18, y: py + 52, fill: AX_COL.z, 'font-weight': 700 }, 'D');
  const bx = 440, by = 120; el('text', { x: bx - 60, y: 52, class: 'ttl' }, tt('Gövde eksenleri ve pozitif dönüşler (sağ el)', 'Body axes and positive rotations (right hand)'));
  const ax = (dx, dy, c, n) => { arrow(bx, by, bx + dx, by + dy, c, 2.6); el('text', { x: bx + dx + 6, y: by + dy + 4, fill: c, 'font-weight': 700 }, n); };
  ax(110, -40, AX_COL.x, 'X ' + tt('ileri', 'fwd')); ax(110, 40, AX_COL.y, 'Y ' + tt('sağ', 'right')); ax(0, 100, AX_COL.z, 'Z ' + tt('aşağı', 'down'));
  const curl = (x, y, rx, ry, c, lbl) => { const ex = x + rx * 0.2, ey = y - ry * 0.98; el('path', { d: 'M' + (x - rx) + ' ' + y + ' A' + rx + ' ' + ry + ' 0 1 0 ' + ex + ' ' + ey, fill: 'none', stroke: c, 'stroke-width': 1.8 }); el('polygon', { points: [[ex, ey], [ex - 9, ey - 5], [ex - 7, ey + 6]].map((q) => q.join(',')).join(' '), fill: c }); el('text', { x: x + rx + 6, y: y + 4, fill: c }, lbl); };
  curl(bx + 70, by - 25, 11, 18, AX_COL.x, '+roll'); curl(bx + 70, by + 25, 11, 18, AX_COL.y, '+pitch'); curl(bx, by + 70, 20, 9, AX_COL.z, '+heading');
  el('text', { x: bx - 90, y: by + 132 }, tt('1. kural: başparmak X, işaret Y, orta parmak Z.', '1st rule: thumb X, index Y, middle Z.'));
  el('text', { x: bx - 90, y: by + 150 }, tt('2. kural: başparmak eksen yönünde, parmaklar pozitif dönüş.', '2nd rule: thumb along the axis, fingers curl the positive way.'));
  el('text', { x: bx - 90, y: by + 168 }, tt('+roll sağ kanat aşağı · +pitch burun yukarı', '+roll right wing down · +pitch nose up'));
  el('text', { x: bx - 90, y: by + 186 }, tt('+heading saat yönü (kuzeyden doğuya)', '+heading clockwise (north to east)'));
  return svg;
}
CMP.orient = {
  parent: 'sensor', name: ['Eksenler ve yönelim', 'Axes and attitude'],
  title: ['Eksenler, NED Çerçevesi ve Roll / Pitch / Heading', 'Axes, the NED Frame and Roll / Pitch / Heading'],
  sub: ['Sensör/gövde çerçevesi, NED–ENU–ECEF, Euler açıları (Z-Y-X), DCM ve kuaterniyon; görsel yönelim aracı, çerçeve dönüşümü, eğim ve eğim kompanzasyonlu baş hesabı.', 'Sensor/body frame, NED–ENU–ECEF, Euler angles (Z-Y-X), DCM and quaternion; visual attitude tool, frame conversion, tilt and tilt-compensated heading.'],
  params: [
    ['Sensör çerçevesi', 'Sensor frame', 'X, Y, Z', 'Kutunun üstünde işaretli eksenler. Orientus ve VN-100: sağ el kuralı, X ileri (Orientus\'ta konnektör yönü), Y sağ, Z aşağı.', 'Axes marked on the case. Orientus and VN-100: right-handed, X forward (connector side on Orientus), Y right, Z down.', 'X ileri · Y sağ · Z aşağı'],
    ['Gövde çerçevesi (body)', 'Body frame', 'Xb, Yb, Zb', 'Aracın (uçak, araç, kamera) eksenleri. Sensör farklı yönde monte edildiyse kurulum hizalaması (Orientus) / referans çerçeve dönüşümü RFR (VN-100, Register 26) ile sensör çerçevesi gövdeye döndürülür.', 'Axes of the vehicle (aircraft, car, camera). If the sensor is mounted differently, installation alignment (Orientus) / reference frame rotation RFR (VN-100, Register 26) turns the sensor frame into the body frame.', '—'],
    ['NED (Kuzey-Doğu-Aşağı)', 'NED (North-East-Down)', 'N, E, D', 'Bulunulan noktada yerel teğet düzlem çerçevesi: N coğrafi kuzey, E doğu, D yerçekimi yönünde aşağı. Havacılık ve AHRS/INS çıkışlarının standardı; yönelim açıları gövdenin NED\'e göre dönüşüdür.', 'Local tangent-plane frame at the current point: N geographic north, E east, D down along gravity. Standard for aviation and AHRS/INS outputs; attitude angles are the rotation of the body relative to NED.', '—'],
    ['ENU (Doğu-Kuzey-Yukarı)', 'ENU (East-North-Up)', 'E, N, U', 'Robotik (ROS REP-103) ve haritacılıkta yaygın. NED ↔ ENU: (x, y, z) → (y, x, −z); heading_ENU = 90° − heading_NED.', 'Common in robotics (ROS REP-103) and mapping. NED ↔ ENU: (x, y, z) → (y, x, −z); heading_ENU = 90° − heading_NED.', '—'],
    ['ECEF', 'ECEF', 'X, Y, Z', 'Dünya merkezli, dünyayla dönen çerçeve: Z kuzey kutbu, X 0° enlem/0° boylam, Y 0°/90°D. GNSS konum/hız hesaplarında kullanılır.', 'Earth-centred, Earth-fixed: Z to the north pole, X at 0° lat/0° lon, Y at 0°/90°E. Used in GNSS position/velocity.', '—'],
    ['LLA (coğrafi)', 'LLA (geodetic)', '°, °, m', 'Enlem, boylam, elipsoid yüksekliği (WGS-84). NED çerçevesi bu noktaya bağlıdır.', 'Latitude, longitude, ellipsoidal height (WGS-84). The NED frame is attached to this point.', '—'],
    ['Roll (yatış) φ', 'Roll φ', '°', 'X ekseni etrafında dönüş; +roll sağ kanadı aşağı indirir.', 'Rotation about the X axis; +roll lowers the right wing.', '±180°'],
    ['Pitch (yunuslama) θ', 'Pitch θ', '°', 'Y ekseni etrafında dönüş; +pitch burnu kaldırır. ±90°\'de gimbal kilidi oluşur.', 'Rotation about the Y axis; +pitch raises the nose. Gimbal lock occurs at ±90°.', '±90°'],
    ['Heading / yaw ψ', 'Heading / yaw ψ', '°', 'Z ekseni etrafında dönüş; 0° = X kuzeye, 90° = doğuya, 180° = güneye (saat yönü pozitif). Yaw genelde göreli, heading kuzeye göre kullanılır.', 'Rotation about the Z axis; 0° = X to north, 90° = east, 180° = south (clockwise positive). Yaw is often relative, heading is referenced to north.', '0 … 360° / ±180°'],
    ['Dönüş sırası (Z-Y-X)', 'Rotation order (Z-Y-X)', '—', 'Seviyeli ve kuzeye bakan durumdan başlanır: önce heading, sonra pitch, en son roll uygulanır. Sıra değişirse aynı üç açı başka yönelim verir.', 'Start level and facing north: apply heading first, then pitch, finally roll. A different order gives another attitude for the same three angles.', 'ψ → θ → φ'],
    ['DCM (yön kosinüs matrisi)', 'DCM (direction cosine matrix)', '3×3', 'C_nb = Rz(ψ)·Ry(θ)·Rx(φ); gövde vektörünü NED\'e çevirir (v_n = C_nb·v_b); tersi devriktir (C_bn = C_nbᵀ).', 'C_nb = Rz(ψ)·Ry(θ)·Rx(φ); turns a body vector into NED (v_n = C_nb·v_b); the inverse is the transpose (C_bn = C_nbᵀ).', '—'],
    ['Kuaterniyon', 'Quaternion', 'q0..q3', 'Dört bileşenli, tekilliği olmayan yönelim gösterimi; filtrelerde (EKF) kullanılır, her yönde süreklidir.', 'Four-component attitude representation without singularities; used in filters (EKF), continuous in every direction.', '|q| = 1'],
    ['Gimbal kilidi', 'Gimbal lock', '—', 'Pitch ±90° iken roll ve heading aynı ekseni tanımlar, Euler açıları tekilleşir. Bu yüzden iç hesap kuaterniyonla yapılır.', 'At pitch ±90° roll and heading describe the same axis and Euler angles become singular. Internal computation therefore uses quaternions.', 'θ = ±90°'],
    ['Manyetik ↔ gerçek kuzey', 'Magnetic ↔ true north', '°', 'Manyetometre baş açısını manyetik kuzeye göre verir; gerçek baş = manyetik baş + sapma (declination, doğu pozitif). Değer WMM\'den alınır; Türkiye\'de ≈ +5…+7°.', 'The magnetometer gives heading relative to magnetic north; true heading = magnetic heading + declination (east positive). Value from the WMM; ≈ +5…+7° in Turkey.', '—'],
    ['Sürekli doğrusal ivme', 'Sustained linear acceleration', '°', 'AHRS roll/pitch\'i yerçekimi vektöründen düzeltir; uzun süren ivme yerçekimiyle karışır. Orientus kılavuzundaki örnek: 30 s\'de 0–100 km/h hızlanan araçta destek olmadan pitch\'te 2°\'ye kadar hata. Çözüm: GNSS (veya hız) desteği.', 'An AHRS corrects roll/pitch from the gravity vector; prolonged acceleration mixes with gravity. Example from the Orientus manual: a car accelerating 0–100 km/h in 30 s can build up to 2° pitch error without aiding. Fix: GNSS (or velocity) aiding.', '≤ 2°'],
    ['Montaj', 'Mounting', '—', 'Sensörü aracın ağırlık merkezine yakın, X ileri ve Z aşağı olacak şekilde, titreşim ve manyetik girişim kaynaklarından uzağa sabitleyin. Farklı yönde montajda kurulum hizalamasını (RFR) girin; GNSS anteni için kol mesafesini ölçün.', 'Mount the sensor close to the vehicle\'s centre of gravity, X forward and Z down, away from vibration and magnetic interference sources. Enter the installation alignment (RFR) for other orientations; measure the lever arm to the GNSS antenna.', '—'],
    ['Baş kaynağı', 'Heading source', '—', 'Manyetik (kalibrasyon ister, manyetik bozulmaya açık), hız/rota (GNSS ile, ≥ 2 m/s yatay hız; yana kaymayan araçlarda), harici (çift antenli GNSS, kuzey arayan jiroskop).', 'Magnetic (needs calibration, sensitive to magnetic disturbance), velocity/course (with GNSS, ≥ 2 m/s horizontal speed; vehicles that do not slide sideways), external (dual-antenna GNSS, north-seeking gyro).', '—'],
  ],
  tech: {
    title: ['Koordinat çerçeveleri', 'Coordinate frames'],
    head: [['Çerçeve', 'Frame'], ['Orijin', 'Origin'], ['Eksenler', 'Axes'], ['El', 'Handedness'], ['Kullanım', 'Use']],
    rows: [
      [['Sensör', 'Sensor'], ['sensörün ölçüm merkezi', 'sensor measurement centre'], ['X ileri, Y sağ, Z aşağı (kutuda işaretli)', 'X fwd, Y right, Z down (marked on the case)'], ['sağ', 'right'], ['Ham IMU ölçümleri', 'Raw IMU measurements']],
      [['Gövde (body)', 'Body'], ['araç referans noktası', 'vehicle reference point'], ['X ileri, Y sağ, Z aşağı', 'X fwd, Y right, Z down'], ['sağ', 'right'], ['Yönelim, kontrol, kurulum hizalaması', 'Attitude, control, installation alignment']],
      [['NED', 'NED'], ['araç konumu (yerel)', 'vehicle position (local)'], ['Kuzey, Doğu, Aşağı', 'North, East, Down'], ['sağ', 'right'], ['Havacılık, AHRS/INS çıkışı', 'Aviation, AHRS/INS output']],
      [['ENU', 'ENU'], ['araç konumu (yerel)', 'vehicle position (local)'], ['Doğu, Kuzey, Yukarı', 'East, North, Up'], ['sağ', 'right'], ['ROS, haritacılık, GIS', 'ROS, mapping, GIS']],
      [['ECEF', 'ECEF'], ['dünya merkezi', 'Earth centre'], ['Z kutup, X 0°/0°, Y 0°/90°D', 'Z pole, X 0°/0°, Y 0°/90°E'], ['sağ', 'right'], ['GNSS konum/hız', 'GNSS position/velocity']],
      [['LLA (WGS-84)', 'LLA (WGS-84)'], ['elipsoid', 'ellipsoid'], ['enlem, boylam, yükseklik', 'lat, lon, height'], ['—', '—'], ['Konum gösterimi', 'Position display']],
    ],
  },
  wiz: {
    fields: [{ id: 'eco', tr: 'Ekosistem / uygulama', en: 'Ecosystem / application', def: 'air', opts: [['air', 'Havacılık / İHA / AHRS', 'Aviation / UAV / AHRS'], ['ros', 'Robotik (ROS)', 'Robotics (ROS)'], ['gnss', 'GNSS / jeodezi', 'GNSS / geodesy'], ['cam', 'Kamera / LiDAR hizalama', 'Camera / LiDAR alignment']] }],
    run(v) {
      const R = { air: ['NED + gövde (X ileri, Y sağ, Z aşağı), Euler Z-Y-X', 'NED + body (X fwd, Y right, Z down), Euler Z-Y-X', 'Orientus/VN-100 gibi AHRS\'lerin varsayılanı; ek dönüşüm gerekmez.', 'Default of AHRSs such as Orientus/VN-100; no extra conversion.'],
        ros: ['ENU (dünya) + FLU gövde (X ileri, Y sol, Z yukarı)', 'ENU (world) + FLU body (X fwd, Y left, Z up)', 'NED/FRD verisini ENU/FLU\'ya çevirin: dünya için (x, y, z) → (y, x, −z), gövde için (x, −y, −z); heading_ENU = 90° − heading_NED.', 'Convert NED/FRD data to ENU/FLU: world (x, y, z) → (y, x, −z), body (x, −y, −z); heading_ENU = 90° − heading_NED.'],
        gnss: ['ECEF + LLA, yerelde NED/ENU', 'ECEF + LLA, NED/ENU locally', 'GNSS alıcısı ECEF\'te hesaplar; yerel hareket için NED/ENU\'ya döndürün.', 'The GNSS receiver works in ECEF; rotate to NED/ENU for local motion.'],
        cam: ['Gövde + sabit montaj dönüşümü (RFR / kurulum hizalaması)', 'Body + fixed mounting rotation (RFR / installation alignment)', 'Sensörden kamera merkezine dönüşü (ve kol mesafesini) sistem düzeyinde kalibre edin; fabrika hizalaması tek başına yetmez.', 'Calibrate the sensor-to-camera rotation (and lever arm) at system level; the factory alignment alone is not enough.'] }[v.eco];
      return { main: [R[0], R[1]], why: [[R[2], R[3]]] };
    },
  },
  calcGroups: [
    ['vis', 'Görsel', 'Visual', 'Roll/pitch/heading değiştikçe gövdenin NED\'e göre duruşunu çizer; DCM ve kuaterniyonu verir.', 'Draws the body\'s attitude relative to NED as roll/pitch/heading change; gives the DCM and quaternion.'],
    ['frm', 'Çerçeveler', 'Frames', 'ECEF–NED ilişkisi, sağ el kuralları ve pozitif dönüş yönleri; gövde ↔ NED vektör dönüşümü.', 'ECEF–NED relation, right-hand rules and positive rotations; body ↔ NED vector conversion.'],
    ['tilt', 'Eğim ve baş', 'Tilt and heading', 'Statik ivmeden roll/pitch, eğim kompanzasyonlu manyetik baş ve sapma düzeltmesi.', 'Roll/pitch from static acceleration, tilt-compensated magnetic heading and declination.'],
  ],
  calcs: [
    { id: 'oatt', group: 'vis', title: ['Yönelim görselleştirici (roll / pitch / heading)', 'Attitude visualiser (roll / pitch / heading)'], sub: ['C_nb = Rz(ψ)·Ry(θ)·Rx(φ);  q = q_ψ ⊗ q_θ ⊗ q_φ', 'C_nb = Rz(ψ)·Ry(θ)·Rx(φ);  q = q_ψ ⊗ q_θ ⊗ q_φ'],
      fields: [{ id: 'roll', tr: 'Roll φ (°)', en: 'Roll φ (°)', def: '20' }, { id: 'pitch', tr: 'Pitch θ (°)', en: 'Pitch θ (°)', def: '10' }, { id: 'head', tr: 'Heading ψ (°)', en: 'Heading ψ (°)', def: '45' }],
      plot: (G) => plotBox(attitudeView(G)),
      note: ['Açıları değiştirerek deneyin: yalnız heading 90° → burun doğuya; yalnız pitch +30° → burun yukarı; yalnız roll +30° → sağ kanat aşağı. Pitch ±90°\'ye yaklaştığında roll ile heading aynı dönüşü verir (gimbal kilidi).', 'Try changing the angles: heading 90° alone → nose east; pitch +30° alone → nose up; roll +30° alone → right wing down. As pitch approaches ±90°, roll and heading give the same rotation (gimbal lock).'],
      compute(G) { const r = (G.r('roll') || 0) * D2R, p = (G.r('pitch') || 0) * D2R, h = (G.r('head') || 0) * D2R, C = dcmNB(r, p, h), q = quatOf(r, p, h), f = (x) => sig(Math.abs(x) < 5e-7 ? 0 : x, 4);
        const it = [[C.map((row) => '[' + row.map(f).join(', ') + ']').join(' '), tt('DCM C_nb (gövde → NED)', 'DCM C_nb (body → NED)'), 'big'], ['[' + q.map(f).join(', ') + ']', tt('Kuaterniyon [q0, q1, q2, q3]', 'Quaternion [q0, q1, q2, q3]')],
          ['[' + mv(C, [1, 0, 0]).map(f).join(', ') + ']', tt('Burun yönü (Xb) NED\'de', 'Nose direction (Xb) in NED')], ['[' + mv(mT(C), [0, 0, -1]).map(f).join(', ') + ']', tt('Dururken ivmeölçer okuması (g, gövdede)', 'Accelerometer reading at rest (g, in body)')]];
        if (Math.abs(Math.abs(G.r('pitch') || 0) - 90) < 2) it.push(['!', tt('Gimbal kilidine çok yakın: roll ve heading ayrılamaz', 'Very close to gimbal lock: roll and heading cannot be separated'), 'warn']);
        return it; } },
    { id: 'ofr', group: 'frm', title: ['NED / gövde vektör dönüşümü', 'NED / body vector conversion'], sub: ['v_n = C_nb·v_b;  v_b = C_nbᵀ·v_n;  ENU = (E, N, −D)', 'v_n = C_nb·v_b;  v_b = C_nbᵀ·v_n;  ENU = (E, N, −D)'],
      fields: [{ id: 'dir', tr: 'Yön', en: 'Direction', def: 'b2n', sel: [['b2n', 'Gövde → NED', 'Body → NED'], ['n2b', 'NED → gövde', 'NED → body']] }, { id: 'vx', tr: 'Vektör x (Xb veya N)', en: 'Vector x (Xb or N)', def: '1' }, { id: 'vy', tr: 'Vektör y (Yb veya E)', en: 'Vector y (Yb or E)', def: '0' }, { id: 'vz', tr: 'Vektör z (Zb veya D)', en: 'Vector z (Zb or D)', def: '0' },
        { id: 'roll', tr: 'Roll (°)', en: 'Roll (°)', def: '0' }, { id: 'pitch', tr: 'Pitch (°)', en: 'Pitch (°)', def: '0' }, { id: 'head', tr: 'Heading (°)', en: 'Heading (°)', def: '90' }],
      plot: () => plotBox(framesDrawing()),
      compute(G) { const C = dcmNB((G.r('roll') || 0) * D2R, (G.r('pitch') || 0) * D2R, (G.r('head') || 0) * D2R), v = [G.r('vx') || 0, G.r('vy') || 0, G.r('vz') || 0], b2n = G.s('dir') === 'b2n', o = mv(b2n ? C : mT(C), v), f = (x) => sig(Math.abs(x) < 5e-7 ? 0 : x, 4);
        const it = [['[' + o.map(f).join(', ') + ']', b2n ? tt('NED [N, E, D]', 'NED [N, E, D]') : tt('Gövde [Xb, Yb, Zb]', 'Body [Xb, Yb, Zb]'), 'big'], [sig(Math.hypot(...o), 4), tt('Büyüklük (korunur)', 'Magnitude (preserved)')]];
        if (b2n) it.push(['[' + [o[1], o[0], -o[2]].map(f).join(', ') + ']', tt('ENU [E, N, U]', 'ENU [E, N, U]')], [sig(((Math.atan2(o[1], o[0]) / D2R) + 360) % 360, 4) + ' °', tt('Yatay yön (kuzeyden saat yönü)', 'Horizontal bearing (clockwise from north)')]);
        return it; } },
    { id: 'otl', group: 'tilt', title: ['Statik ivmeden roll / pitch', 'Roll / pitch from static acceleration'], sub: ['φ = atan2(−a_y, −a_z);  θ = atan2(a_x, √(a_y² + a_z²))  (Z aşağı, seviyede a_z = −1 g)', 'φ = atan2(−a_y, −a_z);  θ = atan2(a_x, √(a_y² + a_z²))  (Z down, level a_z = −1 g)'],
      fields: [{ id: 'ax', tr: 'a_x (g)', en: 'a_x (g)', def: '0.17' }, { id: 'ay', tr: 'a_y (g)', en: 'a_y (g)', def: '-0.34' }, { id: 'az', tr: 'a_z (g)', en: 'a_z (g)', def: '-0.92' }, { id: 'bias', tr: 'İvmeölçer bias\'ı (mg, doğruluk için)', en: 'Accelerometer bias (mg, for accuracy)', def: '1' }],
      note: ['İvmeölçer özgül kuvveti ölçer: dururken ve seviyede Z aşağı eksen −1 g okur (kullandığınız ürünün kılavuzundaki işaret kuralını doğrulayın; "yerçekimi pozitif" veren sensörlerde işaretleri ters çevirin). Hareket ivmesi varsa bu formül hatalıdır; AHRS jiroskopla birleştirir.', 'An accelerometer measures specific force: at rest and level, the Z-down axis reads −1 g (check the sign convention in your product\'s manual; flip the signs for sensors that report gravity as positive). With motion acceleration the formula is wrong; an AHRS fuses it with the gyro.'],
      compute(G) { const ax = G.r('ax'), ay = G.r('ay'), az = G.r('az'), b = (G.r('bias') || 0) / 1000; if (![ax, ay, az].every(Number.isFinite)) return [['—', tt('Üç ekseni girin', 'Enter all three axes')]]; const n = Math.hypot(ax, ay, az);
        return [[sig(Math.atan2(-ay, -az) / D2R, 4) + ' °', 'Roll φ', 'big'], [sig(Math.atan2(ax, Math.hypot(ay, az)) / D2R, 4) + ' °', 'Pitch θ', 'big'], [sig(n, 4) + ' g', tt('|a| (1 g\'den farkı hareket demektir)', '|a| (a difference from 1 g means motion)'), Math.abs(n - 1) < 0.05 ? 'good' : 'warn'], [sig(Math.atan(b) / D2R, 3) + ' °', tt('Bias kaynaklı eğim belirsizliği', 'Tilt uncertainty from bias')]]; } },
    { id: 'ohd', group: 'tilt', title: ['Eğim kompanzasyonlu manyetik baş', 'Tilt-compensated magnetic heading'], sub: ['m_n = C_nb·m_b (heading = 0 ile);  ψ_m = atan2(−m_E, m_N);  ψ = ψ_m + D', 'm_n = C_nb·m_b (with heading = 0);  ψ_m = atan2(−m_E, m_N);  ψ = ψ_m + D'],
      fields: [{ id: 'mx', tr: 'm_x (µT)', en: 'm_x (µT)', def: '18' }, { id: 'my', tr: 'm_y (µT)', en: 'm_y (µT)', def: '-12' }, { id: 'mz', tr: 'm_z (µT)', en: 'm_z (µT)', def: '40' }, { id: 'roll', tr: 'Roll (°)', en: 'Roll (°)', def: '0' }, { id: 'pitch', tr: 'Pitch (°)', en: 'Pitch (°)', def: '0' }, { id: 'dec', tr: 'Manyetik sapma D (°, doğu +)', en: 'Magnetic declination D (°, east +)', def: '6' }],
      note: ['Manyetometre değerleri hard/soft-iron kalibrasyonundan sonraki değerler olmalıdır. Sapma (declination) WMM/NOAA hesaplayıcısından alınır; VN-100\'de Register 21 ile, Orientus\'ta filtre seçenekleriyle uygulanır.', 'Magnetometer values must be after hard/soft-iron calibration. Declination comes from the WMM/NOAA calculator; applied with Register 21 on the VN-100 and the filter options on Orientus.'],
      compute(G) { const m = [G.r('mx'), G.r('my'), G.r('mz')]; if (!m.every(Number.isFinite)) return [['—', tt('Üç ekseni girin', 'Enter all three axes')]];
        const lv = mv(dcmNB((G.r('roll') || 0) * D2R, (G.r('pitch') || 0) * D2R, 0), m), D = G.r('dec') || 0, psiM = ((Math.atan2(-lv[1], lv[0]) / D2R) + 360) % 360, Bh = Math.hypot(lv[0], lv[1]), B = Math.hypot(...m);
        return [[sig(((psiM + D) % 360 + 360) % 360, 4) + ' °', tt('Gerçek (coğrafi) baş', 'True (geographic) heading'), 'big'], [sig(psiM, 4) + ' °', tt('Manyetik baş', 'Magnetic heading')], [sig(Bh, 4) + ' µT', tt('Yatay alan', 'Horizontal field')], [sig(B, 4) + ' µT', tt('Toplam alan (WMM ile karşılaştırın)', 'Total field (compare with the WMM)')], [sig(Math.atan2(lv[2], Bh) / D2R, 4) + ' °', tt('Eğim (inclination) açısı', 'Inclination angle')]]; } },
  ],
};
