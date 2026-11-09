/* Capacitor: parameters, technologies, wizard and calculators. */
CMP.capacitor = {
  name: ['Kondansatör', 'Capacitor'],
  title: ['Kondansatör (Capacitor) Rehberi ve Hesaplayıcıları', 'Capacitor Guide and Calculators'],
  sub: ['Kondansatör parametrelerini, teknolojileri (MLCC, elektrolitik, tantal, film…), seçim kriterlerini ve mühendislik hesaplayıcılarını bulun.', 'Capacitor parameters, technologies (MLCC, electrolytic, tantalum, film…), selection criteria and engineering calculators.'],
  params: [
    ['Kapasitans (C)', 'Capacitance (C)', 'F', 'Nominal değer. Ölçüm koşulu önemlidir: MLCC class II için 1 kHz / 1 V, elektrolitik için 120 Hz. Değer E6/E12/E24 serilerinden seçilir.', 'Nominal value. The test condition matters: 1 kHz / 1 V for class II MLCC, 120 Hz for electrolytics. Values come from E6/E12/E24 series.', 'pF … F'],
    ['Tolerans', 'Tolerance', '%', 'Nominal değerden izin verilen sapma (kod harfi: J ±5, K ±10, M ±20, Z +80/−20).', 'Allowed deviation from nominal (code letter: J ±5, K ±10, M ±20, Z +80/−20).', 'C0G ±1–5 · X7R ±10–20 · electrolytic ±20'],
    ['Anma gerilimi (DC)', 'Rated voltage (DC)', 'V', 'Sürekli uygulanabilecek en yüksek DC (ve tepe) gerilim. Pratikte anma değerinin altında çalışılır (derating).', 'Highest continuous DC (and peak) voltage. In practice operate below the rating (derating).', 'MLCC 60–80 % · Al 80 % · Ta MnO₂ 50 %'],
    ['Ani (surge) gerilimi', 'Surge voltage', 'V', 'Kısa süreli, sınırlı sayıda uygulanabilen gerilim; elektrolitikte anma geriliminin yaklaşık 1,15–1,25 katı.', 'Short-term, limited-count voltage; about 1.15–1.25× rated for electrolytics.', '—'],
    ['Dielektrik / sıcaklık karakteristiği', 'Dielectric / temperature characteristic', '—', 'MLCC sınıfı: C0G/NP0 ±30 ppm/°C, X7R ±15 % (−55…125 °C), X5R ±15 % (−55…85 °C), Y5V +22/−82 %.', 'MLCC class: C0G/NP0 ±30 ppm/°C, X7R ±15 % (−55…125 °C), X5R ±15 % (−55…85 °C), Y5V +22/−82 %.', '—'],
    ['DC bias etkisi', 'DC bias effect', '% kayıp', 'Class II MLCC\'lerde uygulanan gerilimle kapasitans düşer; anma gerilimine yakın %40–80 kayıp olabilir. Küçük paket ve yüksek değerde daha kötü.', 'Class II MLCC capacitance falls with applied voltage; 40–80 % loss near rated voltage is possible. Worse for small case and high value.', 'X7R: 20–60 %'],
    ['Yaşlanma', 'Aging', '%/dekad-saat', 'Class II seramikte kapasitans zamanla logaritmik azalır; Curie sıcaklığının üstüne ısıtınca sıfırlanır. C0G\'de yoktur.', 'Class II ceramics lose capacitance logarithmically with time; reset by heating above the Curie point. None in C0G.', 'X7R ≈ 1–2 %/decade-hour'],
    ['ESR', 'ESR', 'mΩ', 'Seri eşdeğer direnç; frekans ve sıcaklığa bağlıdır. Dalgalanma akımında ısınmayı ve çıkış ripple\'ını belirler.', 'Equivalent series resistance; depends on frequency and temperature. Sets ripple heating and output ripple.', 'MLCC 2–20 · polymer 5–50 · Al electrolytic 20 mΩ–Ω'],
    ['ESL', 'ESL', 'nH', 'Seri eşdeğer endüktans; paket ve bağlantı yoluyla belirlenir. Yüksek frekans bypass\'ını sınırlar.', 'Equivalent series inductance; set by package and mounting. Limits high-frequency bypass.', 'MLCC 0.4–1 · electrolytic 5–20+'],
    ['Kendinden rezonans (SRF)', 'Self-resonant frequency', 'Hz', 'f_SR = 1/(2π√(ESL·C)). Üstünde kondansatör endüktif davranır.', 'f_SR = 1/(2π√(ESL·C)). Above it the capacitor behaves inductively.', '—'],
    ['Kayıp faktörü (tan δ / DF)', 'Dissipation factor (tan δ)', '%', 'tan δ = ESR/X_C. C0G ≈ 0,1 %, X7R ≈ 2,5 %, elektrolitik ≈ 10–20 % (120 Hz).', 'tan δ = ESR/X_C. C0G ≈ 0.1 %, X7R ≈ 2.5 %, electrolytic ≈ 10–20 % (120 Hz).', '—'],
    ['Dalgalanma (ripple) akımı', 'Ripple current', 'A rms', 'P = I²·ESR ısınması; anma ripple akımı belirli sıcaklık ve frekanstadır. Ömrü doğrudan etkiler.', 'P = I²·ESR heating; the rated ripple current is for a given temperature and frequency. Directly affects life.', '—'],
    ['Kaçak akım / yalıtım direnci', 'Leakage / insulation resistance', 'µA / GΩ', 'Elektrolitik: I ≈ 0,01·C·V (en az ≈ 3 µA). MLCC: IR ≥ 10 GΩ veya 500 MΩ·µF. Film: > 100 GΩ.', 'Electrolytic: I ≈ 0.01·C·V (min ≈ 3 µA). MLCC: IR ≥ 10 GΩ or 500 MΩ·µF. Film: > 100 GΩ.', '—'],
    ['Ömür', 'Lifetime', 'saat', 'Elektrolitikte 1000–10000 saat @105 °C; her +10 °C\'de yarıya iner. MLCC ve film çok uzundur.', 'Electrolytics: 1000–10000 h @105 °C; halves for every +10 °C. MLCC and film are far longer.', 'L = L₀·2^((T₀−T)/10)'],
    ['Polarite', 'Polarity', '—', 'Elektrolitik ve tantal polarlıdır; ters gerilim arıza yapar (tantalda yanma/patlama riski).', 'Electrolytic and tantalum are polarised; reverse voltage causes failure (fire/burst risk in tantalum).', '—'],
    ['dV/dt (darbe dayanımı)', 'dV/dt (pulse capability)', 'V/µs', 'Hızlı gerilim değişimlerinde dayanılan eğim; snubber ve güç uygulamalarında film kondansatörler için önemli.', 'Slew rate withstood under fast voltage changes; important for film capacitors in snubbers and power uses.', 'PP film: 100s–1000s V/µs'],
    ['Piezoelektrik / mikrofonik etki', 'Piezoelectric / microphonic effect', '—', 'Class II MLCC titreşimi gerilime, gerilimi sese çevirebilir (ses ve hassas analog devrelerde sorun).', 'Class II MLCC can turn vibration into voltage and voltage into audible noise (a problem in audio and precision analog).', '—'],
    ['Güvenlik sınıfı', 'Safety class', '—', 'Şebeke EMI filtrelerinde X1/X2 (hat–hat) ve Y1/Y2 (hat–toprak) onaylı kondansatörler gerekir (IEC 60384-14).', 'Mains EMI filters need X1/X2 (line–line) and Y1/Y2 (line–ground) approved capacitors (IEC 60384-14).', '—'],
    ['Paket ve montaj', 'Package and mounting', '—', 'MLCC: 01005…2220; esnek (flexible) terminal PCB bükülmesinden çatlamayı azaltır. Büyük değerli elektrolitikler radyal/SMD can.', 'MLCC: 01005…2220; flexible termination reduces flex cracking. Large electrolytics are radial/SMD can.', '—'],
    ['Güvenilirlik', 'Reliability', '—', 'AEC-Q200 (otomotiv); tantal MnO₂ ani akımda arızalanabilir (seri direnç/derating).', 'AEC-Q200 (automotive); tantalum MnO₂ can fail on inrush (series resistance/derating).', '—'],
  ],
  tech: {
    title: ['Kondansatör türleri', 'Capacitor types'],
    head: [['Tür', 'Type'], ['Kapasitans aralığı', 'Capacitance range'], ['Tolerans', 'Tolerance'], ['Gerilim', 'Voltage'], ['ESR', 'ESR'], ['Kararlılık', 'Stability'], ['Polarite', 'Polarity'], ['Tipik kullanım', 'Typical use']],
    rows: [
      [['MLCC C0G / NP0', 'MLCC C0G / NP0'], '0.5 pF – 100 nF', '±1–5 %', '16 – 3000 V', ['çok düşük', 'very low'], ['çok iyi (±30 ppm/°C, bias yok)', 'very good (±30 ppm/°C, no bias)'], ['hayır', 'no'], ['Osilatör, filtre, RF, zamanlama', 'Oscillator, filter, RF, timing']],
      [['MLCC X7R / X5R', 'MLCC X7R / X5R'], '100 pF – 100 µF', '±10–20 %', '6.3 – 1000 V', ['düşük', 'low'], ['orta (±15 %, bias kaybı)', 'fair (±15 %, bias loss)'], ['hayır', 'no'], ['Decoupling, bypass', 'Decoupling, bypass']],
      [['MLCC Y5V / Z5U', 'MLCC Y5V / Z5U'], '10 nF – 100 µF', '+80/−20 %', '6.3 – 50 V', ['düşük', 'low'], ['zayıf', 'poor'], ['hayır', 'no'], ['Ucuz bypass (önerilmez)', 'Cheap bypass (not recommended)']],
      [['Alüminyum elektrolitik', 'Aluminium electrolytic'], '0.1 µF – 1 F', '±20 %', '6.3 – 600 V', ['orta–yüksek', 'medium–high'], ['zayıf (ömür, sıcaklık)', 'poor (life, temperature)'], ['evet', 'yes'], ['Bulk, güç kaynağı filtre', 'Bulk, power supply filtering']],
      [['Alüminyum polimer', 'Aluminium polymer'], '2.2 µF – 2.2 mF', '±20 %', '2 – 100 V', ['çok düşük', 'very low'], ['iyi', 'good'], ['evet', 'yes'], ['SMPS çıkışı, düşük ESR bulk', 'SMPS output, low-ESR bulk']],
      [['Tantal MnO₂', 'Tantalum MnO₂'], '0.1 – 1000 µF', '±10–20 %', '2.5 – 50 V', ['düşük', 'low'], ['iyi', 'good'], ['evet', 'yes'], ['Kompakt bulk (derating!)', 'Compact bulk (derate!)']],
      [['Tantal polimer', 'Tantalum polymer'], '1 – 1000 µF', '±20 %', '2.5 – 35 V', ['çok düşük', 'very low'], ['iyi', 'good'], ['evet', 'yes'], ['Düşük ESR bulk, yüksek yoğunluk', 'Low-ESR bulk, high density']],
      [['Film (PP / PET / PPS)', 'Film (PP / PET / PPS)'], '100 pF – 100 µF', '±1–10 %', '50 – 2000 V', ['çok düşük', 'very low'], ['çok iyi', 'very good'], ['hayır', 'no'], ['Ses, snubber, motor, AC, güç', 'Audio, snubber, motor, AC, power']],
      [['Süperkapasitör (EDLC)', 'Supercapacitor (EDLC)'], '0.1 – 3000 F', '−20/+80 %', '2.5 – 5.5 V', ['yüksek', 'high'], ['zayıf', 'poor'], ['evet', 'yes'], ['Yedek güç, enerji depolama', 'Backup power, energy storage']],
      [['Mika / cam', 'Mica / glass'], '1 pF – 10 nF', '±1–5 %', '100 – 2500 V', ['çok düşük', 'very low'], ['mükemmel', 'excellent'], ['hayır', 'no'], ['RF, hassas', 'RF, precision']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'dec', opts: [['dec', 'Decoupling / bypass (dijital IC)', 'Decoupling / bypass (digital IC)'], ['bulk', 'Bulk / SMPS çıkış filtresi', 'Bulk / SMPS output filter'], ['prec', 'Hassas zamanlama / osilatör / filtre', 'Precision timing / oscillator / filter'], ['audio', 'Ses / AC kuplaj', 'Audio / AC coupling'], ['snub', 'Snubber / darbe / yüksek dV/dt', 'Snubber / pulse / high dV/dt'], ['emi', 'Şebeke EMI (X / Y)', 'Mains EMI (X / Y)'], ['rf', 'RF / empedans uyumlama', 'RF / matching'], ['hold', 'Hold-up / yedek enerji', 'Hold-up / backup energy']] },
      { id: 'v', tr: 'Gerilim sınıfı', en: 'Voltage class', def: 'm', opts: [['l', '≤ 16 V', '≤ 16 V'], ['m', '16 – 50 V', '16 – 50 V'], ['h', '50 – 250 V', '50 – 250 V'], ['x', '> 250 V', '> 250 V']] },
      { id: 'c', tr: 'Kapasitans', en: 'Capacitance', def: 'm', opts: [['s', '≤ 1 nF', '≤ 1 nF'], ['m', '1 nF – 1 µF', '1 nF – 1 µF'], ['l', '1 µF – 100 µF', '1 µF – 100 µF'], ['x', '> 100 µF', '> 100 µF']] },
      { id: 'env', tr: 'Ortam', en: 'Environment', def: 'n', opts: [['n', 'Normal', 'Normal'], ['a', 'Otomotiv (AEC-Q200)', 'Automotive (AEC-Q200)'], ['h', 'Sıcak (> 105 °C)', 'Hot (> 105 °C)'], ['life', 'Uzun ömür (> 10 yıl)', 'Long life (> 10 years)']] },
    ],
    run(v) {
      const R = {
        dec: [['MLCC X7R / X5R (0402–0805)', 'MLCC X7R / X5R (0402–0805)'], ['Her IC besleme pinine 100 nF, yanına birkaç µF bulk; ESL düşük kalsın diye kısa izler. Anma gerilimini en az 2× seçin: DC bias kapasitansı düşürür. Y5V kullanmayın.', '100 nF at every IC supply pin plus a few µF bulk nearby; keep traces short for low ESL. Choose rated voltage at least 2×: DC bias reduces capacitance. Avoid Y5V.']],
        bulk: [['Alüminyum polimer / tantal polimer + paralel MLCC', 'Aluminium polymer / tantalum polymer + parallel MLCC'], ['Düşük ESR ve yüksek ripple akımı gerekir; ripple akımı ve ESR ile ısınmayı hesaplayın (hesaplayıcılar sekmesi).', 'Needs low ESR and high ripple current; compute heating from ripple current and ESR (Calculators tab).']],
        prec: [['MLCC C0G / NP0 (≤ ~100 nF) veya PP/PPS film', 'MLCC C0G / NP0 (≤ ~100 nF) or PP/PPS film'], ['Sıcaklık, DC bias ve yaşlanma kararlılığı gerekir; X7R bu kullanımda sapma ve mikrofonik etki yaratır.', 'Needs stability against temperature, DC bias and aging; X7R drifts and is microphonic here.']],
        audio: [['PP / PET film veya C0G', 'PP / PET film or C0G'], ['Class II MLCC bias ve mikrofonik bozulma yapar. Büyük değerde kutupsuz (bipolar) elektrolitik veya film seçin.', 'Class II MLCC adds bias and microphonic distortion. At large values choose bipolar electrolytic or film.']],
        snub: [['PP film (yüksek dV/dt) veya yüksek gerilim C0G MLCC', 'PP film (high dV/dt) or high-voltage C0G MLCC'], ['dV/dt ve darbe akımı değerlerini kontrol edin; ESR\'si düşük, kendi kendini onaran (self-healing) film uygundur.', 'Check dV/dt and pulse-current ratings; low-ESR self-healing film is suitable.']],
        emi: [['X2 / Y2 güvenlik onaylı film veya seramik', 'X2 / Y2 safety-approved film or ceramic'], ['IEC 60384-14 onayı şart; Y kondansatörlerde toplam kaçak akımı sınırlayın.', 'IEC 60384-14 approval is mandatory; limit total leakage current with Y capacitors.']],
        rf: [['C0G / NP0 küçük paket, mika veya yüksek-Q porselen', 'Small C0G / NP0, mica or high-Q porcelain'], ['SRF, Q ve ESR değerlerine bakın; devre frekansı SRF\'nin çok altında kalmalı.', 'Check SRF, Q and ESR; operate far below the SRF.']],
        hold: [['Alüminyum elektrolitik (veya süperkapasitör)', 'Aluminium electrolytic (or supercapacitor)'], ['Gerekli C\'yi hold-up hesaplayıcısıyla bulun; ESR ve ömrü (sıcaklık) hesaba katın.', 'Find the required C with the hold-up calculator; account for ESR and life (temperature).']],
      }[v.app];
      const why = [R[1]];
      if (v.v === 'x') why.push(['250 V üstü: film, yüksek gerilim MLCC veya 450–600 V elektrolitik; seri bağlarsanız gerilimi paylaştıran dirençler ekleyin.', 'Above 250 V: film, high-voltage MLCC or 450–600 V electrolytic; if stacking in series add voltage-balancing resistors.']);
      if (v.v === 'l' && v.app === 'bulk') why.push(['16 V altı: polimer ve tantal polimer çok iyi bir seçimdir.', 'Under 16 V: polymer and tantalum polymer are excellent choices.']);
      if (v.c === 'x' && v.app !== 'hold') why.push(['100 µF üstü: elektrolitik, polimer veya süperkapasitör; bu değerde MLCC\'de bias kaybı çok büyük olur.', 'Above 100 µF: electrolytic, polymer or supercapacitor; MLCC bias loss is very large at this value.']);
      if (v.c === 's') why.push(['1 nF altı: C0G/NP0 hem kararlı hem de küçüktür.', 'Under 1 nF: C0G/NP0 is both stable and small.']);
      if (v.env === 'a') why.push(['Otomotiv: AEC-Q200 sertifikalı, esnek terminalli MLCC ve otomotiv sınıfı elektrolitik/polimer seçin.', 'Automotive: choose AEC-Q200 qualified, flexible-termination MLCC and automotive-grade electrolytic/polymer.']);
      if (v.env === 'h') why.push(['Sıcak ortam: elektrolitikte 125–150 °C sınıfı, filmde PPS/PEN; PP film genelde 105 °C ile sınırlıdır. Elektrolitik ömrü her +10 °C\'de yarıya iner.', 'Hot environment: 125–150 °C class electrolytic, PPS/PEN film; PP film is usually limited to 105 °C. Electrolytic life halves per +10 °C.']);
      if (v.env === 'life') why.push(['Uzun ömür: polimer, film veya MLCC; elektrolitikte ömür hesabı yapın (hesaplayıcılar sekmesi).', 'Long life: polymer, film or MLCC; for electrolytics compute the life (Calculators tab).']);
      return { main: R[0], why };
    },
  },
  calcs: [
    { id: 'z', title: ['Empedans ve SRF', 'Impedance and SRF'], sub: ['|Z| = √(ESR² + (X_L − X_C)²)', '|Z| = √(ESR² + (X_L − X_C)²)'],
      fields: [
        { id: 'c', tr: 'Kapasitans', en: 'Capacitance', def: '100', u: 'C', ud: 1 }, { id: 'f', tr: 'Frekans', en: 'Frequency', def: '1', u: 'F', ud: 2 },
        { id: 'esr', tr: 'ESR', en: 'ESR', def: '10', u: 'R', ud: 0, help: ['Seri eşdeğer direnç (veri sayfasından).', 'Equivalent series resistance (from the datasheet).'] },
        { id: 'esl', tr: 'ESL', en: 'ESL', def: '1', u: 'L', ud: 0, help: ['Seri eşdeğer endüktans; 0402 MLCC ≈ 0,4 nH.', 'Equivalent series inductance; 0402 MLCC ≈ 0.4 nH.'] },
      ],
      note: ['Kendinden rezonansın üstünde kondansatör endüktif davranır; geniş bantlı bypass için farklı değerleri paralel kullanın.', 'Above self-resonance the capacitor is inductive; use different values in parallel for wideband bypass.'],
      compute(G) {
        const C = G.v('c'), f = G.v('f'), esr = G.v('esr') || 0, esl = G.v('esl') || 0;
        if (!(C > 0 && f > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const w = 2 * Math.PI * f, Xc = 1 / (w * C), Xl = w * esl, X = Xl - Xc, Z = Math.hypot(esr, X), fs = esl > 0 ? 1 / (2 * Math.PI * Math.sqrt(esl * C)) : Infinity;
        return [[eng(Z, 'Ω'), tt('Toplam empedans |Z|', 'Total impedance |Z|'), 'big'], [eng(Xc, 'Ω'), 'X_C'], [eng(Xl, 'Ω'), 'X_L (ESL)'], [fs === Infinity ? '—' : eng(fs, 'Hz'), tt('Kendinden rezonans (SRF)', 'Self-resonant frequency (SRF)')], [f < fs ? tt('Kapasitif', 'Capacitive') : tt('Endüktif', 'Inductive'), tt('Bu frekanstaki davranış', 'Behaviour at this frequency'), f < fs ? 'good' : 'warn'], [sig(esr / Xc * 100, 3) + ' %', 'tan δ = ESR/X_C']];
      } },
    { id: 'rc', title: ['RC şarj / deşarj ve enerji', 'RC charge / discharge and energy'], sub: ['τ = R·C, E = ½·C·V²', 'τ = R·C, E = ½·C·V²'],
      fields: [
        { id: 'r', tr: 'Direnç', en: 'Resistance', def: '10', u: 'R', ud: 2 }, { id: 'c', tr: 'Kapasitans', en: 'Capacitance', def: '100', u: 'C', ud: 2 },
        { id: 'v', tr: 'Gerilim', en: 'Voltage', def: '5', u: 'V', ud: 1 }, { id: 'p', tr: 'Hedef şarj (%)', en: 'Target charge (%)', def: '90', help: ['Şarjda bu orana, deşarjda kalan orana (100 − değer) ulaşma süresi.', 'Time to reach this percentage when charging, or (100 − value) when discharging.'] },
      ],
      compute(G) {
        const R = G.v('r'), C = G.v('c'), V = G.v('v'), p = G.r('p');
        if (!(R > 0 && C > 0 && V > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const tau = R * C, items = [[eng(tau, 's'), tt('Zaman sabiti τ = R·C', 'Time constant τ = R·C'), 'big']];
        if (p > 0 && p < 100) items.push([eng(-tau * Math.log(1 - p / 100), 's'), tt(`%${p} şarj / %${100 - p} kalan süresi`, `Time to ${p} % charge / ${100 - p} % left`)]);
        items.push([eng(5 * tau, 's'), tt('5τ (≈ %99,3)', '5τ (≈ 99.3 %)')], [eng(0.5 * C * V * V, 'J'), tt('Depolanan enerji ½CV²', 'Stored energy ½CV²')], [eng(C * V, 'C'), tt('Yük Q = C·V', 'Charge Q = C·V')], [eng(V / R, 'A'), tt('İlk akım (V/R)', 'Initial current (V/R)')]);
        return items;
      } },
    { id: 'dr', title: ['Gerilim derating', 'Voltage derating'], sub: ['V_anma ≥ V_tepe / katsayı', 'V_rated ≥ V_peak / factor'],
      fields: [
        { id: 't', tr: 'Tür', en: 'Type', def: 'x7r', sel: [['c0g', 'MLCC C0G', 'MLCC C0G'], ['x7r', 'MLCC X7R / X5R', 'MLCC X7R / X5R'], ['al', 'Alüminyum elektrolitik', 'Aluminium electrolytic'], ['alp', 'Alüminyum polimer', 'Aluminium polymer'], ['tam', 'Tantal MnO₂', 'Tantalum MnO₂'], ['tap', 'Tantal polimer', 'Tantalum polymer'], ['film', 'Film', 'Film']] },
        { id: 'vdc', tr: 'DC gerilim', en: 'DC voltage', def: '12', u: 'V', ud: 1 }, { id: 'vac', tr: 'AC/ripple tepe gerilimi', en: 'AC / ripple peak', def: '0.5', u: 'V', ud: 1 },
      ],
      note: ['Katsayılar yaygın pratik kurallardır; üretici kılavuzu önceliklidir. Class II MLCC\'de DC bias kapasitansı da düşürür (genelde %20–60).', 'Factors are common rules of thumb; the manufacturer guideline takes priority. For class II MLCC, DC bias also reduces capacitance (typically 20–60 %).'],
      compute(G) {
        const F = { c0g: 0.8, x7r: 0.6, al: 0.8, alp: 0.8, tam: 0.5, tap: 0.8, film: 0.7 }[G.s('t')], vdc = G.v('vdc'), vac = G.v('vac') || 0;
        if (!(vdc > 0)) return [['—', tt('Gerilim girin', 'Enter the voltage')]];
        const vp = vdc + vac, need = vp / F, std = [4, 6.3, 10, 16, 25, 35, 50, 63, 100, 160, 200, 250, 400, 450, 630, 1000, 1500, 2000, 3000].find((x) => x >= need);
        return [[std ? eng(std, 'V') : tt('tablo dışı', 'off table'), tt('Seçilecek standart anma gerilimi', 'Standard rated voltage to choose'), 'big'], [eng(vp, 'V'), tt('Tepe gerilim (DC + AC)', 'Peak voltage (DC + AC)')], [eng(need, 'V'), tt('Gereken min. anma gerilimi', 'Required min. rated voltage')], [sig(F * 100, 3) + ' %', tt('Kullanım katsayısı (üst sınır)', 'Utilisation factor (upper limit)')]];
      } },
    { id: 'rl', title: ['Ripple akımı ve elektrolitik ömür', 'Ripple current and electrolytic life'], sub: ['L = L₀·2^((T₀ − T_çekirdek)/10)', 'L = L₀·2^((T₀ − T_core)/10)'],
      fields: [
        { id: 'i', tr: 'Ripple akımı (rms, A)', en: 'Ripple current (rms, A)', def: '1' }, { id: 'esr', tr: 'ESR', en: 'ESR', def: '100', u: 'R', ud: 0 },
        { id: 'rth', tr: 'Isıl direnç (K/W)', en: 'Thermal resistance (K/W)', def: '20', help: ['Çekirdek-ortam ısıl direnci; veri sayfasından veya ölçümle.', 'Core-to-ambient thermal resistance; from the datasheet or by measurement.'] },
        { id: 'ta', tr: 'Ortam sıcaklığı (°C)', en: 'Ambient (°C)', def: '70' }, { id: 'l0', tr: 'Anma ömrü L₀ (saat)', en: 'Rated life L₀ (h)', def: '2000' }, { id: 't0', tr: 'Anma sıcaklığı T₀ (°C)', en: 'Rated temperature T₀ (°C)', def: '105' },
        { id: 'ir', tr: 'Anma ripple akımı (isteğe bağlı, A)', en: 'Rated ripple (optional, A)', def: '' },
      ],
      note: ['Ömür kuralı: elektrolitik ömür sıcaklık her 10 °C artınca yarıya düşer. Gerçek ömür için üretici modelini kullanın.', 'Life rule: electrolytic life halves for every 10 °C rise. Use the manufacturer model for real life figures.'],
      compute(G) {
        const I = G.r('i'), esr = G.v('esr'), rth = G.r('rth') || 0, ta = G.r('ta'), l0 = G.r('l0'), t0 = G.r('t0'), ir = G.r('ir');
        if (!(I > 0 && esr > 0 && l0 > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const P = I * I * esr, dT = P * rth, Tc = ta + dT, life = l0 * Math.pow(2, (t0 - Tc) / 10), yrs = life / 8760;
        const items = [[sig(yrs, 3) + ' ' + tt('yıl', 'years'), tt('Tahmini ömür (7/24 çalışma)', 'Estimated life (24/7 operation)'), 'big ' + (yrs < 5 ? 'bad' : yrs < 10 ? 'warn' : 'good')], [sig(life, 4) + ' h', tt('Tahmini ömür (saat)', 'Estimated life (hours)')], [eng(P, 'W'), tt('Kayıp güç I²·ESR', 'Power loss I²·ESR')], [sig(dT, 3) + ' °C', tt('Kendi ısınması', 'Self-heating')], [sig(Tc, 3) + ' °C', tt('Çekirdek sıcaklığı', 'Core temperature'), Tc > t0 ? 'bad' : '']];
        if (ir > 0) items.push([sig(I / ir * 100, 3) + ' %', tt('Anma ripple akımının oranı', 'Fraction of rated ripple'), I > ir ? 'bad' : '']);
        return items;
      } },
    { id: 'hu', title: ['Hold-up kapasitesi', 'Hold-up capacitance'], sub: ['C = 2·P·t / (η·(V₁² − V₂²))', 'C = 2·P·t / (η·(V₁² − V₂²))'],
      fields: [
        { id: 'p', tr: 'Yük gücü', en: 'Load power', def: '10', u: 'W', ud: 1 }, { id: 't', tr: 'Hold-up süresi', en: 'Hold-up time', def: '20', u: 'T', ud: 1 },
        { id: 'v1', tr: 'Başlangıç gerilimi', en: 'Start voltage', def: '12', u: 'V', ud: 1 }, { id: 'v2', tr: 'Minimum gerilim', en: 'Minimum voltage', def: '9', u: 'V', ud: 1 },
        { id: 'e', tr: 'Verimlilik (%)', en: 'Efficiency (%)', def: '90' },
      ],
      compute(G) {
        const P = G.v('p'), t = G.v('t'), v1 = G.v('v1'), v2 = G.v('v2'), eta = (G.r('e') || 100) / 100;
        if (!(P > 0 && t > 0 && v1 > v2 && v2 > 0)) return [['—', tt('Değerleri girin (V1 > V2)', 'Enter the values (V1 > V2)')]];
        const C = 2 * P * t / (eta * (v1 * v1 - v2 * v2));
        return [[eng(C, 'F'), tt('Gereken kapasitans', 'Required capacitance'), 'big'], [eng(P * t / eta, 'J'), tt('Gereken enerji', 'Required energy')], [eng(0.5 * C * (v1 * v1 - v2 * v2), 'J'), tt('Kullanılabilir enerji', 'Usable energy')]];
      } },
    { id: 'es', title: ['E-serisi en yakın değer', 'Nearest E-series value'], sub: ['E6 … E96', 'E6 … E96'],
      fields: [{ id: 'v', tr: 'Hesaplanan değer', en: 'Computed value', def: '4.2', u: 'C', ud: 2 }, { id: 's', tr: 'Seri', en: 'Series', def: 'E12', sel: SEL_E }],
      compute(G) {
        const v = G.v('v'), s = G.s('s'); if (!(v > 0)) return [['—', tt('Değer girin', 'Enter a value')]];
        const r = nearestE(v, s);
        return [[eng(r.near, 'F'), tt('En yakın ' + s + ' değeri', 'Nearest ' + s + ' value'), 'big'], [sig(r.err, 3) + ' %', tt('Sapma', 'Deviation')], [eng(r.lo, 'F') + ' / ' + eng(r.hi, 'F'), tt('Alt / üst komşu', 'Lower / upper neighbour')], [ETOL[s], tt('Serinin tipik toleransı', 'Typical tolerance of the series')]];
      } },
  ],
};
