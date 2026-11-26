/* الأنظمة والقوانين العسكرية: بحث + تصفية بالدرجات + لائحة العقوبات (البيانات في rules-data.js) */
(function () {
  const $ = (id) => document.getElementById(id);
  const box = $('rl-degrees'); if (!box) return;
  const search = $('rl-search'), clear = $('rl-clear'), meta = $('rl-meta'), empty = $('rl-empty'), chips = $('rl-chips');
  const COLORS = ['#35d07f', '#8fd14f', '#d9c52f', '#eba23a', '#ee7a3a', '#e5484d', '#b91c1c'];
  let degree = 'all';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hl = (t, q) => { const s = esc(t); return q ? s.replace(new RegExp('(' + rx(esc(q)) + ')', 'gi'), '<mark class="hit">$1</mark>') : s; };

  function render() {
    const q = search.value.trim(), low = q.toLowerCase();
    let total = 0, html = '';
    DEGREES_DATA.forEach((d) => {
      if (degree !== 'all' && String(d.num) !== degree) return;
      const items = q ? d.items.filter(([c, t]) => c.toLowerCase().includes(low) || t.toLowerCase().includes(low)) : d.items;
      if (!items.length) return;
      total += items.length;
      const col = COLORS[d.num - 1];
      html += `<section id="rl-deg-${d.num}" class="rl-deg surface-card rounded-2xl p-5 sm:p-6" style="--dc:${col}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 rl-deg-head">
          <div class="flex items-center gap-3.5">
            <div class="rl-num">${d.num}</div>
            <div><h3 class="text-xl sm:text-2xl font-extrabold text-white">${esc(d.title)}</h3>
            <p class="text-xs sm:text-sm text-slate-400 mt-0.5">${esc(d.subtitle)}</p></div>
          </div>
          <span class="rl-count">${items.length} بند</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${items.map(([c, t]) => `<button type="button" class="rl-item" data-copy="${esc(c + ' - ' + t)}" title="اضغط لنسخ البند">
            <span class="rl-code">${hl(c, q)}</span><span class="rl-text">${hl(t, q)}</span><i class="fa-regular fa-copy rl-cp"></i></button>`).join('')}
        </div></section>`;
    });
    box.innerHTML = html;
    empty.classList.toggle('hidden', total > 0);
    clear.classList.toggle('hidden', !q);
    meta.textContent = q ? `نتائج البحث عن "${q}": ${total} بند` : '';
    box.querySelectorAll('.rl-deg').forEach((el, i) => { el.style.animationDelay = (i * 70) + 'ms'; });
  }

  function penalties() {
    $('rl-matrices').innerHTML = PENALTY_MATRICES.map((m) => `<div class="surface-card rounded-2xl p-5" style="--dc:${COLORS[m.deg - 1]}">
      <div class="flex items-center gap-3 mb-4 pb-3 rl-deg-head"><span class="rl-num sm">${m.deg}</span><h3 class="text-base sm:text-lg font-extrabold text-white">${esc(m.title)}</h3></div>
      <div class="rl-rows">${m.rows.map(([r, p]) => `<div class="rl-row"><span>${esc(r)}</span><b>${esc(p)}</b></div>`).join('')}</div></div>`).join('');
    $('rl-upper').innerHTML = UPPER_DEGREES.map((u, i) => `<div class="surface-card rounded-2xl p-5" style="--dc:${COLORS[4 + i]}">
      <div class="text-base font-extrabold mb-2" style="color:var(--dc)">${u.icon} ${esc(u.title)}</div>
      <p class="text-sm text-slate-300"><strong class="text-white">جميع الرتب:</strong> ${esc(u.desc)}</p></div>`).join('');
    $('rl-general').innerHTML = GENERAL_RULES.map((r) => `<li class="rl-rule"><i class="fa-solid fa-circle-check"></i><span>${r}</span></li>`).join('');
  }

  const total = DEGREES_DATA.reduce((a, d) => a + d.items.length, 0);
  const tc = $('rl-total'); if (tc) { tc.dataset.count = total; tc.textContent = total; }

  search.addEventListener('input', render);
  clear.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  $('rl-reset').addEventListener('click', () => { search.value = ''; degree = 'all'; setChip(); render(); });
  function setChip() { chips.querySelectorAll('[data-d]').forEach((c) => c.classList.toggle('active', c.dataset.d === degree)); }
  chips.addEventListener('click', (e) => {
    const c = e.target.closest('[data-d]'); if (!c) return;
    degree = c.dataset.d; setChip(); render();
    if (degree !== 'all') box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  box.addEventListener('click', (e) => {
    const it = e.target.closest('.rl-item'); if (!it) return;
    copyRawText(it.dataset.copy);
    it.classList.add('copied'); setTimeout(() => it.classList.remove('copied'), 900);
  });
  setChip(); render(); penalties();
})();
