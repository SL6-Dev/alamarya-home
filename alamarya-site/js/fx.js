/* المؤثرات والحركات: شاشة الافتتاح، جزيئات، عدّادات، إضاءة المؤشر، ميل ثلاثي الأبعاد */
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- شاشة الافتتاح ---- */
  const splash = document.getElementById('splash');
  function hideSplash() { if (splash) { splash.classList.add('hide'); setTimeout(() => splash.remove(), 700); document.body.classList.add('ready'); } else document.body.classList.add('ready'); }
  if (reduce) hideSplash();
  else {
    const t0 = performance.now();
    const done = () => setTimeout(hideSplash, Math.max(0, 900 - (performance.now() - t0)));
    if (document.readyState === 'complete') done(); else window.addEventListener('load', done);
    setTimeout(hideSplash, 3500); // أمان
  }

  /* ---- عنوان الهيرو كلمة بكلمة ---- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="w" style="--d:${i * 110 + 650}ms"><span>${w}</span></span>`).join(' ');
  });

  /* ---- ستاغر للشبكات ---- */
  document.querySelectorAll('.stagger').forEach((g) => Array.from(g.children).forEach((c, i) => c.style.setProperty('--i', i)));

  /* ---- عدّادات ---- */
  function count(el) {
    const to = parseInt(el.dataset.count, 10); if (isNaN(to)) return;
    if (reduce) { el.textContent = to; return; }
    const dur = 1400, t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { count(en.target); io.unobserve(en.target); } }), { threshold: 0.6 });
    const watch = () => document.querySelectorAll('[data-count]').forEach((el) => io.observe(el));
    watch(); window.__watchCounts = watch;
  } else document.querySelectorAll('[data-count]').forEach(count);

  if (reduce) return;

  /* ---- جزيئات ذهبية في الهيرو ---- */
  const cv = document.getElementById('fx-canvas');
  if (cv) {
    const ctx = cv.getContext('2d'); let W, H, P = [], run = true, mx = -999, my = -999;
    function size() {
      const r = cv.parentElement.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.round(Math.min(70, W / 16));
      P = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .5, vx: (Math.random() - .5) * .25, vy: -(Math.random() * .35 + .08), a: Math.random() * .6 + .2 }));
    }
    size(); addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.parentElement.addEventListener('pointerleave', () => { mx = my = -999; });
    new IntersectionObserver((es) => { run = es[0].isIntersecting; if (run) loop(); }).observe(cv);
    function loop() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.x += p.vx; p.y += p.vy;
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const f = (1 - d2 / 14000) * .9; p.x += dx * .02 * f * 6; p.y += dy * .02 * f * 6; }
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = 'rgba(243,215,122,' + p.a + ')'; ctx.fill();
        for (let j = i + 1; j < P.length; j++) {
          const q = P[j], ax = p.x - q.x, ay = p.y - q.y, dd = ax * ax + ay * ay;
          if (dd < 9000) { ctx.strokeStyle = 'rgba(223,177,54,' + (.16 * (1 - dd / 9000)) + ')'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---- إضاءة تتبع المؤشر داخل البطاقات + ميل الشعار ---- */
  if (fine) {
    const SEL = '.surface-card,.hub-card,.af-tpl,.rl-item,.stat,.dd-item';
    document.addEventListener('pointermove', (e) => {
      const t = e.target.closest && e.target.closest(SEL);
      if (t) { const r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    }, { passive: true });

    const glow = document.getElementById('cursor-glow');
    if (glow) {
      let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
      addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; glow.style.opacity = 1; }, { passive: true });
      (function f() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.transform = 'translate(' + (gx - 200) + 'px,' + (gy - 200) + 'px)'; requestAnimationFrame(f); })();
    }

    const em = document.querySelector('.emblem-wrap');
    const hero = document.getElementById('home');
    if (em && hero) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        em.style.transform = 'perspective(700px) rotateY(' + (x * 18) + 'deg) rotateX(' + (-y * 18) + 'deg)';
      });
      hero.addEventListener('pointerleave', () => { em.style.transform = ''; });
    }

    const TILT = '.hub-card,.stat,#quick-links a.surface-card,.af-tpl';
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest(TILT); if (!c) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = 'perspective(800px) rotateY(' + (x * -9) + 'deg) rotateX(' + (y * 9) + 'deg) translateY(-5px) scale(1.015)';
    }, { passive: true });
    document.addEventListener('pointerout', (e) => {
      const c = e.target.closest && e.target.closest(TILT); if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
    }, { passive: true });

    document.querySelectorAll('.gold-action-btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * .12) + 'px ' + ((e.clientY - r.top - r.height / 2) * .2) + 'px'; });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* ---- بارالاكس للشعار الخلفي ---- */
  const wm = document.querySelector('.hero-wm img');
  if (wm) addEventListener('scroll', () => { const y = scrollY; if (y < 1200) wm.style.transform = 'translateY(' + (y * .18) + 'px) scale(' + (1 + y / 4000) + ')'; }, { passive: true });
})();
