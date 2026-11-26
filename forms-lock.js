/* قفل النماذج الإدارية: كلمة السر تفك تشفير البيانات (AES-GCM) — بدونها لا يوجد أي نص للقوالب */
(function () {
  const $ = (id) => document.getElementById(id);
  const lock = $('af-lock'), content = $('af-content'), form = $('af-form'), pass = $('af-pass'),
    err = $('af-err'), eye = $('af-eye'), relock = $('af-relock'), icon = $('lock-i'), btn = $('af-submit');
  if (!lock || !form) return;

  const SK = 'af_pw';
  let fails = 0, blockedUntil = 0;
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  function showErr(msg) {
    err.textContent = msg; err.classList.remove('hidden');
    lock.classList.remove('shake'); void lock.offsetWidth; lock.classList.add('shake');
  }

  async function decrypt(pw) {
    const enc = window.__FORMS_ENC;
    if (!enc) throw new Error('missing');
    if (!window.crypto || !crypto.subtle) throw new Error('nocrypto');
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(enc.s), iterations: enc.it, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(enc.i) }, key, b64(enc.c));
    return new TextDecoder().decode(pt);
  }

  function open(text) {
    if (!window.__FD) {
      const s = document.createElement('script');
      s.textContent = 'window.__FD=(function(){' + text + '})();';
      document.head.appendChild(s); s.remove();
    }
    icon.className = 'fa-solid fa-lock-open';
    lock.classList.add('opened');
    setTimeout(() => {
      lock.classList.add('hidden'); content.classList.remove('hidden'); content.classList.add('pop-in');
      window.startFormsUI(window.__FD);
    }, 650);
  }

  async function attempt(pw, silent) {
    if (Date.now() < blockedUntil) { showErr('محاولات كثيرة — انتظر ' + Math.ceil((blockedUntil - Date.now()) / 1000) + ' ثانية'); return; }
    if (!pw) { if (!silent) showErr('اكتب كلمة السر'); return; }
    btn.disabled = true; btn.classList.add('loading');
    try {
      const text = await decrypt(pw);
      try { sessionStorage.setItem(SK, pw); } catch (e) {}
      err.classList.add('hidden'); fails = 0;
      open(text);
    } catch (e) {
      if (e.message === 'nocrypto') showErr('هذا المتصفح لا يدعم التشفير في هذا الوضع — افتح الموقع عبر رابط آمن (https).');
      else if (e.message === 'missing') showErr('ملف البيانات المشفّرة غير موجود.');
      else if (!silent) {
        fails++;
        if (fails >= 5) { blockedUntil = Date.now() + 30000; fails = 0; showErr('كلمة السر خاطئة — تم إيقاف المحاولات 30 ثانية'); }
        else showErr('كلمة السر غير صحيحة');
      }
      try { sessionStorage.removeItem(SK); } catch (e2) {}
    } finally { btn.disabled = false; btn.classList.remove('loading'); }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); attempt(pass.value, false); });
  eye.addEventListener('click', () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    eye.innerHTML = '<i class="fa-regular ' + (show ? 'fa-eye-slash' : 'fa-eye') + '"></i>';
  });
  relock.addEventListener('click', () => {
    try { sessionStorage.removeItem(SK); } catch (e) {}
    content.classList.add('hidden'); content.classList.remove('pop-in');
    lock.classList.remove('hidden', 'opened'); icon.className = 'fa-solid fa-lock';
    pass.value = ''; err.classList.add('hidden');
    if (window.resetFormsUI) window.resetFormsUI();
    showToast('تم قفل القسم');
  });

  let saved = null;
  try { saved = sessionStorage.getItem(SK); } catch (e) {}
  if (saved) attempt(saved, true);
})();
