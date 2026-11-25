// Mount Border Guard SVG Emblem across header, hero, and footer
function renderGuardEmblems() {
  const template = document.getElementById('guard-emblem-template');
  if (!template) return;
  const mounts = document.querySelectorAll('.guard-emblem-mount');
  mounts.forEach((mount, idx) => {
    const clone = template.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.remove('hidden');
    clone.classList.add('guard-emblem-svg');
    const clip = clone.querySelector('#inner-medallion-clip');
    const clippedGroup = clone.querySelector('g[clip-path]');
    if (clip && clippedGroup) {
      const uniqueClipId = `inner-medallion-clip-${idx}`;
      clip.setAttribute('id', uniqueClipId);
      clippedGroup.setAttribute('clip-path', `url(#${uniqueClipId})`);
    }
    mount.innerHTML = '';
    mount.appendChild(clone);
  });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

// Toast Notification System
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto flex items-center gap-2.5 px-5 py-3 rounded-xl bg-bgreen-600 text-white font-bold text-sm shadow-emerald-strong border border-bgreen-400 transform transition-all duration-300 translate-y-2 opacity-0';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-white"></i><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// Safe Clipboard Copy
function copyRawText(text) {
  if (!text || !text.trim()) {
    showToast('لا يوجد نص لنسخه!');
    return;
  }
  const tempArea = document.createElement('textarea');
  tempArea.value = text;
  tempArea.style.position = 'fixed';
  tempArea.style.opacity = '0';
  document.body.appendChild(tempArea);
  tempArea.select();
  try {
    document.execCommand('copy');
    showToast('تم النسخ بنجاح!');
  } catch (err) {
    showToast('تعذر النسخ، يرجى النسخ يدوياً');
  } finally {
    document.body.removeChild(tempArea);
  }
}

// Copy text from an input or textarea element by ID
function copyFieldText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  copyRawText(el.value);
}

// Copy all unified radio codes
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

// Generate wave callsign from code and selected role
function generateWaveName() {
  const rawCode = (document.getElementById('wave-code').value || '')
    .trim()
    .replace(/^h-/i, '');
  const role = document.getElementById('wave-role').value;
  if (!rawCode && !role) {
    showToast('أدخل رقم الكود واختر التوجيه أولاً');
    return;
  }
  const normalizedCode = rawCode ? `H-${rawCode.toUpperCase()}` : 'H-000';
  const formatted = role ? `${normalizedCode} | ${role}` : normalizedCode;
  document.getElementById('wave-output').value = formatted;
  showToast('تم إنشاء تسمية الموجة!');
}

// Switch active report tab and form
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

// Reset a report form and clear output
function resetForm(formId) {
  const form = document.getElementById(formId);
  if (form) form.reset();
  const output = document.getElementById('report-output');
  if (output) output.value = '';
  showToast('تم مسح الحقول');
}

// Helper: Format Discord ID to <@ID> if numeric, or '@' if empty
function formatMentionAt(val) {
  const clean = (val || '').trim();
  if (!clean) return '@';
  if (/^\d+$/.test(clean)) return `<@${clean}>`;
  return clean.startsWith('<@') ? clean : `@${clean}`;
}

// Helper: Format Discord ID to <@ID> or empty string
function formatMentionOptional(val) {
  const clean = (val || '').trim();
  if (!clean) return '';
  if (/^\d+$/.test(clean)) return `<@${clean}>`;
  return clean.startsWith('<@') ? clean : `@${clean}`;
}

// Helper: Format callsign code with default H-000
function formatCodeVal(val) {
  const clean = (val || '').trim();
  if (!clean) return 'H-000';
  return /^h-/i.test(clean) ? clean.toUpperCase() : `H-${clean}`;
}

// Helper: Format multiple units/callsigns into clean lines
function formatMultiUnitField(val, prefixLabel = '') {
  const clean = (val || '').trim();
  if (!clean) {
    return prefixLabel ? `${prefixLabel} 1 : H-000` : 'H-000';
  }

  const parts = clean
    .split(/[\n،,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return prefixLabel ? `${prefixLabel} 1 : H-000` : 'H-000';
  }

  return parts
    .map((part, index) => {
      const colonMatch = part.match(/^([^:]+?)\s*:\s*(.+)$/);
      if (colonMatch) {
        const label = colonMatch[1].trim();
        const codePart = formatCodeVal(colonMatch[2].trim());
        return `${label} : ${codePart}`;
      }
      if (prefixLabel) {
        const codePart = formatCodeVal(part);
        return `${prefixLabel} ${index + 1} : ${codePart}`;
      }
      return formatCodeVal(part);
    })
    .join('\n');
}

// Helper: Read value by element ID safely
function getVal(id, fallback = '') {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const v = (el.value || '').trim();
  return v || fallback;
}

// Write generated report into output textarea
function setReportOutput(text) {
  const output = document.getElementById('report-output');
  if (output) {
    output.value = text;
    output.scrollTop = 0;
  }
  showToast('تم إنشاء التقرير بنجاح!');
}

// Build Main Port Takeover Report
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

    const mp = formatMultiUnitField(getVal('p-mp'));
    const air = formatMultiUnitField(getVal('p-air'));
    const barq = formatMultiUnitField(getVal('p-barq'));
    const raad = formatMultiUnitField(getVal('p-raad'));
    const saqr = formatMultiUnitField(getVal('p-saqr'));
    const ain = formatMultiUnitField(getVal('p-ain'));
    const sahm = formatMultiUnitField(getVal('p-sahm'));
    const guardSup = formatMultiUnitField(getVal('p-guard-sup'));
    const hurra = formatMultiUnitField(getVal('p-hurra'), 'حرة');
    const gate = formatMultiUnitField(getVal('p-gate'), 'حرس');
    const hazm = formatMultiUnitField(getVal('p-hazm'), 'حزم');

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
      ',,,,'
    ].join('\n');

    setReportOutput(report);
  } catch (err) {
    showToast('حدث خطأ أثناء إنشاء التقرير');
  }
}

// Build Sandy, Paleto, and Los Report
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

    const mp = formatMultiUnitField(getVal('s-mp'));
    const air = formatMultiUnitField(getVal('s-air'));
    const barq = formatMultiUnitField(getVal('s-barq'));
    const raad = formatMultiUnitField(getVal('s-raad'));
    const saqr = formatMultiUnitField(getVal('s-saqr'));
    const sahm = formatMultiUnitField(getVal('s-sahm'));
    const seen = formatMultiUnitField(getVal('s-seen'), 'سين');
    const hazm = formatMultiUnitField(getVal('s-hazm'), 'حزم');

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
      hazm
    ].join('\n');

    setReportOutput(report);
  } catch (err) {
    showToast('حدث خطأ أثناء إنشاء التقرير');
  }
}

// Build Area Officer Report
function buildAreaReport() {
  try {
    const startTime = getVal('a-start', '0:00 م');
    const endTime = getVal('a-end', '0:00 م');
    const rank = getVal('a-rank', 'غير محدد');
    const code = formatCodeVal(getVal('a-code'));
    const posNotes = getVal('a-pos', 'لا يوجد');
    const negNotes = getVal('a-neg', 'لا يوجد');
    const ops = formatMentionAt(getVal('a-ops'));
    const radioEval = getVal('a-radio', 'جيد');
    const submitter = formatMentionAt(getVal('a-submitter'));

    const report = [
      'تقرير ضابط المنطقة - حرس الحدود (مدينة العمارية)',
      '',
      `وقت البداية: ${startTime}`,
      `وقت النهاية: ${endTime}`,
      `الرتبة: ${rank}`,
      `الكود: ${code}`,
      '',
      `الملاحظات الإيجابية: ${posNotes}`,
      `الملاحظات السلبية: ${negNotes}`,
      '',
      `العمليات: ${ops}`,
      `تقييم بلاغات الراديو: ${radioEval}`,
      `رفع التقرير من قبل: ${submitter}`
    ].join('\n');

    setReportOutput(report);
  } catch (err) {
    showToast('حدث خطأ أثناء إنشاء التقرير');
  }
}

// Build Officers Report
function buildOfficersReport() {
  try {
    const mission = getVal('o-mission', 'إشراف ميداني');
    const startTime = getVal('o-start', '0:00 م');
    const endTime = getVal('o-end', '0:00 م');
    const officerName = getVal('o-name', 'غير محدد');
    const assignedOps = getVal('o-ops', 'غير محدد');
    const notes = getVal('o-notes', 'لا يوجد');
    const unitsCount = getVal('o-units', '0');
    const ainUnit = getVal('o-ain', 'لا');
    const signature = formatMentionAt(getVal('o-signature'));

    const report = [
      'تقرير الضباط - حرس الحدود (مدينة العمارية)',
      '',
      `نوع المهمة: ${mission}`,
      `وقت البداية: ${startTime}`,
      `وقت النهاية: ${endTime}`,
      `اسم الضابط: ${officerName}`,
      `العمليات المكلف بها: ${assignedOps}`,
      `ملاحظات في الميدان: ${notes}`,
      `عدد الوحدات تحت الإشراف: ${unitsCount}`,
      `هل تم إخراج وحدة عين؟ ${ainUnit}`,
      `توقيع استلام الضابط: ${signature}`
    ].join('\n');

    setReportOutput(report);
  } catch (err) {
    showToast('حدث خطأ أثناء إنشاء التقرير');
  }
}

// Generic modal close helper
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

// Open official forms modal
function openFormsModal() {
  const modal = document.getElementById('forms-modal');
  if (modal) modal.classList.remove('hidden');
}

// Open map SVG in full lightbox modal
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

// Smooth navigation helper
function activateView(viewName, targetSectionId = '') {
  if (targetSectionId) {
    const targetEl = document.getElementById(targetSectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close open modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['forms-modal', 'info-modal', 'map-lightbox'].forEach((id) => closeModal(id));
  }
});

// Initialize emblems on load
renderGuardEmblems();
