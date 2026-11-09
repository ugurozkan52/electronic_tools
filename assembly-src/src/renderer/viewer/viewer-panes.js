// Pop-out panes: the BOM list and the board view can be shown in separate windows
// (e.g. on two monitors). The main ("leader") window keeps the toolbar and the other pane;
// a pane window is the same viewer opened with ?pane=bom|board that shows one pane only.
// Windows stay in step through asm.paneSend / asm.onPane (Electron: relayed by the main process,
// web: BroadcastChannel). Messages:
//   hello/bye   a pane window opened / closed          close   leader asks a pane window to close
//   kv          a stored setting or checkbox column changed (value as stored)
//   hl          the highlighted part(s) / net changed
//   rpc         web pane window → leader: perform a storage write (the leader is the only writer,
//               every window holds its own in-memory copy of the browser file system)
/* global asm, __asm, pcbdata, settings, I18N, EventHandler, IBOM_EVENT_TYPES, footprintIndexToHandler, currentHighlightedRowId,
   smoothScrollToRow, clearHighlightedFootprints, drawHighlights, netClicked, populateBomTable, markedFootprints, asmRenderProgress,
   asmSnapshot, asmCheckboxNames, asmToast, resizeAll, V3D, writeStorage, redrawIfInitDone */
'use strict';

var PANE = (function () { try { var p = new URLSearchParams(location.search).get('pane'); return p === 'bom' || p === 'board' ? p : ''; } catch (e) { return ''; } })();
var __pn = { applying: 0, popped: '' };   // popped: pane currently shown in its own window (leader only)

function pnSend(m) { if (!__pn.applying && typeof asm.paneSend === 'function') { try { asm.paneSend(m); } catch (e) { /* no channel */ } } }
function pnRelayout() {
  setTimeout(function () {
    try { window.dispatchEvent(new Event('resize')); if (typeof resizeAll === 'function') resizeAll(); if (typeof V3D !== 'undefined') V3D.resize(); } catch (e) { /* page still starting */ }
  }, 60);
}

// ------------------------------------------------------------------ layout
function pnSetPopped(pane) {
  __pn.popped = pane || '';
  document.body.classList.toggle('asm-popped-bom', pane === 'bom');
  document.body.classList.toggle('asm-popped-board', pane === 'board');
  [['board', 'asm-pop-board', 'Kart ayrı pencerede', 'Kartı geri getir'],
   ['bom', 'asm-pop-bom', 'BOM ayrı pencerede', 'BOM’u geri getir']].forEach(function (d) {
    var b = document.getElementById(d[1]);
    if (b) b.textContent = I18N.t(pane === d[0] ? d[3] : d[2]);
  });
  pnRelayout();
}

// --------------------------------------------------------- incoming messages
function pnApplyKv(m) {
  var isBoard = m.key.indexOf('checkbox_') === 0;
  (isBoard ? __asm.boardKv : __asm.settingsKv)[m.key] = m.value;
  if (isBoard) {
    var name = m.key.slice('checkbox_'.length);
    delete settings.checkboxStoredRefs[name];
    if (settings.markWhenChecked === name) {
      markedFootprints.clear();
      getStoredCheckboxRefs(name).forEach(function (r) { markedFootprints.add(r); });
    }
    populateBomTable();
    drawHighlights();
    asmSnapshot(name);
    asmRenderProgress();
    if (typeof redrawIfInitDone === 'function') redrawIfInitDone();
    if (typeof V3D !== 'undefined') V3D.sync();
    return;
  }
  var on = m.value === 'true';
  var fn = { padsVisible: padsVisible, referencesVisible: referencesVisible, valuesVisible: valuesVisible, tracksVisible: tracksVisible,
    zonesVisible: zonesVisible, dnpOutline: dnpOutline, fabricationVisible: fabricationVisible, silkscreenVisible: silkscreenVisible }[m.key];
  if (fn) { fn(on); return; }
  if (m.key === 'darkmode') setDarkMode(on);
  else if (m.key === 'canvaslayout') changeCanvasLayout(m.value);
  else if (m.key === 'view3d' && typeof V3D !== 'undefined' && V3D.isOn() !== on) V3D.setOn(on, false);
}

function pnApplyHighlight(m) {
  if (m.refs && m.refs.length) {
    var h = footprintIndexToHandler[m.refs[0]];
    if (h) { h(); try { smoothScrollToRow(currentHighlightedRowId); } catch (e) { /* row not visible */ } return; }
    clearHighlightedFootprints();
    highlightedFootprints = m.refs.slice();      // part not listed here (other face): still highlight it on the board
    highlightedNet = null;
    drawHighlights();
  } else if (m.net) {
    netClicked(m.net);
  } else {
    clearHighlightedFootprints();
    drawHighlights();
  }
}

function pnOnMessage(m) {
  if (!m || typeof m !== 'object') return;
  __pn.applying++;
  try {
    switch (m.t) {
      case 'kv': pnApplyKv(m); break;
      case 'hl': pnApplyHighlight(m); break;
      case 'hello': if (!PANE) pnSetPopped(m.pane); break;
      case 'bye': if (!PANE && __pn.popped === m.pane) pnSetPopped(''); break;
      case 'close': if (PANE === m.pane) window.close(); break;
      case 'leader-bye': if (PANE) window.close(); break;
      case 'rpc': if (!PANE && (m.fn === 'kvSet' || m.fn === 'logAdd') && typeof asm[m.fn] === 'function') asm[m.fn].apply(asm, m.args || []); break;
    }
  } catch (e) { console.error('pane message', m && m.t, e); } finally { __pn.applying--; }
}

// -------------------------------------------------------------- outgoing events
var __pnOrigWrite = writeStorage;
writeStorage = function (key, value) {
  __pnOrigWrite(key, value);
  if (typeof key !== 'string') return;
  pnSend({ t: 'kv', key: key, value: key.indexOf('checkbox_') === 0 ? __asm.boardKv[key] : __asm.settingsKv[key] });
};

EventHandler.registerCallback(IBOM_EVENT_TYPES.HIGHLIGHT_EVENT, function (e) {
  var a = e.args || {};
  pnSend({ t: 'hl', refs: (a.refs || []).map(function (r) { return r[1]; }), net: a.net || null });
});

// ------------------------------------------------------------------ startup
function pnTogglePane(pane) {
  if (__pn.popped === pane) { pnSend({ t: 'close', pane: pane }); pnSetPopped(''); return; }
  if (__pn.popped) { asmToast(I18N.t('Önce açık olan pencereyi kapatın.'), 'warn'); return; }
  Promise.resolve(asm.paneOpen(pane)).then(function (ok) {
    if (ok) pnSetPopped(pane); else asmToast(I18N.t('Pencere açılamadı. Tarayıcının açılır pencere engelini kaldırın.'), 'warn');
  }, function () { asmToast(I18N.t('Pencere açılamadı. Tarayıcının açılır pencere engelini kaldırın.'), 'warn'); });
}

var __pnOrigOnload = window.onload;
window.onload = function (e) {
  if (typeof __pnOrigOnload === 'function') __pnOrigOnload.call(window, e);
  if (typeof asm.onPane !== 'function' || typeof asm.paneSend !== 'function') return;
  if (PANE) {
    document.body.classList.add('asm-pane-' + PANE);
    document.title = (PANE === 'bom' ? I18N.t('BOM listesi') : I18N.t('Kart görünümü')) + ' — ' + document.title;
    // web build: this window holds its own copy of the file system, so storage writes go through the leader
    if (asm.ready) {
      asm.kvSet = function (scope, key, value) { pnSend({ t: 'rpc', fn: 'kvSet', args: [scope, key, value] }); };
      asm.logAdd = function (evt) { pnSend({ t: 'rpc', fn: 'logAdd', args: [evt] }); return Promise.resolve(); };
    }
  }
  asm.onPane(pnOnMessage);
  if (PANE) {
    pnSend({ t: 'hello', pane: PANE });
    window.addEventListener('pagehide', function () { pnSend({ t: 'bye', pane: PANE }); });
    pnRelayout();
  } else {
    window.addEventListener('pagehide', function () { pnSend({ t: 'leader-bye' }); });
    var bb = document.getElementById('asm-pop-board'), bo = document.getElementById('asm-pop-bom');
    if (bb) { bb.hidden = false; bb.onclick = function () { pnTogglePane('board'); }; }
    if (bo) { bo.hidden = false; bo.onclick = function () { pnTogglePane('bom'); }; }
  }
};
