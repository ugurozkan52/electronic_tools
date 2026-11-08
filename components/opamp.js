/* Op-amp: parameters, types, wizard and calculators (inverting, non-inverting, comparator, hysteresis, summing, difference, integrator…). */
CMP.opamp = {
  name: ['Op-amp', 'Op-amp'],
  title: ['İşlemsel Yükselteç (Op-amp) Rehberi ve Hesaplayıcıları', 'Operational Amplifier (Op-amp) Guide and Calculators'],
  sub: ['Op-amp parametrelerini, türlerini, seçim kriterlerini; evirici, evirmeyen, karşılaştırıcı, histerezisli (Schmitt) devre ve diğer örnek hesaplayıcıları bulun.', 'Op-amp parameters, types, selection criteria; inverting, non-inverting, comparator, hysteresis (Schmitt) and other worked-example calculators.'],
  params: [
    ['Giriş ofset gerilimi (V_OS)', 'Input offset voltage (V_OS)', 'µV – mV', 'Girişler kısa devreyken çıkışı sıfırlamak için gereken fark gerilimi; kazançla çarpılarak çıkışa geçer. Hassas DC ölçümde birinci sorundur.', 'Differential voltage needed to null the output with inputs shorted; multiplied by the noise gain at the output. The first problem in precision DC measurement.', 'general 1–5 mV · precision < 100 µV · zero-drift < 5 µV'],
    ['Giriş kutuplama akımı (I_B) ve ofset akımı (I_OS)', 'Input bias current (I_B) and offset current (I_OS)', 'pA – µA', 'Giriş uçlarının çektiği akım; yüksek direnç değerlerinde ofset oluşturur. BJT girişli µA düzeyinde, JFET/CMOS girişli pA düzeyindedir.', 'Current drawn by the input pins; creates offset with large resistors. µA-level for BJT inputs, pA-level for JFET/CMOS inputs.', 'BJT 10–500 nA · JFET/CMOS 1–100 pA'],
    ['Kazanç-bant genişliği çarpımı (GBW)', 'Gain-bandwidth product (GBW)', 'Hz', 'Açık çevrim kazancın 1\'e düştüğü frekans; kapalı çevrim bant genişliği ≈ GBW / gürültü kazancı.', 'Frequency where open-loop gain falls to 1; closed-loop bandwidth ≈ GBW / noise gain.', '10 kHz … 10 GHz'],
    ['Dönme hızı (slew rate, SR)', 'Slew rate (SR)', 'V/µs', 'Çıkışın en hızlı değişim hızı; büyük sinyalde bant genişliğini sınırlar: f_FPBW = SR / (2π·V_pk).', 'Fastest rate of output change; limits large-signal bandwidth: f_FPBW = SR / (2π·V_pk).', '0.1 – 1000 V/µs'],
    ['Açık çevrim kazanç (A_OL)', 'Open-loop gain (A_OL)', 'dB', 'DC\'de kazanç; yüksek olması kapalı çevrim doğruluğunu artırır (hata ≈ 1/A_OL).', 'DC gain; higher means better closed-loop accuracy (error ≈ 1/A_OL).', '80 – 140 dB'],
    ['Ortak mod bastırma (CMRR) / besleme bastırma (PSRR)', 'Common-mode / supply rejection (CMRR / PSRR)', 'dB', 'Ortak mod gerilimi ve besleme dalgalanmasını bastırma oranı; fark yükselteçlerinde ve ölçümde önemlidir.', 'Rejection of common-mode voltage and supply ripple; important for difference amplifiers and measurement.', '60 – 140 dB'],
    ['Giriş ortak mod aralığı (V_ICM)', 'Input common-mode range (V_ICM)', 'V', 'Girişlerin çalışabildiği gerilim aralığı; bazı op-amp\'ların girişi ray\'a kadar (rail-to-rail) çalışır.', 'Voltage range the inputs can work over; some op-amps accept inputs up to the rails (rail-to-rail).', '—'],
    ['Çıkış gerilim salınımı', 'Output voltage swing', 'V', 'Çıkışın ray\'lara ne kadar yaklaşabildiği; standart op-amp\'larda ray\'dan 1–2 V uzak, rail-to-rail çıkışta 10–100 mV.', 'How close the output can get to the rails; 1–2 V away on standard op-amps, 10–100 mV on rail-to-rail outputs.', '—'],
    ['Besleme gerilimi aralığı ve tek/çift besleme', 'Supply range and single / dual supply', 'V', '1,8 V … ±18 V (özel tiplerde 100 V+). Tek beslemeli devrede sinyali yapay toprakla (V_cc/2) kaydırmak gerekir.', '1.8 V … ±18 V (100 V+ for special types). On a single supply the signal must be biased around a virtual ground (V_cc/2).', '—'],
    ['Sükunet akımı (I_Q)', 'Quiescent current (I_Q)', 'µA – mA', 'Yüksüz besleme akımı; pille çalışan devrelerde belirleyicidir. Hız ile genelde ters orantılıdır.', 'No-load supply current; decisive in battery circuits. Usually trades off against speed.', 'nano-power 0.5 µA · general 0.5 mA · fast 10 mA+'],
    ['Giriş gürültüsü (e_n, i_n)', 'Input noise (e_n, i_n)', 'nV/√Hz, pA/√Hz', 'Düşük gürültülü devrede direnç ve op-amp gürültüsü birlikte değerlendirilir; yüksek empedansta i_n, düşükte e_n baskındır.', 'In low-noise design resistor and op-amp noise are assessed together; i_n dominates at high impedance, e_n at low.', '1 – 50 nV/√Hz'],
    ['Çıkış akımı ve kapasitif yük', 'Output current and capacitive load', 'mA, pF', 'Çıkış akım sınırı; kapasitif yük (kablo, ADC girişi) kararlılığı bozabilir; seri direnç veya izolasyon gerekir.', 'Output current limit; capacitive load (cable, ADC input) can destabilise; add a series resistor or isolation.', '—'],
    ['Faz payı', 'Phase margin', '°', 'Kapalı çevrim kararlılığı; 45–60° iyi, düşük pay aşım ve salınıma yol açar.', 'Closed-loop stability; 45–60° is good, low margin causes overshoot and ringing.', '45 – 70°'],
    ['Giriş tipi', 'Input type', '—', 'BJT: düşük gürültü/ofset, yüksek I_B; JFET/CMOS: çok düşük I_B, fotodiyot ve yüksek empedans için; rail-to-rail girişte iki farklı katın geçişi (crossover) bozulma yapabilir.', 'BJT: low noise/offset, high I_B; JFET/CMOS: very low I_B, for photodiodes and high impedance; rail-to-rail inputs can show crossover distortion between two input stages.', '—'],
    ['Sıcaklık kayması (V_OS drift)', 'Offset drift (V_OS drift)', 'µV/°C', 'Ofsetin sıcaklıkla değişimi; hassas devrede kalibrasyon sıklığını belirler.', 'Change of offset with temperature; sets calibration needs in precision circuits.', '0.01 – 10 µV/°C'],
    ['Aşırı yük toparlanma / ters faz', 'Overload recovery / phase reversal', '—', 'Doymadan çıkış süresi ve aşırı giriş geriliminde çıkışın ters dönmesi; karşılaştırıcı olarak kullanımda önemli.', 'Time to leave saturation and output reversal on over-range inputs; important when used as a comparator.', '—'],
    ['Paket / güvenilirlik', 'Package / reliability', '—', 'SOT-23-5, SO-8, MSOP, DIP; tekli/ikili/dörtlü; AEC-Q100 (otomotiv); ESD dayanımı.', 'SOT-23-5, SO-8, MSOP, DIP; single/dual/quad; AEC-Q100 (automotive); ESD withstand.', '—'],
  ],
  tech: {
    title: ['Op-amp türleri', 'Op-amp types'],
    head: [['Tür', 'Type'], ['Tipik V_OS', 'Typical V_OS'], ['GBW', 'GBW'], ['Besleme', 'Supply'], ['Özellik ve tipik kullanım', 'Feature and typical use']],
    rows: [
      [['Genel amaçlı (LM358, LM324)', 'General purpose (LM358, LM324)'], '2–7 mV', '1 MHz', '3 – 32 V', ['Ucuz, tek beslemeli; çıkış ray\'a yakın (alt uç), basit devreler', 'Cheap, single-supply; output near rail (low end), simple circuits']],
      [['Hassas (OP07, OPA188)', 'Precision (OP07, OPA188)'], '10–100 µV', '0.5–2 MHz', '±3 – ±18 V', ['Düşük ofset ve drift; DC ölçme, sensör, referans tamponu', 'Low offset and drift; DC measurement, sensors, reference buffers']],
      [['Sıfır kayma / chopper (ADA4528, OPA2188)', 'Zero-drift / chopper (ADA4528, OPA2188)'], '< 5 µV', '1–5 MHz', '2.7 – 36 V', ['Çok düşük ofset ve drift; termokupl, köprü sensör, akım algılama', 'Very low offset and drift; thermocouple, bridge sensors, current sensing']],
      [['Düşük gürültülü (OPA1612, LT1028)', 'Low-noise (OPA1612, LT1028)'], '< 0.5 mV', '10–80 MHz', '±2.25 – ±18 V', ['1 nV/√Hz düzeyi; ses ön yükselteç, mikrofon, ölçme', 'About 1 nV/√Hz; audio preamp, microphone, measurement']],
      [['JFET girişli (TL072, OPA134)', 'JFET input (TL072, OPA134)'], '1–5 mV', '3–10 MHz', '±5 – ±18 V', ['Çok düşük I_B, düşük bozulma; ses, fotodiyot, yüksek empedans', 'Very low I_B, low distortion; audio, photodiode, high impedance']],
      [['CMOS rail-to-rail (MCP6002, TLV9002)', 'CMOS rail-to-rail (MCP6002, TLV9002)'], '0.1–5 mV', '1–10 MHz', '1.8 – 5.5 V', ['Düşük gerilim, ray\'a kadar giriş/çıkış; MCU/ADC arayüzü', 'Low voltage, rail-to-rail input/output; MCU/ADC interface']],
      [['Yüksek hızlı / geniş bant (OPA356, THS4031)', 'High-speed / wide-band (OPA356, THS4031)'], '0.5–5 mV', '100 MHz – 3 GHz', '±5 – ±15 V', ['Video, ADC sürücü, RF; yüksek dönme hızı', 'Video, ADC driver, RF; high slew rate']],
      [['Akım geri beslemeli (CFA)', 'Current-feedback (CFA)'], '1–5 mV', '100+ MHz (kazançtan bağımsız)', '±5 – ±15 V', ['Çok yüksek hız ve dönme hızı; Rf değeri kararlılık için kritik', 'Very high speed and slew rate; the Rf value is critical for stability']],
      [['Enstrümantasyon yükselteci (INA128, AD620)', 'Instrumentation amplifier (INA128, AD620)'], '< 100 µV', 'kazanca bağlı', '±2.3 – ±18 V', ['Tek dirençle kazanç; yüksek CMRR; köprü ve biyopotansiyel ölçme', 'Gain with one resistor; high CMRR; bridge and biopotential measurement']],
      [['Karşılaştırıcı (LM393, LM339, TLV3501)', 'Comparator (LM393, LM339, TLV3501)'], '1–5 mV', '(yayılım gecikmesi 20 ns – 1 µs)', '2 – 36 V', ['Op-amp\'tan çok daha hızlı toparlanır; açık kollektör çıkışlı (pull-up gerekir) veya push-pull', 'Recovers far faster than an op-amp; open-collector (needs pull-up) or push-pull']],
      [['Güç op-amp (LM3886, OPA541)', 'Power op-amp (LM3886, OPA541)'], '1–10 mV', '1–8 MHz', '±10 – ±40 V', ['Amper düzeyinde çıkış; ses güç yükselteci, motor, aktüatör', 'Amp-level output; audio power amplifier, motor, actuator']],
      [['Yüksek gerilim (OPA445, PA96)', 'High-voltage (OPA445, PA96)'], '1–5 mV', '1–10 MHz', '±10 – ±100 V', ['Piezo, ultrason, yüksek gerilim sürücü', 'Piezo, ultrasound, high-voltage drive']],
      [['Nano güç / düşük güç (TLV8802)', 'Nano-power / low-power (TLV8802)'], '0.5–3 mV', '1–100 kHz', '1.6 – 5.5 V', ['< 1 µA; pilli sensör, IoT', '< 1 µA; battery sensors, IoT']],
      [['Tam diferansiyel (THS4521)', 'Fully differential (THS4521)'], '0.5 mV', '100+ MHz', '2.5 – 5 V', ['ADC sürücü, diferansiyel hat sürme', 'ADC driver, differential line driving']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'gen', opts: [['gen', 'Genel yükselteç / tampon', 'General amplifier / buffer'], ['prec', 'Hassas DC ölçme (sensör, termokupl)', 'Precision DC measurement (sensor, thermocouple)'], ['audio', 'Düşük gürültü / ses ön yükselteç', 'Low-noise / audio preamplifier'], ['tia', 'Fotodiyot / TIA (yüksek empedans)', 'Photodiode / TIA (high impedance)'], ['fast', 'Yüksek hız (video, ADC sürücü)', 'High speed (video, ADC driver)'], ['rr', 'Tek beslemeli düşük gerilim (3,3 V / 5 V)', 'Single-supply low voltage (3.3 V / 5 V)'], ['cmp', 'Eşik / karşılaştırıcı', 'Threshold / comparator'], ['pwr', 'Güç / aktüatör sürücü', 'Power / actuator driver'], ['bridge', 'Köprü / fark ölçme (enstrümantasyon)', 'Bridge / differential measurement (instrumentation)']] },
      { id: 's', tr: 'Besleme', en: 'Supply', def: '5', opts: [['3', '≤ 3,6 V', '≤ 3.6 V'], ['5', '5 V tek', '5 V single'], ['d', '± 5 … ±15 V', '± 5 … ±15 V'], ['h', '> 30 V / yüksek gerilim', '> 30 V / high voltage']] },
      { id: 'bw', tr: 'Bant genişliği', en: 'Bandwidth', def: 'lf', opts: [['dc', '< 10 kHz', '< 10 kHz'], ['lf', '10 kHz – 1 MHz', '10 kHz – 1 MHz'], ['mf', '1 – 20 MHz', '1 – 20 MHz'], ['hf', '> 20 MHz', '> 20 MHz']] },
      { id: 'vos', tr: 'Ofset gereksinimi', en: 'Offset requirement', def: 'n', opts: [['n', 'Standart (> 1 mV)', 'Standard (> 1 mV)'], ['m', 'Düşük (≈ 100 µV)', 'Low (≈ 100 µV)'], ['p', 'Çok düşük (< 10 µV)', 'Very low (< 10 µV)']] },
      { id: 'env', tr: 'Ortam / pil', en: 'Environment / battery', def: 'n', opts: [['n', 'Normal', 'Normal'], ['a', 'Otomotiv (AEC-Q100)', 'Automotive (AEC-Q100)'], ['b', 'Pilli / çok düşük akım', 'Battery / very low current']] },
    ],
    run(v) {
      const R = {
        gen: [['Genel amaçlı op-amp (LM358 / TL072 / TLV9002)', 'General-purpose op-amp (LM358 / TL072 / TLV9002)'], ['Ucuz ve yeterli; kazanç ve bant genişliğini (GBW / kazanç) kontrol edin, çıkış ray\'a yaklaşamıyorsa rail-to-rail seçin.', 'Cheap and sufficient; check gain and bandwidth (GBW / gain), pick rail-to-rail if the output cannot get close to the rails.']],
        prec: [['Hassas veya sıfır-kayma (zero-drift) op-amp', 'Precision or zero-drift op-amp'], ['Düşük V_OS, düşük sıcaklık kayması ve yüksek CMRR; direnç değerlerini de düşük tutun (I_B hatası), ince film dirençler kullanın.', 'Low V_OS, low drift and high CMRR; keep resistor values low too (I_B error) and use thin-film resistors.']],
        audio: [['Düşük gürültülü ses op-amp\'ı (OPA1612, NE5532) veya JFET girişli', 'Low-noise audio op-amp (OPA1612, NE5532) or JFET-input'], ['Kaynak empedansına göre e_n/i_n dengesi; düşük bozulma (THD+N) ve yeterli GBW.', 'Balance e_n / i_n against the source impedance; low distortion (THD+N) and enough GBW.']],
        tia: [['JFET veya CMOS girişli op-amp (pA düzeyi I_B)', 'JFET- or CMOS-input op-amp (pA-level I_B)'], ['Fotodiyot kapasitansı ve R_f ile kararlılık için C_f gerekir; I_B ve V_OS tabanı belirler, düzen (guarding) kritiktir.', 'Photodiode capacitance with R_f needs a C_f for stability; I_B and V_OS set the floor and guarding is critical.']],
        fast: [['Yüksek hızlı voltaj geri beslemeli veya akım geri beslemeli op-amp', 'High-speed voltage-feedback or current-feedback op-amp'], ['GBW ≥ 10 × istenen kazanç × bant genişliği; dönme hızı (SR) tam güç bant genişliğini karşılamalı; güç kaynağı bypass ve kısa izler şart.', 'GBW ≥ 10 × gain × bandwidth; slew rate must support the full-power bandwidth; supply bypass and short traces are essential.']],
        rr: [['Rail-to-rail giriş/çıkış CMOS op-amp', 'Rail-to-rail input/output CMOS op-amp'], ['Tek beslemede girişi ve çıkışı ray\'lara yakın çalıştırır; sinyali V_cc/2 civarında kaydırın ve çıkış salınımını kontrol edin.', 'Works with inputs and outputs close to the rails on a single supply; bias the signal around V_cc/2 and check the output swing.']],
        cmp: [['Karşılaştırıcı IC (LM393, TLV3501) — op-amp değil', 'Comparator IC (LM393, TLV3501) — not an op-amp'], ['Op-amp doymadan çıkışta yavaş toparlanır ve bazı tiplerde ters faz yapar; gürültülü girişte histerezis (Schmitt) ekleyin.', 'An op-amp recovers slowly from saturation and some types phase-reverse; add hysteresis (Schmitt) on noisy inputs.']],
        pwr: [['Güç op-amp (LM3886, OPA541) veya op-amp + güç katı', 'Power op-amp (LM3886, OPA541) or op-amp + output stage'], ['Çıkış akımı, SOA ve ısı; kapasitif/endüktif yükte kararlılık için Zobel/seri direnç.', 'Output current, SOA and heat; Zobel / series resistor for stability with capacitive / inductive loads.']],
        bridge: [['Enstrümantasyon yükselteci (INA128, AD620) veya 3 op-amp\'lı yapı', 'Instrumentation amplifier (INA128, AD620) or a 3-op-amp structure'], ['Yüksek CMRR ve giriş empedansı, tek dirençle kazanç; köprü ve biyopotansiyel için uygundur.', 'High CMRR and input impedance with one-resistor gain; suited to bridges and biopotentials.']],
      }[v.app];
      const why = [R[1]];
      if (v.s === '3' && !['rr', 'cmp'].includes(v.app)) why.push(['3,6 V altı beslemede rail-to-rail ve düşük gerilimli (1,8 V) tip seçin.', 'On supplies under 3.6 V choose a rail-to-rail, low-voltage (1.8 V) type.']);
      if (v.s === 'h') why.push(['30 V üstü: yüksek gerilimli op-amp (OPA445) veya güç tipi; besleme sınırını ve güç kaybını kontrol edin.', 'Above 30 V: high-voltage op-amp (OPA445) or a power type; check the supply limit and dissipation.']);
      if (v.bw === 'hf') why.push(['20 MHz üstü: GBW ≥ 100 MHz, yüksek SR; kararlılık ve düzen kritik.', 'Above 20 MHz: GBW ≥ 100 MHz, high SR; stability and layout are critical.']);
      else if (v.bw === 'mf') why.push(['1–20 MHz: GBW ≥ 10 × (kazanç × f) olacak şekilde hesaplayın (bant genişliği hesaplayıcısı).', '1–20 MHz: size GBW ≥ 10 × (gain × f) (see the bandwidth calculator).']);
      if (v.vos === 'p') why.push(['10 µV altı ofset: zero-drift / chopper op-amp.', 'Offset under 10 µV: zero-drift / chopper op-amp.']);
      else if (v.vos === 'm') why.push(['≈ 100 µV ofset: hassas op-amp (OP07, OPA188).', 'About 100 µV offset: precision op-amp (OP07, OPA188).']);
      if (v.env === 'a') why.push(['Otomotiv: AEC-Q100 sertifikalı seri; geniş sıcaklık ve besleme aralığı.', 'Automotive: AEC-Q100 qualified series; wide temperature and supply range.']);
      if (v.env === 'b') why.push(['Pilli: sükunet akımı (I_Q) < 10–100 µA olan nano-güç op-amp\'lar.', 'Battery: nano-power op-amps with I_Q under 10–100 µA.']);
      return { main: R[0], why };
    },
  },
  calcs: [
    { id: 'inv', title: ['Evirici (inverting) yükselteç', 'Inverting amplifier'], sub: ['A_v = −R_f / R_in, Z_in ≈ R_in', 'A_v = −R_f / R_in, Z_in ≈ R_in'],
      fields: [
        { id: 'vin', tr: 'Giriş gerilimi V_in', en: 'Input voltage V_in', def: '0.5', u: 'V', ud: 1 }, { id: 'rin', tr: 'R_in', en: 'R_in', def: '10', u: 'R', ud: 2 }, { id: 'rf', tr: 'R_f', en: 'R_f', def: '47', u: 'R', ud: 2 },
        { id: 'vp', tr: 'Pozitif ray', en: 'Positive rail', def: '12', u: 'V', ud: 1 }, { id: 'vn', tr: 'Negatif ray (tek beslemede 0)', en: 'Negative rail (0 on single supply)', def: '-12', u: 'V', ud: 1 },
        { id: 'hr', tr: 'Çıkış pay (ray\'dan uzaklık)', en: 'Output headroom (from rail)', def: '1.5', u: 'V', ud: 1, help: ['Standart op-amp çıkışı ray\'a 1–2 V yaklaşabilir; rail-to-rail tiplerde 0,05–0,2 V.', 'A standard op-amp output gets within 1–2 V of the rail; 0.05–0.2 V on rail-to-rail types.'] },
        { id: 'gbw', tr: 'GBW', en: 'GBW', def: '1', u: 'F', ud: 2 },
      ],
      note: ['+ giriş toprağa bağlıdır; − giriş sanal topraktır. Kazanç işaret çevirir. Giriş empedansı R_in ile sınırlıdır.', 'The + input is grounded; the − input is a virtual ground. The gain inverts the sign. Input impedance is set by R_in.'],
      compute(G) {
        const Vin = G.v('vin'), Rin = G.v('rin'), Rf = G.v('rf'), Vp = G.v('vp'), Vn = G.v('vn'), hr = G.v('hr') || 0, gbw = G.v('gbw');
        if (!(Rin > 0 && Rf > 0)) return [['—', tt('R_in ve R_f girin', 'Enter R_in and R_f')]];
        const A = -Rf / Rin, ng = 1 + Rf / Rin, hi = Vp - hr, lo = Vn + hr, raw = A * Vin, Vo = Math.min(hi, Math.max(lo, raw)), clip = raw !== Vo;
        const items = [[sig(A, 4), tt('Kazanç A_v = −R_f/R_in', 'Gain A_v = −R_f/R_in'), 'big'], [sig(20 * Math.log10(Math.abs(A)), 3) + ' dB', tt('Kazanç (dB)', 'Gain (dB)')], [eng(Vo, 'V'), tt('Çıkış gerilimi', 'Output voltage') + (clip ? ' (' + tt('KIRPILIYOR', 'CLIPPING') + ')' : ''), clip ? 'bad' : 'good'], [eng(Rin, 'Ω'), tt('Giriş empedansı ≈ R_in', 'Input impedance ≈ R_in')], [sig(ng, 3), tt('Gürültü kazancı 1 + R_f/R_in', 'Noise gain 1 + R_f/R_in')]];
        if (gbw > 0) items.push([eng(gbw / ng, 'Hz'), tt('Bant genişliği ≈ GBW / gürültü kazancı', 'Bandwidth ≈ GBW / noise gain')]);
        items.push([eng(Math.min(Math.abs(hi / A), Math.abs(lo / A)), 'V'), tt('Kırpılmadan maks. |V_in|', 'Max |V_in| without clipping')]);
        return items;
      } },
    { id: 'nin', title: ['Evirmeyen (non-inverting) yükselteç', 'Non-inverting amplifier'], sub: ['A_v = 1 + R_f / R_1', 'A_v = 1 + R_f / R_1'],
      fields: [
        { id: 'vin', tr: 'Giriş gerilimi V_in', en: 'Input voltage V_in', def: '0.5', u: 'V', ud: 1 }, { id: 'r1', tr: 'R_1 (toprağa)', en: 'R_1 (to ground)', def: '10', u: 'R', ud: 2 }, { id: 'rf', tr: 'R_f', en: 'R_f', def: '47', u: 'R', ud: 2 },
        { id: 'vp', tr: 'Pozitif ray', en: 'Positive rail', def: '12', u: 'V', ud: 1 }, { id: 'vn', tr: 'Negatif ray (tek beslemede 0)', en: 'Negative rail (0 on single supply)', def: '-12', u: 'V', ud: 1 },
        { id: 'hr', tr: 'Çıkış pay (ray\'dan uzaklık)', en: 'Output headroom (from rail)', def: '1.5', u: 'V', ud: 1 }, { id: 'gbw', tr: 'GBW', en: 'GBW', def: '1', u: 'F', ud: 2 },
      ],
      note: ['Giriş empedansı çok yüksektir (op-amp girişi). R_f = 0, R_1 = ∞ yapılırsa gerilim izleyici (tampon, A_v = 1) elde edilir.', 'Input impedance is very high (the op-amp input). With R_f = 0 and R_1 = ∞ you get a voltage follower (buffer, A_v = 1).'],
      compute(G) {
        const Vin = G.v('vin'), R1 = G.v('r1'), Rf = G.v('rf'), Vp = G.v('vp'), Vn = G.v('vn'), hr = G.v('hr') || 0, gbw = G.v('gbw');
        if (!(R1 > 0 && Rf >= 0)) return [['—', tt('R_1 ve R_f girin', 'Enter R_1 and R_f')]];
        const A = 1 + Rf / R1, hi = Vp - hr, lo = Vn + hr, raw = A * Vin, Vo = Math.min(hi, Math.max(lo, raw)), clip = raw !== Vo;
        const items = [[sig(A, 4), tt('Kazanç A_v = 1 + R_f/R_1', 'Gain A_v = 1 + R_f/R_1'), 'big'], [sig(20 * Math.log10(A), 3) + ' dB', tt('Kazanç (dB)', 'Gain (dB)')], [eng(Vo, 'V'), tt('Çıkış gerilimi', 'Output voltage') + (clip ? ' (' + tt('KIRPILIYOR', 'CLIPPING') + ')' : ''), clip ? 'bad' : 'good'], [tt('çok yüksek', 'very high'), tt('Giriş empedansı', 'Input impedance')]];
        if (gbw > 0) items.push([eng(gbw / A, 'Hz'), tt('Bant genişliği ≈ GBW / kazanç', 'Bandwidth ≈ GBW / gain')]);
        items.push([eng(Math.min(Math.abs(hi / A), Math.abs(lo / A)), 'V'), tt('Kırpılmadan maks. |V_in|', 'Max |V_in| without clipping')]);
        return items;
      } },
    { id: 'gd', title: ['Kazanç tasarımı (direnç seçimi)', 'Gain design (resistor selection)'], sub: ['R_f = |A|·R_in  ·  R_f = (A − 1)·R_1', 'R_f = |A|·R_in  ·  R_f = (A − 1)·R_1'],
      fields: [
        { id: 'tp', tr: 'Devre', en: 'Circuit', def: 'inv', sel: [['inv', 'Evirici', 'Inverting'], ['non', 'Evirmeyen', 'Non-inverting']] },
        { id: 'g', tr: 'İstenen kazanç (mutlak)', en: 'Desired gain (absolute)', def: '10' }, { id: 'r', tr: 'R_in / R_1 (seçilen)', en: 'R_in / R_1 (chosen)', def: '10', u: 'R', ud: 2 },
      ],
      compute(G) {
        const inv = G.s('tp') === 'inv', g = G.r('g'), R = G.v('r');
        if (!(g > 0 && R > 0) || (!inv && g < 1)) return [['—', tt('Değerleri girin (evirmeyende kazanç ≥ 1)', 'Enter the values (non-inverting gain ≥ 1)')]];
        const Rf = inv ? g * R : (g - 1) * R; if (Rf <= 0) return [[eng(0, 'Ω'), tt('R_f = 0 (gerilim izleyici)', 'R_f = 0 (voltage follower)'), 'big']];
        const e = nearestE(Rf, 'E24'), Ga = inv ? e.near / R : 1 + e.near / R;
        return [[eng(Rf, 'Ω'), tt('Hesaplanan R_f', 'Calculated R_f'), 'big'], [eng(e.near, 'Ω'), tt('En yakın E24', 'Nearest E24')], [sig(Ga, 4), tt('E24 ile gerçek kazanç', 'Actual gain with E24')], [sig((Ga / g - 1) * 100, 3) + ' %', tt('Kazanç hatası', 'Gain error')]];
      } },
    { id: 'cmp', title: ['Karşılaştırıcı (açık çevrim)', 'Comparator (open loop)'], sub: ['V_out = V_OH if V_in > V_ref, else V_OL', 'V_out = V_OH if V_in > V_ref, else V_OL'],
      fields: [
        { id: 'vin', tr: 'V_in (+ giriş)', en: 'V_in (+ input)', def: '2.6', u: 'V', ud: 1 }, { id: 'vref', tr: 'V_ref (− giriş)', en: 'V_ref (− input)', def: '2.5', u: 'V', ud: 1 },
        { id: 'vp', tr: 'Pozitif ray', en: 'Positive rail', def: '5', u: 'V', ud: 1 }, { id: 'vn', tr: 'Negatif ray', en: 'Negative rail', def: '0', u: 'V', ud: 1 }, { id: 'hr', tr: 'Çıkış pay', en: 'Output headroom', def: '0.1', u: 'V', ud: 1 },
        { id: 'av', tr: 'Açık çevrim kazanç (dB)', en: 'Open-loop gain (dB)', def: '100' },
      ],
      note: ['Op-amp\'ı karşılaştırıcı olarak kullanmak yavaştır ve bazı tiplerde zararlıdır; gürültülü girişlerde titreşimi önlemek için histerezis (Schmitt) ekleyin.', 'Using an op-amp as a comparator is slow and harmful for some types; add hysteresis (Schmitt) on noisy inputs to prevent chatter.'],
      compute(G) {
        const Vin = G.v('vin'), Vref = G.v('vref'), Vp = G.v('vp'), Vn = G.v('vn'), hr = G.v('hr') || 0, A = Math.pow(10, (G.r('av') || 100) / 20);
        if (!isFinite(Vin) || !isFinite(Vref) || !isFinite(Vp)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const Voh = Vp - hr, Vol = Vn + hr, d = Vin - Vref, hi = d > 0, lin = Math.abs(d) * A < (Voh - Vol) / 2;
        return [[eng(hi ? Voh : Vol, 'V'), tt('Çıkış', 'Output') + (hi ? ' (V_OH)' : ' (V_OL)'), 'big ' + (hi ? 'good' : 'warn')], [eng(d, 'V'), tt('Fark V_in − V_ref', 'Difference V_in − V_ref')], [eng((Voh - Vol) / A, 'V'), tt('Çıkışın tam sallanması için gereken fark', 'Difference needed for full output swing')], [lin ? tt('lineer bölgede', 'in the linear region') : tt('doymada', 'saturated'), tt('Çalışma durumu', 'State')]];
      } },
    { id: 'sch', title: ['Histerezisli karşılaştırıcı (Schmitt trigger)', 'Hysteresis comparator (Schmitt trigger)'], sub: ['Evirmeyen: V_th = V_ref(1+R₁/R₂) − V_out·R₁/R₂', 'Non-inverting: V_th = V_ref(1+R₁/R₂) − V_out·R₁/R₂'],
      fields: [
        { id: 'tp', tr: 'Devre', en: 'Circuit', def: 'non', sel: [['non', 'Evirmeyen (giriş R₁ ile)', 'Non-inverting (input via R₁)'], ['inv', 'Evirici (R₁/R₂ bölücü + girişte)', 'Inverting (R₁/R₂ divider on +)']] },
        { id: 'r1', tr: 'R₁', en: 'R₁', def: '10', u: 'R', ud: 2 }, { id: 'r2', tr: 'R₂ (geri besleme)', en: 'R₂ (feedback)', def: '100', u: 'R', ud: 2 },
        { id: 'vref', tr: 'V_ref', en: 'V_ref', def: '2.5', u: 'V', ud: 1 }, { id: 'vp', tr: 'Pozitif ray', en: 'Positive rail', def: '5', u: 'V', ud: 1 }, { id: 'vn', tr: 'Negatif ray', en: 'Negative rail', def: '0', u: 'V', ud: 1 }, { id: 'hr', tr: 'Çıkış pay', en: 'Output headroom', def: '0.1', u: 'V', ud: 1 },
        { id: 'hd', tr: 'İstenen histerezis (isteğe bağlı)', en: 'Desired hysteresis (optional)', def: '', u: 'V', ud: 0, help: ['Girilirse gereken R₂/R₁ oranı hesaplanır.', 'If entered, the required R₂/R₁ ratio is computed.'] },
      ],
      note: ['Giriş yükselirken çıkış üst eşikte, düşerken alt eşikte değişir; aradaki fark gürültü bağışıklığını sağlar. Histerezis: ΔV = (V_OH − V_OL)·R₁/R₂ (evirmeyen), (V_OH − V_OL)·R₁/(R₁+R₂) (evirici).', 'The output switches at the upper threshold when the input rises and at the lower one when it falls; the gap gives noise immunity. Hysteresis: ΔV = (V_OH − V_OL)·R₁/R₂ (non-inverting), (V_OH − V_OL)·R₁/(R₁+R₂) (inverting).'],
      compute(G) {
        const non = G.s('tp') === 'non', R1 = G.v('r1'), R2 = G.v('r2'), Vr = G.v('vref'), Vp = G.v('vp'), Vn = G.v('vn'), hr = G.v('hr') || 0, hd = G.v('hd');
        if (!(R1 > 0 && R2 > 0 && isFinite(Vr) && isFinite(Vp))) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const Voh = Vp - hr, Vol = Vn + hr; let up, dn;
        if (non) { up = Vr * (1 + R1 / R2) - Vol * R1 / R2; dn = Vr * (1 + R1 / R2) - Voh * R1 / R2; } // input rising with output low / falling with output high
        else { up = (Vr * R2 + Voh * R1) / (R1 + R2); dn = (Vr * R2 + Vol * R1) / (R1 + R2); }
        const hi = Math.max(up, dn), lo = Math.min(up, dn);
        const items = [[eng(hi - lo, 'V'), tt('Histerezis ΔV', 'Hysteresis ΔV'), 'big'], [eng(hi, 'V'), tt('Üst eşik', 'Upper threshold')], [eng(lo, 'V'), tt('Alt eşik', 'Lower threshold')], [eng((hi + lo) / 2, 'V'), tt('Orta nokta', 'Centre')]];
        if (hd > 0) { const k = non ? (Voh - Vol) / hd : (Voh - Vol) / hd - 1; if (k > 0) items.push([sig(k, 4), tt('Gereken R₂/R₁ oranı', 'Required R₂/R₁ ratio'), 'good']); }
        return items;
      } },
    { id: 'sum', title: ['Toplayıcı (summing) yükselteç', 'Summing amplifier'], sub: ['V_out = −R_f·(V₁/R₁ + V₂/R₂ + V₃/R₃)', 'V_out = −R_f·(V₁/R₁ + V₂/R₂ + V₃/R₃)'],
      fields: [
        { id: 'v1', tr: 'V₁', en: 'V₁', def: '1', u: 'V', ud: 1 }, { id: 'r1', tr: 'R₁', en: 'R₁', def: '10', u: 'R', ud: 2 }, { id: 'v2', tr: 'V₂', en: 'V₂', def: '0.5', u: 'V', ud: 1 }, { id: 'r2', tr: 'R₂', en: 'R₂', def: '10', u: 'R', ud: 2 },
        { id: 'v3', tr: 'V₃ (isteğe bağlı)', en: 'V₃ (optional)', def: '', u: 'V', ud: 1 }, { id: 'r3', tr: 'R₃', en: 'R₃', def: '10', u: 'R', ud: 2 }, { id: 'rf', tr: 'R_f', en: 'R_f', def: '10', u: 'R', ud: 2 },
      ],
      compute(G) {
        const Rf = G.v('rf'); if (!(Rf > 0)) return [['—', tt('R_f girin', 'Enter R_f')]];
        let sum = 0, n = 0; const items = [];
        [['v1', 'r1'], ['v2', 'r2'], ['v3', 'r3']].forEach(([v, r], i) => { const V = G.v(v), R = G.v(r); if (isFinite(V) && R > 0) { sum += V / R; n++; items.push([sig(-Rf / R, 3), tt(`Kanal ${i + 1} kazancı −R_f/R`, `Channel ${i + 1} gain −R_f/R`)]); } });
        if (!n) return [['—', tt('En az bir giriş girin', 'Enter at least one input')]];
        return [[eng(-Rf * sum, 'V'), tt('Çıkış gerilimi', 'Output voltage'), 'big']].concat(items);
      } },
    { id: 'dif', title: ['Fark (difference) yükselteç', 'Difference amplifier'], sub: ['V_out = (R₂/R₁)·(V₂ − V₁)', 'V_out = (R₂/R₁)·(V₂ − V₁)'],
      fields: [
        { id: 'v1', tr: 'V₁ (eviren taraf)', en: 'V₁ (inverting side)', def: '1.2', u: 'V', ud: 1 }, { id: 'v2', tr: 'V₂ (evirmeyen taraf)', en: 'V₂ (non-inverting side)', def: '1.3', u: 'V', ud: 1 },
        { id: 'r1', tr: 'R₁ = R₃', en: 'R₁ = R₃', def: '10', u: 'R', ud: 2 }, { id: 'r2', tr: 'R₂ = R₄', en: 'R₂ = R₄', def: '100', u: 'R', ud: 2 }, { id: 'tol', tr: 'Direnç toleransı (%)', en: 'Resistor tolerance (%)', def: '0.1', help: ['Dirençlerin eşleşmesi CMRR\'ı belirler: CMRR ≈ (1 + R₂/R₁) / (4·tolerans).', 'Resistor matching sets the CMRR: CMRR ≈ (1 + R₂/R₁) / (4·tolerance).'] },
      ],
      note: ['R₁/R₂ oranının R₃/R₄ ile eşit olması gerekir; eşleşme bozulursa ortak mod hatası artar.', 'The R₁/R₂ ratio must equal R₃/R₄; poor matching raises the common-mode error.'],
      compute(G) {
        const V1 = G.v('v1'), V2 = G.v('v2'), R1 = G.v('r1'), R2 = G.v('r2'), tol = (G.r('tol') || 0) / 100;
        if (!(R1 > 0 && R2 > 0 && isFinite(V1) && isFinite(V2))) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const A = R2 / R1, items = [[eng(A * (V2 - V1), 'V'), tt('Çıkış gerilimi', 'Output voltage'), 'big'], [sig(A, 4), tt('Fark kazancı R₂/R₁', 'Difference gain R₂/R₁')], [eng((V1 + V2) / 2, 'V'), tt('Ortak mod gerilimi', 'Common-mode voltage')], [eng(R1 + 0, 'Ω'), tt('Her girişin empedansı ≈ R₁', 'Input impedance of each side ≈ R₁')]];
        if (tol > 0) { const cm = (1 + A) / (4 * tol); items.push([sig(20 * Math.log10(cm), 3) + ' dB', tt('Dirençle sınırlı CMRR (kötü durum)', 'Resistor-limited CMRR (worst case)')], [eng((V1 + V2) / 2 * A / cm, 'V'), tt('Ortak moddan çıkış hatası', 'Output error from common mode')]); }
        return items;
      } },
    { id: 'int', title: ['İntegratör (integrator)', 'Integrator'], sub: ['V_out(t) = −(1/RC)·∫V_in dt', 'V_out(t) = −(1/RC)·∫V_in dt'],
      fields: [
        { id: 'r', tr: 'R', en: 'R', def: '10', u: 'R', ud: 2 }, { id: 'c', tr: 'C', en: 'C', def: '100', u: 'C', ud: 1 }, { id: 'vin', tr: 'Giriş (DC adım)', en: 'Input (DC step)', def: '1', u: 'V', ud: 1 },
        { id: 't', tr: 'Süre', en: 'Time', def: '5', u: 'T', ud: 1 }, { id: 'vp', tr: 'Ray (mutlak)', en: 'Rail (absolute)', def: '12', u: 'V', ud: 1 },
      ],
      note: ['Gerçek integratörde DC kayması (ofset) ray\'a doğru sürükler; C ile paralel bir geri besleme direnci (R_f ≈ 10 × R) DC kazancını sınırlar.', 'In a real integrator offset drifts the output toward the rail; a feedback resistor in parallel with C (R_f ≈ 10 × R) limits the DC gain.'],
      compute(G) {
        const R = G.v('r'), C = G.v('c'), Vin = G.v('vin'), t = G.v('t'), Vp = G.v('vp');
        if (!(R > 0 && C > 0 && isFinite(Vin))) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const tau = R * C, slope = -Vin / tau, raw = slope * (t || 0), Vo = Math.max(-Vp, Math.min(Vp, raw));
        const items = [[eng(Vo, 'V'), tt('Çıkış (t anında)', 'Output (at time t)') + (raw !== Vo ? ' (' + tt('KIRPILIYOR', 'CLIPPING') + ')' : ''), raw !== Vo ? 'big bad' : 'big'], [eng(slope, 'V/s'), tt('Çıkış eğimi −V_in/(RC)', 'Output slope −V_in/(RC)')], [eng(tau, 's'), tt('τ = R·C', 'τ = R·C')], [eng(1 / (2 * Math.PI * tau), 'Hz'), tt('Birim kazanç frekansı 1/(2π·R·C)', 'Unity-gain frequency 1/(2π·R·C)')]];
        if (Vin !== 0 && Vp > 0) items.push([eng(Vp / Math.abs(slope), 's'), tt('Ray\'a ulaşma süresi', 'Time to reach the rail')]);
        return items;
      } },
    { id: 'bw', title: ['Bant genişliği ve dönme hızı', 'Bandwidth and slew rate'], sub: ['BW = GBW / gürültü kazancı, f_FPBW = SR / (2π·V_pk)', 'BW = GBW / noise gain, f_FPBW = SR / (2π·V_pk)'],
      fields: [{ id: 'gbw', tr: 'GBW', en: 'GBW', def: '1', u: 'F', ud: 2 }, { id: 'g', tr: 'Gürültü kazancı', en: 'Noise gain', def: '10', help: ['Evirici: 1 + R_f/R_in; evirmeyen: 1 + R_f/R_1.', 'Inverting: 1 + R_f/R_in; non-inverting: 1 + R_f/R_1.'] }, { id: 'sr', tr: 'Dönme hızı SR (V/µs)', en: 'Slew rate SR (V/µs)', def: '0.5' }, { id: 'vpk', tr: 'Çıkış tepe genliği', en: 'Output peak amplitude', def: '5', u: 'V', ud: 1 }],
      compute(G) {
        const gbw = G.v('gbw'), g = G.r('g'), sr = G.r('sr') * 1e6, vpk = G.v('vpk');
        if (!(gbw > 0 && g > 0)) return [['—', tt('GBW ve kazanç girin', 'Enter GBW and gain')]];
        const bw = gbw / g, items = [[eng(bw, 'Hz'), tt('Küçük sinyal bant genişliği', 'Small-signal bandwidth'), 'big'], [eng(0.35 / bw, 's'), tt('Yükselme süresi ≈ 0,35/BW', 'Rise time ≈ 0.35/BW')]];
        if (sr > 0 && vpk > 0) { const fp = sr / (2 * Math.PI * vpk); items.push([eng(fp, 'Hz'), tt('Tam güç bant genişliği SR/(2π·V_pk)', 'Full-power bandwidth SR/(2π·V_pk)')], [fp < bw ? tt('Dönme hızı sınırlıyor', 'Slew rate limits') : tt('Küçük sinyal BW sınırlıyor', 'Small-signal BW limits'), tt('Büyük sinyalde sınırlayıcı', 'Limiting factor for large signals'), fp < bw ? 'warn' : 'good']); }
        return items;
      } },
    { id: 'dc', title: ['DC hata (ofset ve kutuplama akımı)', 'DC error (offset and bias current)'], sub: ['V_err ≈ V_OS·(1 + R_f/R_in) + I_B·R_f', 'V_err ≈ V_OS·(1 + R_f/R_in) + I_B·R_f'],
      fields: [
        { id: 'rin', tr: 'R_in / R_1', en: 'R_in / R_1', def: '10', u: 'R', ud: 2 }, { id: 'rf', tr: 'R_f', en: 'R_f', def: '100', u: 'R', ud: 2 },
        { id: 'vos', tr: 'V_OS (mV)', en: 'V_OS (mV)', def: '1' }, { id: 'ib', tr: 'I_B (nA)', en: 'I_B (nA)', def: '50' }, { id: 'ios', tr: 'I_OS (nA)', en: 'I_OS (nA)', def: '10' },
        { id: 'comp', tr: '+ girişte telafi direnci', en: 'Compensation resistor on +', def: 'y', sel: [['y', 'Var (R_in ∥ R_f)', 'Yes (R_in ∥ R_f)'], ['n', 'Yok', 'No']] },
      ],
      note: ['+ girişe R_in ∥ R_f değerinde direnç koymak I_B etkisini I_OS düzeyine indirir (I_OS ≪ I_B). Büyük dirençlerde I_B hatası baskın olur.', 'A resistor of R_in ∥ R_f on the + input reduces the I_B effect to the I_OS level (I_OS ≪ I_B). With large resistors the I_B error dominates.'],
      compute(G) {
        const Rin = G.v('rin'), Rf = G.v('rf'), Vos = G.r('vos') * 1e-3, Ib = G.r('ib') * 1e-9, Ios = G.r('ios') * 1e-9, comp = G.s('comp') === 'y';
        if (!(Rin > 0 && Rf > 0)) return [['—', tt('Dirençleri girin', 'Enter the resistors')]];
        const ng = 1 + Rf / Rin, e1 = Vos * ng, e2 = (comp ? Ios : Ib) * Rf, tot = Math.abs(e1) + Math.abs(e2);
        return [[eng(tot, 'V'), tt('Çıkış DC hatası (en kötü toplam)', 'Output DC error (worst-case sum)'), 'big'], [eng(e1, 'V'), tt('V_OS katkısı', 'V_OS contribution')], [eng(e2, 'V'), (comp ? 'I_OS' : 'I_B') + ' ' + tt('katkısı', 'contribution')], [eng(tot / ng, 'V'), tt('Girişe indirgenmiş hata', 'Input-referred error')]];
      } },
  ],
};
