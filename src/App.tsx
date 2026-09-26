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
  Image,
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
  Sparkles
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

type BannerItem = {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
};

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

type Role = {
  id: string;
  name: string;
  permissions: string[];
};

type AuditLog = {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
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

  // Dynamic State for Managed Datasets
  const [productsNewest, setProductsNewest] = useState<Product[]>(() => generateProducts(10, 'محصول تازه', 'جدیدترین‌ها', 150000));
  const [productsBestSellers, setProductsBestSellers] = useState<Product[]>(() => generateProducts(10, 'پرفروش آورا', 'پرفروش‌ترین‌ها', 210000));
  const [productsSpecial, setProductsSpecial] = useState<Product[]>(() => generateProducts(10, 'آیتم ویژه', 'تخفیف ویژه', 170000, true));
  const [productsWatches, setProductsWatches] = useState<Product[]>(() => generateProducts(10, 'ساعت زنانه آورا', 'ساعت', 390000, true));

  const [banners, setBanners] = useState<BannerItem[]>([
    { id: 1, eyebrow: 'دست‌ساز، برای تو', title: 'لطافتِ کوچکِ هر روز', subtitle: 'اکسسوری‌هایی که با رنگ و جزئیاتشان، حال خوب می‌سازند.', image: satinImage },
    { id: 2, eyebrow: 'NEW DROP', title: 'درخشش آرام مروارید', subtitle: 'مجموعه‌ای ظریف برای قرارهای خاطره‌انگیز تو.', image: jewelryImage },
    { id: 3, eyebrow: 'AURAVIBE EDIT', title: 'یاسی، شیری، رویایی', subtitle: 'جزئیات کوچک، امضای استایل شخصی تو هستند.', image: satinImage },
    { id: 4, eyebrow: 'هدیه‌ای برای خودت', title: 'یک انتخاب دوست‌داشتنی', subtitle: 'برای تو، برای یک لبخند، برای همین امروز.', image: jewelryImage },
  ]);

  // Active View State: 'admin' | 'home' | category name | section name | 'journal'
  const [activeView, setActiveView] = useState<string>('home');

  // User State
  const [user, setUser] = useState<UserState>({
    isLoggedIn: true,
    name: 'آرتین کریمی (ادمین)',
    username: 'admin_aura',
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
      items: [productsNewest[0] || generateProducts(1, 'محصول', 'جدید', 150000)[0], productsBestSellers[0] || generateProducts(1, 'محصول', 'جدید', 150000)[0]],
      shippingMethod: 'پست پیشتاز (سراسر کشور)'
    },
    {
      id: 'ORD-9412',
      date: '۱۴۰۳/۰۵/۰۲',
      price: 289000,
      status: 'در حال پردازش',
      items: [productsWatches[0] || generateProducts(1, 'ساعت', 'ساعت', 300000)[0]],
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
    if (banners.length === 0) return;
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % banners.length), 4800);
    return () => window.clearInterval(timer);
  }, [banners.length]);

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

  const menuSections = [
    { id: 'admin', label: '⚡ پیشخوان مدیریتی (Admin Panel)' },
    { id: 'home', label: 'صفحه اصلی سایت' },
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

      {/* Render Admin Panel View if activeView === 'admin' */}
      {activeView === 'admin' ? (
        <AdminDashboard
          goHome={() => handleNavClick('home')}
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
        />
      ) : (
        <>
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
              {banners.length > 0 && (
                <section className="relative mt-10 overflow-hidden" data-testid="banner-carousel">
                  <div className="banner-shell" style={{ transform: `translateX(-${(bannerIndex % banners.length) * 100}%)` }}>
                    {banners.map((banner) => (
                      <article className="relative w-full shrink-0 overflow-hidden" key={banner.id}>
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
                  <button onClick={() => setBannerIndex((bannerIndex + banners.length - 1) % banners.length)} className="carousel-arrow start-4" aria-label="بنر قبل">
                    <ChevronRight />
                  </button>
                  <button onClick={() => setBannerIndex((bannerIndex + 1) % banners.length)} className="carousel-arrow end-4" aria-label="بنر بعد">
                    <ChevronLeft />
                  </button>
                  <div className="absolute bottom-6 start-1/2 flex -translate-x-1/2 gap-2">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setBannerIndex(index)}
                        className={'h-2.5 rounded-full transition-all ' + (index === (bannerIndex % banners.length) ? 'w-7 bg-[#FFF3C5]' : 'w-2.5 bg-white/60')}
                        aria-label={`بنر ${index + 1}`}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Home Section Collections */}
              <div id="collection" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <ProductSection
                  title="جدیدترین‌ها"
                  intro="تازه‌ترین‌های آورا استایل"
                  items={productsNewest}
                  open={setSelectedProduct}
                  onViewMore={() => handleNavClick('جدیدترین‌ها')}
                  testid="new-products"
                />
                <ProductSection
                  title="پرفروش‌ترین‌ها"
                  intro="محبوب‌ترین انتخاب‌های کاربران"
                  items={productsBestSellers}
                  open={setSelectedProduct}
                  onViewMore={() => handleNavClick('پرفروش‌ترین‌ها')}
                  testid="best-sellers"
                />
                <ProductSection
                  title="تخفیف ویژه"
                  intro="پیشنهادهای استثنایی و محدود"
                  items={productsSpecial}
                  open={setSelectedProduct}
                  onViewMore={() => handleNavClick('تخفیف ویژه')}
                  testid="special-offers"
                />
                <ProductSection
                  title="ساعت"
                  intro="کالکشن ساعت‌های ظریف و خاص"
                  items={productsWatches}
                  open={setSelectedProduct}
                  onViewMore={() => handleNavClick('ساعت')}
                  testid="watches"
                />
              </div>

              {/* Social Banner */}
              <section className="mx-auto my-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="social-banner">
                <SocialBanner />
              </section>

              {/* FAQ Section */}
              <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="faq-section">
                <FaqSection />
              </section>

              {/* Trust Section */}
              <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="trust-section">
                <TrustSectionHorizontal />
              </section>

              {/* Journal Section */}
              <section id="journal" className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="journal-section">
                <JournalSection articles={sampleArticles.slice(0, 4)} onViewMore={() => handleNavClick('journal')} />
              </section>
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
                generateProducts(12, activeView, activeView, 140000)
              }
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
              </div>
            </div>
          </footer>

          {/* Support Button */}
          <button className="support-button" onClick={() => setSupportOpen(true)} data-testid="support-button" aria-label="پشتیبانی">
            <Headphones size={22} />
          </button>

          {/* Support Modal */}
          {supportOpen && <SupportModal close={() => setSupportOpen(false)} />}

          {/* Product Details Modal */}
          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              close={() => setSelectedProduct(null)}
              add={addToCart}
              toggleWish={toggleWishlist}
              isWished={wishlist.some((w) => w.id === selectedProduct.id)}
              allProducts={[...productsNewest, ...productsBestSellers, ...productsSpecial, ...productsWatches]}
              openProduct={setSelectedProduct}
            />
          )}

          {/* Drawer Section Menu */}
          {menuOpen && <SectionMenu sections={menuSections} close={() => setMenuOpen(false)} go={handleNavClick} />}

          {/* Search Modal */}
          {searchOpen && <SearchModal close={() => setSearchOpen(false)} openProduct={setSelectedProduct} />}

          {/* User Account / Cart Modal */}
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

          {/* Auth Modal */}
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

          {/* Order Details Modal */}
          {selectedOrderDetails && (
            <OrderDetailsModal
              order={selectedOrderDetails}
              close={() => setSelectedOrderDetails(null)}
              openProduct={setSelectedProduct}
            />
          )}

          {/* Bottom Navigation */}
          <nav className="bottom-nav" dir="ltr" data-testid="bottom-nav">
            <button className="bottom-nav-item" onClick={() => handleNavClick('home')} aria-label="خانه">
              <Home size={22} />
            </button>
            <button className="bottom-nav-item" onClick={() => setSearchOpen(true)} aria-label="جستجو">
              <Search size={22} />
            </button>
            <button className="bottom-nav-item" onClick={() => handleNavClick('admin')} aria-label="مدیریت">
              <LayoutDashboard size={22} />
            </button>
            <button className="bottom-nav-item" onClick={() => setAccountView({ tab: user.isLoggedIn ? 'profile' : 'cart' })} aria-label="حساب کاربری">
              <UserRound size={22} />
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

// ----------------------------------------------------------------------
// ADMIN DASHBOARD COMPONENT (INSTAGRAM STYLED + VAZIRMATN FONT + BRAND COLORS)
// ----------------------------------------------------------------------
function AdminDashboard({
  goHome,
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
  setOrders
}: {
  goHome: () => void;
  productsNewest: Product[];
  setProductsNewest: React.Dispatch<React.SetStateAction<Product[]>>;
  productsBestSellers: Product[];
  setProductsBestSellers: React.Dispatch<React.SetStateAction<Product[]>>;
  productsSpecial: Product[];
  setProductsSpecial: React.Dispatch<React.SetStateAction<Product[]>>;
  productsWatches: Product[];
  setProductsWatches: React.Dispatch<React.SetStateAction<Product[]>>;
  banners: BannerItem[];
  setBanners: React.Dispatch<React.SetStateAction<BannerItem[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'banners' | 'orders' | 'users' | 'support' | 'analytics' | 'seo' | 'settings' | 'audit'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal State for Products
  const [productModal, setProductModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pOldPrice, setPOldPrice] = useState('');
  const [pCategory, setPCategory] = useState('گردنبند');
  const [pDescription, setPDescription] = useState('');
  const [isNewestTag, setIsNewestTag] = useState(true);
  const [isBestSellerTag, setIsBestSellerTag] = useState(false);
  const [isSpecialOfferTag, setIsSpecialOfferTag] = useState(false);
  const [isWatchTag, setIsWatchTag] = useState(false);

  // Modal State for Banners
  const [bannerModal, setBannerModal] = useState(false);
  const [bEyebrow, setBEyebrow] = useState('');
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', user: 'مدیر کل (آرتین)', action: 'ویرایش محصول', target: 'ساعت زنانه آورا', timestamp: '۱۰ دقیقه پیش', details: 'تغییر قیمت به ۳۹۰,۰۰۰ تومان' },
    { id: '2', user: 'مدیر کل (آرتین)', action: 'تغییر وضعیت سفارش', target: 'ORD-9821', timestamp: '۲۵ دقیقه پیش', details: 'تغییر به تحویل داده شده' },
    { id: '3', user: 'پشتیبان سیستم', action: 'پاسخ به تیکت', target: 'تیکت #۴۵۲', timestamp: '۱ ساعت پیش', details: 'پاسخ ارسال شد' }
  ]);

  const addAuditLog = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: String(Date.now()),
      user: 'مدیر سیستم (آرتین)',
      action,
      target,
      timestamp: 'هم‌اکنون',
      details
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Open Product Add/Edit Modal
  const openAddProductModal = (prod: Product | null = null) => {
    if (prod) {
      setPName(prod.name);
      setPPrice(String(prod.price));
      setPOldPrice(prod.oldPrice ? String(prod.oldPrice) : '');
      setPCategory(prod.category);
      setPDescription(prod.description);
      setIsNewestTag(productsNewest.some((p) => p.id === prod.id));
      setIsBestSellerTag(productsBestSellers.some((p) => p.id === prod.id));
      setIsSpecialOfferTag(productsSpecial.some((p) => p.id === prod.id));
      setIsWatchTag(productsWatches.some((p) => p.id === prod.id));
      setProductModal({ open: true, product: prod });
    } else {
      setPName('');
      setPPrice('');
      setPOldPrice('');
      setPCategory('گردنبند');
      setPDescription('محصول دست‌ساز آورا استایل با بهترین کیفیت و رنگ‌بندی خاص.');
      setIsNewestTag(true);
      setIsBestSellerTag(false);
      setIsSpecialOfferTag(false);
      setIsWatchTag(false);
      setProductModal({ open: true, product: null });
    }
  };

  // Save Product Handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) return;

    const numPrice = Number(pPrice);
    const numOldPrice = pOldPrice ? Number(pOldPrice) : undefined;

    const newProd: Product = {
      id: productModal.product ? productModal.product.id : Math.floor(100000 + Math.random() * 899999),
      name: pName,
      category: pCategory,
      price: numPrice,
      oldPrice: numOldPrice,
      image: pCategory === 'ساعت' ? watchImage : satinImage,
      badge: isSpecialOfferTag ? 'تخفیف ویژه' : (isNewestTag ? 'جدید' : undefined),
      colors: ['#37192C', '#FFF3C5'],
      description: pDescription
    };

    // Update or Insert across tags
    if (isNewestTag) {
      setProductsNewest((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
    } else {
      setProductsNewest((prev) => prev.filter((p) => p.id !== newProd.id));
    }

    if (isBestSellerTag) {
      setProductsBestSellers((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
    } else {
      setProductsBestSellers((prev) => prev.filter((p) => p.id !== newProd.id));
    }

    if (isSpecialOfferTag) {
      setProductsSpecial((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
    } else {
      setProductsSpecial((prev) => prev.filter((p) => p.id !== newProd.id));
    }

    if (isWatchTag || pCategory === 'ساعت') {
      setProductsWatches((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
    } else {
      setProductsWatches((prev) => prev.filter((p) => p.id !== newProd.id));
    }

    addAuditLog(productModal.product ? 'ویرایش محصول' : 'افزودن محصول', newProd.name, `قیمت: ${money(numPrice)} تومان`);
    setProductModal({ open: false, product: null });
  };

  // Delete Product Handler
  const handleDeleteProduct = (id: number, name: string) => {
    if (confirm(`آیا از حذف محصول "${name}" اطمینان دارید؟`)) {
      setProductsNewest((p) => p.filter((x) => x.id !== id));
      setProductsBestSellers((p) => p.filter((x) => x.id !== id));
      setProductsSpecial((p) => p.filter((x) => x.id !== id));
      setProductsWatches((p) => p.filter((x) => x.id !== id));
      addAuditLog('حذف محصول', name, 'محصول از سیستم حذف شد');
    }
  };

  // Save Banner Handler
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle) return;

    const newBanner: BannerItem = {
      id: Date.now(),
      eyebrow: bEyebrow || 'AURA EDIT',
      title: bTitle,
      subtitle: bSubtitle || 'توضیحات بنر جدید آورا وایب',
      image: satinImage
    };

    setBanners([newBanner, ...banners]);
    addAuditLog('افزودن بنر', bTitle, 'بنر جدید به اسلایدر صفحه اصلی اضافه شد');
    setBannerModal(false);
  };

  const handleDeleteBanner = (id: number) => {
    if (confirm('آیا این بنر حذف شود؟')) {
      setBanners(banners.filter((b) => b.id !== id));
      addAuditLog('حذف بنر', `بنر شناسه ${id}`, 'بنر از صفحه اصلی برداشته شد');
    }
  };

  // Status Change for Order
  const handleOrderStatusChange = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    addAuditLog('تغییر وضعیت سفارش', orderId, `وضعیت به "${status}" تغییر یافت`);
  };

  // Master product list
  const allAdminProducts = useMemo(() => {
    const map = new Map<number, Product>();
    [...productsNewest, ...productsBestSellers, ...productsSpecial, ...productsWatches].forEach((p) => {
      map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [productsNewest, productsBestSellers, productsSpecial, productsWatches]);

  return (
    <div className="flex min-h-screen bg-[#fffaf0] text-[#37192C]">
      {/* Sidebar - Modular RTL Layout */}
      <aside className={'sticky top-0 h-screen transition-all duration-300 border-e border-[#37192c]/10 bg-white flex flex-col justify-between shadow-sm z-20 ' + (sidebarCollapsed ? 'w-20' : 'w-64')}>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#37192c]/10">
            {!sidebarCollapsed && (
              <div>
                <div className="brand-font text-xl font-black text-[#37192C]">AuraVibe</div>
                <span className="text-[10px] font-bold text-[#8b627e]">پیشخوان مدیریتی ۳۶۰</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="grid size-8 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'داشبورد اصلی', icon: <LayoutDashboard size={18} /> },
              { id: 'products', label: 'مدیریت محصولات', icon: <Box size={18} /> },
              { id: 'banners', label: 'مدیریت بنرها', icon: <Image size={18} /> },
              { id: 'orders', label: 'مدیریت سفارشات', icon: <ShoppingBag size={18} /> },
              { id: 'users', label: 'کاربران و نقش‌ها (RBAC)', icon: <Users size={18} /> },
              { id: 'support', label: 'تیکت‌های پشتیبانی', icon: <MessageSquare size={18} /> },
              { id: 'analytics', label: 'گزارشات و آمار فروش', icon: <BarChart3 size={18} /> },
              { id: 'seo', label: 'تنظیمات سئو (SEO)', icon: <Globe size={18} /> },
              { id: 'settings', label: 'تنظیمات عمومی سایت', icon: <Settings size={18} /> },
              { id: 'audit', label: 'سوابق ادمین (Audit Logs)', icon: <Activity size={18} /> },
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

        {/* Back to main website button */}
        <div className="p-3 border-t border-[#37192c]/10">
          <button
            onClick={goHome}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF3C5] py-2.5 text-xs font-black text-[#37192C] hover:bg-[#ffe79a] transition"
          >
            <ArrowLeft size={16} />
            {!sidebarCollapsed && <span>بازگشت به فروشگاه</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#37192c]/10 pb-5">
          <div>
            <h1 className="text-2xl font-black text-[#37192C]">
              {activeTab === 'dashboard' && 'داشبورد کنترل مرکزی آورا وایب'}
              {activeTab === 'products' && 'مدیریت و کنترل کامل محصولات'}
              {activeTab === 'banners' && 'مدیریت بنرهای اسلایدر اصلی'}
              {activeTab === 'orders' && 'مدیریت سفارشات خریداران'}
              {activeTab === 'users' && 'مدیریت کاربران و دسترسی‌ها (RBAC)'}
              {activeTab === 'support' && 'تیکت‌ها و پیام‌های مشتریان'}
              {activeTab === 'analytics' && 'گزارش‌های جامع فروش و درآمد'}
              {activeTab === 'seo' && 'تنظیمات موتورهای جستجو و SEO'}
              {activeTab === 'settings' && 'تنظیمات کلی و ظاهر فروشگاه'}
              {activeTab === 'audit' && 'سوابق و لوگ‌های امنیتی ادمین'}
            </h1>
            <p className="mt-1 text-xs text-[#8b627e]">پنل مدیریت حرفه‌ای یکپارچه با کدهای اصلی سایت</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#FFF3C5] px-4 py-1.5 text-xs font-bold text-[#37192C]">
              نقش: مدیر کل آورا
            </span>
            <button onClick={goHome} className="rounded-full bg-[#37192C] px-4 py-1.5 text-xs font-bold text-[#FFF3C5]">
              مشاهده سایت خریدار
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'dashboard' && (
          <div className="mt-6 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#37192C]/60">کل درآمد فروش</span>
                  <div className="grid size-9 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]">
                    <BarChart3 size={18} />
                  </div>
                </div>
                <h3 className="mt-3 text-2xl font-black text-[#37192C]">۱۲,۴۵۰,۰۰۰ تومان</h3>
                <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">↑ ۱۲.۵٪ نسبت به ماه قبل</span>
              </div>

              <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#37192C]/60">سفارشات جدید</span>
                  <div className="grid size-9 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <h3 className="mt-3 text-2xl font-black text-[#37192C]">{orders.length} سفارش</h3>
                <span className="mt-1 inline-block text-[11px] font-bold text-amber-600">نیازمند پردازش و ارسال</span>
              </div>

              <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#37192C]/60">تعداد محصولات فعال</span>
                  <div className="grid size-9 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]">
                    <Box size={18} />
                  </div>
                </div>
                <h3 className="mt-3 text-2xl font-black text-[#37192C]">{allAdminProducts.length} کالا</h3>
                <span className="mt-1 inline-block text-[11px] font-bold text-[#8b627e]">در کاتالوگ فروشگاه</span>
              </div>

              <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#37192C]/60">بنرهای فعال</span>
                  <div className="grid size-9 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]">
                    <Image size={18} />
                  </div>
                </div>
                <h3 className="mt-3 text-2xl font-black text-[#37192C]">{banners.length} اسلاید</h3>
                <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">در حال نمایش در صفحه اصلی</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black text-[#37192C]">دسترسی‌های سریع ادمین (Quick Actions)</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={() => openAddProductModal(null)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition"
                >
                  <PlusCircle size={16} /> افزودن محصول جدید
                </button>
                <button
                  onClick={() => setBannerModal(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FFF3C5] py-3 text-xs font-bold text-[#37192C] hover:bg-[#ffe79a] transition"
                >
                  <Image size={16} /> افزودن بنر تبلیغاتی
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 py-3 text-xs font-bold text-[#37192C] hover:bg-[#FFF3C5] transition"
                >
                  <ShoppingBag size={16} /> لیست سفارش‌ها
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 py-3 text-xs font-bold text-[#37192C] hover:bg-[#FFF3C5] transition"
                >
                  <Activity size={16} /> مشاهده سوابق (Audit)
                </button>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-[#37192C]">آخرین سفارشات ثبت شده</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#8b627e] hover:underline">
                  مشاهده همه
                </button>
              </div>
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl bg-[#fffaf0] p-3 text-xs border border-[#37192c]/5">
                    <div>
                      <span className="font-mono font-bold text-[#37192C]">{o.id}</span>
                      <span className="ms-3 text-[#37192C]/60">{o.date}</span>
                    </div>
                    <span className="font-black text-[#37192C]">{money(o.price)} تومان</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-800">{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-[#37192c]/10 shadow-sm">
              <span className="text-xs font-bold text-[#37192C]">
                مجموع محصولات در تمامی سکشن‌ها: {allAdminProducts.length} عدد
              </span>
              <button
                onClick={() => openAddProductModal(null)}
                className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition"
              >
                <Plus size={16} /> افزودن محصول جدید با فیلترهای دقیق
              </button>
            </div>

            {/* Product Table */}
            <div className="rounded-2xl border border-[#37192c]/10 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#fffaf0] border-b border-[#37192c]/10 text-[#37192C] font-black">
                    <tr>
                      <th className="p-4">تصویر</th>
                      <th className="p-4">نام محصول</th>
                      <th className="p-4">دسته‌بندی</th>
                      <th className="p-4">قیمت اصلی</th>
                      <th className="p-4">قیمت با تخفیف</th>
                      <th className="p-4">سکشن‌های فعال</th>
                      <th className="p-4 text-center">عملیات ادمین</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#37192c]/5">
                    {allAdminProducts.map((p) => {
                      const inNewest = productsNewest.some((x) => x.id === p.id);
                      const inBest = productsBestSellers.some((x) => x.id === p.id);
                      const inSpecial = productsSpecial.some((x) => x.id === p.id);
                      const inWatch = productsWatches.some((x) => x.id === p.id);

                      return (
                        <tr key={p.id} className="hover:bg-[#fffaf0]/60 transition">
                          <td className="p-4">
                            <img src={p.image} alt={p.name} className="size-12 rounded-xl object-cover" />
                          </td>
                          <td className="p-4 font-bold text-[#37192C]">{p.name}</td>
                          <td className="p-4 font-semibold text-[#8b627e]">{p.category}</td>
                          <td className="p-4 font-black text-[#37192C]">{money(p.price)} تومان</td>
                          <td className="p-4">{p.oldPrice ? `${money(p.oldPrice)} تومان` : '-'}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {inNewest && <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">جدیدترین‌ها</span>}
                              {inBest && <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">پرفروش</span>}
                              {inSpecial && <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">تخفیف ویژه</span>}
                              {inWatch && <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">ساعت</span>}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openAddProductModal(p)}
                                className="grid size-8 place-items-center rounded-lg bg-[#FFF3C5] text-[#37192C] hover:bg-[#ffe79a]"
                                title="ویرایش"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="grid size-8 place-items-center rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200"
                                title="حذف"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BANNERS MANAGEMENT */}
        {activeTab === 'banners' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#37192c]/10 shadow-sm">
              <span className="text-xs font-bold text-[#37192C]">مدیریت بنرهای اسلایدر صفحه اصلی</span>
              <button
                onClick={() => setBannerModal(true)}
                className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition"
              >
                <Plus size={16} /> افزودن بنر جدید
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {banners.map((banner) => (
                <div key={banner.id} className="relative overflow-hidden rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
                  <span className="rounded-full bg-[#FFF3C5] px-3 py-1 text-[10px] font-bold text-[#37192C]">
                    {banner.eyebrow}
                  </span>
                  <h3 className="mt-3 text-lg font-black text-[#37192C]">{banner.title}</h3>
                  <p className="mt-1 text-xs text-[#37192C]/70 leading-6">{banner.subtitle}</p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-200"
                    >
                      <Trash2 size={14} /> حذف بنر
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-black text-[#37192C]">مدیریت وضعیت سفارشات مشتریان</h3>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#37192c]/5 pb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#37192C]">{o.id}</span>
                      <span className="ms-3 text-xs text-[#37192C]/60">تاریخ: {o.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#37192C]">تغییر وضعیت:</span>
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusChange(o.id, e.target.value as any)}
                        className="rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-3 py-1.5 text-xs font-bold outline-none"
                      >
                        <option value="در حال پردازش">در حال پردازش</option>
                        <option value="ارسال شده">ارسال شده</option>
                        <option value="تحویل داده شده">تحویل داده شده</option>
                        <option value="لغو شده">لغو شده</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[#37192C]/60">روش ارسال: </span>
                      <span className="font-bold text-[#37192C]">{o.shippingMethod}</span>
                    </div>
                    <div>
                      <span className="text-[#37192C]/60">مبلغ کل: </span>
                      <span className="font-black text-sm text-[#37192C]">{money(o.price)} تومان</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: USERS & RBAC */}
        {activeTab === 'users' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black text-[#37192C] mb-4">مدیریت کاربران و دسترسی‌ها (RBAC)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#fffaf0] p-3 text-xs border border-[#37192c]/5">
                  <div>
                    <strong className="text-[#37192C]">آرتین کریمی (شما)</strong>
                    <p className="text-[11px] text-[#37192C]/60">admin_aura@auravibe.ir</p>
                  </div>
                  <span className="rounded-full bg-[#37192C] px-3 py-1 font-bold text-[#FFF3C5]">مدیر کل (Super Admin)</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#fffaf0] p-3 text-xs border border-[#37192c]/5">
                  <div>
                    <strong className="text-[#37192C]">کارشناس انبار و سفارشات</strong>
                    <p className="text-[11px] text-[#37192C]/60">stock@auravibe.ir</p>
                  </div>
                  <span className="rounded-full bg-[#FFF3C5] px-3 py-1 font-bold text-[#37192C]">مدیر انبار (Store Editor)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-black text-[#37192C]">سوابق و لوگ‌های فعالیت‌های ادمین (Audit Logs)</h3>
            <div className="rounded-2xl border border-[#37192c]/10 bg-white p-4 shadow-sm space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl bg-[#fffaf0] p-3 text-xs border border-[#37192c]/5">
                  <div>
                    <strong className="text-[#37192C]">{log.user}</strong>
                    <span className="ms-2 font-semibold text-[#8b627e]">[{log.action}]</span>
                    <span className="ms-2 font-bold text-[#37192C]">رو: {log.target}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#37192C]/60">{log.details}</span>
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[10px] text-gray-700">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {['support', 'analytics', 'seo', 'settings'].includes(activeTab) && (
          <div className="mt-6 rounded-2xl border border-[#37192c]/10 bg-white p-8 text-center text-xs text-[#37192C]/70">
            ماژول {activeTab.toUpperCase()} فعال و آماده استفاده در ساختار ماژولار است.
          </div>
        )}
      </main>

      {/* Product Modal */}
      {productModal.open && (
        <div className="modal-backdrop p-3">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProductModal({ open: false, product: null })}
              className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-black text-[#37192C] border-b border-[#37192c]/10 pb-3">
              {productModal.product ? 'ویرایش کامل محصول' : 'افزودن محصول جدید'}
            </h3>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#37192C]">نام محصول</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#37192C]">قیمت اصلی (تومان)</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#37192C]">قیمت با تخفیف (اختیاری)</label>
                  <input
                    type="number"
                    value={pOldPrice}
                    onChange={(e) => setPOldPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#37192C]">دسته‌بندی اصلی</label>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                >
                  {categoryList.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="ساعت">ساعت</option>
                </select>
              </div>

              {/* Checkboxes for website sections */}
              <div className="rounded-xl bg-[#fffaf0] p-3 border border-[#37192c]/10 space-y-2">
                <p className="font-bold text-[#37192C]">نمایش در بخش‌های مختلف سایت:</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isNewestTag} onChange={(e) => setIsNewestTag(e.target.checked)} className="accent-[#37192C]" />
                  <span>نمایش در سکشن «جدیدترین‌ها»</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isBestSellerTag} onChange={(e) => setIsBestSellerTag(e.target.checked)} className="accent-[#37192C]" />
                  <span>نمایش در سکشن «پرفروش‌ترین‌ها»</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isSpecialOfferTag} onChange={(e) => setIsSpecialOfferTag(e.target.checked)} className="accent-[#37192C]" />
                  <span>نمایش در سکشن «تخفیف ویژه»</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isWatchTag} onChange={(e) => setIsWatchTag(e.target.checked)} className="accent-[#37192C]" />
                  <span>نمایش در سکشن «ساعت»</span>
                </label>
              </div>

              <div>
                <label className="font-bold text-[#37192C]">توضیحات کامل محصول</label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                />
              </div>

              <button type="submit" className="w-full rounded-full bg-[#37192C] py-3 font-bold text-[#FFF3C5] hover:bg-[#5a2548]">
                ذخیره و به‌روزرسانی محصول
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {bannerModal && (
        <div className="modal-backdrop p-3">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setBannerModal(false)}
              className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-black text-[#37192C] border-b border-[#37192c]/10 pb-3">
              افزودن بنر جدید به صفحه اصلی
            </h3>

            <form onSubmit={handleSaveBanner} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#37192C]">برچسب یا روتیتر (Eyebrow)</label>
                <input
                  type="text"
                  placeholder="مثال: NEW DROP"
                  value={bEyebrow}
                  onChange={(e) => setBEyebrow(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#37192C]">عنوان بنر</label>
                <input
                  type="text"
                  required
                  placeholder="عنوان بنر را وارد کنید"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#37192C]">زیرعنوان / متن تکمیلی</label>
                <input
                  type="text"
                  placeholder="توضیحات بنر"
                  value={bSubtitle}
                  onChange={(e) => setBSubtitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                />
              </div>

              <button type="submit" className="w-full rounded-full bg-[#37192C] py-3 font-bold text-[#FFF3C5] hover:bg-[#5a2548]">
                ذخیره بنر در اسلایدر
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// STOREFRONT COMPONENTS
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
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon">
            <Instagram size={22} />
          </a>
          <a href="https://t.me" target="_blank" rel="noreferrer" className="social-icon">
            <Send size={22} />
          </a>
          <a href="https://ble.ir" target="_blank" rel="noreferrer" className="social-icon p-2">
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

function SocialBanner() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#8b233a] leading-tight">
                  {article.title}
                </h3>
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
    <button onClick={() => open(product)} className="product-card group text-right" data-testid={'product-' + product.id}>
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
          <div className="min-h-[300px] bg-[#f3e7cd] flex items-center justify-center p-4">
            <img src={product.image} alt={product.name} className="max-h-[500px] w-full object-contain rounded-2xl" />
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="label">{product.category}</span>
                {product.badge && (
                  <span className="rounded-full bg-[#FFF3C5] px-3 py-1 text-[11px] font-bold text-[#37192C]">{product.badge}</span>
                )}
              </div>
              <h2 className="mt-2 text-2xl font-black text-[#37192C]">{product.name}</h2>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-black text-[#37192C]">{money(product.price)} تومان</span>
                {product.oldPrice && (
                  <del className="text-sm font-semibold text-[#37192C]/45">{money(product.oldPrice)} تومان</del>
                )}
              </div>

              <p className="mt-4 text-xs sm:text-sm leading-7 text-[#37192C]/80">{product.description}</p>

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

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-[#37192c]/20 bg-white">
                  <button onClick={() => setCount(Math.max(1, count - 1))} className="grid size-10 place-items-center text-[#37192C]">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-[#37192C]">{count}</span>
                  <button onClick={() => setCount(count + 1)} className="grid size-10 place-items-center text-[#37192C]">
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => { for (let i = 0; i < count; i++) add(product); }}
                  className="flex-1 rounded-full bg-[#37192C] py-3.5 text-xs sm:text-sm font-bold text-[#FFF3C5] transition hover:bg-[#5c2d4e]"
                >
                  افزودن به سبد خرید
                </button>

                <button
                  onClick={() => toggleWish(product)}
                  className={'grid size-11 place-items-center rounded-full border border-[#37192c]/20 transition ' + (isWished ? 'bg-rose-100 text-rose-600 border-rose-300' : 'bg-white text-[#37192C]')}
                >
                  <Heart size={20} fill={isWished ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

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
    <div className="support-panel shadow-2xl">
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

function SearchModal({ close, openProduct }: { close: () => void; openProduct: (p: Product) => void }) {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('همه');

  const allProducts = useMemo(() => {
    return generateProducts(10, 'محصول', 'جدید', 150000);
  }, []);

  const filtered = useMemo(() => {
    return allProducts.filter((item) => {
      const matchQuery = item.name.toLowerCase().includes(query.toLowerCase());
      const matchCat = selectedCat === 'همه' || item.category === selectedCat;
      return matchQuery && matchCat;
    });
  }, [allProducts, query, selectedCat]);

  return (
    <div className="modal-backdrop p-0 sm:p-4">
      <div className="h-full w-full max-w-2xl bg-[#fffaf0] sm:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
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
          <button onClick={close} className="grid size-10 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]">
            <X size={20} />
          </button>
        </div>

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
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  return (
    <div className="modal-backdrop p-0 sm:p-3" onClick={close}>
      <div className="h-full w-full max-w-md bg-[#fffaf0] sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#37192c]/10 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-[#37192C] text-[#FFF3C5] font-black grid place-items-center">
              {user.name.charAt(0)}
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

        <div className="flex border-b border-[#37192c]/10 bg-white text-center">
          <button
            onClick={() => setTab('cart')}
            className={'flex-1 py-3 border-b-2 text-xs font-bold transition ' + (tab === 'cart' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
          >
            سبد خرید
          </button>
          <button
            onClick={() => setTab('orders')}
            className={'flex-1 py-3 border-b-2 text-xs font-bold transition ' + (tab === 'orders' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
          >
            سفارشات
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'cart' && (
            <div>
              {cart.length ? (
                <>
                  <div className="space-y-3">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#37192c]/10">
                        <span className="font-bold text-xs text-[#37192C]">{item.name}</span>
                        <span className="font-black text-xs text-[#37192C]">{money(item.price)} تومان</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { close(); openCheckout(); }} className="mt-4 w-full rounded-full bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5]">
                    تکمیل خرید
                  </button>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-[#37192C]/60">سبد خرید شما خالی است.</div>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl bg-white p-4 border border-[#37192c]/10 text-xs">
                  <div className="flex justify-between font-bold text-[#37192C]">
                    <span>{o.id}</span>
                    <span>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthModal({ mode, close, onSuccess, switchMode }: any) {
  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-sm rounded-[2rem] bg-[#fffaf0] p-6 shadow-2xl relative text-center">
        <button onClick={close} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-white text-[#37192C]">
          <X size={16} />
        </button>
        <h3 className="text-base font-black text-[#37192C]">ورود / ثبت‌نام در آورا استایل</h3>
        <button
          onClick={() => onSuccess({ isLoggedIn: true, name: 'کاربر جدید', username: 'user', phone: '09120000000' })}
          className="mt-5 w-full rounded-full bg-[#37192C] py-2.5 text-xs font-bold text-[#FFF3C5]"
        >
          ورود سریع
        </button>
      </div>
    </div>
  );
}

function CheckoutInvoiceModal({ cart, total, user, close, onPaymentComplete }: any) {
  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl relative">
        <button onClick={close} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <X size={16} />
        </button>
        <h2 className="text-xl font-black text-[#37192C] text-center border-b pb-3">فاکتور خرید</h2>
        <div className="my-4 text-xs font-bold text-[#37192C] flex justify-between">
          <span>مبلغ کل:</span>
          <span>{money(total)} تومان</span>
        </div>
        <button onClick={onPaymentComplete} className="w-full rounded-full bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5]">
          پرداخت و تکمیل
        </button>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, close, openProduct }: any) {
  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl relative">
        <button onClick={close} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <X size={16} />
        </button>
        <h3 className="text-lg font-black text-[#37192C]">جزئیات سفارش {order.id}</h3>
      </div>
    </div>
  );
}

function SectionMenu({ sections, close, go }: any) {
  return (
    <>
      <div className="menu-drawer-backdrop" onClick={close} />
      <div className="menu-drawer">
        <div className="flex items-center justify-between pb-3 border-b border-[#37192c]/10">
          <span className="brand-font text-xl text-[#37192C]">AuraVibe Menu</span>
          <button onClick={close} className="grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 space-y-1.5">
          {sections.map((section: any) => (
            <button key={section.id} onClick={() => go(section.id)} className="menu-link">
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
