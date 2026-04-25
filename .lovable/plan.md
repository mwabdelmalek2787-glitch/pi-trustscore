# خطة الإصلاح الجذري لـ Trust Score Hub

## تشخيص الجذور (وُجد بعد فحص الملفات)

1. **`src/App.tsx` تالف**: استُبدل بنسخة بدائية بدون `BrowserRouter`، بدون مسارات، بدون `Header/i18n/Toaster`. النتيجة: زر "View Profile" الذي يستدعي `navigate("/profile/me")` لا يصل لأي مكان، و`/dashboard` و`/` الأصليين معطلان فعلياً.
2. **`src/pages/Index.tsx` يستورد `upsertFromPi`** من `@/lib/auth` لكن المُصدَّر فعلياً اسمه `createOrUpdateProfile` → خطأ تجميع يكسر الصفحة بصمت.
3. **كشف Pi Browser ضيّق جداً**: `/Pi Browser/i` (بمسافة) لا يطابق UA الحقيقي الذي يحتوي `PiBrowser` (بدون مسافة) أو `minepi`. النتيجة: داخل Pi Browser يُضبط `sandbox: true` خطأً، فيرفض SDK المصادقة الحقيقية.
4. **`Pi.authenticate` يطلب نطاق `payments`**: هذا النطاق يتطلب موافقة على بوابة المطورين، وإن لم تكن مُفعّلة يفشل/يعلّق على "Loading…". نحتاج فقط `["username"]` للمرحلة 1.
5. **`initPi` يُستدعى مرة واحدة في `main.tsx`** قبل أن يتحمّل سكربت `pi-sdk.js`. عند فشله الأول يطبع تحذيراً ولا يُعاد، فتظهر "Pi SDK not initialized" عند أول ضغطة.
6. **لا يوجد انتظار لتحميل SDK** ولا timeout على `authenticate` → الواجهة تعلق إلى الأبد.
7. **`acceptPrivacy` يمرّر `pi_user_id`** بينما RPC يتوقع `_pi_user_id` → الموافقة لا تُحفظ، فيعود المستخدم دائماً للصفحة الرئيسية.

## التغييرات المطلوبة

### 1) إعادة بناء `src/App.tsx` بشكل صحيح
يحتوي على: `QueryClientProvider`, `BrowserRouter`, `Toaster` (sonner), وثلاث مسارات:
- `/` → `Index`
- `/dashboard` → `Dashboard`
- `/profile/me` → `Profile`
- `*` → `NotFound`

### 2) إصلاح `src/lib/pi.ts`
- كشف Pi Browser موسّع: `/(PiBrowser|Pi Browser|minepi)/i`.
- `waitForPiSdk(timeoutMs = 8000)`: Promise يستفتي `window.Pi` كل 100ms.
- `initPi()` يصبح async، ينتظر SDK ثم يستدعي `Pi.init({ version: "2.0", sandbox: !isPiBrowser() })` مرة واحدة.
- `authenticate()` async: ينتظر التهيئة، يستخدم scopes `["username"]` فقط، ويلفّ الـ callback بـ Promise + timeout 30 ثانية مع رسالة واضحة `"Pi authentication timeout"`.
- `onIncompletePaymentFound` callback فارغ ممرَّر للـ `authenticate` (مطلوب من SDK).
- الإبقاء على aliases `ensurePiInit` و`piAuthenticate`.

### 3) إصلاح `src/lib/auth.ts`
- إضافة export باسم `upsertFromPi` (alias لـ `createOrUpdateProfile`) لإصلاح الاستيراد في `Index.tsx`.
- `getProfile()`: لا يحاول المصادقة تلقائياً (تجنّب popup مفاجئ على التحميل) — يعيد `null` إذا لم يكن هناك uid مخزّن في الذاكرة. المصادقة تبقى مسؤولية زر تسجيل الدخول.
- إصلاح `acceptPrivacy`: تمرير `{ _pi_user_id: uid }` بدلاً من `{ pi_user_id: uid }`.
- إزالة `console.error` التي تُسرّب تفاصيل Supabase.

### 4) إصلاح `src/pages/Index.tsx`
- لا تغيير منطقي عدا التأكد من أن `upsertFromPi` متوفّر (يُحلّ بالخطوة 3).

### 5) إصلاح `src/pages/Profile.tsx`
- إذا لم تكن هناك جلسة، إعادة التوجيه إلى `/` بدل محاولة popup مصادقة في useEffect.
- استخدام `TrustGauge` و`Header` للاتساق البصري مع باقي الصفحات.

### 6) `src/main.tsx`
- استدعاء `ensurePiInit()` (لكنها async الآن) مع `.catch` صامت — التهيئة الفعلية ستُعاد عند الضغط على زر تسجيل الدخول على أي حال.

### 7) إزالة console.log المؤقتة
أضيف logs قصيرة بـ prefix `[pi]` و`[auth]` لتتبّع التدفّق، وسأحذفها في نفس الجولة بعد التحقق.

## ما لن يتغيّر
- مفاتيح Supabase المضمَّنة (طلب المستخدم).
- مخطط Supabase (`supabase/schema.sql`) — RLS وRPC كما هي.
- التصميم العام لـ `Dashboard.tsx` (يعمل بمجرد إصلاح Router).
- ملفات i18n وUI الأخرى.

## خطة الاختبار بعد التطبيق
1. متصفح عادي: تحميل `/` → يظهر زر "Sign in" مع رسالة "outside Pi". يجب ألا يبقى عالقاً.
2. التأكد من البناء بدون أخطاء TypeScript (`upsertFromPi` تُحلّ).
3. داخل Pi Browser (المستخدم يختبر): الضغط على Sign in → popup حقيقي → بعد القبول ينتقل إلى Dashboard → الضغط على View → يفتح `/profile/me` بكل البيانات.
4. مراقبة `tail -n 100 /tmp/dev-server-logs/dev-server.log` للتأكد من عدم وجود أخطاء HMR.

## ملاحظة
بعد التحقق من نجاح المصادقة في Pi Browser، يُنصح بإزالة `eruda` من `index.html` لأنه أداة debug للموبايل لا يجب أن تُشحن للإنتاج.
