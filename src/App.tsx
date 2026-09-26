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
  ChevronDown
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

// Pre-generated initial dataset
const initialNewest = generateProducts(10, 'محصول تازه', 'جدیدترین‌ها', 150000);
const initialBestSellers = generateProducts(10, 'پرفروش آورا', 'پرفروش‌ترین‌ها', 210000);
const initialSpecialOffers = generateProducts(10, 'آیتم ویژه', 'تخفیف ویژه', 170000, true);
const initialWatches = generateProducts(10, 'ساعت زنانه آورا', 'ساعت', 390000, true);

// Pre-generate category products for all categories
const allCategoryProducts: Record<string, Product[]> = {};
categoryList.forEach((cat) => {
  allCategoryProducts[cat.name] = generateProducts(12, cat.name, cat.name, 120000 + Math.floor(Math.random() * 80000));
});

type UserState = {
  isLoggedIn: boolean;
  name: string;
  username: string;
  phone: string;
  avatar: string | null;
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  addressDetail: string;
  postalCode: string;
};

type Order = {
  id: string;
  date: string;
  price: number;
  status: 'در حال پردازش' | 'ارسال شده' | 'تحویل داده شده' | 'لغو شده';
  items: Product[];
  shippingMethod: string;
};

function App() {
  const [intro, setIntro] = useState(true);
  const [followModal, setFollowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountView, setAccountView] = useState<{ tab: 'profile' | 'cart' | 'fav' | 'orders' } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Active View State: 'home' | category name | section name ('جدیدترین‌ها', 'پرفروش‌ترین‌ها', 'تخفیف ویژه', 'ساعت') | 'journal'
  const [activeView, setActiveView] = useState<string>('home');

  // Auth & User State
  const [user, setUser] = useState<UserState>({
    isLoggedIn: false,
    name: 'آرتین کریمی',
    username: 'artin_aura',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    avatar: null,
    country: 'ایران',
    city: 'تهران',
    district: 'منطقه ۱ (شمرانات)',
    neighborhood: 'نیاوران',
    addressDetail: 'خیابان اصلی، کوچه دوم، پلاک ۱۵، واحد ۴',
    postalCode: '۱۹۶۸۷۱۲۳۴۵'
  });

  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register'; pendingAction?: () => void }>({
    open: false,
    mode: 'login'
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-9821',
      date: '۱۴۰۳/۰۶/۱۵',
      price: 434000,
      status: 'تحویل داده شده',
      items: [initialNewest[0], initialBestSellers[1]],
      shippingMethod: 'پست پیشتاز (سراسر کشور)'
    },
    {
      id: 'ORD-9412',
      date: '۱۴۰۳/۰۵/۰۲',
      price: 289000,
      status: 'در حال پردازش',
      items: [initialWatches[0]],
      shippingMethod: 'پیک اختصاصی آورا (تهران)'
    }
  ]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Checkout Invoice State
  const [checkoutModal, setCheckoutModal] = useState(false);

  // Intro and Carousel Timers
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntro(false);
      setFollowModal(true);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % 4), 4800);
    return () => window.clearInterval(timer);
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, product) => sum + product.price, 0), [cart]);

  // Auth enforcement helper
  const requireAuth = (action: () => void) => {
    if (user.isLoggedIn) {
      action();
    } else {
      setAuthModal({ open: true, mode: 'login', pendingAction: action });
    }
  };

  const addToCart = (product: Product) => {
    requireAuth(() => {
      setCart((current) => [...current, product]);
      setSelectedProduct(null);
    });
  };

  const toggleWishlist = (product: Product) => {
    requireAuth(() => {
      setWishlist((current) => {
        const exists = current.some((item) => item.id === product.id);
        if (exists) return current.filter((item) => item.id !== product.id);
        return [...current, product];
      });
    });
  };

  const banners = [
    { eyebrow: 'دست‌ساز، برای تو', title: 'لطافتِ کوچکِ هر روز', subtitle: 'اکسسوری‌هایی که با رنگ و جزئیاتشان، حال خوب می‌سازند.', image: satinImage },
    { eyebrow: 'NEW DROP', title: 'درخشش آرام مروارید', subtitle: 'مجموعه‌ای ظریف برای قرارهای خاطره‌انگیز تو.', image: jewelryImage },
    { eyebrow: 'AURAVIBE EDIT', title: 'یاسی، شیری، رویایی', subtitle: 'جزئیات کوچک، امضای استایل شخصی تو هستند.', image: satinImage },
    { eyebrow: 'هدیه‌ای برای خودت', title: 'یک انتخاب دوست‌داشتنی', subtitle: 'برای تو، برای یک لبخند، برای همین امروز.', image: jewelryImage },
  ];

  const menuSections = [
    { id: 'home', label: 'صفحه اصلی' },
    ...categoryList.slice(0, 6).map((c) => ({ id: c.name, label: c.name })),
    { id: 'جدیدترین‌ها', label: 'تازه رسیده‌ها' },
    { id: 'پرفروش‌ترین‌ها', label: 'پرطرفدارها' },
    { id: 'تخفیف ویژه', label: 'فرصت‌های خوش‌رنگ' },
    { id: 'ساعت', label: 'کالکشن ساعت' },
    { id: 'journal', label: 'مجله استایل' },
  ];

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="pb-nav min-h-screen overflow-x-hidden bg-[#fffaf0] text-[#37192C]">
      {intro && <Intro />}
      {followModal && <FollowModal close={() => setFollowModal(false)} />}

      {/* Fixed Header */}
      <header className="sticky top-0 z-30 border-b border-[#37192c]/8 bg-[#fffaf0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            className="grid size-11 place-items-center rounded-full hover:bg-[#37192c]/7 md:hidden"
            data-testid="menu-button"
            aria-label="منو"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={21} />
          </button>
          <button onClick={() => handleNavClick('home')} className="brand-font text-2xl tracking-[.08em] sm:text-3xl text-[#37192C]">
            AuraVibe
          </button>

          <nav className="hidden items-center gap-6 text-xs font-bold md:flex">
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
              data-testid="cart-button"
              aria-label="سبد خرید"
              onClick={() => setAccountView({ tab: 'cart' })}
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

      {/* MAIN VIEW SWITCHER */}
      {activeView === 'home' ? (
        <>
          {/* Categories Story Row */}
          <section id="stories-section" className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="label">انتخاب کن، بدرخش</p>
                <h1 className="mt-1 text-2xl font-black sm:text-3xl">دسته‌بندی‌های محبوب</h1>
              </div>
            </div>
            <div id="stories" className="story-row mt-5" data-testid="categories-list">
              {categoryList.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleNavClick(cat.name)}
                  className="group w-[105px] shrink-0 text-center"
                  data-testid={'category-' + cat.name}
                >
                  <span className="story-ring">
                    <img src={cat.image} alt={cat.name} />
                  </span>
                  <span className="mt-2 block text-xs font-semibold leading-5 text-[#37192C]">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Banner Carousel */}
          <section className="relative mt-10 overflow-hidden" data-testid="banner-carousel">
            <div className="banner-shell" style={{ transform: `translateX(-${bannerIndex * 100}%)` }}>
              {banners.map((banner) => (
                <article className="relative w-full shrink-0 overflow-hidden" key={banner.title}>
                  <img src={banner.image} alt="کالکشن AuraVibe" className="absolute inset-0 size-full object-cover opacity-45" />
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
            <button onClick={() => setBannerIndex((bannerIndex + 3) % 4)} className="carousel-arrow start-4" aria-label="بنر قبل" data-testid="previous-banner">
              <ChevronRight />
            </button>
            <button onClick={() => setBannerIndex((bannerIndex + 1) % 4)} className="carousel-arrow end-4" aria-label="بنر بعد" data-testid="next-banner">
              <ChevronLeft />
            </button>
            <div className="absolute bottom-6 start-1/2 flex -translate-x-1/2 gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setBannerIndex(index)}
                  className={'h-2.5 rounded-full transition-all ' + (index === bannerIndex ? 'w-7 bg-[#FFF3C5]' : 'w-2.5 bg-white/60')}
                  aria-label={`بنر ${index + 1}`}
                />
              ))}
            </div>
          </section>

          {/* Home Section Collections */}
          <div id="collection" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <ProductSection
              title="جدیدترین‌ها"
              intro="تازه‌ترین‌های آورا استایل"
              items={initialNewest}
              open={setSelectedProduct}
              onViewMore={() => handleNavClick('جدیدترین‌ها')}
              testid="new-products"
            />
            <ProductSection
              title="پرفروش‌ترین‌ها"
              intro="محبوب‌ترین انتخاب‌های کاربران"
              items={initialBestSellers}
              open={setSelectedProduct}
              onViewMore={() => handleNavClick('پرفروش‌ترین‌ها')}
              testid="best-sellers"
            />
            <ProductSection
              title="تخفیف ویژه"
              intro="پیشنهادهای استثنایی و محدود"
              items={initialSpecialOffers}
              open={setSelectedProduct}
              onViewMore={() => handleNavClick('تخفیف ویژه')}
              testid="special-offers"
            />
            <ProductSection
              title="ساعت"
              intro="کالکشن ساعت‌های ظریف و خاص"
              items={initialWatches}
              open={setSelectedProduct}
              onViewMore={() => handleNavClick('ساعت')}
              testid="watches"
            />
          </div>

          {/* Social Banner - Positioned right above FAQ */}
          <section className="mx-auto my-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="social-banner">
            <SocialBanner />
          </section>

          {/* FAQ Section */}
          <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="faq-section">
            <FaqSection />
          </section>

          {/* Trust Section - Single Horizontal Row (1x4) */}
          <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="trust-section">
            <TrustSectionHorizontal />
          </section>

          {/* Journal Section - Redesigned according to IMG_20260925_230721.jpg */}
          <section id="journal" className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="journal-section">
            <JournalSection articles={sampleArticles.slice(0, 4)} onViewMore={() => handleNavClick('journal')} />
          </section>
        </>
      ) : activeView === 'journal' ? (
        /* Dedicated Journal Page View */
        <JournalPageView articles={sampleArticles} openHome={() => handleNavClick('home')} />
      ) : (
        /* Dedicated Category/Section Page View */
        <CategoryPageView
          categoryName={activeView}
          products={allCategoryProducts[activeView] || generateProducts(12, activeView, activeView, 140000)}
          openProduct={setSelectedProduct}
          backToHome={() => handleNavClick('home')}
        />
      )}

      {/* Fixed Footer */}
      <footer className="mt-16 bg-[#FFF3C5] border-t border-[#37192c]/10 py-12 text-[#37192C]" data-testid="site-footer">
        <div className="mx-auto grid w-full max-w-7xl gap-9 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="brand-font text-3xl font-black">AuraVibe</div>
            <p className="mt-4 text-xs leading-7 text-[#37192C]/80">
              فروشگاه تخصصی اکسسوری و زیورآلات ظریف با تم کرم وانیلی و بنفش آلیره. جزئیات کوچکی که استایل شما را درخشان‌تر می‌کنند.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-sm">خرید و کالکشن‌ها</h3>
            <div className="mt-4 space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNavClick('جدیدترین‌ها')} className="block hover:underline">جدیدترین‌ها</button>
              <button onClick={() => handleNavClick('پرفروش‌ترین‌ها')} className="block hover:underline">پرفروش‌ترین‌ها</button>
              <button onClick={() => handleNavClick('تخفیف ویژه')} className="block hover:underline">تخفیف ویژه</button>
              <button onClick={() => handleNavClick('ساعت')} className="block hover:underline">ساعت</button>
              <button onClick={() => handleNavClick('گردنبند')} className="block hover:underline">گردنبند</button>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm">راهنما و مجله</h3>
            <div className="mt-4 space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNavClick('journal')} className="block hover:underline">مجله استایل آورا</button>
              <a href="#faq-section" className="block hover:underline">سوالات پرتکرار</a>
              <button onClick={() => setSupportOpen(true)} className="block hover:underline">پشتیبانی آنلاین</button>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base">ارتباط با ما</h3>
            <a className="mt-4 block text-sm font-semibold" href="tel:02100000000">پشتیبانی: ۰۲۱-۰۰۰۰۰۰۰۰</a>
            <a className="mt-2 block text-sm font-semibold" href="mailto:hello@auravibe.ir">ایمیل: hello@auravibe.ir</a>
            <p className="mt-4 text-xs leading-6 text-[#37192C]/60">تمامی حقوق برای برند AuraVibe محفوظ است.</p>
          </div>
        </div>
      </footer>

      {/* Fixed Support Button */}
      <button className="support-button" onClick={() => setSupportOpen(true)} data-testid="support-button" aria-label="پشتیبانی">
        <Headphones size={22} />
      </button>

      {/* Support Modal Component */}
      {supportOpen && <SupportModal close={() => setSupportOpen(false)} />}

      {/* Enhanced Product Details Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          close={() => setSelectedProduct(null)}
          add={addToCart}
          toggleWish={toggleWishlist}
          isWished={wishlist.some((w) => w.id === selectedProduct.id)}
          allProducts={[...initialNewest, ...initialBestSellers, ...initialSpecialOffers, ...initialWatches]}
          openProduct={setSelectedProduct}
        />
      )}

      {/* Drawer Section Menu */}
      {menuOpen && <SectionMenu sections={menuSections} close={() => setMenuOpen(false)} go={handleNavClick} />}

      {/* Search Modal */}
      {searchOpen && <SearchModal close={() => setSearchOpen(false)} openProduct={setSelectedProduct} />}

      {/* User Account / Cart / Wishlist / Orders Drawer Modal */}
      {accountView && (
        <AccountView
          tab={accountView.tab}
          setTab={(tab) => setAccountView({ tab })}
          close={() => setAccountView(null)}
          cart={cart}
          setCart={setCart}
          total={cartTotal}
          wishlist={wishlist}
          user={user}
          setUser={setUser}
          orders={orders}
          openProduct={setSelectedProduct}
          openCheckout={() => setCheckoutModal(true)}
          openOrderDetails={(order) => setSelectedOrderDetails(order)}
        />
      )}

      {/* Auth Modal (Login / Register / OTP) */}
      {authModal.open && (
        <AuthModal
          mode={authModal.mode}
          close={() => setAuthModal({ ...authModal, open: false })}
          onSuccess={(loggedUser) => {
            setUser(loggedUser);
            setAuthModal({ ...authModal, open: false });
            if (authModal.pendingAction) authModal.pendingAction();
          }}
          switchMode={(newMode) => setAuthModal({ ...authModal, mode: newMode })}
        />
      )}

      {/* Checkout Invoice Modal */}
      {checkoutModal && (
        <CheckoutInvoiceModal
          cart={cart}
          total={cartTotal}
          user={user}
          close={() => setCheckoutModal(false)}
          onPaymentComplete={() => {
            const newOrder: Order = {
              id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
              date: 'امروز',
              price: cartTotal,
              status: 'در حال پردازش',
              items: [...cart],
              shippingMethod: 'پست پیشتاز'
            };
            setOrders([newOrder, ...orders]);
            setCart([]);
            setCheckoutModal(false);
            setAccountView({ tab: 'orders' });
          }}
        />
      )}

      {/* Order Details Status Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          close={() => setSelectedOrderDetails(null)}
          openProduct={setSelectedProduct}
        />
      )}

      {/* Fixed Bottom Navigation */}
      <nav className="bottom-nav" dir="ltr" data-testid="bottom-nav">
        <button
          className="bottom-nav-item"
          onClick={() => handleNavClick('home')}
          aria-label="خانه"
          data-testid="nav-home"
        >
          <Home size={22} />
        </button>
        <button
          className="bottom-nav-item"
          onClick={() => setSearchOpen(true)}
          aria-label="جستجو"
          data-testid="nav-search"
        >
          <Search size={22} />
        </button>
        <button
          className="bottom-nav-item"
          onClick={() => setAccountView({ tab: user.isLoggedIn ? 'profile' : 'cart' })}
          aria-label="حساب کاربری"
          data-testid="nav-account"
        >
          <UserRound size={22} />
        </button>
      </nav>
    </main>
  );
}

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

function Intro() {
  return (
    <div className="intro-screen" data-testid="intro-teaser">
      <div className="intro-orb intro-orb-one" />
      <div className="intro-orb intro-orb-two" />
      <div className="relative text-center">
        <div className="line-logo">
          <span>A</span>
          <i />
          <span>V</span>
        </div>
        <p className="brand-font mt-5 text-3xl tracking-[.18em]">AuraVibe</p>
        <p className="mt-4 text-xs tracking-[.26em] text-[#37192C]/60">MADE FOR YOUR LITTLE JOYS</p>
      </div>
    </div>
  );
}

// Initial Modal "با ما نزدیک باش" with SVG Bale and Telegram logos
function FollowModal({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="follow-modal">
        <button className="absolute end-5 top-5" onClick={close} aria-label="بستن">
          <X size={20} />
        </button>
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <Heart fill="currentColor" size={28} />
        </div>
        <h2 className="mt-5 text-xl font-black">با ما نزدیک‌تر باش</h2>
        <p className="mt-3 text-sm leading-7 text-[#37192C]/70">
          برای دیدن پشت‌صحنه‌ها، محصولات تازه و حال‌وهوای AuraVibe ما را در شبکه‌های اجتماعی دنبال کن.
        </p>
        <div className="mt-6 flex justify-center items-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            aria-label="اینستاگرام"
            title="اینستاگرام"
          >
            <Instagram size={22} />
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            aria-label="تلگرام"
            title="تلگرام"
          >
            <Send size={22} />
          </a>
          <a
            href="https://ble.ir"
            target="_blank"
            rel="noreferrer"
            className="social-icon p-2"
            aria-label="بله"
            title="بله"
          >
            <img src="/assets/bale.svg" alt="بله" className="size-full object-contain filter invert" />
          </a>
        </div>
        <button onClick={close} className="mt-6 text-sm font-bold underline underline-offset-4 text-[#37192C]">
          فعلاً فقط می‌خوام فروشگاه را ببینم
        </button>
      </div>
    </div>
  );
}

// Social Banner Section (Exact style from IMG_20260925_225710.jpg with Instagram logo)
function SocialBanner() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Instagram Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#37192C] via-[#5A2548] to-[#37192C] p-5 sm:p-6 text-[#FFF3C5] flex items-center justify-between shadow-md">
        <div className="z-10">
          <h3 className="text-lg sm:text-xl font-black">وینا اکسسوری در اینستاگرام</h3>
          <p className="mt-1 text-xs text-[#FFF3C5]/75">جدیدترین کالکشن‌ها و ویدیوهای استایل</p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-full bg-[#FFF3C5]/20 hover:bg-[#FFF3C5] hover:text-[#37192C] transition px-4 py-1.5 text-xs font-bold border border-[#FFF3C5]/30"
          >
            برای عضویت کلیک کنید
          </a>
        </div>
        <div className="z-10 grid size-16 shrink-0 place-items-center rounded-2xl bg-white p-2 shadow-inner">
          <img src="/assets/instagram.png" alt="اینستاگرام" className="size-full object-contain" />
        </div>
      </div>

      {/* Bale Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#37192C] via-[#5A2548] to-[#37192C] p-5 sm:p-6 text-[#FFF3C5] flex items-center justify-between shadow-md">
        <div className="z-10">
          <h3 className="text-lg sm:text-xl font-black">وینا اکسسوری در بله</h3>
          <p className="mt-1 text-xs text-[#FFF3C5]/75">تخفیف‌های ویژه روزانه و سفارش سریع</p>
          <a
            href="https://ble.ir"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-full bg-[#FFF3C5]/20 hover:bg-[#FFF3C5] hover:text-[#37192C] transition px-4 py-1.5 text-xs font-bold border border-[#FFF3C5]/30"
          >
            برای عضویت کلیک کنید
          </a>
        </div>
        <div className="z-10 grid size-16 shrink-0 place-items-center rounded-2xl bg-white p-2 shadow-inner">
          <img src="/assets/bale.svg" alt="بله" className="size-full object-contain" />
        </div>
      </div>
    </div>
  );
}

// Single Horizontal Row Trust Section (1x4)
function TrustSectionHorizontal() {
  const trustBadges = [
    { icon: <Truck size={24} />, title: 'ارسال سریع', desc: 'تحویل به‌موقع در سراسر کشور' },
    { icon: <ShieldCheck size={24} />, title: 'ضمانت اصالت', desc: 'بهترین متریال ضدحساسیت' },
    { icon: <RefreshCw size={24} />, title: '۷ روز بازگشت', desc: 'تعویض آسان و بدون قید' },
    { icon: <Headphones size={24} />, title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی سریع پشتیبانان' },
  ];
  return (
    <div className="rounded-[2rem] bg-[#37192C] p-6 sm:p-8 text-[#FFF3C5]">
      <div className="mb-6 text-center">
        <span className="inline-block rounded-full bg-[#FFF3C5]/20 px-4 py-1 text-[11px] font-bold text-[#FFF3C5]">
          خرید امن و با خیال راحت
        </span>
        <h2 className="mt-2 text-xl font-black sm:text-2xl">مزایای خرید از آورا استایل</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="flex items-center gap-3.5 rounded-xl bg-[#FFF3C5]/10 p-4 border border-[#FFF3C5]/15">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C] font-bold shadow">
              {badge.icon}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">{badge.title}</h3>
              <p className="mt-0.5 text-[11px] text-[#FFF3C5]/70">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// FAQ Section
function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = [
    { q: 'چگونه سفارش خود را ثبت کنم؟', a: 'محصول مورد نظر را انتخاب کرده، رنگ و تعداد را مشخص نموده و روی افزودن به سبد خرید کلیک کنید سپس فرایند پرداخت را تکمیل کنید.' },
    { q: 'زمان ارسال سفارش‌ها چقدر است؟', a: 'سفارش‌های تهران بین ۲۴ تا ۴۸ ساعت کاری و شهرستان‌ها با پست پیشتاز بین ۲ تا ۴ روز کاری تحویل می‌گردند.' },
    { q: 'شرایط تعویض یا مرجوعی کالا چیست؟', a: 'تا ۷ روز پس از دریافت کالا، در صورت عدم استفاده و حفظ پلمپ اولیه امکان تعویض کالا وجود دارد.' },
    { q: 'آیا محصولات آورا استایل ضد حساسیت هستند؟', a: 'بله تمامی بدلیجات و اکسسوری‌های فلزی از متریال استیل ضدحساسیت و بدون نیکل ساخته شده‌اند.' }
  ];
  return (
    <div className="rounded-[2.5rem] bg-[#FFF3C5]/40 border border-[#37192c]/10 p-6 sm:p-10">
      <div className="text-center max-w-xl mx-auto">
        <p className="label">سوالات پرتکرار</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#37192C]">پاسخ به سوالات شما</h2>
      </div>
      <div className="mt-8 space-y-3 max-w-3xl mx-auto">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl bg-white border border-[#37192c]/10 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-5 text-right font-bold text-[#37192C] hover:bg-[#fff3c5]/30"
            >
              <span className="text-sm sm:text-base">{item.q}</span>
              <div className="grid size-8 place-items-center rounded-full bg-[#37192C] text-[#FFF3C5]">
                {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
              </div>
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-7 text-[#37192C]/80 border-t border-[#37192c]/5">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Redesigned Journal Section according to IMG_20260925_230721.jpg
function JournalSection({ articles, onViewMore }: { articles: Article[]; onViewMore: () => void }) {
  return (
    <div className="rounded-[2.5rem] bg-[#fffdf7] border border-[#37192c]/10 p-6 sm:p-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#37192C]">مجله استایل وینا</h2>
        <p className="mt-1.5 text-xs text-[#8b627e]">جدیدترین مقالات، ایده‌ها و راهنماهای مد و اکسسوری</p>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="relative flex flex-col md:flex-row-reverse items-stretch overflow-hidden rounded-2xl border border-[#37192c]/10 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* Right side (RTL start): Title & Comment-style snippet box below */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#8b233a] leading-tight">
                  {article.title}
                </h3>

                {/* Comment-style narrow box snippet underneath */}
                <div className="mt-4 rounded-xl bg-[#fff9f0] border border-[#37192c]/10 p-4 shadow-sm relative">
                  <p className="text-xs sm:text-sm font-bold text-[#37192C] leading-6">
                    {article.digest}
                  </p>
                  <span className="mt-2 block text-[10px] text-[#37192C]/60 font-semibold">
                    {article.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Left side (RTL end): Image */}
            <div className="md:w-2/5 shrink-0 h-48 md:h-auto overflow-hidden">
              <img src={article.image} alt={article.title} className="size-full object-cover" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onViewMore}
          className="inline-flex items-center gap-2 rounded-full bg-[#37192C] px-8 py-3.5 text-xs font-black text-[#FFF3C5] transition hover:bg-[#5c2d4e]"
        >
          مشاهده بیشتر مقالات <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
}

// Dedicated Journal Page View
function JournalPageView({ articles, openHome }: { articles: Article[]; openHome: () => void }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-4">
        <div>
          <button onClick={openHome} className="flex items-center gap-1 text-xs font-bold text-[#8b627e] mb-1">
            <ArrowLeft size={14} className="rotate-180" /> بازگشت به خانه
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#37192C]">مجله استایل وینا و آورا</h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => (
          <article key={art.id} className="rounded-2xl border border-[#37192c]/10 bg-white overflow-hidden shadow-sm">
            <img src={art.image} alt={art.title} className="h-52 w-full object-cover" />
            <div className="p-6">
              <span className="rounded-full bg-[#FFF3C5] px-3 py-1 text-[10px] font-bold text-[#37192C]">{art.tag}</span>
              <h2 className="mt-3 text-lg font-black text-[#37192C]">{art.title}</h2>
              <p className="mt-2 text-xs leading-6 text-[#37192C]/75">{art.digest}</p>
              <div className="mt-4 pt-4 border-t border-[#37192c]/5 flex items-center justify-between text-[11px] text-[#37192C]/60">
                <span>{art.date}</span>
                <span className="font-bold text-[#37192C]">خواندن مقاله</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// Product Section Helper
function ProductSection({
  title,
  intro,
  items,
  open,
  onViewMore,
  testid
}: {
  title: string;
  intro: string;
  items: Product[];
  open: (p: Product) => void;
  onViewMore: () => void;
  testid: string;
}) {
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between">
        <div>
          <p className="label">{intro}</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2>
        </div>
      </div>
      <div id={testid} className="product-row mt-6" data-testid={testid}>
        {items.map((product, index) => (
          <ProductCard key={product.id + '-' + index} product={product} open={open} />
        ))}
        <button
          onClick={onViewMore}
          className="flex h-[230px] w-[140px] shrink-0 flex-col items-center justify-center rounded-[1.55rem] border-2 border-dashed border-[#37192c]/20 bg-[#fff3c5]/30 p-4 transition hover:bg-[#FFF3C5]/60 hover:border-[#37192C]"
          data-testid={'view-more-' + testid}
        >
          <div className="grid size-12 place-items-center rounded-full bg-[#37192C] text-[#FFF3C5]">
            <ArrowLeft size={22} />
          </div>
          <span className="mt-3 text-xs font-black text-[#37192C]">مشاهده بیشتر</span>
        </button>
      </div>
    </section>
  );
}

function ProductCard({ product, open }: { product: Product; open: (p: Product) => void }) {
  return (
    <button
      onClick={() => open(product)}
      className="product-card group text-right"
      data-testid={'product-' + product.id}
    >
      <div className="relative aspect-[.83] overflow-hidden rounded-[1.55rem] bg-[#f1e4c8]">
        <img src={product.image} alt={product.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        {product.badge && (
          <span className="absolute end-3 top-3 rounded-full bg-[#FFF3C5] px-2.5 py-1 text-[10px] font-bold text-[#37192C]">
            {product.badge}
          </span>
        )}
      </div>
      <h3 className="mt-3 truncate text-sm font-bold text-[#37192C]">{product.name}</h3>
      <div className="mt-1 flex items-center gap-2 text-xs">
        <span className="font-black text-[#37192C]">{money(product.price)} تومان</span>
        {product.oldPrice && <del className="text-[#37192C]/45">{money(product.oldPrice)}</del>}
      </div>
    </button>
  );
}

// Dedicated Category or Section View with Specialized Filter & Search
function CategoryPageView({
  categoryName,
  products,
  openProduct,
  backToHome
}: {
  categoryName: string;
  products: Product[];
  openProduct: (p: Product) => void;
  backToHome: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('همه');
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDiscount = !onlyDiscounted || !!p.oldPrice;
      const matchPrice = p.price <= maxPrice;
      return matchSearch && matchDiscount && matchPrice;
    });
  }, [products, searchTerm, onlyDiscounted, maxPrice]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#37192c]/10 pb-4">
        <div>
          <button onClick={backToHome} className="flex items-center gap-1 text-xs font-bold text-[#8b627e] mb-1">
            <ArrowLeft size={14} className="rotate-180" /> صفحه اصلی
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#37192C]">دسته‌بندی: {categoryName}</h1>
        </div>
        <span className="rounded-full bg-[#FFF3C5] px-4 py-1.5 text-xs font-bold text-[#37192C]">
          تعداد محصولات: {filteredProducts.length}
        </span>
      </div>

      {/* Specialized Top Filter Bar */}
      <div className="mt-6 rounded-2xl bg-white border border-[#37192c]/10 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 px-3.5 py-2.5 w-full">
            <Search size={18} className="text-[#37192C]/50 shrink-0" />
            <input
              type="text"
              placeholder={`جستجو در بین محصولات ${categoryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#37192C] outline-none"
            />
          </div>
          <button
            onClick={() => setOnlyDiscounted(!onlyDiscounted)}
            className={'rounded-xl px-4 py-2.5 text-xs font-bold transition w-full sm:w-auto border ' + (onlyDiscounted ? 'bg-[#37192C] text-[#FFF3C5] border-[#37192C]' : 'bg-[#fffaf0] text-[#37192C] border-[#37192c]/10')}
          >
            فقط تخفیف‌دارها
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#37192c]/5 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="font-bold text-[#37192C]">حداکثر قیمت:</span>
            <input
              type="range"
              min="100000"
              max="1000000"
              step="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-[#37192C]"
            />
            <span className="font-black text-[#37192C]">{money(maxPrice)} تومان</span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredProducts.map((p) => (
          <button
            key={p.id}
            onClick={() => openProduct(p)}
            className="group rounded-2xl border border-[#37192c]/10 bg-white p-3 text-right shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f1e4c8]">
              <img src={p.image} alt={p.name} className="size-full object-cover transition duration-300 group-hover:scale-105" />
              {p.oldPrice && (
                <span className="absolute end-2 top-2 rounded-full bg-[#37192C] px-2 py-0.5 text-[9px] font-bold text-[#FFF3C5]">
                  تخفیف
                </span>
              )}
            </div>
            <h3 className="mt-2.5 truncate text-xs font-bold text-[#37192C]">{p.name}</h3>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="font-black text-[#37192C]">{money(p.price)} تومان</span>
              {p.oldPrice && <del className="text-[#37192C]/40 text-[10px]">{money(p.oldPrice)}</del>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Enhanced Product Modal
function ProductModal({
  product,
  close,
  add,
  toggleWish,
  isWished,
  allProducts,
  openProduct
}: {
  product: Product;
  close: () => void;
  add: (p: Product) => void;
  toggleWish: (p: Product) => void;
  isWished: boolean;
  allProducts: Product[];
  openProduct: (p: Product) => void;
}) {
  const [count, setCount] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  // Dynamic related products list
  const relatedProducts = useMemo(() => {
    return allProducts.filter((item) => item.id !== product.id).slice(0, 4);
  }, [allProducts, product]);

  return (
    <div className="modal-backdrop p-3">
      <div className="product-modal max-h-[92vh] overflow-y-auto" data-testid="product-modal">
        <button className="absolute end-5 top-5 z-10 grid size-10 place-items-center rounded-full bg-white/80 shadow-sm hover:bg-white" onClick={close} aria-label="بستن">
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="min-h-[300px] bg-[#f3e7cd] flex items-center justify-center p-4">
            <img src={product.image} alt={product.name} className="max-h-[500px] w-full object-contain rounded-2xl" />
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="label">{product.category}</span>
                {product.badge && (
                  <span className="rounded-full bg-[#FFF3C5] px-3 py-1 text-[11px] font-bold text-[#37192C]">{product.badge}</span>
                )}
              </div>
              <h2 className="mt-2 text-2xl font-black text-[#37192C]">{product.name}</h2>

              {/* Price section with crossed out old price */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-black text-[#37192C]">{money(product.price)} تومان</span>
                {product.oldPrice && (
                  <del className="text-sm font-semibold text-[#37192C]/45">{money(product.oldPrice)} تومان</del>
                )}
              </div>

              <p className="mt-4 text-xs sm:text-sm leading-7 text-[#37192C]/80">{product.description}</p>

              {/* Colors */}
              <div className="mt-6">
                <p className="text-xs font-bold text-[#37192C]">انتخاب رنگ</p>
                <div className="mt-2.5 flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      onClick={() => setSelectedColor(color)}
                      key={color}
                      className={'size-8 rounded-full border-2 ' + (selectedColor === color ? 'border-[#37192C] outline outline-2 outline-offset-2 outline-[#37192C]/40' : 'border-white')}
                      style={{ backgroundColor: color }}
                      aria-label="انتخاب رنگ"
                    />
                  ))}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-[#37192c]/20 bg-white">
                  <button onClick={() => setCount(Math.max(1, count - 1))} className="grid size-10 place-items-center text-[#37192C]" aria-label="کم کردن">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-[#37192C]" data-testid="quantity-value">{count}</span>
                  <button onClick={() => setCount(count + 1)} className="grid size-10 place-items-center text-[#37192C]" aria-label="اضافه کردن">
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => { for (let i = 0; i < count; i++) add(product); }}
                  className="flex-1 rounded-full bg-[#37192C] py-3.5 text-xs sm:text-sm font-bold text-[#FFF3C5] transition hover:bg-[#5c2d4e]"
                  data-testid="add-to-cart"
                >
                  افزودن به سبد خرید
                </button>

                <button
                  onClick={() => toggleWish(product)}
                  className={'grid size-11 place-items-center rounded-full border border-[#37192c]/20 transition ' + (isWished ? 'bg-rose-100 text-rose-600 border-rose-300' : 'bg-white text-[#37192C]')}
                  title="افزودن به علاقمندی‌ها"
                >
                  <Heart size={20} fill={isWished ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Related Products Section */}
            <div className="mt-8 border-t border-[#37192c]/10 pt-5">
              <h4 className="text-xs font-bold text-[#37192C] mb-3">محصولات مرتبط</h4>
              <div className="grid grid-cols-4 gap-2">
                {relatedProducts.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => openProduct(rel)}
                    className="group rounded-xl border border-[#37192c]/10 bg-white p-2 text-right transition hover:border-[#37192C]"
                  >
                    <img src={rel.image} alt={rel.name} className="aspect-square w-full rounded-lg object-cover" />
                    <span className="mt-1 block truncate text-[10px] font-bold text-[#37192C]">{rel.name}</span>
                    <span className="block text-[10px] font-black text-[#37192C]">{money(rel.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Support Modal with Accessory Q&A and Call Request
function SupportModal({ close }: { close: () => void }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [callSubmitted, setCallSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const accessoryFaqs = [
    { q: 'چگونه سایز مناسب انگشتر یا دستبندم را پیدا کنم؟', a: 'در صفحه هر محصول راهنمای جدول سایزبندی قرار دارد. همچنین پشتیبانان پس از ثبت سفارش جهت تایید دقیق سایز با شما تماس خواهند گرفت.' },
    { q: 'آیا بدلیجات آورا در برابر آب و شوینده تغییر رنگ می‌دهند؟', a: 'تمامی بدلیجات از جنس استیل ۳۱۶ با روکش طلای ۱۸ عیار هستند. توصیه می‌شود جهت دوام چند ساله از تماس مستقیم با ادکلن و مواد شوینده قوی خودداری کنید.' },
    { q: 'پس از ثبت سفارش، کد رهگیری پستی را از کجا دریافت کنم؟', a: 'کد رهگیری پستی ظرف ۲۴ ساعت از طریق اس‌ام‌اس ارسال شده و در بخش «وضعیت سفارش» حساب کاربری شما نیز ثبت می‌گردد.' },
    { q: 'نحوه ارسال برای هدیه چگونه است؟', a: 'تمامی بسته‌ها به‌صورت پیش‌فرض در جعبه‌های هدیه مخمل آورا قرار می‌گیرند و می‌توانید پیام دلخواه هدیه را در یادداشت سفارش درج کنید.' }
  ];

  const handleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setCallSubmitted(true);
  };

  return (
    <div className="support-panel shadow-2xl" data-testid="support-panel">
      <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-3">
        <div>
          <span className="label">پشتیبانی تخصصی آورا استایل</span>
          <h2 className="mt-0.5 text-sm font-black text-[#37192C]">راهنمایی و پشتیبانی آنلاین</h2>
        </div>
        <button onClick={close} className="grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pe-1">
        <p className="text-[11px] font-bold text-[#37192C]">سوالات متداول مشتریان:</p>
        {accessoryFaqs.map((faq) => (
          <button
            key={faq.q}
            onClick={() => setSelectedAnswer(selectedAnswer === faq.a ? null : faq.a)}
            className="w-full rounded-xl bg-[#fffaf0] p-2.5 text-right text-xs font-bold text-[#37192C] hover:bg-[#FFF3C5] transition border border-[#37192c]/5"
          >
            {faq.q}
          </button>
        ))}
      </div>

      {selectedAnswer && (
        <div className="mt-3 rounded-xl bg-[#FFF3C5] p-3 text-xs leading-6 text-[#37192C] font-semibold">
          {selectedAnswer}
        </div>
      )}

      {/* Call Back Form */}
      <div className="mt-4 border-t border-[#37192c]/10 pt-3">
        <p className="text-[11px] font-bold text-[#37192C] mb-2">درخواست تماس تلفنی پشتیبان:</p>
        {callSubmitted ? (
          <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-3 text-center text-xs font-bold text-emerald-800">
            درخواست شما ثبت شد. به زودی پشتیبانان با شما تماس می‌گیرند.
          </div>
        ) : (
          <form onSubmit={handleCallSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="نام و نام خانوادگی"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
              required
            />
            <input
              type="text"
              placeholder="شماره تماس"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
              required
            />
            <button type="submit" className="w-full rounded-full bg-[#37192C] py-2 text-xs font-bold text-[#FFF3C5]">
              ثبت درخواست تماس
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Advanced Search Modal with Conditional Sub-filters
function SearchModal({ close, openProduct }: { close: () => void; openProduct: (p: Product) => void }) {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('همه');
  const [subFilter, setSubFilter] = useState('همه');
  const [maxPrice, setMaxPrice] = useState(1000000);

  const allProducts = useMemo(() => {
    return [
      ...initialNewest,
      ...initialBestSellers,
      ...initialSpecialOffers,
      ...initialWatches,
      ...allCategoryProducts['گردنبند'],
      ...allCategoryProducts['دستبند'],
      ...allCategoryProducts['گوشواره']
    ];
  }, []);

  const filtered = useMemo(() => {
    return allProducts.filter((item) => {
      const matchQuery = item.name.toLowerCase().includes(query.toLowerCase());
      const matchCat = selectedCat === 'همه' || item.category === selectedCat;
      const matchSub = subFilter === 'همه' || (subFilter === 'تخفیف‌دار' ? !!item.oldPrice : true);
      const matchPrice = item.price <= maxPrice;
      return matchQuery && matchCat && matchSub && matchPrice;
    });
  }, [allProducts, query, selectedCat, subFilter, maxPrice]);

  return (
    <div className="modal-backdrop p-0 sm:p-4" data-testid="search-modal">
      <div className="h-full w-full max-w-2xl bg-[#fffaf0] sm:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Search Input */}
        <div className="flex items-center gap-2 border-b border-[#37192c]/10 bg-white p-4">
          <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-[#efefef] px-3.5 py-2.5">
            <Search size={18} className="text-[#8e8e8e] shrink-0" />
            <input
              type="text"
              placeholder="جستجو در بین تمام محصولات آورا..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#262626] outline-none"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="grid size-5 place-items-center rounded-full bg-[#c7c7c7] text-white">
                <X size={12} />
              </button>
            )}
          </div>
          <button onClick={close} className="grid size-10 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]" aria-label="بستن">
            <X size={20} />
          </button>
        </div>

        {/* Conditional Filter Options */}
        <div className="bg-white px-4 py-3 border-b border-[#37192c]/5 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-[#37192C] shrink-0">دسته:</span>
            {['همه', 'جدیدترین‌ها', 'ساعت', 'گردنبند', 'دستبند', 'گوشواره', 'انگشتر', 'نیم ست'].map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCat(cat); setSubFilter('همه'); }}
                className={'rounded-full px-3 py-1 text-[11px] font-bold shrink-0 transition ' + (selectedCat === cat ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-[#fffaf0] text-[#37192C] border border-[#37192c]/10')}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Conditional Sub-options if category selected */}
          {selectedCat !== 'همه' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#8b627e]">فیلتر تکمیلی {selectedCat}:</span>
              <button
                onClick={() => setSubFilter('همه')}
                className={'rounded-lg px-2.5 py-1 text-[10px] font-bold ' + (subFilter === 'همه' ? 'bg-[#FFF3C5] text-[#37192C]' : 'bg-gray-100 text-gray-700')}
              >
                همه مدل‌ها
              </button>
              <button
                onClick={() => setSubFilter('تخفیف‌دار')}
                className={'rounded-lg px-2.5 py-1 text-[10px] font-bold ' + (subFilter === 'تخفیف‌دار' ? 'bg-[#FFF3C5] text-[#37192C]' : 'bg-gray-100 text-gray-700')}
              >
                تخفیف ویژه
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-bold text-[#37192C] mb-3">نتایج یافت شده ({filtered.length})</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => { openProduct(item); close(); }}
                className="group rounded-2xl border border-[#37192c]/10 bg-white p-2.5 text-right transition hover:shadow-md"
              >
                <img src={item.image} alt={item.name} className="aspect-square w-full rounded-xl object-cover" />
                <h4 className="mt-2 truncate text-xs font-bold text-[#37192C]">{item.name}</h4>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="font-black text-[#37192C]">{money(item.price)} تومان</span>
                  {item.oldPrice && <del className="text-[#37192C]/40 text-[10px]">{money(item.oldPrice)}</del>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// User Drawer View (Profile, Wishlist, Cart, Orders)
function AccountView({
  tab,
  setTab,
  close,
  cart,
  setCart,
  total,
  wishlist,
  user,
  setUser,
  orders,
  openProduct,
  openCheckout,
  openOrderDetails
}: {
  tab: 'profile' | 'cart' | 'fav' | 'orders';
  setTab: (tab: 'profile' | 'cart' | 'fav' | 'orders') => void;
  close: () => void;
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
  total: number;
  wishlist: Product[];
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  orders: Order[];
  openProduct: (p: Product) => void;
  openCheckout: () => void;
  openOrderDetails: (o: Order) => void;
}) {
  const [editingAddress, setEditingAddress] = useState(false);

  // Address Cascading dropdown states
  const [selectedCity, setSelectedCity] = useState(user.city);
  const [selectedDistrict, setSelectedDistrict] = useState(user.district);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(user.neighborhood);

  const activeCityData = useMemo(() => {
    return iranLocations.find((loc) => loc.city === selectedCity) || iranLocations[0];
  }, [selectedCity]);

  const activeDistrictData = useMemo(() => {
    return activeCityData.districts.find((d) => d.name === selectedDistrict) || activeCityData.districts[0];
  }, [activeCityData, selectedDistrict]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setUser({ ...user, avatar: url });
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      city: selectedCity,
      district: selectedDistrict,
      neighborhood: selectedNeighborhood
    });
    setEditingAddress(false);
  };

  return (
    <div className="modal-backdrop p-0 sm:p-3" onClick={close} data-testid="account-view">
      <div className="h-full w-full max-w-md bg-[#fffaf0] sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Instagram Left-Aligned Profile Header */}
        <div className="flex items-center justify-between border-b border-[#37192c]/10 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-14 rounded-full border-2 border-[#37192C] p-0.5 bg-gradient-to-tr from-[#FFF3C5] to-[#37192C] overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="size-full rounded-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center rounded-full bg-[#37192C] text-[#FFF3C5] font-black text-lg">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -end-1 grid size-5 place-items-center rounded-full bg-[#37192C] text-[#FFF3C5] cursor-pointer shadow">
                <Camera size={11} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div>
              <h3 className="font-black text-sm text-[#37192C]">{user.name}</h3>
              <p className="text-[11px] font-mono text-[#37192C]/60">@{user.username}</p>
            </div>
          </div>
          <button onClick={close} className="grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#37192c]/10 bg-white text-center">
          <button
            onClick={() => setTab('fav')}
            className={'flex-1 py-3 flex justify-center items-center gap-1 border-b-2 text-xs font-bold transition ' + (tab === 'fav' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
          >
            <Heart size={16} />
            <span>علاقه‌مندی‌ها</span>
          </button>
          <button
            onClick={() => setTab('cart')}
            className={'flex-1 py-3 flex justify-center items-center gap-1 border-b-2 text-xs font-bold transition ' + (tab === 'cart' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
          >
            <ShoppingBag size={16} />
            <span>سبد خرید</span>
          </button>
          <button
            onClick={() => setTab('profile')}
            className={'flex-1 py-3 flex justify-center items-center gap-1 border-b-2 text-xs font-bold transition ' + (tab === 'profile' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
          >
            <UserCheck size={16} />
            <span>اطلاعات</span>
          </button>
          <button
            onClick={() => setTab('orders')}
            className={'flex-1 py-3 flex justify-center items-center gap-1 border-b-2 text-xs font-bold transition ' + (tab === 'orders' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
          >
            <Clock size={16} />
            <span>وضعیت سفارش</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'fav' && (
            <div>
              {wishlist.length ? (
                <div className="space-y-3">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-[#37192c]/10 shadow-sm">
                      <img src={item.image} alt={item.name} className="size-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold text-[#37192C]">{item.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px]">
                          <span className="font-black text-[#37192C]">{money(item.price)} تومان</span>
                          {item.oldPrice && <del className="text-[#37192C]/40 text-[10px]">{money(item.oldPrice)}</del>}
                        </div>
                      </div>
                      <button
                        onClick={() => openProduct(item)}
                        className="rounded-full bg-[#FFF3C5] px-3 py-1.5 text-[10px] font-bold text-[#37192C]"
                      >
                        مشاهده
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#37192C]/60">لیست علاقه‌مندی‌های شما خالی است.</div>
              )}
            </div>
          )}

          {tab === 'cart' && (
            <div>
              {cart.length ? (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto pe-1">
                    {cart.map((item, idx) => (
                      <div
                        key={item.id + '-' + idx}
                        onClick={() => openProduct(item)}
                        className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-[#37192c]/10 shadow-sm cursor-pointer hover:border-[#37192C] transition"
                      >
                        <img src={item.image} alt={item.name} className="size-14 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-bold text-[#37192C]">{item.name}</p>
                          <p className="mt-1 text-[11px] font-black text-[#37192C]">{money(item.price)} تومان</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCart((c) => c.filter((_, index) => index !== idx));
                          }}
                          className="text-rose-600 p-1 hover:bg-rose-50 rounded-full"
                          title="حذف"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#37192c]/10 pt-3">
                    <span className="text-xs font-bold text-[#37192C]">مبلغ کل قابل پرداخت</span>
                    <span className="font-black text-[#37192C] text-sm">{money(total)} تومان</span>
                  </div>

                  <button
                    onClick={() => {
                      close();
                      openCheckout();
                    }}
                    className="mt-4 w-full rounded-full bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5] transition hover:bg-[#5c2d4e]"
                  >
                    پرداخت و تکمیل سفارش
                  </button>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-[#37192C]/60">سبد خرید شما خالی است.</div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-4 border border-[#37192c]/10 text-xs space-y-2">
                <div className="flex justify-between border-b border-[#37192c]/5 pb-2">
                  <span className="text-[#37192C]/60">نام:</span>
                  <span className="font-bold text-[#37192C]">{user.name}</span>
                </div>
                <div className="flex justify-between border-b border-[#37192c]/5 pb-2">
                  <span className="text-[#37192C]/60">شماره همراه:</span>
                  <span className="font-bold text-[#37192C]">{user.phone}</span>
                </div>
              </div>

              {/* Boxed Address Section with Cascading Dropdowns */}
              <div className="rounded-2xl bg-white p-4 border border-[#37192c]/10 text-xs">
                <h4 className="font-bold text-[#37192C] mb-3 border-b border-[#37192c]/5 pb-2">اطلاعات آدرس پستی</h4>

                {editingAddress ? (
                  <form onSubmit={handleSaveAddress} className="space-y-3">
                    {/* Country Locked */}
                    <div>
                      <label className="text-[10px] font-bold text-[#37192C]/70">کشور</label>
                      <input
                        type="text"
                        value="ایران (قفل شده)"
                        disabled
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-bold text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    {/* City / State Searchable Dropdown */}
                    <div>
                      <label className="text-[10px] font-bold text-[#37192C]">شهر / استان</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          const cityObj = iranLocations.find((c) => c.city === e.target.value);
                          if (cityObj) {
                            setSelectedDistrict(cityObj.districts[0].name);
                            setSelectedNeighborhood(cityObj.districts[0].neighborhoods[0]);
                          }
                        }}
                        className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                      >
                        {iranLocations.map((loc) => (
                          <option key={loc.city} value={loc.city}>{loc.city}</option>
                        ))}
                      </select>
                    </div>

                    {/* District Dropdown based on City */}
                    <div>
                      <label className="text-[10px] font-bold text-[#37192C]">شهرستان / منطقه</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value);
                          const distObj = activeCityData.districts.find((d) => d.name === e.target.value);
                          if (distObj) setSelectedNeighborhood(distObj.neighborhoods[0]);
                        }}
                        className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                      >
                        {activeCityData.districts.map((d) => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Neighborhood Dropdown */}
                    <div>
                      <label className="text-[10px] font-bold text-[#37192C]">نام محله</label>
                      <select
                        value={selectedNeighborhood}
                        onChange={(e) => setSelectedNeighborhood(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                      >
                        {activeDistrictData.neighborhoods.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Detailed Address Textarea */}
                    <div>
                      <label className="text-[10px] font-bold text-[#37192C]">آدرس تکمیلی</label>
                      <textarea
                        value={user.addressDetail}
                        onChange={(e) => setUser({ ...user, addressDetail: e.target.value })}
                        rows={2}
                        className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                      />
                    </div>

                    <button type="submit" className="w-full rounded-full bg-[#37192C] py-2 text-xs font-bold text-[#FFF3C5]">
                      ذخیره آدرس
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2 leading-5">
                    <p><span className="text-[#37192C]/60">شهر:</span> {user.city}</p>
                    <p><span className="text-[#37192C]/60">منطقه/شهرستان:</span> {user.district}</p>
                    <p><span className="text-[#37192C]/60">محله:</span> {user.neighborhood}</p>
                    <p><span className="text-[#37192C]/60">آدرس تکمیلی:</span> {user.addressDetail}</p>
                    <button
                      onClick={() => setEditingAddress(true)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FFF3C5] py-2 text-xs font-bold text-[#37192C]"
                    >
                      <Edit size={14} /> ویرایش آدرس
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => openOrderDetails(order)}
                  className="rounded-2xl bg-white p-4 border border-[#37192c]/10 text-xs shadow-sm cursor-pointer hover:border-[#37192C] transition"
                >
                  <div className="flex items-center justify-between border-b border-[#37192c]/5 pb-2">
                    <span className="font-mono font-bold text-[#37192C]">{order.id}</span>
                    <span className={'rounded-full px-2.5 py-0.5 text-[10px] font-bold ' + (order.status === 'تحویل داده شده' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-[#37192C]/70">
                    <span>تاریخ: {order.date}</span>
                    <span className="font-bold text-[#37192C]">{money(order.price)} تومان</span>
                  </div>
                  <p className="mt-2 text-[10px] text-[#8b627e] font-bold">جهت مشاهده جزئیات کلیک کنید...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Authentication Modal (Sign In / Registration / OTP)
function AuthModal({
  mode,
  close,
  onSuccess,
  switchMode
}: {
  mode: 'login' | 'register';
  close: () => void;
  onSuccess: (u: UserState) => void;
  switchMode: (m: 'login' | 'register') => void;
}) {
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [phoneDigits, setPhoneDigits] = useState<string[]>(Array(11).fill(''));
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [duplicateError, setDuplicateError] = useState('');

  // Example existing registered phone for validation testing
  const existingPhones = ['09123456789', '۰۹۱۲۳۴۵۶۷۸۹'];

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newDigits = [...phoneDigits];
    newDigits[index] = val;
    setPhoneDigits(newDigits);

    // Auto focus next input
    if (val && index < 10) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = phoneDigits.join('');

    if (mode === 'register') {
      if (existingPhones.includes(fullPhone)) {
        setDuplicateError('شماره شما تکراری است، باید وارد شوید');
        return;
      }
    }

    setDuplicateError('');
    setStep('otp');
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = phoneDigits.join('') || '۰۹۱۲۳۴۵۶۷۸۹';
    onSuccess({
      isLoggedIn: true,
      name: fullName || 'کاربر جدید آورا',
      username: 'aura_user',
      phone: fullPhone,
      avatar: null,
      country: 'ایران',
      city: 'تهران',
      district: 'منطقه ۱',
      neighborhood: 'نیاوران',
      addressDetail: 'خیابان ولیعصر',
      postalCode: '۱۹۶۸۷۱۲۳۴۵'
    });
  };

  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-sm rounded-[2rem] bg-[#fffaf0] p-6 shadow-2xl relative">
        <button onClick={close} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-white text-[#37192C]">
          <X size={16} />
        </button>

        <div className="text-center">
          <div className="brand-font text-2xl font-black text-[#37192C]">AuraVibe</div>
          <h3 className="mt-2 text-base font-black text-[#37192C]">
            {mode === 'login' ? 'ورود به حساب کاربری' : 'ثبت نام در آورا استایل'}
          </h3>
        </div>

        {step === 'info' ? (
          <form onSubmit={handleInfoSubmit} className="mt-5 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-[#37192C]">نام و نام خانوادگی</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-[#37192C] block mb-1">
                شماره همراه (۱۱ رقم از چپ به راست)
              </label>
              <div className="flex justify-between gap-1" dir="ltr">
                {phoneDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`digit-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    className="size-7 sm:size-8 text-center rounded-lg border border-[#37192c]/20 bg-white text-xs font-bold outline-none focus:border-[#37192C]"
                  />
                ))}
              </div>
            </div>

            {duplicateError && (
              <div className="rounded-xl bg-rose-100 p-2.5 text-center text-xs font-bold text-rose-800">
                {duplicateError}
                <button
                  type="button"
                  onClick={() => { switchMode('login'); setDuplicateError(''); }}
                  className="mt-1 block mx-auto underline text-[11px]"
                >
                  انتقال به بخش ورود
                </button>
              </div>
            )}

            <button type="submit" className="w-full rounded-full bg-[#37192C] py-2.5 text-xs font-bold text-[#FFF3C5]">
              دریافت کد تایید اس‌ام‌اس
            </button>

            <div className="text-center text-xs">
              {mode === 'login' ? (
                <p>
                  حساب کاربری ندارید؟{' '}
                  <button type="button" onClick={() => switchMode('register')} className="font-bold underline text-[#37192C]">
                    ثبت نام کنید
                  </button>
                </p>
              ) : (
                <p>
                  قبلاً ثبت نام کرده‌اید؟{' '}
                  <button type="button" onClick={() => switchMode('login')} className="font-bold underline text-[#37192C]">
                    وارد شوید
                  </button>
                </p>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="mt-5 space-y-4">
            <div className="text-center">
              <p className="text-xs text-[#37192C]/80">کد تایید ارسال شده به شماره همراه خود را وارد کنید:</p>
            </div>
            <input
              type="text"
              placeholder="کد ۴ رقمی"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-[#37192c]/20 bg-white py-2.5 outline-none"
              required
            />
            <button type="submit" className="w-full rounded-full bg-[#37192C] py-2.5 text-xs font-bold text-[#FFF3C5]">
              تایید و ورود به اکانت
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Complete Checkout Invoice Modal ("فاکتور پرداخت و تکمیل سفارش")
function CheckoutInvoiceModal({
  cart,
  total,
  user,
  close,
  onPaymentComplete
}: {
  cart: Product[];
  total: number;
  user: UserState;
  close: () => void;
  onPaymentComplete: () => void;
}) {
  const shippingFee = 35000;
  const grandTotal = total + shippingFee;

  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={close} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <X size={16} />
        </button>

        <div className="border-b border-[#37192c]/10 pb-4 text-center">
          <span className="label">AuraVibe Invoice</span>
          <h2 className="text-xl font-black text-[#37192C]">فاکتور پرداخت و تکمیل سفارش</h2>
        </div>

        {/* Customer & Delivery Summary */}
        <div className="mt-4 rounded-xl bg-[#fffaf0] p-4 text-xs space-y-2 border border-[#37192c]/10">
          <p><span className="text-[#37192C]/60">گیرنده:</span> <strong className="text-[#37192C]">{user.name}</strong></p>
          <p><span className="text-[#37192C]/60">شماره تماس:</span> <strong className="text-[#37192C]">{user.phone}</strong></p>
          <p><span className="text-[#37192C]/60">آدرس تحویل:</span> <strong className="text-[#37192C]">{user.city}، {user.district}، {user.neighborhood}، {user.addressDetail}</strong></p>
        </div>

        {/* Itemized Breakdown */}
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-bold text-[#37192C]">اقلام فاکتور ({cart.length} کالا):</h4>
          <div className="max-h-40 overflow-y-auto space-y-2 pe-1">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs border-b border-[#37192c]/5 pb-2">
                <span className="font-semibold text-[#37192C] truncate max-w-[220px]">{item.name}</span>
                <span className="font-black text-[#37192C]">{money(item.price)} تومان</span>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Total */}
        <div className="mt-4 rounded-xl bg-[#FFF3C5]/40 p-4 text-xs space-y-2">
          <div className="flex justify-between text-[#37192C]/80">
            <span>مجموع اقلام:</span>
            <span>{money(total)} تومان</span>
          </div>
          <div className="flex justify-between text-[#37192C]/80">
            <span>هزینه پست پیشتاز:</span>
            <span>{money(shippingFee)} تومان</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#37192c]/10 font-black text-sm text-[#37192C]">
            <span>مبلغ نهایی قابل پرداخت:</span>
            <span>{money(grandTotal)} تومان</span>
          </div>
        </div>

        <button
          onClick={() => {
            alert('پرداخت موفقیت‌آمیز بود! سفارش شما ثبت گردید.');
            onPaymentComplete();
          }}
          className="mt-5 w-full rounded-full bg-[#37192C] py-3.5 text-xs font-bold text-[#FFF3C5] transition hover:bg-[#5c2d4e]"
        >
          اتصال به درگاه و پرداخت فاکتور
        </button>
      </div>
    </div>
  );
}

// Order Status Details Modal
function OrderDetailsModal({
  order,
  close,
  openProduct
}: {
  order: Order;
  close: () => void;
  openProduct: (p: Product) => void;
}) {
  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={close} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <X size={16} />
        </button>

        <div className="border-b border-[#37192c]/10 pb-3">
          <span className="label">جزئیات کامل سفارش</span>
          <h3 className="text-lg font-black font-mono text-[#37192C]">{order.id}</h3>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-[#37192C]/60">وضعیت سفارش:</span>
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 font-bold text-emerald-800">{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#37192C]/60">تاریخ ثبت:</span>
            <span className="font-bold text-[#37192C]">{order.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#37192C]/60">روش ارسال:</span>
            <span className="font-bold text-[#37192C]">{order.shippingMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#37192C]/60">تعداد اقلام:</span>
            <span className="font-bold text-[#37192C]">{order.items.length} قلم</span>
          </div>
        </div>

        {/* Ordered items (Clicking item opens product details modal) */}
        <div className="mt-5 border-t border-[#37192c]/10 pt-3">
          <h4 className="text-xs font-bold text-[#37192C] mb-3">اقلام خریداری شده (روی محصول کلیک کنید):</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => { close(); openProduct(item); }}
                className="flex items-center gap-3 rounded-xl bg-[#fffaf0] p-2.5 border border-[#37192c]/10 cursor-pointer hover:border-[#37192C]"
              >
                <img src={item.image} alt={item.name} className="size-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-[#37192C]">{item.name}</p>
                  <p className="text-[11px] font-black text-[#37192C]">{money(item.price)} تومان</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#37192c]/10 flex justify-between items-center text-xs">
          <span className="font-bold text-[#37192C]">مبلغ کل:</span>
          <span className="font-black text-sm text-[#37192C]">{money(order.price)} تومان</span>
        </div>
      </div>
    </div>
  );
}

// Drawer Section Menu
function SectionMenu({
  sections,
  close,
  go
}: {
  sections: { id: string; label: string }[];
  close: () => void;
  go: (id: string) => void;
}) {
  return (
    <>
      <div className="menu-drawer-backdrop" onClick={close} />
      <div className="menu-drawer" data-testid="section-menu">
        <div className="flex items-center justify-between pb-3 border-b border-[#37192c]/10">
          <span className="brand-font text-xl text-[#37192C]">AuraVibe</span>
          <button onClick={close} className="grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]" aria-label="بستن">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 space-y-1.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => go(section.id)}
              className="menu-link"
              data-testid={'menu-link-' + section.id}
            >
              <span>{section.label}</span>
              <ChevronLeft size={16} className="text-[#37192C]/40" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
