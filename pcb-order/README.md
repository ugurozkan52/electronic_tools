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
`index.html` dosyasına çift tıklayın. Gerber yükleme, 3D ve PDF indirme çalışır. 

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
Bu klasör tek başına yayınlanacaksa: yeni bir depo oluşturup içeriği yükleyin, *Settings → Pages → Source: Deploy from a branch* (dal `main`, klasör `/ (root)`) seçin; birkaç dakika sonra `https://<kullanıcı>.github.io/<depo>/` adresinde yayında olur. Elektronik Araçlar sitesinin parçası olarak ise kök `README.md` içindeki GitHub Actions akışı kullanılır (Source: GitHub Actions) ve bu klasör olduğu gibi `/pcb-order/` altına kopyalanır.

**4. Netlify / Cloudflare Pages (sürükle-bırak)**
Netlify Drop sayfasına klasörü sürükleyin; size bir adres verir. Kendi alan adınızı bağlayabilirsiniz.

## Notlar
- Seçimler ve dil tercihi tarayıcının `localStorage` alanında saklanır (kullanıcı başına, cihaz başına). Açık/koyu tema `et-theme` anahtarıyla sitedeki diğer araçlarla paylaşılır.
- Gizli tasarımlar için 1. veya 2. seçenek önerilir; dosyalar zaten tarayıcıdan çıkmaz, ancak sayfanın kendisinin herkese açık olması istenmeyebilir.
- Dış bağlantı yoktur: Google Fonts kaldırıldı, IBM Plex yüklü değilse sistem yazı tipi kullanılır. Sayfa çevrimdışı çalışır.

---

**EN —** Static single-page app. Open `index.html` directly, or copy the folder to any web server (IIS, nginx, Apache), GitHub Pages, Netlify or Cloudflare Pages. Keep `index.html` and `lib/` together. Gerber files are processed locally in the browser and never uploaded.
