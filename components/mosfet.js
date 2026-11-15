/* MOSFET (N / P channel): parameters, types, wizard and calculators. */
/* ---- shared calculator bodies (N and P use the same physics; only the sign convention and wording differ) ---- */
function mosIdFields(vgs, vds, vth) {
  return [
    { id: 'vgs', tr: vgs, en: vgs, def: '5', u: 'V', ud: 1 }, { id: 'vds', tr: vds, en: vds, def: '12', u: 'V', ud: 1 },
    { id: 'vth', tr: vth, en: vth, def: '2', u: 'V', ud: 1 },
    { id: 'idr', tr: 'Referans I_D (veri sayfası eğrisi)', en: 'Reference I_D (datasheet curve)', def: '10', u: 'A', ud: 2, help: ['Transfer eğrisinden bir nokta (doymada): örn. |V_GS| = 4 V iken I_D = 10 A.', 'A point on the transfer curve (in saturation): e.g. I_D = 10 A at |V_GS| = 4 V.'] },
    { id: 'vgr', tr: 'Referans |V_GS|', en: 'Reference |V_GS|', def: '4', u: 'V', ud: 1 }, { id: 'lam', tr: 'Kanal boyu λ (1/V, isteğe bağlı)', en: 'Channel-length λ (1/V, optional)', def: '0.02' },
  ];
}
function mosIdCompute(G) {
  const Vgs = G.v('vgs'), Vds = G.v('vds'), Vth = G.v('vth'), Idr = G.v('idr'), Vgr = G.v('vgr'), lam = G.r('lam') || 0;
  if (!(Vth > 0 && Idr > 0 && Vgr > Vth && Vgs >= 0 && Vds >= 0)) return [['—', tt('Değerleri girin (V_GS,ref > V_th)', 'Enter the values (V_GS,ref > V_th)')]];
  const K = 2 * Idr / ((Vgr - Vth) * (Vgr - Vth)), Vov = Vgs - Vth;
  if (Vov <= 0) return [['≈ 0', tt('Kesim bölgesi: I_D ≈ 0 (|V_GS| eşiğin altında)', 'Cut-off: I_D ≈ 0 (|V_GS| below threshold)'), 'warn'], [eng(K, 'A/V²'), 'K']];
  const sat = Vds >= Vov, Id = sat ? K / 2 * Vov * Vov * (1 + lam * Vds) : K * (Vov * Vds - Vds * Vds / 2);
  return [[eng(Id, 'A'), tt('Drain akımı I_D', 'Drain current I_D'), 'big'], [sat ? tt('Doyma (akım kaynağı bölgesi)', 'Saturation (current-source region)') : tt('Lineer (omik) bölge', 'Linear (ohmic) region'), tt('Çalışma bölgesi', 'Operating region'), sat ? 'warn' : 'good'], [eng(K, 'A/V²'), tt('K (A/V²)', 'K (A/V²)')], [eng(K * Vov, 'S'), tt('g_m = K·(|V_GS| − |V_th|)', 'g_m = K·(|V_GS| − |V_th|)')], [eng(1 / (K * Vov), 'Ω'), tt('R_DS(on) ≈ 1/(K·V_ov) (küçük V_DS)', 'R_DS(on) ≈ 1/(K·V_ov) (small V_DS)')], [eng(Id * Vds, 'W'), tt('Güç kaybı V_DS·I_D', 'Power loss V_DS·I_D')]];
}
function mosSwFields(vgsTr, vgsEn, vgsDef) {
  return [
    { id: 'vdd', tr: 'Besleme V_dd', en: 'Supply V_dd', def: '12', u: 'V', ud: 1 }, { id: 'rl', tr: 'Yük direnci R_L', en: 'Load resistance R_L', def: '6', u: 'R', ud: 1 },
    { id: 'rds', tr: 'R_DS(on) (25 °C, sürme V_GS\'de)', en: 'R_DS(on) (25 °C, at the drive V_GS)', def: '20', u: 'R', ud: 0 }, { id: 'tc', tr: 'R_DS(on) sıcaklık katsayısı (%/°C)', en: 'R_DS(on) temperature coefficient (%/°C)', def: '0.7' },
    { id: 'tj', tr: 'Varsayılan T_j (°C)', en: 'Assumed T_j (°C)', def: '100' }, { id: 'f', tr: 'Anahtarlama frekansı', en: 'Switching frequency', def: '0', u: 'F', ud: 1, help: ['DC anahtarlamada 0 bırakın; PWM/SMPS\'te frekans girin.', 'Leave 0 for DC switching; enter the frequency for PWM / SMPS.'] },
    { id: 'tsw', tr: 'Geçiş süresi t_r + t_f (ns)', en: 'Transition time t_r + t_f (ns)', def: '50' }, { id: 'qg', tr: 'Q_g (nC)', en: 'Q_g (nC)', def: '30' }, { id: 'vgs', tr: vgsTr, en: vgsEn, def: vgsDef },
    { id: 'rth', tr: 'R_θJA (K/W)', en: 'R_θJA (K/W)', def: '50' }, { id: 'ta', tr: 'Ortam (°C)', en: 'Ambient (°C)', def: '40' }, { id: 'tjm', tr: 'T_j(max) (°C)', en: 'T_j(max) (°C)', def: '150' },
  ];
}
const mosSwNote = ['T_j tahmini, varsayılan T_j ile uyuşmuyorsa varsayımı güncelleyip tekrar hesaplayın (R_DS(on) sıcaklıkla artar). Anahtarlama kaybı ≈ ½·V·I·(t_r + t_f)·f yaklaşık bir değerdir.', 'If the estimated T_j differs from the assumed T_j, update the assumption and recompute (R_DS(on) rises with temperature). Switching loss ≈ ½·V·I·(t_r + t_f)·f is approximate.'];
function mosSwCompute(G) {
  const Vdd = G.v('vdd'), RL = G.v('rl'), R25 = G.v('rds'), tc = (G.r('tc') || 0) / 100, Tj = G.r('tj'), f = G.v('f') || 0, tsw = (G.r('tsw') || 0) * 1e-9, Qg = (G.r('qg') || 0) * 1e-9, Vgs = G.r('vgs') || 0, Rth = G.r('rth'), Ta = G.r('ta'), Tm = G.r('tjm');
  if (!(Vdd > 0 && RL > 0 && R25 > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
  const Rh = R25 * (1 + tc * (Tj - 25)), Id = Vdd / (RL + Rh), Pc = Id * Id * Rh, Psw = f > 0 ? 0.5 * Vdd * Id * tsw * f : 0, Pg = f > 0 ? Qg * Vgs * f : 0, P = Pc + Psw + Pg, Tje = Rth > 0 ? Ta + P * Rth : NaN;
  const items = [[eng(Id, 'A'), tt('Drain akımı I_D', 'Drain current I_D'), 'big'], [eng(Id * Rh, 'V'), tt('Drain–source gerilimi |V_DS|', 'Drain–source voltage |V_DS|')], [eng(Rh, 'Ω'), tt('Sıcak R_DS(on)', 'Hot R_DS(on)')], [eng(Pc, 'W'), tt('İletim kaybı I²·R_DS(on)', 'Conduction loss I²·R_DS(on)')]];
  if (f > 0) items.push([eng(Psw, 'W'), tt('Anahtarlama kaybı (yaklaşık)', 'Switching loss (approx.)')], [eng(Pg, 'W'), tt('Gate sürme kaybı', 'Gate drive loss')]);
  items.push([eng(P, 'W'), tt('Toplam kayıp', 'Total loss')]);
  if (isFinite(Tje)) items.push([sig(Tje, 4) + ' °C', tt('Tahmini T_j = T_a + P·R_θJA', 'Estimated T_j = T_a + P·R_θJA'), Tje > Tm ? 'bad' : Math.abs(Tje - Tj) > 15 ? 'warn' : 'good']);
  return items;
}
function mosRgFields(vdTr, vdEn) {
  return [
    { id: 'vd', tr: vdTr, en: vdEn, def: '12', u: 'V', ud: 1 }, { id: 'vpl', tr: 'Miller plato gerilimi (V)', en: 'Miller plateau (V)', def: '4' }, { id: 'qgd', tr: 'Q_gd (nC)', en: 'Q_gd (nC)', def: '8' },
    { id: 'tm', tr: 'İstenen Miller süresi (ns)', en: 'Desired Miller time (ns)', def: '40', help: ['Hızlı geçiş kayıpları azaltır ama EMI ve tepe (ringing) artar; genelde 20–100 ns.', 'Faster transitions cut loss but raise EMI and ringing; usually 20–100 ns.'] },
    { id: 'rd', tr: 'Sürücü çıkış direnci', en: 'Driver output resistance', def: '2', u: 'R', ud: 1 }, { id: 'imax', tr: 'Sürücü tepe akım sınırı', en: 'Driver peak current limit', def: '1', u: 'A', ud: 2 },
  ];
}
function mosRgCompute(G, pullLabel) {
  const Vd = G.v('vd'), Vpl = G.r('vpl'), Qgd = G.r('qgd') * 1e-9, t = G.r('tm') * 1e-9, Rd = G.v('rd') || 0, Imax = G.v('imax');
  if (!(Vd > Vpl && Qgd > 0 && t > 0)) return [['—', tt('Değerleri girin (V_drv > V_plato)', 'Enter the values (V_drv > V_plateau)')]];
  const Rt = (Vd - Vpl) * t / Qgd, Rg = Math.max(0, Rt - Rd), e = nearestE(Math.max(Rg, 0.1), 'E24'), Ipk = Vd / (Rg + Rd);
  return [[eng(Rg, 'Ω'), tt('Seri gate direnci R_g', 'Series gate resistor R_g'), 'big'], [eng(e.near, 'Ω'), tt('En yakın E24', 'Nearest E24')], [eng(Ipk, 'A'), tt('Tepe gate akımı', 'Peak gate current'), Imax > 0 && Ipk > Imax ? 'bad' : ''], ['10–100 kΩ', pullLabel]];
}
// n: channel, hi: high-side position
function mosGateCompute(n, hi, G) {
  const Vs = G.v('vs'), Vd = G.v('vd'), Vth = G.v('vth'), Vgm = G.v('vgm'), Qg = G.r('qg') * 1e-9, Qgd = G.r('qgd') * 1e-9, Vpl = G.r('vpl'), f = G.v('f'), Rg = G.v('rg') || 0, Rd = G.v('rd') || 0;
  if (!(Vd > 0 && Vth > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
  let vgs, msg = '', cls = 'good';
  if (n && !hi) vgs = Vd;
  else if (n && hi) { vgs = Vd - Vs; msg = tt('N-kanal yüksek taraf: source yük gerilimine yükselir; gate\'in besleme üstüne çıkması gerekir (bootstrap / şarj pompası / izole sürücü). Sürücü gerilimi olarak gate\'in GND\'ye göre ulaştığı seviyeyi girin.', 'N-channel high-side: the source rises to the load voltage; the gate must go above the supply (bootstrap / charge pump / isolated driver). Enter the level the gate reaches relative to GND as the driver voltage.'); cls = 'warn'; }
  else { vgs = Vs; }   // P high-side: gate pulled to 0 V → |V_GS| = supply
  const items = [[sig(vgs, 3) + ' V', tt('İletimde |V_GS|' + (n ? '' : ' (gate 0 V\'a çekilince)'), '|V_GS| when on' + (n ? '' : ' (gate pulled to 0 V)')), 'big ' + (vgs > Vth + 1 && vgs <= Vgm ? 'good' : vgs > Vth && vgs <= Vgm ? 'warn' : 'bad')],
    [vgs > Vgm ? tt('|V_GS(max)| AŞILIYOR', '|V_GS(max)| EXCEEDED') : vgs > Vth ? tt('Eşiğin üstünde', 'Above threshold') : tt('Eşiğin altında', 'Below threshold'), tt('Durum (tam iletim için R_DS(on)\'un verildiği V_GS gerekir)', 'Status (full conduction needs the V_GS at which R_DS(on) is specified)'), vgs > Vgm || vgs <= Vth ? 'bad' : 'warn']];
  if (msg) items.push([msg, tt('Not', 'Note'), cls]);
  if (!n) {
    // off state: the driver's high level must bring the gate back up to the supply
    const voff = Vs - Vd;
    items.push([sig(Math.max(0, voff), 3) + ' V', tt('Kapalıyken |V_GS| (sürücü yüksek seviyesinde)', '|V_GS| when off (driver at its high level)'), voff > Vth ? 'bad' : voff > Vth * 0.5 ? 'warn' : 'good']);
    if (voff > Vth * 0.5) items.push([tt('Seviye kaydırıcı gerekli', 'Level shifter needed'), tt('Sürücü gate\'i beslemeye kadar çekemiyor, MOSFET tam kapanmaz: açık kolektörlü NPN / N-MOS ile sürün (gate–source pull-up kapatır).', 'The driver cannot pull the gate up to the supply, the MOSFET never fully turns off: drive it through an open-collector NPN / N-MOS (the gate–source pull-up turns it off).'), 'warn']);
    if (Vgm > 0 && Vs > Vgm) {
      const vt = Math.min(Vgm * 0.8, 12), ratio = vt / (Vs - vt);
      items.push([tt('V_GS(max) KORUMASI', 'V_GS(max) PROTECTION'), tt('Besleme |V_GS(max)|\'ı aşıyor: gate 0 V\'a çekilemez', 'The supply exceeds |V_GS(max)|: the gate must not be pulled to 0 V'), 'bad'],
        ['R_gs : R_g,gnd = ' + sig(ratio, 3) + ' : 1', tt('Bölücü (R_gs gate–source, R_g,gnd gate–sürücü) → |V_GS| ≈ ' + sig(vt, 3) + ' V', 'Divider (R_gs gate–source, R_g,gnd gate–driver) → |V_GS| ≈ ' + sig(vt, 3) + ' V')],
        [sig(vt, 3) + ' V', tt('Alternatif: gate–source zener (sürücüye seri direnç ile)', 'Alternative: gate–source zener (with a series resistor to the driver)')]);
    }
  }
  if (Qg > 0) {
    const Rt = Rg + Rd, Ig = Rt > 0 ? Math.max(0, (Vd - Vpl)) / Rt : NaN, Vsw = Math.abs(vgs) > 0 ? Math.abs(vgs) : Vd;
    items.push([eng(Rt > 0 ? Vd / Rt : NaN, 'A'), tt('Tepe gate akımı (V/R toplam)', 'Peak gate current (V / total R)')]);
    if (f > 0) { items.push([eng(Qg * Vsw * f, 'W'), tt('Gate sürme gücü Q_g·|V_GS|·f', 'Gate drive power Q_g·|V_GS|·f')], [eng(Qg * f, 'A'), tt('Ortalama gate akımı Q_g·f', 'Average gate current Q_g·f')]); }
    if (Qgd > 0 && Ig > 0) items.push([eng(Qgd / Ig, 's'), tt('Miller süresi ≈ Q_gd / I_g (plato)', 'Miller time ≈ Q_gd / I_g (plateau)')], [eng(Qg / Ig, 's'), tt('Toplam geçiş süresi ≈ Q_g / I_g (kaba)', 'Total transition time ≈ Q_g / I_g (rough)')]);
  }
  return items;
}

CMP.mosfet = {
  name: ['MOSFET', 'MOSFET'],
  title: ['MOSFET (N / P kanal) Rehberi ve Hesaplayıcıları', 'MOSFET (N / P channel) Guide and Calculators'],
  sub: ['N ve P kanal MOSFET parametrelerini, türlerini, seçim kriterlerini; gate kontrolü, drain–source akımı ve anahtarlama kaybı hesaplayıcılarını bulun.', 'N- and P-channel MOSFET parameters, types, selection criteria; gate drive, drain–source current and switching-loss calculators.'],
  params: [
    ['Drain–source gerilimi (V_DS(max))', 'Drain–source voltage (V_DS(max))', 'V', 'Drain–source arasında dayanılan en yüksek gerilim; anahtarlamada sivri uçlar (spike) için en az %20–30 pay bırakın.', 'Highest drain–source voltage; leave at least 20–30 % margin for switching spikes.', '12 – 1700 V'],
    ['Drain akımı (I_D, I_DM)', 'Drain current (I_D, I_DM)', 'A', 'Belirtilen kasa sıcaklığında sürekli drain akımı; gerçek sınır R_DS(on) ısınması ve ısıl dirençle belirlenir. Darbe akımı (I_DM) çok daha yüksektir.', 'Continuous drain current at a stated case temperature; the real limit is set by R_DS(on) heating and thermal resistance. Pulsed current (I_DM) is much higher.', '—'],
    ['Açık direnç (R_DS(on))', 'On-resistance (R_DS(on))', 'mΩ', 'Tam iletimde drain–source direnci; V_GS\'ye ve sıcaklığa bağlı (100 °C\'de yaklaşık 1,5×). İletim kaybı P = I²·R_DS(on).', 'Drain–source resistance when fully on; depends on V_GS and temperature (about 1.5× at 100 °C). Conduction loss P = I²·R_DS(on).', '0.5 – 500 mΩ'],
    ['Kapı eşik gerilimi (V_GS(th)) ve logic-level', 'Gate threshold (V_GS(th)) and logic level', 'V', 'İletimin başladığı (genelde 250 µA) gerilim; tam iletim için çok daha yüksek V_GS gerekir. "Logic-level" MOSFET\'ler 4,5 V (bazıları 2,5 V) ile tam iletir. Seçerken R_DS(on)\'un hangi V_GS\'de verildiğine bakın.', 'Gate voltage where conduction starts (usually at 250 µA); full conduction needs a much higher V_GS. "Logic-level" MOSFETs are fully on at 4.5 V (some at 2.5 V). Check at which V_GS R_DS(on) is specified.', 'standard 2–4 V · logic-level 1–2.5 V'],
    ['Maks. kapı gerilimi (V_GS(max))', 'Max gate voltage (V_GS(max))', 'V', 'Kapı–kaynak arasında aşılmaması gereken gerilim (genelde ±20 V, bazılarında ±8–12 V); aşılırsa oksit delinir.', 'Gate–source voltage that must not be exceeded (usually ±20 V, ±8–12 V for some); exceeding it ruptures the oxide.', '±8 … ±30 V'],
    ['Kapı yükü (Q_g, Q_gs, Q_gd)', 'Gate charge (Q_g, Q_gs, Q_gd)', 'nC', 'Kapıyı sürmek için gereken yük; sürücü gücü P = Q_g·V_GS·f. Q_gd (Miller yükü) anahtarlama süresini belirler.', 'Charge needed to drive the gate; drive power P = Q_g·V_GS·f. Q_gd (Miller charge) sets switching time.', '1 – 300 nC'],
    ['Kapasitanslar (C_iss, C_oss, C_rss)', 'Capacitances (C_iss, C_oss, C_rss)', 'pF', 'Giriş, çıkış ve ters transfer (Miller) kapasitansları; anahtarlama hızı ve kaybını etkiler. C_iss = C_gs + C_gd.', 'Input, output and reverse-transfer (Miller) capacitances; affect switching speed and loss. C_iss = C_gs + C_gd.', '—'],
    ['Miller platosu', 'Miller plateau', 'V', 'Açılma sırasında V_GS\'nin sabit kaldığı (drain gerilimi düşerken) seviye; sürücü bu seviyenin üstünde olmalı.', 'The V_GS level where it stays flat while the drain voltage falls during turn-on; the driver must be above it.', '2.5 – 6 V'],
    ['Gövde diyodu', 'Body diode', 'V, ns', 'Drain–source arasında doğal diyot: V_SD ≈ 0,7–1 V, ters toparlanma t_rr / Q_rr. Senkron doğrultmada ve köprülerde önemlidir.', 'Intrinsic drain–source diode: V_SD ≈ 0.7–1 V, reverse recovery t_rr / Q_rr. Matters in synchronous rectification and bridges.', '—'],
    ['Transkondüktans (g_fs)', 'Transconductance (g_fs)', 'S', 'ΔI_D/ΔV_GS; doğrusal çalışmada kazancı ve akım paylaşımını belirler.', 'ΔI_D/ΔV_GS; sets gain and current sharing in linear operation.', '—'],
    ['Güvenli çalışma alanı (SOA) ve çığ enerjisi (E_AS)', 'Safe operating area (SOA) and avalanche energy (E_AS)', 'J', 'Doğrusal bölgede çalışmada (hot-swap, aktif yük) SOA sınırlayıcıdır; indüktif yüklerde çığ enerjisi önemlidir.', 'In linear operation (hot-swap, active load) the SOA limits you; avalanche energy matters with inductive loads.', '—'],
    ['Isıl direnç ve T_j', 'Thermal resistance and T_j', 'K/W, °C', 'T_j = T_a + P·R_θJA (kasa ile R_θJC); PCB bakır alanı ve soğutucu belirleyici. R_DS(on) sıcaklıkla arttığı için ısınma kendini besler.', 'T_j = T_a + P·R_θJA (R_θJC with a case); PCB copper area and heat sink are decisive. R_DS(on) rises with temperature, so heating feeds on itself.', 'T_j(max) 150–175 °C'],
    ['N / P kanal', 'N / P channel', '—', 'N-kanal: V_G > V_S ile iletir, düşük R_DS(on); düşük taraf için doğal. P-kanal: V_G < V_S ile iletir; üst taraf (besleme tarafı) anahtarı için pratik ama aynı alanda daha yüksek R_DS(on).', 'N-channel: conducts with V_G > V_S, lower R_DS(on); natural for low-side. P-channel: conducts with V_G < V_S; practical for a high-side switch but higher R_DS(on) for the same area.', '—'],
    ['Paket', 'Package', '—', 'SOT-23, SO-8, DPAK, D2PAK, TO-220, TO-247, PQFN/DFN (ısı pedli); paket seçimi ısı atımını ve endüktansı belirler.', 'SOT-23, SO-8, DPAK, D2PAK, TO-220, TO-247, PQFN/DFN (thermal pad); the package sets heat removal and inductance.', '—'],
    ['Güvenilirlik / ESD', 'Reliability / ESD', '—', 'AEC-Q101 (otomotiv); kapı oksidi ESD\'ye çok duyarlıdır (HBM/CDM), gate\'i açık bırakmayın.', 'AEC-Q101 (automotive); the gate oxide is very ESD-sensitive (HBM/CDM), never leave the gate floating.', '—'],
  ],
  tech: {
    title: ['MOSFET türleri', 'MOSFET types'],
    head: [['Tür', 'Type'], ['Tipik V_DS', 'Typical V_DS'], ['R_DS(on) / hız', 'R_DS(on) / speed'], ['Gate sürme', 'Gate drive'], ['Özellik ve tipik kullanım', 'Feature and typical use']],
    rows: [
      [['N-kanal (zenginleştirme)', 'N-channel (enhancement)'], '20 – 200 V', ['düşük / hızlı', 'low / fast'], '10 – 12 V', ['Düşük taraf anahtar, SMPS, motor sürücü', 'Low-side switch, SMPS, motor drive']],
      [['N-kanal logic-level', 'N-channel logic-level'], '20 – 100 V', ['düşük / hızlı', 'low / fast'], '2.5 – 5 V', ['MCU\'dan doğrudan sürülür (3,3 V / 5 V)', 'Driven straight from an MCU (3.3 V / 5 V)']],
      [['P-kanal (zenginleştirme)', 'P-channel (enhancement)'], '–20 … –100 V', ['orta / hızlı', 'medium / fast'], '–4.5 … –10 V', ['Yüksek taraf anahtar, yük anahtarı, ters polarite koruması', 'High-side switch, load switch, reverse-polarity protection']],
      [['Tüketme (depletion) modu', 'Depletion mode'], '60 – 1000 V', ['—', '—'], '0 V (normalde açık)', ['Sabit akım kaynağı, başlatma devresi', 'Constant-current source, start-up circuit']],
      [['Trench güç MOSFET', 'Trench power MOSFET'], '20 – 150 V', ['çok düşük / hızlı', 'very low / fast'], '4.5 – 10 V', ['Senkron doğrultma, DC/DC, batarya', 'Synchronous rectification, DC/DC, battery']],
      [['Süperjonksiyon (superjunction)', 'Superjunction'], '500 – 900 V', ['düşük / orta', 'low / medium'], '10 – 12 V', ['Şebeke SMPS, PFC, aydınlatma', 'Mains SMPS, PFC, lighting']],
      [['SiC MOSFET', 'SiC MOSFET'], '650 – 3300 V', ['düşük / çok hızlı', 'low / very fast'], '15 – 20 V (bazıları −4 V kapama)', ['Yüksek verim, yüksek sıcaklık; EV, güneş, sürücü', 'High efficiency, high temperature; EV, solar, drives']],
      [['GaN HEMT / FET', 'GaN HEMT / FET'], '100 – 650 V', ['çok düşük / en hızlı', 'very low / fastest'], '5 – 6 V (dar tolerans)', ['Çok yüksek frekans, yüksek yoğunluk güç dönüşümü', 'Very high frequency, high-density power conversion']],
      [['Küçük sinyal MOSFET (2N7002, BSS138)', 'Small-signal MOSFET (2N7002, BSS138)'], '20 – 60 V', ['yüksek R / hızlı', 'high R / fast'], '2.5 – 5 V', ['Seviye kaydırma, küçük yük anahtarı', 'Level shifting, small load switch']],
      [['Çift / tamamlayıcı (N+N, N+P)', 'Dual / complementary (N+N, N+P)'], '20 – 60 V', ['—', '—'], ['—', '—'], ['Yarım köprü, motor sürücü, eşleşmiş anahtar', 'Half-bridge, motor drive, matched switch']],
      [['Entegre yük anahtarı (load switch IC)', 'Integrated load switch IC'], '1.8 – 36 V', ['—', '—'], ['lojik girişli', 'logic input'], ['Akım sınırlı, soft-start; MOSFET + sürücü tek pakette', 'Current limit, soft-start; MOSFET + driver in one package']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'nlow', opts: [['nlow', 'N-MOSFET düşük taraf anahtar', 'N-MOSFET low-side switch'], ['phigh', 'P-MOSFET yüksek taraf / yük anahtarı', 'P-MOSFET high-side / load switch'], ['nhigh', 'N-MOSFET yüksek taraf (bootstrap)', 'N-MOSFET high-side (bootstrap)'], ['pwr', 'Güç anahtarı (SMPS, motor)', 'Power switch (SMPS, motor)'], ['rev', 'Ters polarite koruması', 'Reverse-polarity protection'], ['lvl', 'Seviye kaydırma / küçük yük', 'Level shifting / small load'], ['lin', 'Doğrusal / hot-swap (SOA)', 'Linear / hot-swap (SOA)']] },
      { id: 'v', tr: 'Drain gerilimi', en: 'Drain voltage', def: 'l', opts: [['l', '< 30 V', '< 30 V'], ['m', '30 – 100 V', '30 – 100 V'], ['h', '100 – 650 V', '100 – 650 V'], ['x', '> 650 V', '> 650 V']] },
      { id: 'i', tr: 'Akım', en: 'Current', def: 'm', opts: [['s', '< 0,5 A', '< 0.5 A'], ['m', '0,5 – 5 A', '0.5 – 5 A'], ['l', '5 – 30 A', '5 – 30 A'], ['x', '> 30 A', '> 30 A']] },
      { id: 'g', tr: 'Gate sürme gerilimi', en: 'Gate drive voltage', def: '5', opts: [['2', '1,8 – 2,5 V', '1.8 – 2.5 V'], ['3', '3,3 V', '3.3 V'], ['5', '5 V', '5 V'], ['10', '10 – 12 V', '10 – 12 V'], ['15', '15 – 20 V', '15 – 20 V']] },
      { id: 'f', tr: 'Anahtarlama', en: 'Switching', def: 'dc', opts: [['dc', 'DC / yavaş', 'DC / slow'], ['lf', '< 100 kHz', '< 100 kHz'], ['sw', '100 kHz – 1 MHz', '100 kHz – 1 MHz'], ['hf', '> 1 MHz', '> 1 MHz']] },
      { id: 'env', tr: 'Ortam', en: 'Environment', def: 'n', opts: [['n', 'Normal', 'Normal'], ['a', 'Otomotiv (AEC-Q101)', 'Automotive (AEC-Q101)'], ['h', 'Sıcak (> 125 °C)', 'Hot (> 125 °C)']] },
    ],
    run(v) {
      const R = {
        nlow: [['N-kanal MOSFET (logic-level, sürme gerilimine uygun)', 'N-channel MOSFET (logic-level, matched to the drive voltage)'], ['Source GND\'de, drain yüke. R_DS(on)\'un sürme gerilimde (V_GS) belirtildiğini doğrulayın; gate–source arasına 10–100 kΩ çekme ve seri gate direnci ekleyin.', 'Source on GND, drain to the load. Verify that R_DS(on) is specified at your drive voltage (V_GS); add a 10–100 kΩ gate–source pull-down and a series gate resistor.']],
        phigh: [['P-kanal MOSFET (yük anahtarı)', 'P-channel MOSFET (load switch)'], ['Source + beslemede; gate GND\'ye çekilince iletir (V_GS = −V_besleme). Besleme V_GS(max)\'ı aşıyorsa gate\'i bölücü/zener ile sınırlayın; kapatmak için gate\'i besleme gerilimine çekin (küçük N-MOSFET ile).', 'Source on the positive supply; conducts when the gate is pulled toward GND (V_GS = −V_supply). If the supply exceeds V_GS(max), limit the gate with a divider/zener; to turn off pull the gate to the supply (with a small N-MOSFET).']],
        nhigh: [['N-MOSFET + gate sürücü (bootstrap / şarj pompası / izole)', 'N-MOSFET + gate driver (bootstrap / charge pump / isolated)'], ['Üst tarafta source yüke bağlıdır; iletim için V_G ≈ V_besleme + V_GS gerekir, bu yüzden besleme üstü bir sürücü gerekir (IR2110, bootstrap diyodu). Düşük R_DS(on) avantajı korunur.', 'On the high side the source sits on the load; conduction needs V_G ≈ V_supply + V_GS, hence a driver above the supply (IR2110, bootstrap diode). The low-R_DS(on) advantage is kept.']],
        pwr: [['Trench / süperjonksiyon güç MOSFET\'i', 'Trench / superjunction power MOSFET'], ['Q_g ve R_g ile anahtarlama süresini seçin, R_DS(on)\'u çalışma sıcaklığında hesaplayın; gövde diyodu ve SOA / çığ enerjisini kontrol edin; gate sürücü IC kullanın.', 'Choose switching time with Q_g and R_g, compute R_DS(on) at operating temperature; check body diode and SOA / avalanche energy; use a gate-driver IC.']],
        rev: [['P-kanal MOSFET (ters polarite koruması)', 'P-channel MOSFET (reverse-polarity protection)'], ['Diyoda göre çok düşük kayıp (I·R_DS(on) ≪ V_F); gövde diyodunun yönü, doğru polaritede iletecek şekilde olmalı. V_GS(max) için gate–source zener/bölücü ekleyin.', 'Far lower loss than a diode (I·R_DS(on) ≪ V_F); the body diode must face the forward direction. Add a gate–source zener / divider for V_GS(max).']],
        lvl: [['Küçük sinyal MOSFET (BSS138, 2N7002)', 'Small-signal MOSFET (BSS138, 2N7002)'], ['I²C seviye kaydırıcıda tek MOSFET ve iki çekme direnci yeterlidir; küçük yükler için SOT-23 yeterli.', 'A single MOSFET and two pull-ups make an I²C level shifter; SOT-23 is enough for small loads.']],
        lin: [['SOA\'sı güçlü MOSFET (hot-swap / lineer sınıf)', 'MOSFET with strong SOA (hot-swap / linear class)'], ['Doğrusal bölgede çalışırken güç V_DS·I_D çok yüksektir; veri sayfasının SOA eğrisi ve termal ayak izi (Spirito etkisi) esastır; düşük R_DS(on)\'lu hızlı anahtarlama MOSFET\'leri uygun olmayabilir.', 'In the linear region power V_DS·I_D is very high; the datasheet SOA curve and thermal footprint (Spirito effect) are essential; fast, low-R_DS(on) switching MOSFETs may be unsuitable.']],
      }[v.app];
      const why = [R[1]];
      const g = +v.g;
      if (g <= 3 && !['lvl'].includes(v.app)) why.push(['Düşük sürme gerilimi (≤ 3,3 V): V_GS(th) değil, R_DS(on)\'un 2,5 V veya 3,3 V\'de belirtildiği logic-level MOSFET seçin.', 'Low drive voltage (≤ 3.3 V): pick a logic-level MOSFET whose R_DS(on) is specified at 2.5 V or 3.3 V, not just V_GS(th).']);
      if (g === 15 && v.v === 'x') why.push(['SiC MOSFET 15–20 V sürme ister; kapama için −4 V gerekebilir.', 'SiC MOSFETs need 15–20 V drive; −4 V may be needed to turn off.']);
      if (v.v === 'h') why.push(['100–650 V: süperjonksiyon (500+ V) ve yüksek gerilimli gate sürücü; gerilim payı en az %20.', '100–650 V: superjunction (500+ V) and a high-voltage gate driver; keep at least 20 % voltage margin.']);
      if (v.v === 'x') why.push(['650 V üstü: SiC MOSFET (veya IGBT); sürücü ve düzen (layout) çok kritik.', 'Above 650 V: SiC MOSFET (or IGBT); the driver and layout are very critical.']);
      if (v.i === 'x') why.push(['30 A üstü: çoklu paralel, DFN/D2PAK/TO-247 ve kalın bakır; paralelde kapı dirençleri ayrı olmalı.', 'Above 30 A: parallel devices, DFN/D2PAK/TO-247 and thick copper; keep separate gate resistors when paralleling.']);
      if (v.f === 'hf') why.push(['1 MHz üstü: düşük Q_g ve C_oss; GaN veya hızlı trench MOSFET.', 'Above 1 MHz: low Q_g and C_oss; GaN or fast trench MOSFET.']);
      if (v.env === 'a') why.push(['Otomotiv: AEC-Q101 sertifikalı seri; yük boşalması (load dump) için gerilim payı.', 'Automotive: AEC-Q101 qualified series; voltage margin for load dump.']);
      if (v.env === 'h') why.push(['Sıcak ortam: R_DS(on) sıcakta yaklaşık 1,5–2× artar; T_j(max) 175 °C olan seri ve termal marj seçin.', 'Hot environment: R_DS(on) rises roughly 1.5–2× when hot; pick a 175 °C T_j(max) series with thermal margin.']);
      return { main: R[0], why };
    },
  },
  // calculators are shown in two groups (N / P channel); the sign conventions differ, the physics is shared
  calcGroups: [['n', 'N-kanal MOSFET', 'N-channel MOSFET'], ['p', 'P-kanal MOSFET', 'P-channel MOSFET']],
  calcs: [
    /* ---------------- N channel ---------------- */
    { id: 'mgn', group: 'n', title: ['N-MOSFET gate kontrolü', 'N-MOSFET gate drive'], sub: ['Gate GND\'ye göre sürülür: V_GS = V_drv (düşük taraf). Gereken V_GS, gate akımı, sürücü gücü, süre', 'Gate driven relative to GND: V_GS = V_drv (low-side). Required V_GS, gate current, driver power, timing'],
      fields: [
        { id: 'pos', tr: 'Konum', en: 'Position', def: 'low', sel: [['low', 'Düşük taraf (source = GND) — olağan kullanım', 'Low-side (source = GND) — usual'], ['high', 'Yüksek taraf (bootstrap / şarj pompası gerekir)', 'High-side (needs bootstrap / charge pump)']] },
        { id: 'vs', tr: 'Yük besleme gerilimi', en: 'Load supply voltage', def: '12', u: 'V', ud: 1 },
        { id: 'vd', tr: 'Sürücü çıkış gerilimi (GND\'ye göre)', en: 'Driver output voltage (to GND)', def: '5', u: 'V', ud: 1, help: ['Gate\'i süren MCU/sürücünün yüksek seviyesi; düşük seviyesi 0 V kabul edilir. MCU: 3,3 / 5 V, sürücü IC: 10–12 V.', 'High level of the MCU / driver that drives the gate; the low level is taken as 0 V. MCU: 3.3 / 5 V, driver IC: 10–12 V.'] },
        { id: 'vth', tr: 'V_GS(th)', en: 'V_GS(th)', def: '2', u: 'V', ud: 1 }, { id: 'vgm', tr: 'V_GS(max)', en: 'V_GS(max)', def: '20', u: 'V', ud: 1 },
        { id: 'qg', tr: 'Q_g toplam kapı yükü (nC)', en: 'Total gate charge Q_g (nC)', def: '30' }, { id: 'qgd', tr: 'Q_gd Miller yükü (nC)', en: 'Miller charge Q_gd (nC)', def: '8' },
        { id: 'vpl', tr: 'Miller plato gerilimi (V)', en: 'Miller plateau (V)', def: '3.5' }, { id: 'f', tr: 'Anahtarlama frekansı', en: 'Switching frequency', def: '100', u: 'F', ud: 1 },
        { id: 'rg', tr: 'Seri gate direnci R_g', en: 'Series gate resistor R_g', def: '10', u: 'R', ud: 1 }, { id: 'rd', tr: 'Sürücü çıkış direnci', en: 'Driver output resistance', def: '20', u: 'R', ud: 1, help: ['MCU pini için yaklaşık 20–50 Ω, gate sürücü IC için 1–5 Ω.', 'About 20–50 Ω for an MCU pin, 1–5 Ω for a gate-driver IC.'] },
      ],
      note: ['Gate–source arasına 10–100 kΩ çekme (pull-down) direnci ekleyin: sürücü açık/yüksek empedanslıyken MOSFET kapalı kalır. Tam iletim için V_GS, veri sayfasında R_DS(on)\'un verildiği değere (logic-level: 4,5 V, standart: 10 V) ulaşmalıdır.', 'Add a 10–100 kΩ gate–source pull-down: the MOSFET stays off while the driver is open / high-impedance. For full conduction V_GS must reach the value at which R_DS(on) is specified (logic-level: 4.5 V, standard: 10 V).'],
      compute(G) { return mosGateCompute(true, G.s('pos') === 'high', G); } },
    { id: 'mdn', group: 'n', title: ['N-MOSFET drain akımı (bölge ve I_D)', 'N-MOSFET drain current (region and I_D)'], sub: ['V_GS ve V_DS pozitif. Doyma: I_D = (K/2)·(V_GS − V_th)²  ·  Lineer: I_D = K[(V_GS − V_th)V_DS − V_DS²/2]', 'V_GS and V_DS positive. Saturation: I_D = (K/2)·(V_GS − V_th)²  ·  Linear: I_D = K[(V_GS − V_th)V_DS − V_DS²/2]'],
      fields: mosIdFields('V_GS', 'V_DS', 'V_GS(th)'),
      note: ['Basit kare-yasa modelidir (K = 2·I_D,ref / (V_GS,ref − V_th)²). Doyma bölgesi doğrusal çalışma (hot-swap, aktif yük) için geçerlidir; anahtar olarak tam iletimde R_DS(on) ile hesap yapın (sonraki hesaplayıcı).', 'A simple square-law model (K = 2·I_D,ref / (V_GS,ref − V_th)²). The saturation region matters for linear operation (hot-swap, active load); as a switch, compute with R_DS(on) in full conduction (next calculator).'],
      compute(G) { return mosIdCompute(G); } },
    { id: 'msn', group: 'n', title: ['N-MOSFET düşük taraf anahtar: akım ve kayıp', 'N-MOSFET low-side switch: current and loss'], sub: ['Yük V_dd ile drain arasında, source GND\'de. I_D = V_dd/(R_L + R_DS(on)), P = I²·R_DS(on) + P_sw + P_gate', 'Load between V_dd and the drain, source on GND. I_D = V_dd/(R_L + R_DS(on)), P = I²·R_DS(on) + P_sw + P_gate'],
      fields: mosSwFields('V_GS sürme (V)', 'V_GS drive (V)', '10'),
      note: mosSwNote, compute(G) { return mosSwCompute(G); } },
    { id: 'mrn', group: 'n', title: ['N-MOSFET gate direnci ve çekme direnci', 'N-MOSFET gate resistor and pull-down'], sub: ['R_g ≈ (V_drv − V_pl)·t_miller / Q_gd; çekme direnci gate–source (GND)', 'R_g ≈ (V_drv − V_pl)·t_miller / Q_gd; pull-down from gate to source (GND)'],
      fields: mosRgFields('Sürücü gerilimi (gate yüksek seviyesi)', 'Driver voltage (gate high level)'),
      compute(G) { return mosRgCompute(G, tt('Gate–source (GND) çekme direnci önerisi', 'Gate–source (GND) pull-down suggestion')); } },

    /* ---------------- P channel ---------------- */
    { id: 'mgp', group: 'p', title: ['P-MOSFET gate kontrolü (yüksek taraf)', 'P-MOSFET gate drive (high-side)'], sub: ['Source beslemede; gate besleme altına çekilince iletir: |V_GS| = V_s − V_gate. Açma/kapama seviyeleri, V_GS(max) koruması, sürücü gücü', 'Source on the supply; it conducts when the gate is pulled below the supply: |V_GS| = V_s − V_gate. On/off levels, V_GS(max) protection, driver power'],
      fields: [
        { id: 'vs', tr: 'Besleme gerilimi V_s (source)', en: 'Supply voltage V_s (source)', def: '12', u: 'V', ud: 1 },
        { id: 'vd', tr: 'Sürücü yüksek seviyesi (GND\'ye göre)', en: 'Driver high level (to GND)', def: '5', u: 'V', ud: 1, help: ['Kapatmak için gate besleme gerilimine çekilmelidir. MCU pini (3,3/5 V) besleme 5 V\'tan büyükse yetmez; açık kolektörlü NPN / N-MOS ile seviye kaydırın.', 'To turn it off the gate must be pulled to the supply. An MCU pin (3.3/5 V) is not enough when the supply is above 5 V; level-shift with an open-collector NPN / N-MOS.'] },
        { id: 'vth', tr: '|V_GS(th)|', en: '|V_GS(th)|', def: '2', u: 'V', ud: 1 }, { id: 'vgm', tr: '|V_GS(max)|', en: '|V_GS(max)|', def: '20', u: 'V', ud: 1 },
        { id: 'qg', tr: 'Q_g toplam kapı yükü (nC)', en: 'Total gate charge Q_g (nC)', def: '30' }, { id: 'qgd', tr: 'Q_gd Miller yükü (nC)', en: 'Miller charge Q_gd (nC)', def: '8' },
        { id: 'vpl', tr: 'Miller plato gerilimi (V)', en: 'Miller plateau (V)', def: '3.5' }, { id: 'f', tr: 'Anahtarlama frekansı', en: 'Switching frequency', def: '100', u: 'F', ud: 1 },
        { id: 'rg', tr: 'Seri gate direnci R_g', en: 'Series gate resistor R_g', def: '10', u: 'R', ud: 1 }, { id: 'rd', tr: 'Sürücü çıkış direnci', en: 'Driver output resistance', def: '20', u: 'R', ud: 1 },
      ],
      note: ['Gate–source arasına 10–100 kΩ çekme (pull-up) direnci ekleyin: sürücü açıkken gate besleme gerilimine çekilir ve MOSFET kapalı kalır. Besleme |V_GS(max)|\'ı aşıyorsa gate\'i bölücü ya da zener ile sınırlayın (aşağıdaki öneri).', 'Add a 10–100 kΩ gate–source pull-up: with the driver open the gate sits at the supply and the MOSFET stays off. If the supply exceeds |V_GS(max)|, limit the gate with a divider or a zener (suggestion below).'],
      compute(G) { return mosGateCompute(false, true, G); } },
    { id: 'mdp', group: 'p', title: ['P-MOSFET drain akımı (bölge ve I_D)', 'P-MOSFET drain current (region and I_D)'], sub: ['P-kanalda V_GS, V_DS ve V_th negatiftir; buraya mutlak değerleri girin. Doyma: I_D = (K/2)·(|V_GS| − |V_th|)²', 'On a P-channel V_GS, V_DS and V_th are negative; enter magnitudes here. Saturation: I_D = (K/2)·(|V_GS| − |V_th|)²'],
      fields: mosIdFields('|V_GS| (source − gate)', '|V_DS| (source − drain)', '|V_GS(th)|'),
      note: ['Akım source\'tan drain\'e akar. Aynı kare-yasa modeli; P-kanalda K genelde N-kanalın yaklaşık yarısıdır (delik hareketliliği), aynı akım için daha büyük yonga / daha yüksek R_DS(on) beklenir.', 'Current flows from source to drain. Same square-law model; on a P-channel K is typically about half of an N-channel (hole mobility): expect a larger die / higher R_DS(on) for the same current.'],
      compute(G) { return mosIdCompute(G); } },
    { id: 'msp', group: 'p', title: ['P-MOSFET yüksek taraf anahtar: akım ve kayıp', 'P-MOSFET high-side switch: current and loss'], sub: ['Source V_dd\'de, yük drain ile GND arasında. I_D = V_dd/(R_L + R_DS(on)), P = I²·R_DS(on) + P_sw + P_gate', 'Source on V_dd, load between the drain and GND. I_D = V_dd/(R_L + R_DS(on)), P = I²·R_DS(on) + P_sw + P_gate'],
      fields: mosSwFields('|V_GS| sürme (V)', '|V_GS| drive (V)', '10'),
      note: mosSwNote, compute(G) { return mosSwCompute(G); } },
    { id: 'mrp', group: 'p', title: ['P-MOSFET gate direnci ve çekme direnci', 'P-MOSFET gate resistor and pull-up'], sub: ['R_g ≈ (|V_GS,drv| − V_pl)·t_miller / Q_gd; çekme direnci gate–source (besleme)', 'R_g ≈ (|V_GS,drv| − V_pl)·t_miller / Q_gd; pull-up from gate to source (supply)'],
      fields: mosRgFields('Gate salınım gerilimi |V_GS| (besleme − gate alt seviyesi)', 'Gate swing |V_GS| (supply − gate low level)'),
      compute(G) { return mosRgCompute(G, tt('Gate–source (besleme) çekme direnci önerisi', 'Gate–source (supply) pull-up suggestion')); } },
    { id: 'rp', group: 'p', title: ['Ters polarite koruması (P-MOSFET)', 'Reverse-polarity protection (P-MOSFET)'], sub: ['P = I²·R_DS(on) ≪ I·V_F (diyot)', 'P = I²·R_DS(on) ≪ I·V_F (diode)'],
      fields: [
        { id: 'vb', tr: 'Batarya / besleme gerilimi', en: 'Battery / supply voltage', def: '12', u: 'V', ud: 1 }, { id: 'i', tr: 'Yük akımı', en: 'Load current', def: '5', u: 'A', ud: 2 },
        { id: 'rds', tr: 'R_DS(on)', en: 'R_DS(on)', def: '15', u: 'R', ud: 0 }, { id: 'vf', tr: 'Karşılaştırma diyodu V_F', en: 'Comparison diode V_F', def: '0.5', u: 'V', ud: 1 },
        { id: 'vgm', tr: '|V_GS(max)|', en: '|V_GS(max)|', def: '20', u: 'V', ud: 1 },
      ],
      note: ['P-MOSFET\'in gövde diyodu doğru polaritede iletim yönündedir; MOSFET açılınca kayıp I²·R_DS(on) olur. V_GS = −V_besleme olduğundan besleme |V_GS(max)|\'ı aşıyorsa gate–source arasına zener veya bölücü koyun.', 'The P-MOSFET body diode points in the forward direction; once the MOSFET turns on the loss is I²·R_DS(on). Since V_GS = −V_supply, add a zener or divider across gate–source if the supply exceeds |V_GS(max)|.'],
      compute(G) {
        const Vb = G.v('vb'), I = G.v('i'), R = G.v('rds'), Vf = G.v('vf'), Vgm = G.v('vgm');
        if (!(Vb > 0 && I > 0 && R > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const Pm = I * I * R, Pd = Vf * I, over = Vgm > 0 && Vb > Vgm;
        return [[eng(I * R, 'V'), tt('MOSFET gerilim düşümü I·R_DS(on)', 'MOSFET voltage drop I·R_DS(on)'), 'big'], [eng(Pm, 'W'), tt('MOSFET kaybı', 'MOSFET loss')], [eng(Pd, 'W'), tt('Aynı akımda diyot kaybı', 'Diode loss at the same current')], [sig(Pd > 0 ? Pm / Pd * 100 : 0, 3) + ' %', tt('MOSFET kaybı / diyot kaybı', 'MOSFET loss / diode loss'), 'good'], [over ? tt('GEREKLİ', 'REQUIRED') : tt('gerekmez', 'not needed'), tt('Gate–source zener / bölücü (V_besleme > |V_GS(max)|)', 'Gate–source zener / divider (V_supply > |V_GS(max)|)'), over ? 'warn' : 'good']];
      } },
  ],
};
