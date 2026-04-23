

# خطة تحسين وتنظيف المشروع

## 1. تنظيف رسائل التصحيح (Debug Cleanup)
- **`src/lib/supabase.ts`**: إزالة `console.log("[supabase] client initialised", ...)`.
- **`src/lib/auth.ts`**: إزالة `console.log` التشخيصية في `getProfile` و `upsertFromPi` — الإبقاء فقط على `console.error` للأخطاء الفعلية.
- **`src/pages/Index.tsx`**: إزالة `console.log` غير الضرورية (`[Index] Calling Pi.authenticate...`, `[Index] Pi auth success`, `console.warn` للتطوير) — الإبقاء على `console.error` للفشل.
- **`src/pages/Dashboard.tsx`**: إزالة `console.log("[Dashboard] View Profile clicked...")`.
- **`src/lib/pi.ts`**: مراجعة وإزالة أي `console.log` غير ضرورية، مع الإبقاء على أخطاء التهيئة.
- البحث عن أي `alert()` متبقٍ في الكود وإزالته.

## 2. نقل مفاتيح Supabase إلى متغيرات البيئة

### الملفات التي ستتغير:
- **`src/lib/supabase.ts`**:
  ```ts
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  }
  ```
- **`src/vite-env.d.ts`**: إضافة تعريفات TypeScript للمتغيرات الجديدة:
  ```ts
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }
  ```
- **`.env.example`**: إضافة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` كأمثلة.

### ⚠️ ملاحظة مهمة للمستخدم
متغيرات `VITE_*` ليست أسراراً حقيقية — يتم تضمينها في bundle الواجهة الأمامية ويستطيع أي زائر للموقع رؤيتها. anon key محمي بـ RLS لذا هذا آمن من ناحية الأمن، لكن:
- **Lovable Cloud Secrets** مخصصة لـ Edge Functions (server-side)، وليست متاحة تلقائياً لمتغيرات `VITE_*` في build الواجهة.
- لجعل `VITE_SUPABASE_URL` يعمل فعلياً في البناء، ستحتاج إضافتها كـ **Build Secret** في **Workspace Settings → Build Secrets** (وليس Cloud Secrets العادية).
- سأضيف fallback في الكود: إذا لم توجد المتغيرات، يستخدم القيم الحالية مع `console.warn`، حتى لا ينكسر التطبيق قبل أن تضيفها.

## 3. الإنشاء التلقائي للملف الشخصي بعد تسجيل دخول Pi

تحديث **`src/lib/auth.ts`** → `upsertFromPi(uid, username)`:
- البحث عن الصف بـ `pi_user_id`.
- إذا وُجد → إرجاعه (الحفاظ على `trust_score` الحالي).
- إذا لم يوجد → INSERT جديد بالقيم الافتراضية:
  - `trust_score = 0` (تغيير من 500 الحالية حسب طلبك)
  - `created_at = now()` (تلقائي عبر default في الجدول)
  - `privacy_accepted = false`
- توحيد منطق الإنشاء داخل دالة واحدة `ensureProfile()` لتسهيل الاختبار.

## 4. مؤشر تحميل (Loading Spinner) أثناء جلب البيانات

- **`src/pages/Dashboard.tsx`**: استبدال `if (loading || !profile) return null;` بـ:
  ```tsx
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-3 text-muted-foreground">{t("common.loading")}</span>
  </div>
  ```
- **`src/pages/Index.tsx`**: تحسين زر تسجيل الدخول ليُظهر `Loader2` بدلاً من نص ثابت أثناء `loading`.
- **`src/i18n.ts`**: إضافة مفتاح `common.loading` بثلاث لغات:
  - EN: "Loading…"
  - AR: "جارٍ التحميل…"
  - FR: "Chargement…"

## ملخص الملفات المعدَّلة
- `src/lib/supabase.ts`
- `src/lib/auth.ts`
- `src/lib/pi.ts`
- `src/pages/Index.tsx`
- `src/pages/Dashboard.tsx`
- `src/vite-env.d.ts`
- `src/i18n.ts`
- `.env.example`

## خارج النطاق
- إنشاء Edge Function للتحقق من Pi access token (مرحلة لاحقة).
- تغيير سياسات RLS.

