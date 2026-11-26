/* واجهة النماذج الإدارية: تصنيفات + بحث + نموذج + معاينة مباشرة */
(function () {
  let started = false, api = null;
  const $ = (s) => document.getElementById(s);
  const els = {
    cats: $('af-cats'), search: $('af-search'), grid: $('af-grid'), none: $('af-none'),
    ws: $('af-workspace'), title: $('af-title'), group: $('af-group'), fields: $('af-fields'),
    out: $('af-out'), count: $('af-count'), warn: $('af-warn'), copy: $('af-copy'), copyLbl: $('af-copy-lbl'),
    reset: $('af-reset'), empty: $('af-empty')
  };
  if (!els.cats || !els.grid) return;
  let FORMS, buildFormText, LBL;

  const groups = Object.keys(FORM_GROUP_META);
  let activeGroup = 'all', query = '', cur = null, inputs = [];

  /* ---------- التصنيفات ---------- */
  function renderCats() {
    els.cats.innerHTML = '';
    const mk = (key, label, icon, count) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'af-cat' + (activeGroup === key ? ' active' : '');
      b.setAttribute('aria-pressed', String(activeGroup === key));
      b.innerHTML = '<i class="fa-solid ' + icon + '"></i><span></span><em></em>';
      b.querySelector('span').textContent = label;
      b.querySelector('em').textContent = count;
      b.onclick = () => { activeGroup = key; renderCats(); renderGrid(); };
      els.cats.appendChild(b);
    };
    mk('all', 'الكل', 'fa-layer-group', FORMS.length);
    groups.forEach((g) => mk(g, g, FORM_GROUP_META[g].icon, FORMS.filter((f) => f.g === g).length));
  }

  /* ---------- قائمة النماذج ---------- */
  function renderGrid() {
    els.grid.innerHTML = '';
    const q = query.trim();
    const list = FORMS.filter((f) => (activeGroup === 'all' || f.g === activeGroup) && (!q || f.t.includes(q) || f.g.includes(q)));
    els.none.classList.toggle('hidden', list.length > 0);
    list.forEach((f) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'af-tpl' + (cur && cur.id === f.id ? ' active' : '');
      b.innerHTML = '<i class="fa-solid ' + FORM_GROUP_META[f.g].icon + '"></i><span class="t"></span><span class="g"></span>';
      b.querySelector('.t').textContent = f.t;
      b.querySelector('.g').textContent = f.g;
      b.onclick = () => selectForm(f.id, true);
      els.grid.appendChild(b);
    });
  }

  /* ---------- الحقول ---------- */
  function selectForm(id, scroll) {
    cur = FORMS[id];
    inputs = [];
    els.empty.classList.add('hidden');
    els.ws.classList.remove('hidden');
    els.title.textContent = cur.t;
    els.group.textContent = cur.g;
    els.copyLbl.textContent = 'نسخ نص ' + (LBL[cur.t] || cur.t);
    els.fields.innerHTML = '';

    cur.f.forEach((f) => {
      const wrap = document.createElement('div');
      const wide = f.ty === 'a' || f.ty === 'ids';
      wrap.className = wide ? 'sm:col-span-2' : '';
      const lab = document.createElement('label');
      lab.className = 'af-label';
      lab.textContent = f.l;
      let e;
      if (f.ty == 's') {
        e = document.createElement('select');
        f.op.split(',').forEach((x) => { const o = document.createElement('option'); o.textContent = x; e.appendChild(o); });
      } else if (f.ty == 'ids' || f.ty == 'a') {
        e = document.createElement('textarea');
        e.rows = f.ty == 'ids' ? 4 : 3;
      } else {
        e = document.createElement('input');
        e.type = 'text';
        if (f.ty == 'n') e.inputMode = 'numeric';
      }
      e.className = 'form-field w-full rounded-xl px-3.5 py-2.5 text-sm' + (f.ty == 'id' || f.ty == 'ids' ? ' af-ltr' : '');
      if (f.ty == 'id' || f.ty == 'ids') e.placeholder = '123456789012345678';
      if (f.k == 'reason') e.placeholder = 'اكتب السبب';
      if (f.k == 'course') e.placeholder = 'مثال: دورة الأساسيات العسكرية';
      e.id = 'af-f-' + f.k + '-' + inputs.length;
      lab.htmlFor = e.id;
      e.addEventListener('input', update);
      e.addEventListener('change', update);
      inputs.push(e);
      wrap.append(lab, e);
      if (f.ty == 'ids') {
        const c = document.createElement('div');
        c.className = 'af-hint';
        c.dataset.idc = '1';
        c.textContent = '0 آيدي';
        wrap.appendChild(c);
      }
      els.fields.appendChild(wrap);
    });
    update();
    renderGrid();
    if (scroll) els.ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- المعاينة ---------- */
  function update() {
    if (!cur) return;
    inputs.forEach((e, i) => {
      if (cur.f[i].ty == 'ids') {
        const c = e.parentElement.querySelector('[data-idc]');
        if (c) c.textContent = e.value.split(/\n+/).filter((x) => x.trim()).length + ' آيدي';
      }
    });
    const text = buildFormText(cur, inputs.map((e) => e.value));
    els.out.value = text;
    const len = Array.from(text).length;
    els.count.textContent = len.toLocaleString('en') + ' / 2000';
    const over = len > 2000;
    els.count.classList.toggle('over', over);
    els.warn.classList.toggle('hidden', !over);
    const needIssuer = !text && cur.f.some((f) => f.k === 'iss' && f.ty === 's');
    els.out.placeholder = needIssuer ? 'اختر جهة الإصدار ليظهر النص هنا…' : 'ابدأ بتعبئة الحقول ليظهر النص الجاهز هنا…';
  }

  els.copy.onclick = () => copyRawText(els.out.value);
  els.reset.onclick = () => { if (cur) { selectForm(cur.id, false); showToast('تم مسح الحقول'); } };
  els.search.addEventListener('input', () => { query = els.search.value; renderGrid(); });



  function reset() {
    cur = null; inputs = []; activeGroup = 'all'; query = ''; els.search.value = '';
    els.ws.classList.add('hidden'); els.empty.classList.remove('hidden'); els.out.value = '';
    renderCats(); renderGrid();
  }

  window.startFormsUI = function (FD) {
    if (started) { reset(); return; }
    started = true;
    ({ FORMS, buildFormText, LBL } = createFormsCore(FD));
    reset();
  };
  window.resetFormsUI = () => { if (started) reset(); };
})();
