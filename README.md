# Elektronik Araçlar

Tek GitHub Pages sitesinde üç tarayıcı uygulaması. Giriş sayfasından seçilir.

| Yol | Uygulama | Kaynak |
|---|---|---|
| `/` | Giriş sayfası (`index.html`) | — |
| `/simulation/` | CircuitJS devre simülatörü (iPad PWA) | `simulation/` (hazır, olduğu gibi yayınlanır) |
| `/pcb-order/` | PCB Sipariş Hazırlayıcı | `pcb-order/` (hazır, olduğu gibi yayınlanır) |
| `/assembly/` | Montaj Görüntüleyici (web sürümü) | `assembly-src/` (GitHub Actions'ta `web/build.js` ile derlenir) |

## Yayınlama (bir kez)
```
cd electronic-tools
git init && git add . && git commit -m "Elektronik araçlar sitesi"
git branch -M main
git remote add origin https://github.com/<kullanici>/<depo>.git
git push -u origin main
```
Depo → **Settings → Pages → Source: GitHub Actions**. İş akışı bittikten sonra adres:
`https://<kullanici>.github.io/<depo>/`

Sonraki her `git push` siteyi yeniden derleyip yayınlar.

## Yerelde deneme
```
cd assembly-src && npm ci && cd ..
mkdir _site && cp index.html .nojekyll _site/ && cp -r simulation pcb-order _site/
(cd assembly-src && node web/build.js ../_site/assembly)
python -m http.server -d _site 8000
```

## Ortak tema (açık / koyu)
Üç uygulama aynı tema seçimini kullanır: `localStorage['et-theme']` (`dark` | `light`). Anahtar yoksa sistem tercihi (`prefers-color-scheme`) kullanılır ve ilk açılan sayfa bunu kaydeder; sonraki tüm araçlar aynı temayla devam eder. Giriş sayfası, PCB Order ve Assembly'de ◐ düğmesi temayı değiştirir. CircuitJS kendi `whiteBackground` ayarını bu anahtarla eşler (`simulation/circuitjs.html`). Üç uygulama aynı kaynakta (origin) yayınlandığı için seçim paylaşılır; dosyadan (`file://`) ayrı açılırsa paylaşılmaz.

## Denetimler (CI)
`.github/workflows/pages.yml` her push ve pull request'te `npm run check` (asm API eşliği: `preload.js` ↔ `main.js` ↔ `web/backend.js`, sürüm eşliği, sözdizimi) çalıştırır; test verisi (`test/data/ipc/testcase3.xml`) mevcutsa `npm test` de çalışır. Yayın yalnızca `main` dalından yapılır.

## Notlar
- Simulation'ın service worker'ı yalnızca `/simulation/` kapsamındadır; iPad'de ana ekrana eklenecekse `.../simulation/circuitjs.html` Safari'de açılıp "Ana Ekrana Ekle" yapılır.
- Montaj Görüntüleyici'nin masaüstü (Electron) sürümü ve KiCad eklentisi `assembly-src/` içinde durur; Pages derlemesi bunları etkilemez.
- Lisanslar: CircuitJS GPLv2 (`simulation/LICENSE.txt`), diğerleri MIT.
