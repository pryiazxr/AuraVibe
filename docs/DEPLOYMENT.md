# راهنمای توسعه محلی و استقرار (Local Development & Deployment Guide)

این راهنما مراحل گام‌به‌گام راه‌اندازی پروژه **AuraVibe** روی محیط توسعه لوکال و استقرار خودکار روی **GitHub Pages** به همراه تنظیمات ساخت و پایگاه‌داده را شرح می‌دهد.

---

## ۱. پیش‌نیازهای سیستمی (Prerequisites)

* **Node.js**: نسخه 20.x یا بالاتر
* **npm**: نسخه 10.x یا بالاتر
* **Git**: آخرین نسخه
* حساب کاربری فعال در [Supabase](https://supabase.com)

---

## ۲. راه‌اندازی محیط لوکال (Local Setup)

### گام اول: کلون کردن مخزن
```bash
git clone https://github.com/pryiazxr/AuraVibe.git
cd AuraVibe
```

### گام دوم: نصب وابستگی‌ها
```bash
npm install
```

### گام سوم: تنظیم متغیرهای محیطی
یک فایل بنام `.env.local` در ریشه پروژه در کنار `.env.example` بسازید:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
```

> **نکته امنیتی:** مقادیر فوق کلیدهای عمومی کلاینت هستند. هرگز کلیدهای دارای سطح دسترسی بالا مانند `SUPABASE_SERVICE_ROLE_KEY` را در فایل‌های فرانت‌اند یا متغیرهای با پیشوند `VITE_` قرار ندهید.

### گام چهارم: اعمال مایگریشن‌های پایگاه‌داده
در داشبورد Supabase خود به مسیر **SQL Editor** رفته و ۳ فایل زیر را به ترتیب از پوشه `supabase/migrations/` کپی و اجرا نمایید:
1. `supabase/migrations/20261007000001_initial_schema.sql`
2. `supabase/migrations/20261007000002_storage_and_rls.sql`
3. `supabase/migrations/20261007000003_hardening_rls_and_auth.sql`

*(یا با استفاده از Supabase CLI: دستور `npx supabase db push`)*

### گام پنجم: تعریف مدیر ارشد اولیه (Initial Super Admin)
برای ایجاد اولین دسترسی مدیریت پیشخوان:
1. در داشبورد Supabase به مسیر **Authentication > Users** بروید و روی **Add User > Create User** کلیک کنید:
   * **Email**: ایمیل سازمانی شما (مثلاً `superadmin@auravibe.ir`)
   * **Password**: یک رمز عبور قوی و غیرقابل حدس انتخاب فرمایید.
   * گزینه **Auto Confirm User** را فعال کنید.
2. مقدار `User UID` کاربر ایجادشده را کپی کنید.
3. در **SQL Editor** دستور زیر را اجرا نمایید:

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

### گام ششم: درج داده‌های اولیه (Data Seeding)
برای پر کردن دیتابیس با داده‌های کاتالوگ، دسته‌بندی‌ها، بنرها و تنظیمات:
```bash
node scripts/seed.js
```
*(اگر مایلید حساب ادمین نمونه نیز به‌صورت خودکار توسط اسکریپت در Auth ساخته شود، می‌توانید اسکریپت را همراه با `SUPABASE_SERVICE_ROLE_KEY` اجرا کنید:)*
```bash
SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your-key node scripts/seed.js
```

### گام هفتم: اجرای سرور توسعه لوکال
```bash
npm run dev
```
برنامه در آدرس `http://localhost:5173/AuraVibe/` در دسترس خواهد بود.

---

## ۳. دستورات موجود در پروژه (Scripts Reference)

طبق فایل `package.json`:

| دستور | شرح عملکرد |
|---|---|
| `npm run dev` | اجرای محیط لوکال توسعه توسط Vite همراه با قابلیت Hot Module Replacement (HMR) |
| `npm run build` | کامپایل کدهای TypeScript و Tailwind CSS به بسته‌های بهینه‌سازی‌شده استاتیک در پوشه `dist/` |
| `npm run preview` | اجرای سرور پیش‌نمایش محلی برای بررسی خروجی پوشه `dist/` قبل از استقرار |

---

## ۴. استقرار روی GitHub Pages (Production Deployment)

استقرار برنامه به صورت پیوسته (Continuous Deployment) از طریق **GitHub Actions** انجام می‌شود.

### ۴.۱. تنظیم Secretها در گیت‌هاب
1. در صفحه مخزن پروژه در GitHub به مسیر زیر بروید:
   `Settings` > `Secrets and variables` > `Actions`
2. دو سکرت جدید با کلیک روی **New repository secret** تعریف کنید:
   * **`VITE_SUPABASE_URL`**: آدرس پروژه Supabase شما (مانند `https://xyzcompany.supabase.co`)
   * **`VITE_SUPABASE_PUBLISHABLE_KEY`**: کلید `anon` / `public` پروژه Supabase شما

### ۴.۲. سازوکار ورک‌فلو (`.github/workflows/deploy.yml`)
با هر `git push` به شاخه `master`، فرایند زیر به صورت خودکار طی می‌شود:
```text
Push to master
      │
      ▼
Checkout Repository
      │
      ▼
Setup Node.js 20
      │
      ▼
npm ci (نصب قطعی پکیج‌ها)
      │
      ▼
npm run build (تزریق متغیرهای محیطی به باندل کلاینت)
      │
      ▼
Configure GitHub Pages & Upload dist Artifact
      │
      ▼
Deploy to GitHub Pages
```

### ۴.۳. تنظیم مسیر ریشه (Vite Base Path)
در فایل `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/AuraVibe/',
  plugins: [react(), tailwindcss()],
});
```
* مقدار `base: '/AuraVibe/'` متناسب با آدرس پروژه در گیت‌هاب پیجز (`https://<username>.github.io/AuraVibe/`) تنظیم شده است تا مسیردهی فایل‌های JavaScript و CSS دچار اختلال نگردد.
* **یادداشت برای آینده:** در صورت انتقال پروژه به یک دامنه اختصاصی مستقل (مانند `https://auravibe.ir`)، این مقدار باید به `base: '/'` تغییر یابد.

---

## ۵. سناریوی آزمون و تایید صحت عملکرد (Verification Checklist)

برای اطمینان از سلامت استقرار و اتصال به پایگاه‌داده:
1. **بررسی پایداری داده‌ها (No LocalStorage Dependency):**
   * در تب Application ابزار Developer Tools مرورگر، تمام داده‌های LocalStorage را پاک کنید (Clear site data).
   * صفحه را رفرش کنید؛ تمامی محصولات، بنرها و تنظیمات همچنان بدون نقص از Supabase بارگذاری می‌شوند.
2. **ورود و دسترسی مدیریت (Admin Authentication):**
   * با کلیک روی آیکون پیشخوان در منوی شناور پایین وارد صفحه لاگین شوید.
   * نام کاربری `superadmin` و رمز عبور تعیین‌شده را وارد کنید.
   * پنل مدیریت ۳۶۰ درجه باید بارگذاری شده و دسترسی به جداول محصولات، سفارشات و تیکت‌ها را نمایش دهد.
3. **همگام‌سازی لحظه‌ای (Realtime Sync):**
   * سایت را در دو پنجره مرورگر مجزا باز کنید.
   * در پنجره اول، وضعیت یک سفارش یا عنوان یک محصول را در پیشخوان تغییر دهید.
   * پنجره دوم باید تغییرات را به صورت همزمان دریافت و رندر کند.
4. **بارگذاری تصاویر در Storage:**
   * در بخش ویرایش محصول، یک تصویر جدید آپلود کنید.
   * تصویر باید با آدرس عمومی معتبر در باکت `products` در Supabase ذخیره شده و نمایش داده شود.

---

## ۶. وضعیت فعلی و محدودیت‌های شناخته‌شده (Known Limitations / Current State)

1. **احراز هویت مشتریان (Customer Authentication):**
   * احراز هویت ادمین‌ها به طور کامل از طریق Supabase Auth و جدول `admin_users` پیاده‌سازی شده است.
   * حساب مشتری جاری در فروشگاه (`currentUser`) در حال حاضر دارای یک حالت نمایشی/استاتیک پیش‌فرض در فرانت‌اند است. سیستم ورود پیامکی (OTP) مشتریان با Supabase Auth برای فازهای آتی برنامه‌ریزی شده است.
2. **دارایی‌های چندرسانه‌ای اولیه (Seed Media Assets):**
   * زیرساخت آپلود فایل‌ها به باکت‌های ابری Supabase (`banners`, `products`, `avatars`, `support-media`) کاملاً عملیاتی است.
   * با این وجود، داده‌های سید اولیه به منظور استقلال کامل، عدم وابستگی به اینترنت بین‌الملل و جلوگیری از لینک‌های شکسته، از تصاویر برداری درون‌خطی (`data:image/svg+xml`) استفاده می‌کنند.
