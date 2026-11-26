// تشفير بيانات النماذج الإدارية بكلمة سر (AES-256-GCM + PBKDF2).
// الاستخدام:  node encrypt-forms.mjs "كلمة السر الجديدة" [مسار-الإخراج]
// الإخراج الافتراضي: ../alamarya-site/js/forms.enc.js
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pass = process.argv[2];
if (!pass || pass.length < 8) { console.error('اكتب كلمة سر لا تقل عن 8 أحرف.'); process.exit(1); }
const out = resolve(process.argv[3] || resolve(here, '../alamarya-site/js/forms.enc.js'));

const src = readFileSync(resolve(here, 'forms-data.src.js'), 'utf8');
const payload = src + "\nconst FORM_TAIL='\\n\\n|| <@&1553779376439558275> ||';\n;return {G,TPL,CFG,LBL,TOP,FORM_TAIL};";
const enc = new TextEncoder();
const IT = 250000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: IT, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(payload)));
const b64 = (u) => Buffer.from(u).toString('base64');
writeFileSync(out, '/* بيانات النماذج الإدارية — مشفّرة، لا تُقرأ إلا بكلمة السر */\nwindow.__FORMS_ENC=' + JSON.stringify({ v: 1, it: IT, s: b64(salt), i: b64(iv), c: b64(ct) }) + ';\n');
console.log('تم التشفير ->', out);
