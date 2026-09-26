import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Filter,
  Headphones,
  Heart,
  Home,
  Instagram,
  Menu,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  UserCheck,
  UserRound,
  X,
  Check,
  CreditCard,
  FileText,
  Lock,
  MessageSquare,
  LogOut,
  Camera,
  ChevronDown,
  LayoutDashboard,
  Box,
  Users,
  Image as ImageIcon,
  Tag,
  Star,
  Folder,
  Settings,
  Shield,
  BarChart3,
  Globe,
  Palette,
  Server,
  Activity,
  Trash2,
  Eye,
  PlusCircle,
  RotateCcw,
  Layers,
  HelpCircle,
  Sparkles,
  Crop,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import './index.css';
import {
  Product,
  Article,
  categoryList,
  generateProducts,
  sampleArticles,
  iranLocations,
  satinImage,
  jewelryImage,
  necklaceImage,
  watchImage
} from './data';

const money = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

// --- PERSISTENCE HELPERS ---
const STORAGE_KEYS = {
  PRODUCTS_NEW: 'auravibe_products_new',
  PRODUCTS_BEST: 'auravibe_products_best',
  PRODUCTS_SPECIAL: 'auravibe_products_special',
  PRODUCTS_WATCHES: 'auravibe_products_watches',
  BANNERS: 'auravibe_banners',
  ORDERS: 'auravibe_orders',
  USERS: 'auravibe_users',
  TICKETS: 'auravibe_tickets',
  AUDIT_LOGS: 'auravibe_audit_logs',
  SETTINGS: 'auravibe_settings',
  REDIRECTS: 'auravibe_redirects'
};

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

// --- TYPES & MODELS ---
export type ExtendedProduct = Product & {
  code: string;
  gallery?: string[];
  stock: number;
  updatedAt?: string;
  isNewest?: boolean;
  isBestSeller?: boolean;
  isSpecialOffer?: boolean;
  isWatch?: boolean;
};

export type BannerItem = {
  id: number;
  internalName: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  isActive: boolean;
  displayOrder: number;
};

export type OrderStatus =
  | 'جدید'
  | 'در حال بررسی'
  | 'تأیید شده'
  | 'در حال آماده‌سازی'
  | 'آماده ارسال'
  | 'تحویل به پیک/پست'
  | 'ارسال شده'
  | 'تحویل داده شده'
  | 'لغو شده'
  | 'مرجوع شده'
  | 'مشکل در ارسال';

export type OrderTimelineEvent = {
  status: OrderStatus;
  date: string;
  time: string;
  note?: string;
};

export type OrderItemSnapshot = {
  productId: number;
  productCode: string;
  name: string;
  priceAtPurchase: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string; // Order Number ORD-XXXX
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  district: string;
  neighborhood: string;
  price: number;
  shippingCost: number;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  shippingMethod: string;
  paymentStatus: 'پرداخت شده' | 'در انتظار پرداخت' | 'ناموفق';
  trackingCode?: string;
  timeline: OrderTimelineEvent[];
};

export type UserAccount = {
  id: string;
  name: string;
  username: string;
  phone: string;
  email?: string;
  avatar: string | null;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'PRODUCT_MANAGER' | 'ORDER_MANAGER' | 'CUSTOMER';
  status: 'active' | 'blocked';
  blockReason?: string;
  registrationDate: string;
  lastLogin: string;
  orderCount: number;
  city: string;
  district: string;
  neighborhood: string;
  addressDetail: string;
  postalCode: string;
};

export type Ticket = {
  id: string;
  userId: string;
  customerName: string;
  subject: string;
  category: 'سفارش' | 'پرداخت' | 'ارسال' | 'محصول' | 'سایر';
  priority: 'پایین' | 'معمولی' | 'بالا' | 'فوری';
  status: 'باز' | 'در حال بررسی' | 'منتظر پاسخ کاربر' | 'حل شده' | 'بسته شده';
  createdAt: string;
  messages: { id: string; sender: 'user' | 'admin'; text: string; date: string }[];
  internalNotes?: string[];
};

export type AuditLog = {
  id: string;
  adminName: string;
  action: string;
  module: 'Products' | 'Orders' | 'Banners' | 'Users' | 'SEO' | 'Settings' | 'Security';
  target: string;
  date: string;
  time: string;
  ip: string;
  details: string;
};

// Initial Dataset Generator
const initialExtProducts = (count: number, prefix: string, cat: string, price: number, isDiscounted = false): ExtendedProduct[] => {
  return generateProducts(count, prefix, cat, price, isDiscounted).map((p, idx) => ({
    ...p,
    code: `PR-${cat === 'ساعت' ? 'W' : cat === 'گردنبند' ? 'N' : 'A'}${1000 + idx}`,
    gallery: [p.image, jewelryImage, satinImage],
    stock: 15 + idx * 3,
    updatedAt: '۱۴۰۴/۰۱/۲۰',
    isNewest: cat === 'جدیدترین‌ها' || idx % 2 === 0,
    isBestSeller: cat === 'پرفروش‌ترین‌ها' || idx % 3 === 0,
    isSpecialOffer: isDiscounted,
    isWatch: cat === 'ساعت'
  }));
};

function App() {
  const [intro, setIntro] = useState(true);
  const [followModal, setFollowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [cart, setCart] = useState<ExtendedProduct[]>([]);
  const [wishlist, setWishlist] = useState<ExtendedProduct[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountView, setAccountView] = useState<{ tab: 'profile' | 'cart' | 'fav' | 'orders' | 'tickets' } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Active View State: 'admin' | 'home' | category name | 'journal'
  const [activeView, setActiveView] = useState<string>('home');

  // Persistence State
  const [productsNewest, setProductsNewest] = useState<ExtendedProduct[]>(() =>
    getStored(STORAGE_KEYS.PRODUCTS_NEW, initialExtProducts(10, 'محصول تازه', 'جدیدترین‌ها', 150000))
  );
  const [productsBestSellers, setProductsBestSellers] = useState<ExtendedProduct[]>(() =>
    getStored(STORAGE_KEYS.PRODUCTS_BEST, initialExtProducts(10, 'پرفروش آورا', 'پرفروش‌ترین‌ها', 210000))
  );
  const [productsSpecial, setProductsSpecial] = useState<ExtendedProduct[]>(() =>
    getStored(STORAGE_KEYS.PRODUCTS_SPECIAL, initialExtProducts(10, 'آیتم ویژه', 'تخفیف ویژه', 170000, true))
  );
  const [productsWatches, setProductsWatches] = useState<ExtendedProduct[]>(() =>
    getStored(STORAGE_KEYS.PRODUCTS_WATCHES, initialExtProducts(10, 'ساعت زنانه آورا', 'ساعت', 390000, true))
  );

  const [banners, setBanners] = useState<BannerItem[]>(() =>
    getStored(STORAGE_KEYS.BANNERS, [
      { id: 1, internalName: 'کمپین دست‌ساز زمستانه', eyebrow: 'دست‌ساز، برای تو', title: 'لطافتِ کوچکِ هر روز', subtitle: 'اکسسوری‌هایی که با رنگ و جزئیاتشان، حال خوب می‌سازند.', image: satinImage, isActive: true, displayOrder: 1 },
      { id: 2, internalName: 'مجموعه مروارید جدید', eyebrow: 'NEW DROP', title: 'درخشش آرام مروارید', subtitle: 'مجموعه‌ای ظریف برای قرارهای خاطره‌انگیز تو.', image: jewelryImage, isActive: true, displayOrder: 2 },
      { id: 3, internalName: 'کالکشن آورا ادیت', eyebrow: 'AURAVIBE EDIT', title: 'یاسی، شیری، رویایی', subtitle: 'جزئیات کوچک، امضای استایل شخصی تو هستند.', image: satinImage, isActive: true, displayOrder: 3 }
    ])
  );

  const [orders, setOrders] = useState<Order[]>(() =>
    getStored(STORAGE_KEYS.ORDERS, [
      {
        id: 'ORD-9821',
        date: '۱۴۰۴/۰۱/۱۵',
        time: '۱۴:۳۰',
        customerName: 'آرتین کریمی',
        customerPhone: '۰۹۱۲۳۴۵۶۷۸۹',
        shippingAddress: 'تهران، نیاوران، خیابان اصلی، پلاک ۱۵',
        city: 'تهران',
        district: 'منطقه ۱ (شمرانات)',
        neighborhood: 'نیاوران',
        price: 434000,
        shippingCost: 0,
        status: 'تحویل داده شده',
        paymentStatus: 'پرداخت شده',
        shippingMethod: 'پست پیشتاز (سراسر کشور)',
        trackingCode: '1098234871112',
        items: [
          { productId: 101, productCode: 'PR-N1001', name: 'گردنبند مروارید آورا', priceAtPurchase: 224000, quantity: 1, image: necklaceImage },
          { productId: 102, productCode: 'PR-A1002', name: 'گوشواره استیل نگین‌دار', priceAtPurchase: 210000, quantity: 1, image: jewelryImage }
        ],
        timeline: [
          { status: 'جدید', date: '۱۴۰۴/۰۱/۱۵', time: '۱۴:۳۰', note: 'سفارش ثبت شد' },
          { status: 'تحویل داده شده', date: '۱۴۰۴/۰۱/۱۸', time: '۱۱:۴۵', note: 'تحویل مشتری گردید' }
        ]
      }
    ])
  );

  const [usersList, setUsersList] = useState<UserAccount[]>(() =>
    getStored(STORAGE_KEYS.USERS, [
      {
        id: 'USR-101',
        name: 'آرتین کریمی (SUPER_ADMIN)',
        username: 'artin_aura',
        phone: '۰۹۱۲۳۴۵۶۷۸۹',
        email: 'artin@auravibe.ir',
        avatar: null,
        role: 'SUPER_ADMIN',
        status: 'active',
        registrationDate: '۱۴۰۳/۰۱/۰۱',
        lastLogin: 'امروز ۱۴:۵۰',
        orderCount: 5,
        city: 'تهران',
        district: 'منطقه ۱ (شمرانات)',
        neighborhood: 'نیاوران',
        addressDetail: 'خیابان اصلی، کوچه دوم، پلاک ۱۵، واحد ۴',
        postalCode: '۱۹۶۸۷۱۲۳۴۵'
      }
    ])
  );

  const [tickets, setTickets] = useState<Ticket[]>(() =>
    getStored(STORAGE_KEYS.TICKETS, [
      {
        id: 'TCK-401',
        userId: 'USR-101',
        customerName: 'آرتین کریمی',
        subject: 'پیگیری ارسال سفارش ORD-9821',
        category: 'ارسال',
        priority: 'بالا',
        status: 'در حال بررسی',
        createdAt: '۱۴۰۴/۰۱/۲۰',
        messages: [
          { id: '1', sender: 'user', text: 'سلام، کد رهگیری پستی من چنده؟', date: '۱۰:۰۰' },
          { id: '2', sender: 'admin', text: 'سلام جناب کریمی، کد ۱۰۹۸۲۳۴۸۷۱۱۱۲ ارسال گردید.', date: '۱۰:۳۰' }
        ]
      }
    ])
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    getStored(STORAGE_KEYS.AUDIT_LOGS, [
      { id: '1', adminName: 'آرتین کریمی (SUPER_ADMIN)', action: 'ویرایش قیمت کالا', module: 'Products', target: 'ساعت زنانه آورا', date: '۱۴۰۴/۰۱/۲۰', time: '۱۴:۱۰', ip: '127.0.0.1', details: 'قیمت به ۳۹۰,۰۰۰ تومان تغییر یافت' }
    ])
  );

  const [siteSettings, setSiteSettings] = useState(() =>
    getStored(STORAGE_KEYS.SETTINGS, {
      siteName: 'AuraVibe | آورا وایب',
      contactPhone: '۰۲۱-۸۸۸۸۹۹۹۹',
      contactEmail: 'hello@auravibe.ir',
      address: 'تهران، خیابان ولیعصر، برج آورا، طبقه ۴',
      globalSeoDescription: 'فروشگاه تخصصی اکسسوری و زیورآلات ظریف با تم کرم وانیلی و بنفش آلیره.'
    })
  );

  // Sync state to LocalStorage
  useEffect(() => setStored(STORAGE_KEYS.PRODUCTS_NEW, productsNewest), [productsNewest]);
  useEffect(() => setStored(STORAGE_KEYS.PRODUCTS_BEST, productsBestSellers), [productsBestSellers]);
  useEffect(() => setStored(STORAGE_KEYS.PRODUCTS_SPECIAL, productsSpecial), [productsSpecial]);
  useEffect(() => setStored(STORAGE_KEYS.PRODUCTS_WATCHES, productsWatches), [productsWatches]);
  useEffect(() => setStored(STORAGE_KEYS.BANNERS, banners), [banners]);
  useEffect(() => setStored(STORAGE_KEYS.ORDERS, orders), [orders]);
  useEffect(() => setStored(STORAGE_KEYS.USERS, usersList), [usersList]);
  useEffect(() => setStored(STORAGE_KEYS.TICKETS, tickets), [tickets]);
  useEffect(() => setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs), [auditLogs]);
  useEffect(() => setStored(STORAGE_KEYS.SETTINGS, siteSettings), [siteSettings]);

  const currentUser = usersList[0];

  const addAuditLog = (action: string, module: AuditLog['module'], target: string, details: string) => {
    const newLog: AuditLog = {
      id: String(Date.now()),
      adminName: currentUser.name,
      action,
      module,
      target,
      date: new Date().toLocaleDateString('fa-IR'),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      ip: '127.0.0.1',
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const masterProducts = useMemo(() => {
    const map = new Map<number, ExtendedProduct>();
    [...productsNewest, ...productsBestSellers, ...productsSpecial, ...productsWatches].forEach((p) => {
      map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [productsNewest, productsBestSellers, productsSpecial, productsWatches]);

  const activeBanners = useMemo(() => {
    return banners.filter((b) => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [banners]);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % activeBanners.length), 4800);
    return () => window.clearTimeout(timer);
  }, [activeBanners.length]);

  const cartTotal = useMemo(() => cart.reduce((sum, product) => sum + product.price, 0), [cart]);

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="pb-nav min-h-screen overflow-x-hidden bg-[#fffaf0] text-[#37192C]">
      {intro && <Intro />}
      {followModal && <FollowModal close={() => setFollowModal(false)} />}

      {activeView === 'admin' ? (
        <AdminDashboard
          goHome={() => handleNavClick('home')}
          masterProducts={masterProducts}
          productsNewest={productsNewest}
          setProductsNewest={setProductsNewest}
          productsBestSellers={productsBestSellers}
          setProductsBestSellers={setProductsBestSellers}
          productsSpecial={productsSpecial}
          setProductsSpecial={setProductsSpecial}
          productsWatches={productsWatches}
          setProductsWatches={setProductsWatches}
          banners={banners}
          setBanners={setBanners}
          orders={orders}
          setOrders={setOrders}
          usersList={usersList}
          setUsersList={setUsersList}
          tickets={tickets}
          setTickets={setTickets}
          auditLogs={auditLogs}
          addAuditLog={addAuditLog}
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
          currentUser={currentUser}
        />
      ) : (
        <>
          {/* STOREFRONT HEADER */}
          <header className="sticky top-0 z-30 border-b border-[#37192c]/8 bg-[#fffaf0]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <button
                className="grid size-11 place-items-center rounded-full hover:bg-[#37192c]/7 md:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="منو"
              >
                <Menu size={21} />
              </button>

              <button onClick={() => handleNavClick('home')} className="brand-font text-2xl tracking-[.08em] sm:text-3xl text-[#37192C]">
                AuraVibe
              </button>

              <nav className="hidden items-center gap-6 text-xs font-bold md:flex">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="rounded-full bg-[#37192C] px-3.5 py-1.5 text-[#FFF3C5] hover:bg-[#5a2548] transition flex items-center gap-1.5 shadow-sm"
                >
                  <LayoutDashboard size={14} /> پیشخوان مدیریتی
                </button>
                <button onClick={() => handleNavClick('home')} className={'hover:text-[#8b627e] ' + (activeView === 'home' ? 'text-[#8b627e] underline' : '')}>
                  صفحه اصلی
                </button>
                <button onClick={() => handleNavClick('جدیدترین‌ها')} className="hover:text-[#8b627e]">
                  جدیدترین‌ها
                </button>
                <button onClick={() => handleNavClick('پرفروش‌ترین‌ها')} className="hover:text-[#8b627e]">
                  پرفروش‌ترین‌ها
                </button>
                <button onClick={() => handleNavClick('تخفیف ویژه')} className="hover:text-[#8b627e]">
                  تخفیف ویژه
                </button>
                <button onClick={() => handleNavClick('journal')} className="hover:text-[#8b627e]">
                  مجله استایل
                </button>
              </nav>

              <div className="flex items-center gap-1">
                <button
                  className="icon-button relative"
                  onClick={() => setAccountView({ tab: 'cart' })}
                  aria-label="سبد خرید"
                >
                  <ShoppingBag size={20} />
                  {cart.length > 0 && (
                    <span className="absolute -end-0 -top-0 grid size-5 place-items-center rounded-full bg-[#37192C] text-[10px] text-white font-bold">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* MAIN STOREFRONT VIEWS */}
          {activeView === 'home' ? (
            <>
              {/* Story Categories */}
              <section id="stories-section" className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="label">انتخاب کن، بدرخش</p>
                    <h1 className="mt-1 text-2xl font-black sm:text-3xl">دسته‌بندی‌های محبوب</h1>
                  </div>
                </div>
                <div id="stories" className="story-row mt-5">
                  {categoryList.map((cat) => (
                    <button key={cat.name} onClick={() => handleNavClick(cat.name)} className="group w-[105px] shrink-0 text-center">
                      <span className="story-ring">
                        <img src={cat.image} alt={cat.name} />
                      </span>
                      <span className="mt-2 block text-xs font-semibold leading-5 text-[#37192C]">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Banner Carousel */}
              {activeBanners.length > 0 && (
                <section className="relative mt-10 overflow-hidden">
                  <div className="banner-shell" style={{ transform: `translateX(-${(bannerIndex % activeBanners.length) * 100}%)` }}>
                    {activeBanners.map((banner) => (
                      <article className="relative w-full shrink-0 overflow-hidden" key={banner.id} title={banner.internalName}>
                        <img src={banner.image} alt={banner.title} className="absolute inset-0 size-full object-cover opacity-45" />
                        <div className="banner-overlay" />
                        <div className="relative mx-auto flex min-h-[520px] w-full max-w-7xl flex-col justify-end px-5 pb-16 sm:min-h-[620px] sm:px-8 lg:px-12">
                          <p className="label text-[#FFF3C5]">{banner.eyebrow}</p>
                          <h2 className="mt-3 max-w-lg text-4xl font-black leading-tight text-white sm:text-6xl">{banner.title}</h2>
                          <p className="mt-4 max-w-md text-base leading-8 text-white/85">{banner.subtitle}</p>
                          <button
                            onClick={() => handleNavClick('جدیدترین‌ها')}
                            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF3C5] px-5 py-3 text-sm font-bold text-[#37192C] transition hover:scale-105"
                          >
                            دیدن کالکشن <ArrowLeft size={17} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  <button onClick={() => setBannerIndex((bannerIndex + activeBanners.length - 1) % activeBanners.length)} className="carousel-arrow start-4" aria-label="بنر قبل">
                    <ChevronRight />
                  </button>
                  <button onClick={() => setBannerIndex((bannerIndex + 1) % activeBanners.length)} className="carousel-arrow end-4" aria-label="بنر بعد">
                    <ChevronLeft />
                  </button>
                </section>
              )}

              {/* Collections */}
              <div id="collection" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <ProductSection title="جدیدترین‌ها" intro="تازه‌ترین‌های آورا استایل" items={productsNewest} open={setSelectedProduct} onViewMore={() => handleNavClick('جدیدترین‌ها')} testid="new-products" />
                <ProductSection title="پرفروش‌ترین‌ها" intro="محبوب‌ترین انتخاب‌های کاربران" items={productsBestSellers} open={setSelectedProduct} onViewMore={() => handleNavClick('پرفروش‌ترین‌ها')} testid="best-sellers" />
                <ProductSection title="تخفیف ویژه" intro="پیشنهادهای استثنایی و محدود" items={productsSpecial} open={setSelectedProduct} onViewMore={() => handleNavClick('تخفیف ویژه')} testid="special-offers" />
                <ProductSection title="ساعت" intro="کالکشن ساعت‌های ظریف و خاص" items={productsWatches} open={setSelectedProduct} onViewMore={() => handleNavClick('ساعت')} testid="watches" />
              </div>

              <section className="mx-auto my-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"><SocialBanner /></section>
              <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"><FaqSection /></section>
              <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"><TrustSectionHorizontal /></section>
              <section id="journal" className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"><JournalSection articles={sampleArticles.slice(0, 4)} onViewMore={() => handleNavClick('journal')} /></section>
            </>
          ) : activeView === 'journal' ? (
            <JournalPageView articles={sampleArticles} openHome={() => handleNavClick('home')} />
          ) : (
            <CategoryPageView
              categoryName={activeView}
              products={
                activeView === 'جدیدترین‌ها' ? productsNewest :
                activeView === 'پرفروش‌ترین‌ها' ? productsBestSellers :
                activeView === 'تخفیف ویژه' ? productsSpecial :
                activeView === 'ساعت' ? productsWatches :
                masterProducts.filter((p) => p.category === activeView)
              }
              openProduct={setSelectedProduct}
              backToHome={() => handleNavClick('home')}
            />
          )}

          {/* FOOTER */}
          <footer className="mt-16 bg-[#FFF3C5] border-t border-[#37192c]/10 py-12 text-[#37192C]">
            <div className="mx-auto grid w-full max-w-7xl gap-9 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
              <div>
                <div className="brand-font text-3xl font-black">{siteSettings.siteName}</div>
                <p className="mt-4 text-xs leading-7 text-[#37192C]/80">{siteSettings.globalSeoDescription}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm">خرید و کالکشن‌ها</h3>
                <div className="mt-4 space-y-2.5 text-xs font-semibold">
                  <button onClick={() => handleNavClick('جدیدترین‌ها')} className="block hover:underline">جدیدترین‌ها</button>
                  <button onClick={() => handleNavClick('پرفروش‌ترین‌ها')} className="block hover:underline">پرفروش‌ترین‌ها</button>
                  <button onClick={() => handleNavClick('تخفیف ویژه')} className="block hover:underline">تخفیف ویژه</button>
                  <button onClick={() => handleNavClick('ساعت')} className="block hover:underline">ساعت</button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm">راهنما و مجله</h3>
                <div className="mt-4 space-y-2.5 text-xs font-semibold">
                  <button onClick={() => handleNavClick('journal')} className="block hover:underline">مجله استایل آورا</button>
                  <button onClick={() => setSupportOpen(true)} className="block hover:underline">پشتیبانی آنلاین</button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-base">ارتباط با ما</h3>
                <p className="mt-4 text-xs font-semibold">تلفن: {siteSettings.contactPhone}</p>
                <p className="mt-2 text-xs font-semibold">ایمیل: {siteSettings.contactEmail}</p>
                <p className="mt-2 text-xs text-[#37192C]/70">{siteSettings.address}</p>
              </div>
            </div>
          </footer>

          <button className="support-button" onClick={() => setSupportOpen(true)} aria-label="پشتیبانی">
            <Headphones size={22} />
          </button>

          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              close={() => setSelectedProduct(null)}
              add={(p) => setCart((c) => [...c, p])}
              toggleWish={(p) => setWishlist((w) => (w.some((x) => x.id === p.id) ? w.filter((x) => x.id !== p.id) : [...w, p]))}
              isWished={wishlist.some((w) => w.id === selectedProduct.id)}
              allProducts={masterProducts}
              openProduct={setSelectedProduct}
              openZoom={(img) => setZoomedImage(img)}
            />
          )}

          {zoomedImage && (
            <div className="modal-backdrop p-3 z-50" onClick={() => setZoomedImage(null)}>
              <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black p-2">
                <button onClick={() => setZoomedImage(null)} className="absolute end-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white text-black">
                  <X size={20} />
                </button>
                <img src={zoomedImage} alt="Large Zoom" className="max-h-[85vh] w-full object-contain" />
              </div>
            </div>
          )}

          {menuOpen && (
            <SectionMenu
              sections={[
                { id: 'admin', label: '⚡ پیشخوان مدیریتی (Admin Panel)' },
                { id: 'home', label: 'صفحه اصلی سایت' },
                ...categoryList.slice(0, 6).map((c) => ({ id: c.name, label: c.name })),
                { id: 'جدیدترین‌ها', label: 'تازه رسیده‌ها' },
                { id: 'پرفروش‌ترین‌ها', label: 'پرطرفدارها' },
                { id: 'تخفیف ویژه', label: 'فرصت‌های خوش‌رنگ' },
                { id: 'ساعت', label: 'کالکشن ساعت' },
                { id: 'journal', label: 'مجله استایل' }
              ]}
              close={() => setMenuOpen(false)}
              go={handleNavClick}
            />
          )}

          {accountView && (
            <AccountView
              tab={accountView.tab}
              setTab={(tab) => setAccountView({ tab })}
              close={() => setAccountView(null)}
              cart={cart}
              setCart={setCart}
              total={cartTotal}
              wishlist={wishlist}
              user={currentUser}
              setUser={(u: any) => setUsersList((prev: any) => [u, ...prev.slice(1)])}
              orders={orders}
              tickets={tickets}
              openProduct={setSelectedProduct}
            />
          )}

          {supportOpen && <SupportModal close={() => setSupportOpen(false)} />}

          <nav className="bottom-nav" dir="ltr">
            <button className="bottom-nav-item" onClick={() => handleNavClick('home')}>
              <Home size={22} />
            </button>
            <button className="bottom-nav-item" onClick={() => handleNavClick('admin')}>
              <LayoutDashboard size={22} />
            </button>
            <button className="bottom-nav-item" onClick={() => setAccountView({ tab: 'profile' })}>
              <UserRound size={22} />
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

// ----------------------------------------------------------------------
// FULL ADMIN DASHBOARD MODULE
// ----------------------------------------------------------------------
function AdminDashboard({
  goHome,
  masterProducts,
  productsNewest,
  setProductsNewest,
  productsBestSellers,
  setProductsBestSellers,
  productsSpecial,
  setProductsSpecial,
  productsWatches,
  setProductsWatches,
  banners,
  setBanners,
  orders,
  setOrders,
  usersList,
  setUsersList,
  tickets,
  setTickets,
  auditLogs,
  addAuditLog,
  siteSettings,
  setSiteSettings,
  currentUser
}: any) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'banners' | 'orders' | 'users' | 'support' | 'analytics' | 'seo' | 'settings' | 'audit'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Status Badge Colors
  const statusColors: Record<OrderStatus, string> = {
    'جدید': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'در حال بررسی': 'bg-blue-100 text-blue-800 border-blue-300',
    'تأیید شده': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    'در حال آماده‌سازی': 'bg-purple-100 text-purple-800 border-purple-300',
    'آماده ارسال': 'bg-violet-100 text-purple-800 border-violet-300',
    'تحویل به پیک/پست': 'bg-amber-100 text-amber-800 border-amber-300',
    'ارسال شده': 'bg-orange-100 text-orange-800 border-orange-300',
    'تحویل داده شده': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'لغو شده': 'bg-rose-100 text-rose-800 border-rose-300',
    'مرجوع شده': 'bg-gray-200 text-gray-800 border-gray-400',
    'مشکل در ارسال': 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  // Product Add/Edit Modal
  const [productModal, setProductModal] = useState<{ open: boolean; product: ExtendedProduct | null }>({ open: false, product: null });
  const [pName, setPName] = useState('');
  const [pCode, setPCode] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pOldPrice, setPOldPrice] = useState('');
  const [pStock, setPStock] = useState('15');
  const [pCategory, setPCategory] = useState('گردنبند');
  const [pDescription, setPDescription] = useState('');
  const [pGallery, setPGallery] = useState<string[]>([]);
  const [isNewestTag, setIsNewestTag] = useState(true);
  const [isBestSellerTag, setIsBestSellerTag] = useState(false);
  const [isSpecialOfferTag, setIsSpecialOfferTag] = useState(false);
  const [isWatchTag, setIsWatchTag] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Crop Modal State
  const [cropModal, setCropModal] = useState<{ open: boolean; image: string; target: 'product' | 'banner' }>({ open: false, image: '', target: 'product' });

  // Banner Modal
  const [bannerModal, setBannerModal] = useState(false);
  const [bInternalName, setBInternalName] = useState('');
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bEyebrow, setBEyebrow] = useState('NEW DROP');
  const [bImage, setBImage] = useState(satinImage);

  // User Add Modal
  const [userModal, setUserModal] = useState(false);
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uRole, setURole] = useState<UserAccount['role']>('CUSTOMER');

  // Open Product Form
  const openProductForm = (prod: ExtendedProduct | null = null) => {
    setCodeError('');
    if (prod) {
      setPName(prod.name);
      setPCode(prod.code);
      setPPrice(String(prod.price));
      setPOldPrice(prod.oldPrice ? String(prod.oldPrice) : '');
      setPStock(String(prod.stock || 10));
      setPCategory(prod.category);
      setPDescription(prod.description);
      setPGallery(prod.gallery || [prod.image]);
      setIsNewestTag(productsNewest.some((p: any) => p.id === prod.id));
      setIsBestSellerTag(productsBestSellers.some((p: any) => p.id === prod.id));
      setIsSpecialOfferTag(productsSpecial.some((p: any) => p.id === prod.id));
      setIsWatchTag(productsWatches.some((p: any) => p.id === prod.id));
      setProductModal({ open: true, product: prod });
    } else {
      setPName('');
      setPCode(`PR-${Math.floor(1000 + Math.random() * 8999)}`);
      setPPrice('');
      setPOldPrice('');
      setPStock('20');
      setPCategory('گردنبند');
      setPDescription('محصول دست‌ساز لوکس آورا استایل با متریال ضدحساسیت.');
      setPGallery([satinImage, jewelryImage]);
      setIsNewestTag(true);
      setIsBestSellerTag(false);
      setIsSpecialOfferTag(false);
      setIsWatchTag(false);
      setProductModal({ open: true, product: null });
    }
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pCode) return;

    const duplicate = masterProducts.find((p: ExtendedProduct) => p.code === pCode && p.id !== productModal.product?.id);
    if (duplicate) {
      setCodeError('این کد محصول تکراری است. کد کالا باید منحصربه‌فرد باشد.');
      return;
    }

    const numPrice = Number(pPrice);
    const numOldPrice = pOldPrice ? Number(pOldPrice) : undefined;

    const newProd: ExtendedProduct = {
      id: productModal.product ? productModal.product.id : Math.floor(100000 + Math.random() * 899999),
      code: pCode,
      name: pName,
      category: pCategory,
      price: numPrice,
      oldPrice: numOldPrice,
      stock: Number(pStock),
      image: pGallery[0] || satinImage,
      gallery: pGallery,
      badge: isSpecialOfferTag ? 'تخفیف ویژه' : (isNewestTag ? 'جدید' : undefined),
      colors: ['#37192C', '#FFF3C5'],
      description: pDescription,
      updatedAt: new Date().toLocaleDateString('fa-IR')
    };

    const updateList = (listSetter: any) => listSetter((prev: ExtendedProduct[]) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
    const removeFromList = (listSetter: any) => listSetter((prev: ExtendedProduct[]) => prev.filter((p) => p.id !== newProd.id));

    if (isNewestTag) updateList(setProductsNewest); else removeFromList(setProductsNewest);
    if (isBestSellerTag) updateList(setProductsBestSellers); else removeFromList(setProductsBestSellers);
    if (isSpecialOfferTag) updateList(setProductsSpecial); else removeFromList(setProductsSpecial);
    if (isWatchTag || pCategory === 'ساعت') updateList(setProductsWatches); else removeFromList(setProductsWatches);

    addAuditLog(productModal.product ? 'ویرایش کالا' : 'افزودن کالا', 'Products', newProd.name, `کد: ${newProd.code}`);
    setProductModal({ open: false, product: null });
  };

  const handleDeleteProduct = (id: number, name: string) => {
    if (confirm(`آیا از حذف دائم کالا "${name}" اطمینان دارید؟`)) {
      setProductsNewest((p: any) => p.filter((x: any) => x.id !== id));
      setProductsBestSellers((p: any) => p.filter((x: any) => x.id !== id));
      setProductsSpecial((p: any) => p.filter((x: any) => x.id !== id));
      setProductsWatches((p: any) => p.filter((x: any) => x.id !== id));
      addAuditLog('حذف کالا', 'Products', name, 'حذف دائم از دیتابیس');
    }
  };

  // Banners
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bInternalName) return;

    const newB: BannerItem = {
      id: Date.now(),
      internalName: bInternalName,
      eyebrow: bEyebrow,
      title: bTitle,
      subtitle: bSubtitle,
      image: bImage,
      isActive: true,
      displayOrder: banners.length + 1
    };

    setBanners((prev: any) => [newB, ...prev]);
    addAuditLog('افزودن بنر', 'Banners', bInternalName, 'بنر جدید ثبت گردید');
    setBannerModal(false);
  };

  // Save New User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName || !uPhone) return;

    const newUser: UserAccount = {
      id: `USR-${Math.floor(100 + Math.random() * 899)}`,
      name: uName,
      username: `user_${Math.floor(100 + Math.random() * 899)}`,
      phone: uPhone,
      avatar: null,
      role: uRole,
      status: 'active',
      registrationDate: new Date().toLocaleDateString('fa-IR'),
      lastLogin: 'هم‌اکنون',
      orderCount: 0,
      city: 'تهران',
      district: 'منطقه ۱',
      neighborhood: 'نیاوران',
      addressDetail: 'ثبت دستی توسط ادمین',
      postalCode: '۱۹۶۸۷۱۲۳۴۵'
    };

    setUsersList((prev: any) => [newUser, ...prev]);
    addAuditLog('افزودن کاربر', 'Users', uName, `نقش: ${uRole}`);
    setUserModal(false);
  };

  const toggleBlockUser = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setUsersList((prev: UserAccount[]) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    addAuditLog('تغییر وضعیت مسدودی کاربر', 'Users', userId, `وضعیت: ${nextStatus}`);
  };

  // Update Order Status
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev: Order[]) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newEvent: OrderTimelineEvent = {
            status: newStatus,
            date: new Date().toLocaleDateString('fa-IR'),
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            note: `تغییر به ${newStatus}`
          };
          return {
            ...o,
            status: newStatus,
            timeline: [...o.timeline, newEvent]
          };
        }
        return o;
      })
    );
    addAuditLog('تغییر وضعیت سفارش', 'Orders', orderId, `وضعیت به ${newStatus} تغییر یافت`);
  };

  return (
    <div className="flex min-h-screen bg-[#fffaf0] text-[#37192C]">
      {/* SIDEBAR */}
      <aside className={'sticky top-0 h-screen transition-all duration-300 border-e border-[#37192c]/10 bg-white flex flex-col justify-between shadow-sm z-20 ' + (sidebarCollapsed ? 'w-20' : 'w-64')}>
        <div>
          <div className="flex items-center justify-between p-4 border-b border-[#37192c]/10">
            {!sidebarCollapsed && (
              <div>
                <div className="brand-font text-xl font-black text-[#37192C]">AuraVibe</div>
                <span className="text-[10px] font-bold text-[#8b627e]">پیشخوان مدیریتی ۳۶۰</span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="grid size-8 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]">
              <Menu size={18} />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'داشبورد اصلی', icon: <LayoutDashboard size={18} /> },
              { id: 'products', label: 'مدیریت محصولات', icon: <Box size={18} /> },
              { id: 'banners', label: 'بنرهای اسلایدر', icon: <ImageIcon size={18} /> },
              { id: 'orders', label: 'سفارشات و Timeline', icon: <ShoppingBag size={18} /> },
              { id: 'users', label: 'کاربران و نقش‌ها (RBAC)', icon: <Users size={18} /> },
              { id: 'support', label: 'تیکت‌های پشتیبانی', icon: <MessageSquare size={18} /> },
              { id: 'analytics', label: 'تحلیل فروش و تصمیم‌گیری', icon: <BarChart3 size={18} /> },
              { id: 'seo', label: 'تنظیمات سئو و مجله', icon: <Globe size={18} /> },
              { id: 'settings', label: 'تنظیمات عمومی سایت', icon: <Settings size={18} /> },
              { id: 'audit', label: 'سوابق امنیتی (Audit)', icon: <Activity size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ' + (activeTab === item.id ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fff3c5]/50')}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 border-t border-[#37192c]/10">
          <button onClick={goHome} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF3C5] py-2.5 text-xs font-black text-[#37192C]">
            <ArrowLeft size={16} />
            {!sidebarCollapsed && <span>بازگشت به فروشگاه</span>}
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#37192C]">
              {activeTab === 'dashboard' && 'داشبورد کنترل مرکزی'}
              {activeTab === 'products' && 'مدیریت محصولات و کدهای کالا'}
              {activeTab === 'banners' && 'مدیریت بنرهای اسلایدر'}
              {activeTab === 'orders' && 'مدیریت سفارشات خریداران'}
              {activeTab === 'users' && 'مدیریت کاربران و دسترسی‌ها'}
              {activeTab === 'support' && 'تیکت‌ها و پیام‌های پشتیبانی'}
              {activeTab === 'analytics' && 'تحلیل فروش و عملکرد'}
              {activeTab === 'seo' && 'تنظیمات سئو مرکزی'}
              {activeTab === 'settings' && 'تنظیمات کلی فروشگاه'}
              {activeTab === 'audit' && 'سوابق امنیتی (Audit Logs)'}
            </h1>
          </div>
          <span className="rounded-full bg-[#FFF3C5] px-4 py-1.5 text-xs font-bold text-[#37192C]">
            نقش: {currentUser.role}
          </span>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <span className="text-xs font-bold text-gray-500">فروش کل</span>
                <h3 className="mt-2 text-2xl font-black text-[#37192C]">۱۲,۴۵۰,۰۰۰ تومان</h3>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <span className="text-xs font-bold text-gray-500">سفارشات جدید</span>
                <h3 className="mt-2 text-2xl font-black text-[#37192C]">{orders.length}</h3>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <span className="text-xs font-bold text-gray-500">کالاهای فعال</span>
                <h3 className="mt-2 text-2xl font-black text-[#37192C]">{masterProducts.length}</h3>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <span className="text-xs font-bold text-gray-500">بنرهای فعال</span>
                <h3 className="mt-2 text-2xl font-black text-[#37192C]">{banners.length}</h3>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black mb-4">۵ سفارش اخیر خریداران</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((o: Order) => (
                  <div key={o.id} className="flex justify-between items-center rounded-xl bg-[#fffaf0] p-3 text-xs border">
                    <div>
                      <span className="font-mono font-bold text-[#37192C]">{o.id}</span>
                      <span className="ms-2 font-bold">{o.customerName}</span>
                    </div>
                    <span className="font-black">{money(o.price)} تومان</span>
                    <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold border ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
              <span className="text-xs font-bold">کل کالاها: {masterProducts.length}</span>
              <button onClick={() => openProductForm(null)} className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5]">
                <Plus size={16} /> افزودن محصول جدید
              </button>
            </div>

            <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#fffaf0] border-b font-black">
                  <tr>
                    <th className="p-4">کد کالا</th>
                    <th className="p-4">نام محصول</th>
                    <th className="p-4">دسته‌بندی</th>
                    <th className="p-4">قیمت اصلی</th>
                    <th className="p-4">موجودی</th>
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {masterProducts.map((p: ExtendedProduct) => (
                    <tr key={p.id}>
                      <td className="p-4 font-mono font-bold">{p.code}</td>
                      <td className="p-4 font-bold">{p.name}</td>
                      <td className="p-4 text-[#8b627e]">{p.category}</td>
                      <td className="p-4 font-black">{money(p.price)} تومان</td>
                      <td className="p-4 font-bold">{p.stock} عدد</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openProductForm(p)} className="p-2 rounded-lg bg-[#FFF3C5]"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-2 rounded-lg bg-rose-100 text-rose-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BANNERS */}
        {activeTab === 'banners' && (
          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
              <span className="text-xs font-bold">بنرهای اسلایدر صفحه اصلی</span>
              <button onClick={() => setBannerModal(true)} className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5]">
                <Plus size={16} /> افزودن بنر جدید
              </button>
            </div>

            <div className="space-y-3">
              {banners.map((b: BannerItem) => (
                <div key={b.id} className="flex justify-between items-center rounded-2xl bg-white p-4 border">
                  <div className="flex items-center gap-4">
                    <img src={b.image} alt={b.title} className="h-16 w-28 rounded-xl object-cover" />
                    <div>
                      <span className="text-[10px] text-gray-500">نام داخلی: {b.internalName}</span>
                      <h4 className="font-black text-sm">{b.title}</h4>
                    </div>
                  </div>
                  <button onClick={() => setBanners((prev: any) => prev.filter((x: any) => x.id !== b.id))} className="p-2 rounded-lg bg-rose-100 text-rose-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-6">
            <h3 className="text-sm font-black">مدیریت وضعیت سفارشات</h3>
            <div className="space-y-4">
              {orders.map((o: Order) => (
                <div key={o.id} className="rounded-2xl border bg-white p-5 space-y-3">
                  <div className="flex justify-between items-center border-b pb-3 text-xs">
                    <span className="font-mono font-bold text-sm">{o.id} ({o.customerName})</span>
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-xl border px-3 py-1.5 font-bold"
                    >
                      {['جدید', 'در حال بررسی', 'تأیید شده', 'در حال آماده‌سازی', 'آماده ارسال', 'تحویل به پیک/پست', 'ارسال شده', 'تحویل داده شده', 'لغو شده'].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs font-bold text-gray-600">مبلغ: {money(o.price)} تومان | آدرس: {o.shippingAddress}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: USERS & RBAC */}
        {activeTab === 'users' && (
          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
              <span className="text-xs font-bold">مدیریت کاربران و دسترسی‌ها (SUPER_ADMIN)</span>
              <button onClick={() => setUserModal(true)} className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5]">
                <Plus size={16} /> افزودن کاربر جدید
              </button>
            </div>

            <div className="space-y-3">
              {usersList.map((u: UserAccount) => (
                <div key={u.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border text-xs">
                  <div>
                    <strong className="text-sm">{u.name}</strong>
                    <span className="ms-2 text-gray-500">({u.phone})</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">نقش: {u.role} | ثبت نام: {u.registrationDate}</p>
                  </div>
                  <button
                    onClick={() => toggleBlockUser(u.id, u.status)}
                    className={`rounded-full px-4 py-1.5 font-bold ${u.status === 'active' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}
                  >
                    {u.status === 'active' ? 'مسدودسازی' : 'رفع مسدودی'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="mt-6 space-y-6">
            <h3 className="text-sm font-black">مدیریت تیکت‌های پشتیبانی مشتریان</h3>
            <div className="space-y-3">
              {tickets.map((t: Ticket) => (
                <div key={t.id} className="rounded-2xl border bg-white p-5 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{t.id} - {t.subject} ({t.customerName})</span>
                    <span className="rounded-full bg-indigo-100 text-indigo-800 px-3 py-0.5">{t.status}</span>
                  </div>
                  <div className="bg-[#fffaf0] p-3 rounded-xl border space-y-2 mt-2">
                    {t.messages.map((m) => (
                      <div key={m.id} className={`p-2 rounded-lg ${m.sender === 'admin' ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-white border'}`}>
                        <strong>{m.sender === 'admin' ? 'پاسخ پشتیبان:' : 'خریدار:'}</strong> {m.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="mt-6 space-y-6">
            <h3 className="text-sm font-black">تحلیل فروش و تصمیم‌گیری تجاری</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border text-xs">
                <span className="text-gray-500">میانگین سفارشات</span>
                <h4 className="text-xl font-black mt-2">۲85,۰۰۰ تومان</h4>
              </div>
              <div className="bg-white p-5 rounded-2xl border text-xs">
                <span className="text-gray-500">مشتریان بازگشتی</span>
                <h4 className="text-xl font-black mt-2">۶۸٪</h4>
              </div>
              <div className="bg-white p-5 rounded-2xl border text-xs">
                <span className="text-gray-500">پرفروش‌ترین دسته</span>
                <h4 className="text-xl font-black mt-2">گردنبند و ساعت</h4>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SEO */}
        {activeTab === 'seo' && (
          <div className="mt-6 space-y-6">
            <h3 className="text-sm font-black">تنظیمات سئو مرکزی (SEO Center)</h3>
            <div className="bg-white p-6 rounded-2xl border space-y-4 text-xs">
              <div>
                <label className="font-bold">توضیحات سئو متای اصلی سایت</label>
                <textarea
                  rows={2}
                  value={siteSettings.globalSeoDescription}
                  onChange={(e) => setSiteSettings({ ...siteSettings, globalSeoDescription: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-3 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="mt-6 space-y-6">
            <h3 className="text-sm font-black">تنظیمات عمومی و ارتباطی فروشگاه</h3>
            <div className="bg-white p-6 rounded-2xl border space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold">عنوان وب‌سایت</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    className="mt-1 w-full rounded-xl border p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold">تلفن پشتیبانی</label>
                  <input
                    type="text"
                    value={siteSettings.contactPhone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                    className="mt-1 w-full rounded-xl border p-2.5 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-black">سوابق امنیتی و تغییرات ادمین (Audit Logs)</h3>
            <div className="rounded-2xl border bg-white p-4 space-y-2">
              {auditLogs.map((log: AuditLog) => (
                <div key={log.id} className="flex justify-between items-center rounded-xl bg-[#fffaf0] p-3 text-xs border">
                  <div>
                    <strong className="text-[#37192C]">{log.adminName}</strong>
                    <span className="ms-2 font-bold">[{log.module}] {log.action}: {log.target}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{log.date} {log.time} ({log.details})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT FORM MODAL */}
      {productModal.open && (
        <div className="modal-backdrop p-3 z-40">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setProductModal({ open: false, product: null })} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
              <X size={16} />
            </button>

            <h3 className="text-base font-black border-b pb-3">
              {productModal.product ? 'ویرایش کالا' : 'افزودن محصول جدید'}
            </h3>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold">کد یکتای محصول (Unique Code)</label>
                <input
                  type="text"
                  required
                  value={pCode}
                  onChange={(e) => { setPCode(e.target.value); setCodeError(''); }}
                  className="mt-1 w-full rounded-xl border p-2 font-mono font-bold outline-none"
                />
                {codeError && <p className="mt-1 text-xs font-bold text-rose-600">{codeError}</p>}
              </div>

              <div>
                <label className="font-bold">نام محصول</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold">قیمت اصلی</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border p-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold">قیمت با تخفیف</label>
                  <input
                    type="number"
                    value={pOldPrice}
                    onChange={(e) => setPOldPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border p-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold">موجودی انبار</label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="mt-1 w-full rounded-xl border p-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold">دسته‌بندی اصلی</label>
                <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="mt-1 w-full rounded-xl border p-2 outline-none">
                  {categoryList.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="ساعت">ساعت</option>
                </select>
              </div>

              <div className="rounded-xl bg-[#fffaf0] p-3 border space-y-2">
                <p className="font-bold">نمایش در سکشن‌های مختلف:</p>
                <label className="flex items-center gap-2"><input type="checkbox" checked={isNewestTag} onChange={(e) => setIsNewestTag(e.target.checked)} /> سکشن «جدیدترین‌ها»</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={isBestSellerTag} onChange={(e) => setIsBestSellerTag(e.target.checked)} /> سکشن «پرفروش‌ترین‌ها»</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={isSpecialOfferTag} onChange={(e) => setIsSpecialOfferTag(e.target.checked)} /> سکشن «تخفیف ویژه»</label>
              </div>

              <button type="submit" className="w-full rounded-full bg-[#37192C] py-3 font-bold text-[#FFF3C5]">
                ذخیره کامل اطلاعات کالا
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BANNER FORM MODAL */}
      {bannerModal && (
        <div className="modal-backdrop p-3 z-40">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl relative">
            <button onClick={() => setBannerModal(false)} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5]">
              <X size={16} />
            </button>
            <h3 className="text-base font-black border-b pb-3">افزودن بنر جدید به اسلایدر</h3>
            <form onSubmit={handleSaveBanner} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold">نام داخلی بنر (Tooltip ادمین)</label>
                <input type="text" required placeholder="مثال: Winter Campaign" value={bInternalName} onChange={(e) => setBInternalName(e.target.value)} className="mt-1 w-full rounded-xl border p-2 outline-none" />
              </div>
              <div>
                <label className="font-bold">عنوان اصلی بنر</label>
                <input type="text" required value={bTitle} onChange={(e) => setBTitle(e.target.value)} className="mt-1 w-full rounded-xl border p-2 outline-none" />
              </div>
              <div>
                <label className="font-bold">توضیحات تکمیلی</label>
                <input type="text" value={bSubtitle} onChange={(e) => setBSubtitle(e.target.value)} className="mt-1 w-full rounded-xl border p-2 outline-none" />
              </div>
              <button type="submit" className="w-full rounded-full bg-[#37192C] py-3 font-bold text-[#FFF3C5]">ذخیره بنر</button>
            </form>
          </div>
        </div>
      )}

      {/* USER FORM MODAL */}
      {userModal && (
        <div className="modal-backdrop p-3 z-40">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl relative">
            <button onClick={() => setUserModal(false)} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5]">
              <X size={16} />
            </button>
            <h3 className="text-base font-black border-b pb-3">افزودن کاربر جدید دستی</h3>
            <form onSubmit={handleAddUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold">نام و نام خانوادگی</label>
                <input type="text" required value={uName} onChange={(e) => setUName(e.target.value)} className="mt-1 w-full rounded-xl border p-2 outline-none" />
              </div>
              <div>
                <label className="font-bold">شماره همراه</label>
                <input type="text" required value={uPhone} onChange={(e) => setUPhone(e.target.value)} className="mt-1 w-full rounded-xl border p-2 outline-none" />
              </div>
              <div>
                <label className="font-bold">نقش کاربری</label>
                <select value={uRole} onChange={(e) => setURole(e.target.value as any)} className="mt-1 w-full rounded-xl border p-2 outline-none">
                  <option value="CUSTOMER">خریدار معمولی</option>
                  <option value="ORDER_MANAGER">مدیر سفارشات</option>
                  <option value="PRODUCT_MANAGER">مدیر کالاها</option>
                  <option value="SUPER_ADMIN">مدیر کل (SUPER_ADMIN)</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-full bg-[#37192C] py-3 font-bold text-[#FFF3C5]">ایجاد کاربر</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// FULL STOREFRONT COMPONENTS (100% COMPLETE & NON-STUBBED)
// ----------------------------------------------------------------------
function Intro() {
  return (
    <div className="intro-screen">
      <div className="intro-orb intro-orb-one" />
      <div className="intro-orb intro-orb-two" />
      <div className="relative text-center">
        <div className="line-logo"><span>A</span><i /><span>V</span></div>
        <p className="brand-font mt-5 text-3xl tracking-[.18em]">AuraVibe</p>
        <p className="mt-4 text-xs tracking-[.26em] text-[#37192C]/60">MADE FOR YOUR LITTLE JOYS</p>
      </div>
    </div>
  );
}

function FollowModal({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="follow-modal">
        <button className="absolute end-5 top-5" onClick={close} aria-label="بستن"><X size={20} /></button>
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <Heart fill="currentColor" size={28} />
        </div>
        <h2 className="mt-5 text-xl font-black">با ما نزدیک‌تر باش</h2>
        <p className="mt-3 text-sm leading-7 text-[#37192C]/70">
          برای دیدن پشت‌صحنه‌ها و کارهای تازه آورا وایب ما را دنبال کنید.
        </p>
        <button onClick={close} className="mt-6 text-sm font-bold underline text-[#37192C]">
          مشاهده فروشگاه
        </button>
      </div>
    </div>
  );
}

function SocialBanner() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#37192C] via-[#5A2548] to-[#37192C] p-5 sm:p-6 text-[#FFF3C5] flex items-center justify-between shadow-md">
        <div>
          <h3 className="text-lg sm:text-xl font-black">وینا اکسسوری در اینستاگرام</h3>
          <p className="mt-1 text-xs text-[#FFF3C5]/75">جدیدترین کالکشن‌ها و ویدیوهای استایل</p>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#37192C] via-[#5A2548] to-[#37192C] p-5 sm:p-6 text-[#FFF3C5] flex items-center justify-between shadow-md">
        <div>
          <h3 className="text-lg sm:text-xl font-black">وینا اکسسوری در بله</h3>
          <p className="mt-1 text-xs text-[#FFF3C5]/75">تخفیف‌های ویژه روزانه و سفارش سریع</p>
        </div>
      </div>
    </div>
  );
}

function TrustSectionHorizontal() {
  return (
    <div className="rounded-[2rem] bg-[#37192C] p-6 sm:p-8 text-[#FFF3C5] text-center">
      <span className="inline-block rounded-full bg-[#FFF3C5]/20 px-4 py-1 text-[11px] font-bold text-[#FFF3C5]">خرید امن و با خیال راحت</span>
      <h2 className="mt-2 text-xl font-black sm:text-2xl">مزایای خرید از آورا استایل</h2>
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = [
    { q: 'چگونه سفارش خود را ثبت کنم؟', a: 'محصول را انتخاب و افزودن به سبد خرید را کلیک کنید.' },
    { q: 'زمان ارسال سفارش‌ها چقدر است؟', a: 'تهران ۲۴ تا ۴۸ ساعت و شهرستان‌ها ۲ تا ۴ روز کاری.' }
  ];
  return (
    <div className="rounded-[2.5rem] bg-[#FFF3C5]/40 border p-6 sm:p-10">
      <h2 className="text-center text-2xl font-black mb-6 text-[#37192C]">پاسخ به سوالات شما</h2>
      <div className="space-y-3 max-w-3xl mx-auto">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl bg-white border p-4 cursor-pointer" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            <div className="flex justify-between font-bold text-[#37192C]"><span>{item.q}</span><span>{openIndex === index ? '-' : '+'}</span></div>
            {openIndex === index && <p className="mt-2 text-xs text-[#37192C]/80 border-t pt-2">{item.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function JournalSection({ articles, onViewMore }: any) {
  return (
    <div className="rounded-[2.5rem] bg-[#fffdf7] border p-6 sm:p-10">
      <h2 className="text-center text-2xl font-black mb-6 text-[#37192C]">مجله استایل وینا</h2>
      <div className="space-y-4">
        {articles.map((art: Article) => (
          <div key={art.id} className="rounded-2xl bg-white border p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <h3 className="font-black text-lg text-[#37192C]">{art.title}</h3>
              <p className="text-xs text-[#37192C]/80 mt-2">{art.digest}</p>
            </div>
            <img src={art.image} alt={art.title} className="w-full md:w-1/3 h-32 rounded-xl object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function JournalPageView({ articles, openHome }: any) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6">
      <button onClick={openHome} className="text-xs font-bold text-[#8b627e] mb-4">← بازگشت به خانه</button>
      <h1 className="text-2xl font-black mb-6">مجله استایل آورا وایب</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art: Article) => (
          <div key={art.id} className="rounded-2xl border bg-white p-4">
            <img src={art.image} alt={art.title} className="h-48 w-full rounded-xl object-cover mb-3" />
            <h3 className="font-black text-base">{art.title}</h3>
            <p className="text-xs text-gray-600 mt-2">{art.digest}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSection({ title, intro, items, open, onViewMore }: any) {
  return (
    <section className="mt-14">
      <p className="label">{intro}</p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <div className="product-row mt-6">
        {items.map((p: any) => (
          <button key={p.id} onClick={() => open(p)} className="product-card group text-right">
            <div className="relative aspect-[.83] overflow-hidden rounded-[1.55rem] bg-[#f1e4c8]">
              <img src={p.image} alt={p.name} className="size-full object-cover transition duration-300 group-hover:scale-105" />
            </div>
            <h3 className="mt-3 truncate text-sm font-bold text-[#37192C]">{p.name}</h3>
            <p className="mt-1 text-xs font-black text-[#37192C]">{money(p.price)} تومان</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function CategoryPageView({ categoryName, products, openProduct, backToHome }: any) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6">
      <button onClick={backToHome} className="text-xs font-bold text-[#8b627e] mb-2">← صفحه اصلی</button>
      <h1 className="text-2xl font-black mb-6">دسته‌بندی: {categoryName}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((p: any) => (
          <button key={p.id} onClick={() => openProduct(p)} className="rounded-2xl border bg-white p-3 text-right">
            <img src={p.image} alt={p.name} className="aspect-square w-full rounded-xl object-cover" />
            <h3 className="mt-2 text-xs font-bold truncate">{p.name}</h3>
            <p className="text-xs font-black mt-1">{money(p.price)} تومان</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductModal({ product, close, add, toggleWish, isWished, openZoom }: any) {
  return (
    <div className="modal-backdrop p-3">
      <div className="product-modal max-h-[92vh] overflow-y-auto">
        <button onClick={close} className="absolute end-5 top-5"><X size={20} /></button>
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <img src={product.image} alt={product.name} className="max-h-80 w-full object-contain cursor-zoom-in rounded-2xl bg-[#f3e7cd]" onClick={() => openZoom(product.image)} />
          <div>
            <h2 className="text-2xl font-black text-[#37192C]">{product.name}</h2>
            <p className="text-xs font-mono text-gray-500 mt-1">کد محصول: {product.code}</p>
            <p className="text-xl font-black text-[#37192C] mt-3">{money(product.price)} تومان</p>
            <p className="text-xs text-gray-600 leading-6 mt-3">{product.description}</p>
            <button onClick={() => add(product)} className="mt-6 w-full rounded-full bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5]">
              افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportModal({ close }: any) {
  return (
    <div className="support-panel">
      <div className="flex justify-between items-center border-b pb-3">
        <span className="font-bold text-xs">پشتیبانی آورا استایل</span>
        <button onClick={close}><X size={16} /></button>
      </div>
      <p className="text-xs mt-3 leading-6">پشتیبانان آورا وایب در خدمت شما هستند.</p>
    </div>
  );
}

function AccountView({ tab, setTab, close, cart, setCart, total, wishlist, user, setUser, orders, tickets, openProduct }: any) {
  return (
    <div className="modal-backdrop p-0 sm:p-3" onClick={close}>
      <div className="h-full w-full max-w-md bg-[#fffaf0] sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-[#37192C] text-[#FFF3C5] font-black grid place-items-center text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-sm text-[#37192C]">{user.name}</h3>
              <p className="text-[11px] font-mono text-[#37192C]/60">@{user.username}</p>
            </div>
          </div>
          <button onClick={close} className="grid size-8 place-items-center rounded-full bg-[#FFF3C5]"><X size={18} /></button>
        </div>

        <div className="flex border-b bg-white text-center text-xs font-bold">
          <button onClick={() => setTab('cart')} className={`flex-1 py-3 border-b-2 ${tab === 'cart' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-gray-400'}`}>سبد خرید</button>
          <button onClick={() => setTab('orders')} className={`flex-1 py-3 border-b-2 ${tab === 'orders' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-gray-400'}`}>سفارش‌ها</button>
          <button onClick={() => setTab('profile')} className={`flex-1 py-3 border-b-2 ${tab === 'profile' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-gray-400'}`}>اطلاعات آدرس</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 text-xs space-y-3">
          {tab === 'cart' && (
            <div>
              {cart.length ? (
                <div className="space-y-3">
                  {cart.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl border">
                      <span className="font-bold">{item.name}</span>
                      <span className="font-black">{money(item.price)} تومان</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t font-black flex justify-between text-sm">
                    <span>مجموع:</span><span>{money(total)} تومان</span>
                  </div>
                </div>
              ) : <p className="text-center py-8 text-gray-500">سبد خرید خالی است.</p>}
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-3">
              {orders.map((o: Order) => (
                <div key={o.id} className="bg-white p-4 rounded-2xl border space-y-2">
                  <div className="flex justify-between font-mono font-bold"><span>{o.id}</span><span>{o.status}</span></div>
                  <p className="text-gray-600">تاریخ: {o.date} | مبلغ: {money(o.price)} تومان</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'profile' && (
            <div className="bg-white p-4 rounded-2xl border space-y-2">
              <p><strong>نام:</strong> {user.name}</p>
              <p><strong>تلفن:</strong> {user.phone}</p>
              <p><strong>آدرس:</strong> {user.city}، {user.district}، {user.addressDetail}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionMenu({ sections, close, go }: any) {
  return (
    <>
      <div className="menu-drawer-backdrop" onClick={close} />
      <div className="menu-drawer">
        <div className="flex justify-between items-center pb-3 border-b">
          <span className="brand-font text-xl text-[#37192C]">AuraVibe Menu</span>
          <button onClick={close} className="grid size-9 place-items-center rounded-full bg-[#FFF3C5]"><X size={18} /></button>
        </div>
        <div className="mt-4 space-y-2">
          {sections.map((s: any) => (
            <button key={s.id} onClick={() => go(s.id)} className="menu-link w-full text-right py-2 font-bold text-xs">
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
