# PCB Sipariş Hazırlayıcı / PCB Order Builder

Tek sayfalık, sunucu tarafı gerektirmeyen (statik) bir web sitesidir. Gerber/Excellon dosyaları yalnızca kullanıcının tarayıcısında işlenir; hiçbir yere yüklenmez.

## İçerik

| Dosya | Açıklama |
|---|---|
| `index.html` | Uygulamanın tamamı (arayüz, Gerber/Excellon ayrıştırıcı, 2D/3D görüntüleyici, form, PDF rapor) |
| `lib/jspdf.umd.min.js`, `lib/jspdf.plugin.autotable.min.js` | PDF üretimi (jsPDF 2.5.2, AutoTable 3.8.4 — MIT) |
| `lib/pdf-fonts.js` | PDF için Türkçe karakter destekli DejaVu Sans alt kümesi (Bitstream Vera / DejaVu lisansı) |
| `lib/three.min.js`, `lib/OrbitControls.js` | 3D görünüm (three.js r147 — MIT) |

Klasör yapısını bozmayın: `index.html` ile `lib/` aynı yerde kalmalıdır.

## Kullanım seçenekleri

**1. Bilgisayarda doğrudan açma (sunucusuz)**
`index.html` dosyasına çift tıklayın. Gerber yükleme, 3D ve PDF indirme çalışır. Yalnızca IBM Plex yazı tipi internet yoksa sistem yazı tipine düşer.

**2. Şirket içi ağ (intranet) — IIS / nginx / Apache**
Klasörü web sunucusunun kök dizinine ya da bir alt dizinine kopyalayın, ör. `C:\inetpub\wwwroot\pcb-siparis\`. Ek yapılandırma gerekmez; yalnızca `.js`, `.html`, `.md` dosyalarının sunulması yeterlidir.

nginx örneği:
```nginx
location /pcb-siparis/ {
    alias /var/www/pcb-siparis/;
    index index.html;
}
```

**3. GitHub Pages (ücretsiz, herkese açık)**
1. Yeni bir depo oluşturun, bu klasörün içeriğini depoya yükleyin.
2. *Settings → Pages → Source: Deploy from a branch*, dal `main`, klasör `/ (root)`.
3. Birkaç dakika sonra `https://<kullanıcı>.github.io/<depo>/` adresinde yayında olur.

**4. Netlify / Cloudflare Pages (sürükle-bırak)**
Netlify Drop sayfasına klasörü sürükleyin; size bir adres verir. Kendi alan adınızı bağlayabilirsiniz.

## Notlar
- Seçimler ve dil tercihi tarayıcının `localStorage` alanında saklanır (kullanıcı başına, cihaz başına).
- Gizli tasarımlar için 1. veya 2. seçenek önerilir; dosyalar zaten tarayıcıdan çıkmaz, ancak sayfanın kendisinin herkese açık olması istenmeyebilir.
- Harici bağlantı yalnızca Google Fonts içindir (`fonts.googleapis.com`). Tamamen çevrimdışı/izole ağ için `index.html` içindeki iki `<link ... fonts.googleapis.com ...>` satırını silebilirsiniz.

---

**EN —** Static single-page app. Open `index.html` directly, or copy the folder to any web server (IIS, nginx, Apache), GitHub Pages, Netlify or Cloudflare Pages. Keep `index.html` and `lib/` together. Gerber files are processed locally in the browser and never uploaded.
