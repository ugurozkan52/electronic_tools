# Haberleşme Testi Prosedürü (UART / SPI / I²C)

**Durum:** Taslak, inceleme için. Onaylandıktan sonra Montaj Görüntüleyici'nin test planına (Faz 4, haberleşme) entegre edilecek.

## 1. Amaç ve kapsam

Bu prosedür, kart üzerindeki UART, SPI ve I²C hatlarının veri taşıdığını lojik analizör ile doğrular. Test, hattın yalnızca doğru gerilimde durduğunu değil, beklenen verinin doğru hızda ve doğru biçimde gidip geldiğini gösterir.

Mevcut test planındaki "boşta seviye" ölçümleri (multimetre) bu prosedürün ön koşuludur ve yerinde kalır. Bu prosedür onların arkasından gelen fonksiyonel adımdır.

Kapsam dışı: CAN ve RS-422/485. Bunlar diferansiyel ölçüm gerektirir ve ayrı bir prosedürde ele alınacaktır.

## 2. Hat rollerinin belirlenmesi

Testten önce her hattın rolü seçilmelidir. Bugün uygulama yalnızca hattın işlevini (UART, SPI, I²C) seçtiriyor; alt rolü net adından tahmin ediyor. Net adı her zaman güvenilir değildir, bu yüzden rol elle seçilebilir olmalıdır.

| İşlev | Seçilebilecek roller | Not |
|---|---|---|
| UART | TX, RX, RTS, CTS | Rol **kartın kendi işlemcisine göre** seçilir: TX = kartın gönderdiği hat. |
| SPI | SCK, MOSI, MISO, CS | Birden fazla CS varsa her biri ayrı CS hattı olarak (CS1, CS2 …) seçilir. |
| I²C | SDA, SCL | — |

**TX/RX karışıklığı.** Konnektöre çıkan netler çoğu zaman karşı tarafın bakış açısıyla adlandırılır. Örneğin `RS232_TX` adlı net, kartın işlemcisinin RX pinine gidiyor olabilir. Rol seçimi bu yüzden net adına göre değil, kartın işlemci pinine göre yapılmalıdır.

Rollerin yanında her veriyolu (UART1, SPI2, I²C1 …) için şu parametreler girilir:

| Veriyolu | Parametreler |
|---|---|
| UART | Baud hızı, veri biti, parite, stop biti (örnek: 115200 8N1), lojik seviye (3,3 V / 5 V), akış kontrolü var mı |
| SPI | Kartın rolü (master / slave), SCK frekansı, mod (CPOL/CPHA, 0–3), bit sırası (MSB/LSB önce), CS aktif seviyesi |
| I²C | Hız (100 kHz / 400 kHz / 1 MHz), beklenen cihaz adresleri (7 bit), her cihaz için okunacak kimlik yazmacı ve beklenen değer |

## 3. Ekipman

- **Lojik analizör.** En az 4 kanal, protokol çözücüsü (UART, SPI, I²C) olan bir cihaz. Örnek: Saleae Logic, DSLogic ya da eşdeğeri.
- **Kısa GND uçlu problar veya test kancaları.**
- **USB–UART dönüştürücü ve terminal programı.** UART RX testi için karta veri göndermek amacıyla kullanılır. Lojik seviyesi kartla aynı olmalıdır (3,3 V ya da 5 V).
- **Test firmware'i.** Karta yüklenmiş, aşağıdaki uyarıları üreten bir yazılım (bkz. Bölüm 5).
- **Osiloskop (isteğe bağlı).** I²C yükselme süresi ve sinyal bütünlüğü için gerekir; lojik analizör bunları ölçemez.

## 4. Genel kurallar

1. **Ön koşullar.** Faz 1–3 (kısa devre, raylar) ve Faz 4'teki boşta seviye ölçümleri geçmiş olmalıdır.
2. **Önce GND.** Lojik analizörün GND ucunu kartın GND'sine bağlayın, sonra sinyal kanallarını bağlayın. GND bağlantısı mümkün olduğunca ölçülen hatta yakın olsun.
3. **Örnekleme hızı.** En az 4 kat, tercihen 10 kat veya üzeri kullanın. UART'ta baud hızının, SPI'de SCK'nin, I²C'de SCL frekansının katı olarak hesaplanır.

   | Hat | Örnek | Önerilen örnekleme |
   |---|---|---|
   | UART 115200 baud | 1 bit ≈ 8,68 µs | ≥ 2 MS/s |
   | I²C 400 kHz | — | ≥ 4 MS/s |
   | SPI 10 MHz | — | ≥ 100 MS/s |

4. **Eşik gerilimi.** Analizör eşiği ayarlanabiliyorsa IO geriliminin yarısına ayarlayın. Örnek: 3,3 V için yaklaşık 1,65 V.
5. **Kanal eşleşmesi.** Kanal–net eşleşmesini uygulamanın gösterdiği tabloya göre yapın ve kayıtta saklayın.
6. **Kayıt dosyası.** Her test için yakalama dosyasını şu adla kaydedin: `<SeriNo>_<Veriyolu>_<YYYYAAGG>`. Örnek: `SN0012_UART1_20261115.sal`.

## 5. Test firmware'inden beklenenler

Tekrarlanabilir sonuç için kart bilinen bir veri üretmelidir.

| Veriyolu | Firmware'in yapması gereken |
|---|---|
| UART TX | Açılışta ve her saniye sabit bir metin gönderir. Örnek: `TEST-UART1\r\n`. Baud ölçümü için ardından `0x55` (`U`) baytları gönderir; bu bayt 0-1 dönüşümlü bir dalga verir. |
| UART RX | Aldığı her baytı geri gönderir (yankı / echo). |
| SPI master | Her slave için kimlik okuma transferi yapar. Örnek: komut `0x9F`, ardından 3 bayt okuma. Bu işlemi saniyede bir tekrarlar. |
| I²C master | Açılışta adres taraması yapar, ardından her cihazın kimlik yazmacını okur ve bunu saniyede bir tekrarlar. |

Firmware yoksa test, kartın normal yazılımının ürettiği trafik üzerinde yapılabilir. Bu durumda "beklenen veri" kolonuna gözlenen veri yazılır ve karar teknisyene kalır.

## 6. UART testi

### 6.1 Bağlantı

| Kanal | Hat | Rol |
|---|---|---|
| K0 | UARTx_TX | TX (kart gönderir) |
| K1 | UARTx_RX | RX (kart alır) |
| K2 | RTS (varsa) | Akış kontrolü |
| K3 | CTS (varsa) | Akış kontrolü |
| GND | Kart GND | — |

### 6.2 Analizör ayarı

1. Her iki kanala UART çözücüsü ekleyin: girilen baud hızı, veri biti, parite ve stop biti.
2. Tetik olarak TX kanalında düşen kenarı (start biti) seçin.
3. Kayıt süresini en az 2 saniye yapın.

### 6.3 Adımlar

**A. TX (kart → dış dünya)**

1. Kartı enerjilendirin ve kaydı başlatın.
2. Çözücüde beklenen metnin göründüğünü doğrulayın (örnek: `TEST-UART1`).
3. `0x55` baytlarından birinde tek bir bitin süresini ölçün.
4. Baud hatasını hesaplayın: (ölçülen baud − nominal baud) / nominal baud. Ölçülen baud = 1 / bit süresi.

**B. RX (dış dünya → kart)**

1. USB–UART dönüştürücüyü bağlayın: dönüştürücünün TX'i kartın RX'ine, dönüştürücünün RX'i kartın TX'ine, GND'ler ortak.
2. Lojik analizör K1'i kartın RX pinine en yakın noktaya bağlayın.
3. Terminalden `HELLO` gönderin.
4. K1'de `HELLO` çözüldüğünü doğrulayın. Bu, verinin kartın RX pinine ulaştığını gösterir.
5. K0'da kartın yankısının (`HELLO`) geldiğini doğrulayın. Bu, işlemcinin veriyi aldığını gösterir.

**C. Akış kontrolü (varsa)**

1. Terminalde akış kontrolünü açın.
2. RTS/CTS seviyelerinin veri akışına göre değiştiğini doğrulayın.

### 6.4 Kabul kriterleri

| Kontrol | Kriter |
|---|---|
| Boşta seviye | TX ve RX lojik 1 |
| Çözülen veri | Beklenen metinle birebir aynı |
| Çerçeve / parite hatası | 0 |
| Baud hatası | ±%2 içinde |
| RX yankısı | Gönderilen veriyle aynı |

## 7. SPI testi

### 7.1 Bağlantı

| Kanal | Hat | Rol |
|---|---|---|
| K0 | SPIx_SCK | Saat |
| K1 | SPIx_CS | Çip seçimi (her slave için ayrı test) |
| K2 | SPIx_MOSI | Master → slave veri |
| K3 | SPIx_MISO | Slave → master veri |
| GND | Kart GND | — |

Birden fazla CS varsa CS hatlarını K4 ve sonrasına bağlayın. Analizörün kanal sayısı yetmiyorsa her slave'i ayrı kayıtta test edin.

### 7.2 Analizör ayarı

1. SPI çözücüsü ekleyin: girilen mod (CPOL/CPHA), bit sırası, kelime uzunluğu (genelde 8 bit) ve CS aktif seviyesi.
2. Tetik olarak CS kanalında aktif kenarı seçin (aktif-düşük için düşen kenar).
3. Örnekleme hızını SCK frekansının en az 4 katı, tercihen 10 katı yapın.

### 7.3 Adımlar

1. Kartı enerjilendirin ve kaydı başlatın.
2. Transfer boyunca CS'nin aktif kaldığını, transfer bitince pasife döndüğünü doğrulayın.
3. SCK frekansını ölçün.
4. Bir transferdeki saat darbesi sayısını sayın; bayt sayısı × 8 olmalıdır.
5. MOSI'de komutun çözüldüğünü doğrulayın (örnek: `0x9F`).
6. MISO'da slave'in yanıtını doğrulayın (örnek: üretici kimliği `0xEF 0x40 0x18`).
7. Diğer CS hatlarının bu sırada pasif kaldığını doğrulayın.
8. Her slave için 2–7. adımları tekrarlayın.

### 7.4 Kabul kriterleri

| Kontrol | Kriter |
|---|---|
| CS boşta | Pasif seviye (aktif-düşükte lojik 1) |
| SCK frekansı | Girilen değerin ±%5'i içinde |
| Saat sayısı | Bayt sayısı × 8 |
| MOSI verisi | Beklenen komut |
| MISO verisi | Beklenen kimlik değeri; sabit 0x00 ya da 0xFF değil |
| CS çakışması | Aynı anda yalnızca bir CS aktif |

## 8. I²C testi

### 8.1 Bağlantı

| Kanal | Hat | Rol |
|---|---|---|
| K0 | I2Cx_SCL | Saat |
| K1 | I2Cx_SDA | Veri |
| GND | Kart GND | — |

### 8.2 Analizör ayarı

1. I²C çözücüsü ekleyin. Adres gösterimini 7 bit olarak ayarlayın.
2. Tetik olarak START koşulunu seçin: SCL yüksekken SDA'nın düşen kenarı.
3. Örnekleme hızını SCL frekansının en az 10 katı yapın.

### 8.3 Adımlar

1. Kartı enerjilendirin ve kaydı başlatın.
2. Adres taramasında yanıt veren (ACK) adresleri listeleyin.
3. Bu listeyi kartın BOM'undaki ve şemasındaki I²C cihazlarıyla karşılaştırın.
4. Her cihaz için kimlik okumasını bulun ve doğrulayın: adres ACK, yazmaç adresi ACK, yeniden START, okunan değer.
5. SCL frekansını ölçün.
6. Her işlemin STOP ile bittiğini ve hatların ardından lojik 1'e döndüğünü doğrulayın.
7. İsteğe bağlı: osiloskopla SDA ve SCL yükselme süresini ölçün.

### 8.4 Kabul kriterleri

| Kontrol | Kriter |
|---|---|
| Boşta seviye | SDA ve SCL lojik 1 |
| Cihaz listesi | Beklenen tüm adresler ACK veriyor, beklenmeyen adres yok |
| Kimlik değeri | Her cihaz için beklenen değer (örnek: WHO_AM_I) |
| SCL frekansı | Seçilen hızı aşmıyor (100 / 400 / 1000 kHz) |
| NACK | Adres ve yazmaç baytlarında yok (son okuma baytındaki NACK normaldir) |
| Yükselme süresi (isteğe bağlı) | 100 kHz için ≤ 1000 ns, 400 kHz için ≤ 300 ns, 1 MHz için ≤ 120 ns |

## 9. Kayıt

Her veriyolu için test raporuna şunlar yazılır:

| Alan | Örnek |
|---|---|
| Veriyolu ve parametreler | UART1, 115200 8N1 |
| Kanal–net eşleşmesi | K0 = UART1_TX (J3-2), K1 = UART1_RX (J3-3) |
| Ölçülen hız | 115 340 baud (+%0,12) |
| Beklenen / çözülen veri | `TEST-UART1` / `TEST-UART1` |
| Hata sayısı | Çerçeve 0, parite 0 |
| Yakalama dosyası | `SN0012_UART1_20261115.sal` |
| Sonuç | Geçti / Kaldı |
| Teknisyen, tarih | — |

## 10. Hata ayıklama

| Belirti | Olası neden | Kontrol |
|---|---|---|
| UART: hiç trafik yok | Firmware çalışmıyor, pin yanlış, TX/RX ters seçilmiş | Rolü kartın işlemci pinine göre yeniden kontrol edin; diğer kanala bakın. |
| UART: bozuk karakterler | Baud, parite ya da stop biti uyumsuz; saat kaynağı yanlış | Bit süresini ölçün; kristal / PLL ayarı. |
| UART: RX pininde veri var, yankı yok | İşlemci almıyor; pin muxlama, kesme ayarı | Firmware ve pin yapılandırması. |
| SPI: MISO sabit 0x00 / 0xFF | Slave seçilmiyor, beslemesiz ya da reset'te | CS seviyesi, slave beslemesi, reset hattı. |
| SPI: veri bir bit kayık | CPOL/CPHA uyumsuz | Çözücü modunu ve firmware modunu karşılaştırın. |
| SPI: çözücü hatalı, kenarlar bozuk | Örnekleme yetersiz, uzun kablo, çınlama | Örnekleme hızını artırın; seri direnç, kısa GND. |
| I²C: adres NACK | Adres yanlış (7/8 bit karışıklığı), cihaz beslemesiz, adres pinleri | Adres pin seviyeleri, cihaz beslemesi. |
| I²C: SDA ya da SCL 0 V'ta takılı | Veriyolu kilitli ya da kısa devre | Enerjiyi kesin; hat–GND direnci; cihazları tek tek ayırın. |
| I²C: kenarlar yavaş, çözücü kararsız | Pull-up değeri büyük ya da hat kapasitansı yüksek | Osiloskopla yükselme süresi; 4,7 kΩ yerine 2,2 kΩ. |

## 11. Sisteme entegrasyon önerisi

Prosedür onaylanınca Montaj Görüntüleyici'de yapılacak değişiklikler şunlardır.

1. **Rol sütunu.** Net seçim tablosuna, İşlev UART, SPI ya da I²C seçildiğinde açılan bir "Hat rolü" seçimi eklenir (Bölüm 2'deki tablo). Varsayılan değer bugünkü ad tahmininden gelir ("Otomatik: TX" gibi) ve elle değiştirilebilir.
2. **Veriyolu ayarları.** Aynı veriyolundaki hatlar (UART1_TX ve UART1_RX gibi) tek bir veriyolu altında toplanır. Her veriyolu için Bölüm 2'deki parametreler bir kez girilir. Veriyolu adı da elle düzeltilebilir.
3. **Test adımı.** Faz 4'teki "dalga/protokol kontrolü" adımı lojik analizör adımına dönüşür. Adımda şunlar gösterilir:
   - Kanal–net–pad eşleşme tablosu.
   - Analizör ayarları: çözücü, tetik ve örnekleme hızı. Örnekleme hızı girilen baud hızından veya saat frekansından hesaplanır.
   - Adım listesi ve kabul kriterleri.
4. **Sonuç girişi.** Teknisyen şunları girer:
   - Ölçülen hız (baud veya frekans). Uygulama sapmayı hesaplayıp sınırla karşılaştırır.
   - Çözülen verinin beklenenle eşleşip eşleşmediği (Evet / Hayır).
   - Hata sayısı.
   - Yakalama dosyası. Dosya ek olarak saklanır ya da en azından adı kaydedilir.
5. **Rapor.** Bölüm 9'daki alanlar test raporunda veriyolu başına bir satır olarak yer alır.
6. **Veri saklama.** Hat rolleri ve veriyolu parametreleri, bugünkü işlev seçimleri gibi proje bazında saklanır ve o projenin tüm kartları için geçerli olur.

## 12. İnceleme için açık sorular

1. Kabul sınırları uygun mu? Taslakta UART baud hatası ±%2, SPI SCK frekansı ±%5 alındı.
2. Kullandığınız lojik analizör modeli ve yazılımı nedir? Yakalama dosyası uzantısı ve kanal sayısı buna göre yazılacak.
3. Test firmware'i her kartta var mı? Yoksa normal yazılımın trafiği üzerinden "gözlenen veriyi kaydet" yöntemi mi esas alınmalı?
4. SPI'de kartın slave olduğu durumlar var mı? Varsa master tarafını sağlayacak bir test cihazı tanımlanmalı.
5. Yakalama dosyaları rapora ek olarak mı saklanmalı, yoksa yalnızca adı mı kaydedilmeli?
