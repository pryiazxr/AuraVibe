# AuraVibe 🌸✨

فروشگاه آنلاین تخصصی زیورآلات ظریف، اکسسوری و ساعت زنانه همراه با پیشخوان مدیریتی جامع ۳۶۰ درجه و سیستم بک‌اند ابری متمرکز بر پایه **Supabase**.

[![Deploy to GitHub Pages](https://github.com/pryiazxr/AuraVibe/actions/workflows/deploy.yml/badge.svg)](https://github.com/pryiazxr/AuraVibe/actions/workflows/deploy.yml)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

## 🚀 ویژگی‌های کلیدی (Key Features)

* **کاتالوگ فروشگاهی مدرن:** مشاهده کاتالوگ، فیلتر دسته‌بندی‌ها، جستجوی بلادرنگ، نشان‌های تجاری و گالری تعاملی.
* **پیشخوان مدیریتی ۳۶۰ درون‌برنامه‌ای:** ۱۱ ماژول تخصصی جهت مدیریت کاتالوگ، بنرها، سفارشات، مقالات، کاربران (RBAC)، تیکت‌های پشتیبانی، تحلیل و آمار فروش، سئو و لاگ‌های ممیزی.
* **بک‌اند متمرکز و مقیاس‌پذیر:** دیتابیس رابطه‌ای PostgreSQL روی Supabase، امنیت چندلایه Row Level Security (RLS)، احراز هویت ادمین با Supabase Auth، باکت‌های ابری Storage و کانال همگام‌سازی بلادرنگ (Realtime).
* **معماری پایدار و بدون وابستگی محلی:** پایگاه داده متمرکز Supabase تنها منبع داده (Source of Truth) است؛ هیچ‌گونه وابستگی به `localStorage` وجود ندارد.
* **استقرار خودکار:** استقرار پیوسته بر بستر GitHub Pages با استفاده از GitHub Actions.

---

## 🛠️ پشته فناوری (Tech Stack)

* **فرانت‌اند:** React 19، TypeScript، Vite 6، Tailwind CSS v4، Lucide Icons
* **پایگاه‌داده و سرویس ابری:** Supabase (PostgreSQL 15+، Supabase Auth، Supabase Storage، Supabase Realtime)
* **میزبانی و استقرار:** GitHub Pages (از طریق GitHub Actions)

---

## 🏛️ معماری سیستم در یک نگاه

```text
Browser / Client (مشتری یا مدیر پیشخوان)
   │
   ▼
React 19 UI (Storefront + Integrated Admin Dashboard)
   │
   ▼
src/services/db.ts (Data-Access Layer & In-Memory Cache)
   │
   ├── src/services/mappers.ts (snake_case DB ↔ camelCase Models)
   │
   ▼
src/services/supabase.ts (Supabase Client & Storage Helpers)
   │
   ▼
Supabase BaaS
 ├── PostgreSQL 15+ (۱۴ جدول دیتابیس + RLS + Secure RPCs)
 ├── Supabase Auth (احراز هویت مدیران)
 ├── Supabase Storage (باکت‌های: banners, products, avatars, support-media)
 └── Supabase Realtime (همگام‌سازی وب‌سوکت تغییرات جداول)
```

---

## ⚡ راه‌اندازی سریع در محیط لوکال (Quickstart)

```bash
# ۱. کلون کردن مخزن
git clone https://github.com/pryiazxr/AuraVibe.git
cd AuraVibe

# ۲. نصب وابستگی‌ها
npm install

# ۳. تنظیم متغیرهای محیطی
cp .env.example .env.local
# مقادیر VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY را در .env.local وارد کنید

# ۴. اجرای سرور توسعه محلی
npm run dev
```

---

## 📜 دستورات اجرایی پروژه (Scripts)

| دستور | شرح عملکرد |
|---|---|
| `npm run dev` | اجرای سرور توسعه لوکال Vite با قابلیت HMR |
| `npm run build` | ساخت بسته نهایی بهینه‌سازی‌شده برای Production در پوشه `dist/` |
| `npm run preview` | پیش‌نمایش خروجی بیلد روی وب‌سرور محلی |

---

## 📚 مستندات تفصیلی پروژه (Documentation)

برای مطالعه مستندات جامع، به فایل‌های زیر مراجعه فرمایید:

* [**راهنمای کامل راه‌اندازی Supabase و پایگاه‌داده**](./SUPABASE_SETUP.md): ایجاد پروژه، اجرای مایگریشن‌ها، تعریف مدیر ارشد، سیدینگ و باکت‌ها.
* [**معماری سیستم (Architecture)**](./docs/ARCHITECTURE.md): تشریح لایه‌های کد، جریان داده‌ها و نگاشت مدل‌ها.
* [**اسکیما و ساختار پایگاه‌داده (Database Schema)**](./docs/DATABASE.md): تشریح جزئیات فیلدها، انواع داده و ایندکس‌های ۱۴ جدول.
* [**امنیت و سطوح دسترسی (Security & RLS)**](./docs/SECURITY.md): خط‌مشی‌های امنیتی، قوانین RLS، توابع رویه‌ای RPC و کلیدهای محرمانه.
* [**راهنما و متغیرهای استقرار (Deployment)**](./docs/DEPLOYMENT.md): راهنمای گام‌به‌گام استقرار روی GitHub Pages، متغیرهای محیطی و مسیردهی `base`.
* [**راهنمای پیشخوان مدیریتی (Admin Dashboard)**](./DASHBOARD_INTEGRATION_GUIDE.md): ساختار و کنترل دسترسی ماژول‌های پیشخوان ۳۶۰.

---

## 🔒 امنیت و کلیدهای محرمانه

تنها کلیدهای با دسترسی عمومی (`VITE_SUPABASE_URL` و `VITE_SUPABASE_PUBLISHABLE_KEY`) باید در کلاینت یا تنظیمات GitHub Pages قرار گیرند. کلیدهای دارای سطح دسترسی بالا مانند `SUPABASE_SERVICE_ROLE_KEY` هرگز نباید در کدهای فرانت‌اند قرار داده یا کامیت شوند.

---

## 📄 مجوز انتشار (License)

توسعه‌یافته برای مجموعه AuraVibe. کلیه حقوق محفوظ است.
