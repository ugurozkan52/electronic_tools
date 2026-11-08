// Montaj Görüntüleyici — v7.0 hardware test mode ("Test & Assembly").
// A generated, step-by-step bring-up procedure. The technician measures between the
// two shown probe points, enters the reading; the verdict is evaluated, stored per
// board (serial number) and written to the assembly log and a CSV report.
/* global TESTPLAN, pcbdata, config, asm, __asm, I18N, asmEl, asmToast, readStorage, writeStorage, allcanvas,
   highlightedFootprints:writable, currentHighlightedRowId:writable, drawHighlights:writable, V3D, settings,
   changeCanvasLayout, topmostdiv, asmFmtTime, asmConfirm, asmOpenModal, asmCloseModal, getPolygonsPath, deg2rad, drawPad, drawHighlightsOnLayer:writable */
'use strict';

var TEST = (function () {
  var T = function (s, v) { return I18N.t(s, v); };
  var S = { on: false, plan: null, steps: [], idx: 0, res: { steps: {}, offset: 0 }, probes: null };
  var STATUS = { pass: '✓', fail: '✗', skip: '–' };

  function el(id) { return document.getElementById(id); }
  function load() {
    try { var r = JSON.parse(__asm.boardKv.testResults || '{}'); if (r && r.steps) S.res = r; } catch (e) { /* new board */ }
  }
  function persist() {
    var s = JSON.stringify(S.res);
    __asm.boardKv.testResults = s;
    asm.kvSet('board', 'testResults', s);
  }
  function build() {
    S.plan = TESTPLAN.buildTestPlan(pcbdata, { fieldNames: config.fields || [], t: T, config: testConfig() });
    S.steps = [];
    S.plan.phases.forEach(function (ph) { ph.steps.forEach(function (st) { st.phase = ph; S.steps.push(st); }); });
    var firstOpen = S.steps.findIndex(function (st) { return !S.res.steps[st.id]; });
    S.idx = firstOpen >= 0 ? firstOpen : 0;
  }
  function testConfig() { try { return JSON.parse(readStorage('testConfig') || '{}'); } catch (e) { return {}; } }
  var UNITS = { 'Ω': ['Ω', 'kΩ', 'MΩ'], V: ['V', 'mV'], mA: ['mA', 'A'] };
  var fmtV = function (v, st) { return TESTPLAN.fmtValue(v, st && st.unit || 'Ω'); };
  function phaseCounts(ph) {
    var c = { pass: 0, fail: 0, skip: 0, open: 0, n: ph.steps.length };
    ph.steps.forEach(function (st) { var r = S.res.steps[st.id]; c[r ? r.status : 'open']++; });
    return c;
  }
  function counts() {
    var c = { pass: 0, fail: 0, skip: 0, open: 0 };
    S.steps.forEach(function (st) { var r = S.res.steps[st.id]; c[r ? r.status : 'open']++; });
    return c;
  }
  function probesOf(st) {
    if (!st || !st.probes) return null;
    var o = S.res.override && S.res.override[st.id];
    return o ? { pos: o.pos || st.probes.pos, neg: o.neg || st.probes.neg } : st.probes;
  }
  function saveRes() {
    __asm.boardKv.testResults = JSON.stringify(S.res, function (k, v) { return v === Infinity ? 'OL' : v; });
    asm.kvSet('board', 'testResults', __asm.boardKv.testResults);
  }
  function setOverride(st, which, cand) {
    S.res.override = S.res.override || {};
    var o = Object.assign({}, S.res.override[st.id] || {});
    var def = st.probes[which];
    if (def.ref === cand.ref && def.pin === cand.pin) delete o[which]; else o[which] = cand;
    if (o.pos || o.neg) S.res.override[st.id] = o; else delete S.res.override[st.id];
    saveRes();
    select(S.idx, false);
  }
  // one net (continuity): amber; two nets (short check): + net red, COM net cyan.
  // The probe markers themselves are separate icons (red "+", black "COM").
  // highlight colours of the measured nets (+ probe net, COM probe net, both probes on one net);
  // chosen by the user, kept per computer
  var NET_PALETTES = {
    warm: { name: 'Turuncu / sarı', pos: '#ff6a00', neg: '#ffd500', same: '#ffb300' },
    redyellow: { name: 'Kırmızı / sarı', pos: '#ff2a2a', neg: '#ffe600', same: '#ff8c00' },
    neon: { name: 'Pembe / yeşil', pos: '#ff2bd6', neg: '#39ff6a', same: '#ffe600' },
    classic: { name: 'Kırmızı / camgöbeği', pos: '#ff3b4e', neg: '#22c6f0', same: '#ffc21a' },
  };
  var NET_COLORS = { pos: '', neg: '', same: '' };
  function paletteKey() { try { var k = localStorage.getItem('montaj.netPalette'); return NET_PALETTES[k] ? k : 'warm'; } catch (e) { return 'warm'; } }
  function setPalette(k, redraw) {
    if (!NET_PALETTES[k]) k = 'warm';
    var P = NET_PALETTES[k];
    NET_COLORS.pos = P.pos; NET_COLORS.neg = P.neg; NET_COLORS.same = P.same;
    try { localStorage.setItem('montaj.netPalette', k); } catch (e) { /* private mode */ }
    document.documentElement.style.setProperty('--net-same', P.same);
    if (redraw && S.on) {
      if (S.view === 'nets') previewNet(S.previewNet);
      else if (S.probes) select(S.idx, false);
      else drawHighlights();
    }
  }
  function paletteSelect(id) {
    var sel = asmEl('select', { id: id, class: 'asm-select nl-pal', 'aria-label': T('Ölçülen net renkleri') });
    Object.keys(NET_PALETTES).forEach(function (k) {
      var op = asmEl('option', { value: k, text: NET_PALETTES[k].name });
      if (k === paletteKey()) op.selected = true;
      sel.appendChild(op);
    });
    sel.onchange = function () { setPalette(sel.value, true); };
    return sel;
  }
  setPalette(paletteKey(), false);
  var N = function (n) { return TESTPLAN.normNet(n); };
  // nets touched by the probes: + net red, COM net cyan (one colour when both are the same net)
  function probeNets(p) {
    if (!p) return [];
    if (N(p.neg.net) === N(p.pos.net)) return [{ net: N(p.pos.net), color: NET_COLORS.same, which: 'both' }];
    return [{ net: N(p.pos.net), color: NET_COLORS.pos, which: 'pos' }, { net: N(p.neg.net), color: NET_COLORS.neg, which: 'neg' }];
  }
  function netColor(p, which) { return N(p.neg.net) === N(p.pos.net) ? NET_COLORS.same : NET_COLORS[which]; }
  function altRow(st, which) {
    var pr = probesOf(st)[which];
    var other = probesOf(st)[which === 'pos' ? 'neg' : 'pos'];
    var open = !!(S.altOpen && S.altOpen[st.id + which]);
    var cands = TESTPLAN.candidates(pcbdata, pr.net, open ? 24 : 6).filter(function (c) { return !(st.kind === 'continuity' && c.fp === other.fp && c.pad === other.pad); });
    var total = TESTPLAN.netSize(pcbdata, pr.net);
    var shown = cands.slice(0, open ? 24 : 5);
    // the best few probe places as buttons; every place of the net is ringed on the board anyway
    var more = total - 1 - shown.length;
    var row = asmEl('div', { class: 'tp-alts', role: 'group', 'aria-label': T('{net} netindeki alternatif noktalar', { net: pr.net }) }, [
      asmEl('span', { class: 'tp-alts-k', raw: 1, text: T('Alternatif ({n} nokta):', { n: total }) }),
    ].concat(shown.map(function (c) {
      var cur = c.ref === pr.ref && c.pin === pr.pin;
      return asmEl('button', { class: 'tp-alt ' + which + (cur ? ' on' : ''), 'aria-pressed': cur ? 'true' : 'false', raw: 1, text: c.ref + '.' + c.pin,
        title: T('{ref} pin {pin}', { ref: c.ref, pin: c.pin }) + ' · ' + T(c.side === 'F' ? 'Üst yüz' : 'Alt yüz'),
        onclick: function () { setOverride(st, which, c); } });
    })).concat(more > 0 || open ? [asmEl('button', { class: 'tp-alt more', raw: 1, 'aria-expanded': open ? 'true' : 'false',
      text: open ? T('Daha az') : T('+{n} nokta', { n: more }),
      onclick: function () { S.altOpen = S.altOpen || {}; S.altOpen[st.id + which] = !open; render(); } })] : []));
    return row;
  }
  function probeLabel(p) { return p ? T('{ref} pin {pin}', { ref: p.ref, pin: p.pin }) : '—'; }

  // ---------------------------------------------------------------- mode
  function setMode(on, persistIt) {
    S.on = !!on;
    el('bot').classList.toggle('asm-testmode', S.on);
    topmostdiv.classList.toggle('asm-testmode', S.on);
    el('asm-mode-assembly').setAttribute('aria-pressed', S.on ? 'false' : 'true');
    el('asm-mode-test').setAttribute('aria-pressed', S.on ? 'true' : 'false');
    el('asm-test').hidden = !S.on;
    if (persistIt) writeStorage('viewMode', S.on ? 'test' : 'assembly');
    if (S.on) {
      if (!S.plan) build();
      // no saved net selection yet: start with the net list
      if (!S.view) S.view = testConfig().selection ? 'proc' : 'nets';
      if (S.view === 'nets') { highlightedFootprints = []; renderNets(); return; }
      // the assembly selection would compete with the probes
      highlightedFootprints = [];
      currentHighlightedRowId = null;
      document.querySelectorAll('#bombody tr.highlighted').forEach(function (r) { r.classList.remove('highlighted'); });
      render();
      select(S.idx, false);
    } else {
      S.probes = null;
      S.previewNet = null;
      renderLegend();
      if (typeof V3D !== 'undefined') V3D.setProbes(null);
      drawHighlights();
    }
  }

  // ------------------------------------------------------------ net selection
  // Every net of the board is listed; the technician / engineer ticks the nets to test and
  // gives each a role. The choice is saved per project (testConfig.selection + nets) and the
  // procedure is generated from it.
  var ROLE_OPTS = [['power', 'Güç rayı'], ['ground', 'Toprak (GND)'], ['chassis', 'Şase'], ['signal', 'Sinyal (I/O)']];
  function showView(v) {
    S.view = v;
    S.previewNet = null;
    if (v === 'nets') {
      S.probes = null;
      if (typeof V3D !== 'undefined') V3D.setProbes(null);
      renderLegend();
      drawHighlights();
      renderNets();
    } else {
      render();
      select(S.idx, false);
    }
  }
  function draftFromConfig() {
    var cfg = testConfig(), d = {};
    (S.plan.nets || []).forEach(function (n) {
      if (cfg.selection) {
        var r = cfg.nets && cfg.nets[n.net];
        d[n.net] = { on: !!r && r !== 'none', role: r && r !== 'none' ? r : (n.suggest || ''), nominal: cfg.rails && cfg.rails[n.net] && cfg.rails[n.net].nominal };
      } else {
        var role = n.cls && n.cls !== 'signal' ? n.cls : n.suggest || '';
        d[n.net] = { on: !!n.cls || (!!n.suggest && n.suggest !== 'signal'), role: role, nominal: cfg.rails && cfg.rails[n.net] && cfg.rails[n.net].nominal };
      }
    });
    return d;
  }
  function previewNet(net) {
    S.previewNet = net;
    drawHighlights();
    if (typeof V3D !== 'undefined') V3D.setProbes(null, net ? [{ net: net, color: NET_COLORS.same, which: 'both' }] : null);
    document.querySelectorAll('.ns-row.preview').forEach(function (r) { r.classList.remove('preview'); });
    var row = document.querySelector('.ns-row[data-net="' + (window.CSS && CSS.escape ? CSS.escape(net || '') : net) + '"]');
    if (row) row.classList.add('preview');
  }
  function renderNets() {
    var root = el('asm-test');
    root.innerHTML = '';
    if (!S.draft) S.draft = draftFromConfig();
    var nets = S.plan.nets || [];
    var D = S.draft;
    var flt = S.netFilter || 'all', q = (S.netQuery || '').toLowerCase();
    var byRole = function (r) { return Object.keys(D).filter(function (k) { return D[k].on && D[k].role === r; }).length; };
    var updSum = function () {
      var e = el('ns-sum');
      if (e) e.textContent = T('{n} net · {s} seçili ({p} güç, {g} toprak, {c} şase, {i} sinyal)', { n: nets.length, s: Object.keys(D).filter(function (k) { return D[k].on; }).length,
        p: byRole('power'), g: byRole('ground'), c: byRole('chassis'), i: byRole('signal') });
    };
    var head = asmEl('div', { class: 'tp-head' }, [
      asmEl('div', { class: 'tp-titles' }, [
        asmEl('h2', { class: 'tp-h', text: 'Net seçimi' }),
        asmEl('div', { class: 'tp-sum', id: 'ns-sum', 'aria-live': 'polite', raw: 1, text: '' }),
      ]),
      asmEl('div', { class: 'tp-hbtns' }, [
        testConfig().selection ? asmEl('button', { class: 'asm-btn', text: 'Vazgeç', onclick: function () { S.draft = null; showView('proc'); } }) : null,
        asmEl('button', { class: 'asm-btn primary', id: 'ns-save', text: 'Kaydet ve prosedürü oluştur', onclick: saveSelection }),
      ]),
    ]);
    root.appendChild(head);
    root.appendChild(asmEl('p', { class: 'ns-help', text: 'Test edilecek netleri işaretleyin ve rolünü seçin. Öneriler net adından ve kart yapısından gelir. Bir nete tıklayınca kartta gösterilir. Seçim bu projenin tüm kartları için kaydedilir.' }));
    var search = asmEl('input', { id: 'ns-q', class: 'asm-input', type: 'search', placeholder: 'Net ara…', 'aria-label': 'Net ara', value: S.netQuery || '' });
    search.addEventListener('input', function () { S.netQuery = search.value; renderTable(); });
    var fsel = asmEl('select', { id: 'ns-f', class: 'asm-select', 'aria-label': T('Filtre') });
    [['all', 'Tümü'], ['on', 'Seçili'], ['suggest', 'Önerilen'], ['power', 'Güç'], ['ground', 'Toprak / şase'], ['signal', 'Sinyal'], ['none', 'Rolü yok']].forEach(function (o) {
      var op = asmEl('option', { value: o[0], text: o[1] }); if (o[0] === flt) op.selected = true; fsel.appendChild(op);
    });
    fsel.onchange = function () { S.netFilter = fsel.value; renderTable(); };
    root.appendChild(asmEl('div', { class: 'ns-tools' }, [search, fsel,
      asmEl('button', { class: 'asm-btn', text: 'Önerileri seç', title: 'Önerilen güç, toprak ve şase netlerini seç', onclick: function () {
        nets.forEach(function (n) { if (n.suggest && n.suggest !== 'signal' && n.pads) { D[n.net].on = true; D[n.net].role = n.suggest; } });
        renderNets();
      } }),
      asmEl('button', { class: 'asm-btn', text: 'Sinyalleri de seç', title: 'Önerilen sinyal hatlarını da seç', onclick: function () {
        nets.forEach(function (n) { if (n.suggest === 'signal' && n.pads) { D[n.net].on = true; D[n.net].role = 'signal'; } });
        renderNets();
      } }),
      asmEl('button', { class: 'asm-btn', text: 'Seçimi temizle', onclick: function () { Object.keys(D).forEach(function (k) { D[k].on = false; }); renderNets(); } }),
    ]));
    var wrap = asmEl('div', { class: 'ns-wrap' });
    root.appendChild(wrap);
    function renderTable() {
      wrap.innerHTML = '';
      q = (S.netQuery || '').toLowerCase(); flt = S.netFilter || 'all';
      var rows = nets.filter(function (n) {
        var d = D[n.net];
        if (q && n.net.toLowerCase().indexOf(q) < 0) return false;
        if (flt === 'on') return d.on;
        if (flt === 'suggest') return !!n.suggest;
        if (flt === 'power') return d.role === 'power';
        if (flt === 'ground') return d.role === 'ground' || d.role === 'chassis';
        if (flt === 'signal') return d.role === 'signal';
        if (flt === 'none') return !d.role;
        return true;
      });
      var tb = asmEl('tbody');
      rows.slice(0, 1500).forEach(function (n) {
        var d = D[n.net];
        var cb = asmEl('input', { type: 'checkbox', class: 'ns-on', 'aria-label': T('{net} test edilsin', { net: n.net }) });
        cb.checked = d.on; cb.disabled = !n.pads;
        var tr;
        var sync = function () { tr.classList.toggle('on', d.on); cb.checked = d.on; rs.value = d.role || ''; nom.hidden = d.role !== 'power'; updSum(); };
        cb.onchange = function () { d.on = cb.checked; if (d.on && !d.role) d.role = n.suggest || 'signal'; sync(); };
        var rs = asmEl('select', { class: 'asm-select ns-role', 'aria-label': T('{net} rolü', { net: n.net }) });
        [['', '—']].concat(ROLE_OPTS).forEach(function (o) { var op = asmEl('option', { value: o[0], text: o[1] }); if (o[0] === (d.role || '')) op.selected = true; rs.appendChild(op); });
        rs.disabled = !n.pads;
        rs.onchange = function () { d.role = rs.value; d.on = !!rs.value; sync(); };
        var nom = asmEl('input', { class: 'asm-input ns-nom', type: 'text', inputmode: 'decimal', placeholder: n.nominal != null ? String(n.nominal) : 'V', value: d.nominal != null ? String(d.nominal) : '',
          'aria-label': T('{net} nominal gerilim (V)', { net: n.net }) });
        nom.hidden = d.role !== 'power';
        nom.onchange = function () { var v = TESTPLAN.parseVolts(nom.value); d.nominal = nom.value.trim() && v != null ? v : null; };
        var nameBtn = asmEl('button', { class: 'ns-name', raw: 1, text: n.net, title: n.net + ' — ' + T('Kartta göster'), onclick: function () { previewNet(S.previewNet === n.net ? null : n.net); } });
        var sug = n.suggest ? T(({ power: 'Güç rayı', ground: 'Toprak (GND)', chassis: 'Şase', signal: 'Sinyal (I/O)' })[n.suggest]) : '';
        tb.appendChild(tr = asmEl('tr', { class: 'ns-row' + (d.on ? ' on' : '') + (S.previewNet === n.net ? ' preview' : ''), 'data-net': n.net }, [
          asmEl('td', {}, [cb]),
          asmEl('td', { class: 'ns-ncell' }, [nameBtn, sug ? asmEl('div', { class: 'ns-why', raw: 1, text: n.suggest === 'signal' || !n.why ? sug + (n.why ? ' · ' + n.why : '') : n.why, title: n.why || null }) : null]),
          asmEl('td', { class: 'num', raw: 1, text: n.pads ? String(n.pads) : T('pad yok') }),
          asmEl('td', {}, [rs]),
          asmEl('td', {}, [nom]),
        ]));
      });
      var table = asmEl('table', { class: 'ns-table' }, [
        asmEl('thead', {}, [asmEl('tr', {}, ['Test', 'Net', 'Pad', 'Rol', 'Nominal (V)'].map(function (h) { return asmEl('th', { scope: 'col', text: h }); }))]),
        tb,
      ]);
      wrap.appendChild(table);
      if (!rows.length) wrap.appendChild(asmEl('p', { class: 'asm-label', text: 'Filtreye uyan net yok.' }));
      if (rows.length > 1500) wrap.appendChild(asmEl('p', { class: 'asm-label', raw: 1, text: T('İlk 1500 net gösteriliyor; aramayı daraltın.') }));
    }
    renderTable();
    updSum();
  }
  function saveSelection() {
    var D = S.draft || {};
    var cfg = testConfig();
    var sel = Object.keys(D).filter(function (k) { return D[k].on && D[k].role; });
    if (!sel.some(function (k) { return D[k].role === 'ground'; })) { asmToast(T('En az bir toprak (GND) neti seçin: ölçümler ona göre yapılır.'), 'warn'); return; }
    cfg.selection = true;
    cfg.nets = {};
    cfg.rails = cfg.rails || {};
    sel.forEach(function (k) {
      cfg.nets[k] = D[k].role;
      if (D[k].role === 'power') cfg.rails[k] = Object.assign({}, cfg.rails[k], D[k].nominal != null ? { nominal: D[k].nominal, include: true } : { include: true });
    });
    writeStorage('testConfig', JSON.stringify(cfg));
    asm.logAdd({ type: 'test', note: T('Test netleri kaydedildi: {n} net', { n: sel.length }) });
    var curId = S.steps[S.idx] && S.steps[S.idx].id;
    build();
    var k = S.steps.findIndex(function (x) { return x.id === curId; });
    S.idx = k >= 0 ? k : S.idx;
    S.draft = null;
    var missing = S.plan.rails.filter(function (r) { return r.include !== false && r.nominal == null; }).map(function (r) { return r.net; });
    asmToast(T('Test planı kaydedildi: {n} adım', { n: S.steps.length }) + (missing.length ? ' · ' + T('Nominali girilmemiş ray: {list}', { list: missing.slice(0, 4).join(', ') }) : ''), missing.length ? 'warn' : 'ok');
    showView('proc');
  }

  // --------------------------------------------------------------- render
  function render() {
    var root = el('asm-test');
    root.innerHTML = '';
    var c = counts(), n = S.steps.length;
    var head = asmEl('div', { class: 'tp-head' }, [
      asmEl('div', { class: 'tp-titles' }, [
        asmEl('h2', { class: 'tp-h', text: 'Donanım testi' }),
        asmEl('div', { class: 'tp-sum', raw: 1, text: T('{done}/{n} adım · {p} geçti · {f} kaldı · {s} atlandı', { done: n - c.open, n: n, p: c.pass, f: c.fail, s: c.skip }) }),
      ]),
      asmEl('div', { class: 'tp-hbtns' }, [
        asmEl('button', { class: 'asm-btn', text: 'Yeniden başlat', title: 'Bu kartın test sonuçlarını sil ve baştan başla', onclick: function () {
          asmConfirm(T('SN {sn} için kaydedilmiş tüm test sonuçları silinsin mi? (Log kayıtları korunur.)', { sn: __asm.session.serial }), T('Sonuçları sil'), reset);
        } }),
        asmEl('button', { class: 'asm-btn', text: 'Net seçimi…', title: 'Test edilecek netleri ve rollerini seçin', onclick: function () { showView('nets'); } }),
        asmEl('button', { class: 'asm-btn', text: 'Test ayarları…', onclick: settingsModal }),
        asmEl('button', { class: 'asm-btn', text: 'Raporu kaydet (PDF)…', onclick: exportReport }),
      ]),
    ]);
    var bar = asmEl('div', { class: 'tp-bar', role: 'progressbar', 'aria-label': T('Test ilerlemesi'), 'aria-valuemin': '0', 'aria-valuemax': String(n), 'aria-valuenow': String(n - c.open) },
      S.steps.map(function (st) { var r = S.res.steps[st.id]; return asmEl('i', { class: r ? r.status : '' }); }));
    root.appendChild(head);
    root.appendChild(bar);
    root.appendChild(warnings());
    root.appendChild(card());
    root.appendChild(list());

  }

  // plan problems stay visible above the step card until they are fixed
  function warnings() {
    var box = asmEl('div', { class: 'tp-warns' });
    var missing = S.plan.config.phases.volt === false ? [] : (S.plan.rails || []).filter(function (r) { return r.include !== false && r.nominal == null; });
    if (missing.length) {
      box.appendChild(asmEl('div', { class: 'tp-warn', role: 'alert', id: 'tp-nominal-warn' }, [
        asmEl('span', { raw: 1, text: '⚠ ' + T('Nominal gerilimi girilmemiş ray: {list}. Bu rayların gerilim adımı beklenen değer olmadan kalır.', { list: missing.map(function (r) { return r.net; }).join(', ') }) + ' ' }),
        asmEl('button', { class: 'asm-btn ghost', text: 'Nominal gir…', onclick: function () { settingsModal('nominal'); } }),
      ]));
    }
    var noRails = !(S.plan.rails || []).some(function (r) { return r.include !== false; }), noGnd = !(S.plan.grounds || []).length;
    if (noRails || noGnd) {
      box.appendChild(asmEl('div', { class: 'tp-warn', role: 'note' }, [
        asmEl('span', { raw: 1, text: '⚠ ' + (noGnd && noRails ? T('Toprak ve güç netleri bulunamadı.') : noGnd ? T('Toprak (GND) neti bulunamadı.') : T('Güç rayı bulunamadı.')) + ' ' }),
        asmEl('button', { class: 'asm-btn ghost', text: 'Netleri ata…', onclick: function () { showView('nets'); } }),
      ]));
    }
    return box;
  }
  function card() {
    var st = S.steps[S.idx];
    var r = S.res.steps[st.id];
    var box = asmEl('section', { class: 'tp-card', 'aria-labelledby': 'tp-title' });
    box.appendChild(asmEl('div', { class: 'tp-no', raw: 1, text: T('Adım {i} / {n} · {phase}', { i: st.no, n: S.steps.length, phase: st.phase.title }) }));
    box.appendChild(asmEl('h3', { id: 'tp-title', class: 'tp-title', text: st.title, raw: 1 }));
    if (st.phase.powered) {
      var unpoweredFails = S.steps.filter(function (x) { return !x.phase.powered && S.res.steps[x.id] && S.res.steps[x.id].status === 'fail'; });
      if (unpoweredFails.length) {
        box.appendChild(asmEl('div', { class: 'tp-banner danger', role: 'alert', raw: 1, text: T('⚠ Enerjisiz testlerde {n} KALDI sonucu var ({list}). Kısa devre giderilmeden karta enerji vermeyin.', { n: unpoweredFails.length, list: unpoweredFails.slice(0, 3).map(function (x) { return x.no + '. ' + x.title; }).join(', ') }) }));
      } else {
        box.appendChild(asmEl('div', { class: 'tp-banner power', raw: 1, text: T('⚡ Bu aşama enerji gerektirir. Multimetre DC V kademesinde; probları kısa devre yapmamaya dikkat edin.') }));
      }
    }
    box.appendChild(asmEl('ul', { class: 'tp-text' }, st.text.map(function (t) { return asmEl('li', { text: t, raw: 1 }); })));
    if (probesOf(st)) {
      var P = probesOf(st);
      var pcard = function (which, tip, label) {
        var q = P[which];
        return asmEl('div', { class: 'tp-pcol' }, [
          asmEl('div', { class: 'tp-probe ' + which }, [asmEl('span', { class: 'tp-tip', text: tip, raw: 1, 'aria-hidden': 'true' }),
            asmEl('div', {}, [asmEl('small', { text: label }), asmEl('b', { text: probeLabel(q), raw: 1 }),
              asmEl('small', { class: 'tp-net' }, [asmEl('i', { class: 'tp-netdot', style: 'background:' + netColor(P, which), 'aria-hidden': 'true' }),
                asmEl('span', { raw: 1, text: q.net + ' · ' + T(q.side === 'F' ? 'Üst yüz' : 'Alt yüz') })])])]),
          altRow(st, which),
        ]);
      };
      box.appendChild(asmEl('div', { class: 'tp-probes' }, [pcard('pos', '+', 'Kırmızı prob (+)'), pcard('neg', 'COM', 'Siyah prob (COM)')]));
      box.appendChild(asmEl('p', { class: 'tp-hint', text: 'Kartta probların değdiği netlerin tüm pad\'leri halkayla işaretlenir; aynı nete bağlı herhangi bir pad ölçüm için kullanılabilir.' }));
    }
    box.appendChild(asmEl('div', { class: 'tp-expect' }, [asmEl('span', { text: 'Beklenen:' }), asmEl('b', { text: st.expectText, raw: 1 })]));
    // measurement
    var inp = asmEl('input', { id: 'tp-val', class: 'asm-input tp-val', type: 'text', inputmode: 'decimal', autocomplete: 'off',
      'aria-describedby': 'tp-verdict', placeholder: st.kind === 'prep' ? 'ör. 0.2' : st.unit === 'V' ? 'ör. 3.29 · -12.1 · 250m' : st.unit === 'mA' ? 'ör. 85' : 'ör. 0.4 · 12k · OL', value: r && r.text ? r.text : '' });
    inp.setAttribute('aria-label', T('Ölçülen değer'));
    var unit = asmEl('select', { id: 'tp-unit', class: 'asm-select tp-unit', 'aria-label': 'Birim' }, (UNITS[st.unit] || UNITS['Ω']).map(function (u) { return asmEl('option', { value: u, text: u, raw: 1 }); }));
    var verdict = asmEl('div', { id: 'tp-verdict', class: 'tp-verdict', role: 'status', 'aria-live': 'polite' });
    var note = asmEl('input', { id: 'tp-note', class: 'asm-input tp-note', type: 'text', placeholder: 'Not (isteğe bağlı)', value: r && r.note ? r.note : '' });
    note.setAttribute('aria-label', T('Not'));
    var update = function () {
      var o = TESTPLAN.parseValue(inp.value, unit.value);
      var ohm = st.unit === 'Ω';
      var v = TESTPLAN.evaluate(st, o, st.kind === 'prep' || !ohm ? 0 : S.res.offset);
      verdict.className = 'tp-verdict ' + (v || (o != null ? 'manual' : ''));
      verdict.textContent = o == null ? (inp.value.trim() ? T(st.unit === 'V' ? 'Değer okunamadı (ör. 3.29, -12.1, 250m)' : 'Değer okunamadı (ör. 0.4, 12k, 1.5M, OL)') : '')
        : (fmtV(o, st) + (ohm && S.res.offset && st.kind !== 'prep' && o !== Infinity ? ' − ' + TESTPLAN.fmtOhms(S.res.offset) + ' ' + T('prob') : '') + ' → ' +
          (v === 'pass' ? T('GEÇTİ') : v === 'fail' ? T('KALDI') : T('karar sizde: Geçti / Kaldı')));
      return { ohms: o, verdict: v };
    };
    inp.addEventListener('input', update);
    unit.addEventListener('change', update);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); var u = update(); if (u.verdict) save(u.verdict); else if (st.optionalValue && !inp.value.trim()) save('pass'); else el('tp-pass').focus(); }
    });
    var ol = asmEl('button', { class: 'asm-btn tp-ol', text: 'OL', title: 'Açık devre (aşırı yük / sonsuz)', onclick: function () { inp.value = 'OL'; update(); inp.focus(); } });
    box.appendChild(asmEl('div', { class: 'tp-meas' }, [asmEl('label', { class: 'tp-lbl', for: 'tp-val', text: st.kind === 'prep' ? 'Prob direnci' : st.kind === 'power-on' ? 'Çekilen akım' : 'Ölçülen' }), inp, unit, st.unit === 'Ω' ? ol : null]));
    box.appendChild(verdict);
    box.appendChild(note);
    var save = function (status) {
      var u = update();
      if (!status) status = u.verdict;
      if (!status) { verdict.className = 'tp-verdict manual'; verdict.textContent = T('Önce değeri girin veya Geçti / Kaldı seçin'); inp.focus(); return; }
      record(st, status, u.ohms, inp.value.trim(), note.value.trim());
    };
    box.appendChild(asmEl('div', { class: 'tp-actions' }, [
      asmEl('button', { class: 'asm-btn', text: '◀ Önceki', disabled: S.idx === 0 ? 'disabled' : null, onclick: function () { select(S.idx - 1, true); } }),
      asmEl('button', { class: 'asm-btn', text: 'Atla', onclick: function () { record(st, 'skip', null, inp.value.trim(), note.value.trim()); } }),
      asmEl('button', { class: 'asm-btn tp-fail', id: 'tp-fail', text: 'Kaldı ✗', onclick: function () { save('fail'); } }),
      asmEl('button', { class: 'asm-btn primary tp-pass', id: 'tp-pass', text: 'Geçti ✓', title: 'Geçti olarak kaydet (değer yazıp Enter de kaydeder)', onclick: function () { save('pass'); } }),
    ]));
    if (r) box.appendChild(asmEl('div', { class: 'tp-last ' + r.status, raw: 1, text: T('Kayıtlı sonuç: {st} · {v} · {op} · {ts}', { st: T(r.status === 'pass' ? 'Geçti' : r.status === 'fail' ? 'Kaldı' : 'Atlandı'), v: r.ohms != null ? fmtV(r.ohms, st) : '—', op: r.op || '', ts: asmFmtTime(r.ts) }) }));
    setTimeout(function () { update(); }, 0);
    return box;
  }

  function list() {
    var ol = asmEl('ol', { class: 'tp-list', 'aria-label': T('Test adımları') });
    var lastPhase = null;
    S.steps.forEach(function (st, i) {
      if (st.phase !== lastPhase) {
        lastPhase = st.phase;
        var pc = phaseCounts(st.phase), pi = S.plan.phases.indexOf(st.phase) + 1;
        ol.appendChild(asmEl('li', { class: 'tp-phase' + (pc.fail ? ' has-fail' : '') }, [
          asmEl('span', { raw: 1, text: T('Aşama {i}', { i: pi }) + ' · ' + st.phase.title }),
          st.phase.powered ? asmEl('span', { class: 'tp-pw', raw: 1, text: '⚡ ' + T('enerjili'), title: T('Bu aşama enerji gerektirir') }) : asmEl('span', { class: 'tp-pw off', raw: 1, text: T('enerjisiz') }),
          asmEl('span', { class: 'tp-pc', raw: 1, text: (pc.n - pc.open) + '/' + pc.n + (pc.fail ? ' · ✗ ' + pc.fail : '') }),
        ]));
      }
      var r = S.res.steps[st.id];
      var b = asmEl('button', { class: 'tp-item' + (i === S.idx ? ' current' : '') + (r ? ' ' + r.status : ''), 'aria-current': i === S.idx ? 'step' : null,
        onclick: function () { select(i, true); } }, [
        asmEl('span', { class: 'tp-ico', 'aria-hidden': 'true', text: r ? STATUS[r.status] : String(st.no), raw: 1 }),
        asmEl('span', { class: 'tp-it' }, [asmEl('b', { text: st.title, raw: 1 }),
          asmEl('small', { raw: 1, text: (probesOf(st) ? probeLabel(probesOf(st).pos) + ' ↔ ' + probeLabel(probesOf(st).neg) + ' · ' : '') + st.expectText })]),
        asmEl('span', { class: 'tp-res', raw: 1, text: r ? (r.ohms != null ? fmtV(r.ohms, st) : T(r.status === 'skip' ? 'Atlandı' : r.status === 'pass' ? 'Geçti' : 'Kaldı')) : '' }),
      ]);
      b.setAttribute('aria-label', st.no + '. ' + st.title + (r ? ' — ' + T(r.status === 'pass' ? 'Geçti' : r.status === 'fail' ? 'Kaldı' : 'Atlandı') : ''));
      ol.appendChild(asmEl('li', {}, [b]));
    });
    return ol;
  }

  // ------------------------------------------------------------ actions
  function select(i, focusInput) {
    S.idx = Math.max(0, Math.min(S.steps.length - 1, i));
    var st = S.steps[S.idx];
    S.probes = probesOf(st) || null;
    render();
    showProbes();
    var cur = document.querySelector('.tp-item.current');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    if (focusInput && el('tp-val')) el('tp-val').focus();
  }
  function showProbes() {
    var p = S.probes;
    if (p && settings.canvaslayout !== 'FB') {
      var need = (p.pos.side === 'B' && !p.pos.th) || (p.neg.side === 'B' && !p.neg.th) ? 'B' : 'F';
      if (settings.canvaslayout !== need && typeof changeCanvasLayout === 'function' && !(typeof V3D !== 'undefined' && V3D.isOn())) changeCanvasLayout('FB');
    }
    drawHighlights();
    renderLegend();
    if (typeof V3D !== 'undefined') V3D.setProbes(p, probeNets(p));
  }
  function record(st, status, ohms, text, note) {
    var rec = { status: status, ohms: ohms === Infinity ? 'OL' : ohms, text: text, note: note, ts: Date.now(), op: __asm.session.operator || '' };
    if (rec.ohms === 'OL') rec.ohms = Infinity;
    S.res.steps[st.id] = rec;
    if (st.kind === 'prep') S.res.offset = ohms != null && isFinite(ohms) ? ohms : 0;
    var store = JSON.parse(JSON.stringify(S.res, function (k, v) { return v === Infinity ? 'OL' : v; }));
    __asm.boardKv.testResults = JSON.stringify(store);
    asm.kvSet('board', 'testResults', __asm.boardKv.testResults);
    var vtxt = ohms == null ? '—' : fmtV(ohms, st);
    asm.logAdd({ type: 'test', checkbox: T('Test'), refs: probesOf(st) ? [probesOf(st).pos.ref, probesOf(st).neg.ref] : [],
      value: st.no + '. ' + st.title + ' · ' + T(status === 'pass' ? 'Geçti' : status === 'fail' ? 'Kaldı' : 'Atlandı') + ' · ' + vtxt + ' (' + T('beklenen') + ' ' + st.expectText + ')' + (note ? ' · ' + note : '') });
    saveReport();
    asmToast((status === 'pass' ? '✓ ' : status === 'fail' ? '✗ ' : '– ') + st.no + '. ' + st.title + ' · ' + vtxt, status === 'fail' ? 'warn' : 'ok');
    var next = S.steps.findIndex(function (x, k) { return k > S.idx && !S.res.steps[x.id]; });
    if (next < 0) next = S.steps.findIndex(function (x) { return !S.res.steps[x.id]; });
    if (next < 0) {
      var c = counts();
      asmToast(T('Test tamamlandı: {p} geçti, {f} kaldı, {s} atlandı', { p: c.pass, f: c.fail, s: c.skip }), c.fail ? 'warn' : 'done');
      select(S.idx, false);
    } else select(next, true);
  }

  function reset() {
    S.res = { steps: {}, offset: 0 };
    __asm.boardKv.testResults = JSON.stringify(S.res);
    asm.kvSet('board', 'testResults', __asm.boardKv.testResults);
    asm.logAdd({ type: 'test', checkbox: T('Test'), refs: [], value: T('Test sonuçları sıfırlandı') });
    saveReport();
    if (S.on) select(0, true);
  }

  // --------------------------------------------------------------- report (PDF)
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function stTxt(r) { return r && r.status ? T(r.status === 'pass' ? 'Geçti' : r.status === 'fail' ? 'Kaldı' : 'Atlandı') : T('Bekliyor'); }
  function fmtTs(ts) {
    if (!ts) return '';
    var d = new Date(ts), z = function (n) { return (n < 10 ? '0' : '') + n; };
    return z(d.getDate()) + '.' + z(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes());
  }
  // self-contained report body; main wraps it in a page and prints A4 landscape
  function reportHtml() {
    var ss = __asm.session, c = counts(), total = S.steps.length;
    var verdict = c.fail ? ['fail', T('KALDI')] : c.open || c.skip ? ['open', T('TAMAMLANMADI')] : ['pass', T('GEÇTİ')];
    var ops = {};
    S.steps.forEach(function (st) { var r = S.res.steps[st.id]; if (r && r.op) ops[r.op] = 1; });
    var times = S.steps.map(function (st) { var r = S.res.steps[st.id]; return r && r.ts; }).filter(Boolean).sort();
    var h = [];
    h.push('<header><div><h1>' + esc(T('Donanım test raporu')) + '</h1><div class="sub">' + esc(ss.projectName || '') + (ss.revision ? ' · Rev ' + esc(ss.revision) : '') + '</div></div>' +
      '<div class="verdict ' + verdict[0] + '">' + esc(verdict[1]) + '</div></header>');
    h.push('<table class="meta"><tr>' +
      '<th>' + esc(T('Seri No')) + '</th><td>' + esc(ss.serial || '') + '</td>' +
      '<th>' + esc(T('Teknisyen')) + '</th><td>' + esc(Object.keys(ops).join(', ') || ss.operator || '') + '</td>' +
      '<th>' + esc(T('Başlangıç')) + '</th><td>' + esc(fmtTs(times[0])) + '</td>' +
      '<th>' + esc(T('Bitiş')) + '</th><td>' + esc(fmtTs(times[times.length - 1])) + '</td></tr><tr>' +
      '<th>' + esc(T('Prob direnci')) + '</th><td>' + esc(TESTPLAN.fmtOhms(S.res.offset || 0)) + '</td>' +
      '<th>' + esc(T('Adım')) + '</th><td>' + total + '</td>' +
      '<th>' + esc(T('Sonuç')) + '</th><td colspan="3"><b class="pass">' + c.pass + ' ' + esc(T('geçti')) + '</b> · <b class="fail">' + c.fail + ' ' + esc(T('kaldı')) + '</b> · ' +
        c.skip + ' ' + esc(T('atlandı')) + ' · ' + c.open + ' ' + esc(T('bekliyor')) + '</td></tr></table>');
    // phase summary
    h.push('<h2>' + esc(T('Aşama özeti')) + '</h2><table class="sum"><thead><tr><th>' + esc(T('Aşama')) + '</th><th>' + esc(T('Enerji')) + '</th><th>' + esc(T('Adım')) + '</th><th>' + esc(T('Geçti')) + '</th><th>' + esc(T('Kaldı')) + '</th><th>' + esc(T('Atlandı')) + '</th><th>' + esc(T('Bekliyor')) + '</th></tr></thead><tbody>');
    S.plan.phases.forEach(function (ph, i) {
      var k = phaseCounts(ph);
      h.push('<tr' + (k.fail ? ' class="rfail"' : '') + '><td>' + (i + 1) + '. ' + esc(ph.title) + '</td><td>' + esc(ph.powered ? T('enerjili') : T('enerjisiz')) + '</td><td>' + k.n + '</td><td>' + k.pass + '</td><td>' + k.fail + '</td><td>' + k.skip + '</td><td>' + k.open + '</td></tr>');
    });
    h.push('</tbody></table>');
    // steps
    h.push('<h2>' + esc(T('Ölçüm adımları')) + '</h2><table class="steps"><thead><tr><th>No</th><th>' + esc(T('Adım')) + '</th><th>' + esc(T('Kırmızı prob (+)')) + '</th><th>' + esc(T('Siyah prob (COM)')) + '</th><th>' + esc(T('Beklenen')) + '</th><th>' + esc(T('Ölçülen')) + '</th><th>' + esc(T('Sonuç')) + '</th><th>' + esc(T('Not')) + '</th><th>' + esc(T('Teknisyen')) + '</th><th>' + esc(T('Zaman')) + '</th></tr></thead><tbody>');
    var lastPh = null;
    S.steps.forEach(function (st) {
      if (st.phase !== lastPh) { lastPh = st.phase; h.push('<tr class="ph"><td colspan="10">' + esc(st.phase.title) + (st.phase.powered ? ' · ⚡ ' + esc(T('enerjili')) : '') + '</td></tr>'); }
      var r = S.res.steps[st.id] || {}, pr = probesOf(st);
      h.push('<tr class="r' + (r.status || 'open') + '"><td>' + st.no + '</td><td>' + esc(st.title) + '</td><td>' + esc(pr ? probeLabel(pr.pos) : '') + '</td><td>' + esc(pr ? probeLabel(pr.neg) : '') +
        '</td><td>' + esc(st.expectText) + '</td><td class="num">' + esc(r.ohms != null ? fmtV(r.ohms, st) : (r.text || '')) + '</td><td class="st">' + esc(stTxt(r)) + '</td><td>' + esc(r.note || '') +
        '</td><td>' + esc(r.op || '') + '</td><td class="num">' + esc(fmtTs(r.ts)) + '</td></tr>');
    });
    h.push('</tbody></table>');
    h.push('<div class="sign"><div>' + esc(T('Test eden')) + '<span></span></div><div>' + esc(T('Kontrol eden')) + '<span></span></div><div>' + esc(T('Tarih')) + '<span></span></div></div>');
    return { title: (ss.projectName || '') + ' SN ' + (ss.serial || ''), html: h.join('\n'), footer: T('Montaj Görüntüleyici – donanım test raporu') + ' · ' + (ss.projectName || '') + ' · SN ' + (ss.serial || '') };
  }
  var saveT = 0;
  function flushReport() {
    if (!saveT) return;
    clearTimeout(saveT); saveT = 0;
    try { asm.testSaveReport(reportHtml()).catch(function () { /* best effort */ }); } catch (e) { /* closing */ }
  }
  // debounced: quick successive entries produce one PDF; flushed when the page goes away
  function saveReport() {
    clearTimeout(saveT);
    saveT = setTimeout(flushReport, 600);
  }
  window.addEventListener('pagehide', flushReport);
  // ------------------------------------------------------------ settings
  function settingsModal(focus) {
    var C = S.plan.config, cur = testConfig();
    var num = function (id, label, val, unit) {
      return asmEl('label', { class: 'ts-f' }, [asmEl('span', { text: label }), asmEl('span', { class: 'ts-in' }, [
        asmEl('input', { id: id, class: 'asm-input', type: 'text', inputmode: 'decimal', value: String(val) }), unit ? asmEl('small', { text: unit, raw: 1 }) : null])]);
    };
    var phaseNames = { pwr: 'Güç hatları – GND / şase kısa devre', volt: 'Gerilim kanalları', comm: 'Haberleşme hatları', sens: 'Sensör hatları', io: 'I/O hatları' };
    var phases = asmEl('fieldset', { class: 'ts-ph' }, [asmEl('legend', { text: 'Aşamalar' })].concat(Object.keys(phaseNames).map(function (k) {
      return asmEl('label', { class: 'ts-chk' }, [asmEl('input', { type: 'checkbox', id: 'ts-ph-' + k, checked: C.phases[k] !== false ? 'checked' : null }), asmEl('span', { text: phaseNames[k] })]);
    })));
    var rows = (S.plan.rails || []).map(function (r) {
      var o = (cur.rails || {})[r.net] || {};
      return asmEl('tr', {}, [
        asmEl('th', { scope: 'row', text: r.net, raw: 1 }),
        asmEl('td', { raw: 1, text: r.auto != null ? TESTPLAN.fmtVolts(r.auto) : '—' }),
        asmEl('td', { class: 'ts-why', raw: 1, text: r.why || TESTPLAN.whyNet(r.net, T) }),
        asmEl('td', {}, [asmEl('input', { class: 'asm-input ts-nom' + (r.include !== false && r.nominal == null ? ' missing' : ''), 'data-net': r.net, type: 'text', inputmode: 'decimal',
          placeholder: r.auto != null ? String(r.auto) : T('gerekli'), 'aria-invalid': r.include !== false && r.nominal == null ? 'true' : null,
          value: o.nominal != null ? String(o.nominal) : '', 'aria-label': T('{net} nominal gerilim (V)', { net: r.net }) })]),
        asmEl('td', {}, [asmEl('input', { type: 'radio', name: 'ts-input', class: 'ts-inp', 'data-net': r.net, checked: r.input ? 'checked' : null, 'aria-label': T('{net} giriş rayı', { net: r.net }) })]),
        asmEl('td', {}, [asmEl('input', { type: 'checkbox', class: 'ts-inc', 'data-net': r.net, checked: r.include !== false ? 'checked' : null, 'aria-label': T('{net} teste dahil', { net: r.net }) })]),
      ]);
    });
    var table = asmEl('table', { class: 'ts-rails' }, [
      asmEl('thead', {}, [asmEl('tr', {}, ['Ray', 'Addan', 'Neden', 'Nominal (V)', 'Giriş', 'Dahil'].map(function (h) { return asmEl('th', { text: h, scope: 'col' }); }))]),
      asmEl('tbody', {}, rows.length ? rows : [asmEl('tr', {}, [asmEl('td', { colspan: '6', text: 'Güç rayı bulunamadı.' })])]),
    ]);
    var body = asmEl('div', { class: 'ts-body' }, [
      asmEl('p', { class: 'asm-label', text: 'Ayarlar bu projenin tüm kartları için geçerlidir. Boş bırakılan nominal değerler net adından alınır (28V_IN, +5V0, 3V3 …).' }),
      asmEl('div', { class: 'ts-grid' }, [
        num('ts-volt', 'Gerilim toleransı', C.voltTol, '± %'),
        num('ts-in', 'Giriş rayı toleransı', C.inputTol, '± %'),
        num('ts-rmin', 'Ray – GND en düşük direnç', C.railMinOhm, 'Ω'),
        num('ts-ilim', 'Besleme akım sınırı', C.currentLimit, ''),
        num('ts-iomax', 'En fazla I/O adımı', C.ioMax, ''),
      ]),
      asmEl('label', { class: 'ts-f ts-palfield' }, [asmEl('span', { text: 'Ölçülen net renkleri' }), paletteSelect('ts-pal')]),
      phases,
      asmEl('h4', { class: 'ts-h', text: 'Güç rayları' }),
      table,
      asmEl('h4', { class: 'ts-h', text: 'Toprak ve şase netleri' }),
      asmEl('ul', { class: 'ts-gnds' }, (S.plan.grounds || []).length ? S.plan.grounds.map(function (g) {
        return asmEl('li', {}, [asmEl('b', { text: g.net, raw: 1 }), asmEl('span', { raw: 1, text: ' — ' + (g.cls === 'chassis' ? T('şase') : T('toprak')) + ' · ' + (g.why || TESTPLAN.whyNet(g.net, T)) + ' · ' + g.pads + ' pad' })]);
      }) : [asmEl('li', { text: 'Toprak neti bulunamadı.' })]),
      asmEl('h4', { class: 'ts-h', id: 'ts-roles-h', text: 'Test edilecek netler' }),
      asmEl('p', { class: 'asm-label ts-netsel' }, [
        asmEl('span', { text: 'Hangi netlerin test edileceği ve rolleri (güç rayı / toprak / şase / sinyal) Net seçimi ekranında belirlenir. ' }),
        asmEl('button', { class: 'asm-btn', type: 'button', text: 'Net seçimini aç', onclick: function () { asmCloseModal(); showView('nets'); } }),
      ]),
    ]);
    asmOpenModal('Test ayarları', body, [
      { label: 'Vazgeç', onclick: asmCloseModal },
      { label: 'Kaydet', primary: true, onclick: function () {
        var q = function (id) { return document.getElementById(id).value.trim(); };
        var cfg = { voltTol: +q('ts-volt').replace(',', '.'), inputTol: +q('ts-in').replace(',', '.'), railMinOhm: +q('ts-rmin').replace(',', '.'),
          currentLimit: q('ts-ilim'), ioMax: +q('ts-iomax'), phases: {}, rails: {} };
        Object.keys(phaseNames).forEach(function (k) { cfg.phases[k] = document.getElementById('ts-ph-' + k).checked; });
        document.querySelectorAll('.ts-rails tbody tr').forEach(function (tr) {
          var nom = tr.querySelector('.ts-nom');
          if (!nom) return;
          var net = nom.dataset.net, o = {};
          var v = TESTPLAN.parseVolts(nom.value);
          if (nom.value.trim() && v != null) o.nominal = v;
          o.input = tr.querySelector('.ts-inp').checked;
          if (!tr.querySelector('.ts-inc').checked) o.include = false;
          cfg.rails[net] = o;
        });
        // net roles and the saved selection are owned by the "Net seçimi" view: keep them
        cfg.nets = cur.nets || {};
        if (cur.selection) cfg.selection = true;
        writeStorage('testConfig', JSON.stringify(cfg));
        asmCloseModal();
        var curId = S.steps[S.idx] && S.steps[S.idx].id;
        build();
        var k = S.steps.findIndex(function (x) { return x.id === curId; });
        select(k >= 0 ? k : S.idx, false);
        asmToast(T('Test planı güncellendi: {n} adım', { n: S.steps.length }), 'ok');
      } },
    ], true);
    if (focus === 'nominal') {
      var f = document.querySelector('.ts-nom.missing');
      if (f) { f.scrollIntoView({ block: 'center' }); f.focus(); }
    }
  }

  function exportReport() {
    asm.testExportReport(reportHtml()).then(function (p) { if (p) asmToast(T('Kaydedildi: {file}', { file: p }), 'ok'); });
  }

  // ----------------------------------------------------- 2D probe markers
  // Measured nets are drawn boldly (like a net highlight): solid pours with an outline,
  // traces at least a few pixels wide with a dark halo, every pad filled and ringed.
  function drawNet2d(ctx, L, net, color) {
    var m = ctx.getTransform(), sc = Math.hypot(m.a, m.b) || 1, px = 1 / sc;
    var halo = 'rgba(0,0,0,0.6)';
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // only the pads of the net (copper pours and traces would cover the whole board)
    pcbdata.footprints.forEach(function (fp) {
      fp.pads.forEach(function (pad) {
        if (N(pad.net) !== net || pad.layers.indexOf(L) < 0) return;
        var r = Math.max(pad.size[0], pad.size[1]) / 2 + Math.max(0.3, 4 * px);
        ctx.lineWidth = 5 * px; ctx.strokeStyle = halo;
        ctx.beginPath(); ctx.arc(pad.pos[0], pad.pos[1], r, 0, 2 * Math.PI); ctx.stroke();
        try { drawPad(ctx, pad, color, false); } catch (e) { /* skip */ }
        // ring around every point of the net: alternative probe places stand out
        ctx.lineWidth = 2.5 * px; ctx.strokeStyle = color;
        ctx.beginPath(); ctx.arc(pad.pos[0], pad.pos[1], r, 0, 2 * Math.PI); ctx.stroke();
      });
    });
    ctx.restore();
  }
  // legend: which colour is which net / probe
  function renderLegend() {
    var lg = el('asm-netlegend');
    if (!lg) return;
    lg.innerHTML = '';
    lg.hidden = !(S.on && S.probes);
    if (lg.hidden) return;
    var P = S.probes;
    probeNets(P).forEach(function (n) {
      var who = n.which === 'both' ? T('+ ve COM') : n.which === 'pos' ? T('kırmızı prob (+)') : T('siyah prob (COM)');
      lg.appendChild(asmEl('div', { class: 'nl-row' }, [
        asmEl('i', { class: 'nl-sw', style: 'background:' + n.color, 'aria-hidden': 'true' }),
        asmEl('b', { text: n.net, raw: 1 }),
        asmEl('span', { raw: 1, text: who + ' · ' + T('{n} nokta', { n: TESTPLAN.netSize(pcbdata, n.net) }) }),
      ]));
    });
    lg.appendChild(asmEl('label', { class: 'nl-row nl-palrow' }, [asmEl('span', { text: 'Renkler' }), paletteSelect('nl-pal')]));
  }
  // Callout: a small target ring on the contact point (the pad / probe tip stays
  // visible), a thin leader line and the "+" / "COM" icon with the reference label.
  function drawCallout(ctx, tip, end, kind, text) {
    var dpr = window.devicePixelRatio || 1, R = 13 * dpr;
    var col = kind === 'pos' ? '#e5172f' : '#111111';
    var left = end.x < tip.x;
    ctx.save();
    // leader line: white core over a dark halo, starting at the ring edge
    var dx = end.x - tip.x, dy = end.y - tip.y, L = Math.hypot(dx, dy) || 1;
    var sx = tip.x + dx / L * 8 * dpr, sy = tip.y + dy / L * 8 * dpr;
    var ex = end.x - dx / L * (R + 2 * dpr), ey = end.y - dy / L * (R + 2 * dpr);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.lineWidth = 3.2 * dpr;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4 * dpr;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    // target ring at the contact point (hollow)
    ctx.lineWidth = 4 * dpr; ctx.strokeStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(tip.x, tip.y, 7 * dpr, 0, 2 * Math.PI); ctx.stroke();
    ctx.lineWidth = 2.2 * dpr; ctx.strokeStyle = kind === 'pos' ? '#e5172f' : '#111111';
    ctx.beginPath(); ctx.arc(tip.x, tip.y, 7 * dpr, 0, 2 * Math.PI); ctx.stroke();
    // icon
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 5 * dpr;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(end.x, end.y, R + 2.5 * dpr, 0, 2 * Math.PI); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(end.x, end.y, R, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 ' + Math.round((kind === 'pos' ? 19 : 9) * dpr) + 'px "DejaVu Sans", sans-serif';
    ctx.fillText(kind === 'pos' ? '+' : 'COM', end.x, end.y + (kind === 'pos' ? 1 : 0.5) * dpr);
    // label pill beside the icon, on the side away from the contact point
    ctx.font = '700 ' + Math.round(13 * dpr) + 'px "DejaVu Sans", sans-serif';
    var tw = ctx.measureText(text).width + 14 * dpr, th = 22 * dpr;
    var lx = left ? end.x - R - 6 * dpr - tw : end.x + R + 6 * dpr, ly = end.y - th / 2;
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 4 * dpr;
    ctx.fillStyle = col; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8 * dpr;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(lx, ly, tw, th, 5 * dpr); ctx.fill(); ctx.stroke(); } else { ctx.fillRect(lx, ly, tw, th); }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
    ctx.fillText(text, lx + 7 * dpr, ly + th / 2 + 1);
    ctx.restore();
  }
  // leader directions: away from the other probe and slightly upwards
  function calloutEnds(a, b, W, H) {
    var dpr = window.devicePixelRatio || 1, len = 62 * dpr;
    var out = {};
    var mid = a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : null;
    [['pos', a, -1], ['neg', b, 1]].forEach(function (q) {
      var p = q[1];
      if (!p) return;
      var dx = mid ? p.x - mid.x : 0, dy = mid ? p.y - mid.y : 0;
      if (Math.hypot(dx, dy) < 4) { dx = q[2] * 1; dy = -0.6; }
      var L = Math.hypot(dx, dy); dx /= L; dy /= L;
      dy -= 0.55; L = Math.hypot(dx, dy); dx /= L; dy /= L;
      var e = { x: p.x + dx * len, y: p.y + dy * len };
      // keep the icon and its label inside the canvas
      if (e.y < 18 * dpr || e.y > H - 18 * dpr) { dy = -dy; e.y = p.y + dy * len; }
      if (e.x < 110 * dpr || e.x > W - 110 * dpr) { dx = -dx; e.x = p.x + dx * len; }
      out[q[0]] = e;
    });
    return out;
  }
  // called for each board side after every highlight redraw (selection, zoom, pan, resize)
  function drawProbesLayer(cd) {
    if (S.on && S.view === 'nets' && S.previewNet && cd) { drawNet2d(cd.highlight.getContext('2d'), cd.layer, S.previewNet, NET_COLORS.same); return; }
    if (!S.on || S.view === 'nets' || !S.probes || !cd) return;
    var L = cd.layer;
    var ctx = cd.highlight.getContext('2d');
    probeNets(S.probes).forEach(function (n) { drawNet2d(ctx, L, n.net, n.color); });
    var m = ctx.getTransform(), sc = Math.hypot(m.a, m.b) || 1;
    var tips = {};
    ['pos', 'neg'].forEach(function (k) {
      var p = S.probes[k];
      if (!p) return;
      var pad = pcbdata.footprints[p.fp] && pcbdata.footprints[p.fp].pads[p.pad];
      var onSide = p.th || (pad ? pad.layers.indexOf(L) >= 0 : p.side === L);
      if (!onSide) return;
      // exact pad outline (board units) so the contact spot is unambiguous at any zoom
      if (pad) {
        ctx.save();
        ctx.lineWidth = 3 / sc; ctx.strokeStyle = '#ffffff';
        try { drawPad(ctx, pad, k === 'pos' ? '#e5172f' : '#111111', false); drawPad(ctx, pad, '#ffffff', true); } catch (e) { /* skip */ }
        ctx.restore();
      }
      tips[k] = m.transformPoint(new DOMPoint(p.pos[0], p.pos[1]));
    });
    var ends = calloutEnds(tips.pos, tips.neg, cd.highlight.width, cd.highlight.height);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ['pos', 'neg'].forEach(function (k) {
      if (!tips[k]) return;
      var p = S.probes[k];
      drawCallout(ctx, tips[k], ends[k], k, p.ref + '.' + p.pin);
    });
    ctx.restore();
  }

  // ----------------------------------------------------------------- init
  function init() {
    if (typeof TESTPLAN === 'undefined' || !el('asm-test')) return;
    load();
    if (S.res.steps) Object.keys(S.res.steps).forEach(function (k) { if (S.res.steps[k].ohms === 'OL') S.res.steps[k].ohms = Infinity; });
    el('asm-mode-assembly').onclick = function () { setMode(false, true); };
    el('asm-mode-test').onclick = function () { setMode(true, true); };
    // hook the per-side highlight redraw: it also runs on zoom, pan and resize
    var origLayer = drawHighlightsOnLayer;
    drawHighlightsOnLayer = function (cd) { origLayer.apply(this, arguments); drawProbesLayer(cd); };
    if (readStorage('viewMode') === 'test') setMode(true, false);
  }

  return { init: init, setMode: setMode, reset: reset, settings: settingsModal, isOn: function () { return S.on; }, probes: function () { return S.on ? S.probes : null; }, state: S, reportHtml: reportHtml, showView: showView };
})();
