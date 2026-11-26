/* محرك النماذج الإدارية (بدون DOM) — يُنشأ بعد فك التشفير بكلمة السر */
const FORM_GROUP_META = {
  'الكلية العسكرية': { icon: 'fa-graduation-cap', hint: 'الدورات والمدربين والمناصب' },
  'شؤون التجنيد': { icon: 'fa-user-plus', hint: 'مهام ومسؤولي التجنيد' },
  'التوظيف': { icon: 'fa-id-card-clip', hint: 'توظيف الدفعات واللاعبين' },
  'الشؤون الإدارية': { icon: 'fa-briefcase', hint: 'الإجازات والاستقالات والتعيينات' },
  'الشرطة العسكرية / المجلس العسكري': { icon: 'fa-gavel', hint: 'الأحكام والاستدعاءات والترقيات' }
};

function createFormsCore(FD) {
  const { G, TPL, CFG, LBL, TOP, FORM_TAIL } = FD;
  const FORMS = [];
  G.forEach(([g, list]) => {
    list.forEach(([t, f]) => {
      FORMS.push({
        id: FORMS.length, g, t,
        f: f.map((x) => { const p = x.split(':'); return { k: p[0], l: p[1], ty: p[2], op: p[3] }; })
      });
    });
  });

  function buildFormText(form, rawVals) {
    let n = '';
    const B = [], V = {};
    const m = (x) => '<@' + x.replace(/\D/g, '') + '>';
    form.f.forEach((f, i) => {
      let v = String(rawVals[i] == null ? '' : rawVals[i]).trim();
      if (!v) return;
      if (f.k == 'n') { n = v; V.n = v; return; }
      if (f.ty == 'id') v = m(v);
      else if (f.ty == 'ids') v = v.split(/\n+/).filter(Boolean).map(m).join(' ');
      V[f.k] = v;
      B.push(f.l.replace(/ \(.*\)/, '') + ': ' + v);
    });
    if (TPL[form.t]) {
      const tx = TPL[form.t](V);
      return tx ? tx + FORM_TAIL : '';
    }
    const top = TOP[form.t] || form.t;
    return ['**﷽**', '', '**امر صـادر من  <@&' + CFG.issuer + '>         :    **', '',
      n ? '**` برقية رقم : ' + n + ' `**' : '', '', '**` مــوضــوع الــبــرقــيــة : ' + top + '  `**', '',
      '***' + B.join('\n'), '', '', '***', '**وفقكم الله وجعلها عونً لكم  لـ خدمة القطاع والمدينة **', '',
      '**ترسل نسخة الى : <@&' + CFG.copy + '>     **', '',
      '```diff\n+  في الختام نسأل الله العزيز الحكيم التوفيق والسداد \n```', '', '**توقيع وإعتماد :  **', '',
      CFG.s1, '   ', CFG.s2, '', '|| @everyone   ||'].join('\n');
  }
  return { FORMS, buildFormText, LBL };
}
if (typeof module !== 'undefined') module.exports = { createFormsCore };
