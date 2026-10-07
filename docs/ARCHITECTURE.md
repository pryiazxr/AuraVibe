# معماری سیستم AuraVibe (AuraVibe System Architecture)

این سند تشریح‌کننده معماری فنی، جریان داده‌ها و نحوه تعامل لایه‌های مختلف فروشگاه و پیشخوان مدیریتی **AuraVibe** با پایگاه‌داده متمرکز **Supabase** است.

---

## ۱. نمای کلی معماری (High-Level Architecture)

معماری AuraVibe به صورت تک‌صفحه‌ای (Single Page Application - SPA) بر پایه React و TypeScript پیاده‌سازی شده و از پلتفرم ابری Supabase به عنوان Backend-as-a-Service (BaaS) بهره می‌برد.

```text
Browser / Client (کاربر فروشگاه یا مدیر پیشخوان)
   │
   ▼
React 19 UI (Storefront + Integrated Admin Dashboard)
   │
   ▼
src/services/db.ts (Data Access Abstraction & In-Memory Cache)
   │
   ├── src/services/mappers.ts (snake_case DB ↔ camelCase Domain Models)
   │
   ▼
src/services/supabase.ts (Supabase Client & Storage Helpers)
   │
   ▼
Supabase BaaS
 ├── PostgreSQL 15+ (۱۴ جدول اصلی + RLS Policies + توابع RPC)
 ├── Supabase Auth (احراز هویت ادمین‌ها و مدیریت توکن JWT)
 ├── Supabase Storage (۴ باکت: banners, products, avatars, support-media)
 └── Supabase Realtime (کانال auravibe-table-sync جهت همگام‌سازی رویدادها)
```

---

## ۲. تشریح لایه‌ها و مسئولیت‌ها (Layer Responsibilities)

### ۲.۱. لایه رابط کاربری (Frontend UI)
* **تکنولوژی:** React 19، TypeScript، Vite 6، Tailwind CSS v4، Lucide Icons.
* **فروشگاه (Storefront):** بخش عمومی شامل مشاهده کاتالوگ، جستجوی پیشرفته، فیلتر دسته‌بندی، سبد خرید، شبیه‌سازی پرداخت و ثبت سفارش، چت پشتیبانی و مشاهده پروفایل.
* **پیشخوان مدیریتی (Admin Dashboard):** پیشخوان جامع مدیریتی ۳۶۰ درجه واقع در `src/components/admin/` شامل ۱۱ ماژول:
  * داشبورد آمار کلیدی
  * مدیریت محصولات و برچسب‌ها
  * مدیریت بنرها و اسلایدرها
  * مدیریت و پیگیری وضعیت سفارشات
  * مدیریت مقالات مجله استایل
  * مدیریت کاربران و سیستم کنترل دسترسی نقش‌محور (RBAC)
  * میز پشتیبانی و پاسخ‌گویی به تیکت‌ها
  * گزارشات تحلیلی و آماری فروش
  * پیکربندی و بهینه‌سازی سئو (SEO)
  * تنظیمات عمومی فروشگاه
  * لاگ‌های امنیتی و ممیزی ادمین (Audit Logs)

---

### ۲.۲. لایه تجرید دسترسی به داده (`src/services/db.ts`)
کلاس `DatabaseService` (نمونه واحد `db`) به عنوان Facade و لایه واسط مرکزی عمل می‌کند:
* تمام درخواست‌های خواندن و نوشتن داده از کامپوننت‌های فرانت‌اند منحصراً از طریق توابع این سرویس انجام می‌شوند (`db.getProducts()`, `db.saveProduct()`, `db.getOrders()`, `db.adminLogin()` و ...).
* کامپوننت‌های React وابستگی مستقیمی به کوئری‌های خام Supabase ندارند.
* **کش موقت در حافظه (Runtime In-Memory Cache):** داده‌های خوانده‌شده در متغیرهای داخلی کش می‌شوند تا دسترسی سریع و همگام در طول session مرورگر فراهم گردد.
* **سیستم ناظر رویداد (Listener / Observer Pattern):** متد `subscribe(listener)` به کامپوننت‌های React اجازه می‌دهد در زمان تغییر داده‌ها در دیتابیس، فوراً مطلع شده و کامپوننت خود را به‌روزرسانی کنند.

---

### ۲.۳. لایه نگاشت داده (`src/services/mappers.ts`)
این لایه وظیفه تبدیل دوطرفه بین مدل پایگاه داده و مدل فرانت‌اند را دارد:
* **تبدیل اسامی فیلدها:** تبدیل نام‌گذاری `snake_case` در PostgreSQL به استانداردهای `camelCase` در تایپ‌اسکریپت (مانند `product_code` ↔ `productCode`، `display_order` ↔ `displayOrder`، `total_amount` ↔ `totalAmount`).
* **تبدیل انواع داده:** تبدیل مقادیر عددی ذخیره‌شده به عنوان `NUMERIC` یا `BIGINT` به `number` در جاوااسکریپت و پارس یا سریال‌سازی ستون‌های `JSONB` (مانند آرایه‌های تصاویر، رنگ‌ها، متادیتا سئو، اقلام سبد خرید).
* **تضمین سلامت مقادیر (Defaults & Null Safety):** جلوگیری از ورود مقادیر `undefined` به پایگاه داده و تنظیم مقادیر پیش‌فرض در هنگام دریافت سطرها.

---

### ۲.۴. لایه کلاینت سوپابیس (`src/services/supabase.ts`)
* وظیفه ایجاد کلاینت یکتای `@supabase/supabase-js` با اعتبارسنجی متغیرهای محیطی `VITE_SUPABASE_URL` و `VITE_SUPABASE_PUBLISHABLE_KEY`.
* تنظیمات پیش‌فرض احراز هویت (`persistSession: true`, `autoRefreshToken: true`).
* تابع کمکی `uploadToStorage()` جهت ارسال مستقیم فایل‌ها، Blobها یا رشته‌های Base64 به باکت‌های ذخیره‌سازی ابری و بازگرداندن آدرس عمومی (Public URL) با نام‌گذاری یکتای UUID برای جلوگیری از تداخل فایلی.

---

### ۲.۵. سرویس‌های پشتیبان در Supabase (Backend Services)
1. **پایگاه‌داده PostgreSQL 15+:**
   * ذخیره‌سازی داده‌های ساختاریافته در قالب ۱۴ جدول تخصصی.
   * فعال‌سازی Row Level Security (RLS) روی تمامی جداول برای تضمین امنیت در لایه داده.
   * توابع کنترلی امنیتی (`is_admin()`, `is_super_admin()`) و توابع رویه‌ای ایمن (`create_admin_user`, `create_customer_order`, `create_customer_ticket`).
2. **سرویس Supabase Auth:**
   * مدیریت هویت و صدور توکن‌های احراز هویت برای کاربران مدیر.
   * مرتبط بودن شناسه کاربری `auth.users(id)` با جدول برنامه `public.admin_users(auth_user_id)`.
3. **سرویس ذخیره‌سازی Supabase Storage:**
   * میزبانی دارایی‌های چندرسانه‌ای در ۴ باکت مجزا (`banners`, `products`, `avatars`, `support-media`).
4. **سرویس رویدادهای همگام Supabase Realtime:**
   * انتشار تغییرات جداول پایگاه‌داده روی کانال وب‌سوکت `auravibe-table-sync`.

---

## ۳. جریان داده‌ها (Data Flow Patterns)

### ۳.۱. بارگذاری اولیه (Initial Query)
```text
React Component (Mount)
    │
    ▼
db.getProducts() / db.getCategories()
    │
    ▼
supabase.from('products').select('*')
    │
    ▼
mappers.rowToProduct(row)
    │
    ▼
Update In-Memory Cache & Return to Component
```

### ۳.۲. دریافت رویداد همگام Realtime
```text
تغییر داده در PostgreSQL (توسط ادمین یا رویداد سیستمی)
    │
    ▼
Supabase Realtime Publication
    │
    ▼
auravibe-table-sync Channel (Event: *)
    │
    ▼
DatabaseService.notify()
    │
    ▼
React Subscription Listener Triggered
    │
    ▼
کامپوننت درخواست بارگذاری مجدد داده تازه را ثبت می‌کند (Re-fetch)
```

> **نکته مهم در رابطه با Realtime:** سیستم Realtime صرفاً یک سازوکار اعلان رویداد (Notification Bus) است و خود پایگاه‌داده PostgreSQL همواره مرجع نهایی حقیقت (Single Source of Truth) محسوب می‌شود.

---

## ۴. وضعیت منسوخ‌شدن LocalStorage

در نسخه‌های پیشین و پروتوتایپ اولیه، داده‌ها در حافظه موقت مرورگر ذخیره می‌شدند. در معماری فعلی:
* **هیچ وابستگی به `localStorage` به عنوان منبع داده وجود ندارد.**
* هیچ اسکریپت یا فرایند مایگریشن یک‌باره از `localStorage` به دیتابیس در برنامه وجود ندارد.
* پایگاه‌داده متمرکز Supabase تنها و تنها منبع ذخیره‌سازی و بازیابی تمام اطلاعات است.
* پاک کردن حافظه مرورگر و کوکی‌ها تاثیری در محتوا و پایداری کاتالوگ فروشگاه ندارد.
