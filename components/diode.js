/* Diode: parameters, all diode types, wizard and calculators. */
CMP.diode = {
  name: ['Diyot', 'Diode'],
  title: ['Diyot (Diode) Rehberi ve Hesaplayıcıları', 'Diode Guide and Calculators'],
  sub: ['Tüm diyot türlerini (doğrultucu, Schottky, Zener, TVS, LED, fotodiyot, varaktör, PIN…), parametrelerini, seçim kriterlerini ve tasarım hesaplayıcılarını bulun.', 'All diode types (rectifier, Schottky, Zener, TVS, LED, photodiode, varactor, PIN…), their parameters, selection criteria and design calculators.'],
  params: [
    ['İleri yön gerilimi (V_F)', 'Forward voltage (V_F)', 'V', 'Belirtilen I_F ve sıcaklıkta iletim gerilim düşümü; kayıp P = V_F·I_F. Sıcaklıkla yaklaşık −2 mV/°C değişir (Si).', 'Conduction voltage drop at a given I_F and temperature; loss P = V_F·I_F. Changes about −2 mV/°C (Si).', 'Si 0.6–1.1 · Schottky 0.15–0.5 · SiC 1.2–1.8 · LED 1.8–3.6'],
    ['Ters tepe gerilimi (V_RRM / V_R)', 'Repetitive reverse voltage (V_RRM / V_R)', 'V', 'Sürekli ters yönde uygulanabilecek en yüksek gerilim; pratikte %20–50 pay bırakın.', 'Highest reverse voltage that can be applied; leave 20–50 % margin in practice.', '50 … 1700 V'],
    ['Ortalama ileri akım (I_F(AV))', 'Average forward current (I_F(AV))', 'A', 'Belirtilen sıcaklıkta sürekli ortalama akım; sıcaklıkla azalır (derating).', 'Continuous average current at a stated temperature; derates with temperature.', '—'],
    ['Tek darbe tepe akımı (I_FSM)', 'Surge forward current (I_FSM)', 'A', 'Genelde 8,3 ms yarım sinüs darbe dayanımı; ani akım (inrush) için önemli.', 'Usually an 8.3 ms half-sine pulse rating; important for inrush.', '—'],
    ['Ters kaçak akım (I_R)', 'Reverse leakage (I_R)', 'µA', 'V_R ve sıcaklıkta ters akım; yaklaşık her 10 °C\'de iki katına çıkar. Schottky\'de yüksektir.', 'Reverse current at V_R and temperature; roughly doubles per 10 °C. High in Schottky diodes.', '—'],
    ['Ters toparlanma süresi (t_rr) / Q_rr', 'Reverse recovery time (t_rr) / Q_rr', 'ns / nC', 'İletimden kesime geçişte taşıyıcı boşalması; anahtarlama kaybı ≈ Q_rr·V_R·f. Schottky ve SiC\'de pratikte yoktur.', 'Carrier clean-out when switching from conduction to blocking; switching loss ≈ Q_rr·V_R·f. Practically absent in Schottky and SiC.', 'standard µs · fast 150–500 ns · ultrafast 15–75 ns'],
    ['Eklem kapasitansı (C_j)', 'Junction capacitance (C_j)', 'pF', 'Yüksek frekans ve anahtarlamada önemli; ters gerilimle azalır.', 'Matters at high frequency and in switching; falls with reverse voltage.', '—'],
    ['Eklem sıcaklığı (T_j) ve ısıl direnç (R_θ)', 'Junction temperature (T_j) and thermal resistance (R_θ)', '°C, K/W', 'T_j = T_a + P·R_θJA; güvenilirlik için T_j(max)\'ın altında kalın.', 'T_j = T_a + P·R_θJA; stay below T_j(max) for reliability.', 'T_j(max) 125–175 (SiC 175+)'],
    ['Dinamik direnç (r_d)', 'Dynamic resistance (r_d)', 'Ω', 'Çalışma noktasında dV/dI; Zener ve TVS\'de kıskaç (clamp) kalitesini belirler.', 'dV/dI at the operating point; sets clamping quality in Zener and TVS diodes.', '—'],
    ['Zener gerilimi (V_Z) ve tolerans', 'Zener voltage (V_Z) and tolerance', 'V', 'Belirtilen I_ZT test akımında ters yönde gerilim; tolerans %1–10. 5–6 V civarında sıcaklık katsayısı sıfıra yakındır.', 'Reverse voltage at the test current I_ZT; tolerance 1–10 %. Near 5–6 V the temperature coefficient is close to zero.', '1.8 … 200 V'],
    ['Zener empedansı (Z_ZT) / sıcaklık katsayısı', 'Zener impedance (Z_ZT) / temperature coefficient', 'Ω, mV/°C', 'Düşük empedans iyi regülasyon demektir. 5 V altı negatif, üstü pozitif katsayılıdır.', 'Low impedance means good regulation. Below ~5 V the coefficient is negative, above positive.', '—'],
    ['Zener gücü (P_ZM)', 'Zener power (P_ZM)', 'W', 'Maks. harcanabilir güç; P = V_Z·I_Z. Sıcaklıkla azaltılır.', 'Maximum dissipation; P = V_Z·I_Z. Derated with temperature.', '0.25 … 5 W'],
    ['TVS: V_RWM, V_BR, V_C, I_PP, P_PPM', 'TVS: V_RWM, V_BR, V_C, I_PP, P_PPM', 'V, A, W', 'Çalışma gerilimi (kaçak yok), kırılma gerilimi, kıskaç gerilimi @ tepe darbe akımı, tepe darbe gücü (10/1000 µs).', 'Working voltage (no leakage), breakdown, clamping voltage @ peak pulse current, peak pulse power (10/1000 µs).', '400 W … 30 kW'],
    ['LED: dalga boyu, ışık şiddeti, açı', 'LED: wavelength, luminous intensity, angle', 'nm, mcd, °', 'Renk (dominant dalga boyu), parlaklık, görüş açısı; verim lm/W; gruplama (binning) parti farkı yaratır.', 'Colour (dominant wavelength), brightness, viewing angle; efficacy lm/W; binning causes lot variation.', '—'],
    ['Fotodiyot: duyarlılık, karanlık akım, NEP', 'Photodiode: responsivity, dark current, NEP', 'A/W, nA', 'Işık gücü başına akım, karanlık akım gürültü tabanını belirler; PIN hızlı, APD yüksek kazançlıdır.', 'Current per optical power; dark current sets the noise floor; PIN is fast, APD has gain.', '—'],
    ['Varaktör: C_j(V), oran, Q', 'Varactor: C_j(V), ratio, Q', 'pF', 'Ters gerilimle kapasitans değişimi; ayarlama oranı ve Q, VCO ve filtre performansını belirler.', 'Capacitance change with reverse voltage; tuning ratio and Q set VCO and filter performance.', 'C_j(V) = C_j0/(1 + V/V_j)^M'],
    ['PIN diyot: seri direnç r_s', 'PIN diode: series resistance r_s', 'Ω', 'İleri akımla RF direnci azalır; RF anahtar ve zayıflatıcılarda kullanılır.', 'RF resistance falls with forward current; used in RF switches and attenuators.', '—'],
    ['Paket', 'Package', '—', 'SOD-123/323, SMA/SMB/SMC, DO-41, DPAK, TO-220/247, modüller; köprü doğrultucu.', 'SOD-123/323, SMA/SMB/SMC, DO-41, DPAK, TO-220/247, modules; bridge rectifiers.', '—'],
    ['Güvenilirlik / ESD', 'Reliability / ESD', '—', 'AEC-Q101 (otomotiv); ESD dayanımı (HBM/IEC 61000-4-2), TVS/ESD koruma diyotlarında kV düzeyinde belirtilir.', 'AEC-Q101 (automotive); ESD withstand (HBM / IEC 61000-4-2) specified in kV for TVS/ESD diodes.', '—'],
  ],
  tech: {
    title: ['Diyot türleri', 'Diode types'],
    head: [['Tür', 'Type'], ['V_F / anahtar gerilim', 'V_F / key voltage'], ['Hız (t_rr)', 'Speed (t_rr)'], ['Gerilim aralığı', 'Voltage range'], ['Özellik ve tipik kullanım', 'Feature and typical use']],
    rows: [
      [['Silikon doğrultucu (1N400x)', 'Silicon rectifier (1N400x)'], '0.7–1.1 V', ['yavaş (µs)', 'slow (µs)'], '50 – 1000 V', ['Ucuz, 1–3 A; şebeke doğrultma', 'Cheap, 1–3 A; mains rectification']],
      [['Hızlı toparlanmalı (FRD)', 'Fast recovery (FRD)'], '0.9–1.3 V', '150–500 ns', '50 – 1000 V', ['SMPS ikincil, invertör', 'SMPS secondary, inverters']],
      [['Ultra hızlı (UFRD)', 'Ultrafast (UFRD)'], '0.9–1.7 V', '15–75 ns', '50 – 1200 V', ['Yüksek frekanslı SMPS, PFC', 'High-frequency SMPS, PFC']],
      [['Schottky (Si)', 'Schottky (Si)'], '0.15–0.5 V', ['≈ 0 (çoğunluk taşıyıcı)', '≈ 0 (majority carrier)'], '20 – 200 V', ['Düşük V_F; yüksek kaçak; OR-ing, ters polarite koruma, düşük gerilim SMPS', 'Low V_F; high leakage; OR-ing, reverse-polarity protection, low-voltage SMPS']],
      [['SiC Schottky', 'SiC Schottky'], '1.2–1.8 V', ['≈ 0 (yalnız kapasitif)', '≈ 0 (capacitive only)'], '600 – 1700 V', ['Yüksek sıcaklık, kayıpsız toparlanma; PFC, güneş, EV şarj', 'High temperature, zero recovery; PFC, solar, EV charging']],
      [['Küçük sinyal / anahtarlama (1N4148)', 'Small-signal / switching (1N4148)'], '0.7–1 V', '≈ 4 ns', '75 – 100 V', ['Lojik, kıskaç, sinyal', 'Logic, clamping, signal']],
      [['Germanyum', 'Germanium'], '0.2–0.4 V', ['hızlı', 'fast'], ['düşük', 'low'], ['RF dedektör, eski ses devreleri', 'RF detector, vintage audio']],
      [['Zener', 'Zener'], ['V_Z 1.8–200 V', 'V_Z 1.8–200 V'], '—', ['—', '—'], ['Ters kırılmada regülasyon; referans, kıskaç, şönt regülatör', 'Regulation in reverse breakdown; reference, clamp, shunt regulator']],
      [['Sıcaklık telafili Zener / referans', 'Temperature-compensated Zener / reference'], '≈ 6.2 V', '—', ['—', '—'], ['Çok düşük sıcaklık katsayısı; hassas referans', 'Very low temperature coefficient; precision reference']],
      [['TVS (tek ve çift yönlü)', 'TVS (uni- and bidirectional)'], ['V_BR 5–600 V', 'V_BR 5–600 V'], ['ns kıskaç', 'ns clamp'], ['5 – 600 V', '5 – 600 V'], ['400 W – 30 kW darbe; sürge ve ESD koruma', '400 W – 30 kW pulse; surge and ESD protection']],
      [['ESD koruma diyotu (düşük C)', 'ESD protection diode (low C)'], '—', ['ns', 'ns'], ['3.3 – 24 V', '3.3 – 24 V'], ['0,1–1 pF; USB, HDMI, yüksek hızlı hatlar', '0.1–1 pF; USB, HDMI, high-speed lines']],
      [['LED (görünür)', 'LED (visible)'], '1.8–3.6 V', ['ns', 'ns'], ['—', '—'], ['Gösterge, aydınlatma; akım sürücüsü gerekir', 'Indicator, lighting; needs a current driver']],
      [['IR LED / lazer diyot', 'IR LED / laser diode'], '1.2–3 V', ['ns–ps', 'ns–ps'], ['—', '—'], ['Uzaktan kumanda, optik haberleşme, LiDAR', 'Remote control, optical comms, LiDAR']],
      [['Fotodiyot (PIN / APD)', 'Photodiode (PIN / APD)'], '—', ['ns', 'ns'], ['5 – 200 V (APD)', '5 – 200 V (APD)'], ['Işık algılama, fiber optik; TIA ile kullanılır', 'Light sensing, fibre optics; used with a TIA']],
      [['Varaktör (varikap)', 'Varactor (varicap)'], '—', '—', ['2 – 30 V', '2 – 30 V'], ['Gerilimle ayarlanan kapasitans; VCO, tuner', 'Voltage-tuned capacitance; VCO, tuners']],
      [['PIN diyot', 'PIN diode'], '≈ 0.9 V', ['µs (I bölgesi)', 'µs (I region)'], ['50 – 1000 V', '50 – 1000 V'], ['Akımla ayarlı RF direnci; RF anahtar, zayıflatıcı', 'Current-controlled RF resistance; RF switch, attenuator']],
      [['Tünel (Esaki) diyot', 'Tunnel (Esaki) diode'], ['negatif direnç bölgesi', 'negative-resistance region'], ['çok hızlı', 'very fast'], ['mV düzeyi', 'mV range'], ['Mikrodalga osilatör (nadir)', 'Microwave oscillator (rare)']],
      [['Geri (backward) diyot', 'Backward diode'], '—', ['çok hızlı', 'very fast'], ['mV düzeyi', 'mV range'], ['Küçük sinyal mikrodalga dedektör', 'Small-signal microwave detector']],
      [['Basamak toparlanmalı (SRD)', 'Step-recovery (SRD)'], '—', ['ps (ani kesim)', 'ps (snap-off)'], ['—', '—'], ['Harmonik üretici, darbe şekillendirme', 'Harmonic generator, pulse shaping']],
      [['Gunn / IMPATT', 'Gunn / IMPATT'], '—', '—', ['—', '—'], ['Mikrodalga / mm-dalga kaynak', 'Microwave / mm-wave source']],
      [['Sabit akım diyodu (CRD)', 'Constant-current diode (CRD)'], '—', '—', ['10 – 100 V', '10 – 100 V'], ['2 uçlu akım regülatörü (LED, bias)', 'Two-terminal current regulator (LED, bias)']],
      [['DIAC (tetikleme diyodu)', 'DIAC (trigger diode)'], ['V_BO 28–40 V', 'V_BO 28–40 V'], ['—', '—'], ['—', '—'], ['TRIAC tetikleme, dimmer', 'TRIAC triggering, dimmers']],
      [['Çığ (avalanche) doğrultucu', 'Avalanche rectifier'], '0.9–1.3 V', ['yavaş', 'slow'], '600 – 1600 V', ['Enerji emebilir; indüktif sürgeler ve otomotiv', 'Can absorb energy; inductive spikes and automotive']],
      [['Köprü doğrultucu', 'Bridge rectifier'], ['2 × V_F', '2 × V_F'], ['yavaş', 'slow'], '50 – 1000 V', ['Tek paketlik tam dalga doğrultma', 'Full-wave rectification in one package']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'rect', opts: [['rect', 'Şebeke doğrultma (50/60 Hz)', 'Mains rectification (50/60 Hz)'], ['smps', 'SMPS çıkış doğrultucusu', 'SMPS output rectifier'], ['lowv', 'Düşük gerilim / OR-ing / ters polarite', 'Low voltage / OR-ing / reverse polarity'], ['sig', 'Sinyal / lojik / kıskaç', 'Signal / logic / clamp'], ['reg', 'Gerilim regülasyonu / referans', 'Voltage regulation / reference'], ['surge', 'Sürge ve ESD koruma', 'Surge and ESD protection'], ['led', 'Gösterge / aydınlatma (LED)', 'Indicator / lighting (LED)'], ['photo', 'Işık algılama', 'Light sensing'], ['rf', 'RF anahtar / zayıflatıcı', 'RF switch / attenuator'], ['tune', 'VCO / ayarlı devre', 'VCO / tuned circuit'], ['pfc', 'PFC / yüksek gerilim hızlı', 'PFC / high-voltage fast']] },
      { id: 'v', tr: 'Ters gerilim', en: 'Reverse voltage', def: 'm', opts: [['l', '< 30 V', '< 30 V'], ['m', '30 – 200 V', '30 – 200 V'], ['h', '200 – 600 V', '200 – 600 V'], ['x', '> 600 V', '> 600 V']] },
      { id: 'f', tr: 'Frekans', en: 'Frequency', def: 'line', opts: [['line', 'Şebeke (50/60 Hz)', 'Line (50/60 Hz)'], ['lf', '< 100 kHz', '< 100 kHz'], ['sw', '100 kHz – 1 MHz', '100 kHz – 1 MHz'], ['hf', '> 1 MHz', '> 1 MHz']] },
      { id: 'i', tr: 'Akım', en: 'Current', def: 'm', opts: [['s', '< 0,1 A', '< 0.1 A'], ['m', '0,1 – 3 A', '0.1 – 3 A'], ['l', '3 – 30 A', '3 – 30 A'], ['x', '> 30 A', '> 30 A']] },
      { id: 'env', tr: 'Ortam', en: 'Environment', def: 'n', opts: [['n', 'Normal', 'Normal'], ['a', 'Otomotiv (AEC-Q101)', 'Automotive (AEC-Q101)'], ['h', 'Sıcak (> 125 °C)', 'Hot (> 125 °C)']] },
    ],
    run(v) {
      const R = {
        rect: [['Silikon doğrultucu diyot / köprü (1N400x, 1N540x, köprü modülü)', 'Silicon rectifier diode / bridge (1N400x, 1N540x, bridge module)'], ['Şebekede yavaş diyot yeterlidir; V_RRM ≥ 2 × tepe gerilim, I_FSM ani akım için kontrol edilmeli.', 'A slow diode is enough at mains frequency; V_RRM ≥ 2 × peak voltage, check I_FSM for inrush.']],
        smps: [['Ultra hızlı diyot veya Schottky', 'Ultrafast diode or Schottky'], ['Düşük gerilimde Schottky (düşük V_F), yüksek gerilimde ultra hızlı veya SiC. Q_rr ve toparlanma kaybını hesaplayın.', 'Schottky at low voltage (low V_F); ultrafast or SiC at high voltage. Calculate Q_rr and recovery loss.']],
        lowv: [['Schottky diyot (veya ideal diyot kontrolcüsü + MOSFET)', 'Schottky diode (or ideal-diode controller + MOSFET)'], ['Düşük V_F kaybı azaltır; yüksek akımda ve sıcaklıkta kaçak akıma ve ısınmaya dikkat. Çok yüksek akımda MOSFET ile ters polarite koruması daha verimlidir.', 'Low V_F reduces loss; watch leakage and heating at high current and temperature. At very high current a MOSFET reverse-polarity protection is more efficient.']],
        sig: [['Küçük sinyal anahtarlama diyodu (1N4148 / BAV99)', 'Small-signal switching diode (1N4148 / BAV99)'], ['Hızlı (≈ 4 ns), düşük kapasitans; kıskaç ve lojik için yeterlidir.', 'Fast (≈ 4 ns), low capacitance; good for clamping and logic.']],
        reg: [['Zener diyot (veya hassas referans IC)', 'Zener diode (or precision reference IC)'], ['5–6 V civarında sıcaklık katsayısı en düşüktür; hassas referans için bir IC (TL431, referans) daha iyidir. Seri direnci ve Zener gücünü hesaplayın.', 'Temperature coefficient is lowest around 5–6 V; for precision a reference IC (TL431, voltage reference) is better. Calculate series resistor and Zener power.']],
        surge: [['TVS diyot (sürge) / düşük kapasitanslı ESD diyodu (veri hattı)', 'TVS diode (surge) / low-capacitance ESD diode (data line)'], ['V_RWM çalışma geriliminin üstünde, V_C korunan devrenin dayanımının altında olmalı; tepe darbe gücünü kontrol edin. Veri hatlarında kapasitans küçük olmalı.', 'V_RWM above the working voltage and V_C below the protected circuit\'s withstand; check peak pulse power. Keep capacitance low on data lines.']],
        led: [['LED + akım sınırlama (direnç veya sabit akım sürücü)', 'LED + current limiting (resistor or constant-current driver)'], ['Renge göre V_F ve I_F seçin; parlak aydınlatmada sabit akım sürücü; PWM ile karartma.', 'Choose V_F and I_F by colour; constant-current driver for lighting; PWM for dimming.']],
        photo: [['PIN fotodiyot (hızlı) veya APD (zayıf ışık)', 'PIN photodiode (fast) or APD (weak light)'], ['Transimpedans yükselteç (TIA) ile kullanın; karanlık akım ve kapasitans gürültü ve bant genişliğini belirler.', 'Use with a transimpedance amplifier (TIA); dark current and capacitance set noise and bandwidth.']],
        rf: [['PIN diyot', 'PIN diode'], ['Düşük kapasitans (kapalı), düşük r_s (açık); bias akımıyla zayıflatma ayarlanır.', 'Low capacitance (off), low r_s (on); attenuation is set by bias current.']],
        tune: [['Varaktör (varikap) diyot', 'Varactor (varicap) diode'], ['Ayarlama oranı, Q ve ters gerilim aralığına bakın; sinyal genliği C\'yi bozmasın diye ters bias yeterince büyük olmalı.', 'Check tuning ratio, Q and reverse-voltage range; keep reverse bias large so the signal does not modulate C.']],
        pfc: [['SiC Schottky veya ultra hızlı diyot', 'SiC Schottky or ultrafast diode'], ['Yüksek gerilimde toparlanma kaybını sıfıra yaklaştırır; yüksek frekansta verimi artırır.', 'At high voltage it brings recovery loss close to zero; improves efficiency at high frequency.']],
      }[v.app];
      const why = [R[1]];
      if (v.v === 'x' && !['surge', 'led', 'photo', 'rf', 'tune'].includes(v.app)) why.push(['600 V üstü: SiC Schottky veya yüksek gerilim hızlı diyot; seri diyot kullanıyorsanız gerilimi eşitleyin.', 'Above 600 V: SiC Schottky or high-voltage fast diode; equalise voltage if diodes are stacked in series.']);
      if (v.f === 'hf' && ['rect', 'smps'].includes(v.app)) why.push(['1 MHz üstü: Schottky veya SiC; toparlanmalı diyotlar çok kayıplı olur.', 'Above 1 MHz: Schottky or SiC; recovery diodes would be too lossy.']);
      if (v.f === 'line' && v.app === 'smps') why.push(['Şebeke frekansında hızlı diyot gerekmez; seçiminiz yüksek frekanslı SMPS ise frekansı güncelleyin.', 'A fast diode is not needed at line frequency; update the frequency if this is a high-frequency SMPS.']);
      if (v.i === 'x') why.push(['30 A üstü: TO-247 / modül; paralel diyotlarda akım paylaşımı ve soğutucu gerekir.', 'Above 30 A: TO-247 / module; parallel diodes need current sharing and a heat sink.']);
      if (v.i === 's' && ['rect', 'smps'].includes(v.app)) why.push(['0,1 A altı: küçük SOD-123 / SMA paketleri yeterlidir.', 'Under 0.1 A: small SOD-123 / SMA packages are enough.']);
      if (v.env === 'a') why.push(['Otomotiv: AEC-Q101 sertifikalı seri; load-dump için TVS veya çığ doğrultucu düşünün.', 'Automotive: AEC-Q101 qualified series; consider TVS or avalanche rectifier for load dump.']);
      if (v.env === 'h') why.push(['Sıcak ortam: Schottky kaçağı artar (ısıl kaçak riski); SiC veya silikon hızlı diyot daha güvenli.', 'Hot environment: Schottky leakage rises (thermal runaway risk); SiC or silicon fast diodes are safer.']);
      return { main: R[0], why };
    },
  },
  calcs: [
    { id: 'led', title: ['LED seri direnci', 'LED series resistor'], sub: ['R = (V_s − n·V_F) / I_F', 'R = (V_s − n·V_F) / I_F'],
      fields: [
        { id: 'vs', tr: 'Besleme gerilimi', en: 'Supply voltage', def: '5', u: 'V', ud: 1 }, { id: 'vf', tr: 'LED V_F', en: 'LED V_F', def: '2', u: 'V', ud: 1, help: ['Kırmızı ≈ 1,8–2,2 V, yeşil ≈ 2–3,3 V, mavi/beyaz ≈ 2,8–3,6 V.', 'Red ≈ 1.8–2.2 V, green ≈ 2–3.3 V, blue/white ≈ 2.8–3.6 V.'] },
        { id: 'i', tr: 'LED akımı', en: 'LED current', def: '20', u: 'A', ud: 1 }, { id: 'n', tr: 'Seri LED sayısı', en: 'LEDs in series', def: '1' },
        { id: 'd', tr: 'PWM görev oranı (%)', en: 'PWM duty (%)', def: '100', help: ['PWM ile karartmada ortalama akımı hesaplar.', 'Computes the average current when dimming with PWM.'] },
      ],
      compute(G) {
        const Vs = G.v('vs'), Vf = G.v('vf'), I = G.v('i'), n = G.r('n') || 1, d = (G.r('d') || 100) / 100;
        if (!(Vs > 0 && Vf > 0 && I > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const R = (Vs - n * Vf) / I; if (R <= 0) return [['—', tt('Besleme gerilimi LED gerilimlerinin toplamından büyük olmalı', 'Supply must exceed the total LED voltage'), 'bad']];
        const e = nearestE(R, "E24"), up = e.hi, Ia = (Vs - n * Vf) / up;
        return [[eng(R, 'Ω'), tt('Hesaplanan direnç', 'Calculated resistor'), 'big'], [eng(up, 'Ω'), tt('Standart E24 (eşit/büyük)', 'Standard E24 (equal / higher)')], [eng(Ia, 'A'), tt('Standart direnç ile LED akımı', 'LED current with the standard resistor')], [eng(Ia * Ia * up, 'W'), tt('Dirençte harcanan güç', 'Power in the resistor')], [sig(n * Vf / Vs * 100, 3) + ' %', tt('Verim (LED gerilimi / besleme)', 'Efficiency (LED voltage / supply)')], [eng(Ia * d, 'A'), tt('Ortalama akım (PWM)', 'Average current (PWM)')]];
      } },
    { id: 'zn', title: ['Zener regülatörü', 'Zener regulator'], sub: ['R_s = (V_in,min − V_Z) / (I_Z,min + I_L,max)', 'R_s = (V_in,min − V_Z) / (I_Z,min + I_L,max)'],
      fields: [
        { id: 'vmin', tr: 'Min. giriş gerilimi', en: 'Min input voltage', def: '12', u: 'V', ud: 1 }, { id: 'vmax', tr: 'Maks. giriş gerilimi', en: 'Max input voltage', def: '15', u: 'V', ud: 1 },
        { id: 'vz', tr: 'Zener gerilimi V_Z', en: 'Zener voltage V_Z', def: '5.1', u: 'V', ud: 1 }, { id: 'ilmin', tr: 'Min. yük akımı', en: 'Min load current', def: '0', u: 'A', ud: 1 },
        { id: 'ilmax', tr: 'Maks. yük akımı', en: 'Max load current', def: '20', u: 'A', ud: 1 }, { id: 'izmin', tr: 'Min. Zener akımı', en: 'Min Zener current', def: '5', u: 'A', ud: 1, help: ['Diz (knee) akımının üstünde, genelde 2–10 mA.', 'Above the knee current, typically 2–10 mA.'] },
        { id: 'pz', tr: 'Zener anma gücü', en: 'Zener rated power', def: '0.5', u: 'W', ud: 1 },
      ],
      compute(G) {
        const a = G.v('vmin'), b = G.v('vmax'), z = G.v('vz'), l0 = G.v('ilmin') || 0, l1 = G.v('ilmax'), iz = G.v('izmin'), pz = G.v('pz');
        if (!(a > z && b >= a && z > 0 && l1 >= 0 && iz > 0)) return [['—', tt('Değerleri girin (V_in,min > V_Z)', 'Enter the values (V_in,min > V_Z)')]];
        const Rs = (a - z) / (iz + l1), std = nearestE(Rs, "E24").lo;
        const izmax = (b - z) / std - l0, Pz = z * izmax, Prs = (b - z) * (b - z) / std;
        return [[eng(Rs, 'Ω'), tt('Hesaplanan seri direnç', 'Calculated series resistor'), 'big'], [eng(std, 'Ω'), tt('Standart E24 (eşit/küçük)', 'Standard E24 (equal / lower)')], [eng(izmax, 'A'), tt('Maks. Zener akımı', 'Max Zener current')], [eng(Pz, 'W'), tt('Zener gücü (en kötü durum)', 'Zener power (worst case)'), Pz > pz ? 'bad' : Pz > pz * 0.5 ? 'warn' : 'good'], [eng(Prs, 'W'), tt('Seri dirençte güç', 'Series resistor power')]];
      } },
    { id: 'pw', title: ['İletim kaybı ve eklem sıcaklığı', 'Conduction loss and junction temperature'], sub: ['P = V_F·I_F·D, T_j = T_a + P·R_θJA', 'P = V_F·I_F·D, T_j = T_a + P·R_θJA'],
      fields: [
        { id: 'i', tr: 'Ortalama ileri akım', en: 'Average forward current', def: '3', u: 'A', ud: 2 }, { id: 'vf', tr: 'V_F (o akımda)', en: 'V_F (at that current)', def: '0.45', u: 'V', ud: 1 },
        { id: 'd', tr: 'İletim oranı (%)', en: 'Conduction ratio (%)', def: '100', help: ['Akım ortalama olarak verildiyse 100 bırakın.', 'Leave at 100 if the current is already an average.'] },
        { id: 'rth', tr: 'R_θJA (K/W)', en: 'R_θJA (K/W)', def: '50' }, { id: 'ta', tr: 'Ortam (°C)', en: 'Ambient (°C)', def: '60' }, { id: 'tj', tr: 'T_j(max) (°C)', en: 'T_j(max) (°C)', def: '150' },
      ],
      compute(G) {
        const I = G.v('i'), Vf = G.v('vf'), d = (G.r('d') || 100) / 100, Rth = G.r('rth'), Ta = G.r('ta'), Tm = G.r('tj');
        if (!(I > 0 && Vf > 0 && Rth > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const P = Vf * I * d, Tj = Ta + P * Rth;
        return [[sig(Tj, 4) + ' °C', tt('Eklem sıcaklığı T_j', 'Junction temperature T_j'), 'big ' + (Tj > Tm ? 'bad' : Tj > Tm - 20 ? 'warn' : 'good')], [eng(P, 'W'), tt('İletim kaybı', 'Conduction loss')], [sig(Tm - Tj, 3) + ' °C', tt('T_j(max)\'a kalan pay', 'Margin to T_j(max)')]];
      } },
    { id: 'tv', title: ['TVS kıskaç ve darbe gücü', 'TVS clamp and pulse power'], sub: ['I_PP = (V_surge − V_BR) / (R_s + r_d)', 'I_PP = (V_surge − V_BR) / (R_s + r_d)'],
      fields: [
        { id: 'vs', tr: 'Sürge gerilimi', en: 'Surge voltage', def: '1000', u: 'V', ud: 1 }, { id: 'rs', tr: 'Kaynak empedansı', en: 'Source impedance', def: '2', u: 'R', ud: 1 },
        { id: 'vbr', tr: 'TVS V_BR (min)', en: 'TVS V_BR (min)', def: '6.4', u: 'V', ud: 1 }, { id: 'vc', tr: 'V_C (anma I_PP\'de)', en: 'V_C (at rated I_PP)', def: '10.5', u: 'V', ud: 1 },
        { id: 'ipp', tr: 'Anma I_PP', en: 'Rated I_PP', def: '38', u: 'A', ud: 2 }, { id: 'pp', tr: 'Anma P_PPM', en: 'Rated P_PPM', def: '400', u: 'W', ud: 1 },
      ],
      note: ['Doğrusal r_d modeli yaklaşıktır; P_PPM 10/1000 µs dalga içindir, kısa 8/20 µs darbelerde izin verilen güç çok daha büyüktür.', 'The linear r_d model is approximate; P_PPM refers to a 10/1000 µs wave, and much higher power is allowed for short 8/20 µs pulses.'],
      compute(G) {
        const Vs = G.v('vs'), Rs = G.v('rs'), Vbr = G.v('vbr'), Vc = G.v('vc'), Ipr = G.v('ipp'), Pp = G.v('pp');
        if (!(Vs > Vbr && Rs >= 0 && Vc > Vbr && Ipr > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const rd = (Vc - Vbr) / Ipr, Ip = (Vs - Vbr) / (Rs + rd), Vca = Vbr + rd * Ip, P = Vca * Ip;
        return [[eng(Vca, 'V'), tt('Gerçek kıskaç gerilimi', 'Actual clamping voltage'), 'big ' + (Ip > Ipr ? 'bad' : 'good')], [eng(Ip, 'A'), tt('Tepe darbe akımı', 'Peak pulse current'), Ip > Ipr ? 'bad' : ''], [eng(P, 'W'), tt('Tepe darbe gücü', 'Peak pulse power')], [Pp > 0 ? sig(P / Pp * 100, 3) + ' %' : '—', tt('Anma gücü kullanımı', 'Use of rated power'), P > Pp ? 'bad' : ''], [eng(rd, 'Ω'), tt('Dinamik direnç r_d', 'Dynamic resistance r_d')]];
      } },
    { id: 'lk', title: ['Ters kaçak akım ve sıcaklık', 'Reverse leakage vs temperature'], sub: ['I_R(T) = I_R(25)·2^((T − 25)/ΔT)', 'I_R(T) = I_R(25)·2^((T − 25)/ΔT)'],
      fields: [
        { id: 'ir', tr: 'I_R (25 °C)', en: 'I_R (25 °C)', def: '100', u: 'A', ud: 0 }, { id: 'vr', tr: 'Ters gerilim', en: 'Reverse voltage', def: '40', u: 'V', ud: 1 },
        { id: 't', tr: 'Eklem sıcaklığı (°C)', en: 'Junction temperature (°C)', def: '125' }, { id: 'dt', tr: 'Katlanma ΔT (°C)', en: 'Doubling ΔT (°C)', def: '10', help: ['Kaçak akımın iki katına çıktığı sıcaklık adımı; veri sayfası eğrisinden tahmin edin (Si ≈ 10 °C).', 'Temperature step for doubling of leakage; estimate from the datasheet curve (Si ≈ 10 °C).'] },
      ],
      note: ['Schottky diyotta yüksek sıcaklıkta kaçak × ters gerilim kaybı, ısınmayı artırır (ısıl kaçak). Veri sayfasındaki eğriyi kullanın.', 'In a Schottky diode at high temperature, leakage × reverse voltage heats the part further (thermal runaway). Use the datasheet curve.'],
      compute(G) {
        const I0 = G.v('ir'), Vr = G.v('vr'), T = G.r('t'), dt = G.r('dt') || 10;
        if (!(I0 > 0 && Vr > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const I = I0 * Math.pow(2, (T - 25) / dt);
        return [[eng(I, 'A'), tt('Tahmini kaçak akım', 'Estimated leakage current'), 'big'], [sig(I / I0, 3) + '×', tt('25 °C\'ye göre artış', 'Increase vs 25 °C')], [eng(I * Vr, 'W'), tt('Ters yönde kayıp', 'Reverse-bias loss')]];
      } },
    { id: 'rr', title: ['Ters toparlanma kaybı', 'Reverse recovery loss'], sub: ['P ≈ Q_rr·V_R·f', 'P ≈ Q_rr·V_R·f'],
      fields: [{ id: 'q', tr: 'Q_rr (nC)', en: 'Q_rr (nC)', def: '50' }, { id: 'v', tr: 'Ters gerilim', en: 'Reverse voltage', def: '400', u: 'V', ud: 1 }, { id: 'f', tr: 'Anahtarlama frekansı', en: 'Switching frequency', def: '100', u: 'F', ud: 1 }],
      compute(G) {
        const Q = G.r('q') * 1e-9, V = G.v('v'), f = G.v('f'); if (!(Q > 0 && V > 0 && f > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        return [[eng(Q * V * f, 'W'), tt('Toparlanma kaybı', 'Recovery loss'), 'big']];
      } },
  ],
};
