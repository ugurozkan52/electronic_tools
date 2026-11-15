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
  // calculators are shown in headed groups, one application at a time
  calcGroups: [
    ['ac', 'Frekans davranışı', 'Frequency behaviour', 'Empedans, ESR/ESL ve seri rezonans frekansı (SRF).', 'Impedance, ESR/ESL and self-resonant frequency (SRF).'],
    ['time', 'Zaman ve enerji', 'Time and energy', 'RC şarj/deşarj, depolanan enerji ve besleme kesintisinde hold-up kapasitesi.', 'RC charge/discharge, stored energy and hold-up capacitance on supply loss.'],
    ['rate', 'Derating ve ömür', 'Derating and life', 'Gerilim derating, ripple akımı ısınması ve elektrolitik ömür.', 'Voltage derating, ripple-current heating and electrolytic life.'],
    ['val', 'Değer seçimi', 'Value selection', 'Hesaplanan değere en yakın standart (E-serisi) değer.', 'Nearest standard (E-series) value to the computed one.'],
  ],
  calcs: [
    { id: 'z', group: 'ac', plot: (G, items) => capZPlot(G, items), title: ['Empedans ve SRF', 'Impedance and SRF'], sub: ['|Z| = √(ESR² + (X_L − X_C)²)', '|Z| = √(ESR² + (X_L − X_C)²)'],
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
    { id: 'ir', group: 'time', title: ['Inrush (kalkış) akımı', 'Inrush current'], sub: ['Besleme takılınca boş kondansatörler kısa devre gibi davranır: I_pk = V / R_seri (ani) ya da C·dV/dt (yumuşak kalkış), τ = R·C, I²t = V²·C / (2R)', 'Empty capacitors look like a short when the supply is applied: I_pk = V / R_series (step) or C·dV/dt (soft start), τ = R·C, I²t = V²·C / (2R)'],
      fields: [
        { id: 'c', tr: 'Toplam kapasite (giriş + dekuplaj)', en: 'Total capacitance (bulk + decoupling)', def: '470', u: 'C', ud: 2, help: ['Besleme hattındaki tüm kondansatörlerin toplamı: giriş elektrolitikleri, seramik dekuplajlar, regülatör giriş/çıkışları. Seramiklerde DC öngerilim kaybını hesaba katmayın (en kötü durum için anma değer).', 'Sum of all capacitors on the rail: bulk electrolytics, ceramic decoupling, regulator inputs/outputs. Ignore ceramic DC-bias loss (nominal value is the worst case).'] },
        { id: 'v', tr: 'Besleme gerilimi', en: 'Supply voltage', def: '24', u: 'V', ud: 1 },
        { id: 'rs', tr: 'Kaynak + kablo + ESR direnci', en: 'Source + cable + ESR resistance', def: '100', u: 'R', ud: 0, help: ['Besleme çıkış direnci, kablo/konnektör, PCB izi ve kondansatör ESR toplamı. Laboratuvar kaynağı + 1 m kablo için 50–200 mΩ tipik.', 'Supply output resistance, cable/connector, PCB trace and capacitor ESR in total. 50–200 mΩ is typical for a bench supply + 1 m of cable.'] },
        { id: 'rl', tr: 'Inrush sınırlayıcı (NTC / direnç, isteğe bağlı)', en: 'Inrush limiter (NTC / resistor, optional)', def: '', u: 'R', ud: 1, help: ['Soğuk NTC direnci ya da seri direnç. Boşsa sınırlayıcı yok.', 'Cold NTC resistance or series resistor. Empty means no limiter.'] },
        { id: 'tr', tr: 'Besleme yükselme süresi (yumuşak kalkış, isteğe bağlı)', en: 'Supply rise time (soft start, optional)', def: '', u: 'T', ud: 1, help: ['Kaynak / hot-swap denetleyicisi gerilimi bu sürede doğrusal yükseltiyorsa akım C·V/t_r ile sınırlanır. Boşsa ani basamak.', 'If the source / hot-swap controller ramps the voltage linearly over this time, the current is limited to C·V/t_r. Empty means a step.'] },
        { id: 'imax', tr: 'İzin verilen tepe akım (isteğe bağlı)', en: 'Allowed peak current (optional)', def: '', u: 'A', ud: 2, help: ['Sigorta, konnektör, hot-swap FET SOA ya da kaynağın akım sınırı. Girilirse gereken sınırlayıcı direnç ya da yükselme süresi önerilir.', 'Fuse, connector, hot-swap FET SOA or the source current limit. If entered, the required limiter resistance or rise time is suggested.'] },
        { id: 'i2t', tr: 'Sigorta I²t (A²s, isteğe bağlı)', en: 'Fuse I²t (A²s, optional)', def: '', help: ['Sigortanın erime I²t değeri (veri sayfası). Inrush I²t bunun %20–30\'unun altında kalmalı.', 'Melting I²t of the fuse (datasheet). The inrush I²t should stay below 20–30 % of it.'] },
      ],
      note: ['Kondansatör boşken başlangıç akımını yalnızca seri direnç sınırlar; 24 V / 0,1 Ω = 240 A gibi değerler konnektör kontaklarını yakar, sigortayı attırır ve ortak beslemeye çökme verir. Çözümler: NTC (soğukken yüksek, ısınınca düşük direnç), hot-swap denetleyici (dV/dt sınırlı FET), yumuşak kalkışlı regülatör, ya da ön şarj direnci + röle. Enerjinin yarısı her durumda seri dirençte ısıya döner (½CV²).', 'With empty capacitors only the series resistance limits the initial current; values like 24 V / 0.1 Ω = 240 A pit connector contacts, blow fuses and dip the shared supply. Remedies: NTC (high when cold, low when warm), hot-swap controller (dV/dt-limited FET), soft-start regulator, or a pre-charge resistor + relay. Half of the energy is always dissipated as heat in the series resistance (½CV²).'],
      compute(G) {
        const C = G.v('c'), V = G.v('v'), rs = G.v('rs') || 0, rl = G.v('rl') > 0 ? G.v('rl') : 0, tr = G.v('tr'), imax = G.v('imax'), i2tF = G.r('i2t');
        if (!(C > 0 && V > 0 && rs + rl > 0)) return [['—', tt('Kapasite, gerilim ve seri direnç girin', 'Enter capacitance, voltage and series resistance')]];
        const R = rs + rl, tau = R * C, ipkStep = V / R, i2tStep = V * V * C / (2 * R);
        // linear ramp over t_r: current settles to C·V/t_r after ≈ τ, but can never exceed the step value
        const ramp = tr > 0 && tr > 2 * tau, ipk = ramp ? Math.min(C * V / tr, ipkStep) : ipkStep, i2t = ramp ? ipk * ipk * tr : i2tStep, tEnd = ramp ? tr + 5 * tau : 5 * tau;
        const items = [[eng(ipk, 'A'), tt('Tepe inrush akımı', 'Peak inrush current'), 'big ' + (imax > 0 ? (ipk > imax ? 'bad' : 'good') : '')],
          [ramp ? tt('Yumuşak kalkış: I ≈ C·V/t_r', 'Soft start: I ≈ C·V/t_r') : tt('Ani basamak: I = V/R', 'Step: I = V/R'), tt('Sınırlayan etken', 'Limiting factor')],
          [eng(tau, 's'), tt('Zaman sabiti τ = R·C', 'Time constant τ = R·C')], [eng(tEnd, 's'), tt('Inrush süresi (≈ %99 şarj)', 'Inrush duration (≈ 99 % charged)')],
          [eng(C * V, 'C'), tt('Aktarılan yük Q = C·V', 'Charge delivered Q = C·V')], [eng(i2t, 'A²s'), tt('Inrush I²t', 'Inrush I²t'), i2tF > 0 ? (i2t > 0.3 * i2tF ? 'bad' : 'good') : ''],
          [eng(0.5 * C * V * V, 'J'), tt('Seri dirençte ısınan enerji (½CV²)', 'Energy heated in the series resistance (½CV²)')]];
        if (rl > 0) items.push([eng(0.5 * C * V * V * rl / R, 'J'), tt('Sınırlayıcıdaki enerji (darbe gücü kontrolü)', 'Energy in the limiter (check its pulse rating)')]);
        if (i2tF > 0) items.push([sig(i2t / i2tF * 100, 3) + ' %', tt('Sigorta I²t\'sinin yüzdesi (< %30 iyi)', 'Percent of the fuse I²t (< 30 % is good)'), i2t > 0.3 * i2tF ? 'bad' : 'good']);
        if (imax > 0 && ipk > imax) { items.push([eng(V / imax - rs, 'Ω'), tt('Gereken toplam sınırlayıcı direnç', 'Required limiter resistance'), 'warn'], [eng(C * V / imax, 's'), tt('Veya gereken yükselme süresi t_r', 'Or the required rise time t_r'), 'warn']); }
        return items;
      } },
    { id: 'rc', group: 'time', title: ['RC şarj / deşarj ve enerji', 'RC charge / discharge and energy'], sub: ['τ = R·C, E = ½·C·V²', 'τ = R·C, E = ½·C·V²'],
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
    { id: 'dr', group: 'rate', title: ['Gerilim derating', 'Voltage derating'], sub: ['V_anma ≥ V_tepe / katsayı', 'V_rated ≥ V_peak / factor'],
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
    { id: 'rl', group: 'rate', title: ['Ripple akımı ve elektrolitik ömür', 'Ripple current and electrolytic life'], sub: ['L = L₀·2^((T₀ − T_çekirdek)/10)', 'L = L₀·2^((T₀ − T_core)/10)'],
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
    { id: 'hu', group: 'time', title: ['Hold-up kapasitesi', 'Hold-up capacitance'], sub: ['C = 2·P·t / (η·(V₁² − V₂²))', 'C = 2·P·t / (η·(V₁² − V₂²))'],
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
    { id: 'es', group: 'val', title: ['E-serisi en yakın değer', 'Nearest E-series value'], sub: ['E6 … E96', 'E6 … E96'],
      fields: [{ id: 'v', tr: 'Hesaplanan değer', en: 'Computed value', def: '4.2', u: 'C', ud: 2 }, { id: 's', tr: 'Seri', en: 'Series', def: 'E12', sel: SEL_E }],
      compute(G) {
        const v = G.v('v'), s = G.s('s'); if (!(v > 0)) return [['—', tt('Değer girin', 'Enter a value')]];
        const r = nearestE(v, s);
        return [[eng(r.near, 'F'), tt('En yakın ' + s + ' değeri', 'Nearest ' + s + ' value'), 'big'], [sig(r.err, 3) + ' %', tt('Sapma', 'Deviation')], [eng(r.lo, 'F') + ' / ' + eng(r.hi, 'F'), tt('Alt / üst komşu', 'Lower / upper neighbour')], [ETOL[s], tt('Serinin tipik toleransı', 'Typical tolerance of the series')]];
      } },
  ],
};

/* ---- |Z|(f) plot for the impedance card: live trace of the form values, saved traces, their parallel, markers for ESR, SRF and the card frequency ---- */
const ZP = { traces: [], hidden: new Set(), par: false };
const ZP_COL = ['#2563eb', '#d97706', '#9333ea', '#dc2626', '#0891b2', '#65a30d', '#db2777', '#4b5563'];
function zOf(tr, f) { const w = 2 * Math.PI * f; return [tr.esr, w * tr.esl - 1 / (w * tr.c)]; }   // complex Z = R + jX
function zMag(tr, f) { const [r, x] = zOf(tr, f); return Math.hypot(r, x); }
function zPar(trs, f) { let gr = 0, gi = 0; for (const t of trs) { const [r, x] = zOf(t, f), d = r * r + x * x; gr += r / d; gi += -x / d; } return 1 / Math.hypot(gr, gi); }
function capZPlot(G, items) {
  const live = { c: G.v('c'), esr: G.v('esr') || 0, esl: G.v('esl') || 0, f: G.v('f') };
  const wrap = document.createElement('div'), NS = 'http://www.w3.org/2000/svg';
  const haveLive = live.c > 0, all = ZP.traces.slice(); if (haveLive) all.push(Object.assign({ live: true }, live));
  if (!all.length) return wrap;
  // frequency range: a few decades either side of every SRF (or of 1/(2π·ESR·C) when ESL = 0)
  let lo = Infinity, hi = 0;
  for (const t of all) { const f0 = t.esl > 0 ? 1 / (2 * Math.PI * Math.sqrt(t.esl * t.c)) : (t.esr > 0 ? 1 / (2 * Math.PI * t.esr * t.c) : 1e6); lo = Math.min(lo, f0 / 1e4); hi = Math.max(hi, f0 * 1e3); }
  if (live.f > 0) { lo = Math.min(lo, live.f / 10); hi = Math.max(hi, live.f * 10); }
  const fmin = Math.pow(10, Math.max(0, Math.floor(Math.log10(lo)))), fmax = Math.pow(10, Math.min(10, Math.ceil(Math.log10(hi))));
  const shown = all.filter((t, i) => t.live || !ZP.hidden.has(i)), saved = ZP.traces.filter((t, i) => !ZP.hidden.has(i));
  const curves = shown.map((t) => ({ t, fn: (f) => zMag(t, f), col: t.live ? 'var(--c)' : ZP_COL[ZP.traces.indexOf(t) % ZP_COL.length], dash: t.live ? '' : '', name: t.live ? tt('Girilen', 'Form values') : t.name }));
  if (ZP.par && saved.length > 1) curves.push({ par: true, fn: (f) => zPar(saved, f), col: 'var(--ink)', dash: '6 4', name: tt('Paralel (kayıtlı izler)', 'Parallel (saved traces)') });
  const N = 240, lf0 = Math.log10(fmin), lf1 = Math.log10(fmax), F = Array.from({ length: N + 1 }, (_, i) => Math.pow(10, lf0 + (lf1 - lf0) * i / N));
  let zlo = Infinity, zhi = 0; for (const c of curves) for (const f of F) { const z = c.fn(f); if (z > 0 && isFinite(z)) { zlo = Math.min(zlo, z); zhi = Math.max(zhi, z); } }
  const zmin = Math.pow(10, Math.floor(Math.log10(zlo) - 0.3)), zmax = Math.pow(10, Math.ceil(Math.log10(zhi) + 0.15));   // margin: the ESR floor must not sit on the axis
  const W = 640, H = 360, L = 58, R = 16, T = 26, B = 42, pw = W - L - R, ph = H - T - B;
  const X = (f) => L + (Math.log10(f) - lf0) / (lf1 - lf0) * pw, Y = (z) => T + (Math.log10(zmax) - Math.log10(z)) / (Math.log10(zmax) - Math.log10(zmin)) * ph;
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('role', 'img');
  const el = (tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; };
  el('rect', { x: L, y: T, width: pw, height: ph, fill: 'var(--card)', stroke: 'var(--line)' });
  const decF = Math.round(lf1 - lf0), decZ = Math.round(Math.log10(zmax) - Math.log10(zmin));
  for (let d = 0; d <= decF; d++) { const f = fmin * Math.pow(10, d), x = X(f); el('line', { x1: x, y1: T, x2: x, y2: T + ph, stroke: 'var(--line)' }); el('text', { x, y: T + ph + 16, 'text-anchor': 'middle' }, eng(f, 'Hz').replace(' ', '')); if (decF <= 9) for (let m = 2; m < 10; m++) { const ff = f * m; if (ff < fmax) el('line', { x1: X(ff), y1: T, x2: X(ff), y2: T + ph, stroke: 'var(--line)', 'stroke-dasharray': '2 4' }); } }
  for (let d = 0; d <= decZ; d++) { const z = zmin * Math.pow(10, d), y = Y(z); el('line', { x1: L, y1: y, x2: L + pw, y2: y, stroke: 'var(--line)' }); el('text', { x: L - 6, y: y + 4, 'text-anchor': 'end' }, eng(z, 'Ω').replace(' ', '')); }
  el('text', { x: L + pw / 2, y: H - 4, 'text-anchor': 'middle' }, tt('Frekans', 'Frequency')); el('text', { x: 14, y: T + ph / 2, transform: 'rotate(-90 14 ' + (T + ph / 2) + ')', 'text-anchor': 'middle' }, '|Z|');
  el('text', { x: L, y: 16, class: 'ttl' }, tt('Empedans – frekans (ESR, ESL ve kendinden rezonans)', 'Impedance vs frequency (ESR, ESL and self-resonance)'));
  const clamp = (z) => Math.min(Math.max(z, zmin), zmax);
  for (const c of curves) {
    const d = F.map((f, i) => (i ? 'L' : 'M') + X(f).toFixed(1) + ' ' + Y(clamp(c.fn(f))).toFixed(1)).join(' ');
    el('path', { d, fill: 'none', stroke: c.col, 'stroke-width': c.par ? 2.4 : c.t && c.t.live ? 2.6 : 1.8, 'stroke-dasharray': c.dash, 'stroke-linejoin': 'round' });
    if (c.t && c.t.esl > 0) { const f0 = 1 / (2 * Math.PI * Math.sqrt(c.t.esl * c.t.c)); if (f0 > fmin && f0 < fmax) { el('circle', { cx: X(f0), cy: Y(clamp(c.t.esr || zmin)), r: 3.5, fill: c.col }); if (c.t.live) el('text', { x: X(f0) + 8, y: Y(clamp(c.t.esr || zmin)) - 8 }, 'SRF ' + eng(f0, 'Hz')); } }
  }
  if (haveLive) { // asymptotes of the live trace: 1/ωC, ESR, ωL
    const asy = (fn, lbl, x) => { const d = F.map((f, i) => (i ? 'L' : 'M') + X(f).toFixed(1) + ' ' + Y(clamp(fn(f))).toFixed(1)).join(' '); el('path', { d, fill: 'none', stroke: 'var(--mute)', 'stroke-width': 1, 'stroke-dasharray': '3 5', opacity: 0.8 }); };
    asy((f) => 1 / (2 * Math.PI * f * live.c)); if (live.esr > 0) asy(() => live.esr); if (live.esl > 0) asy((f) => 2 * Math.PI * f * live.esl);
    if (live.f > fmin && live.f < fmax) { const z = zMag(live, live.f), x = X(live.f), y = Y(clamp(z)); el('line', { x1: x, y1: T, x2: x, y2: T + ph, stroke: 'var(--c)', 'stroke-dasharray': '4 4' }); el('circle', { cx: x, cy: y, r: 4, fill: 'var(--c)' }); el('text', { x: x + 6, y: y - 8, class: 'ttl' }, eng(live.f, 'Hz') + ' → ' + eng(z, 'Ω')); }
  }
  wrap.appendChild(svg);
  // legend (click toggles a saved trace) and tools
  const leg = document.createElement('div'); leg.className = 'plot-leg';
  curves.forEach((c) => { const sp = document.createElement('span'); const i = document.createElement('i'); i.style.background = c.col; if (c.dash) i.style.opacity = 0.7; sp.appendChild(i); sp.appendChild(document.createTextNode(c.name)); if (c.t && !c.t.live) { const idx = ZP.traces.indexOf(c.t); sp.title = tt('Gizle / göster', 'Hide / show'); sp.onclick = () => { ZP.hidden.has(idx) ? ZP.hidden.delete(idx) : ZP.hidden.add(idx); recalcAll(); }; } leg.appendChild(sp); });
  ZP.traces.forEach((t, idx) => { if (ZP.hidden.has(idx)) { const sp = document.createElement('span'); sp.className = 'off'; const i = document.createElement('i'); i.style.background = ZP_COL[idx % ZP_COL.length]; sp.appendChild(i); sp.appendChild(document.createTextNode(t.name)); sp.onclick = () => { ZP.hidden.delete(idx); recalcAll(); }; leg.appendChild(sp); } });
  wrap.appendChild(leg);
  const tools = document.createElement('div'); tools.className = 'plot-tools';
  const btn = (label, title, fn, primary) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (primary ? ' primary' : ''); b.textContent = label; b.title = title; b.onclick = fn; tools.appendChild(b); return b; };
  btn(tt('İzi kaydet', 'Keep trace'), tt('Girilen kondansatörü grafikte sabit iz olarak tutar; sonra başka değerler girip karşılaştırın', 'Keeps the entered capacitor as a fixed trace; then enter other values to compare'), () => { if (!haveLive) return; ZP.traces.push({ c: live.c, esr: live.esr, esl: live.esl, name: eng(live.c, 'F') + ' · ESR ' + eng(live.esr, 'Ω') + ' · ESL ' + eng(live.esl, 'H') }); recalcAll(); }, true);
  const pb = btn(tt('Paralel toplamı çiz', 'Plot the parallel'), tt('Kayıtlı izlerin paralel bağlantısının |Z| eğrisi', '|Z| of the saved traces connected in parallel'), () => { ZP.par = !ZP.par; recalcAll(); }); if (ZP.par) pb.classList.add('primary'); pb.disabled = ZP.traces.length < 2;
  const eb = btn(tt('Son izi sil', 'Erase last trace'), '', () => { ZP.traces.pop(); ZP.hidden.clear(); recalcAll(); }); eb.disabled = !ZP.traces.length;
  const cb = btn(tt('Tümünü temizle', 'Clear all'), '', () => { ZP.traces.length = 0; ZP.hidden.clear(); ZP.par = false; recalcAll(); }); cb.disabled = !ZP.traces.length;
  const h = document.createElement('span'); h.className = 'hint'; h.textContent = ZP.traces.length ? tt('Lejanttaki ada tıklayınca iz gizlenir.', 'Click a legend name to hide a trace.') : tt('Örnek: 100 µF elektrolitik (ESR 100 mΩ, ESL 20 nH) + 100 nF seramik (ESR 10 mΩ, ESL 1 nH) kaydedip paralelini çizin.', 'Example: keep a 100 µF electrolytic (ESR 100 mΩ, ESL 20 nH) and a 100 nF ceramic (ESR 10 mΩ, ESL 1 nH), then plot the parallel.'); tools.appendChild(h);
  wrap.appendChild(tools);
  return wrap;
}
