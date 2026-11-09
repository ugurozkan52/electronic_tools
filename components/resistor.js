/* Resistor: parameters, technologies, wizard and calculators. Uses the helpers of components/index.html. */
CMP.resistor = {
  name: ['Direnç', 'Resistor'],
  title: ['Direnç (Resistor) Rehberi ve Hesaplayıcıları', 'Resistor Guide and Calculators'],
  sub: ['Direnç parametrelerini, teknolojileri, seçim kriterlerini ve mühendislik hesaplayıcılarını tek yerde bulun.', 'Resistor parameters, technologies, selection criteria and engineering calculators in one place.'],
  params: [
    ['Direnç değeri (R)', 'Resistance (R)', 'Ω', 'Nominal değer; standart serilerden seçilir (E6, E12, E24, E48, E96, E192).', 'Nominal value; chosen from standard series (E6, E12, E24, E48, E96, E192).', 'E12 10 % · E24 5 % · E96 1 %'],
    ['Tolerans', 'Tolerance', '%', '25 °C\'de nominal değerden izin verilen en büyük sapma. Hassas devrede tek başına yetmez; TCR ve drift de eklenir.', 'Maximum deviation from nominal at 25 °C. Not enough alone in precision circuits; TCR and drift add to it.', 'Thick 1–5 % · thin 0.01–1 % · foil 0.001–0.1 %'],
    ['Anma gücü (P)', 'Rated power (P)', 'W', 'Belirtilen ortam sıcaklığında (genelde 70 °C) sürekli harcanabilecek güç.', 'Continuous power at the stated ambient temperature (usually 70 °C).', '0402 0.063 · 0603 0.1 · 0805 0.125 · 1206 0.25 · 2512 1 W'],
    ['Güç azaltma eğrisi', 'Derating curve', '—', '70 °C\'ye kadar tam güç; maksimum sıcaklıkta (125–155 °C) sıfıra doğrusal azalır.', 'Full power up to 70 °C, then falls linearly to zero at the maximum temperature (125–155 °C).', '—'],
    ['Maks. çalışma gerilimi', 'Max working voltage', 'V', 'Boyuta bağlı sürekli gerilim sınırı. √(P·R) ile bu değerin küçüğü geçerlidir.', 'Size-dependent continuous voltage limit. The smaller of this and √(P·R) applies.', '0402 50 · 0603 75 · 0805 150 · 1206 200 V'],
    ['Aşırı yük gerilimi', 'Overload voltage', 'V', 'Kısa süreli dayanılan gerilim, genelde çalışma geriliminin yaklaşık 2 katı.', 'Short-term withstand voltage, typically about 2× the working voltage.', '≈ 2 × V_max'],
    ['Kritik direnç', 'Critical resistance', 'Ω', 'R_krit = V²/P. Altında güç sınırlar, üstünde gerilim sınırlar.', 'R_crit = V²/P. Below it power limits; above it voltage limits.', '—'],
    ['Sıcaklık katsayısı (TCR)', 'Temperature coefficient (TCR)', 'ppm/°C', 'Sıcaklıkla değer değişimi: R(T) = R₀·[1 + α·(T − T₀)].', 'Change of value with temperature: R(T) = R₀·[1 + α·(T − T₀)].', 'Thick ±100–200 · thin ±5–50 · foil ±0.2–2'],
    ['Çalışma sıcaklığı', 'Operating temperature', '°C', 'İzin verilen ortam sıcaklık aralığı.', 'Permitted ambient temperature range.', '−55…+155 (special up to 230)'],
    ['Uzun dönem kayma (drift)', 'Long-term drift', '% / 1000 h', 'Yük altında zamanla değerin değişmesi (load life). Hassas devrede toleransı aşabilir.', 'Value change over time under load (load life). Can exceed tolerance in precision circuits.', '0.05–2 %'],
    ['Gerilim katsayısı (VCR)', 'Voltage coefficient (VCR)', 'ppm/V', 'Uygulanan gerilimle direncin değişmesi; yüksek değerli kalın film dirençlerde belirgindir.', 'Resistance change with applied voltage; noticeable in high-value thick film resistors.', '1–100 ppm/V'],
    ['Gürültü', 'Noise', 'nV/√Hz', 'Johnson gürültüsü √(4·k·T·R·Δf) + yapıya bağlı ek akım gürültüsü (kalın film ve karbon yüksek).', 'Johnson noise √(4·k·T·R·Δf) plus construction-dependent excess noise (high in thick film and carbon).', '1 kΩ ≈ 4 nV/√Hz @300 K'],
    ['Termal EMF', 'Thermal EMF', 'µV/°C', 'Farklı metal birleşimlerinde oluşan parazit gerilim; mΩ düzeyinde akım ölçmede önemlidir.', 'Parasitic voltage at junctions of dissimilar metals; important in mΩ current sensing.', '0.1–5 µV/°C'],
    ['Parazit L ve C', 'Parasitic L and C', 'nH / pF', 'Yüksek frekansta empedansı değiştirir; telli dirençlerde µH düzeyinde endüktans.', 'Changes impedance at high frequency; wirewound parts have µH-level inductance.', 'chip 0.5–1 nH, 0.05–0.2 pF'],
    ['Darbe / ani akım', 'Pulse / surge', 'J, W·s', 'Tek darbe enerjisi, tekrarlı darbe ve ESD dayanımı. MELF, metal oksit ve anti-surge seriler iyidir.', 'Single-pulse energy, repetitive pulse and ESD withstand. MELF, metal oxide and anti-surge series are good.', '—'],
    ['Oran toleransı ve izleme', 'Ratio tolerance and tracking', '% / ppm/°C', 'Bölücü ve dirençli ağlarda mutlak değerden çok oran önemlidir.', 'In dividers and networks the ratio matters more than absolute value.', 'ratio 0.01–0.1 %, tracking 0.5–5 ppm/°C'],
    ['Isıl direnç (R_th)', 'Thermal resistance (R_th)', 'K/W', 'Kendi ısınması ΔT = P·R_th; hassas devrede değeri kaydırır.', 'Self-heating ΔT = P·R_th; shifts the value in precision circuits.', 'chip ~100–300 K/W'],
    ['Paket', 'Package', '—', 'SMD: 01005…2512, MELF; THT: eksenel/radyal; dizi ve ağ.', 'SMD: 01005…2512, MELF; THT: axial/radial; arrays and networks.', '—'],
    ['Sülfürleşme / güvenilirlik', 'Sulfur resistance / reliability', '—', 'Gümüş elektrotlu çip dirençler kükürtlü ortamda açık devre olabilir; otomotivde anti-sülfür ve AEC-Q200 seçilir.', 'Silver-electrode chip resistors can go open in sulfur-rich air; automotive designs pick anti-sulfur and AEC-Q200 parts.', '—'],
  ],
  tech: {
    title: ['Direnç teknolojileri', 'Resistor technologies'],
    head: [['Teknoloji', 'Technology'], ['Tolerans', 'Tolerance'], ['TCR (ppm/°C)', 'TCR (ppm/°C)'], ['Gürültü', 'Noise'], ['Darbe', 'Pulse'], ['Maliyet', 'Cost'], ['Tipik kullanım', 'Typical use']],
    rows: [
      [['Kalın film (çip)', 'Thick film (chip)'], '1–5 %', '±100–200', ['orta–yüksek', 'medium–high'], ['iyi', 'good'], ['çok düşük', 'very low'], ['Genel amaç, çekme/çekme direnci', 'General purpose, pull-up/down']],
      [['İnce film', 'Thin film'], '0.01–1 %', '±5–50', ['düşük', 'low'], ['zayıf–orta', 'weak–fair'], ['orta', 'medium'], ['Hassas, ADC, RF, bölücü', 'Precision, ADC, RF, dividers']],
      [['Metal film (THT/MELF)', 'Metal film (THT/MELF)'], '0.1–1 %', '±15–100', ['düşük', 'low'], ['orta', 'fair'], ['düşük', 'low'], ['Analog, ölçme', 'Analog, measurement']],
      [['Metal oksit', 'Metal oxide'], '1–5 %', '±200–300', ['orta', 'medium'], ['çok iyi', 'very good'], ['düşük', 'low'], ['Güç, darbe, sigortalı', 'Power, pulse, fusible']],
      [['Karbon film', 'Carbon film'], '5 %', '−200…−1000', ['yüksek', 'high'], ['orta', 'fair'], ['çok düşük', 'very low'], ['Ucuz / eski tasarım', 'Low-cost / legacy']],
      [['Karbon kompozisyon', 'Carbon composition'], '5–20 %', ['yüksek', 'high'], ['yüksek', 'high'], ['çok yüksek enerji', 'very high energy'], ['orta', 'medium'], ['Darbe, yüksek enerji', 'Pulse, high energy']],
      [['Telli (wirewound)', 'Wirewound'], '0.1–5 %', '±5–50', ['çok düşük', 'very low'], ['iyi', 'good'], ['yüksek', 'high'], ['Yüksek güç, düşük değer (endüktif)', 'High power, low value (inductive)']],
      [['Metal folyo', 'Metal foil'], '0.001–0.1 %', '±0.2–2', ['en düşük', 'lowest'], ['zayıf', 'weak'], ['çok yüksek', 'very high'], ['Referans, laboratuvar, ölçüm', 'Reference, lab, metrology']],
      [['Akım algılama (metal şerit)', 'Current sense (metal strip)'], '0.5–5 %', '±10–75', ['düşük', 'low'], ['iyi', 'good'], ['orta', 'medium'], ['0.5–100 mΩ akım ölçme', '0.5–100 mΩ current sensing']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'gen', opts: [['gen', 'Genel amaç (LED, çekme/çekme)', 'General purpose (LED, pull-up/down)'], ['adc', 'ADC / referans / hassas bölücü', 'ADC / reference / precision divider'], ['sense', 'Akım algılama (mΩ)', 'Current sensing (mΩ)'], ['hv', 'Yüksek gerilim bölücü', 'High-voltage divider'], ['surge', 'Ani akım / snubber / darbe', 'Inrush / snubber / pulse'], ['rf', 'RF / yüksek hız', 'RF / high speed'], ['noise', 'Düşük gürültülü analog', 'Low-noise analog'], ['power', 'Güç direnci (yük, fren, ısıtıcı)', 'Power resistor (load, brake, heater)']] },
      { id: 'tol', tr: 'Gerekli tolerans', en: 'Required tolerance', def: '1', opts: [['5', '%5 ve üzeri', '5 % or looser'], ['1', '%1', '1 %'], ['0.1', '%0.1', '0.1 %'], ['0.01', '%0.05 ve daha iyi', '0.05 % or better']] },
      { id: 'pw', tr: 'Güç sınıfı', en: 'Power class', def: 'm', opts: [['s', '< 0,1 W', '< 0.1 W'], ['m', '0,1 – 1 W', '0.1 – 1 W'], ['l', '1 – 5 W', '1 – 5 W'], ['x', '> 5 W', '> 5 W']] },
      { id: 'env', tr: 'Ortam', en: 'Environment', def: 'n', opts: [['n', 'Normal', 'Normal'], ['a', 'Otomotiv (AEC-Q200)', 'Automotive (AEC-Q200)'], ['h', 'Sıcak (> 125 °C)', 'Hot (> 125 °C)'], ['s', 'Kükürtlü / sert ortam', 'Sulfur-rich / harsh']] },
    ],
    run(v) {
      const R = {
        gen: [['Kalın film çip direnç', 'Thick film chip resistor'], ['Ucuz ve yaygın; %1 yeterlidir. Tolerans ve TCR hassas değil.', 'Cheap and common; 1 % is enough. Tolerance and TCR are not precision-grade.']],
        adc: [['İnce film, eşleşmiş çift veya dizi', 'Thin film, matched pair or array'], ['Bölücüde mutlak değerden çok oran toleransı ve oran TCR\'si belirleyici (örn. ±0,05 %, ±10 ppm/°C ve eşleşme).', 'In a divider the ratio tolerance and ratio TCR matter more than absolute values (e.g. ±0.05 %, ±10 ppm/°C and tracking).']],
        sense: [['Metal şerit akım algılama direnci (Kelvin / 4 uçlu)', 'Metal strip current-sense resistor (Kelvin / 4-terminal)'], ['Çok düşük değer, düşük TCR, düşük termal EMF ve düşük endüktans gerekir; 4 uçlu bağlantı kullanın.', 'Needs very low value, low TCR, low thermal EMF and low inductance; use 4-terminal connection.']],
        hv: [['Çoklu seri yüksek gerilim direnç zinciri veya yüksek gerilim serisi', 'Series chain of resistors or a high-voltage series'], ['Her direncin V_max sınırını ve düşük gerilim katsayısını (VCR) kontrol edin; sızıntı yolu/izolasyon mesafesine dikkat edin.', 'Check each resistor\'s V_max and low voltage coefficient (VCR); mind creepage and clearance.']],
        surge: [['MELF, metal oksit veya anti-surge kalın film', 'MELF, metal oxide or anti-surge thick film'], ['Darbe enerjisi eğrisine bakın; telli (endüktif) tipten kaçının.', 'Check the pulse-energy curve; avoid inductive wirewound types.']],
        rf: [['Küçük paket ince film (0402 ve altı)', 'Small-package thin film (0402 or smaller)'], ['Düşük parazit L ve C gerekir; telli dirençlerden kaçının.', 'Needs low parasitic L and C; avoid wirewound.']],
        noise: [['İnce film, metal film veya (en iyisi) metal folyo', 'Thin film, metal film or (best) metal foil'], ['Kalın film ve karbonun ek akım gürültüsü yüksektir.', 'Thick film and carbon have high excess current noise.']],
        power: [['Telli, metal oksit veya alüminyum gövdeli güç direnci', 'Wirewound, metal oxide or aluminium-housed power resistor'], ['Isı atımını (soğutucu, hava akışı) ve derating eğrisini hesaba katın.', 'Account for heat removal (heat sink, airflow) and the derating curve.']],
      }[v.app];
      const why = [R[1]], tol = +v.tol;
      if (tol <= 0.05) why.push(['Çok sıkı tolerans: metal folyo veya hassas ince film seçin; TCR ve drift de bütçeye girmeli.', 'Very tight tolerance: choose metal foil or precision thin film; TCR and drift must also fit the budget.']);
      else if (tol <= 0.1 && !['adc', 'sense'].includes(v.app)) why.push(['%0,1 tolerans için ince film veya metal film yeterlidir.', 'Thin or metal film is enough for 0.1 % tolerance.']);
      if (v.pw === 'x') why.push(['5 W üstü: güç direnci kullanın, anma gücünün en fazla %50\'sinde çalıştırın.', 'Above 5 W: use a power resistor and run it at no more than 50 % of rating.']);
      else if (v.pw === 'l') why.push(['1–5 W: 2512 çip, MELF veya radyal/eksenel güç direnci.', '1–5 W: 2512 chip, MELF or axial/radial power resistor.']);
      else if (v.pw === 's') why.push(['0,1 W altı: 0402/0603 çip yeterlidir; V_max sınırını kontrol edin.', 'Under 0.1 W: 0402/0603 chip is enough; check the V_max limit.']);
      if (v.env === 'a') why.push(['Otomotiv: AEC-Q200 sertifikalı ve anti-sülfür seri seçin.', 'Automotive: choose AEC-Q200 qualified, anti-sulfur series.']);
      if (v.env === 'h') why.push(['Sıcak ortam: maksimum sıcaklığı ≥ 155 °C olan ve derating eğrisi uygun seri seçin; ince film/telli tercih edilebilir.', 'Hot environment: pick a series rated ≥ 155 °C with a suitable derating curve; thin film/wirewound can be preferred.']);
      if (v.env === 's') why.push(['Kükürtlü ortam: gümüş elektrotlu eski çip dirençlerden kaçının, anti-sülfür seri kullanın.', 'Sulfur-rich air: avoid older silver-electrode chip resistors; use anti-sulfur series.']);
      return { main: R[0], why };
    },
  },
  calcs: [
    { id: 'pw', title: ['Güç ve derating', 'Power and derating'], sub: ['P = V²/R = I²R', 'P = V²/R = I²R'],
      fields: [
        { id: 'r', tr: 'Direnç', en: 'Resistance', def: '10000', u: 'R', help: ['Direncin nominal değeri.', 'Nominal resistance.'] },
        { id: 'v', tr: 'Uygulanan gerilim', en: 'Applied voltage', def: '5', u: 'V', ud: 1, help: ['Gerilimi biliyorsanız girin; boşsa akım kullanılır.', 'Enter if you know the voltage; if empty, current is used.'] },
        { id: 'i', tr: 'Veya akım', en: 'Or current', def: '', u: 'A', ud: 1, help: ['Gerilim boşsa kullanılır.', 'Used when voltage is empty.'] },
        { id: 'pr', tr: 'Anma gücü (70 °C)', en: 'Rated power (70 °C)', def: '0.125', u: 'W', ud: 1, help: ['Veri sayfasındaki anma gücü.', 'Rated power from the datasheet.'] },
        { id: 'ta', tr: 'Ortam sıcaklığı (°C)', en: 'Ambient (°C)', def: '85', help: ['Direncin bulunduğu ortamın sıcaklığı.', 'Temperature around the resistor.'] },
        { id: 'tm', tr: 'Maks. sıcaklık (°C)', en: 'Max temperature (°C)', def: '155', help: ['Güç sıfıra indiğinde sıcaklık.', 'Temperature at which power derates to zero.'] },
        { id: 'vm', tr: 'Maks. çalışma gerilimi', en: 'Max working voltage', def: '150', u: 'V', ud: 1, help: ['Boyutun gerilim sınırı (0805 ≈ 150 V).', 'Size voltage limit (0805 ≈ 150 V).'] },
        { id: 'rth', tr: 'Isıl direnç (isteğe bağlı)', en: 'Thermal resistance (optional)', def: '', help: ['K/W; girilirse kendi ısınması hesaplanır (çip ~100–300 K/W).', 'K/W; if given, self-heating is computed (chip ~100–300 K/W).'] },
      ],
      note: ['%50 kuralı: kullanım oranını %50\'nin altında tutmaya çalışın.', '50 % rule: try to keep the load ratio below 50 %.'],
      compute(G) {
        const R = G.v('r'), Pr = G.v('pr'), Ta = G.r('ta'), Tm = G.r('tm'), Vm = G.v('vm'), Rth = G.r('rth'); let V = G.v('v'), I = G.v('i');
        if (!(R > 0) || !(Pr > 0)) return [['—', tt('Direnç ve anma gücü girin', 'Enter resistance and rated power')]];
        let P; if (V > 0) { P = V * V / R; I = V / R; } else if (I > 0) { P = I * I * R; V = I * R; } else return [['—', tt('Gerilim veya akım girin', 'Enter voltage or current')]];
        const der = Ta > 70 && Tm > 70 ? Math.max(0, Pr * (Tm - Ta) / (Tm - 70)) : Pr, load = P / der * 100, cls = load > 100 ? 'bad' : load > 50 ? 'warn' : 'good';
        const items = [[pctF(load), tt('Kullanım oranı (derating sonrası)', 'Load ratio (after derating)'), 'big ' + cls], [eng(P, 'W'), tt('Harcanan güç', 'Dissipated power')], [eng(der, 'W'), tt('Sıcaklığa göre izin verilen güç', 'Allowed power at temperature')], [eng(V, 'V') + ' / ' + eng(I, 'A'), tt('Gerilim / akım', 'Voltage / current')], [eng(P / 0.5, 'W'), tt('Önerilen min. anma gücü (%50 kuralı)', 'Suggested min. rating (50 % rule)')], [eng(Math.min(Math.sqrt(der * R), Vm), 'V'), tt('Güç ve gerilim sınırından küçük olan', 'Smaller of power and voltage limit')], [eng(Vm * Vm / der, 'Ω'), tt('Kritik direnç (V²/P)', 'Critical resistance (V²/P)')]];
        if (V > Vm) items.push([tt('AŞILIYOR', 'EXCEEDED'), tt('Maksimum çalışma gerilimi', 'Max working voltage'), 'bad']);
        if (Rth > 0) items.push([sig(P * Rth, 3) + ' °C', tt('Kendi ısınması ΔT = P·Rth', 'Self-heating ΔT = P·Rth')], [sig(Ta + P * Rth, 3) + ' °C', tt('Tahmini gövde sıcaklığı', 'Estimated body temperature')]);
        return items;
      } },
    { id: 'dv', title: ['Gerilim bölücü ve hata bütçesi', 'Voltage divider and error budget'], sub: ['Vout = Vin·R2/(R1+R2)', 'Vout = Vin·R2/(R1+R2)'],
      fields: [
        { id: 'vin', tr: 'Giriş gerilimi', en: 'Input voltage', def: '12', u: 'V', ud: 1 },
        { id: 'r1', tr: 'R1 (üst)', en: 'R1 (top)', def: '10', u: 'R', ud: 2 },
        { id: 'r2', tr: 'R2 (alt)', en: 'R2 (bottom)', def: '3.3', u: 'R', ud: 2 },
        { id: 'tol', tr: 'Tolerans (her direnç, %)', en: 'Tolerance (each, %)', def: '1', help: ['Her direncin başlangıç toleransı.', 'Initial tolerance of each resistor.'] },
        { id: 'tcr', tr: 'TCR (ppm/°C)', en: 'TCR (ppm/°C)', def: '100' },
        { id: 'dt', tr: 'Sıcaklık aralığı ΔT (°C)', en: 'Temperature swing ΔT (°C)', def: '60' },
        { id: 'dr', tr: 'Drift (%)', en: 'Drift (%)', def: '0.5', help: ['Ömür boyu kayma (yük drift\'i).', 'Lifetime drift under load.'] },
        { id: 'rt', tr: 'Eşleşme oran toleransı (%)', en: 'Matched ratio tolerance (%)', def: '', help: ['Eşleşmiş çift/dizi kullanıyorsanız girin; mutlak değer yerine kullanılır.', 'Enter if you use a matched pair/array; replaces the absolute figures.'] },
        { id: 'rc', tr: 'Oran TCR (ppm/°C)', en: 'Ratio TCR (ppm/°C)', def: '' },
      ],
      note: ['En kötü durum: bir direnç +δ, diğeri −δ kayar. RSS değeri istatistiksel tahmindir.', 'Worst case: one resistor drifts +δ and the other −δ. RSS is a statistical estimate.'],
      compute(G) {
        const Vin = G.v('vin'), R1 = G.v('r1'), R2 = G.v('r2'), tol = G.r('tol') || 0, tcr = G.r('tcr') || 0, dT = G.r('dt') || 0, dr = G.r('dr') || 0, rt = G.r('rt'), rc = G.r('rc');
        if (!(Vin > 0 && R1 > 0 && R2 > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const k = R1 / (R1 + R2), vo = Vin * R2 / (R1 + R2);
        const items = [[eng(vo, 'V'), tt('Nominal çıkış', 'Nominal output'), 'big'], [sig(R2 / (R1 + R2), 5), tt('Bölme oranı', 'Division ratio')], [eng(R1 * R2 / (R1 + R2), 'Ω'), tt('Çıkış (Thevenin) direnci', 'Output (Thevenin) resistance')]];
        let dMax, dMin, rss;
        if (rt > 0 || rc > 0) { const d = (rt || 0) + (rc || 0) * dT / 1e4; dMax = k * d; dMin = -dMax; rss = dMax; items.push([sig(d, 3) + ' %', tt('Oran hatası (toplam)', 'Ratio error (total)')]); }
        else {
          const d = tol + tcr * dT / 1e4 + dr, a = 1 + d / 100, b = 1 - d / 100;
          dMax = (Vin * R2 * a / (R1 * b + R2 * a) / vo - 1) * 100; dMin = (Vin * R2 * b / (R1 * a + R2 * b) / vo - 1) * 100; rss = k * Math.sqrt(2) * d;
          items.push([sig(d, 3) + ' %', tt('Her direncin toplam sapması', 'Total drift of each resistor')]);
        }
        items.push([eng(vo * (1 + dMin / 100), 'V') + ' … ' + eng(vo * (1 + dMax / 100), 'V'), tt('En kötü durum aralığı', 'Worst-case range'), 'warn'], ['±' + sig(Math.max(Math.abs(dMax), Math.abs(dMin)), 3) + ' %', tt('En kötü durum çıkış hatası', 'Worst-case output error')], [sig(rss, 3) + ' %', tt('RSS (istatistiksel) tahmin', 'RSS (statistical) estimate')]);
        return items;
      } },
    { id: 'cs', title: ['Akım algılama direnci', 'Current-sense resistor'], sub: ['V = I·R, P = I²R', 'V = I·R, P = I²R'],
      fields: [
        { id: 'r', tr: 'Direnç', en: 'Resistance', def: '10', u: 'R', ud: 0, help: ['Şönt direnç değeri (mΩ).', 'Shunt resistance (mΩ).'] },
        { id: 'imax', tr: 'Maks. akım (A)', en: 'Max current (A)', def: '5' }, { id: 'imin', tr: 'Min. akım (A)', en: 'Min current (A)', def: '0.1' },
        { id: 'tol', tr: 'Tolerans (%)', en: 'Tolerance (%)', def: '1' }, { id: 'tcr', tr: 'TCR (ppm/°C)', en: 'TCR (ppm/°C)', def: '50' },
        { id: 'dt', tr: 'Ortam sıcaklık değişimi (°C)', en: 'Ambient swing (°C)', def: '40' }, { id: 'rth', tr: 'Isıl direnç (K/W)', en: 'Thermal resistance (K/W)', def: '50' },
        { id: 'emf', tr: 'Termal EMF toplamı (µV)', en: 'Thermal EMF total (µV)', def: '5', help: ['Termal gerilim hatası; küçük sinyalde ofset gibi davranır.', 'Thermal voltage error; acts like an offset on small signals.'] },
      ],
      note: ['4 uçlu (Kelvin) bağlantı kullanın; ölçümü şönt pedlerinin iç kenarından alın.', 'Use a 4-terminal (Kelvin) connection; sense from the inner pads.'],
      compute(G) {
        const R = G.v('r'), Imax = G.r('imax'), Imin = G.r('imin'), tol = G.r('tol') || 0, tcr = G.r('tcr') || 0, dT = G.r('dt') || 0, Rth = G.r('rth') || 0, emf = G.r('emf') || 0;
        if (!(R > 0 && Imax > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const P = Imax * Imax * R, dTs = P * Rth, th = tcr * (dTs + dT) / 1e4;
        const items = [[eng(Imax * R, 'V'), tt('Maks. algılama gerilimi', 'Max sense voltage'), 'big'], [eng(P, 'W'), tt('Maks. güç', 'Max power')], [eng(P / 0.5, 'W'), tt('Önerilen min. anma gücü (%50)', 'Suggested min. rating (50 %)')], [sig(dTs, 3) + ' °C', tt('Kendi ısınması', 'Self-heating')], [sig(th, 3) + ' %', tt('TCR hatası (ısınma + ortam)', 'TCR error (heating + ambient)')]];
        if (Imin > 0) { const vmin = Imin * R, em = emf * 1e-6 / vmin * 100; items.push([eng(vmin, 'V'), tt('Min. algılama gerilimi', 'Min sense voltage')], [sig(em, 3) + ' %', tt('Termal EMF hatası (min. akımda)', 'Thermal EMF error (at min current)'), em > 1 ? 'warn' : '']); }
        items.push([sig(tol + th, 3) + ' %', tt('Toplam yaklaşık hata (tolerans + TCR)', 'Approx. total error (tolerance + TCR)')]);
        return items;
      } },
    { id: 'es', title: ['E-serisi en yakın değer', 'Nearest E-series value'], sub: ['E6 … E96', 'E6 … E96'],
      fields: [{ id: 'v', tr: 'Hesaplanan değer', en: 'Computed value', def: '4.2', u: 'R', ud: 2 }, { id: 's', tr: 'Seri', en: 'Series', def: 'E24', sel: SEL_E }],
      compute(G) {
        const v = G.v('v'), s = G.s('s'); if (!(v > 0)) return [['—', tt('Değer girin', 'Enter a value')]];
        const r = nearestE(v, s);
        return [[eng(r.near, 'Ω'), tt('En yakın ' + s + ' değeri', 'Nearest ' + s + ' value'), 'big'], [sig(r.err, 3) + ' %', tt('Sapma', 'Deviation')], [eng(r.lo, 'Ω') + ' / ' + eng(r.hi, 'Ω'), tt('Alt / üst komşu', 'Lower / upper neighbour')], [ETOL[s], tt('Serinin tipik toleransı', 'Typical tolerance of the series')]];
      } },
  ],
};
