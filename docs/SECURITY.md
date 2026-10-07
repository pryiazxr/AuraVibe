# مستندات امنیت و سطوح دسترسی (Security & RLS Documentation)

این سند تشریح‌کننده مدل امنیتی دفاع در عمق (Defense-in-Depth)، قوانین امنیت سطحی (Row Level Security - RLS)، سیاست‌های دسترسی به ذخیره‌سازی ابری (Storage Policies)، توابع رویه‌ای امن (Secure RPCs) و خط‌مشی‌های مدیریت کلیدهای محرمانه در پروژه **AuraVibe** است.

---

## ۱. اصول حاکم بر امنیت سیستم (Core Security Principles)

1. **اعمال امنیت در سطح پایگاه‌داده (Database-Enforced Security):**
   تمامی ۱۴ جدول پایگاه‌داده دارای ویژگی `ENABLE ROW LEVEL SECURITY` هستند. حتی اگر درخواستی مستقیماً از طریق REST API کلاینت ارسال شود، پایگاه‌داده کوئری را بر اساس سیاست‌های تعیین‌شده فیلتر یا رد می‌کند.
2. **جداسازی کامل نقش‌های کاربری (Role Separation):**
   دسترسی مدیران بر پایه احراز هویت هویت‌محور (Supabase Auth) و جدول پرسنلی `public.admin_users` کنترل می‌شود.
3. **عدم قرارگیری کلیدهای دارای دسترسی بالا در مرورگر (Least Privilege):**
   کلاینت مرورگر تنها به کلید انتشار عمومی (`VITE_SUPABASE_PUBLISHABLE_KEY` یا `anon key`) دسترسی دارد و تمامی اعتبارسنجی‌ها توسط RLS و توابع امن سرور کنترل می‌شوند.

---

## ۲. توابع کنترلی امنیت (Security Helper Functions)

برای اعتبارسنجی وضعیت مدیر بدون ایجاد چرخه بازگشتی (Recursion) در پالیسی‌های RLS، دو تابع `SECURITY DEFINER` در پایگاه داده پیاده‌سازی شده‌اند:

### ۲.۱. تابع `public.is_admin()`
این تابع بررسی می‌کند که آیا کاربر احراز هویت‌شده فعلی (`auth.uid()`) یک رکورد با وضعیت فعال (`status = 'active'`) در جدول `admin_users` دارد یا خیر:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND status = 'active'
  );
$$;
```

### ۲.۲. تابع `public.is_super_admin()`
این تابع انحصاراً دسترسی مدیر کل با نقش `SUPER_ADMIN` را بررسی می‌نماید:
```sql
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND role = 'SUPER_ADMIN'
      AND status = 'active'
  );
$$;
```

---

## ۳. طبقه‌بندی داده‌ها و قوانین RLS (Data Access Policies)

### ۳.۱. داده‌های عمومی (Public Storefront Data)
* **دسته‌بندی‌ها و برچسب‌ها (`categories`, `product_badges`):**
  * خواندن برای همه آزاد است (`USING (true)`).
  * ایجاد، ویرایش و حذف فقط توسط مدیر فعال مجاز است (`public.is_admin()`).
* **کاتالوگ محصولات (`products`):**
  * مشتریان و بازدیدکنندگان فقط محصولاتی با وضعیت فعال (`status = 'active'`) را مشاهده می‌کنند.
  * محصولات پیش‌نویس (`draft`) یا بایگانی‌شده (`archived`) تنها توسط ادمین قابل رویت و مدیریت هستند.
* **بنرها و اسلایدرها (`banners`):**
  * فقط بنرهایی با وضعیت فعال (`active = true`) برای عموم بازگردانده می‌شوند؛ مدیریت کامل در انحصار ادمین است.
* **مقالات مجله (`articles`):**
  * مقالات منتشرشده (`status = 'published'`) خواندن عمومی دارند؛ پیش‌نویس‌ها و عملیات CRUD مخصوص ادمین است.
* **تنظیمات و سئو (`global_seo`, `general_settings`, `redirects`):**
  * مقادیر عمومی جهت رندر سایت برای عموم قابل خواندن هستند (`SELECT USING (true)`).
  * هرگونه ویرایش و به‌روزرسانی مستلزم احراز هویت به عنوان ادمین است.

---

### ۳.۲. داده‌های کاربران و مشتریان (Customer Data)
* **پروفایل کاربران (`users`):**
  * مشاهده: فقط کاربر احراز هویت‌شده صاحب حساب (`auth_user_id = auth.uid()`) یا ادمین سیستم.
  * ویرایش: فقط کاربر صاحب حساب یا ادمین.
  * حذف: منحصراً در اختیار ادمین.
* **سفارشات (`orders`):**
  * مشاهده: فقط کاربری که سفارش به شناسه وی متصل است (`user_id = auth_user_id`) یا ادمین سیستم.
  * ثبت سفارش: از طریق سیاست معتبرسازی سفارشات جدید (`order_status = 'جدید'`) یا تابع امن سرور `create_customer_order`.
  * تغییر وضعیت و حذف: فقط توسط ادمین مجاز است.
* **تیکت‌های پشتیبانی (`support_tickets`):**
  * مشاهده و ارسال پیام: فقط صاحب تیکت یا ادمین.
  * حذف تیکت: منحصراً در اختیار ادمین.

---

### ۳.۳. داده‌های اداری و ممیزی (Admin & Audit Data)
* **مدیران سیستم (`admin_users`):**
  * مشاهده: فقط مدیران فعال سیستم (`public.is_admin()`) یا دارنده همان حساب (`auth.uid() = auth_user_id`).
  * تغییر و ایجاد: منحصراً در انحصار مدیر ارشد (`public.is_super_admin()`). هیچ مدیر عادی قادر به ترفیع درجه یا تغییر دسترسی‌های سایر مدیران نیست.
* **لاگ‌های ممیزی (`audit_logs`):**
  * مشاهده: فقط مدیران فعال احراز هویت‌شده.
  * درج رکورد: علاوه بر ادمین بودن، شناسه `admin_id` ثبت‌شده در لاگ باید دقیقاً منطبق با `auth.uid()` جاری مدیر باشد تا از جعل هویت در لاگ‌ها ممانعت به عمل آید.

---

## ۴. توابع رویه‌ای امن سمت سرور (Secure RPCs)

سه تابع کلیدی تحت عنوان `SECURITY DEFINER` در پایگاه‌داده وجود دارند:

1. **`create_admin_user`:**
   * فقط توسط کاربر با سطح `SUPER_ADMIN` قابل فراخوانی است.
   * به صورت اتمیک حساب `auth.users`، هویت `auth.identities` و رکورد `public.admin_users` را همراه با هش سالت‌شده Bcrypt ایجاد می‌کند.
2. **`create_customer_order`:**
   * ثبت سفارش همراه با محاسبه مجدد و قطعی مبالغ کل و تخفیف‌ها روی سرور برای جلوگیری از دستکاری قیمت‌ها در سمت کلاینت.
3. **`create_customer_ticket`:**
   * اعتبارسنجی اولیه ورودی‌های شماره تماس و پیام متنی و مقداردهی پیش‌فرض شمارنده‌های پیام‌های خوانده‌نشده.

---

## ۵. امنیت باکت‌های ذخیره‌سازی فایل (Supabase Storage Security)

پروژه از ۴ باکت ذخیره‌سازی استفاده می‌کند که قوانین دسترسی آن‌ها در `storage.objects` به این شرح است:

| نام باکت (Bucket) | دسترسی خواندن (Download/View) | دسترسی آپلود (Upload/Insert) | ویرایش و حذف (Update/Delete) |
|---|---|---|---|
| `banners` | 🌍 عمومی (Public) | 🔒 فقط ادمین فعال (`public.is_admin()`) | 🔒 فقط ادمین فعال |
| `products` | 🌍 عمومی (Public) | 🔒 فقط ادمین فعال (`public.is_admin()`) | 🔒 فقط ادمین فعال |
| `avatars` | 🌍 عمومی (Public) | 👤 ادمین، کاربر لاگین‌شده یا مسیر مجاز `avatars/*` | 🔒 فقط ادمین فعال |
| `support-media` | 🔒 فقط ادمین یا کاربر احراز هویت‌شده | 👤 ادمین، کاربر لاگین‌شده یا مسیر مجاز `support-media/*` | 🔒 فقط ادمین فعال |

> **نکته نام‌گذاری فایل‌ها:** تابع `uploadToStorage()` در فرانت‌اند برای هر فایل یک مسیر تصادفی با پیشوند زمان و شناسه UUID ایجاد می‌کند تا از بروز تداخل اسامی و رونویسی ناخواسته (Overwriting) جلوگیری شود.

---

## ۶. خط‌مشی محرمانگی کلیدها و اعتبارسنجی‌ها (Secrets Policy)

### ۶.۱. متغیرهای مجاز در فرانت‌اند (Client Bundle)
فقط دو مقدار زیر باید در محیط فرانت‌اند قرار گیرند:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
```
این کلیدها با پیشوند `VITE_` در زمان بیلد در فایل‌های JavaScript کامپایل شده و در اختیار عموم بازدیدکنندگان قرار می‌گیرند. امنیت سامانه به این کلیدها متکی نیست؛ بلکه بر اساس RLS و احراز هویت Supabase Auth تضمین شده است.

### ۶.۲. کلیدهای اکیداً ممنوع در فرانت‌اند (Forbidden Secrets)
موارد زیر **هرگز و تحت هیچ شرایطی** نباید در فایل‌های فرانت‌اند، کدهای مخزن یا گیت کامیت شوند:
* ❌ کلید `service_role` (کلید دور زننده کامل RLS)
* ❌ رمز عبور پایگاه داده PostgreSQL
* ❌ کلیدهای مخفی متغیرهای عمومی Vite

### ۶.۳. متغیرهای GitHub Actions
در ورک‌فلو استقرار GitHub Pages (`.github/workflows/deploy.yml`):
* تنها متغیرهای `VITE_SUPABASE_URL` و `VITE_SUPABASE_PUBLISHABLE_KEY` به محیط build تزریق می‌شوند.
* هرگز سکرت‌های سمت سرور نباید در تنظیمات مخزن این فرانت‌اند قرار گیرند.
