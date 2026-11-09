/* Giriş ekranı (kullanıcı adı + şifre) — tüm araç sayfalarında en başta yüklenir.
 *
 * ÖNEMLİ: Bu, GitHub Pages gibi statik bir sitede tarayıcıda çalışan bir giriş ekranıdır. Sayfa dosyaları herkese
 * gönderilir; bu betik yalnızca ekranı kilitler. Dosyaları indiren ya da geliştirici araçlarını kullanan biri
 * bunu aşabilir ve kısa bir şifre kolayca denenebilir. Gerçek erişim denetimi için sunucu taraflı bir çözüm
 * (ör. Cloudflare Access, Netlify/Vercel parolası, özel depo + özel barındırma) gerekir.
 *
 * Şifre düz yazı olarak tutulmaz; "tuz|kullanıcı|şifre" metninin SHA-256 özeti karşılaştırılır.
 * Kullanıcı adı/şifre değiştirmek için: printf '%s' 'et-tools|KULLANICI|ŞİFRE' | sha256sum  → aşağıdaki HASH'e yazın.
 */
(function () {
  'use strict';
  var HASH = '42e0e6e0133c0ca1c452dfa73bd034585f86cd43fbae5e932a8c658648cd361a';
  var SALT = 'et-tools|', KEY = 'et-auth', DAYS = 30;

  function ok() {
    try { if (sessionStorage.getItem(KEY) === HASH) return true; } catch (e) { /* ignore */ }
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && s.h === HASH && s.exp > Date.now()) return true;
    } catch (e) { /* ignore */ }
    return false;
  }
  window.etLogout = function () {
    try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    location.reload();
  };
  if (ok()) return;

  // hide the page until the user signs in
  var st = document.createElement('style');
  st.textContent = 'html.et-locked body>*:not(#et-gate){display:none!important}html.et-locked{overflow:hidden}';
  document.head.appendChild(st);
  document.documentElement.classList.add('et-locked');

  function sha256(text) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('no-crypto'));
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }

  function build() {
    var dark = (document.documentElement.getAttribute('data-theme') || (function () { try { return localStorage.getItem('et-theme'); } catch (e) { return 'dark'; } })() || 'dark') !== 'light';
    var c = dark ? { bg: '#0f1216', card: '#181d24', line: '#2a313b', ink: '#e7ebf0', mute: '#98a1ae', acc: '#46c37b', err: '#ff8a80' }
                 : { bg: '#f3f4f6', card: '#ffffff', line: '#dfe3e8', ink: '#161a20', mute: '#5b6470', acc: '#1f8f4f', err: '#b3261e' };
    var box = document.createElement('div'); box.id = 'et-gate';
    box.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:16px;background:' + c.bg + ';color:' + c.ink + ';font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif');
    box.innerHTML =
      '<form style="width:100%;max-width:340px;background:' + c.card + ';border:1px solid ' + c.line + ';border-radius:14px;padding:26px 24px" autocomplete="on">' +
      '<h1 style="margin:0 0 4px;font-size:22px">Elektronik Araçlar</h1>' +
      '<p style="margin:0 0 18px;color:' + c.mute + ';font-size:14px">Devam etmek için giriş yapın.</p>' +
      '<label style="display:block;font-size:12px;color:' + c.mute + ';margin-bottom:4px" for="et-u">Kullanıcı adı</label>' +
      '<input id="et-u" name="username" autocomplete="username" required autofocus style="width:100%;box-sizing:border-box;padding:10px 12px;margin-bottom:12px;border:1px solid ' + c.line + ';border-radius:8px;background:transparent;color:' + c.ink + ';font:inherit">' +
      '<label style="display:block;font-size:12px;color:' + c.mute + ';margin-bottom:4px" for="et-p">Şifre</label>' +
      '<input id="et-p" name="password" type="password" autocomplete="current-password" required style="width:100%;box-sizing:border-box;padding:10px 12px;margin-bottom:12px;border:1px solid ' + c.line + ';border-radius:8px;background:transparent;color:' + c.ink + ';font:inherit">' +
      '<label style="display:flex;gap:8px;align-items:center;font-size:13px;color:' + c.mute + ';margin-bottom:14px"><input id="et-r" type="checkbox"> Bu tarayıcıda 30 gün hatırla</label>' +
      '<div id="et-e" role="alert" style="min-height:20px;color:' + c.err + ';font-size:13px;margin-bottom:8px"></div>' +
      '<button type="submit" style="width:100%;padding:11px;border:0;border-radius:8px;background:' + c.acc + ';color:#fff;font:inherit;font-weight:700;cursor:pointer">Giriş yap</button>' +
      '</form>';
    document.body.appendChild(box);
    var form = box.querySelector('form'), err = box.querySelector('#et-e'), fails = 0, busy = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (busy) return;
      var u = box.querySelector('#et-u').value.trim().toLowerCase(), p = box.querySelector('#et-p').value;
      busy = true; err.textContent = '';
      sha256(SALT + u + '|' + p).then(function (h) {
        if (h === HASH) {
          try {
            if (box.querySelector('#et-r').checked) localStorage.setItem(KEY, JSON.stringify({ h: HASH, exp: Date.now() + DAYS * 864e5 }));
            else sessionStorage.setItem(KEY, HASH);
          } catch (x) { /* storage blocked: the gate stays open for this page view only */ }
          document.documentElement.classList.remove('et-locked'); box.remove(); st.remove();
          window.dispatchEvent(new Event('resize'));
        } else {
          fails++; var wait = Math.min(5, fails) * 800;
          err.textContent = 'Kullanıcı adı veya şifre hatalı.';
          setTimeout(function () { busy = false; }, wait); return;
        }
        busy = false;
      }, function () { err.textContent = 'Bu tarayıcıda giriş doğrulanamadı (güvenli bağlantı gerekli).'; busy = false; });
    });
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
