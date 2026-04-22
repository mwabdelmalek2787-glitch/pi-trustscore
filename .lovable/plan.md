

# خطة: تفعيل تسجيل الدخول عبر Pi SDK (Sandbox)

## المشكلة الحالية
- `src/lib/pi.ts` يطلب صلاحية `username` فقط — يحتاج إضافة `payments`.
- `index.html` لا يحمّل Pi SDK script، لذا `window.Pi` غير موجود حتى داخل Pi Browser.
- لا توجد رسالة خطأ مرئية واضحة عند فشل المصادقة (فقط `toast` عام).
- اسم المستخدم لا يُعرض بشكل بارز في `Dashboard` بعد تسجيل الدخول.

## الإصلاحات

### 1. تحميل Pi SDK في `index.html`
إضافة وسم في `<head>`:
```html
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
```

### 2. تحديث `src/lib/pi.ts`
- توسيع نوع `authenticate` ليقبل صلاحية `payments`.
- تغيير الاستدعاء إلى `Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)`.
- إبقاء `sandbox: true` و `appId` من `VITE_PI_APP_ID`.
- إضافة فحص واضح: إذا لم يوجد `window.Pi` → رمي خطأ `PI_BROWSER_REQUIRED` مع رسالة مفهومة.

### 3. تحديث `src/pages/Index.tsx`
- في `handleSignIn`:
  - فحص `isPiBrowser()` أولاً وعرض رسالة واضحة بالعربية إذا كان المستخدم خارج Pi Browser (مع إبقاء وضع التطوير الحالي).
  - استدعاء `piAuthenticate()` ثم `upsertFromPi(uid, username)`.
  - عند الفشل: عرض `toast.error` برسالة مترجمة + `console.error` للتفاصيل.
  - عند النجاح: الانتقال إلى `/dashboard`.

### 4. عرض اسم المستخدم في `src/pages/Dashboard.tsx`
- إضافة ترحيب بارز في الأعلى: "مرحباً @username" مع أيقونة.
- التأكد من أن البيانات تُقرأ من `profile.username` المحفوظ في Supabase.

### 5. ترجمات `src/i18n.ts`
إضافة مفاتيح:
- `auth.piRequired`: "هذا التطبيق يتطلب فتحه داخل Pi Browser لتسجيل الدخول."
- `auth.signInFailed`: "فشل تسجيل الدخول عبر Pi. حاول مرة أخرى."
- `auth.welcome`: "مرحباً، @{{username}}"

## ملاحظات
- لا تغييرات على Supabase أو RLS.
- `payments` scope مطلوبة الآن استعداداً للمرحلة الثانية (التوكن/الاشتراك)، لكن لن نستخدمها فعلياً بعد.
- الاختبار الحقيقي يتطلب فتح الرابط داخل Pi Browser في وضع Sandbox من Pi Developer Portal.

