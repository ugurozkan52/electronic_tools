# CLAUDE.md — Montaj Görüntüleyici

Claude Code için proje rehberi. Bu dosyayı güncel tut: yeni modül, komut veya kural eklendiğinde buraya yaz.

## Ürün
Offline, kurulumsuz **montaj (dizgi) takip ve donanım test** uygulaması. InteractiveHtmlBom (MIT) görüntüleyicisinden türetildi.
Girdiler: **IPC-2581** (zorunlu), **BOM** (CSV/XLS/XLSX), **STEP** (3D, isteğe bağlı). Üç dağıtım:
1. **Masaüstü** – Electron 33 (`src/main`, `src/renderer`), Windows/Linux/macOS.
2. **KiCad eklentisi** – `kicad-plugin/montaj_kicad` (SWIG ActionPlugin, KiCad 8–10): kicad-cli ile IPC-2581 + BOM + STEP dışa aktarır, uygulamayı `--kicad-job=<json>` ile açar, log `<proje>/docs/montaj`.
3. **Tarayıcı / GitHub Pages** – `web/` (aynı renderer + `window.asm` tarayıcı karşılığı, IndexedDB).

Kullanıcı: Türkçe konuşan donanım mühendisi (Anova Ar-Ge). **Arayüz ve yanıtlar Türkçe**, kod yorumları İngilizce. Her UI metni `src/i18n/i18n.js` TR→EN sözlüğüne eklenir.

## Komutlar
```bash
npm ci                                   # (web için: ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci)
npm start                                # Electron
npm run check                            # veri gerektirmeyen tutarlılık denetimi (asm API eşliği, sürüm eşliği, sözdizimi) — CI’da çalışır
npm test                                 # çekirdek testler (test/data gerekir, aşağıya bakın)
npm run build:web                        # dist-web/ (GitHub Pages çıktısı)
npm run test:web                         # web derle + Playwright uçtan uca (Chromium)
npx electron-builder --win --dir         # Windows paket (dist/win-unpacked)
# Electron uçtan uca testleri (Linux'ta xvfb-run ile):
MONTAJ_DATA_DIR=$(mktemp -d) SHOTS=/tmp/s xvfb-run -a node test/e2e.js create
MONTAJ_DATA_DIR=<3D proje içeren veri klasörü> SHOTS=/tmp/s xvfb-run -a node test/e2e_hwtest.js
MONTAJ_DATA_DIR=... xvfb-run -a node test/e2e3d.js | test/a11y.js      # AXE=<axe.min.js> erişilebilirlik taraması
python3 test/kicad/test_plugin.py /tmp/kt && JOB=... xvfb-run -a node test/e2e_kicad.js   # sahte kicad-cli ile
```
`test/data/ipc/testcase3*.xml` ve `test/data/step/testcase3*.step` **depoda yok** (IPC-2581 Consortium örneği, `.gitignore`). Yerelde ayrıca tutulur; yoksa `run_tests.js` ve e2e testleri çalışmaz. `test/gen_step.py` STEP örneklerini IPC verisinden üretir.

## Mimari
```
src/core/        ortak, saf JS (Node + tarayıcı; UMD veya CommonJS)
  ipc2581.js     IPC-2581 ayrıştırıcı (katmanlar, pad, yol, via, net, BOM/AVL, yükseklik)
  builder.js     → iBOM pcbdata (footprints, pads{pin,net}, tracks, zones, silkscreen, bom)
  tabular.js     CSV/XLS/XLSX okuma, Türkçe kodlama tespiti, BOM sütun eşleme
  importer.js    runImport(spec) → { pcbdata, report, fieldNames }
  step3d.js      occt-import-js (WASM) ile STEP → tek parça/designator eşleme → packModel (model3d.bin)
  testplan.js    donanım test prosedürü (UMD; renderer'da window.TESTPLAN)
  htmlExport.js  tek dosyalık HTML dışa aktarım
src/main/        Electron ana süreç: main.js (IPC işleyicileri, KiCad işi, PDF rapor), store.js (JSON veri klasörü), step-proc.js (utilityProcess)
src/renderer/home/    proje listesi, içe aktarma sihirbazı, Hakkında (TR/EN kılavuz)
src/renderer/viewer/  iBOM tabanlı görüntüleyici
  ibom/          InteractiveHtmlBom çekirdeği (render.js: drawPad, drawHighlightsOnLayer …) — mümkünse dokunma, sarmala
  viewer-bridge.js  window.asm köprüsü, oturum, mod (Dizgi/Test), klavye, asmEl/asmToast/asmOpenModal
  viewer-3d.js   three.js r147 (non-module) 3D: deri doku (maske/bakır/ENIG/serigraf), yer tutucular, işaretçiler, prob gösterimi, Gerçekçi/Teknik stil
  viewer-test.js donanım test modülü (TEST): adım kartı, liste, 2D prob çağrı balonları, ayarlar (net rolleri), PDF rapor HTML'i
web/             tarayıcı sürümü: vfs.js (IndexedDB üstünde senkron fs), backend.js (main.js karşılığı → window.asm),
                 step-worker.js, report-pdf.js (pdfmake), viewer-boot.js, build.js (esbuild), shims/
```
- **Tek API sınırı:** renderer yalnızca `window.asm` (src/main/preload.js) kullanır. Yeni bir ana süreç özelliği = `preload.js` + `main.js` işleyicisi + **`web/backend.js` karşılığı**. Üçünü birlikte güncelle (`npm run check` eşliği doğrular).
- Görüntüleyici veriyi senkron alır (`asm.viewerInit()` → `__asmInit`); web'de `viewer-boot.js` betikleri depolama hazır olduktan sonra yükler.
- Proje verisi: `<veri>/projects/<id>/{project.json, pcbdata.json, settings.json, boards/<seri>.json, log.jsonl, model3d.bin, sources/, test-reports/}`.
- Test sonuçları kart bazında `boards/<seri>.json` → `kv.testResults` (∞ = `'OL'`). Test ayarları proje bazında `settings.testConfig` (`rails`, `nets`, `phases`, toleranslar).

## Donanım testi (testplan.js)
Aşamalar: `gnd` (süreklilik + toprak/şase izolasyonu, enerjisiz Ω) → `pwr` (ray–GND/şase kısa devre, Ω) → `volt` (enerji verme + ray gerilimleri, V) → `comm` (CAN/RS422/I²C/UART/SPI) → `sens` → `io`.
**Net seçimi (v7.3):** Test sekmesi ilk açılışta tüm netleri listeler (`plan.nets`: rol, öneri, gerekçe, pad sayısı; `pcbdata.nets` dahil). Kullanıcı test edilecek netleri ve rolünü (power/ground/chassis/signal) seçer → `testConfig.selection = true` + `nets` + `rails[].nominal`. `selection` açıkken plan **yalnızca** seçili netlerden kurulur; `signal` rollü netler I/O adımı olur (haberleşme/sensör adı tanınırsa ilgili aşamaya gider).
Pad neti IPC-2581'de copper `Set@net`'ten gelir; yoksa `LogicalNet/PinRef` (ref+pin) ve son çare pad üzerinde biten iz/via ile tamamlanır (`ipc2581.js`). Pad'lerin >%20'si netsizse önizleme uyarı verir.
Net rolü çözümü `resolveRoles()` (seçim kaydedilmemişse ve öneriler için): **1) elle** (`config.nets`: power/ground/chassis/none) → **2) ad** (`baseNet`: hiyerarşik adın son parçası, KiCad `Net-(U1-VCC)` → pin adı; RX_CHASSIS / RX_GROUND / RX_VOLT / RX_SUPPLY) → **3) kart yapısı** (en çok kondansatörün ortak ucu = GND; ≥2 dekuplaj kondansatörlü ve IC besleyen net = ray (konnektördeyse 1 yeter); montaj deliği/konnektör gövdesi = şase). Yapıdan bulunan raylar, adı tanınan ray varsa varsayılan olarak *dahil değil*. `railVolts`: 28V, +5V0, 3V3, 3.3V, 3,3V, 3P3, N12V; `+5V/3V3` (iki gerilim) → null, kullanıcı girer. `baseNet`: "/PSU/+5V" → "+5V", ama "+5V/3V3_…" bütün kalır. Her sınıflandırmanın gerekçesi `whyNet()` ile ayarlarda gösterilir.
Prob seçimi `probeScore`: TP > konnektör > montaj deliği > 2 pinli pasif; TH bonusu; ince adım/küçük pad cezası; DNP hariç.

## Kurallar
- Değişiklikten sonra ilgili testleri çalıştır; UI değişikliğinde ekran görüntüsü alıp bak (SHOTS klasörü). Erişilebilirlik (axe, WCAG 2.1 AA) hem açık hem koyu temada temiz kalmalı.
- Sürüm: `package.json` `version` ve `kicad-plugin/montaj_kicad/exporter.py` `VERSION` birlikte artırılır (`npm run check` doğrular).
- Tema: web sürümünde açık/koyu seçim `localStorage['et-theme']` ile siteyle paylaşılır (`web/backend.js` `readDark/writeDark`); Electron’da `store` durumu kullanılır. Teslim paketleri: `MontajGoruntuleyici-<v>-KiCad-eklenti.zip` (PCM: metadata.json + plugins/ + resources/, `plugins/app` = win-unpacked), `-masaustu-win-x64.zip`, GitHub deposu.
- Üçüncü taraf: three r147, occt-import-js (LGPL, WASM dinamik), pdfmake (MIT), xlsx, DejaVu fontları — lisans dosyaları korunur. Kart/şirket tasarım verisi depoya konmaz.
- Yeni metin → `i18n.js` sözlüğüne (`'Kayıtlı teknisyenler'` satırından sonra) TR→EN ekle; `asmEl({text})` otomatik çevirir, `raw: 1` çevirmez.
- `src/renderer/viewer/ibom/*` üst akım koduna yapılan değişiklikleri küçük ve yorumlu tut. (Değişenler: `util.js` highlightRowOnClick varsayılanı **true** — BOM satırı fareyle üzerine gelince değil tıklayınca seçilir; `render.js` yerleştirilen rengi hemen çizer.)

## Arayüz kararları (v7.6, tasarım değerlendirmesi sonrası)
- Bildirimler tek seferde bir tane, sol altta (`asmToastPush`); hata (`role=alert`) korunur. Kart görünümünün üstüne bildirim konmaz.
- Kart bitince bildirim yerine özet kartı (`asmCompleteCard`): süre, teknisyen, "Kaydı indir / Teste geç / Sonraki kart".
- Üst çubuk: görünüm ikonları "Görünüm ▾" menüsünde (yazılı), Kayıt + Hakkında "Diğer ▾" menüsünde. Menüler `viewer-a11y.js` `MENU_NAMES` ile klavyeden açılır.
- Kısayol satırı gizlenebilir (`localStorage montaj.hintHidden`).
- Test: plan sorunları (nominal eksik, ray/GND yok) kartın üstünde kalıcı bant (`warnings()`); net rolleri yalnızca Net seçimi ekranında, Test ayarları seçimi korur. Alternatif noktalar 5 + "+N nokta".
- Sihirbaz: "Takip adımları" etiket girişi (gizli `#c-boxes` virgüllü listeyi tutar), Önizle yapılmadan kaydet ipucu, KiCad + Altium dışa aktarma yolları, kısaltılmış dosya yolu.
- BOM: 3D görünüm açıkken liste her zaman tam BOM (iki yüz) olur (`ibom.js` `getSelectedBomList`, 3D açılınca `asmRefreshBom` tabloyu yeniler); 2D görünümde üst/alt/iki yüz seçimine uyar. Tablonun üstündeki özet satırı (`#asm-bomcount`, `viewer-bridge.js` `asmUpdateBomCount`): toplam grup (BOM satırı) ve parça sayısı, filtre varsa gösterilen sayısı, kapsam (üst/alt/iki yüz/3D).

## Bilinen açıklar / sonraki işler
- KiCad eklentisi gerçek KiCad 10'da henüz çalıştırılmadı (sahte kicad-cli ile test edildi). KiCad 11'de SWIG kaldırılıyor → IPC API'ye geçiş gerekecek.
- Web sürümü yalnızca Chromium'da test edildi (Firefox/Safari denenmedi).
- Çok büyük STEP (>~150 MB) tarayıcı belleğinde sorun çıkarabilir; masaüstünde ayrı süreçte işlenir.
