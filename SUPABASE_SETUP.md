# راهنمای جامع راه‌اندازی و اتصال پایگاه‌داده Supabase در AuraVibe
# (AuraVibe Supabase Backend Setup & Migration Guide)

این راهنما نحوه راه‌اندازی کامل پایگاه‌داده متمرکز Supabase (پایگاه‌داده PostgreSQL، احراز هویت Supabase Auth، ذخیره‌سازی ابری فایل‌های چندرسانه‌ای Supabase Storage و قوانین امنیتی RLS) را برای پروژه AuraVibe شرح می‌دهد.

---

## ۱. پیش‌نیازها و ایجاد پروژه در Supabase

1. وارد حساب کاربری خود در [Supabase Dashboard](https://supabase.com/dashboard) شوید.
2. روی دکمه **"New Project"** کلیک کنید.
3. یک نام برای پروژه (مثلاً `AuraVibe`) و یک رمز عبور قوی برای پایگاه داده انتخاب نمایید.
4. ناحیه جغرافیایی (Region) مورد نظر خود را انتخاب کرده و پروژه را بسازید.

---

## ۲. تنظیم متغیرهای محیطی (Environment Configuration)

1. در پنل Supabase، به مسیر **Project Settings > API** مراجعه کنید.
2. مقادیر زیر را دریافت کنید:
   - **Project URL** (`VITE_SUPABASE_URL`)
   - **Project API Keys > anon / public** (`VITE_SUPABASE_PUBLISHABLE_KEY`)
   - *(اختیاری برای اسکریپت‌های سیدینگ سمت سرور)*: **service_role key**
3. در ریشه پروژه AuraVibe، یک فایل بنام `.env.local` یا `.env` در کنار `.env.example` بسازید و مقادیر را قرار دهید:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
```

> **نکته امنیتی بسیار مهم**: هرگز کلیدهای محرمانه `service_role` یا رمزهای عبور دیتابیس را داخل متغیرهای `VITE_*` قرار ندهید. این متغیرها در خروجی نهایی فرانت‌اند مرورگر قرار می‌گیرند.

---

## ۳. اعمال ساختار جداول و قوانین امنیتی (Migrations & RLS)

تمام مایگریشن‌های پایگاه‌داده به صورت فایل‌های استاندارد SQL در مسیر `supabase/migrations/` ذخیره شده‌اند:
- `supabase/migrations/20261007000001_initial_schema.sql`: ساختار ۱۴ جدول اصلی دامنه
- `supabase/migrations/20261007000002_storage_and_rls.sql`: باکت‌های ذخیره‌سازی، فعال‌سازی RLS و پالیسی‌های پایه
- `supabase/migrations/20261007000003_hardening_rls_and_auth.sql`: ارتقای امنیت دسترسی‌ها (حذف بای‌پس‌های دمو، امنیت ادمین‌ها، توابع امن RPC برای سفارشات و تیکت‌ها و توابع `is_admin()` / `is_super_admin()`)

### روش اول: استفاده از SQL Editor در داشبورد Supabase (ساده‌ترین روش)
1. در داشبورد پروژه به بخش **SQL Editor** بروید.
2. محتوای فایل‌های زیر را به ترتیب اجرا (Run) کنید:
   - `supabase/migrations/20261007000001_initial_schema.sql`
   - `supabase/migrations/20261007000002_storage_and_rls.sql`
   - `supabase/migrations/20261007000003_hardening_rls_and_auth.sql`

### روش دوم: استفاده از Supabase CLI
```bash
# لاگین به حساب سوپابیس
npx supabase login

# اتصال به پروژه
npx supabase link --project-ref your-project-id

# اعمال مایگریشن‌ها
npx supabase db push
```

---

## ۴. باکت‌های ذخیره‌سازی فایل (Supabase Storage Buckets)

مایگریشن‌ها به طور خودکار ۴ باکت زیر را همراه با پالیسی‌های امنیتی عمومی خواندن و ادمین نوشتن ایجاد می‌کنند:
1. `banners`: تصاویر بنرهای تبلیغاتی و اسلایدرها (فقط خواندنی برای عموم، ویرایش فقط توسط ادمین فعال)
2. `products`: تصاویر گالری و کاور محصولات و دسته‌بندی‌ها (فقط خواندنی برای عموم، ویرایش فقط توسط ادمین فعال)
3. `avatars`: تصاویر آواتار و پروفایل کاربران
4. `support-media`: فایل‌های پیوست چت و پشتیبانی (عکس، ویدیو، وویس صوتی) با مسیرهای یکتا و غیرقابل بازنویسی

---

## ۵. ایجاد کاربر مدیر ارشد در Supabase Auth (Admin Authentication)

سیستم مدیریت پیشخوان AuraVibe از احراز هویت امن **Supabase Auth** بهره می‌برد. برای ایجاد مدیر ارشد اولیه (Super Admin):

1. در داشبورد Supabase به بخش **Authentication > Users** بروید.
2. روی **Add User > Create User** کلیک کنید:
   - **Email**: `superadmin@auravibe.ir` (یا ایمیل اداری مد نظر شما)
   - **Password**: یک رمز عبور قوی و غیرقابل حدس انتخاب نمایید (حداقل ۱۲ کاراکتر شامل حروف بزرگ و کوچک، ارقام و نمادها).
   - گزینه **Auto Confirm User** را فعال کنید.
3. مقدار **User UID** کاربر ساخته‌شده را کپی کنید.
4. در **SQL Editor**، کاربر ادمین را به جدول `admin_users` متصل کنید:

```sql
INSERT INTO public.admin_users (
  auth_user_id,
  admin_code,
  first_name,
  last_name,
  username,
  role,
  custom_permissions,
  status
) VALUES (
  'UID_کپی_شده_از_مرحله_قبل',
  'ADM-1001',
  'مدیر ارشد',
  'آورا',
  'superadmin',
  'SUPER_ADMIN',
  '["manage_products", "manage_orders", "manage_banners", "manage_tickets", "manage_users", "manage_settings", "manage_magazine", "manage_seo", "view_analytics", "view_audit_logs"]'::jsonb,
  'active'
) ON CONFLICT (username) DO UPDATE SET auth_user_id = EXCLUDED.auth_user_id;
```

> **نکته**: پس از ورود با حساب مدیر ارشد، ایجاد سایر مدیران به صورت مستقیم از طریق پیشخوان مدیریت و به کمک تابع امنیتی سرور `create_admin_user` انجام می‌شود و نیازی به عملیات دستی در دیتابیس نخواهد بود.

---

## ۶. درج داده‌های اولیه (Data Seeding)

برای تزریق کاتالوگ محصولات اولیه، دسته‌بندی‌ها، بنرها و تنظیمات فروشگاه با دارایی‌های بومی و قطعی:

### روش الف: استفاده از اسکریپت خودکار Node.js
```bash
# با استفاده از کلید anon یا service_role در متغیر محیطی
SUPABASE_URL=https://your-project.supabase.co SUPABASE_KEY=your-service-role-or-anon-key node scripts/seed.js
```

### روش ب: اجرای اسکریپت SQL در SQL Editor
محتوای فایل `supabase/seed.sql` را در تب **SQL Editor** داشبورد Supabase اجرا نمایید.

---

## ۷. استقرار روی GitHub Pages (Deployment)

برای استقرار خودکار توسط GitHub Actions:
1. در مخزن گیت‌هاب پروژه به مسیر **Settings > Secrets and variables > Actions** بروید.
2. دو سکرت (یا متغیر) زیر را اضافه کنید:
   - `VITE_SUPABASE_URL`: آدرس پروژه Supabase شما
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: کلید Anon پروژه Supabase شما
3. با هر Push روی شاخه `master`، ورک‌فلو موجود در `.github/workflows/deploy.yml` پروژه را همراه با متغیرهای محیطی بیلد کرده و نسخه کاملاً استاتیک را در GitHub Pages منتشر می‌کند.

---

## ۸. سناریوی آزمون و تایید صحت عملکرد (Verification)

1. **همگام‌سازی چند دستگاهی (Multi-Device Sync)**:
   - در دستگاه/مرورگر A وارد پنل مدیریت شوید و عنوان یک بنر یا قیمت یک محصول را ویرایش نمایید.
   - در دستگاه/مرورگر B صفحه را بارگذاری مجدد نمایید؛ تغییرات اعمال‌شده بلافاصله قابل مشاهده هستند.
2. **پایداری داده‌ها پس از پاک‌سازی حافظه مرورگر**:
   - در مرورگر حافظه LocalStorage و Cache را به طور کامل پاک کنید (Clear Site Data).
   - با رفرش صفحه مشاهده خواهید کرد که هیچ داده‌ای از دست نرفته و تمام اطلاعات از سرور متمرکز دریافت می‌شوند.
3. **عدم وابستگی به تصاویر نامطمئن خارجی**:
   - تمام تصاویر کاتالوگ و دسته‌بندی‌ها از دارایی‌های برداری استاندارد SVG داخلی پروژه یا Storage متمرکز استفاده می‌کنند.
4. **امنیت RLS و احراز هویت ادمین**:
   - جدول `audit_logs` و تغییرات کاتالوگ محصولات/بنرها فقط برای ادمین‌های احراز هویت‌شده فعال مجاز است.
   - ثبت سفارشات و تیکت‌ها از طریق توابع تایید هویت سمت سرور (`create_customer_order` و `create_customer_ticket`) انجام می‌پذیرد.
