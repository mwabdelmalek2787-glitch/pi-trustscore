
# اختبار اتصال Supabase + 3 تحسينات للواجهة

## 1. التحقق من اتصال Supabase وجدول `profiles`

سأقوم بفحص فعلي عبر تنفيذ استعلام مباشر من المتصفح بعد الموافقة:
- استدعاء `supabase.from("profiles").select("pi_user_id").limit(1)` وقراءة الاستجابة الخام.
- قراءة Network requests و Console logs بعد محاولة فتح صفحة Profile للتأكد من حالة الـ HTTP (200/401/404/42P01).

النتائج المتوقعة وكيف سأتعامل معها:

| الخطأ | السبب | الحل |
|------|-------|------|
| `relation "public.profiles" does not exist` | الـ schema لم يُنفَّذ بعد | تشغيل migration (انظر القسم 2) |
| `permission denied for table profiles` | RLS مفعّل بدون policies | تطبيق policies (انظر القسم 2) |
| `JWT expired` / 401 | anon key خاطئ | إعادة فحص المفتاح في `supabase.ts` |
| 200 + بيانات | كل شيء يعمل | الانتقال للقسم 3 |

## 2. SQL جاهز إذا الجدول مفقود أو RLS معطّل

سأنشئ migration يطبّق **بالضبط** ما في `supabase/schema.sql` عبر أداة الـ migration الرسمية (وليس psql)، بحيث يكون idempotent:

```sql
create table if not exists public.profiles (
  pi_user_id text primary key,
  username text not null,
  trust_score integer not null default 0,
  created_at timestamptz not null default now(),
  privacy_accepted boolean not null default false
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles for select using (true);

drop policy if exists "profiles_anon_insert" on public.profiles;
create policy "profiles_anon_insert"
  on public.profiles for insert to anon, authenticated with check (true);

drop policy if exists "profiles_anon_update" on public.profiles;
create policy "profiles_anon_update"
  on public.profiles for update to anon, authenticated using (true) with check (true);
```

**ملاحظة أمنية مهمة (سأبلغ بها فقط، لن أغيّرها الآن):** سياسة INSERT/UPDATE المفتوحة لـ `anon` تعني أن أي شخص يستطيع تعديل أي trust_score من خلال anon key العام. هذا مقبول للـ MVP لكن يجب نقله خلف Edge Function تتحقق من Pi access token قبل الإطلاق الفعلي.

## 3. ثلاث تحسينات UI مقترحة (سأطبّقها بعد الموافقة)

**أ. تباين أعلى لـ TrustGauge على الجوال (392px)**
- زيادة سُمك الحلقة من المقاس الحالي وتكبير الرقم المركزي ليأخذ مساحة أوضح في الشاشات الصغيرة.
- إضافة gradient متحرك خفيف (`primary → primary-glow`) ليعكس "حيوية" النتيجة بدل اللون الثابت.

**ب. Sticky header + safe-area للأجهزة المحمولة**
- جعل `<Header>` ثابتاً (`sticky top-0 z-40 backdrop-blur`) مع `pt-[env(safe-area-inset-top)]` لتفادي اصطدامه بـ notch داخل Pi Browser.
- إضافة `pb-[env(safe-area-inset-bottom)]` على `<main>` لحماية الأزرار من شريط النظام السفلي.

**ج. تحسين شبكة Dashboard على الشاشات المتوسطة**
- حالياً الشبكة تقفز من عمود واحد مباشرةً إلى عمودين عند `lg`. سأضيف breakpoint عند `md` بحيث تعرض البطاقتين جنباً لجنب أبكر، وأضيف `hover:border-primary/40 transition` على بطاقات التقييمات لتغذية بصرية أوضح عند التنقّل باللمس.

## ما لن يُغيَّر
- مخطط Supabase الموجود (الجدول والـ RLS كما في `schema.sql`).
- منطق المصادقة عبر Pi.
- المفاتيح المضمنة (سيُتركها المستخدم لينقلها لاحقاً من حاسوب).
