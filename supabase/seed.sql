-- ========================================================
-- AuraVibe Deterministic SQL Seed
-- ========================================================

-- Categories
INSERT INTO public.categories (id, name, image, display_order)
VALUES
  (1, 'ساعت', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80', 1),
  (2, 'تل', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80', 2),
  (3, 'کش', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80', 3),
  (4, 'اسکرانچی', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80', 4),
  (5, 'کلیپس', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80', 5),
  (6, 'گیره پینترستی', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 6),
  (7, 'گیره بچگانه', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80', 7),
  (8, 'کانزاشی', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80', 8),
  (9, 'تل توری و مجلسی', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 9),
  (10, 'زیورآلات مرواریدی', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 10),
  (11, 'دست‌بافت میوکی', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 11),
  (12, 'بدلیجات طرح جواهری', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 12),
  (13, 'گردنبند', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 13),
  (14, 'دستبند', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 14),
  (15, 'گوشواره', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 15),
  (16, 'انگشتر', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 16),
  (17, 'نیم ست', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 17)
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
  (1, 'بنر دسته‌بندی ساعت', 'AURA TIMEPIECES', 'کالکشن تخصصی ساعت', 'ساعت‌های ظریف زنانه با بند استیل لوکس و طراحی مینیمال.', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80', 'ساعت', 'دیدن کالکشن', true, 1),
  (2, 'بنر دسته‌بندی گردنبند', 'PEARL COLLECTION', 'درخشش آرام مروارید', 'گردنبندهای مروارید و استیل رنگ ثابت ضدحساسیت.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 'گردنبند', 'دیدن کالکشن', true, 2),
  (3, 'بنر دسته‌بندی اسکرانچی', 'SATIN & SILK', 'لطافت ابریشم و ساتن', 'اسکرانچی‌های ابریشمی بدون آسیب به موها در رنگ‌های پاستیلی.', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80', 'اسکرانچی', 'دیدن کالکشن', true, 3),
  (4, 'بنر دسته‌بندی دستبند', 'AURA BRACELETS', 'دستبندهای ظریف آورا', 'دستبندهای جواهری و زنجیری شیک برای استایل روزمره.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 'دستبند', 'دیدن کالکشن', true, 4),
  (5, 'بنر دسته‌بندی گوشواره', 'EARRINGS DROP', 'گوشواره‌های میخی و آویز', 'مجموعه‌ای خاص از گوشواره‌های استیل رنگ ثابت درخشان.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 'گوشواره', 'دیدن کالکشن', true, 5),
  (6, 'بنر دسته‌بندی انگشتر', 'RINGS COLLECTION', 'انگشترهای فری‌سایز نگین‌دار', 'انگشترهای جواهری فری‌سایز با آبکاری طلا.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 'انگشتر', 'دیدن کالکشن', true, 6),
  (7, 'بنر دسته‌بندی نیم ست', 'GIFT SETS', 'نیم‌ست‌های هدیه آورا', 'ست‌های کامل زیورآلات ظریف با بسته‌بندی لوکس هدیه.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 'نیم ست', 'دیدن کالکشن', true, 7),
  (8, 'بنر دسته‌بندی تل', 'HEADBANDS', 'تل‌های مخمل و پارچه‌ای', 'تل‌های سر شیک و پینترستی برای استایل‌های دانشگاهی و مهمانی.', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80', 'تل', 'دیدن کالکشن', true, 8),
  (9, 'بنر دسته‌بندی کلیپس', 'HAIR CLIPS', 'کلیپس‌های فلزی و مرواریدی', 'کلیپس‌های محکم و مقاوم با گیرندگی بالا.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 'کلیپس', 'دیدن کالکشن', true, 9),
  (10, 'بنر دسته‌بندی زیورآلات مرواریدی', 'CLASSIC PEARL', 'زیورآلات کلاسیک مروارید', 'زیورآلات مرواریدی با طراحی‌های کلاسیک و اولد مانی.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 'زیورآلات مرواریدی', 'دیدن کالکشن', true, 10)
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
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
  'https://auravibe.ir',
  'مجموعه آورا وایب و وینا اکسسوری',
  'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800&auto=format&fit=crop&q=80',
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
