/* الوظائف المشتركة: الإشعارات، النسخ، التنقل، شريط التقدم، الظهور التدريجي */
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
  }, 2400);
}

function copyRawText(text) {
  if (!text || !text.trim()) {
    showToast('لا يوجد نص لنسخه!');
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('تم النسخ بنجاح!'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
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

function copyFieldText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  copyRawText(el.value);
}

function toggleMobileMenu(force) {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('mobile-menu-btn');
  if (!menu) return;
  const open = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !open);
  if (btn) {
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = open ? '<i class="fa-solid fa-xmark text-xl"></i>' : '<i class="fa-solid fa-bars text-xl"></i>';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal('map-lightbox'); toggleMobileMenu(false); document.querySelectorAll('.dd.open').forEach((x) => x.classList.remove('open')); }
});

(function initChrome() {
  const bar = document.getElementById('scroll-progress');
  const topBtn = document.getElementById('to-top');
  const header = document.getElementById('site-header');

  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const y = window.scrollY || h.scrollTop;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (topBtn) topBtn.classList.toggle('show', y > 700);
    if (header) header.classList.toggle('scrolled', y > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* تمييز القسم الحالي في القائمة */
  const links = Array.from(document.querySelectorAll('[data-nav]'));
  const targets = links.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('active', a.dataset.nav === en.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach((t) => spy.observe(t));
  }

  /* ظهور تدريجي للعناصر */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); const t = en.target; setTimeout(() => t.style.setProperty('--i', '0'), 1600); } });
    }, { threshold: 0.08 });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('in'));
  }

  /* القوائم المنسدلة (للمس والكيبورد) */
  const dds = Array.from(document.querySelectorAll('.dd'));
  dds.forEach((d) => {
    const b = d.querySelector('.dd-btn');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !d.classList.contains('open');
      dds.forEach((x) => { x.classList.remove('open'); x.querySelector('.dd-btn').setAttribute('aria-expanded', 'false'); });
      d.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', () => dds.forEach((x) => { x.classList.remove('open'); x.querySelector('.dd-btn').setAttribute('aria-expanded', 'false'); }));

  /* إغلاق قائمة الجوال عند اختيار رابط */
  document.querySelectorAll('#mobile-menu a').forEach((a) => a.addEventListener('click', () => toggleMobileMenu(false)));
})();
