# CircuitJS — iPad Çevrimdışı Uygulama (PWA)

Kaynak: github.com/pfalstad/circuitjs1 (commit 8ac55f2, 28.10.2026), TypeScript/Vite derlemesi.
Lisans: GPLv2 (LICENSE.txt). Bu klasör olduğu gibi bir web sunucusuna konur.

## iPad'e eklemeden önceki değişiklikler
- iOS tam ekran meta etiketleri, ana ekran ikonu (180 px, opak), göreli manifest.
- Service worker 416 dosyanın tamamını ilk açılışta önbelleğe alır (~4 MB).
- Çevrimdışıyken `?ctz=...` gibi parametreli adresler de açılır.
- Dropbox içe aktarma (menü, komut paleti, `startCircuitLink` adres parametresi) kaldırıldı; CircuitJS dışarıdan veri çekmez. Dosya içe/dışa aktarma yerel dosyalarla çalışır.

## Kalem için araç çubuğu (Rev. B)
- Butonlar 48×48 px (Apple'ın 44 pt minimum dokunma alanının üstünde), ikonlar 30–36 px.
- Seçili araç: mavi zemin + beyaz ikon + turuncu çerçeve; sağdaki mod etiketi de maviye döner.
- Varyantı olan butonlarda (kapasitör, kaynak, anahtar, op-amp, transistör, MOSFET, kapılar) sağ altta küçük üçgen var.
- En başta **ESC**: seçimi temizler, eleman ekleme aracından Select moduna döner.
- Yanında **Sil** (kırmızı çöp kutusu): seçili elemanları siler. Seçim yoksa kalemle en son dokunulan eleman silinir. Geri almak için Undo.
- Ekran dar kalırsa araç çubuğu kendiliğinden ikinci/üçüncü satıra iner (yatay iPad'de 2, dikeyde 3 satır).

## 1. Yayınla (bir kez, HTTPS şart)
Service worker yalnızca HTTPS'te çalışır. Ücretsiz iki yol:

**A) Netlify Drop (en kolay)**
1. Bilgisayarda app.netlify.com/drop adresini açın, ücretsiz hesapla giriş yapın.
2. Zip'ten çıkan `circuitjs-ipad` klasörünü sayfaya sürükleyin.
3. Verilen `https://....netlify.app` adresini not edin.

**B) GitHub Pages**
Web arayüzü tek seferde 100 dosya yükleyebildiği için git ile yükleyin:
```
cd circuitjs-ipad
git init && git add . && git commit -m "CircuitJS iPad PWA"
git branch -M main
git remote add origin https://github.com/<kullanici>/circuitjs-ipad.git
git push -u origin main
```
Depo → Settings → Pages → Branch: `main` / `(root)`. Adres: `https://<kullanici>.github.io/circuitjs-ipad/`

## 2. iPad'e kur
1. iPad'de **Safari** ile adresi açın (Chrome değil).
2. Simülatör yüklendikten sonra 5–10 saniye bekleyin (önbelleğe alma).
3. Paylaş → **Ana Ekrana Ekle** → Ekle.
4. Test: Uçak modunu açıp ana ekrandaki CircuitJS ikonundan açın.

## İpuçları
- Klavye ve fare/trackpad bağlıysa masaüstündeki kısayollar (Ctrl+Z, Del, R, C, L…) çalışır.
- Devreler cihazda saklanır: File → Save As ile Dosyalar uygulamasına `.txt` kaydedin; Options menüsünden yerel depolama da kullanılabilir.
- Güncelleme: yeni sürümü aynı adrese yükleyin (Netlify'da site → Deploys → klasörü sürükle). iPad'de uygulamayı internet varken açın, kapatıp bir kez daha açın; yeni sürüm gelir.
- iOS, uzun süre (haftalarca) açılmayan sitelerin verisini silebilir. Ana ekrana eklenen uygulamalar bundan muaftır; yine de önemli devreleri dosya olarak kaydedin.
