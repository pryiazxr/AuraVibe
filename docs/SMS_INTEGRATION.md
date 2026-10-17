# راهنمای جامع اتصال ایمن به درگاه پیامکی SMS.ir در اورالون (AuraLune)

این مستند معماری، پیکربندی، استقرار و نکات امنیتی یکپارچه‌سازی وب‌سرویس پیامکی **SMS.ir** با فروشگاه اینترنتی **AuraLune** را تشریح می‌کند.

---

## ۱. نمای کلی معماری (Architecture Overview)

سیستم پیامکی اورالون بر پایه **Supabase Edge Functions** (مبتنی بر Deno/TypeScript) و متدولوژی امنیتی **Zero-Trust Client** طراحی شده است:

```text
┌────────────────────────────────────────────────────────┐
│                   AuraLune Frontend                    │
│   (React 19 / TypeScript / Vite / Tailwind CSS v4)     │
└───────────┬────────────────────────────────┬───────────┘
            │ 1. supabase.auth.signInWithOtp │ 2. db.createOrder(with verification)
            ▼                                ▼
┌────────────────────────────────────────────────────────┐
│                     Supabase Auth                      │
│   - مدیریت نشست‌ها، نرخ درخواست (Rate Limit)            │
│   - تولید امن و رمزنگاری توکن OTP                     │
└───────────────────────────┬────────────────────────────┘
                            │ Send SMS Hook (Signed HTTPS)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Supabase Edge Functions                │
│                                                        │
│  ├── auth-send-sms: هوک احراز هویت پیامکی               │
│  ├── verify-checkout-phone: اعتبارسنجی تلفن تسویه‌حساب │
│  ├── order-status-notification: اعلان وضعیت سفارش      │
│  └── _shared/smsir-adapter.ts: آداپتور رسمی SMS.ir     │
└───────────────────────────┬────────────────────────────┘
                            │ x-api-key (Server-Side Only)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SMS.ir REST API v1                   │
│   - POST https://api.sms.ir/v1/send/verify (Fast OTP)  │
│   - POST https://api.sms.ir/v1/send/bulk (Line Send)   │
└────────────────────────────────────────────────────────┘
```

### اجزای اصلی پیاده‌سازی شده:

1. **`supabase/functions/_shared/smsir-adapter.ts`**:
   * ارتباط مستقیم با API نسخه ۱ سامانه SMS.ir.
   * کلید وب‌سرویس را منحصراً از متغیر محیطی سروری `SMSIR_API_KEY` دریافت می‌کند.
   * متد `isConfigured()` برای بررسی سلامت پیکربندی بدون افشای کلید.
   * جداسازی کامل خطاهای ارائه‌دهنده پیامک (`SmsIrError`, `SmsIrRateLimitError`, `SmsIrNetworkError`, `SmsIrConfigurationError`).
   * مدیریت هوشمند مهلت زمان (Timeout با AbortController).
   * پشتیبانی کامل از Mock Mode برای تست‌های خودکار بدون هزینه و ارسال ناخواسته.

2. **`supabase/functions/_shared/phone-utils.ts` & `src/services/phone.ts`**:
   * اعتبارسنجی و نرمال‌سازی شماره‌های موبایل ایران (تبدیل ارقام فارسی/عربی، یکپارچه‌سازی پیش‌شماره‌های `+98`, `0098`, `09`).
   * قالب بین‌المللی E.164 (`+989123456789`) برای Supabase Auth و پایگاه‌داده.
   * قالب ملی ده‌رقمی/یازده‌رقمی (`09123456789`) برای وب‌سرویس SMS.ir.
   * ماسک‌کردن شماره در لاگ‌ها (`0912***6789`) جهت حفظ حریم خصوصی خریداران.

3. **`supabase/functions/auth-send-sms/index.ts`**:
   * وب‌هوک رسمی **Supabase Auth Send SMS Hook**.
   * اعتبارسنجی امضای استاندارد وب‌هوک (**Standard Webhooks** با HMAC-SHA256 بر روی بدنه خام) و هدرهای `webhook-id`, `webhook-timestamp`, `webhook-signature`.
   * مدل امنیتی **Fail-Closed**: در صورت عدم تنظیم کلید وب‌هوک در سرور، درخواست‌ها بلافاصله رد می‌شوند.
   * در محیط پروداکشن در صورت عدم تنظیم شناسه قالب با خطای ۵۰۰ متوقف می‌شود تا خطای پیکربندی آشکار گردد (عدم پاسخ فریبنده ۲۰۰).

4. **`supabase/functions/verify-checkout-phone/index.ts`**:
   * اعتبارسنجی شماره تماس هنگام ثبت سفارش در صورت تغییر شماره یا خرید مهمان.
   * صدور توکن‌های یک‌بارمصرف زمان‌دار (۱۵ دقیقه‌ای) پس از تایید شماره.
   * محدودیت ۳ درخواست در هر ۱۰ دقیقه برای هر شماره موبایل.
   * مجهز به تابع اتمیک دیتابیس با قفل سطری `FOR UPDATE` برای پیشگیری از حملات همزمانی (Race Condition).

5. **`supabase/functions/order-status-notification/index.ts`**:
   * ارسال اعلان پیامکی تغییر وضعیت فاکتور به مشتری.
   * کنترل سخت‌گیرانه دسترسی: احراز هویت توکن مدیر فعال یا کلید سرویس.
   * تضمین عدم ارسال تکراری (Idempotency) از طریق کلید یکتا در جدول `order_sms_notifications`.
   * ثبت دقیق وضعیت `accepted` هنگام تحویل پیام به درگاه به جای ادعای نادرست رسیدن به گوشی مشتری.
   * به دلیل آماده‌نبودن قالب اعلان وضعیت سفارش، به صورت پیش‌فرض و ایمن وضعیت `skipped_unverified_template` ثبت شده و پیامک زنده ارسال نمی‌شود.

---

## ۲. متغیرهای محیطی و کلیدهای محرمانه (Secrets Configuration)

> [!IMPORTANT]
> کلید `SMSIR_API_KEY` در سرور Supabase تعریف شده است و هرگز نباید در فایل‌های گیت، متغیرهای `VITE_*` یا باندل فرانت‌اند قرار گیرد.

| نام متغیر | موقعیت | توضیح | وضعیت در پروژه |
| :--- | :--- | :--- | :--- |
| `SMSIR_API_KEY` | Edge Functions Secret | کلید وب‌سرویس خصوصی دریافتی از پنل SMS.ir | **ایجاد شده در داشبورد پروداکشن** |
| `SMSIR_SENDER_LINE` | Edge Functions Secret | سرشماره اختصاصی ارسال پیامک (مثال: `30004505000017`) | خط فرستنده مشخص است |
| `SMSIR_OTP_TEMPLATE_ID` | Edge Functions Secret | شناسه عددی قالب سریع تایید (Verify OTP) | **در انتظار تأیید SMS.ir** |
| `SMSIR_OTP_PARAM_NAME` | Edge Functions Secret | نام متغیر کد تایید در قالب (پیش‌فرض: `Code`) | آماده پیکربندی |
| `SEND_SMS_HOOK_SECRET` | Edge Functions Secret | کلید وب‌هوک استاندارد (`whsec_...`) جهت اعتبارسنجی فرستنده هوک | **الزامی جهت امنیت (Fail-Closed)** |
| `SMSIR_ORDER_STATUS_TEMPLATE_ID` | Edge Functions Secret | شناسه قالب پیامک تغییر وضعیت سفارش | هنوز آماده نشده است |
| `SMSIR_MOCK_MODE` | Edge Functions Secret | مقدار `"true"` برای فعال‌سازی ارسال شبیه‌سازی‌شده | اختیاری برای تست |

---

## ۳. پایگاه‌داده، قفل‌های اتمیک و سیاست‌های امنیتی (Database & RLS)

مایگریشن `20261007000007_sms_and_checkout_verification.sql` موارد زیر را اضافه می‌کند:

1. **جدول `phone_verifications`**:
   * نگهداری هش SHA-256 کدهای تایید، مهلت انقضا، تعداد تلاش‌های ناموفق و توکن تایید نهایی.
   * مجهز به RLS: کاربران عادی دسترسی مستقیم خواندن این جدول را ندارند.

2. **تابع اتمیک `verify_checkout_otp_atomic` RPC**:
   * استفاده از قفل سطری `SELECT ... FOR UPDATE` جهت جلوگیری قطعی از حملات همزمانی (Race Condition).
   * افزایش اتمیک شمارنده تلاش‌ها و اعتبارسنجی بدون شکاف زمانی.

3. **جدول `order_sms_notifications`**:
   * نگهداری سابقه ارسال اعلان وضعیت سفارش همراه با کلید `idempotency_key` منحصربه‌فرد.
   * ثبت دقیق وضعیت `accepted` هنگام دریافت شناسه از وب‌سرویس پیامکی (به جای فرض نادرست رسیدن به گوشی).

4. **ایمن‌سازی سیاست درج سفارشات (`orders` INSERT RLS Policy)**:
   * جلوگیری از دور زدن اعتبارسنجی تلفن از طریق دستورات مستقیم `INSERT` روی جدول `orders`.
   * الزام تطابق شماره سفارش با شماره تایید شده کاربر لاگین یا عبور از تابع `create_customer_order` RPC.

5. **تابع ارتقاء‌یافته `create_customer_order` RPC**:
   * بررسی سروری مالکیت شماره موبایل مشتری:
     * اگر کاربر لاگین باشد و شماره سفارش با شماره تایید شده در پروفایل وی مطابقت کند، سفارش بلافاصله ثبت می‌شود.
     * اگر شماره موبایل تغییر کرده باشد یا کاربر مهمان باشد، وجود `verification_token` معتبر و منقضی‌نشده بررسی می‌شود.
     * مصرف اتمیک توکن یک‌بارمصرف با قفل سطری `FOR UPDATE`.

---

## ۴. مراحل استقرار Supabase Edge Functions

پس از نصب ابزار Supabase CLI در محیط کاری ادمین، دستورات زیر را جهت انتشار توابع لبه اجرا نمایید:

```bash
# ورود به حساب کاربری Supabase
supabase login

# لینک کردن پروژه
supabase link --project-ref ikkdblxpdjhiomucfdoh

# تنظیم کلیدهای محرمانه (در صورت نیاز به به‌روزرسانی)
supabase secrets set SMSIR_SENDER_LINE="30004505000017"
supabase secrets set SMSIR_OTP_PARAM_NAME="Code"
supabase secrets set SEND_SMS_HOOK_SECRET="whsec_..."

# استقرار تابع هوک احراز هویت (بدون JWT کلاینت زیرا هوک مستقیماً از GoTrue امضا می‌شود)
supabase functions deploy auth-send-sms --no-verify-jwt

# استقرار تابع تایید شماره تسویه‌حساب
supabase functions deploy verify-checkout-phone --no-verify-jwt

# استقرار تابع اعلان وضعیت سفارش
supabase functions deploy order-status-notification
```

---

## ۵. تنظیم هوک احراز هویت در داشبورد Supabase (Dashboard Configuration)

جهت متصل کردن لاگین پیامکی پیش‌فرض به هوک ایجاد شده:

1. به پیشخوان Supabase به آدرس [https://supabase.com/dashboard](https://supabase.com/dashboard) بروید.
2. پروژه **AuraLune** را انتخاب کنید.
3. از منوی کناری به بخش **Authentication** -> **Hooks** بروید.
4. بخش **Send SMS** را پیدا کرده و روی گزینه فعال‌سازی یا ویرایش کلیک کنید.
5. نوع هوک را روی **HTTPS Endpoint** تنظیم کنید.
6. آدرس تابع منتشر شده را وارد نمایید:
   `https://ikkdblxpdjhiomucfdoh.supabase.co/functions/v1/auth-send-sms`
7. کلید **Webhook Secret** تولید شده توسط سوپابیس (شروع با `whsec_`) را کپی کرده و به عنوان Secret در Edge Function تنظیم نمایید:
   `supabase secrets set SEND_SMS_HOOK_SECRET="whsec_..."`
8. تغییرات را ذخیره نمایید.

---

## ۶. چک‌لیست قبل از اولین تست ارسال پیامک واقعی

قبل از ارسال اولین پیامک زنده و کسر شارژ واقعی:

- [ ] **تأیید قالب کد تایید:** دریافت تاییدیه نهایی متن و متغیرهای قالب سریع در پنل SMS.ir.
- [ ] **تنظیم Template ID:** اجرای دستور `supabase secrets set SMSIR_OTP_TEMPLATE_ID="<شناسه_عددی>"` در سرور.
- [ ] **بررسی اعتبار پنل:** اطمینان از وجود شارژ ریالی/پیامکی کافی در حساب SMS.ir.
- [ ] **بررسی نام متغیر:** اطمینان از انطباق نام پارامتر متغیر در پنل (پیش‌فرض `Code`) با `SMSIR_OTP_PARAM_NAME`.
- [ ] **اجرای تست‌های خودکار:** اجرای `npm test` و اطمینان از پاس شدن تمام ۳۹ آزمون.
- [ ] **بررسی باندل تولیدی:** اجرای `npm run build` و اطمینان از عدم وجود هرگونه رشته حساس در فایل‌های کامپایل‌شده.
