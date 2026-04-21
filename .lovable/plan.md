
# ربط Trust Score Hub بـ Pi و Supabase الخارجي

## ملاحظات مهمة قبل التنفيذ

1. **المتغيرات التي شاركتها علنياً**: المفاتيح أعلاه أصبحت مكشوفة في المحادثة. `VITE_SUPABASE_ANON_KEY` و `VITE_PI_APP_ID` آمنة للنشر العام (publishable). لكن `VITE_PI_API_KEY` يبدو أنه **مفتاح Pi API الخاص بالخادم** — هذا المفتاح يجب ألا يُكشف في كود الواجهة (أي متغير `VITE_*` يُحزَّم في الـ bundle ويراه أي مستخدم). أنصح بشدة بإلغائه (rotate) من لوحة Pi Developer وإصدار مفتاح جديد لاحقاً عند بناء التحقق من المدفوعات في الخادم.

2. **Lovable Cloud و GitHub**: لا أملك أداة لتعطيل Lovable Cloud أو ربط GitHub برمجياً. يجب أن تقوم بهما يدوياً:
   - **تعطيل Cloud**: من واجهة Lovable → أعلى الصفحة → Cloud → Settings → Disable Lovable Cloud.
   - **ربط GitHub**: من Connectors في الشريط الجانبي → GitHub → Connect project → اختر الحساب → Create Repository. بعدها سيظهر رابط المستودع تلقائياً في أعلى المحرر.

## ما سأنفذه في الكود

### 1. ملف `.env` في جذر المشروع
إنشاء `.env` يحتوي على المتغيرات الثلاثة الآمنة فقط (سأستثني `VITE_PI_API_KEY` لأنه سري — لا مكان آمن له في تطبيق العميل):
```
VITE_PI_APP_ID=trust-score-hub
VITE_SUPABASE_URL=https://qtakxhpkkijppceyzdsl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_zRpo5TqiHa6NJxxLQQAiAQ_jhX2EXED
```
وإضافة `.env` إلى `.gitignore` (سيُلتزم فقط بـ `.env.example` كقالب).

### 2. عميل Supabase الجديد
إنشاء `src/lib/supabase.ts`:
- يقرأ `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` من `import.meta.env`.
- يصدّر `supabase` client باستخدام `@supabase/supabase-js` (مثبّت سابقاً).

### 3. مخطط قاعدة البيانات (تشغّله أنت يدوياً في Supabase SQL Editor)
سأضع الـ SQL في ملف `supabase/schema.sql` في المشروع للرجوع إليه:
- جدول `profiles` بالأعمدة المتفق عليها سابقاً.
- تفعيل RLS + سياسات: قراءة عامة، تحديث/إدراج للمالك عبر تطابق `pi_user_id`.
- لا يستخدم `auth.uid()` لأن المصادقة تتم عبر Pi لا عبر Supabase Auth (في هذه المرحلة سنعتمد على anon key مع سياسات تسمح بالكتابة المقيدة بـ `pi_user_id` المُمرَّر — مع الإقرار بأن هذا غير آمن للإنتاج وسنعزّزه بـ Edge Function لاحقاً).

### 4. تحديث `src/lib/auth.ts`
استبدال التخزين المحلي (`localStorage`) بقراءة/كتابة من جدول `profiles` في Supabase:
- `upsertFromPi(uid, username)` → `supabase.from('profiles').upsert(...)` بناءً على `pi_user_id`.
- `getProfile()` → استعلام بواسطة `pi_user_id` المخزَّن في `localStorage` كمعرّف جلسة فقط.
- `acceptPrivacy()` → `update({ privacy_accepted: true })`.
- `clearProfile()` → مسح معرّف الجلسة من `localStorage`.
- جميع الدوال تصبح `async`؛ سأحدّث `Index.tsx`, `Dashboard.tsx`, `Profile.tsx` لاستخدام `await` و `useEffect` async.

### 5. تحديث `src/lib/pi.ts`
- `PI_APP_ID` يُقرأ بالفعل من `VITE_PI_APP_ID` — يعمل تلقائياً بعد إنشاء `.env`.
- إبقاء `sandbox: true`.
- لن أستخدم `VITE_PI_API_KEY` في كود العميل (راجع التحذير أعلاه).

### 6. ملف `.env.example`
نسخة بدون قيم لتوثيق المتغيرات المطلوبة في GitHub.

## ما تحتاج فعله بعد موافقتك على الخطة

1. **عطّل Lovable Cloud يدوياً** من إعدادات Cloud.
2. **اربط GitHub يدوياً** من Connectors → GitHub.
3. **افتح Supabase SQL Editor** ونفّذ محتوى `supabase/schema.sql` الذي سأنشئه.
4. **(موصى به)** ألغِ `VITE_PI_API_KEY` الحالي من Pi Developer Portal لأنه أصبح مكشوفاً.
