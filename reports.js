/* التقارير الميدانية + تسمية الموجة + الخرائط (من النسخة الأصلية) */
const MENTION_ROLE = '|| <@&1562013445459542116> ||';


function copyAllRadioCodes() {
  const codesText = [
    'حرس الحدود - أكواد اللاسلكي (الجدول الموحد للأكواد)',
    'كود 1 : هروب من نقطة تفتيش',
    'كود 2 : وحدة نقل',
    'كود 3 : مطاردة جنائية',
    'كود 4 : حالة اطلاق نار',
    'كود 5 : عسكري مسقط',
    'كود 6 : تعامل مع حالة',
    'كود 7 : غفوة',
    'كود 8 : حالة تهريب',
    'كود 9 : العودة الى الموجة',
    'كود 10 : طلب وحدة اسعافية او ميكانيك'
  ].join('\n');
  copyRawText(codesText);
}

function generateWaveName() {
  const codeEl = document.getElementById('wave-code');
  const roleEl = document.getElementById('wave-role');
  const outEl = document.getElementById('wave-output');
  if (!codeEl || !roleEl || !outEl) return;

  const rawCode = (codeEl.value || '').trim().replace(/^h-/i, '');
  const role = roleEl.value;
  if (!rawCode && !role) {
    showToast('أدخل رقم الكود واختر التوجيه أولاً');
    return;
  }
  const normalizedCode = rawCode ? `H-${rawCode.toUpperCase()}` : 'H-000';
  outEl.value = role ? `${normalizedCode} | ${role}` : normalizedCode;
  showToast('تم إنشاء تسمية الموجة!');
}

function switchReportTab(tabKey) {
  const keys = ['port', 'sandy', 'area', 'officers'];
  keys.forEach((key) => {
    const tabBtn = document.getElementById(`tab-${key}`);
    const formEl = document.getElementById(`form-${key}`);
    const isActive = key === tabKey;

    if (tabBtn) {
      tabBtn.className = isActive
        ? 'report-tab active-tab px-4 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-bgreen-600 text-white shadow-emerald-glow border border-bgreen-400 cursor-pointer'
        : 'report-tab px-4 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-bgdark-800 text-slate-300 hover:text-white border border-bgreen-500/20 hover:border-bgreen-500/50 cursor-pointer';
    }
    if (formEl) {
      formEl.classList.toggle('hidden', !isActive);
    }
  });
}

function resetForm(formId) {
  const form = document.getElementById(formId);
  if (form) form.reset();
  const output = document.getElementById('report-output');
  if (output) output.value = '';
  showToast('تم مسح الحقول');
}

function formatMentionAt(val) {
  const clean = (val || '').trim();
  if (!clean) return '@';
  if (/^\d+$/.test(clean)) return `<@${clean}>`;
  return clean.startsWith('<@') ? clean : `@${clean}`;
}

function formatMentionOptional(val) {
  const clean = (val || '').trim();
  if (!clean) return '';
  if (/^\d+$/.test(clean)) return `<@${clean}>`;
  return clean.startsWith('<@') ? clean : `@${clean}`;
}

function formatCodeVal(val) {
  const clean = (val || '').trim();
  if (!clean) return 'H-000';
  return /^h-/i.test(clean) ? clean.toUpperCase() : `H-${clean}`;
}

function formatNumberedUnitList(val, defaultLabels) {
  const clean = (val || '').trim();
  const labels = Array.isArray(defaultLabels) && defaultLabels.length ? defaultLabels : ['وحدة 1'];

  if (!clean) {
    return labels.map((lbl) => `${lbl} : H-000`).join('\n');
  }

  const parts = clean
    .split(/[\n،,.]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!parts.length) {
    return labels.map((lbl) => `${lbl} : H-000`).join('\n');
  }

  const basePrefix = labels[0].replace(/\s*\d+$/, '').trim();
  return parts
    .map((part, index) => {
      const colonMatch = part.match(/^([^:]+?)\s*:\s*(.+)$/);
      if (colonMatch) {
        return `${colonMatch[1].trim()} : ${formatCodeVal(colonMatch[2].trim())}`;
      }
      const label = labels[index] || `${basePrefix} ${index + 1}`;
      return `${label} : ${formatCodeVal(part)}`;
    })
    .join('\n');
}

function formatGeneralSupervisorAndSaqr(val) {
  const clean = (val || '').trim();
  const parts = clean
    ? clean
        .split(/[\n،,.]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const lines = [];
  const firstVal = parts[0] || '';
  const firstColon = firstVal.match(/^([^:]+?)\s*:\s*(.+)$/);
  if (firstColon) {
    lines.push(`${firstColon[1].trim()} : ${formatCodeVal(firstColon[2].trim())}`);
  } else {
    lines.push(`مشرف عام : ${formatCodeVal(firstVal)}`);
  }

  const remaining = parts.slice(1);
  const extraCount = Math.max(remaining.length, 3);
  for (let i = 0; i < extraCount; i++) {
    const rawItem = remaining[i] || '';
    const colonMatch = rawItem.match(/^([^:]+?)\s*:\s*(.+)$/);
    if (colonMatch) {
      lines.push(`${colonMatch[1].trim()} : ${formatCodeVal(colonMatch[2].trim())}`);
    } else {
      lines.push(`صقر ${i + 1} : ${formatCodeVal(rawItem)}`);
    }
  }

  return lines.join('\n');
}

function getVal(id, fallback = '') {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const v = (el.value || '').trim();
  return v || fallback;
}

function setReportOutput(text) {
  const output = document.getElementById('report-output');
  if (output) {
    output.value = text;
    output.scrollTop = 0;
  }
  showToast('تم إنشاء التقرير بنجاح!');
}

function buildPortReport() {
  try {
    const startTime = getVal('p-start', '0:00 م');
    const endTime = getVal('p-end', '0:00 م');

    const leader = formatMentionAt(getVal('p-leader'));
    const deputy = formatMentionAt(getVal('p-deputy'));
    const assistant = formatMentionAt(getVal('p-assistant'));
    const deputyAssistant = formatMentionAt(getVal('p-deputy-assistant'));
    const emergencyDeputy = formatMentionAt(getVal('p-emergency-deputy'));

    const ops = formatMentionAt(getVal('p-ops'));
    const deputyOps = formatMentionAt(getVal('p-deputy-ops'));

    const mp = formatNumberedUnitList(getVal('p-mp'), ['الشرطة العسكرية 1', 'الشرطة العسكرية 2', 'الشرطة العسكرية 3']);
    const air = formatNumberedUnitList(getVal('p-air'), ['عين م 1', 'عين م 2', 'عين م 3']);
    const barq = formatNumberedUnitList(getVal('p-barq'), ['برق 1', 'برق 2', 'برق 3']);
    const raad = formatNumberedUnitList(getVal('p-raad'), ['رعد 1', 'رعد 2', 'رعد 3']);
    const saqr = formatGeneralSupervisorAndSaqr(getVal('p-saqr'));
    const ain = formatNumberedUnitList(getVal('p-ain'), ['عين 1', 'عين 2', 'عين 3']);
    const sahm = formatNumberedUnitList(getVal('p-sahm'), ['سهم 1', 'سهم 2', 'سهم 3']);
    const guardSup = formatNumberedUnitList(getVal('p-guard-sup'), ['مشرف حرس 1', 'مشرف حرس 2', 'مشرف حرس 3']);
    const hurra = formatNumberedUnitList(getVal('p-hurra'), ['حرة 1', 'حرة 2', 'حرة 3']);
    const gate = formatNumberedUnitList(getVal('p-gate'), ['حرس 1', 'حرس 2', 'حرس 3']);
    const hazm = formatNumberedUnitList(getVal('p-hazm'), ['حزم 1', 'حزم 2', 'حزم 3']);

    const report = [
      'تقرير استلام الميناء الرئيسي',
      '',
      `تم استلام مهام العمليات في تمام الساعة ${startTime} الى ${endTime}`,
      '',
      `قائد حرس الحدود: ${leader}`,
      `نائب القائد: ${deputy}`,
      `مساعد القائد: ${assistant}`,
      `نائب مساعد القائد: ${deputyAssistant}`,
      `نائب قائد سرية الطوارئ: ${emergencyDeputy}`,
      '',
      `العمليات: ${ops}`,
      `نائب العمليات: ${deputyOps}`,
      '',
      '[ الشرطة العسكرية ]',
      mp,
      '',
      '[ الدعم الجوي - عين م ]',
      air,
      '',
      '[ برق ] من رتبة عقيد وما فوق',
      barq,
      '',
      '[ رعد ] من رتبة رائد الى مقدم',
      raad,
      '',
      '[ مشرف عام، صقر ] من رتبة ملازم الى نقيب',
      saqr,
      '',
      '[ عين ]',
      ain,
      '',
      '[ سهم ] رتبة رقيب الى رئيس رقباء ',
      sahm,
      '',
      '[ مشرف حرس ] من رتبة رقيب الى رقيب أول',
      guardSup,
      '',
      '[ حرة 1، حرة 2، حرة 3 ] من رتبة جندي الى وكيل رقيب',
      hurra,
      '',
      '[ حرس 1، حرس 2، حرس 3 ] حرس بوابة الميناء - من رتبة جندي الى وكيل رقيب',
      gate,
      '',
      '[ حزم 1, حزم 2 , حزم 3 ] مسميات الـS.S.F',
      hazm,
      '',
      MENTION_ROLE
    ].join('\n');

    setReportOutput(report);
  } catch (err) {
    showToast('حدث خطأ أثناء إنشاء التقرير');
  }
}

function buildSandyReport() {
  try {
    const startTime = getVal('s-start', '0:00 م');
    const endTime = getVal('s-end', '0:00 م');

    const leader = formatMentionAt(getVal('s-leader'));
    const deputy = formatMentionAt(getVal('s-deputy'));
    const assistant = formatMentionAt(getVal('s-assistant'));
    const deputyAssistant = formatMentionAt(getVal('s-deputy-assistant'));
    const emergencyLeader = formatMentionAt(getVal('s-emergency-leader'));
    const emergencyDeputy = formatMentionAt(getVal('s-emergency-deputy'));

    const ops = formatMentionOptional(getVal('s-ops'));
    const deputyOps = formatMentionOptional(getVal('s-deputy-ops'));

    const mp = formatNumberedUnitList(getVal('s-mp'), ['الشرطة العسكرية 1', 'الشرطة العسكرية 2', 'الشرطة العسكرية 3']);
    const air = formatNumberedUnitList(getVal('s-air'), ['عين م 1', 'عين م 2', 'عين م 3']);
    const barq = formatNumberedUnitList(getVal('s-barq'), ['برق 1', 'برق 2', 'برق 3']);
    const raad = formatNumberedUnitList(getVal('s-raad'), ['رعد 1', 'رعد 2', 'رعد 3']);
    const saqr = formatNumberedUnitList(getVal('s-saqr'), ['صقر 1', 'صقر 2', 'صقر 3']);
    const sahm = formatNumberedUnitList(getVal('s-sahm'), ['سهم 1', 'سهم 2', 'سهم 3']);
    const seen = formatNumberedUnitList(getVal('s-seen'), ['سين 1', 'سين 2', 'سين 3']);
    const hazm = formatNumberedUnitList(getVal('s-hazm'), ['حزم 1', 'حزم 2', 'حزم 3']);

    const report = [
      'تقرير ساندي وبوليتو و لوس',
      '',
      `تم استلام مهام العمليات في تمام الساعة ${startTime} الى ${endTime}`,
      '',
      `قائد حرس الحدود: ${leader}`,
      `نائب القائد حرس الحدود: ${deputy}`,
      `مساعد القائد حرس الحدود: ${assistant}`,
      '',
      `نائب مساعد القائد حرس الحدود: ${deputyAssistant}`,
      `قائد قوات سرية الطوارئ: ${emergencyLeader}`,
      `نائب قائد سرية الطوارئ: ${emergencyDeputy}`,
      '',
      `العمليات: ${ops}`.trim(),
      `نائب العمليات: ${deputyOps}`.trim(),
      '',
      '[ الشرطة العسكرية ]',
      mp,
      '',
      '[ الدعم الجوي - عين م ]',
      air,
      '',
      '[ برق ] من رتبة عقيد وما فوق',
      barq,
      '',
      '[ رعد ] من رتبة رائد الى مقدم',
      raad,
      '',
      '[ صقر ] من رتبة ملازم الى نقيب',
      saqr,
      '',
      '[ سهم ] رتبة رقيب الى رئيس رقباء ',
      sahm,
      '',
      '[ سين 1، سين 2، سين 3 ] من رتبة جندي الى وكيل رقيب',
      seen,
      '',
      '[ حزم 1, حزم 2 , حزم 3 ] مسميات الـS.S.F',
      hazm,
      '',
      MENTION_ROLE
    ].join('\n');

    setReportOutput(report);
  } catch (err) {
    showToast('حدث خطأ أثناء إنشاء التقرير');
  }
}

function buildAreaReport() {
  try {
    const startTime = getVal('a-start', '');
    const endTime = getVal('a-end', '');
    const rank = getVal('a-rank', '');
    const code = getVal('a-code') ? formatCodeVal(getVal('a-code')) : '';
    const posNotes = getVal('a-pos', '');
    const negNotes = getVal('a-neg', '');
    const opsRaw = getVal('a-ops', '').replace(/[<@>]/g, '').trim();
    const ops = opsRaw ? `<@${opsRaw}>` : '<@>';
    const radioEval = getVal('a-radio', '');
    const submitterRaw = getVal('a-submitter', '').replace(/[<@>]/g, '').trim();
    const submitter = submitterRaw ? `<@${submitterRaw}>` : '<@>';

    const report = [
      'تقرير ضابط منطقة',
      '',
      `تم استلام تقرير ضابط المنطقة في تمام الساعة ${startTime} الى ${endTime}`,
      '',
      `الرتبة: ${rank}`,
      `الكود: ${code}`,
      '',
      'الملاحظات الإيجابية:',
      posNotes,
      '',
      'الملاحظات السلبية:',
      negNotes,
      '',
      `العمليات: ${ops}`,
      '',
      'تقييم بلاغات الراديو:',
      radioEval,
      '',
      `تم رفع التقرير من قبل: ${submitter}`,
      '',
      MENTION_ROLE
    ].join('\n');

    setReportOutput(report);
  } catch (err) {
    showToast('حدث خطأ أثناء إنشاء التقرير');
  }
}

function buildOfficersReport() {
  try {
    const mission = getVal('o-mission', '');
    const startTime = getVal('o-start', '');
    const endTime = getVal('o-end', '');
    const officerName = getVal('o-name', '');
    const assignedOps = getVal('o-ops', '');
    const notes = getVal('o-notes', '');
    const unitsCount = getVal('o-units', '');
    const ainUnit = getVal('o-ain', '');
    const signature = getVal('o-signature') ? formatMentionAt(getVal('o-signature')) : '';

    const report = [
      'تقرير الضباط',
      '',
      `تم استلام مهام ${mission} في تمام الساعة ${startTime} الى ${endTime}`,
      '',
      `اسم الضابط: ${officerName}`,
      '',
      'العمليات المكلف بها:',
      assignedOps,
      '',
      'ملاحظات في الميدان:',
      notes,
      '',
      `عدد الوحدات تحت إشراف الضابط: ${unitsCount}`,
      '',
      `هل تم إخراج وحدة عين: ${ainUnit}`,
      '',
      `توقيع استلام الضابط: ${signature}`,
      '',
      MENTION_ROLE
    ].join('\n');

    setReportOutput(report);
  } catch (err) {
    showToast('حدث خطأ أثناء إنشاء التقرير');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function openMapLightbox(title, sourceId) {
  const sourceEl = document.getElementById(sourceId);
  const svgEl = sourceEl ? sourceEl.querySelector('svg') : null;
  const lightbox = document.getElementById('map-lightbox');
  const titleEl = document.getElementById('lightbox-title');
  const contentEl = document.getElementById('lightbox-content');

  if (!svgEl || !lightbox || !titleEl || !contentEl) return;

  const clonedSvg = svgEl.cloneNode(true);
  clonedSvg.removeAttribute('class');
  clonedSvg.className = 'w-full max-h-[75vh] h-auto rounded-xl';

  titleEl.textContent = title;
  contentEl.innerHTML = '';
  contentEl.appendChild(clonedSvg);
  lightbox.classList.remove('hidden');
}

