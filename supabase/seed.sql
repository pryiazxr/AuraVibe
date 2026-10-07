-- ========================================================
-- AuraVibe Deterministic SQL Seed
-- ========================================================

-- Categories
INSERT INTO public.categories (id, name, image, display_order)
VALUES
  (1, 'ساعت', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="75" stroke="%2337192C" stroke-width="10" fill="none"/><line x1="150" y1="150" x2="150" y2="105" stroke="%2337192C" stroke-width="8"/><line x1="150" y1="150" x2="185" y2="150" stroke="%2337192C" stroke-width="8"/></svg>', 1),
  (2, 'تل', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>', 2),
  (3, 'کش', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>', 3),
  (4, 'اسکرانچی', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>', 4),
  (5, 'کلیپس', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>', 5),
  (6, 'گیره پینترستی', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 6),
  (7, 'گیره بچگانه', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>', 7),
  (8, 'کانزاشی', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>', 8),
  (9, 'تل توری و مجلسی', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 9),
  (10, 'زیورآلات مرواریدی', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 10),
  (11, 'دست‌بافت میوکی', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 11),
  (12, 'بدلیجات طرح جواهری', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 12),
  (13, 'گردنبند', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><path d="M70 80 Q150 220 230 80" stroke="%23FFF3C5" stroke-width="10" fill="none"/><circle cx="150" cy="180" r="22" fill="%23FFF3C5"/></svg>', 13),
  (14, 'دستبند', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 14),
  (15, 'گوشواره', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 15),
  (16, 'انگشتر', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 16),
  (17, 'نیم ست', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><path d="M70 80 Q150 220 230 80" stroke="%23FFF3C5" stroke-width="10" fill="none"/><circle cx="150" cy="180" r="22" fill="%23FFF3C5"/></svg>', 17)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  display_order = EXCLUDED.display_order;

-- Badges
INSERT INTO public.product_badges (id, title)
VALUES
  (1, 'جدیدترین‌ها'),
  (2, 'پرفروش‌ترین‌ها'),
  (3, 'تخفیف ویژه'),
  (4, 'ساعت‌ها')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Banners
INSERT INTO public.banners (id, internal_name, eyebrow, title, subtitle, image, target_category, cta_text, active, display_order)
VALUES
  (1, 'بنر دسته‌بندی ساعت', 'AURA TIMEPIECES', 'کالکشن تخصصی ساعت', 'ساعت‌های ظریف زنانه با بند استیل لوکس و طراحی مینیمال.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="75" stroke="%2337192C" stroke-width="10" fill="none"/><line x1="150" y1="150" x2="150" y2="105" stroke="%2337192C" stroke-width="8"/><line x1="150" y1="150" x2="185" y2="150" stroke="%2337192C" stroke-width="8"/></svg>', 'ساعت', 'دیدن کالکشن', true, 1),
  (2, 'بنر دسته‌بندی گردنبند', 'PEARL COLLECTION', 'درخشش آرام مروارید', 'گردنبندهای مروارید و استیل رنگ ثابت ضدحساسیت.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><path d="M70 80 Q150 220 230 80" stroke="%23FFF3C5" stroke-width="10" fill="none"/><circle cx="150" cy="180" r="22" fill="%23FFF3C5"/></svg>', 'گردنبند', 'دیدن کالکشن', true, 2),
  (3, 'بنر دسته‌بندی اسکرانچی', 'SATIN & SILK', 'لطافت ابریشم و ساتن', 'اسکرانچی‌های ابریشمی بدون آسیب به موها در رنگ‌های پاستیلی.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>', 'اسکرانچی', 'دیدن کالکشن', true, 3),
  (4, 'بنر دسته‌بندی دستبند', 'AURA BRACELETS', 'دستبندهای ظریف آورا', 'دستبندهای جواهری و زنجیری شیک برای استایل روزمره.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 'دستبند', 'دیدن کالکشن', true, 4),
  (5, 'بنر دسته‌بندی گوشواره', 'EARRINGS DROP', 'گوشواره‌های میخی و آویز', 'مجموعه‌ای خاص از گوشواره‌های استیل رنگ ثابت درخشان.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 'گوشواره', 'دیدن کالکشن', true, 5),
  (6, 'بنر دسته‌بندی انگشتر', 'RINGS COLLECTION', 'انگشترهای فری‌سایز نگین‌دار', 'انگشترهای جواهری فری‌سایز با آبکاری طلا.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 'انگشتر', 'دیدن کالکشن', true, 6),
  (7, 'بنر دسته‌بندی نیم ست', 'GIFT SETS', 'نیم‌ست‌های هدیه آورا', 'ست‌های کامل زیورآلات ظریف با بسته‌بندی لوکس هدیه.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><path d="M70 80 Q150 220 230 80" stroke="%23FFF3C5" stroke-width="10" fill="none"/><circle cx="150" cy="180" r="22" fill="%23FFF3C5"/></svg>', 'نیم ست', 'دیدن کالکشن', true, 7),
  (8, 'بنر دسته‌بندی تل', 'HEADBANDS', 'تل‌های مخمل و پارچه‌ای', 'تل‌های سر شیک و پینترستی برای استایل‌های دانشگاهی و مهمانی.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>', 'تل', 'دیدن کالکشن', true, 8),
  (9, 'بنر دسته‌بندی کلیپس', 'HAIR CLIPS', 'کلیپس‌های فلزی و مرواریدی', 'کلیپس‌های محکم و مقاوم با گیرندگی بالا.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>', 'کلیپس', 'دیدن کالکشن', true, 9),
  (10, 'بنر دسته‌بندی زیورآلات مرواریدی', 'CLASSIC PEARL', 'زیورآلات کلاسیک مروارید', 'زیورآلات مرواریدی با طراحی‌های کلاسیک و اولد مانی.', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><path d="M70 80 Q150 220 230 80" stroke="%23FFF3C5" stroke-width="10" fill="none"/><circle cx="150" cy="180" r="22" fill="%23FFF3C5"/></svg>', 'زیورآلات مرواریدی', 'دیدن کالکشن', true, 10)
ON CONFLICT (id) DO UPDATE SET
  internal_name = EXCLUDED.internal_name,
  eyebrow = EXCLUDED.eyebrow,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  image = EXCLUDED.image,
  target_category = EXCLUDED.target_category,
  cta_text = EXCLUDED.cta_text,
  active = EXCLUDED.active,
  display_order = EXCLUDED.display_order;

-- Users
INSERT INTO public.users (id, first_name, last_name, phone, email, province, city, address, postal_code, registration_date, last_login, status, order_count)
VALUES
  (1, 'مریم', 'احمدی', '۰۹۱۲۹۸۷۶۵۴۳', 'maryam@gmail.com', 'تهران', 'تهران', 'نیاوران، خیابان مژده، پلاک ۱۲، واحد ۳', '۱۹۸۷۶۵۴۳۲۱', '۱۴۰۳/۰۱/۱۰', 'هم‌اکنون', 'active', 3),
  (2, 'سارا', 'رضایی', '۰۹۳۵۱۲۳۴۵۶۷', NULL, 'تهران', 'تهران', 'سعادت آباد، بلوار پاکنژاد، کوچه چهارم، پلاک ۵', '۱۹۹۸۷۶۵۴۳۲', '۱۴۰۳/۰۴/۰۵', '۱۴۰۳/۰۶/۲۱', 'active', 1)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- Global SEO
INSERT INTO public.global_seo (id, site_title, default_meta_description, default_og_image, default_canonical, organization_name, organization_logo, robots_txt)
VALUES (
  1,
  'AuraVibe | فروشگاه تخصصی اکسسوری و زیورآلات ظریف',
  'خرید جدیدترین زیورآلات دست‌ساز، ساعت زنانه، اسکرانچی، کلیپس و بدلیجات استیل رنگ ثابت با بسته‌بندی لوکس آورا استایل.',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>',
  'https://auravibe.ir',
  'مجموعه آورا وایب و وینا اکسسوری',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>',
  E'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://auravibe.ir/sitemap.xml'
)
ON CONFLICT (id) DO UPDATE SET
  site_title = EXCLUDED.site_title,
  default_meta_description = EXCLUDED.default_meta_description;

-- General Settings
INSERT INTO public.general_settings (id, site_name, logo_url, favicon_url, contact_email, contact_phone, address, working_hours, social_links, timezone, language, header_links, footer_description, notifications)
VALUES (
  1,
  'AuraVibe | آورا وایب',
  '',
  '',
  'hello@auravibe.ir',
  '۰۲۱-۸۸۸۸۹۹۹۹',
  'تهران، خیابان نیاوران، پلاک ۱۵، واحد ۴',
  'همه روزه از ساعت ۹:۰۰ الی ۲۱:۰۰',
  '{"instagram":"https://instagram.com/auravibe","telegram":"https://t.me/auravibe","bale":"https://ble.ir/auravibe"}'::jsonb,
  'Asia/Tehran',
  'fa',
  '[{"title":"صفحه اصلی","url":"/"},{"title":"جدیدترین‌ها","url":"/category/new"},{"title":"پرفروش‌ترین‌ها","url":"/category/bestsellers"},{"title":"مجله استایل","url":"/journal"}]'::jsonb,
  'فروشگاه تخصصی اکسسوری و زیورآلات ظریف با تم کرم وانیلی و بنفش آورا. جزئیات کوچکی که استایل شما را درخشان‌تر می‌کنند.',
  '{"newOrder":true,"newUser":true,"newTicket":true,"securityAlert":true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  contact_email = EXCLUDED.contact_email;

-- Redirects
INSERT INTO public.redirects (id, source_url, destination_url, type)
VALUES ('1', '/old-jewel', '/category/زیورآلات', 301)
ON CONFLICT (id) DO NOTHING;

-- Audit Logs
INSERT INTO public.audit_logs (id, admin_id, admin_name, action, module, target, timestamp, date, time, ip, device, details)
VALUES (
  'log-1',
  100,
  'آرتین کریمی (Super Admin)',
  'تغییر وضعیت سفارش',
  'Orders',
  'ORD-9821',
  '۱۰ دقیقه پیش',
  '۱۴۰۳/۰۶/۱۸',
  '۱۴:۲۰',
  '192.168.1.1',
  'Chrome / Windows',
  'تغییر وضعیت سفارش ORD-9821 به "تحویل داده شده"'
)
ON CONFLICT (id) DO NOTHING;
