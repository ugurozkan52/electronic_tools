/* Transistor (BJT NPN / PNP first): parameters, types, wizard and calculators. */
/* ---- the four calculators exist for NPN and PNP; the maths is shared, polarity changes the wording, defaults and schematic ---- */
function bjtCalcs(pnp) {
  const T = pnp ? 'PNP' : 'NPN', sfx = pnp ? 'p' : 'n', grp = pnp ? 'pnp' : 'npn';
  const list = [
    { id: 'bs' + sfx, group: grp, title: [T + ' taban akımı ve taban direnci (anahtar)', T + ' base current and base resistor (switch)'], sub: ['I_B = I_C / β_zorlanmış, R_B = (V_drv − V_BE) / I_B', 'I_B = I_C / β_forced, R_B = (V_drv − V_BE) / I_B'],
      fields: [
        { id: 'vd', tr: pnp ? 'Sürücü düşük seviyesi (tabanı çeken)' : 'Sürücü yüksek seviyesi', en: pnp ? 'Driver low level (pulls the base)' : 'Driver high level', def: pnp ? '0' : '3.3', u: 'V', ud: 1, help: ['NPN: tabana uygulanan yüksek seviye. PNP: tabanı sürerken kullanılan düşük seviye (genelde 0 V).', 'NPN: the high level applied to the base. PNP: the low level used to drive the base (usually 0 V).'] },
        { id: 'vcc', tr: 'Besleme gerilimi', en: 'Supply voltage', def: '12', u: 'V', ud: 1, help: ['PNP\'de emiter besleme gerilimi; yük akımı için de kullanılır.', 'For PNP, the emitter supply voltage; also used for the load current.'] },
        { id: 'ic', tr: 'Kollektör akımı I_C', en: 'Collector current I_C', def: '100', u: 'A', ud: 1 },
        { id: 'rl', tr: 'Veya yük direnci', en: 'Or load resistance', def: '', u: 'R', ud: 1, help: ['I_C boşsa I_C = (V_cc − V_CE(sat)) / R_L ile bulunur.', 'If I_C is empty, I_C = (V_cc − V_CE(sat)) / R_L is used.'] },
        { id: 'bf', tr: 'Zorlanmış β', en: 'Forced β', def: '10', help: ['Doymada I_C/I_B oranı; genelde 10 (güç için 10–20). Daha küçük β daha güvenli doyma, daha çok taban akımı demektir.', 'I_C/I_B in saturation; usually 10 (10–20 for power). A smaller β means safer saturation and more base current.'] },
        { id: 'hfe', tr: 'h_FE (min, veri sayfası)', en: 'h_FE (min, datasheet)', def: '100' },
        { id: 'vbe', tr: 'V_BE (doymada)', en: 'V_BE (saturated)', def: '0.8', u: 'V', ud: 1 }, { id: 'vces', tr: 'V_CE(sat)', en: 'V_CE(sat)', def: '0.2', u: 'V', ud: 1 },
      ],
      note: ['Tabana, kapanırken serbest kalması için 10 kΩ civarı taban–emiter çekme direnci ekleyin. Hesaplanan direncin altındaki en yakın E24 değeri seçilir; böylece doyma garantilenir.', 'Add a base–emitter pull-down of about 10 kΩ so the base is defined when off. The nearest E24 value below the calculated resistor is chosen, which guarantees saturation.'],
      compute(G) {
        const npn = !pnp, vd = G.v('vd'), vcc = G.v('vcc'), vbe = G.v('vbe'), vces = G.v('vces') || 0, bf = G.r('bf') || 10, hfe = G.r('hfe');
        let Ic = G.v('ic'); if (!(Ic > 0)) { const RL = G.v('rl'); if (RL > 0 && vcc > vces) Ic = (vcc - vces) / RL; }
        if (!(Ic > 0 && vbe > 0)) return [['—', tt('I_C (veya yük direnci) girin', 'Enter I_C (or load resistance)')]];
        const Vrb = npn ? vd - vbe : vcc - vd - vbe;
        if (!(Vrb > 0)) return [['—', tt('Sürücü gerilimi V_BE\'yi aşmıyor; transistör iletmez', 'Drive voltage does not exceed V_BE; the transistor will not conduct'), 'bad']];
        const Ib = Ic / bf, Rb = Vrb / Ib, std = nearestE(Rb, 'E24').lo, Iba = Vrb / std, od = hfe > 0 ? Iba * hfe / Ic : NaN;
        const vrbHow = npn ? `V_RB = V_drv − V_BE = ${eng(vd, 'V')} − ${eng(vbe, 'V')} = ${eng(Vrb, 'V')}` : `V_RB = V_cc − V_drv − V_EB = ${eng(vcc, 'V')} − ${eng(vd, 'V')} − ${eng(vbe, 'V')} = ${eng(Vrb, 'V')}`;
        const items = [[eng(Rb, 'Ω'), tt('Hesaplanan taban direnci R_B', 'Calculated base resistor R_B'), 'big', `R_B = V_RB/I_B = ${eng(Vrb, 'V')} / ${eng(Ib, 'A')} = ${eng(Rb, 'Ω')} (${vrbHow})`],
          [eng(std, 'Ω'), tt('Standart E24 (eşit/küçük)', 'Standard E24 (equal / lower)'), '', tt('Küçük olan komşu seçilir: taban akımı biraz artar, doyma garanti kalır.', 'The lower neighbour is chosen: base current rises slightly and saturation stays guaranteed.')],
          [eng(Ib, 'A'), tt('Gereken taban akımı I_B', 'Required base current I_B'), '', tt(`I_B = I_C/β_zorlanmış = ${eng(Ic, 'A')} / ${bf} = ${eng(Ib, 'A')}. Zorlanmış β ≈ 10, h_FE(min)\'den çok küçük seçilerek derin doyma sağlanır.`, `I_B = I_C/β_forced = ${eng(Ic, 'A')} / ${bf} = ${eng(Ib, 'A')}. A forced β of about 10, far below h_FE(min), gives hard saturation.`)],
          [eng(Iba, 'A'), tt('Standart dirençle I_B', 'I_B with the standard resistor'), '', `I_B = V_RB/R_B = ${eng(Vrb, 'V')} / ${eng(std, 'Ω')} = ${eng(Iba, 'A')}`],
          [eng(Vrb * Vrb / std, 'W'), tt('R_B gücü', 'R_B power'), '', `P = V_RB²/R_B = (${eng(Vrb, 'V')})² / ${eng(std, 'Ω')} = ${eng(Vrb * Vrb / std, 'W')}`],
          [eng(vces * Ic + vbe * Iba, 'W'), tt('Transistör kaybı (doymada)', 'Transistor loss (saturated)'), '', `P = V_CE(sat)·I_C + V_BE·I_B = ${eng(vces, 'V')} · ${eng(Ic, 'A')} + ${eng(vbe, 'V')} · ${eng(Iba, 'A')} = ${eng(vces * Ic + vbe * Iba, 'W')}`]];
        if (isFinite(od)) items.push([sig(od, 3) + '×', tt('Aşırı sürme (I_B·h_FE / I_C)', 'Overdrive (I_B·h_FE / I_C)'), od < 1.5 ? 'bad' : 'good', tt(`I_B·h_FE(min)/I_C = ${eng(Iba, 'A')} · ${hfe} / ${eng(Ic, 'A')} = ${sig(od, 3)}×. 1,5×\'in altında en kötü parçada doyma garanti değildir; çok büyükse kapanma (depolama) süresi uzar.`, `I_B·h_FE(min)/I_C = ${eng(Iba, 'A')} · ${hfe} / ${eng(Ic, 'A')} = ${sig(od, 3)}×. Below 1.5× saturation is not guaranteed for the worst part; very large values lengthen the turn-off (storage) time.`)]);
        return items;
      } },
    { id: 'ic' + sfx, group: grp, title: [T + ' kollektör akımı (sabit taban akımı)', T + ' collector current (fixed base current)'], sub: ['I_B = (V_in − V_BE)/(R_B + (β+1)·R_E), I_C = β·I_B', 'I_B = (V_in − V_BE)/(R_B + (β+1)·R_E), I_C = β·I_B'],
      fields: [
        { id: 'vcc', tr: 'Besleme V_cc', en: 'Supply V_cc', def: '12', u: 'V', ud: 1 }, { id: 'rc', tr: 'Kollektör direnci R_C', en: 'Collector resistor R_C', def: '470', u: 'R', ud: 1 },
        { id: 'vin', tr: 'Taban kaynağı V_in', en: 'Base source V_in', def: '5', u: 'V', ud: 1 }, { id: 'rb', tr: 'Taban direnci R_B', en: 'Base resistor R_B', def: '100', u: 'R', ud: 2 },
        { id: 're', tr: 'Emiter direnci R_E (isteğe bağlı)', en: 'Emitter resistor R_E (optional)', def: '', u: 'R', ud: 1 }, { id: 'b', tr: 'β (h_FE)', en: 'β (h_FE)', def: '200' },
        { id: 'vbe', tr: 'V_BE', en: 'V_BE', def: '0.7', u: 'V', ud: 1 }, { id: 'vces', tr: 'V_CE(sat)', en: 'V_CE(sat)', def: '0.2', u: 'V', ud: 1 },
      ],
      note: ['β değeri geniş yayılımlıdır; doğruluk için emiter direnci ve gerilim bölücü polarma kullanın.', 'β has a wide spread; use an emitter resistor and divider bias for accuracy.'],
      compute(G) {
        const Vcc = G.v('vcc'), Rc = G.v('rc'), Vin = G.v('vin'), Rb = G.v('rb'), Re = G.v('re') || 0, B = G.r('b'), Vbe = G.v('vbe'), Vces = G.v('vces') || 0;
        if (!(Vcc > 0 && Rc > 0 && Vin > Vbe && Rb > 0 && B > 0)) return [['—', tt('Değerleri girin (V_in > V_BE)', 'Enter the values (V_in > V_BE)')]];
        const Ib = (Vin - Vbe) / (Rb + (B + 1) * Re), Ica = B * Ib, Ics = (Vcc - Vces) / (Rc + Re), sat = Ica >= Ics, Ic = sat ? Ics : Ica, Ibr = sat ? Ics / B : Ib, Vce = sat ? Vces : Vcc - Ic * Rc - (Ic + Ib) * Re;
        const items = [[eng(Ic, 'A'), tt('Kollektör akımı I_C', 'Collector current I_C'), 'big', sat ? tt(`β·I_B = ${eng(Ica, 'A')} ≥ I_C(sat) = ${eng(Ics, 'A')}: transistör doyar, I_C devre tarafından sınırlanır = ${eng(Ic, 'A')}.`, `β·I_B = ${eng(Ica, 'A')} ≥ I_C(sat) = ${eng(Ics, 'A')}: the transistor saturates and the circuit limits I_C = ${eng(Ic, 'A')}.`) : `I_C = β·I_B = ${B} · ${eng(Ib, 'A')} = ${eng(Ic, 'A')}`],
          [sat ? tt('DOYMA', 'SATURATION') : tt('Aktif bölge', 'Active region'), tt('Çalışma bölgesi', 'Operating region'), sat ? 'warn' : 'good', tt('β·I_B, devrenin verebileceği en büyük akımı (I_C(sat)) aşarsa doyma; aşmazsa aktif bölge (yükselteç).', 'Saturation if β·I_B exceeds the largest current the circuit can supply (I_C(sat)); otherwise active region (amplifier).')],
          [eng(Vce, 'V'), 'V_CE', '', sat ? tt(`Doymada V_CE = V_CE(sat) = ${eng(Vces, 'V')}`, `In saturation V_CE = V_CE(sat) = ${eng(Vces, 'V')}`) : `V_CE = V_cc − I_C·R_C − I_E·R_E = ${eng(Vcc, 'V')} − ${eng(Ic, 'A')} · ${eng(Rc, 'Ω')} − ${eng(Ic + Ib, 'A')} · ${eng(Re, 'Ω')} = ${eng(Vce, 'V')}`],
          [eng(Ib, 'A'), tt('Taban akımı I_B', 'Base current I_B'), '', `I_B = (V_in − V_BE)/(R_B + (β+1)·R_E) = (${eng(Vin, 'V')} − ${eng(Vbe, 'V')}) / (${eng(Rb, 'Ω')} + ${B + 1} · ${eng(Re, 'Ω')}) = ${eng(Ib, 'A')}`],
          [eng(Ica, 'A'), tt('β·I_B (doyma yoksa I_C)', 'β·I_B (I_C if not saturated)'), '', `β·I_B = ${B} · ${eng(Ib, 'A')} = ${eng(Ica, 'A')}`],
          [eng(Ics, 'A'), tt('Doyma akımı I_C(sat)', 'Saturation current I_C(sat)'), '', `I_C(sat) = (V_cc − V_CE(sat))/(R_C + R_E) = (${eng(Vcc, 'V')} − ${eng(Vces, 'V')}) / (${eng(Rc, 'Ω')} + ${eng(Re, 'Ω')}) = ${eng(Ics, 'A')}`],
          [eng(Vce * Ic, 'W'), tt('Transistör kaybı', 'Transistor loss'), '', `P ≈ V_CE·I_C = ${eng(Vce, 'V')} · ${eng(Ic, 'A')} = ${eng(Vce * Ic, 'W')}`]];
        if (sat) items.push([sig(Ib / Ibr, 3) + '×', tt('Aşırı sürme (I_B / doyma için gereken I_B)', 'Overdrive (I_B / I_B needed for saturation)'), '', tt(`I_B / (I_C(sat)/β) = ${eng(Ib, 'A')} / ${eng(Ibr, 'A')} = ${sig(Ib / Ibr, 3)}×. Tipik β ile hesaplandı; en kötü h_FE(min) için en az 2–3× isteyin.`, `I_B / (I_C(sat)/β) = ${eng(Ib, 'A')} / ${eng(Ibr, 'A')} = ${sig(Ib / Ibr, 3)}×. Computed with typical β; ask for at least 2–3× for the worst-case h_FE(min).`)]);
        return items;
      } },
    { id: 'vd' + sfx, group: grp, title: [T + ' gerilim bölücü polarma (kararlı)', T + ' voltage-divider bias (stable)'], sub: pnp ? ['V_th = V_cc·R₁/(R₁+R₂) (emiterden ölçülen), I_C ≈ (V_th − V_BE)/R_E', 'V_th = V_cc·R₁/(R₁+R₂) (measured from the emitter), I_C ≈ (V_th − V_BE)/R_E'] : ['V_th = V_cc·R₂/(R₁+R₂), I_C ≈ (V_th − V_BE)/R_E', 'V_th = V_cc·R₂/(R₁+R₂), I_C ≈ (V_th − V_BE)/R_E'],
      fields: [
        { id: 'vcc', tr: 'Besleme V_cc', en: 'Supply V_cc', def: '12', u: 'V', ud: 1 }, { id: 'r1', tr: 'R1 (üst)', en: 'R1 (top)', def: pnp ? '10' : '47', u: 'R', ud: 2 }, { id: 'r2', tr: 'R2 (alt)', en: 'R2 (bottom)', def: pnp ? '47' : '10', u: 'R', ud: 2 },
        { id: 'rc', tr: 'R_C', en: 'R_C', def: '2.2', u: 'R', ud: 2 }, { id: 're', tr: 'R_E', en: 'R_E', def: '1', u: 'R', ud: 2 }, { id: 'b', tr: 'β (h_FE)', en: 'β (h_FE)', def: '200' }, { id: 'vbe', tr: 'V_BE', en: 'V_BE', def: '0.7', u: 'V', ud: 1 },
      ],
      note: ['İyi polarmada bölücü akımı taban akımının en az 10 katı olmalı; böylece I_C β\'ya az duyarlı olur.', 'In good biasing the divider current should be at least 10× the base current, so I_C is only weakly dependent on β.'],
      compute(G) {
        const Vcc = G.v('vcc'), R1 = G.v('r1'), R2 = G.v('r2'), Rc = G.v('rc'), Re = G.v('re'), B = G.r('b'), Vbe = G.v('vbe');
        if (!(Vcc > 0 && R1 > 0 && R2 > 0 && Rc > 0 && Re > 0 && B > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const Vth = Vcc * (pnp ? R1 : R2) / (R1 + R2), Rth = R1 * R2 / (R1 + R2), solve = (b) => { const Ib = (Vth - Vbe) / (Rth + (b + 1) * Re); return b * Ib; };
        if (Vth <= Vbe) return [['—', tt('V_th, V_BE\'den küçük; transistör iletmez', 'V_th is below V_BE; the transistor does not conduct'), 'bad']];
        const Ic = solve(B), Ib = Ic / B, Ie = Ic + Ib, Vce = Vcc - Ic * Rc - Ie * Re, act = Vce > 0.3, lo = solve(B / 2), hi = solve(B * 2), Idiv = Vcc / (R1 + R2);
        const vthHow = `V_th = V_cc·${pnp ? 'R₁' : 'R₂'}/(R₁+R₂) = ${eng(Vcc, 'V')} · ${eng(pnp ? R1 : R2, 'Ω')} / ${eng(R1 + R2, 'Ω')} = ${eng(Vth, 'V')}, R_th = R₁∥R₂ = ${eng(Rth, 'Ω')}`;
        return [[eng(Ic, 'A'), tt('Kollektör akımı I_C', 'Collector current I_C'), 'big', `I_C = β·(V_th − V_BE)/(R_th + (β+1)·R_E) = ${B} · (${eng(Vth, 'V')} − ${eng(Vbe, 'V')}) / (${eng(Rth, 'Ω')} + ${B + 1} · ${eng(Re, 'Ω')}) = ${eng(Ic, 'A')}; ${vthHow}`],
          [eng(Vce, 'V'), tt('V_CE', 'V_CE'), act ? 'good' : 'bad', `V_CE = V_cc − I_C·R_C − I_E·R_E = ${eng(Vcc, 'V')} − ${eng(Ic, 'A')} · ${eng(Rc, 'Ω')} − ${eng(Ie, 'A')} · ${eng(Re, 'Ω')} = ${eng(Vce, 'V')}`],
          [act ? tt('Aktif bölge', 'Active region') : tt('Doymaya yakın / doyma', 'Near / in saturation'), tt('Çalışma bölgesi', 'Operating region'), act ? 'good' : 'warn', tt('V_CE > 0,3 V ise aktif bölge. Yükselteçte simetrik salınım için V_CE ≈ V_cc/2 civarı hedeflenir.', 'Active region if V_CE > 0.3 V. For an amplifier aim near V_CE ≈ V_cc/2 for symmetrical swing.')],
          [eng(Ie * Re, 'V'), tt('V_E (emiter gerilimi)', 'V_E (emitter voltage)'), '', tt(`V_E = I_E·R_E = ${eng(Ie, 'A')} · ${eng(Re, 'Ω')} = ${eng(Ie * Re, 'V')}. 1–2 V civarı V_BE\'nin sıcaklıkla değişimini bastırır.`, `V_E = I_E·R_E = ${eng(Ie, 'A')} · ${eng(Re, 'Ω')} = ${eng(Ie * Re, 'V')}. About 1–2 V swamps the temperature drift of V_BE.`)],
          [eng((Vth - Vbe) / Re, 'A'), tt('Yaklaşık I_C ≈ (V_th − V_BE)/R_E', 'Approx. I_C ≈ (V_th − V_BE)/R_E'), '', tt(`(${eng(Vth, 'V')} − ${eng(Vbe, 'V')}) / ${eng(Re, 'Ω')} = ${eng((Vth - Vbe) / Re, 'A')}. β sonsuz kabul edilen el hesabı; tam çözüme yakınsa polarma iyidir.`, `(${eng(Vth, 'V')} − ${eng(Vbe, 'V')}) / ${eng(Re, 'Ω')} = ${eng((Vth - Vbe) / Re, 'A')}. Hand estimate with infinite β; if close to the full result the bias is good.`)],
          [sig(Idiv / Ib, 3) + '×', tt('Bölücü akımı / taban akımı (≥ 10 iyi)', 'Divider current / base current (≥ 10 is good)'), Idiv / Ib >= 10 ? 'good' : 'warn', `I_div / I_B = (V_cc/(R₁+R₂)) / I_B = ${eng(Idiv, 'A')} / ${eng(Ib, 'A')} = ${sig(Idiv / Ib, 3)}×`],
          [sig((lo / Ic - 1) * 100, 3) + ' % / +' + sig((hi / Ic - 1) * 100, 3) + ' %', tt('β yarıya / iki katına çıkarsa I_C değişimi', 'I_C change if β halves / doubles'), '', tt(`β = ${B / 2} → I_C = ${eng(lo, 'A')}, β = ${B * 2} → I_C = ${eng(hi, 'A')}. Küçük değişim, çalışma noktasının β\'dan bağımsız olduğunu gösterir.`, `β = ${B / 2} → I_C = ${eng(lo, 'A')}, β = ${B * 2} → I_C = ${eng(hi, 'A')}. A small change shows the operating point is independent of β.`)],
          [eng(Vce * Ic, 'W'), tt('Transistör kaybı', 'Transistor loss'), '', `P ≈ V_CE·I_C = ${eng(Vce, 'V')} · ${eng(Ic, 'A')} = ${eng(Vce * Ic, 'W')}`]];
      } },
    { id: 'pd' + sfx, group: grp, title: [T + ' güç kaybı ve eklem sıcaklığı', T + ' power dissipation and junction temperature'], sub: ['P = V_CE·I_C + V_BE·I_B, T_j = T_a + P·R_θJA', 'P = V_CE·I_C + V_BE·I_B, T_j = T_a + P·R_θJA'],
      fields: [
        { id: 'ic', tr: 'Kollektör akımı', en: 'Collector current', def: '0.5', u: 'A', ud: 2 }, { id: 'vce', tr: 'V_CE', en: 'V_CE', def: '5', u: 'V', ud: 1 }, { id: 'ib', tr: 'Taban akımı (isteğe bağlı)', en: 'Base current (optional)', def: '', u: 'A', ud: 1 }, { id: 'vbe', tr: 'V_BE', en: 'V_BE', def: '0.7', u: 'V', ud: 1 },
        { id: 'd', tr: 'İletim oranı (%)', en: 'Conduction ratio (%)', def: '100' }, { id: 'rth', tr: 'R_θJA (K/W)', en: 'R_θJA (K/W)', def: '100' }, { id: 'ta', tr: 'Ortam (°C)', en: 'Ambient (°C)', def: '40' }, { id: 'tj', tr: 'T_j(max) (°C)', en: 'T_j(max) (°C)', def: '150' },
      ],
      compute(G) {
        const Ic = G.v('ic'), Vce = G.v('vce'), Ib = G.v('ib') || 0, Vbe = G.v('vbe') || 0, d = (G.r('d') || 100) / 100, Rth = G.r('rth'), Ta = G.r('ta'), Tm = G.r('tj');
        if (!(Ic > 0 && Vce > 0 && Rth > 0)) return [['—', tt('Değerleri girin', 'Enter the values')]];
        const P = (Vce * Ic + Vbe * Ib) * d, Tj = Ta + P * Rth;
        return [[sig(Tj, 4) + ' °C', tt('Eklem sıcaklığı T_j', 'Junction temperature T_j'), 'big ' + (Tj > Tm ? 'bad' : Tj > Tm - 20 ? 'warn' : 'good'), `T_j = T_a + P·R_θJA = ${Ta} + ${eng(P, 'W')} · ${Rth} K/W = ${sig(Tj, 4)} °C`],
          [eng(P, 'W'), tt('Ortalama güç kaybı', 'Average power dissipation'), '', `P = (V_CE·I_C + V_BE·I_B)·D = (${eng(Vce, 'V')} · ${eng(Ic, 'A')} + ${eng(Vbe, 'V')} · ${eng(Ib, 'A')}) · ${sig(d, 3)} = ${eng(P, 'W')}`],
          [sig(Tm - Tj, 3) + ' °C', tt('T_j(max)\'a kalan pay', 'Margin to T_j(max)'), '', tt(`${Tm} − ${sig(Tj, 4)} = ${sig(Tm - Tj, 3)} °C; en az 20–25 °C bırakın.`, `${Tm} − ${sig(Tj, 4)} = ${sig(Tm - Tj, 3)} °C; leave at least 20–25 °C.`)],
          [eng((Tm - Ta) / Rth, 'W'), tt('Bu ortamda izin verilen güç', 'Allowed power in this ambient'), '', tt(`P_maks = (T_j(max) − T_a)/R_θJA = (${Tm} − ${Ta}) / ${Rth} = ${eng((Tm - Ta) / Rth, 'W')}. Ayrıca SOA eğrisinde V_CE–I_C noktasını kontrol edin.`, `P_max = (T_j(max) − T_a)/R_θJA = (${Tm} − ${Ta}) / ${Rth} = ${eng((Tm - Ta) / Rth, 'W')}. Also check the V_CE–I_C point on the SOA curve.`)]];
      } },
  ];
  if (pnp) list.forEach((c) => { c.sub = [c.sub[0] + ' · ' + 'Gerilimler emitere (V_cc) göre, akımlar NPN\'nin tersi yönde', c.sub[1] + ' · ' + 'Voltages referred to the emitter (V_cc), currents opposite to NPN']; });
  return list;
}

CMP.transistor = {
  name: ['Transistör', 'Transistor'],
  title: ['Transistör (NPN / PNP) Rehberi ve Hesaplayıcıları', 'Transistor (NPN / PNP) Guide and Calculators'],
  sub: ['BJT parametrelerini, transistör türlerini, seçim kriterlerini; taban akımı, taban direnci ve kolektör akımı hesaplayıcılarını bulun.', 'BJT parameters, transistor types, selection criteria; base current, base resistor and collector current calculators.'],
  params: [
    ['Akım kazancı (h_FE / β)', 'Current gain (h_FE / β)', '—', 'I_C / I_B oranı. Veri sayfasında geniş aralıklıdır (örn. 110–800) ve sıcaklık ile I_C\'ye bağlıdır. Anahtarlamada garanti edilen en küçük değer kullanılır.', 'The I_C / I_B ratio. Wide spread in datasheets (e.g. 110–800) and depends on temperature and I_C. For switching use the guaranteed minimum.', 'small-signal 100–800 · power 20–100'],
    ['Kollektör–emiter gerilimi (V_CEO)', 'Collector–emitter voltage (V_CEO)', 'V', 'Taban açıkken kollektör–emiter arasında dayanılan en yüksek gerilim; pratikte pay bırakın.', 'Highest collector–emitter voltage with base open; leave margin in practice.', '30 – 1500 V'],
    ['Kollektör–taban / emiter–taban (V_CBO, V_EBO)', 'Collector–base / emitter–base (V_CBO, V_EBO)', 'V', 'V_EBO küçüktür (genelde 5–6 V); taban–emiter ters yönde bu değeri aşarsa eklem bozulur.', 'V_EBO is small (usually 5–6 V); exceeding it in reverse across base–emitter damages the junction.', 'V_EBO ≈ 5–6 V'],
    ['Maks. kollektör akımı (I_C, I_CM)', 'Max collector current (I_C, I_CM)', 'A', 'Sürekli ve tepe (darbe) kollektör akımı; kazanç yüksek akımda düşer, V_CE(sat) artar.', 'Continuous and peak (pulsed) collector current; gain falls and V_CE(sat) rises at high current.', '0.1 – 100 A'],
    ['Doyma gerilimi (V_CE(sat))', 'Saturation voltage (V_CE(sat))', 'V', 'Tam iletimde (zorlanmış β ≈ 10) C–E gerilimi; anahtar kaybı P = V_CE(sat)·I_C.', 'C–E voltage in full conduction (forced β ≈ 10); switch loss P = V_CE(sat)·I_C.', '0.1–0.4 V'],
    ['Taban–emiter gerilimi (V_BE)', 'Base–emitter voltage (V_BE)', 'V', 'İletimde ≈ 0,6–0,8 V (doymada daha yüksek); sıcaklıkla yaklaşık −2 mV/°C. PNP için V_EB.', 'About 0.6–0.8 V in conduction (higher in saturation); roughly −2 mV/°C. V_EB for PNP.', '0.6–0.9 V'],
    ['Güç kaybı (P_D) ve ısıl direnç', 'Power dissipation (P_D) and thermal resistance', 'W, K/W', 'P = V_CE·I_C + V_BE·I_B; T_j = T_a + P·R_θJA. Güvenli çalışma alanı (SOA) içinde kalın.', 'P = V_CE·I_C + V_BE·I_B; T_j = T_a + P·R_θJA. Stay inside the safe operating area (SOA).', 'TO-92 0.5 W · SOT-23 0.25 W · TO-220 65 W'],
    ['Geçiş frekansı (f_T)', 'Transition frequency (f_T)', 'Hz', 'Akım kazancının 1\'e düştüğü frekans; kazanç-bant genişliği ve anahtarlama hızını belirler.', 'Frequency at which current gain falls to 1; sets gain-bandwidth and switching speed.', '100 MHz … 10 GHz'],
    ['Kapasitanslar (C_ob, C_ib)', 'Capacitances (C_ob, C_ib)', 'pF', 'Miller etkisi yüksek frekans kazancını sınırlar.', 'Miller effect limits high-frequency gain.', '—'],
    ['Kaçak akım (I_CBO / I_CEO)', 'Leakage (I_CBO / I_CEO)', 'nA', 'Sıcaklıkla yaklaşık her 10 °C\'de iki katına çıkar; yüksek empedanslı devrelerde ve sıcakta önemlidir.', 'Roughly doubles per 10 °C; matters in high-impedance circuits and at high temperature.', '—'],
    ['Anahtarlama süreleri (t_on, t_off, t_s)', 'Switching times (t_on, t_off, t_s)', 'ns', 'Depolama süresi t_s derin doymada uzar; hızlı anahtarlama için aşırı sürmeyin veya Baker kıskacı kullanın.', 'Storage time t_s grows in deep saturation; do not overdrive for fast switching, or use a Baker clamp.', '—'],
    ['Early gerilimi (V_A) / çıkış direnci', 'Early voltage (V_A) / output resistance', 'V, Ω', 'Aktif bölgede I_C\'nin V_CE ile artması; r_o = V_A / I_C.', 'Rise of I_C with V_CE in the active region; r_o = V_A / I_C.', '50–200 V'],
    ['Gürültü (NF, e_n)', 'Noise (NF, e_n)', 'dB, nV/√Hz', 'Düşük gürültülü ön yükseltici için düşük taban direnci (r_bb\') ve uygun kollektör akımı seçilir.', 'Low-noise preamplifiers need low base spreading resistance (r_bb\') and a suitable collector current.', '—'],
    ['Termal kaçak', 'Thermal runaway', '—', 'Sıcaklık artınca I_C artar, güç artar, sıcaklık daha da artar; emiter direnci ve soğutucu ile önlenir.', 'Higher temperature raises I_C, which raises power and temperature further; prevented with an emitter resistor and heat sink.', '—'],
    ['Paket ve grup (hFE bin)', 'Package and gain group (hFE bin)', '—', 'TO-92, SOT-23, SOT-223, TO-220, TO-247; BC547A/B/C gibi hFE grupları.', 'TO-92, SOT-23, SOT-223, TO-220, TO-247; hFE groups such as BC547A/B/C.', '—'],
    ['Güvenilirlik / ESD', 'Reliability / ESD', '—', 'AEC-Q101 (otomotiv); ESD dayanımı (HBM).', 'AEC-Q101 (automotive); ESD withstand (HBM).', '—'],
  ],
  tech: {
    title: ['Transistör türleri', 'Transistor types'],
    head: [['Tür', 'Type'], ['Kontrol', 'Control'], ['Tipik akım / gerilim', 'Typical current / voltage'], ['Hız', 'Speed'], ['Özellik ve tipik kullanım', 'Feature and typical use']],
    rows: [
      [['BJT NPN', 'BJT NPN'], ['akımla (taban)', 'current (base)'], '0.1–100 A, 30–1500 V', ['orta–yüksek', 'medium–high'], ['GND referanslı düşük taraf anahtar, yükselteç (BC547, 2N3904, 2N2222)', 'Ground-referenced low-side switch, amplifier (BC547, 2N3904, 2N2222)']],
      [['BJT PNP', 'BJT PNP'], ['akımla (taban)', 'current (base)'], '0.1–100 A, 30–1500 V', ['orta–yüksek', 'medium–high'], ['Besleme tarafı (high-side) anahtar, tamamlayıcı çift (BC557, 2N3906)', 'High-side switch, complementary pair (BC557, 2N3906)']],
      [['Darlington (NPN/PNP)', 'Darlington (NPN/PNP)'], ['akımla, çok küçük taban akımı', 'current, very low base current'], '0.5–20 A', ['yavaş', 'slow'], ['Çok yüksek kazanç (β ≈ 1000+); V_CE(sat) ≈ 1 V (BC517, TIP120, ULN2003)', 'Very high gain (β ≈ 1000+); V_CE(sat) ≈ 1 V (BC517, TIP120, ULN2003)']],
      [['Sziklai (tamamlayıcı çift)', 'Sziklai (complementary pair)'], ['akımla', 'current'], ['—', '—'], ['orta', 'medium'], ['Darlington benzeri, tek V_BE düşüşü; ses çıkış katı', 'Darlington-like with a single V_BE drop; audio output stages']],
      [['Dijital transistör (dirençli)', 'Digital transistor (with resistors)'], ['gerilimle (iç dirençler)', 'voltage (internal resistors)'], '50–100 mA', ['orta', 'medium'], ['Taban ve taban–emiter dirençleri içeride; MCU çıkışı ile doğrudan sürülür', 'Base and base–emitter resistors built in; driven straight from an MCU output']],
      [['MOSFET N / P (zenginleştirme)', 'MOSFET N / P (enhancement)'], ['gerilimle (kapı)', 'voltage (gate)'], '0.1–200 A, 20–1000 V', ['çok yüksek', 'very high'], ['Düşük R_DS(on); güç anahtarı, SMPS, motor sürücü', 'Low R_DS(on); power switch, SMPS, motor drive']],
      [['MOSFET (tüketme)', 'MOSFET (depletion)'], ['gerilimle', 'voltage'], ['—', '—'], ['yüksek', 'high'], ['Normalde açık; sabit akım kaynağı, başlatma devresi', 'Normally on; constant-current source, start-up circuit']],
      [['JFET (N / P)', 'JFET (N / P)'], ['gerilimle (kapı)', 'voltage (gate)'], '1–20 mA', ['yüksek', 'high'], ['Çok yüksek giriş empedansı, düşük gürültü; ön yükseltici, analog anahtar', 'Very high input impedance, low noise; preamplifier, analog switch']],
      [['IGBT', 'IGBT'], ['gerilimle (kapı)', 'voltage (gate)'], '10–600 A, 600–6500 V', ['orta', 'medium']  , ['Yüksek gerilim ve akım; motor sürücü, invertör', 'High voltage and current; motor drives, inverters']],
      [['GaN / SiC FET', 'GaN / SiC FET'], ['gerilimle (kapı)', 'voltage (gate)'], '10–100 A, 650–1700 V', ['çok yüksek', 'very high'], ['Çok düşük kayıp ve yüksek frekans; yüksek verimli güç dönüşümü', 'Very low loss and high frequency; high-efficiency power conversion']],
      [['Fototransistör', 'Phototransistor'], ['ışıkla', 'light'], ['mA', 'mA'], ['yavaş', 'slow'], ['Işık algılama, optokuplör', 'Light sensing, optocouplers']],
      [['UJT / PUT', 'UJT / PUT'], ['gerilim eşiği', 'voltage threshold'], ['—', '—'], ['—', '—'], ['Gevşemeli osilatör, tristör tetikleme (eski/özel)', 'Relaxation oscillator, thyristor triggering (legacy / special)']],
    ],
  },
  wiz: {
    fields: [
      { id: 'app', tr: 'Uygulama', en: 'Application', def: 'low', opts: [['low', 'Düşük taraf anahtar (LED, röle, buzzer)', 'Low-side switch (LED, relay, buzzer)'], ['high', 'Yüksek taraf (besleme tarafı) anahtar', 'High-side switch'], ['amp', 'Küçük sinyal yükselteç', 'Small-signal amplifier'], ['lnoise', 'Düşük gürültülü / ses ön yükselteç', 'Low-noise / audio preamplifier'], ['rf', 'RF / yüksek frekans', 'RF / high frequency'], ['pwr', 'Doğrusal güç / geçiş elemanı', 'Linear power / pass element'], ['cs', 'Akım kaynağı / ayna', 'Current source / mirror'], ['dig', 'Seviye kaydırma / evirici (dijital)', 'Level shift / inverter (digital)']] },
      { id: 'i', tr: 'Kollektör akımı', en: 'Collector current', def: 'm', opts: [['s', '< 100 mA', '< 100 mA'], ['m', '100 mA – 1 A', '100 mA – 1 A'], ['l', '1 – 5 A', '1 – 5 A'], ['x', '> 5 A', '> 5 A']] },
      { id: 'v', tr: 'Gerilim', en: 'Voltage', def: 'l', opts: [['l', '< 40 V', '< 40 V'], ['m', '40 – 100 V', '40 – 100 V'], ['h', '100 – 400 V', '100 – 400 V'], ['x', '> 400 V', '> 400 V']] },
      { id: 'f', tr: 'Hız / frekans', en: 'Speed / frequency', def: 'lf', opts: [['dc', 'DC / yavaş', 'DC / slow'], ['lf', '< 1 MHz', '< 1 MHz'], ['mf', '1 – 100 MHz', '1 – 100 MHz'], ['hf', '> 100 MHz', '> 100 MHz']] },
      { id: 'env', tr: 'Ortam', en: 'Environment', def: 'n', opts: [['n', 'Normal', 'Normal'], ['a', 'Otomotiv (AEC-Q101)', 'Automotive (AEC-Q101)'], ['h', 'Sıcak (> 125 °C)', 'Hot (> 125 °C)']] },
    ],
    run(v) {
      const R = {
        low: [['NPN anahtar (BC547, 2N3904 / BC337, 2N2222)', 'NPN switch (BC547, 2N3904 / BC337, 2N2222)'], ['Yük kollektörde, emiter GND\'de. Taban direncini zorlanmış β ≈ 10 ile hesaplayın (Hesaplayıcılar sekmesi); röle için ters diyot ekleyin.', 'Load at the collector, emitter on GND. Compute the base resistor with forced β ≈ 10 (Calculators tab); add a flyback diode for relays.']],
        high: [['PNP anahtar (BC557, 2N3906 / BC327) veya P-MOSFET', 'PNP switch (BC557, 2N3906 / BC327) or P-MOSFET'], ['Emiter pozitif beslemede; taban GND\'ye çekilince iletir. Mikrodenetleyici 3,3 V ile besleme 12 V ise taban sürmek için seviye kaydırma gerekir.', 'Emitter on the positive supply; conducts when the base is pulled toward GND. If an MCU at 3.3 V drives a 12 V supply, a level shifter is needed to turn the base off.']],
        amp: [['Küçük sinyal NPN (BC547B/C, 2N3904)', 'Small-signal NPN (BC547B/C, 2N3904)'], ['Gerilim bölücü ve emiter direnciyle kararlı polarma; kazanç β\'ya bağlı olmasın diye emiter degenerasyonu kullanın.', 'Use divider bias and an emitter resistor for stable bias; use emitter degeneration so gain does not depend on β.']],
        lnoise: [['Düşük gürültülü BJT (BC549C, 2SC945, BC550C) veya JFET', 'Low-noise BJT (BC549C, 2SC945, BC550C) or JFET'], ['Düşük r_bb\' ve uygun I_C (yaklaşık 0,1–1 mA); kaynak empedansı yüksekse JFET daha iyidir.', 'Low r_bb\' and a suitable I_C (about 0.1–1 mA); a JFET is better if the source impedance is high.']],
        rf: [['Yüksek f_T RF transistör (BFR/BFG, 2N3866)', 'High-f_T RF transistor (BFR/BFG, 2N3866)'], ['f_T, çalışma frekansının en az 5–10 katı olmalı; C_ob, kararlılık ve düzen (layout) belirleyici.', 'f_T should be at least 5–10× the operating frequency; C_ob, stability and layout are decisive.']],
        pwr: [['Güç transistörü (TIP31/32, BD139/140, 2N3055) veya Darlington', 'Power transistor (TIP31/32, BD139/140, 2N3055) or Darlington'], ['P = (V_in − V_out)·I; SOA ve soğutucu hesabı yapın, termal kaçak için emiter direnci ekleyin.', 'P = (V_in − V_out)·I; check SOA and heat sink, and add an emitter resistor against thermal runaway.']],
        cs: [['Eşleşmiş çift (BCM847) veya emiter dirençli tek transistör', 'Matched pair (BCM847) or single transistor with emitter resistor'], ['Akım aynasında aynı paket/ısı, β ve V_BE eşleşmesi önemlidir; emiter dirençleri doğruluğu artırır.', 'In a current mirror the same package/heat and β/V_BE matching matter; emitter resistors improve accuracy.']],
        dig: [['Dijital (dirençli) transistör veya küçük NPN + iki direnç', 'Digital (resistor-equipped) transistor or a small NPN + two resistors'], ['Taban direnci ve taban–emiter çekme direnci içeride; kart alanı ve parça sayısını azaltır.', 'Base resistor and base–emitter pull-down are built in; saves board area and part count.']],
      }[v.app];
      const why = [R[1]];
      if (v.i === 'x') why.push(['5 A üstü: MOSFET veya IGBT daha verimli; BJT\'de kazanç düşer ve taban akımı büyür.', 'Above 5 A: a MOSFET or IGBT is more efficient; BJT gain drops and base current becomes large.']);
      else if (v.i === 'l') why.push(['1–5 A: TIP/BD serisi veya Darlington; soğutucu ve taban akımı (β ≈ 10–20) hesaplanmalı.', '1–5 A: TIP/BD series or Darlington; compute heat sink and base current (β ≈ 10–20).']);
      else if (v.i === 'm') why.push(['100 mA – 1 A: BC337/BC327, 2N2222, BD139/140 uygundur.', '100 mA – 1 A: BC337/BC327, 2N2222, BD139/140 are suitable.']);
      if (v.v === 'h' || v.v === 'x') why.push(['Yüksek gerilim: yüksek V_CEO\'lu transistör (MJE340, BF459) veya MOSFET; gerilim payı en az %30.', 'High voltage: a transistor with high V_CEO (MJE340, BF459) or a MOSFET; keep at least 30 % margin.']);
      if (v.f === 'hf') why.push(['100 MHz üstü: f_T ≥ 1 GHz olan RF transistör gerekir.', 'Above 100 MHz: an RF transistor with f_T ≥ 1 GHz is needed.']);
      else if (v.f === 'mf') why.push(['1–100 MHz: f_T ≥ 300 MHz tercih edin (BC547\'nin f_T\'si ≈ 300 MHz).', '1–100 MHz: prefer f_T ≥ 300 MHz (BC547 has f_T ≈ 300 MHz).']);
      if (v.env === 'a') why.push(['Otomotiv: AEC-Q101 sertifikalı seri (ör. BC847 ailesi).', 'Automotive: AEC-Q101 qualified series (e.g. the BC847 family).']);
      if (v.env === 'h') why.push(['Sıcak ortam: T_j(max) ≥ 150 °C, β ve V_BE kaymasını hesaba katın; kaçak akım artar.', 'Hot environment: T_j(max) ≥ 150 °C; allow for β and V_BE drift; leakage rises.']);
      return { main: R[0], why };
    },
  },
  // calculators are shown in headed groups, one application at a time
  // calculators are shown in two groups (NPN / PNP); same formulas, mirrored polarity
  calcGroups: [
    ['npn', 'NPN transistör', 'NPN transistor', 'Emiter toprakta (düşük taraf anahtar) ya da emiter direnci üzerinden; taban pozitif sürülür. Anahtar, kollektör akımı, polarma ve güç/sıcaklık.', 'Emitter on ground (low-side switch) or via an emitter resistor; the base is driven positive. Switch, collector current, bias and power/temperature.'],
    ['pnp', 'PNP transistör', 'PNP transistor', 'Emiter beslemede (yüksek taraf anahtar); taban emitere göre negatif (toprağa doğru) sürülür. Aynı dört hesaplayıcı, PNP polaritesiyle.', 'Emitter on the supply (high-side switch); the base is driven negative with respect to the emitter (towards ground). The same four calculators with PNP polarity.'],
  ],
  calcs: [...bjtCalcs(false), ...bjtCalcs(true)],
};
