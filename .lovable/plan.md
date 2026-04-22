

# ربط Supabase وإنشاء جدول `profiles`

## الوضع الحالي
- `src/lib/supabase.ts` متصل بمشروع Supabase (`qtakxhpkkijppceyzdsl`) باستخدام publishable anon key.
- `supabase/schema.sql` يحتوي بالفعل على تعريف جدول `profiles` لكن **لم يُنفَّذ بعد** على قاعدة بياناتك (لذلك `getProfile` يرجع خطأ).
- `src/lib/auth.ts` فيه دالة `upsertFromPi` التي تحفظ المستخدم في `profiles` بعد تسجيل الدخول عبر Pi، لكنها تستخدم عمود `id uuid` وليس `pi_user_id` كمفتاح أساسي.

## المخطط النهائي للجدول
حسب طلبك (`pi_user_id` كمفتاح أساسي بدل uuid منفصل):

| العمود | النوع | ملاحظات |
|---|---|---|
| `pi_user_id` | `text` | **PRIMARY KEY** |
| `username` | `text` | NOT NULL |
| `trust_score` | `integer` | DEFAULT 500 |
| `created_at` | `timestamptz` | DEFAULT now() |
| `privacy_accepted` | `boolean` | DEFAULT false |

## الخطوات

### 1. تحديث `supabase/schema.sql`
إعادة كتابة الملف ليطابق المخطط أعلاه (إزالة عمود `id uuid` واستخدام `pi_user_id` كمفتاح أساسي مباشرة) مع سياسات RLS:
- `SELECT`: عام (لأن الـ profile بطاقة سمعة عامة).
- `INSERT` / `UPDATE`: مسموح للجميع في المرحلة الأولى (مع تعليق تحذيري بنقلها لاحقاً خلف Edge Function تتحقق من Pi token).

### 2. تحديث `src/lib/supabase.ts`
تعديل `ProfileRow` لإزالة `id` وجعل `pi_user_id` هو المعرّف الأساسي.

### 3. تحديث `src/lib/auth.ts`
- `upsertFromPi(uid, username)`:
  - SELECT حسب `pi_user_id`.
  - إذا وُجد المستخدم → إرجاعه كما هو (الحفاظ على `trust_score`).
  - إذا لم يوجد → INSERT صف جديد بـ `trust_score = 500` (قيمة افتراضية ثابتة بدل العشوائية، لتطابق طلبك).
- `getProfile()` و `acceptPrivacy()`: تبقى تستخدم `pi_user_id` (لا تغيير في المنطق).

### 4. تنظيف رسائل التصحيح المؤقتة
إزالة `alert()` التشخيصية في `supabase.ts` و `auth.ts` (تركتها من جلسة سابقة) — الإبقاء فقط على `console.log` / `console.error`.

## ما عليك فعله بعد الموافقة
1. افتح **Supabase Dashboard → SQL Editor**.
2. انسخ محتوى `supabase/schema.sql` المحدَّث ونفّذه.
3. ارجع للتطبيق واضغط **Sign in with Pi** — سيتم إنشاء صفك تلقائياً عند أول تسجيل دخول.

## ما هو خارج هذه الخطة
- إنشاء Edge Function للتحقق من Pi access token (مرحلة لاحقة).
- تشفير أو إخفاء `pi_user_id` (يُعتبر معرّفاً عاماً في Pi).

