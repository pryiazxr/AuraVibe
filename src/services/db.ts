import { categoryList, satinImage, jewelryImage, necklaceImage, watchImage } from '../data';

// --- TYPES & INTERFACES ---

export type CropData = {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: '1:1' | '4:5' | '16:9' | 'custom';
};

export type ProductSEO = {
  title?: string;
  metaDescription?: string;
  slug?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogImage?: string;
};

export type Product = {
  id: number;
  productCode: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images: string[];
  mainImageIndex: number;
  cropData?: CropData;
  badge?: string;
  colors: string[];
  description: string;
  seo?: ProductSEO;
  status: 'active' | 'draft' | 'archived';
  updatedAt: string;
};

export type Banner = {
  id: number;
  internalName: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  cropData?: CropData;
  active: boolean;
  displayOrder: number;
};

export type ShippingMethodKey = 'POST' | 'TIPAX' | 'AURA_EXPRESS';

export type ShippingMethod = {
  key: ShippingMethodKey;
  title: string;
  subtitle: string;
  costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)';
};

export type OrderStatus =
  | 'جدید'
  | 'در حال بررسی'
  | 'تأیید شده'
  | 'در حال آماده‌سازی'
  | 'آماده ارسال'
  | 'تحویل به شرکت حمل'
  | 'ارسال شده'
  | 'تحویل داده شده'
  | 'لغو شده'
  | 'مرجوع شده'
  | 'ناموفق / مشکل در ارسال';

export type PaymentStatus = 'پرداخت شده' | 'در انتظار پرداخت' | 'ناموفق' | 'عکاسی/ثبت دستی';

export type OrderItemSnapshot = {
  productId: number;
  productCode: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  finalPrice: number;
  quantity: number;
  color?: string;
  lineTotal: number;
};

export type TimelineEvent = {
  status: OrderStatus;
  date: string;
  time: string;
  note?: string;
};

export type OrderCustomer = {
  userId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  province: string;
  city: string;
  fullAddress: string;
  postalCode: string;
};

export type Order = {
  id: string; // e.g., 'ORD-10452'
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  shippingMethod: ShippingMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingCode?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

export type UserStatus = 'active' | 'blocked';

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string; // Unique Identifier
  email?: string;
  address?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  registrationDate: string;
  lastLogin: string;
  status: UserStatus;
  blockReason?: string;
  orderCount: number;
};

export type Permission =
  | 'manage_products'
  | 'manage_orders'
  | 'manage_banners'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_support'
  | 'manage_content'
  | 'manage_seo'
  | 'manage_settings'
  | 'view_audit_logs';

export type AdminRole = 'SUPER_ADMIN' | 'MANAGER' | 'PRODUCT_MANAGER' | 'ORDER_MANAGER' | 'CONTENT_MANAGER' | 'SUPPORT_AGENT';

export type AdminUser = {
  id: number;
  adminCode: string;
  firstName: string;
  lastName: string;
  username: string; // Unique
  passwordHash: string;
  role: AdminRole;
  customPermissions: Permission[];
  status: 'active' | 'disabled';
  createdAt: string;
  lastLogin: string;
};

export type TicketStatus = 'Open' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type TicketMessage = {
  id: string;
  sender: 'customer' | 'admin' | 'system';
  senderName: string;
  message: string;
  attachments?: string[];
  createdAt: string;
  isInternalNote?: boolean;
};

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  userId?: number;
  customerName: string;
  customerPhone: string;
  subject: string;
  category: 'مشکل سفارش' | 'مشکل پرداخت' | 'پیگیری ارسال' | 'مرجوعی' | 'حساب کاربری' | 'سوال درباره محصول' | 'سایر';
  status: TicketStatus;
  priority: TicketPriority;
  assignedAdminId?: number;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
};

export type Article = {
  id: number;
  title: string;
  slug: string;
  digest: string;
  content: string;
  tag: string;
  category: string;
  author: string;
  source?: string;
  keywords: string[];
  image: string;
  status: 'published' | 'draft' | 'scheduled';
  createdAt: string;
  publishedAt: string;
  seo: {
    seoTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
};

export type RedirectRule = {
  id: string;
  sourceUrl: string;
  destinationUrl: string;
  type: 301 | 302;
  createdAt: string;
};

export type GlobalSEO = {
  siteTitle: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  defaultCanonical: string;
  organizationName: string;
  organizationLogo: string;
  robotsTxt: string;
  sitemapGeneratedAt: string;
};

export type GeneralSettings = {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  socialLinks: {
    instagram?: string;
    telegram?: string;
    bale?: string;
  };
  timezone: string;
  language: string;
  headerLinks: { title: string; url: string }[];
  footerDescription: string;
  notifications: {
    newOrder: boolean;
    newUser: boolean;
    newTicket: boolean;
    securityAlert: boolean;
  };
};

export type AuditLog = {
  id: string;
  adminId: number;
  adminName: string;
  action: string; // e.g. "Product Edited"
  module: 'Products' | 'Orders' | 'Banners' | 'Users' | 'Admins' | 'Content' | 'Settings' | 'Security';
  target: string;
  timestamp: string;
  date: string;
  time: string;
  ip: string;
  device: string;
  details: string;
};

export type AppNotification = {
  id: string;
  targetRole: 'admin' | 'user';
  userId?: number;
  title: string;
  message: string;
  type: 'order' | 'ticket' | 'user' | 'system' | 'security';
  read: boolean;
  createdAt: string;
};

// --- INITIAL SEED DATA ---

const SEED_PRODUCTS: Product[] = [
  {
    id: 101,
    productCode: 'AUR-101',
    name: 'گردنبند مروارید آورا کد ۱۰۱',
    category: 'گردنبند',
    price: 380000,
    oldPrice: 450000,
    stock: 15,
    images: [necklaceImage, jewelryImage],
    mainImageIndex: 0,
    badge: 'تخفیف ویژه',
    colors: ['#37192C', '#FFF3C5'],
    description: 'گردنبند مروارید پرورش یافته با زنجیر استیل رنگ ثابت ضد حساسیت و قفل استیل مقاوم آورا استایل.',
    status: 'active',
    updatedAt: new Date().toISOString()
  },
  {
    id: 102,
    productCode: 'AUR-102',
    name: 'اسکرانچی ابریشمی مدل پاپیون',
    category: 'اسکرانچی',
    price: 120000,
    oldPrice: 150000,
    stock: 40,
    images: [satinImage],
    mainImageIndex: 0,
    badge: 'جدید',
    colors: ['#37192C', '#FFF3C5', '#D2B4DE'],
    description: 'اسکرانچی ابریشمی لطیف بدون آسیب به موها، مناسب استایل‌های پاستیلی و شیک روزمره.',
    status: 'active',
    updatedAt: new Date().toISOString()
  },
  {
    id: 103,
    productCode: 'AUR-103',
    name: 'ساعت زنانه آورا مدل رزگلد',
    category: 'ساعت',
    price: 690000,
    oldPrice: 820000,
    stock: 8,
    images: [watchImage],
    mainImageIndex: 0,
    badge: 'پرفروش',
    colors: ['#37192C', '#FFF3C5'],
    description: 'ساعت مچی ظریف زنانه با صفحه مینیمال و بند استیل ضدزنگ لوکس همراه جعبه هدیه وینا.',
    status: 'active',
    updatedAt: new Date().toISOString()
  },
  {
    id: 104,
    productCode: 'AUR-104',
    name: 'انگشتر جواهری مدل شکوفه',
    category: 'انگشتر',
    price: 240000,
    stock: 22,
    images: [jewelryImage],
    mainImageIndex: 0,
    colors: ['#FFF3C5'],
    description: 'انگشتر استیل فری‌سایز با نگین‌های اتریشی درخشان، کاملاً ضدحساسیت و آبکاری طلا.',
    status: 'active',
    updatedAt: new Date().toISOString()
  }
];

const SEED_BANNERS: Banner[] = [
  {
    id: 1,
    internalName: 'کمپین زمستانه آورا',
    eyebrow: 'دست‌ساز، برای تو',
    title: 'لطافتِ کوچکِ هر روز',
    subtitle: 'اکسسوری‌هایی که با رنگ و جزئیاتشان، حال خوب می‌سازند.',
    image: satinImage,
    active: true,
    displayOrder: 1
  },
  {
    id: 2,
    internalName: 'کالکشن جدید مروارید',
    eyebrow: 'NEW DROP',
    title: 'درخشش آرام مروارید',
    subtitle: 'مجموعه‌ای ظریف برای قرارهای خاطره‌انگیز تو.',
    image: jewelryImage,
    active: true,
    displayOrder: 2
  }
];

const SEED_ORDERS: Order[] = [
  {
    id: 'ORD-9821',
    orderNumber: 'ORD-9821',
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
        productId: 101,
        productCode: 'AUR-101',
        productName: 'گردنبند مروارید آورا کد ۱۰۱',
        productImage: necklaceImage,
        originalPrice: 450000,
        finalPrice: 380000,
        quantity: 1,
        lineTotal: 380000
      }
    ],
    subtotal: 450000,
    discount: 70000,
    totalAmount: 380000,
    shippingMethod: {
      key: 'POST',
      title: 'پست پیشتاز',
      subtitle: 'ارسال به سراسر کشور (۲ تا ۴ روز کاری)',
      costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
    },
    orderStatus: 'تحویل داده شده',
    paymentStatus: 'پرداخت شده',
    trackingCode: '24567891011121314',
    timeline: [
      { status: 'جدید', date: '۱۴۰۳/۰۶/۱۵', time: '۱۰:۳۰', note: 'سفارش توسط مشتری ثبت شد' },
      { status: 'تأیید شده', date: '۱۴۰۳/۰۶/۱۵', time: '۱۱:۰۰', note: 'پرداخت تایید گردید' },
      { status: 'ارسال شده', date: '۱۴۰۳/۰۶/۱۶', time: '۰۹:۱۵', note: 'تحویل به پست پیشتاز' },
      { status: 'تحویل داده شده', date: '۱۴۰۳/۰۶/۱۸', time: '۱۴:۲۰', note: 'مرسوله با موفقیت تحویل داده شد' }
    ],
    createdAt: '2024-09-05T10:30:00Z',
    updatedAt: '2024-09-08T14:20:00Z'
  },
  {
    id: 'ORD-9412',
    orderNumber: 'ORD-9412',
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
        productId: 103,
        productCode: 'AUR-103',
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
    totalAmount: 690000,
    shippingMethod: {
      key: 'AURA_EXPRESS',
      title: 'پیک اختصاصی آورا',
      subtitle: 'فقط تهران (تحویل همان روز)',
      costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
    },
    orderStatus: 'در حال آماده‌سازی',
    paymentStatus: 'پرداخت شده',
    timeline: [
      { status: 'جدید', date: '۱۴۰۳/۰۶/۲۰', time: '۱۶:۴۵', note: 'سفارش ثبت گردید' },
      { status: 'در حال آماده‌سازی', date: '۱۴۰۳/۰۶/۲۱', time: '۰۸:۳۰', note: 'بسته‌بندی در انبار آورا' }
    ],
    createdAt: '2024-09-10T16:45:00Z',
    updatedAt: '2024-09-11T08:30:00Z'
  }
];

const SEED_USERS: User[] = [
  {
    id: 1,
    firstName: 'مریم',
    lastName: 'احمدی',
    phone: '۰۹۱۲۹۸۷۶۵۴۳',
    email: 'maryam@gmail.com',
    province: 'تهران',
    city: 'تهران',
    postalCode: '۱۹۸۷۶۵۴۳۲۱',
    registrationDate: '۱۴۰۳/۰۱/۱۰',
    lastLogin: '۱۴۰۳/۰۶/۱۸',
    status: 'active',
    orderCount: 3
  },
  {
    id: 2,
    firstName: 'سارا',
    lastName: 'رضایی',
    phone: '۰۹۳۵۱۲۳۴۵۶۷',
    province: 'تهران',
    city: 'تهران',
    postalCode: '۱۹۹۸۷۶۵۴۳۲',
    registrationDate: '۱۴۰۳/۰۴/۰۵',
    lastLogin: '۱۴۰۳/۰۶/۲۱',
    status: 'active',
    orderCount: 1
  }
];

const SEED_ADMINS: AdminUser[] = [
  {
    id: 100,
    adminCode: 'ADM-100',
    firstName: 'آرتین',
    lastName: 'کریمی',
    username: 'superadmin',
    passwordHash: 'superadmin123',
    role: 'SUPER_ADMIN',
    customPermissions: [
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
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: 'هم‌اکنون'
  },
  {
    id: 101,
    adminCode: 'ADM-101',
    firstName: 'مهرنوش',
    lastName: 'کریمی',
    username: 'store_manager',
    passwordHash: 'manager123',
    role: 'MANAGER',
    customPermissions: ['manage_products', 'manage_orders', 'manage_banners', 'manage_support'],
    status: 'active',
    createdAt: '2024-02-10T00:00:00Z',
    lastLogin: 'دیروز'
  }
];

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-1001',
    ticketNumber: 'TCK-1001',
    userId: 1,
    customerName: 'مریم احمدی',
    customerPhone: '۰۹۱۲۹۸۷۶۵۴۳',
    subject: 'پیگیری ارسال سفارش ORD-9821',
    category: 'پیگیری ارسال',
    status: 'Resolved',
    priority: 'Normal',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'مریم احمدی',
        message: 'سلام، کد رهگیری پستی من ارسال نشده است.',
        createdAt: '۱۴۰۳/۰۶/۱۶ ۱۰:۰۰'
      },
      {
        id: 'msg-2',
        sender: 'admin',
        senderName: 'پشتیبان آورا',
        message: 'سلام مریم عزیز، کد رهگیری پستی مرسوله شما 24567891011121314 می‌باشد.',
        createdAt: '۱۴۰۳/۰۶/۱۶ ۱۰:۳۰'
      }
    ],
    createdAt: '2024-09-06T10:00:00Z',
    updatedAt: '2024-09-06T10:30:00Z'
  }
];

const SEED_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'استایل لایت آکادمیا چیست؟',
    slug: 'light-academia-style-guide',
    digest: 'استایل لایت آکادمیا چیست؟ راهنمای کامل لباس و اکسسوری در فصل جدید با رنگ‌های ملایم و کرمی.',
    content: 'استایل لایت آکادمیا یکی از محبوب‌ترین ترندهای مد و اکسسوری در سال‌های اخیر است که تمرکز آن بر رنگ‌های کرم، وانیلی، قهوه‌ای روشن و زیورآلات ظریف مروارید و استیل است...',
    tag: 'ترند فصل',
    category: 'راهنمای استایل',
    author: 'تیم مد وینا و آورا',
    keywords: ['لایت آکادمیا', 'اکسسوری کرم', 'مروارید'],
    image: satinImage,
    status: 'published',
    createdAt: '2024-05-20T00:00:00Z',
    publishedAt: '2024-05-20T00:00:00Z',
    seo: {
      seoTitle: 'استایل لایت آکادمیا چیست؟ | آورا وایب',
      metaDescription: 'راهنمای کامل استایل لایت آکادمیا و انتخاب زیورآلات کرم وانیلی و مروارید.',
      focusKeyword: 'لایت آکادمیا'
    }
  }
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    adminId: 100,
    adminName: 'آرتین کریمی (Super Admin)',
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

const SEED_GLOBAL_SEO: GlobalSEO = {
  siteTitle: 'AuraVibe | فروشگاه تخصصی اکسسوری و زیورآلات ظریف',
  defaultMetaDescription: 'خرید جدیدترین زیورآلات دست‌ساز، ساعت زنانه، اسکرانچی، کلیپس و بدلیجات استیل رنگ ثابت با بسته‌بندی لوکس آورا استایل.',
  defaultOgImage: jewelryImage,
  defaultCanonical: 'https://auravibe.ir',
  organizationName: 'مجموعه آورا وایب و وینا اکسسوری',
  organizationLogo: satinImage,
  robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://auravibe.ir/sitemap.xml`,
  sitemapGeneratedAt: new Date().toISOString()
};

const SEED_GENERAL_SETTINGS: GeneralSettings = {
  siteName: 'AuraVibe | آورا وایب',
  logoUrl: '',
  faviconUrl: '',
  contactEmail: 'hello@auravibe.ir',
  contactPhone: '۰۲۱-۸۸۸۸۹۹۹۹',
  address: 'تهران، خیابان نیاوران، پلاک ۱۵، واحد ۴',
  workingHours: 'همه روزه از ساعت ۹:۰۰ الی ۲۱:۰۰',
  socialLinks: {
    instagram: 'https://instagram.com/auravibe',
    telegram: 'https://t.me/auravibe',
    bale: 'https://ble.ir/auravibe'
  },
  timezone: 'Asia/Tehran',
  language: 'fa',
  headerLinks: [
    { title: 'صفحه اصلی', url: '/' },
    { title: 'جدیدترین‌ها', url: '/category/new' },
    { title: 'پرفروش‌ترین‌ها', url: '/category/bestsellers' },
    { title: 'مجله استایل', url: '/journal' }
  ],
  footerDescription: 'فروشگاه تخصصی اکسسوری و زیورآلات ظریف با تم کرم وانیلی و بنفش آورا. جزئیات کوچکی که استایل شما را درخشان‌تر می‌کنند.',
  notifications: {
    newOrder: true,
    newUser: true,
    newTicket: true,
    securityAlert: true
  }
};

// --- CENTRAL STORE ENGINE WITH LOCALSTORAGE PERSISTENCE & PUB/SUB ---

class DatabaseService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initSeed();
  }

  private initSeed() {
    if (!localStorage.getItem('aura_products')) {
      localStorage.setItem('aura_products', JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem('aura_banners')) {
      localStorage.setItem('aura_banners', JSON.stringify(SEED_BANNERS));
    }
    if (!localStorage.getItem('aura_orders')) {
      localStorage.setItem('aura_orders', JSON.stringify(SEED_ORDERS));
    }
    if (!localStorage.getItem('aura_users')) {
      localStorage.setItem('aura_users', JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem('aura_admins')) {
      localStorage.setItem('aura_admins', JSON.stringify(SEED_ADMINS));
    }
    if (!localStorage.getItem('aura_tickets')) {
      localStorage.setItem('aura_tickets', JSON.stringify(SEED_TICKETS));
    }
    if (!localStorage.getItem('aura_articles')) {
      localStorage.setItem('aura_articles', JSON.stringify(SEED_ARTICLES));
    }
    if (!localStorage.getItem('aura_audit_logs')) {
      localStorage.setItem('aura_audit_logs', JSON.stringify(SEED_AUDIT_LOGS));
    }
    if (!localStorage.getItem('aura_global_seo')) {
      localStorage.setItem('aura_global_seo', JSON.stringify(SEED_GLOBAL_SEO));
    }
    if (!localStorage.getItem('aura_settings')) {
      localStorage.setItem('aura_settings', JSON.stringify(SEED_GENERAL_SETTINGS));
    }
    if (!localStorage.getItem('aura_redirects')) {
      localStorage.setItem('aura_redirects', JSON.stringify([]));
    }
    if (!localStorage.getItem('aura_notifications')) {
      localStorage.setItem('aura_notifications', JSON.stringify([]));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private get<T>(key: string): T {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : ([] as unknown as T);
  }

  private set<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
    this.notify();
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.get<Product[]>('aura_products');
  }

  public getProductById(id: number): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public saveProduct(prodData: Partial<Product>, adminUser: { id: number; name: string }): Product {
    const products = this.getProducts();
    let saved: Product;
    if (prodData.id) {
      // Edit
      const index = products.findIndex((p) => p.id === prodData.id);
      saved = {
        ...products[index],
        ...prodData,
        updatedAt: new Date().toISOString()
      } as Product;
      products[index] = saved;
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Product Edited',
        module: 'Products',
        target: saved.name,
        details: `کد: ${saved.productCode} | قیمت: ${saved.price} تومان | دسته: ${saved.category}`
      });
    } else {
      // Create
      const newId = Math.floor(100000 + Math.random() * 899999);
      const code = prodData.productCode || `AUR-${newId}`;
      saved = {
        id: newId,
        productCode: code,
        name: prodData.name || 'محصول جدید',
        category: prodData.category || 'گردنبند',
        price: prodData.price || 150000,
        oldPrice: prodData.oldPrice,
        stock: prodData.stock ?? 10,
        images: prodData.images && prodData.images.length ? prodData.images : [satinImage],
        mainImageIndex: prodData.mainImageIndex || 0,
        colors: prodData.colors || ['#37192C', '#FFF3C5'],
        description: prodData.description || 'توضیحات محصول آورا وایب.',
        status: prodData.status || 'active',
        badge: prodData.badge,
        seo: prodData.seo,
        updatedAt: new Date().toISOString()
      };
      products.unshift(saved);
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Product Created',
        module: 'Products',
        target: saved.name,
        details: `کد جدید: ${saved.productCode}`
      });
    }
    this.set('aura_products', products);
    return saved;
  }

  public deleteProduct(id: number, adminUser: { id: number; name: string }) {
    const products = this.getProducts();
    const target = products.find((p) => p.id === id);
    const updated = products.filter((p) => p.id !== id);
    this.set('aura_products', updated);
    if (target) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Product Deleted',
        module: 'Products',
        target: target.name,
        details: `محصول ${target.productCode} حذف گردید`
      });
    }
  }

  // --- BANNERS ---
  public getBanners(): Banner[] {
    return this.get<Banner[]>('aura_banners').sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getActiveBanners(): Banner[] {
    return this.getBanners().filter((b) => b.active);
  }

  public saveBanner(bannerData: Partial<Banner>, adminUser: { id: number; name: string }): Banner {
    const banners = this.getBanners();
    let saved: Banner;
    if (bannerData.id) {
      const idx = banners.findIndex((b) => b.id === bannerData.id);
      saved = { ...banners[idx], ...bannerData } as Banner;
      banners[idx] = saved;
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Banner Edited',
        module: 'Banners',
        target: saved.internalName,
        details: `وضعیت: ${saved.active ? 'فعال' : 'غیرفعال'}`
      });
    } else {
      saved = {
        id: Date.now(),
        internalName: bannerData.internalName || 'بنر تبلیغاتی جدید',
        eyebrow: bannerData.eyebrow || 'AURAVIBE',
        title: bannerData.title || 'عنوان بنر',
        subtitle: bannerData.subtitle || 'توضیحات تکمیلی بنر',
        image: bannerData.image || satinImage,
        active: bannerData.active ?? true,
        displayOrder: banners.length + 1
      };
      banners.push(saved);
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Banner Created',
        module: 'Banners',
        target: saved.internalName,
        details: `ترتیب: ${saved.displayOrder}`
      });
    }
    this.set('aura_banners', banners);
    return saved;
  }

  public reorderBanners(reordered: Banner[], adminUser: { id: number; name: string }) {
    const updated = reordered.map((b, idx) => ({ ...b, displayOrder: idx + 1 }));
    this.set('aura_banners', updated);
    this.addAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'Banners Reordered',
      module: 'Banners',
      target: 'اسلایدر اصلی',
      details: 'ترتیب بنرهای صفحه اصلی تغییر یافت'
    });
  }

  public deleteBanner(id: number, adminUser: { id: number; name: string }) {
    const banners = this.getBanners();
    const target = banners.find((b) => b.id === id);
    const updated = banners.filter((b) => b.id !== id);
    this.set('aura_banners', updated);
    if (target) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Banner Deleted',
        module: 'Banners',
        target: target.internalName,
        details: `بنر ${target.id} حذف شد`
      });
    }
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return this.get<Order[]>('aura_orders');
  }

  public getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderPayload: {
    customer: OrderCustomer;
    items: OrderItemSnapshot[];
    shippingMethod: ShippingMethod;
  }): Order {
    const orders = this.getOrders();
    const orderNum = `ORD-${Math.floor(10000 + Math.random() * 89999)}`;
    const now = new Date();

    const subtotal = orderPayload.items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
    const totalAmount = orderPayload.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = subtotal - totalAmount;

    const newOrder: Order = {
      id: orderNum,
      orderNumber: orderNum,
      customer: orderPayload.customer,
      items: orderPayload.items,
      subtotal,
      discount,
      totalAmount,
      shippingMethod: orderPayload.shippingMethod,
      orderStatus: 'جدید',
      paymentStatus: 'پرداخت شده',
      timeline: [
        {
          status: 'جدید',
          date: now.toLocaleDateString('fa-IR'),
          time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          note: 'سفارش توسط خریدار در سایت ثبت گردید.'
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    orders.unshift(newOrder);
    this.set('aura_orders', orders);

    // Also update order count for user if user exists
    if (orderPayload.customer.userId) {
      const users = this.getUsers();
      const uIdx = users.findIndex((u) => u.id === orderPayload.customer.userId);
      if (uIdx !== -1) {
        users[uIdx].orderCount += 1;
        this.set('aura_users', users);
      }
    }

    // Add notification
    this.addNotification({
      targetRole: 'admin',
      title: 'سفارش جدید ثبت شد',
      message: `سفارش ${orderNum} به مبلغ ${totalAmount.toLocaleString('fa-IR')} تومان ثبت گردید.`,
      type: 'order'
    });

    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUser: { id: number; name: string },
    note?: string,
    shippingMethodKey?: ShippingMethodKey
  ) {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return;

    const order = orders[idx];
    const oldStatus = order.orderStatus;
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (shippingMethodKey) {
      if (shippingMethodKey === 'POST') {
        order.shippingMethod = {
          key: 'POST',
          title: 'پست پیشتاز',
          subtitle: 'ارسال به سراسر کشور (۲ تا ۴ روز کاری)',
          costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
        };
      } else if (shippingMethodKey === 'TIPAX') {
        order.shippingMethod = {
          key: 'TIPAX',
          title: 'تیپاکس',
          subtitle: 'ارسال اکسپرس به سراسر کشور',
          costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
        };
      } else {
        order.shippingMethod = {
          key: 'AURA_EXPRESS',
          title: 'پیک اختصاصی آورا',
          subtitle: 'فقط تهران (تحویل همان روز)',
          costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
        };
      }
    }

    const now = new Date();
    order.timeline.push({
      status: newStatus,
      date: now.toLocaleDateString('fa-IR'),
      time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      note: note || `وضعیت سفارش توسط ${adminUser.name} به "${newStatus}" تغییر نمود.`
    });

    orders[idx] = order;
    this.set('aura_orders', orders);

    this.addAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'Order Status Changed',
      module: 'Orders',
      target: order.orderNumber,
      details: `تغییر از "${oldStatus}" به "${newStatus}"`
    });

    // Notify Customer
    this.addNotification({
      targetRole: 'user',
      userId: order.customer.userId,
      title: `به‌روزرسانی وضعیت سفارش ${order.orderNumber}`,
      message: `وضعیت سفارش شما به "${newStatus}" تغییر یافت.`,
      type: 'order'
    });
  }

  // --- USERS & ADMINS ---
  public getUsers(): User[] {
    return this.get<User[]>('aura_users');
  }

  public saveUser(userData: Partial<User>, adminUser: { id: number; name: string }): User {
    const users = this.getUsers();
    let saved: User;
    if (userData.id) {
      const idx = users.findIndex((u) => u.id === userData.id);
      saved = { ...users[idx], ...userData } as User;
      users[idx] = saved;
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'User Edited',
        module: 'Users',
        target: `${saved.firstName} ${saved.lastName}`,
        details: `وضعیت: ${saved.status}`
      });
    } else {
      saved = {
        id: Date.now(),
        firstName: userData.firstName || 'کاربر',
        lastName: userData.lastName || 'جدید',
        phone: userData.phone || '۰۹۱۲۰۰۰۰۰۰۰',
        email: userData.email,
        province: userData.province,
        city: userData.city,
        address: userData.address,
        postalCode: userData.postalCode,
        registrationDate: new Date().toLocaleDateString('fa-IR'),
        lastLogin: 'هم‌اکنون',
        status: 'active',
        orderCount: 0
      };
      users.unshift(saved);
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'User Created',
        module: 'Users',
        target: `${saved.firstName} ${saved.lastName}`,
        details: `شماره تماس: ${saved.phone}`
      });
    }
    this.set('aura_users', users);
    return saved;
  }

  public blockUser(userId: number, blockReason: string, adminUser: { id: number; name: string }) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].status = 'blocked';
      users[idx].blockReason = blockReason;
      this.set('aura_users', users);
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'User Blocked',
        module: 'Users',
        target: `${users[idx].firstName} ${users[idx].lastName}`,
        details: `دلیل مسدودی: ${blockReason}`
      });
    }
  }

  public unblockUser(userId: number, adminUser: { id: number; name: string }) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].status = 'active';
      users[idx].blockReason = undefined;
      this.set('aura_users', users);
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'User Unblocked',
        module: 'Users',
        target: `${users[idx].firstName} ${users[idx].lastName}`,
        details: 'کاربر از حالت مسدود خارج گردید'
      });
    }
  }

  // --- ADMINS (SUPER_ADMIN ONLY ACTIONS) ---
  public getAdmins(): AdminUser[] {
    return this.get<AdminUser[]>('aura_admins');
  }

  public saveAdmin(adminData: Partial<AdminUser>, currentSuperAdmin: { id: number; name: string; role: AdminRole }): AdminUser {
    if (currentSuperAdmin.role !== 'SUPER_ADMIN') {
      throw new Error('فقط مدیر اصلی (SUPER_ADMIN) مجاز به مدیریت حساب ادمین‌ها می‌باشد.');
    }
    const admins = this.getAdmins();
    let saved: AdminUser;
    if (adminData.id) {
      const idx = admins.findIndex((a) => a.id === adminData.id);
      saved = { ...admins[idx], ...adminData } as AdminUser;
      admins[idx] = saved;
      this.addAuditLog({
        adminId: currentSuperAdmin.id,
        adminName: currentSuperAdmin.name,
        action: 'Admin Account Edited',
        module: 'Admins',
        target: saved.username,
        details: `نقش: ${saved.role}`
      });
    } else {
      saved = {
        id: Date.now(),
        adminCode: `ADM-${Math.floor(100 + Math.random() * 899)}`,
        firstName: adminData.firstName || 'ادمین',
        lastName: adminData.lastName || 'جدید',
        username: adminData.username || `admin_${Date.now()}`,
        passwordHash: adminData.passwordHash || 'admin123',
        role: adminData.role || 'MANAGER',
        customPermissions: adminData.customPermissions || ['manage_products', 'manage_orders'],
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: 'هرگز'
      };
      admins.push(saved);
      this.addAuditLog({
        adminId: currentSuperAdmin.id,
        adminName: currentSuperAdmin.name,
        action: 'Admin Created',
        module: 'Admins',
        target: saved.username,
        details: `نقش اختصاص یافته: ${saved.role}`
      });
    }
    this.set('aura_admins', admins);
    return saved;
  }

  // --- SUPPORT TICKETS ---
  public getTickets(): SupportTicket[] {
    return this.get<SupportTicket[]>('aura_tickets');
  }

  public createTicket(payload: {
    userId?: number;
    customerName: string;
    customerPhone: string;
    subject: string;
    category: SupportTicket['category'];
    initialMessage: string;
  }): SupportTicket {
    const tickets = this.getTickets();
    const ticketNum = `TCK-${Math.floor(1000 + Math.random() * 8999)}`;
    const now = new Date();

    const newTicket: SupportTicket = {
      id: ticketNum,
      ticketNumber: ticketNum,
      userId: payload.userId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      subject: payload.subject,
      category: payload.category,
      status: 'Open',
      priority: 'Normal',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: payload.customerName,
          message: payload.initialMessage,
          createdAt: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    tickets.unshift(newTicket);
    this.set('aura_tickets', tickets);
    return newTicket;
  }

  public replyTicket(
    ticketId: string,
    message: string,
    sender: 'customer' | 'admin',
    senderName: string,
    isInternalNote = false,
    newStatus?: TicketStatus
  ) {
    const tickets = this.getTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return;

    const ticket = tickets[idx];
    const now = new Date();

    ticket.messages.push({
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      message,
      isInternalNote,
      createdAt: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`
    });

    if (newStatus) {
      ticket.status = newStatus;
    } else if (sender === 'admin' && !isInternalNote) {
      ticket.status = 'Waiting for Customer';
    } else if (sender === 'customer') {
      ticket.status = 'In Progress';
    }

    ticket.updatedAt = now.toISOString();
    tickets[idx] = ticket;
    this.set('aura_tickets', tickets);
  }

  // --- ARTICLES / MAGAZINE ---
  public getArticles(): Article[] {
    return this.get<Article[]>('aura_articles');
  }

  public saveArticle(articleData: Partial<Article>, adminUser: { id: number; name: string }): Article {
    const articles = this.getArticles();
    let saved: Article;
    if (articleData.id) {
      const idx = articles.findIndex((a) => a.id === articleData.id);
      saved = { ...articles[idx], ...articleData } as Article;
      articles[idx] = saved;
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Article Edited',
        module: 'Content',
        target: saved.title,
        details: `وضعیت: ${saved.status}`
      });
    } else {
      saved = {
        id: Date.now(),
        title: articleData.title || 'عنوان مقاله جدید',
        slug: articleData.slug || `article-${Date.now()}`,
        digest: articleData.digest || 'چکیده مقاله...',
        content: articleData.content || 'متن کامل مقاله...',
        tag: articleData.tag || 'ترند فصل',
        category: articleData.category || 'راهنمای استایل',
        author: articleData.author || adminUser.name,
        keywords: articleData.keywords || [],
        image: articleData.image || satinImage,
        status: articleData.status || 'published',
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        seo: articleData.seo || {}
      };
      articles.unshift(saved);
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Article Created',
        module: 'Content',
        target: saved.title,
        details: `انتشار در مجله`
      });
    }
    this.set('aura_articles', articles);
    return saved;
  }

  // --- SEO & SETTINGS ---
  public getGlobalSEO(): GlobalSEO {
    return this.get<GlobalSEO>('aura_global_seo');
  }

  public updateGlobalSEO(seoData: Partial<GlobalSEO>, adminUser: { id: number; name: string }) {
    const current = this.getGlobalSEO();
    const updated = { ...current, ...seoData };
    this.set('aura_global_seo', updated);
    this.addAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'Global SEO Updated',
      module: 'Settings',
      target: 'موتورهای جستجو',
      details: 'تنظیمات کلی SEO ذخیره گردید'
    });
  }

  public getGeneralSettings(): GeneralSettings {
    return this.get<GeneralSettings>('aura_settings');
  }

  public updateGeneralSettings(settings: Partial<GeneralSettings>, adminUser: { id: number; name: string }) {
    const current = this.getGeneralSettings();
    const updated = { ...current, ...settings };
    this.set('aura_settings', updated);
    this.addAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'General Settings Updated',
      module: 'Settings',
      target: 'تنظیمات عمومی سایت',
      details: 'اطلاعات هدر، فوتر و ارتباطات آپدیت شد'
    });
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>('aura_audit_logs');
  }

  public addAuditLog(entry: {
    adminId: number;
    adminName: string;
    action: string;
    module: AuditLog['module'];
    target: string;
    details: string;
  }) {
    const logs = this.getAuditLogs();
    const now = new Date();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      adminId: entry.adminId,
      adminName: entry.adminName,
      action: entry.action,
      module: entry.module,
      target: entry.target,
      timestamp: 'هم‌اکنون',
      date: now.toLocaleDateString('fa-IR'),
      time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      ip: '127.0.0.1',
      device: 'Admin Panel Web',
      details: entry.details
    };
    logs.unshift(newLog);
    this.set('aura_audit_logs', logs.slice(0, 100)); // Keep last 100 logs
  }

  // --- NOTIFICATIONS ---
  public getNotifications(role: 'admin' | 'user', userId?: number): AppNotification[] {
    const all = this.get<AppNotification[]>('aura_notifications');
    return all.filter((n) => n.targetRole === role && (!userId || n.userId === userId));
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) {
    const all = this.get<AppNotification[]>('aura_notifications');
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    all.unshift(newNotif);
    this.set('aura_notifications', all);
  }
}

export const db = new DatabaseService();
