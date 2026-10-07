# راهنمای جامع راه‌اندازی و اتصال پایگاه‌داده Supabase در AuraVibe
# (AuraVibe Supabase Backend Setup & Migration Guide)

این راهنما نحوه راه‌اندازی، اتصال، پیکربندی ساختار پایگاه‌داده (PostgreSQL)، سیستم احراز هویت ادمین (Supabase Auth)، باکت‌های ذخیره‌سازی ابری (Supabase Storage) و ارتباط بلادرنگ (Supabase Realtime) را برای پروژه **AuraVibe** شرح می‌دهد.

---

## وضعیت منابع داده (Data Source Policy)

> **قانون قطعی منبع داده:**
> 
> ```text
> AuraVibe no longer uses localStorage as its data source.
> There is no one-time localStorage migration flow.
> Supabase is the source of truth.
> ```
> 
> کلیه اطلاعات کاتالوگ، کاربران، سفارشات و تنظیمات منحصراً بر روی پایگاه‌داده متمرکز Supabase نگهداری می‌شوند. حافظه محلی مرورگر (localStorage) به عنوان منبع داده در این پروژه کاربردی ندارد.

---

## ۱. ایجاد پروژه در Supabase (Project Creation)

1. وارد حساب کاربری خود در [Supabase Dashboard](https://supabase.com/dashboard) شوید.
2. بر روی دکمه **"New Project"** کلیک کنید.
3. مشخصات پروژه را وارد نمایید:
   * **Name**: نام پروژه (مثلاً `AuraVibe`).
   * **Database Password**: یک رمز عبور قوی و یکتا برای دیتابیس انتخاب کنید و آن را در جای امن نگه دارید.
   * **Region**: نزدیک‌ترین ناحیه جغرافیایی را به کاربران هدف خود انتخاب فرمایید (مانند `Central EU - Frankfurt`).
4. روی **"Create new project"** کلیک کنید تا پروژه آماده به کار شود.

---

## ۲. متغیرهای محیطی فرانت‌اند (Frontend Environment)

در ریشه پروژه، یک فایل به نام `.env.local` بر اساس ساختار `.env.example` ایجاد کنید:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
```

* **`VITE_SUPABASE_URL`**: آدرس اختصاصی Project URL که از بخش **Project Settings > API** داشبورد Supabase قابل کپی است.
* **`VITE_SUPABASE_PUBLISHABLE_KEY`**: کلید عمومی `anon / public` که جهت ارسال درخواست‌های مجاز از مرورگر کلاینت استفاده می‌شود.

---

## ۳. خط‌مشی کلیدهای محرمانه (Secret Key & Security Policy)

کلیدهای محرمانه و با دسترسی بالا (نظیر `SUPABASE_SECRET_KEY` یا `SUPABASE_SERVICE_ROLE_KEY`):

* **تنها برای اسکریپت‌های معتمد و سمت سرور (Trusted Server-Side Scripts)** مجاز هستند (مانند اسکریپت‌های سیدینگ اولیه دیتابیس).
* **هرگز** نباید در متغیرهای با پیشوند `VITE_*` قرار گیرند.
* **هرگز** نباید داخل کدهای باندل کلاینت وارد شوند، زیرا در مرورگر قابل استخراج خواهند بود.
* **هرگز** نباید در گیت کامیت یا در مخازن عمومی ذخیره شوند.

---

## ۴. اعمال مایگریشن‌های پایگاه‌داده (Database Migrations)

مایگریشن‌های پایگاه‌داده به صورت فایل‌های استاندارد SQL در مسیر `supabase/migrations/` قرار دارند:

```text
supabase/migrations/
├── 20261007000001_initial_schema.sql
├── 20261007000002_storage_and_rls.sql
└── 20261007000003_hardening_rls_and_auth.sql
```

> **اهمیت ترتیب اجرا:** مایگریشن‌ها حتماً و دقیقاً باید با ترتیب بالا اجرا شوند:
> 1. `20261007000001_initial_schema.sql`: ایجاد ۱۴ جدول اصلی دامنه، کلیدها، روابط و ایندکس‌ها.
> 2. `20261007000002_storage_and_rls.sql`: تعریف ۴ باکت ذخیره‌سازی، فعال‌سازی RLS و پیکربندی انتشارات Realtime.
> 3. `20261007000003_hardening_rls_and_auth.sql`: ارتقای امنیت دسترسی‌ها، حذف دسترسی‌های آزاد اولیه، توابع `is_admin()` و `is_super_admin()` و رویه‌های امن RPC (`create_admin_user`, `create_customer_order`, `create_customer_ticket`).

### روش اول: استفاده از SQL Editor در داشبورد Supabase (پیشنهادی)
1. در داشبورد Supabase به بخش **SQL Editor** بروید.
2. به ترتیب، محتوای هر ۳ فایل فوق را در ویرایشگر کپی کرده و دکمه **Run** را بزنید.

### روش دوم: استفاده از Supabase CLI
```bash
# ورود به حساب کاربری
npx supabase login

# اتصال پروژه لوکال به پروژه ابری
npx supabase link --project-ref your-project-id

# اجرای تمام مایگریشن‌ها
npx supabase db push
```

---

## ۵. ایجاد حساب مدیر ارشد اولیه (Admin Provisioning)

احراز هویت مدیران در برنامه AuraVibe توسط سرویس **Supabase Auth** و بر اساس ارتباط با جدول `public.admin_users` انجام می‌گیرد:

```text
Supabase Auth user (auth.users)
          +
public.admin_users row (auth_user_id = auth.users.id)
```

### مراحل راه‌اندازی اولین مدیر ارشد (SUPER_ADMIN):
1. در داشبورد Supabase به بخش **Authentication > Users** بروید.
2. روی **Add User > Create User** کلیک نمایید:
   * **Email**: ایمیل مدیر ارشد (مثلاً `superadmin@auravibe.ir`).
   * **Password**: یک رمز عبور قوی و یکتا با حداقل ۱۲ کاراکتر تعیین فرمایید (*Choose a strong unique password*).
   * گزینه **Auto Confirm User** را فعال کنید.
3. مقدار **User UID** کاربر ساخته‌شده را کپی کنید.
4. در بخش **SQL Editor**، دستور زیر را اجرا کنید (شناسه UID کپی‌شده را جایگزین نمایید):

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

> **تعریف سایر مدیران در آینده:** پس از ورود با حساب مدیر ارشد، ایجاد سایر مدیران مستقیماً از بخش مدیریت کاربران پیشخوان و از طریق تابع امنیتی `create_admin_user` انجام می‌شود و نیازی به ورود دستی در دیتابیس نیست.

---

## ۶. درج داده‌های اولیه (Data Seeding)

اسکریپت `scripts/seed.js` وظیفه تزریق داده‌های قطعی اولیه (شامل محصولات، دسته‌بندی‌ها، بنرها، مقالات، سفارشات نمونه، تیکت‌ها و تنظیمات) به پایگاه‌داده را بر عهده دارد.

> **ماهیت داده‌های Seed:**
> تمام داده‌های موجود در فایل سید، داده‌های توسعه و دمو (**Development / Demo Data**) هستند.

### جداول تحت پوشش اسکریپت Seed:
* `categories`
* `product_badges`
* `products`
* `banners`
* `users`
* `orders`
* `support_tickets`
* `articles`
* `global_seo`
* `general_settings`
* `redirects`
* `audit_logs`
* `admin_users` (در صورت تامین کلید Service Role)

### اجرای اسکریپت Seed:

#### حالت عادی (با کلید ناشناس یا مقادیر فایل env.local.):
```bash
node scripts/seed.js
```

#### حالت پیشرفته (همراه با ساخت خودکار حساب‌های مدیر در Supabase Auth):
برای ساخت خودکار حساب‌های Auth ادمین‌ها در زمان اجرای سیدینگ، دسترسی ممتاز `SUPABASE_SERVICE_ROLE_KEY` الزامی است:
```bash
SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your-service-role-key node scripts/seed.js
```

همچنین می‌توانید کلمه عبور مدیران اولیه را با متغیرهای زیر سفارشی کنید:
```bash
INITIAL_ADMIN_PASSWORD="YourStrongPassword1" INITIAL_MANAGER_PASSWORD="YourStrongPassword2" node scripts/seed.js
```

---

## ۷. باکت‌های ذخیره‌سازی فایل (Supabase Storage Buckets)

مایگریشن‌ها ۴ باکت ذخیره‌سازی زیر را به همراه سیاست‌های دسترسی مشخص ایجاد می‌کنند:

| باکت (Bucket) | هدف و شرح کاربرد | خواندن (Read) | بارگذاری (Upload) | حذف/ویرایش (Update/Delete) |
|---|---|---|---|---|
| `banners` | تصاویر بنرهای اسلایدر و تبلیغات | 🌍 عمومی | 🔒 فقط ادمین فعال (`is_admin()`) | 🔒 فقط ادمین فعال |
| `products` | تصاویر کاتالوگ، گالری و دسته‌بندی‌ها | 🌍 عمومی | 🔒 فقط ادمین فعال (`is_admin()`) | 🔒 فقط ادمین فعال |
| `avatars` | تصاویر آواتار و پروفایل کاربران | 🌍 عمومی | 👤 ادمین، کاربر لاگین‌شده یا مسیر `avatars/*` | 🔒 فقط ادمین فعال |
| `support-media` | فایل‌های پیوست چت پشتیبانی (عکس، ویدیو، صوت) | 🔒 ادمین یا کاربر احراز هویت‌شده | 👤 ادمین، کاربر لاگین‌شده یا مسیر `support-media/*` | 🔒 فقط ادمین فعال |

---

## ۸. قابلیت ارتباط بلادرنگ (Supabase Realtime)

### جداول فعال در انتشار Realtime:
در مایگریشن پایگاه‌داده، جداول زیر به انتشار `supabase_realtime` اضافه شده‌اند:
* `products`
* `banners`
* `categories`
* `product_badges`
* `orders`
* `support_tickets`
* `articles`
* `general_settings`

### نحوه عملکرد در فرانت‌اند (`src/services/db.ts`):
* سرویس `db` در هنگام راه‌اندازی، کانال وب‌سوکت `auravibe-table-sync` را ثبت کرده و رویدادهای تغییرات (`postgres_changes`) جداول فوق را رصد می‌کند.
* با رخ دادن هرگونه تغییر در دیتابیس، متد `notify()` فراخوانی می‌شود و لیسنرهای ثبت‌شده در کامپوننت‌های React را مطلع می‌سازد.

### تمایز بارگذاری اولیه و اعلان Realtime:
```text
Initial Load (بارگذاری اولیه)
   └── درخواست مستقیم کوئری به پایگاه‌داده (Supabase Query) جهت دریافت اطلاعات

Realtime Notification (اعلان بلادرنگ)
   └── دریافت پیام تغییر سطر از وب‌سوکت و تحریک لیسنرهای فرانت‌اند جهت بارگذاری مجدد اطلاعات تازه
```
> پایگاه داده متمرکز PostgreSQL همواره مرجع نهایی حقیقت (Source of Truth) است و وب‌سوکت Realtime صرفاً نقش پیام‌رسان رویدادها را ایفا می‌کند.

---

## ۹. استقرار خودکار روی GitHub Pages (Deployment)

ورک‌فلو GitHub Actions در مسیر `.github/workflows/deploy.yml` قرار دارد:

1. در مخزن گیت‌هاب به مسیر **Settings > Secrets and variables > Actions** بروید.
2. متغیرهای زیر را ثبت کنید:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_PUBLISHABLE_KEY`
3. با ارسال کد به شاخه `master`، فرایند بیلد به صورت خودکار اجرا شده و نسخه خروجی در GitHub Pages منتشر می‌شود.
