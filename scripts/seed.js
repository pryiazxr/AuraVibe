/**
 * AuraVibe Database Seed Script
 * Run with: node scripts/seed.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to load .env or .env.local if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) must be set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const satinImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>';
const jewelryImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>';
const necklaceImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><path d="M70 80 Q150 220 230 80" stroke="%23FFF3C5" stroke-width="10" fill="none"/><circle cx="150" cy="180" r="22" fill="%23FFF3C5"/></svg>';
const watchImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="75" stroke="%2337192C" stroke-width="10" fill="none"/><line x1="150" y1="150" x2="150" y2="105" stroke="%2337192C" stroke-width="8"/><line x1="150" y1="150" x2="185" y2="150" stroke="%2337192C" stroke-width="8"/></svg>';

const categories = [
  { id: 1, name: 'ساعت', image: watchImage, display_order: 1 },
  { id: 2, name: 'تل', image: satinImage, display_order: 2 },
  { id: 3, name: 'کش', image: satinImage, display_order: 3 },
  { id: 4, name: 'اسکرانچی', image: satinImage, display_order: 4 },
  { id: 5, name: 'کلیپس', image: satinImage, display_order: 5 },
  { id: 6, name: 'گیره پینترستی', image: jewelryImage, display_order: 6 },
  { id: 7, name: 'گیره بچگانه', image: satinImage, display_order: 7 },
  { id: 8, name: 'کانزاشی', image: satinImage, display_order: 8 },
  { id: 9, name: 'تل توری و مجلسی', image: jewelryImage, display_order: 9 },
  { id: 10, name: 'زیورآلات مرواریدی', image: jewelryImage, display_order: 10 },
  { id: 11, name: 'دست‌بافت میوکی', image: jewelryImage, display_order: 11 },
  { id: 12, name: 'بدلیجات طرح جواهری', image: jewelryImage, display_order: 12 },
  { id: 13, name: 'گردنبند', image: necklaceImage, display_order: 13 },
  { id: 14, name: 'دستبند', image: jewelryImage, display_order: 14 },
  { id: 15, name: 'گوشواره', image: jewelryImage, display_order: 15 },
  { id: 16, name: 'انگشتر', image: jewelryImage, display_order: 16 },
  { id: 17, name: 'نیم ست', image: necklaceImage, display_order: 17 }
];

const badges = [
  { id: 1, title: 'جدیدترین‌ها' },
  { id: 2, title: 'پرفروش‌ترین‌ها' },
  { id: 3, title: 'تخفیف ویژه' },
  { id: 4, title: 'ساعت‌ها' }
];

const banners = [
  {
    id: 1,
    internal_name: 'بنر دسته‌بندی ساعت',
    eyebrow: 'AURA TIMEPIECES',
    title: 'کالکشن تخصصی ساعت',
    subtitle: 'ساعت‌های ظریف زنانه با بند استیل لوکس و طراحی مینیمال.',
    image: watchImage,
    target_category: 'ساعت',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 1
  },
  {
    id: 2,
    internal_name: 'بنر دسته‌بندی گردنبند',
    eyebrow: 'PEARL COLLECTION',
    title: 'درخشش آرام مروارید',
    subtitle: 'گردنبندهای مروارید و استیل رنگ ثابت ضدحساسیت.',
    image: necklaceImage,
    target_category: 'گردنبند',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 2
  },
  {
    id: 3,
    internal_name: 'بنر دسته‌بندی اسکرانچی',
    eyebrow: 'SATIN & SILK',
    title: 'لطافت ابریشم و ساتن',
    subtitle: 'اسکرانچی‌های ابریشمی بدون آسیب به موها در رنگ‌های پاستیلی.',
    image: satinImage,
    target_category: 'اسکرانچی',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 3
  },
  {
    id: 4,
    internal_name: 'بنر دسته‌بندی دستبند',
    eyebrow: 'AURA BRACELETS',
    title: 'دستبندهای ظریف آورا',
    subtitle: 'دستبندهای جواهری و زنجیری شیک برای استایل روزمره.',
    image: jewelryImage,
    target_category: 'دستبند',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 4
  },
  {
    id: 5,
    internal_name: 'بنر دسته‌بندی گوشواره',
    eyebrow: 'EARRINGS DROP',
    title: 'گوشواره‌های میخی و آویز',
    subtitle: 'مجموعه‌ای خاص از گوشواره‌های استیل رنگ ثابت درخشان.',
    image: jewelryImage,
    target_category: 'گوشواره',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 5
  },
  {
    id: 6,
    internal_name: 'بنر دسته‌بندی انگشتر',
    eyebrow: 'RINGS COLLECTION',
    title: 'انگشترهای فری‌سایز نگین‌دار',
    subtitle: 'انگشترهای جواهری فری‌سایز با آبکاری طلا.',
    image: jewelryImage,
    target_category: 'انگشتر',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 6
  },
  {
    id: 7,
    internal_name: 'بنر دسته‌بندی نیم ست',
    eyebrow: 'GIFT SETS',
    title: 'نیم‌ست‌های هدیه آورا',
    subtitle: 'ست‌های کامل زیورآلات ظریف با بسته‌بندی لوکس هدیه.',
    image: necklaceImage,
    target_category: 'نیم ست',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 7
  },
  {
    id: 8,
    internal_name: 'بنر دسته‌بندی تل',
    eyebrow: 'HEADBANDS',
    title: 'تل‌های مخمل و پارچه‌ای',
    subtitle: 'تل‌های سر شیک و پینترستی برای استایل‌های دانشگاهی و مهمانی.',
    image: satinImage,
    target_category: 'تل',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 8
  },
  {
    id: 9,
    internal_name: 'بنر دسته‌بندی کلیپس',
    eyebrow: 'HAIR CLIPS',
    title: 'کلیپس‌های فلزی و مرواریدی',
    subtitle: 'کلیپس‌های محکم و مقاوم با گیرندگی بالا.',
    image: jewelryImage,
    target_category: 'کلیپس',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 9
  },
  {
    id: 10,
    internal_name: 'بنر دسته‌بندی زیورآلات مرواریدی',
    eyebrow: 'CLASSIC PEARL',
    title: 'زیورآلات کلاسیک مروارید',
    subtitle: 'زیورآلات مرواریدی با طراحی‌های کلاسیک و اولد مانی.',
    image: necklaceImage,
    target_category: 'زیورآلات مرواریدی',
    cta_text: 'دیدن کالکشن',
    active: true,
    display_order: 10
  }
];

// Deterministic Products Generation
const products = [];
categories.forEach((cat, catIdx) => {
  for (let i = 0; i < 10; i++) {
    const prodId = (catIdx + 1) * 1000 + (i + 1);
    const prodCode = `AUR-${catIdx + 1}${i < 9 ? '0' : ''}${i + 1}`;
    const basePrice = 120000 + catIdx * 15000 + i * 18000;
    const isDiscounted = i % 3 === 0;
    const oldPrice = isDiscounted ? basePrice + 55000 : null;
    const img = cat.name === 'ساعت'
      ? watchImage
      : (cat.name === 'گردنبند' || cat.name === 'نیم ست' ? necklaceImage : (i % 2 === 0 ? satinImage : jewelryImage));

    products.push({
      id: prodId,
      product_code: prodCode,
      name: `${cat.name} مدل آورا کد ${i + 1}`,
      category: cat.name,
      price: basePrice,
      old_price: oldPrice,
      stock: 15 - (i % 5),
      images: [img],
      main_image_index: 0,
      badge: isDiscounted ? 'تخفیف ویژه' : (i % 3 === 0 ? 'جدید' : (i % 4 === 0 ? 'پرفروش' : null)),
      colors: i % 2 === 0 ? ['#37192C', '#FFF3C5'] : ['#D2B4DE', '#FADBD8', '#37192C'],
      description: `محصول ${cat.name} طراحی شده با بهترین متریال ضدحساسیت، رنگ‌بندی جذاب پاستیلی و بسته‌بندی لوکس آورا استایل.`,
      status: 'active'
    });
  }
});

const users = [
  {
    id: 1,
    first_name: 'مریم',
    last_name: 'احمدی',
    phone: '۰۹۱۲۹۸۷۶۵۴۳',
    email: 'maryam@gmail.com',
    province: 'تهران',
    city: 'تهران',
    address: 'نیاوران، خیابان مژده، پلاک ۱۲، واحد ۳',
    postal_code: '۱۹۸۷۶۵۴۳۲۱',
    registration_date: '۱۴۰۳/۰۱/۱۰',
    last_login: 'هم‌اکنون',
    status: 'active',
    order_count: 3
  },
  {
    id: 2,
    first_name: 'سارا',
    last_name: 'رضایی',
    phone: '۰۹۳۵۱۲۳۴۵۶۷',
    province: 'تهران',
    city: 'تهران',
    address: 'سعادت آباد، بلوار پاکنژاد، کوچه چهارم، پلاک ۵',
    postal_code: '۱۹۹۸۷۶۵۴۳۲',
    registration_date: '۱۴۰۳/۰۴/۰۵',
    last_login: '۱۴۰۳/۰۶/۲۱',
    status: 'active',
    order_count: 1
  }
];

const orders = [
  {
    id: 'ORD-9821',
    order_number: 'ORD-9821',
    user_id: 1,
    customer: {
      userId: 1,
      firstName: 'مریم',
      lastName: 'احمدی',
      phone: '۰۹۱۲۹۸۷۶۵۴۳',
      email: 'maryam@gmail.com',
      province: 'تهران',
      city: 'تهران',
      fullAddress: 'نیاوران، خیابان مژده، پلاک ۱۲، واحد ۳',
      postalCode: '۱۹۸۷۶۵۴۳۲۱'
    },
    items: [
      {
        productId: 13001,
        productCode: 'AUR-1301',
        productName: 'گردنبند مروارید آورا کد ۱۰۱',
        productImage: necklaceImage,
        originalPrice: 450000,
        finalPrice: 380000,
        quantity: 2,
        lineTotal: 760000
      }
    ],
    subtotal: 900000,
    discount: 140000,
    total_amount: 760000,
    shipping_method: {
      key: 'POST',
      title: 'پست پیشتاز',
      subtitle: 'ارسال به سراسر کشور (۲ تا ۴ روز کاری)',
      costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
    },
    order_status: 'تحویل داده شده',
    payment_status: 'پرداخت شده',
    tracking_code: '24567891011121314',
    timeline: [
      { status: 'جدید', date: '۱۴۰۳/۰۶/۱۵', time: '۱۰:۳۰', note: 'سفارش توسط مشتری ثبت شد' },
      { status: 'تأیید شده', date: '۱۴۰۳/۰۶/۱۵', time: '۱۱:۰۰', note: 'پرداخت تایید گردید' },
      { status: 'ارسال شده', date: '۱۴۰۳/۰۶/۱۶', time: '۰۹:۱۵', note: 'تحویل به پست پیشتاز' },
      { status: 'تحویل داده شده', date: '۱۴۰۳/۰۶/۱۸', time: '۱۴:۲۰', note: 'مرسوله با موفقیت تحویل داده شد' }
    ]
  },
  {
    id: 'ORD-9412',
    order_number: 'ORD-9412',
    user_id: 2,
    customer: {
      userId: 2,
      firstName: 'سارا',
      lastName: 'رضایی',
      phone: '۰۹۳۵۱۲۳۴۵۶۷',
      province: 'تهران',
      city: 'تهران',
      fullAddress: 'سعادت آباد، بلوار پاکنژاد، کوچه چهارم، پلاک ۵',
      postalCode: '۱۹۹۸۷۶۵۴۳۲'
    },
    items: [
      {
        productId: 1001,
        productCode: 'AUR-101',
        productName: 'ساعت زنانه آورا مدل رزگلد',
        productImage: watchImage,
        originalPrice: 820000,
        finalPrice: 690000,
        quantity: 1,
        lineTotal: 690000
      }
    ],
    subtotal: 820000,
    discount: 130000,
    total_amount: 690000,
    shipping_method: {
      key: 'AURA_EXPRESS',
      title: 'پیک اختصاصی آورا',
      subtitle: 'فقط تهران (تحویل همان روز)',
      costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
    },
    order_status: 'در حال آماده‌سازی',
    payment_status: 'پرداخت شده',
    timeline: [
      { status: 'جدید', date: '۱۴۰۳/۰۶/۲۰', time: '۱۶:۴۵', note: 'سفارش ثبت گردید' },
      { status: 'در حال آماده‌سازی', date: '۱۴۰۳/۰۶/۲۱', time: '۰۸:۳۰', note: 'بسته‌بندی در انبار آورا' }
    ]
  }
];

const tickets = [
  {
    id: 'TCK-1001',
    ticket_number: 'TCK-1001',
    user_id: 1,
    customer_name: 'مریم احمدی',
    customer_phone: '۰۹۱۲۹۸۷۶۵۴۳',
    subject: 'پیگیری ارسال سفارش ORD-9821',
    category: 'پیگیری ارسال',
    status: 'Open',
    priority: 'Normal',
    unread_admin_count: 1,
    unread_user_count: 0,
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'مریم احمدی',
        message: 'سلام، کد رهگیری پستی من ارسال نشده است.',
        createdAt: '۱۴۰۳/۰۶/۱۶ ۱۰:۰۰',
        type: 'text',
        readByAdmin: false,
        readByUser: true
      },
      {
        id: 'msg-2',
        sender: 'admin',
        senderName: 'پشتیبان آورا',
        message: 'سلام مریم عزیز، کد رهگیری پستی مرسوله شما 24567891011121314 می‌باشد.',
        createdAt: '۱۴۰۳/۰۶/۱۶ ۱۰:۳۰',
        type: 'text',
        readByAdmin: true,
        readByUser: true
      }
    ]
  }
];

const articles = [
  {
    id: 1,
    title: 'استایل لایت آکادمیا',
    subtitle: 'ترند تر و تمیز فصل جدید',
    full_article_title: 'استایل لایت آکادمیا چیست؟ راهنمای کامل لباس و اکسسوری در فصل جدید با رنگ‌های ملایم و کرمی.',
    article_link: '/journal/light-academia',
    display_order: 1,
    slug: 'light-academia-style-guide',
    digest: 'راهنمای لباس و اکسسوری پاستیلی با رنگ‌های کرمی و وانیلی.',
    content: `استایل لایت آکادمیا یکی از محبوب‌ترین ترندهای مد و اکسسوری در سال‌های اخیر است که تمرکز آن بر رنگ‌های کرم، وانیلی، قهوه‌ای روشن و زیورآلات ظریف مروارید و استیل است.

![تصویر اکسسوری های لایت آکادمیا](${satinImage})

این استایل با پارچه‌های ابریشمی و ساتن ترکیب فوق‌العاده‌ای ایجاد می‌کند و حس شیک و در عین حال راحتی را به شما می‌بخشد.`,
    tag: 'ترند فصل',
    category: 'راهنمای استایل',
    author: 'تیم مد وینا و آورا',
    keywords: ['لایت آکادمیا', 'اکسسوری کرم', 'مروارید'],
    image: satinImage,
    status: 'published',
    seo: {
      seoTitle: 'استایل لایت آکادمیا چیست؟ | آورا وایب',
      metaDescription: 'راهنمای کامل استایل لایت آکادمیا و انتخاب زیورآلات کرم وانیلی و مروارید.',
      focusKeyword: 'لایت آکادمیا'
    }
  },
  {
    id: 2,
    title: 'شناخت تناژ پوست',
    subtitle: 'راز درخشش بیشتر در استایل',
    full_article_title: 'چطور بفهمیم چه رنگ زیورآلاتی بیشتر بهمون میاد؟ راهنمای کامل انتخاب اکسسوری بر اساس تناژ پوست',
    article_link: '/journal/skin-tone',
    display_order: 2,
    slug: 'skin-tone-guide',
    digest: 'راهنمای کامل انتخاب رنگ مناسب استایل و اکسسوری بر اساس تناژ پوست.',
    content: `برای انتخاب زیورآلاتی که به بهترین شکل روی پوست شما بنشیند، ابتدا باید زیرپوست خود را بشناسید.

![شناخت تناژ پوست](${jewelryImage})

زیورآلات طلایی و برنجی برای پوست‌های گرم و زیورآلات نقره‌ای و مروارید سفید برای پوست‌های سرد ایده‌آل هستند.`,
    tag: 'راهنمای استایل',
    category: 'آموزش اکسسوری',
    author: 'تیم مد وینا و آورا',
    keywords: ['رنگ پوست', 'اکسسوری'],
    image: jewelryImage,
    status: 'published',
    seo: {}
  },
  {
    id: 3,
    title: 'استایل اولد مانی',
    subtitle: 'کلاسیک، شیک و ماندگار',
    full_article_title: 'استایل اولد مانی چیست؟ راهنمای کامل ساعت و اکسسوری اولد مانی | وینا اکسسوری و آورا استایل',
    article_link: '/journal/old-money',
    display_order: 3,
    slug: 'old-money-guide',
    digest: 'راهنمای کامل ساعت و اکسسوری اولد مانی برای استایل‌های اصیل و مینیمال.',
    content: `استایل اولد مانی بر کیفیت بی‌نظیر، رنگ‌های خنثی و ساعت و زیورآلات ظریف تاکید دارد.

![ساعت زنانه اولد مانی](${watchImage})

ساعت‌های بند چرمی و استیل ظریف با صفحه‌های کوچک نقش کلیدی در تکمیل این استایل دارند.`,
    tag: 'اکسسوری کلاسیک',
    category: 'کالکشن کلاسیک',
    author: 'تیم مد وینا و آورا',
    keywords: ['اولد مانی', 'ساعت زنانه'],
    image: watchImage,
    status: 'published',
    seo: {}
  }
];

const globalSeo = {
  id: 1,
  site_title: 'AuraVibe | فروشگاه تخصصی اکسسوری و زیورآلات ظریف',
  default_meta_description: 'خرید جدیدترین زیورآلات دست‌ساز، ساعت زنانه، اسکرانچی، کلیپس و بدلیجات استیل رنگ ثابت با بسته‌بندی لوکس آورا استایل.',
  default_og_image: jewelryImage,
  default_canonical: 'https://auravibe.ir',
  organization_name: 'مجموعه آورا وایب و وینا اکسسوری',
  organization_logo: satinImage,
  robots_txt: `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://auravibe.ir/sitemap.xml`
};

const generalSettings = {
  id: 1,
  site_name: 'AuraVibe | آورا وایب',
  logo_url: '',
  favicon_url: '',
  contact_email: 'hello@auravibe.ir',
  contact_phone: '۰۲۱-۸۸۸۸۹۹۹۹',
  address: 'تهران، خیابان نیاوران، پلاک ۱۵، واحد ۴',
  working_hours: 'همه روزه از ساعت ۹:۰۰ الی ۲۱:۰۰',
  social_links: {
    instagram: 'https://instagram.com/auravibe',
    telegram: 'https://t.me/auravibe',
    bale: 'https://ble.ir/auravibe'
  },
  timezone: 'Asia/Tehran',
  language: 'fa',
  header_links: [
    { title: 'صفحه اصلی', url: '/' },
    { title: 'جدیدترین‌ها', url: '/category/new' },
    { title: 'پرفروش‌ترین‌ها', url: '/category/bestsellers' },
    { title: 'مجله استایل', url: '/journal' }
  ],
  footer_description: 'فروشگاه تخصصی اکسسوری و زیورآلات ظریف با تم کرم وانیلی و بنفش آورا. جزئیات کوچکی که استایل شما را درخشان‌تر می‌کنند.',
  notifications: {
    newOrder: true,
    newUser: true,
    newTicket: true,
    securityAlert: true
  }
};

const redirects = [
  {
    id: '1',
    source_url: '/old-jewel',
    destination_url: '/category/زیورآلات',
    type: 301
  }
];

const auditLogs = [
  {
    id: 'log-1',
    admin_id: 100,
    admin_name: 'آرتین کریمی (Super Admin)',
    action: 'تغییر وضعیت سفارش',
    module: 'Orders',
    target: 'ORD-9821',
    timestamp: '۱۰ دقیقه پیش',
    date: '۱۴۰۳/۰۶/۱۸',
    time: '۱۴:۲۰',
    ip: '192.168.1.1',
    device: 'Chrome / Windows',
    details: 'تغییر وضعیت سفارش ORD-9821 به "تحویل داده شده"'
  }
];

async function seed() {
  console.log('🚀 Starting deterministic database seed for AuraVibe...');

  try {
    // 1. Categories
    console.log('Inserting categories...');
    const { error: catErr } = await supabase.from('categories').upsert(categories);
    if (catErr) throw new Error(`Categories insert failed: ${catErr.message}`);

    // 2. Product Badges
    console.log('Inserting product badges...');
    const { error: badgeErr } = await supabase.from('product_badges').upsert(badges);
    if (badgeErr) throw new Error(`Product badges insert failed: ${badgeErr.message}`);

    // 3. Products
    console.log(`Inserting ${products.length} products...`);
    // Insert in batches of 50
    for (let i = 0; i < products.length; i += 50) {
      const chunk = products.slice(i, i + 50);
      const { error: prodErr } = await supabase.from('products').upsert(chunk);
      if (prodErr) throw new Error(`Product chunk [${i}-${i + chunk.length}] insert failed: ${prodErr.message}`);
    }

    // 4. Banners
    console.log('Inserting banners...');
    const { error: bannerErr } = await supabase.from('banners').upsert(banners);
    if (bannerErr) throw new Error(`Banners insert failed: ${bannerErr.message}`);

    // 5. Users
    console.log('Inserting users...');
    const { error: userErr } = await supabase.from('users').upsert(users);
    if (userErr) throw new Error(`Users insert failed: ${userErr.message}`);

    // 6. Orders
    console.log('Inserting orders...');
    const { error: orderErr } = await supabase.from('orders').upsert(orders);
    if (orderErr) throw new Error(`Orders insert failed: ${orderErr.message}`);

    // 7. Support Tickets
    console.log('Inserting support tickets...');
    const { error: ticketErr } = await supabase.from('support_tickets').upsert(tickets);
    if (ticketErr) throw new Error(`Support tickets insert failed: ${ticketErr.message}`);

    // 8. Articles
    console.log('Inserting articles...');
    const { error: artErr } = await supabase.from('articles').upsert(articles);
    if (artErr) throw new Error(`Articles insert failed: ${artErr.message}`);

    // 9. Global SEO
    console.log('Inserting global SEO...');
    const { error: seoErr } = await supabase.from('global_seo').upsert(globalSeo);
    if (seoErr) throw new Error(`Global SEO insert failed: ${seoErr.message}`);

    // 10. General Settings
    console.log('Inserting general settings...');
    const { error: setErr } = await supabase.from('general_settings').upsert(generalSettings);
    if (setErr) throw new Error(`General settings insert failed: ${setErr.message}`);

    // 11. Redirects
    console.log('Inserting redirects...');
    const { error: redErr } = await supabase.from('redirects').upsert(redirects);
    if (redErr) throw new Error(`Redirects insert failed: ${redErr.message}`);

    // 12. Audit Logs
    console.log('Inserting audit logs...');
    const { error: auditErr } = await supabase.from('audit_logs').upsert(auditLogs);
    if (auditErr) throw new Error(`Audit logs insert failed: ${auditErr.message}`);

    // 13. Admin accounts provision
    console.log('Checking admin users provisioning...');
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Service role key detected. Provisioning Supabase Auth accounts...');
      const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AuraVibe_Admin_2026!';
      const managerPassword = process.env.INITIAL_MANAGER_PASSWORD || 'AuraVibe_Mgr_2026!';
      const adminsToProvision = [
        {
          id: 100,
          admin_code: 'ADM-100',
          first_name: 'آرتین',
          last_name: 'کریمی',
          username: 'superadmin',
          email: 'superadmin@auravibe.ir',
          password: adminPassword,
          role: 'SUPER_ADMIN',
          custom_permissions: [
            'manage_products',
            'manage_orders',
            'manage_banners',
            'manage_users',
            'manage_roles',
            'manage_support',
            'manage_content',
            'manage_seo',
            'manage_settings',
            'view_audit_logs'
          ]
        },
        {
          id: 101,
          admin_code: 'ADM-101',
          first_name: 'مهرنوش',
          last_name: 'کریمی',
          username: 'store_manager',
          email: 'store_manager@auravibe.ir',
          password: managerPassword,
          role: 'MANAGER',
          custom_permissions: ['manage_products', 'manage_orders', 'manage_banners', 'manage_support']
        }
      ];

      for (const adm of adminsToProvision) {
        // Try creating auth user or get existing
        const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
          email: adm.email,
          password: adm.password,
          email_confirm: true,
          user_metadata: {
            username: adm.username,
            first_name: adm.first_name,
            last_name: adm.last_name
          }
        });

        let authId = userData?.user?.id;
        if (createErr && createErr.message.includes('already registered')) {
          // Find user by email
          const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
          if (listErr) throw listErr;
          const existing = listData?.users?.find((u) => u.email === adm.email);
          authId = existing?.id;
        } else if (createErr) {
          throw new Error(`Admin user creation failed for ${adm.username}: ${createErr.message}`);
        }

        if (authId) {
          const { error: admUpsertErr } = await supabase.from('admin_users').upsert({
            id: adm.id,
            auth_user_id: authId,
            admin_code: adm.admin_code,
            first_name: adm.first_name,
            last_name: adm.last_name,
            username: adm.username,
            role: adm.role,
            custom_permissions: adm.custom_permissions,
            status: 'active',
            last_login: 'هم‌اکنون'
          });
          if (admUpsertErr) throw new Error(`Admin users record upsert failed: ${admUpsertErr.message}`);
          console.log(`Admin user '${adm.username}' provisioned with auth_user_id: ${authId}`);
        }
      }
    } else {
      console.log('Note: SUPABASE_SERVICE_ROLE_KEY not provided. Skipping Auth provisioning.');
    }

    console.log('✅ Deterministic seed completed successfully!');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
