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

## Notlar
- Simulation'ın service worker'ı yalnızca `/simulation/` kapsamındadır; iPad'de ana ekrana eklenecekse `.../simulation/circuitjs.html` Safari'de açılıp "Ana Ekrana Ekle" yapılır.
- Montaj Görüntüleyici'nin masaüstü (Electron) sürümü ve KiCad eklentisi `assembly-src/` içinde durur; Pages derlemesi bunları etkilemez.
- Lisanslar: CircuitJS GPLv2 (`simulation/LICENSE.txt`), diğerleri MIT.
