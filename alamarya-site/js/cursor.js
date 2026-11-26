/* مؤشر مخصص + أثر شرارات ذهبية + موجة عند النقر (للأجهزة التي فيها ماوس فقط) */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const dot = document.getElementById('cur-dot'), ring = document.getElementById('cur-ring'), cv = document.getElementById('trail');
  if (!dot || !ring || !cv) return;
  document.body.classList.add('has-cursor');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0;
  function size() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  size(); addEventListener('resize', size);

  let x = -100, y = -100, rx = -100, ry = -100, lx = -100, ly = -100;
  const P = [];
  const HOV = 'a,button,select,label,summary,[role=button],.af-tpl,.rl-item,.hub-card,.af-cat,.dd-item';
  const TXT = 'input,textarea';

  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    document.body.classList.add('cur-on');
    const dx = x - lx, dy = y - ly, dist = Math.hypot(dx, dy);
    if (dist > 6) {
      const n = Math.min(3, 1 + (dist / 30 | 0));
      for (let i = 0; i < n; i++) P.push({ x: x + (Math.random() - .5) * 6, y: y + (Math.random() - .5) * 6, vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2 - .3, l: 1, s: Math.random() * 2.6 + 1 });
      lx = x; ly = y;
    }
  }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target; if (!t.closest) return;
    ring.classList.toggle('hov', !!t.closest(HOV));
    ring.classList.toggle('txt', !!t.closest(TXT));
  }, { passive: true });
  document.addEventListener('mouseleave', () => document.body.classList.remove('cur-on'));
  document.addEventListener('pointerdown', (e) => {
    ring.classList.add('down');
    const r = document.createElement('span'); r.className = 'ripple';
    r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r);
    setTimeout(() => r.remove(), 750);
    for (let i = 0; i < 12; i++) { const a = Math.random() * 6.283, v = Math.random() * 3 + 1.5; P.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, s: Math.random() * 2.4 + 1 }); }
  });
  addEventListener('pointerup', () => ring.classList.remove('down'));

  (function loop() {
    rx += (x - rx) * .16; ry += (y - ry) * .16;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.x += p.vx; p.y += p.vy; p.vx *= .96; p.vy = p.vy * .96 + .02; p.l -= .026;
      if (p.l <= 0) { P.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 4 * p.l + 1);
      g.addColorStop(0, 'rgba(255,230,140,' + p.l + ')'); g.addColorStop(1, 'rgba(223,177,54,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 4 * p.l + 1, 0, 6.283); ctx.fill();
    }
    if (P.length > 140) P.splice(0, P.length - 140);
    requestAnimationFrame(loop);
  })();
})();
