/* Inductor: parameters, technologies, wizard and calculators. */
CMP.inductor = {
  name: ['Bobin', 'Inductor'],
  title: ['Bobin (Inductor) Rehberi ve Hesaplayıcıları', 'Inductor Guide and Calculators'],
  sub: ['Bobin parametrelerini, çekirdek malzemelerini, seçim kriterlerini ve güç/RF tasarım hesaplayıcılarını bulun.', 'Inductor parameters, core materials, selection criteria and power / RF design calculators.'],
  params: [
    ['Endüktans (L)', 'Inductance (L)', 'H', 'Nominal değer; ölçüm frekansı ve akımı belirtilir (genelde 100 kHz–1 MHz, 0 A DC).', 'Nominal value; the test frequency and current are stated (usually 100 kHz–1 MHz, 0 A DC).', 'nH … mH'],
    ['Tolerans', 'Tolerance', '%', 'Güç bobinlerinde ±20 %, ±30 % yaygındır; RF bobinlerde ±2–5 %.', '±20 %, ±30 % are common for power inductors; ±2–5 % for RF inductors.', 'power ±20–30 · RF ±2–5'],
    ['Doyma akımı (I_sat)', 'Saturation current (I_sat)', 'A', 'Endüktansın belirli oranda (genelde %20–30) düştüğü DC akım. Tepe akım bu değerin altında kalmalı.', 'DC current at which inductance drops by a stated amount (usually 20–30 %). Peak current must stay below it.', 'Ipeak ≤ 0.8 × Isat'],
    ['Isınma akımı (I_rms / I_DC)', 'Heating current (I_rms / I_DC)', 'A', 'Sıcaklığın belirli miktarda (genelde 40 °C) yükseldiği akım. Bakır kaybı I²·DCR ile belirlenir.', 'Current at which temperature rises by a stated amount (usually 40 °C). Set by copper loss I²·DCR.', '—'],
    ['DC direnç (DCR)', 'DC resistance (DCR)', 'mΩ', 'Sargı direnci; bakır kaybını ve verimi belirler. Sıcaklıkla ≈ %0,39/°C artar.', 'Winding resistance; sets copper loss and efficiency. Rises about 0.39 %/°C with temperature.', 'mΩ … Ω'],
    ['Kendinden rezonans (SRF)', 'Self-resonant frequency (SRF)', 'Hz', 'Sargı kapasitansıyla oluşan rezonans; üstünde bobin kapasitif davranır. Kullanım frekansı SRF\'nin en az 3–5 kat altında olmalı.', 'Resonance with winding capacitance; above it the inductor is capacitive. Operate at least 3–5× below SRF.', '—'],
    ['Kalite faktörü (Q)', 'Quality factor (Q)', '—', 'Q = X_L/R_s; RF ve rezonans devrelerinde seçicilik ve kayıp için önemlidir.', 'Q = X_L/R_s; matters for selectivity and loss in RF and resonant circuits.', 'RF 30–100+'],
    ['Çekirdek malzemesi', 'Core material', '—', 'Ferrit (yüksek µ, sert doyma), toz demir/Sendust/Kool Mu/MPP/High Flux (yumuşak doyma), nanokristal, hava.', 'Ferrite (high µ, hard saturation), iron powder/Sendust/Kool Mu/MPP/High Flux (soft saturation), nanocrystalline, air.', '—'],
    ['Doyma karakteri', 'Saturation behaviour', '—', 'Ferrit ani, toz çekirdek yumuşak doyar; ani akım darbelerinde yumuşak doyma güvenlidir.', 'Ferrite saturates abruptly, powder cores saturate softly; soft saturation is safer for current spikes.', '—'],
    ['DC bias ile endüktans', 'Inductance vs DC bias', '% L', 'Akım arttıkça L düşer; veri sayfasındaki L–I eğrisine bakın.', 'L falls as current rises; check the L–I curve in the datasheet.', '—'],
    ['Çekirdek kaybı', 'Core loss', 'mW', 'Frekans ve akı salınımına (ΔB) bağlı histerezis/girdap kaybı; yüksek frekansta bakır kaybından büyük olabilir.', 'Hysteresis/eddy loss depending on frequency and flux swing (ΔB); can exceed copper loss at high frequency.', '—'],
    ['Ekranlama', 'Shielding', '—', 'Ekranlı bobin komşu devrelere daha az manyetik alan yayar; ekransız ucuz ve yüksek akım için büyük olabilir.', 'A shielded inductor radiates less magnetic field into nearby circuits; unshielded is cheap and can carry more current for its size.', '—'],
    ['AL değeri', 'AL value', 'nH/N²', 'Toroid/çekirdeğin endüktans katsayısı: L = AL·N².', 'Inductance factor of a core: L = AL·N².', '—'],
    ['Doyma akı yoğunluğu (B_sat)', 'Saturation flux density (B_sat)', 'T', 'Ferrit ≈ 0,3–0,5 T, toz demir/Sendust ≈ 1 T, MPP ≈ 0,7 T.', 'Ferrite ≈ 0.3–0.5 T, iron powder/Sendust ≈ 1 T, MPP ≈ 0.7 T.', '—'],
    ['Sargı kapasitansı', 'Winding capacitance', 'pF', 'SRF\'yi belirler; çok katlı sargıda daha büyüktür.', 'Determines SRF; larger in multilayer windings.', '—'],
    ['Çalışma sıcaklığı', 'Operating temperature', '°C', 'Çevre + kendi ısınması toplamı sınırı geçmemeli; ferrit Curie sıcaklığında µ\'yü kaybeder.', 'Ambient plus self-heating must not exceed the limit; ferrite loses µ at the Curie temperature.', '−40…+125 (150)'],
    ['Paket ve yükseklik', 'Package and height', 'mm', '0201…2220 çip, SMD güç bobini (4×4…12×12), radyal/eksenel, toroid.', '0201…2220 chip, SMD power inductor (4×4…12×12), radial/axial, toroid.', '—'],
    ['Güvenilirlik', 'Reliability', '—', 'AEC-Q200 (otomotiv); titreşim ve termal şokta sargı kopması, çatlak ferrit.', 'AEC-Q200 (automotive); winding breaks and cracked ferrite under vibration and thermal shock.', '—'],
  ],
  tech: {
    title: ['Bobin türleri', 'Inductor types'],
    head: [['Tür', 'Type'], ['L aralığı', 'L range'], ['I_sat', 'I_sat'], ['DCR', 'DCR'], ['Doyma', 'Saturation'], ['Ekran', 'Shield'], ['Tipik kullanım', 'Typical use']],
    rows: [
      [['Ferrit tambur (ekransız)', 'Ferrite drum (unshielded)'], '0.47 µH – 10 mH', ['orta', 'medium'], ['düşük', 'low'], ['sert (ani)', 'hard (abrupt)'], ['yok', 'none'], ['Ucuz DC/DC, filtre', 'Low-cost DC/DC, filter']],
      [['Ferrit ekranlı', 'Ferrite shielded'], '0.47 – 1000 µH', ['orta', 'medium'], ['düşük', 'low'], ['sert', 'hard'], ['var', 'yes'], ['DC/DC, EMI duyarlı', 'DC/DC, EMI-sensitive']],
      [['Kalıplı toz (metal kompozit)', 'Molded powder (metal composite)'], '0.1 – 100 µH', ['yüksek', 'high'], ['çok düşük', 'very low'], ['yumuşak', 'soft'], ['var', 'yes'], ['Yüksek akımlı POL / buck', 'High-current POL / buck']],
      [['Toroid (toz demir, Sendust, Kool Mu, MPP, High Flux)', 'Toroid (iron powder, Sendust, Kool Mu, MPP, High Flux)'], '1 µH – 10 mH', ['çok yüksek', 'very high'], ['düşük', 'low'], ['yumuşak', 'soft'], ['kendinden', 'self-shielding'], ['PFC, yüksek güç, filtre', 'PFC, high power, filtering']],
      [['Çok katmanlı çip (ferrit)', 'Multilayer chip (ferrite)'], '0.047 – 100 µH', ['düşük', 'low'], ['yüksek', 'high'], ['—', '—'], ['var', 'yes'], ['Düşük akım, yüksek frekans', 'Low current, high frequency']],
      [['İnce film çip (RF)', 'Thin-film chip (RF)'], '0.5 – 100 nH', ['düşük', 'low'], ['orta', 'medium'], ['—', '—'], ['—', '—'], ['RF uyumlama, yüksek Q', 'RF matching, high Q']],
      [['Hava çekirdekli sargı (RF)', 'Air-core wound (RF)'], '1 nH – 1 µH', ['sınırsız (doymaz)', 'unlimited (no saturation)'], ['düşük', 'low'], ['yok', 'none'], ['yok', 'none'], ['RF, yüksek akım, hassas', 'RF, high current, precision']],
      [['Ortak mod bobini (CMC)', 'Common-mode choke (CMC)'], '10 µH – 100 mH', ['orta', 'medium'], ['düşük', 'low'], ['—', '—'], ['—', '—'], ['EMI filtre (şebeke, USB, CAN)', 'EMI filter (mains, USB, CAN)']],
      [['Ferrit boncuk', 'Ferrite bead'], '(empedans 10 Ω – 2 kΩ @100 MHz)', ['orta', 'medium'], ['düşük', 'low'], ['—', '—'], ['—', '—'], ['Besleme/sinyal gürültü bastırma', 'Supply / signal noise suppression']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'buck', opts: [['buck', 'Buck / boost güç bobini', 'Buck / boost power inductor'], ['pfc', 'PFC / yüksek güç filtre', 'PFC / high-power filter'], ['emi', 'EMI filtre (ortak mod)', 'EMI filter (common mode)'], ['rf', 'RF uyumlama / rezonans', 'RF matching / resonance'], ['lc', 'LC filtre (audio / sinyal)', 'LC filter (audio / signal)'], ['bead', 'Gürültü bastırma (boncuk)', 'Noise suppression (bead)'], ['fly', 'Flyback / transformatör', 'Flyback / transformer']] },
      { id: 'i', tr: 'Akım', en: 'Current', def: 'm', opts: [['s', '< 0,5 A', '< 0.5 A'], ['m', '0,5 – 3 A', '0.5 – 3 A'], ['l', '3 – 20 A', '3 – 20 A'], ['x', '> 20 A', '> 20 A']] },
      { id: 'f', tr: 'Frekans', en: 'Frequency', def: 'sw', opts: [['lf', '< 100 kHz', '< 100 kHz'], ['sw', '100 kHz – 2 MHz', '100 kHz – 2 MHz'], ['mf', '2 – 100 MHz', '2 – 100 MHz'], ['rf', '> 100 MHz', '> 100 MHz']] },
      { id: 'env', tr: 'Ortam', en: 'Environment', def: 'n', opts: [['n', 'Normal', 'Normal'], ['a', 'Otomotiv (AEC-Q200)', 'Automotive (AEC-Q200)'], ['h', 'Sıcak (> 105 °C)', 'Hot (> 105 °C)'], ['q', 'Düşük EMI gerekli', 'Low EMI required']] },
    ],
    run(v) {
      const R = {
        buck: [['Kalıplı toz veya ferrit ekranlı güç bobini', 'Molded-powder or shielded-ferrite power inductor'], ['I_sat ≥ 1,3 × tepe akım, ısınma akımı ≥ RMS akım; DCR düşük olmalı. Hesaplayıcılar sekmesindeki buck/boost aracıyla L ve tepe akımı bulun.', 'I_sat ≥ 1.3 × peak current and heating current ≥ RMS current; keep DCR low. Use the buck/boost tool in the Calculators tab to find L and peak current.']],
        pfc: [['Toroid (Sendust / High Flux / Kool Mu) veya özel sargı', 'Toroid (Sendust / High Flux / Kool Mu) or custom winding'], ['Yüksek akıda yumuşak doyma ve düşük kayıp gerekir; çekirdek kaybı ve sıcaklık artışını hesaplayın.', 'Needs soft saturation at high flux and low loss; calculate core loss and temperature rise.']],
        emi: [['Ortak mod bobini (ve gerekirse diferansiyel mod bobini)', 'Common-mode choke (plus a differential-mode choke if needed)'], ['Hat başına nominal akım, empedans eğrisi (CM) ve doyma kontrol edilmeli; şebeke için güvenlik/izolasyon dayanımı gerekir.', 'Check rated current per line, impedance curve (CM) and saturation; mains use needs safety/insulation rating.']],
        rf: [['İnce film veya hava çekirdekli RF bobin', 'Thin-film or air-core RF inductor'], ['Yüksek Q, sıkı tolerans ve SRF kullanım frekansının çok üzerinde olmalı; düzen (layout) ve toprak kapasitansı da etkili.', 'Needs high Q, tight tolerance and SRF far above operating frequency; layout and ground capacitance also matter.']],
        lc: [['Toroid veya ekranlı ferrit bobin', 'Toroid or shielded ferrite inductor'], ['Doğrusallık ve düşük bozulma için doymayan, hava aralıklı veya toz çekirdek tercih edin.', 'For linearity and low distortion prefer non-saturating, gapped or powder cores.']],
        bead: [['Ferrit boncuk', 'Ferrite bead'], ['Bobin değil empedans bileşenidir: hedef frekansta empedans, DC bias altında kalan empedans ve DCR\'e bakın.', 'It is an impedance component, not an inductor: look at impedance at the target frequency, impedance under DC bias, and DCR.']],
        fly: [['Hava aralıklı ferrit çekirdek (özel transformatör/bobin)', 'Gapped ferrite core (custom transformer / inductor)'], ['Enerji depolama hava aralığında olur; B_sat ve çekirdek boyutuyla birlikte tasarlanır.', 'Energy is stored in the air gap; design together with B_sat and core size.']],
      }[v.app];
      const why = [R[1]];
      if (v.i === 'x') why.push(['20 A üstü: toroid veya yassı tel/özel yüksek akım bobini; kalıplı toz bobinler de bu aralıkta bulunur.', 'Above 20 A: toroid or flat-wire / special high-current inductor; molded powder inductors also exist in this range.']);
      if (v.i === 's' && v.app === 'buck') why.push(['0,5 A altı: ferrit çip veya küçük ekranlı SMD bobin yeterli olur.', 'Under 0.5 A: a ferrite chip or small shielded SMD inductor is enough.']);
      if (v.f === 'rf' && v.app !== 'bead') why.push(['100 MHz üstü: yalnızca ince film/hava çekirdekli bobin ve SRF\'ye dikkat.', 'Above 100 MHz: only thin-film / air-core inductors and mind the SRF.']);
      if (v.f === 'lf' && v.app === 'buck') why.push(['Düşük frekansta (< 100 kHz) daha büyük L gerekir; çekirdek doyma ve boyut baskın olur.', 'At low frequency (< 100 kHz) a larger L is needed; core saturation and size dominate.']);
      if (v.env === 'a') why.push(['Otomotiv: AEC-Q200 sertifikalı, sargı ve yapıştırıcı güvenilirliği kanıtlı seri seçin.', 'Automotive: pick an AEC-Q200 qualified series with proven winding and adhesive reliability.']);
      if (v.env === 'h') why.push(['Sıcak ortam: ≥ 125 °C sınıfı, yüksek Curie sıcaklıklı çekirdek; toz çekirdekler yaşlanabilir (sıcaklık sınırına bakın).', 'Hot environment: ≥ 125 °C class, high Curie temperature core; powder cores can age (check the temperature limit).']);
      if (v.env === 'q') why.push(['Düşük EMI: ekranlı (shielded) bobin ve kısa döngü alanı; toroid kendinden ekranlıdır.', 'Low EMI: shielded inductor and small loop area; toroids are self-shielding.']);
      return { main: R[0], why };
    },
  },
  calcs: [
    { id: 'bb', title: ['Buck / boost bobini seçimi', 'Buck / boost inductor selection'], sub: ['L = (Vin − Vout)·D / (f·ΔI)', 'L = (Vin − Vout)·D / (f·ΔI)'],
      fields: [
        { id: 'tp', tr: 'Topoloji', en: 'Topology', def: 'buck', sel: [['buck', 'Buck (düşüren)', 'Buck (step-down)'], ['boost', 'Boost (yükselten)', 'Boost (step-up)']] },
        { id: 'vin', tr: 'Giriş gerilimi', en: 'Input voltage', def: '12', u: 'V', ud: 1 }, { id: 'vo', tr: 'Çıkış gerilimi', en: 'Output voltage', def: '5', u: 'V', ud: 1 },
        { id: 'io', tr: 'Çıkış akımı', en: 'Output current', def: '2', u: 'A', ud: 2 }, { id: 'f', tr: 'Anahtarlama frekansı', en: 'Switching frequency', def: '500', u: 'F', ud: 1 },
        { id: 'r', tr: 'Ripple oranı (%)', en: 'Ripple ratio (%)', def: '30', help: ['Bobin akımı ripple\'ının ortalama akıma oranı; %20–40 yaygın.', 'Inductor ripple current relative to average current; 20–40 % is common.'] },
        { id: 'e', tr: 'Verimlilik (%) (boost)', en: 'Efficiency (%) (boost)', def: '90' },
      ],
      note: ['Seçilen bobinin I_sat değeri tepe akımın en az 1,2–1,3 katı olmalı; ısınma akımı RMS akımın üstünde olmalı.', 'The selected inductor\'s I_sat should be at least 1.2–1.3× the peak current; heating current should exceed the RMS current.'],
      compute(G) {
        const Vin = G.v('vin'), Vo = G.v('vo'), Io = G.v('io'), f = G.v('f'), r = (G.r('r') || 30) / 100, eta = (G.r('e') || 100) / 100, boost = G.s('tp') === 'boost';
        if (!(Vin > 0 && Vo > 0 && Io > 0 && f > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        let L, D, dI, Iavg;
        if (!boost) { if (Vo >= Vin) return [['—', tt('Buck için Vout < Vin olmalı', 'Buck needs Vout < Vin'), 'bad']]; D = Vo / Vin; Iavg = Io; dI = r * Iavg; L = (Vin - Vo) * D / (f * dI); }
        else { if (Vo <= Vin) return [['—', tt('Boost için Vout > Vin olmalı', 'Boost needs Vout > Vin'), 'bad']]; D = 1 - Vin * eta / Vo; Iavg = Io * Vo / (Vin * eta); dI = r * Iavg; L = Vin * D / (f * dI); }
        const Ipk = Iavg + dI / 2, Irms = Math.sqrt(Iavg * Iavg + dI * dI / 12), e = nearestE(L, 'E12');
        return [[eng(L, 'H'), tt('Gereken endüktans', 'Required inductance'), 'big'], [eng(e.near, 'H'), tt('En yakın E12 değeri', 'Nearest E12 value')], [sig(D * 100, 3) + ' %', tt('Görev oranı D', 'Duty cycle D')], [eng(dI, 'A'), tt('Ripple akımı ΔI (p-p)', 'Ripple current ΔI (p-p)')], [eng(Ipk, 'A'), tt('Tepe akım', 'Peak current')], [eng(Irms, 'A'), tt('RMS akım', 'RMS current')], [eng(Ipk * 1.3, 'A'), tt('Önerilen min. I_sat (×1,3)', 'Suggested min. I_sat (×1.3)')]];
      } },
    { id: 'en', title: ['Enerji, reaktans ve Q', 'Energy, reactance and Q'], sub: ['E = ½·L·I², X_L = 2π·f·L, Q = X_L/DCR', 'E = ½·L·I², X_L = 2π·f·L, Q = X_L/DCR'],
      fields: [{ id: 'l', tr: 'Endüktans', en: 'Inductance', def: '10', u: 'L', ud: 1 }, { id: 'i', tr: 'Akım', en: 'Current', def: '1', u: 'A', ud: 2 }, { id: 'f', tr: 'Frekans', en: 'Frequency', def: '100', u: 'F', ud: 1 }, { id: 'dcr', tr: 'DCR', en: 'DCR', def: '50', u: 'R', ud: 0 }],
      compute(G) {
        const L = G.v('l'), I = G.v('i'), f = G.v('f'), R = G.v('dcr');
        if (!(L > 0 && f > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const X = 2 * Math.PI * f * L, items = [[eng(X, 'Ω'), 'X_L = 2π·f·L', 'big']];
        if (I > 0) items.push([eng(0.5 * L * I * I, 'J'), tt('Depolanan enerji ½LI²', 'Stored energy ½LI²')]);
        if (R > 0) { items.push([sig(X / R, 3), tt('Q = X_L / DCR', 'Q = X_L / DCR')], [eng(L / R, 's'), tt('Zaman sabiti τ = L/R', 'Time constant τ = L/R')]); if (I > 0) items.push([eng(I * I * R, 'W'), tt('Bakır kaybı I²·DCR', 'Copper loss I²·DCR')]); }
        return items;
      } },
    { id: 'tr', title: ['Isınma ve DCR (sıcaklığa bağlı)', 'Heating and DCR (temperature dependent)'], sub: ['DCR(T) = DCR₂₀·(1 + 0,00393·(T − 20))', 'DCR(T) = DCR₂₀·(1 + 0.00393·(T − 20))'],
      fields: [{ id: 'i', tr: 'RMS akım', en: 'RMS current', def: '3', u: 'A', ud: 2 }, { id: 'dcr', tr: 'DCR (20 °C)', en: 'DCR (20 °C)', def: '20', u: 'R', ud: 0 }, { id: 'rth', tr: 'Isıl direnç (K/W)', en: 'Thermal resistance (K/W)', def: '40' }, { id: 'ta', tr: 'Ortam sıcaklığı (°C)', en: 'Ambient (°C)', def: '60' }, { id: 'tm', tr: 'Maks. sıcaklık (°C)', en: 'Max temperature (°C)', def: '125' }],
      compute(G) {
        const I = G.v('i'), R20 = G.v('dcr'), Rth = G.r('rth'), Ta = G.r('ta'), Tm = G.r('tm');
        if (!(I > 0 && R20 > 0 && Rth > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        let T = Ta, R = R20; for (let k = 0; k < 20; k++) { R = R20 * (1 + 0.00393 * (T - 20)); T = Ta + I * I * R * Rth; }
        const P = I * I * R;
        return [[sig(T, 4) + ' °C', tt('Bobin sıcaklığı', 'Inductor temperature'), 'big ' + (T > Tm ? 'bad' : T > Tm - 15 ? 'warn' : 'good')], [eng(P, 'W'), tt('Bakır kaybı', 'Copper loss')], [eng(R, 'Ω'), tt('Sıcak DCR', 'Hot DCR')], [sig(T - Ta, 3) + ' °C', tt('Sıcaklık artışı', 'Temperature rise')], [Tm > 0 ? sig(Tm - T, 3) + ' °C' : '—', tt('Sınıra kalan pay', 'Margin to the limit')]];
      } },
    { id: 'al', title: ['AL ile sarım sayısı ve doyma', 'Turns from AL and saturation'], sub: ['L = AL·N², B = L·I/(N·Ae)', 'L = AL·N², B = L·I/(N·Ae)'],
      fields: [
        { id: 'al', tr: 'AL (nH/N²)', en: 'AL (nH/N²)', def: '100' }, { id: 'l', tr: 'Hedef endüktans', en: 'Target inductance', def: '100', u: 'L', ud: 1 },
        { id: 'ae', tr: 'Etkin kesit Ae (mm²)', en: 'Effective area Ae (mm²)', def: '60' }, { id: 'i', tr: 'Tepe akım', en: 'Peak current', def: '3', u: 'A', ud: 2 }, { id: 'bs', tr: 'B_sat (T)', en: 'B_sat (T)', def: '0.3', help: ['Çekirdek malzemesinin doyma akı yoğunluğu (ferrit ≈ 0,3, Sendust ≈ 1 T).', 'Saturation flux density of the core material (ferrite ≈ 0.3, Sendust ≈ 1 T).'] },
      ],
      compute(G) {
        const AL = G.r('al') * 1e-9, L = G.v('l'), Ae = G.r('ae') * 1e-6, I = G.v('i'), Bs = G.r('bs');
        if (!(AL > 0 && L > 0)) return [['—', tt('AL ve L girin', 'Enter AL and L')]];
        const N = Math.ceil(Math.sqrt(L / AL)), La = AL * N * N, items = [[N + ' ' + tt('sarım', 'turns'), tt('Gereken sarım sayısı', 'Required number of turns'), 'big'], [eng(La, 'H'), tt('Bu sarımla gerçek L', 'Actual L with this winding')]];
        if (Ae > 0 && I > 0) { const B = La * I / (N * Ae), m = Bs > 0 ? B / Bs * 100 : NaN; items.push([sig(B * 1000, 3) + ' mT', tt('Tepe akı yoğunluğu', 'Peak flux density')], isFinite(m) ? [sig(m, 3) + ' %', tt('B_sat\'ın oranı', 'Fraction of B_sat'), m > 80 ? 'bad' : m > 60 ? 'warn' : 'good'] : ['—', '']); }
        return items;
      } },
    { id: 'ac', title: ['Hava çekirdekli bobin (Wheeler)', 'Air-core coil (Wheeler)'], sub: ['L(µH) = r²N² / (9r + 10ℓ)  [inç]', 'L(µH) = r²N² / (9r + 10ℓ)  [inch]'],
      fields: [{ id: 'd', tr: 'Sargı çapı (mm)', en: 'Coil diameter (mm)', def: '10' }, { id: 'len', tr: 'Sargı boyu (mm)', en: 'Coil length (mm)', def: '10' }, { id: 'n', tr: 'Sarım sayısı', en: 'Turns', def: '10' }],
      note: ['Tek katlı solenoid için yaklaşık formül (ℓ > 0,8·r); %1–2 doğruluk beklenir.', 'Approximate formula for a single-layer solenoid (ℓ > 0.8·r); expect 1–2 % accuracy.'],
      compute(G) {
        const r = G.r('d') / 2 / 25.4, l = G.r('len') / 25.4, N = G.r('n');
        if (!(r > 0 && l > 0 && N > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        return [[eng(r * r * N * N / (9 * r + 10 * l) * 1e-6, 'H'), tt('Endüktans', 'Inductance'), 'big']];
      } },
    { id: 'lc', title: ['LC rezonans', 'LC resonance'], sub: ['f₀ = 1/(2π√(LC)), Z₀ = √(L/C)', 'f₀ = 1/(2π√(LC)), Z₀ = √(L/C)'],
      fields: [{ id: 'l', tr: 'Endüktans', en: 'Inductance', def: '10', u: 'L', ud: 1 }, { id: 'c', tr: 'Kapasitans', en: 'Capacitance', def: '100', u: 'C', ud: 1 }],
      compute(G) {
        const L = G.v('l'), C = G.v('c'); if (!(L > 0 && C > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        return [[eng(1 / (2 * Math.PI * Math.sqrt(L * C)), 'Hz'), tt('Rezonans frekansı f₀', 'Resonant frequency f₀'), 'big'], [eng(Math.sqrt(L / C), 'Ω'), tt('Karakteristik empedans Z₀', 'Characteristic impedance Z₀')]];
      } },
    { id: 'es', title: ['E-serisi en yakın değer', 'Nearest E-series value'], sub: ['E6 … E96', 'E6 … E96'],
      fields: [{ id: 'v', tr: 'Hesaplanan değer', en: 'Computed value', def: '4.2', u: 'L', ud: 1 }, { id: 's', tr: 'Seri', en: 'Series', def: 'E12', sel: SEL_E }],
      compute(G) {
        const v = G.v('v'), s = G.s('s'); if (!(v > 0)) return [['—', tt('Değer girin', 'Enter a value')]];
        const r = nearestE(v, s);
        return [[eng(r.near, 'H'), tt('En yakın ' + s + ' değeri', 'Nearest ' + s + ' value'), 'big'], [sig(r.err, 3) + ' %', tt('Sapma', 'Deviation')], [eng(r.lo, 'H') + ' / ' + eng(r.hi, 'H'), tt('Alt / üst komşu', 'Lower / upper neighbour')], [ETOL[s], tt('Serinin tipik toleransı', 'Typical tolerance of the series')]];
      } },
  ],
};
