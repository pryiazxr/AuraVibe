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
  Sparkles,
  MapPin
} from 'lucide-react';
import './index.css';

import {
  categoryList,
  sampleArticles,
  iranLocations,
  satinImage,
  jewelryImage,
  necklaceImage,
  watchImage
} from './data';

import {
  db,
  Product,
  Banner,
  Order,
  User,
  AdminUser,
  SupportTicket,
  Article,
  ShippingMethodKey,
  OrderItemSnapshot
} from './services/db';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { ProductManagementView } from './components/admin/ProductManagementView';
import { BannerManagementView } from './components/admin/BannerManagementView';
import { OrderManagementView } from './components/admin/OrderManagementView';
import { UserManagementView } from './components/admin/UserManagementView';
import { TicketManagementView } from './components/admin/TicketManagementView';
import { AnalyticsView } from './components/admin/AnalyticsView';
import { SEOManagementView } from './components/admin/SEOManagementView';
import { SettingsView } from './components/admin/SettingsView';
import { AuditLogsView } from './components/admin/AuditLogsView';

const money = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

function App() {
  const [intro, setIntro] = useState(true);
  const [followModal, setFollowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountView, setAccountView] = useState<{ tab: 'profile' | 'cart' | 'fav' | 'orders' | 'tickets' } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Real-time Database Subscription States
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [banners, setBanners] = useState<Banner[]>(() => db.getActiveBanners());
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => db.getTickets());
  const [articles] = useState<Article[]>(() => db.getArticles());

  // Active View State
  const [activeView, setActiveView] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'products' | 'banners' | 'orders' | 'users' | 'support' | 'analytics' | 'seo' | 'settings' | 'audit'
  >('dashboard');

  // Logged-in Customer & Current Admin User
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    firstName: 'مریم',
    lastName: 'احمدی',
    phone: '۰۹۱۲۹۸۷۶۵۴۳',
    email: 'maryam@gmail.com',
    province: 'تهران',
    city: 'تهران',
    address: 'نیاوران، خیابان مژده، پلاک ۱۲، واحد ۳',
    postalCode: '۱۹۸۷۶۵۴۳۲۱',
    registrationDate: '۱۴۰۳/۰۱/۱۰',
    lastLogin: 'هم‌اکنون',
    status: 'active',
    orderCount: 3
  });

  const [currentAdmin] = useState<AdminUser>(() => db.getAdmins()[0]);

  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register'; pendingAction?: () => void }>({
    open: false,
    mode: 'login'
  });

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [checkoutModal, setCheckoutModal] = useState(false);

  // Subscribe to central DB updates
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setProducts(db.getProducts());
      setBanners(db.getActiveBanners());
      setOrders(db.getOrders());
      setTickets(db.getTickets());
    });
    return () => unsubscribe();
  }, []);

  // Intro and Banner Carousel
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntro(false);
      setFollowModal(true);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % banners.length), 4800);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const cartTotal = useMemo(() => cart.reduce((sum, product) => sum + product.price, 0), [cart]);

  const addToCart = (product: Product) => {
    setCart((current) => [...current, product]);
    setSelectedProduct(null);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (exists) return current.filter((item) => item.id !== product.id);
      return [...current, product];
    });
  };

  const menuSections = [
    { id: 'admin', label: '⚡ پیشخوان مدیریتی (Admin Dashboard)' },
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

  // Section collections dynamically sliced from real db
  const productsNewest = useMemo(() => products.filter((p) => p.badge === 'جدید' || p.status === 'active'), [products]);
  const productsBestSellers = useMemo(() => products.filter((p) => p.badge === 'پرفروش' || p.stock < 10), [products]);
  const productsSpecial = useMemo(() => products.filter((p) => p.oldPrice && p.oldPrice > p.price), [products]);
  const productsWatches = useMemo(() => products.filter((p) => p.category === 'ساعت'), [products]);

  return (
    <main className="pb-nav min-h-screen overflow-x-hidden bg-[#fffaf0] text-[#37192C] font-vazir">
      {intro && <Intro />}
      {followModal && <FollowModal close={() => setFollowModal(false)} />}

      {/* RENDER ADMIN DASHBOARD IF ACTIVE VIEW IS 'admin' */}
      {activeView === 'admin' ? (
        <AdminLayout
          currentAdmin={currentAdmin}
          activeTab={adminTab}
          setActiveTab={setAdminTab}
          goHome={() => handleNavClick('home')}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboardView
              navigateToTab={(tab) => setAdminTab(tab)}
              openProductModal={() => setAdminTab('products')}
              openBannerModal={() => setAdminTab('banners')}
            />
          )}
          {adminTab === 'products' && <ProductManagementView currentAdmin={currentAdmin} />}
          {adminTab === 'banners' && <BannerManagementView currentAdmin={currentAdmin} />}
          {adminTab === 'orders' && <OrderManagementView currentAdmin={currentAdmin} />}
          {adminTab === 'users' && <UserManagementView currentAdmin={currentAdmin} />}
          {adminTab === 'support' && <TicketManagementView currentAdmin={currentAdmin} />}
          {adminTab === 'analytics' && <AnalyticsView />}
          {adminTab === 'seo' && <SEOManagementView currentAdmin={currentAdmin} />}
          {adminTab === 'settings' && <SettingsView currentAdmin={currentAdmin} />}
          {adminTab === 'audit' && <AuditLogsView currentAdmin={currentAdmin} />}
        </AdminLayout>
      ) : (
        <>
          {/* STOREFRONT HEADER */}
          <header className="sticky top-0 z-30 border-b border-[#37192c]/8 bg-[#fffaf0]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <button
                className="grid size-11 place-items-center rounded-full hover:bg-[#37192c]/7 md:hidden"
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
                  className="rounded-full bg-[#37192C] px-3.5 py-1.5 text-[#FFF3C5] hover:bg-[#5a2548] transition flex items-center gap-1.5 shadow-xs"
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

          {/* MAIN STOREFRONT VIEWS */}
          {activeView === 'home' ? (
            <>
              {/* Category Story Circles */}
              <section className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
                <div>
                  <p className="label">انتخاب کن، بدرخش</p>
                  <h1 className="mt-1 text-2xl font-black sm:text-3xl">دسته‌بندی‌های محبوب</h1>
                </div>
                <div className="story-row mt-5">
                  {categoryList.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => handleNavClick(cat.name)}
                      className="group w-[105px] shrink-0 text-center"
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
                <section className="relative mt-10 overflow-hidden">
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

              {/* Collections Grid */}
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <ProductSection title="جدیدترین‌ها" intro="تازه‌ترین‌های آورا استایل" items={productsNewest} open={setSelectedProduct} onViewMore={() => handleNavClick('جدیدترین‌ها')} testid="new-products" />
                <ProductSection title="پرفروش‌ترین‌ها" intro="محبوب‌ترین انتخاب‌های کاربران" items={productsBestSellers} open={setSelectedProduct} onViewMore={() => handleNavClick('پرفروش‌ترین‌ها')} testid="best-sellers" />
                <ProductSection title="تخفیف ویژه" intro="پیشنهادهای استثنایی و محدود" items={productsSpecial} open={setSelectedProduct} onViewMore={() => handleNavClick('تخفیف ویژه')} testid="special-offers" />
                <ProductSection title="ساعت" intro="کالکشن ساعت‌های ظریف و خاص" items={productsWatches} open={setSelectedProduct} onViewMore={() => handleNavClick('ساعت')} testid="watches" />
              </div>

              {/* Social Banner */}
              <section className="mx-auto my-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <SocialBanner />
              </section>

              {/* FAQ Section */}
              <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <FaqSection />
              </section>

              {/* Trust Section */}
              <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <TrustSectionHorizontal />
              </section>

              {/* Journal Section */}
              <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <JournalSection articles={articles.slice(0, 4)} onViewMore={() => handleNavClick('journal')} />
              </section>
            </>
          ) : activeView === 'journal' ? (
            <JournalPageView articles={articles} openHome={() => handleNavClick('home')} />
          ) : (
            <CategoryPageView
              categoryName={activeView}
              products={products.filter((p) => p.category === activeView || activeView === 'جدیدترین‌ها')}
              openProduct={setSelectedProduct}
              backToHome={() => handleNavClick('home')}
            />
          )}

          {/* STOREFRONT FOOTER */}
          <footer className="mt-16 bg-[#FFF3C5] border-t border-[#37192c]/10 py-12 text-[#37192C]">
            <div className="mx-auto grid w-full max-w-7xl gap-9 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
              <div>
                <div className="brand-font text-3xl font-black">AuraVibe</div>
                <p className="mt-4 text-xs leading-7 text-[#37192C]/80">
                  فروشگاه تخصصی اکسسوری و زیورآلات ظریف با تم کرم وانیلی و بنفش آورا. جزئیات کوچکی که استایل شما را درخشان‌تر می‌کنند.
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
                  <button onClick={() => setSupportOpen(true)} className="block hover:underline">پشتیبانی آنلاین</button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-base">ارتباط با ما</h3>
                <a className="mt-4 block text-sm font-semibold" href="tel:02100000000">پشتیبانی: ۰۲۱-۸۸۸۸۹۹۹۹</a>
                <a className="mt-2 block text-sm font-semibold" href="mailto:hello@auravibe.ir">ایمیل: hello@auravibe.ir</a>
              </div>
            </div>
          </footer>

          {/* Support Floating Button */}
          <button className="support-button" onClick={() => setSupportOpen(true)} aria-label="پشتیبانی">
            <Headphones size={22} />
          </button>

          {/* Modals */}
          {supportOpen && <SupportModal close={() => setSupportOpen(false)} />}

          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              close={() => setSelectedProduct(null)}
              add={addToCart}
              toggleWish={toggleWishlist}
              isWished={wishlist.some((w) => w.id === selectedProduct.id)}
              allProducts={products}
              openProduct={setSelectedProduct}
            />
          )}

          {menuOpen && <SectionMenu sections={menuSections} close={() => setMenuOpen(false)} go={handleNavClick} />}
          {searchOpen && <SearchModal close={() => setSearchOpen(false)} openProduct={setSelectedProduct} products={products} />}

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
              orders={orders}
              openCheckout={() => setCheckoutModal(true)}
              openOrderDetails={(order) => setSelectedOrderDetails(order)}
            />
          )}

          {checkoutModal && (
            <CheckoutInvoiceModal
              cart={cart}
              total={cartTotal}
              user={currentUser}
              close={() => setCheckoutModal(false)}
              onPaymentComplete={() => {
                const itemsSnapshot: OrderItemSnapshot[] = cart.map((p) => ({
                  productId: p.id,
                  productCode: p.productCode,
                  productName: p.name,
                  productImage: p.images[0],
                  originalPrice: p.oldPrice || p.price,
                  finalPrice: p.price,
                  quantity: 1,
                  lineTotal: p.price
                }));

                const newOrder = db.createOrder({
                  customer: {
                    userId: currentUser.id,
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    phone: currentUser.phone,
                    province: currentUser.province || 'تهران',
                    city: currentUser.city || 'تهران',
                    fullAddress: currentUser.address || 'تهران، خیابان اصلی',
                    postalCode: currentUser.postalCode || '1234567890'
                  },
                  items: itemsSnapshot,
                  shippingMethod: {
                    key: 'POST',
                    title: 'پست پیشتاز',
                    subtitle: 'ارسال به سراسر کشور',
                    costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
                  }
                });

                setCart([]);
                setCheckoutModal(false);
                setAccountView({ tab: 'orders' });
              }}
            />
          )}

          {selectedOrderDetails && (
            <OrderDetailsModal order={selectedOrderDetails} close={() => setSelectedOrderDetails(null)} />
          )}

          {/* Bottom Nav */}
          <nav className="bottom-nav" dir="ltr">
            <button className="bottom-nav-item" onClick={() => handleNavClick('home')} aria-label="خانه">
              <Home size={22} />
            </button>
            <button className="bottom-nav-item" onClick={() => setSearchOpen(true)} aria-label="جستجو">
              <Search size={22} />
            </button>
            <button className="bottom-nav-item" onClick={() => handleNavClick('admin')} aria-label="مدیریت">
              <LayoutDashboard size={22} />
            </button>
            <button className="bottom-nav-item" onClick={() => setAccountView({ tab: 'orders' })} aria-label="حساب کاربری">
              <UserRound size={22} />
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

// ----------------------------------------------------------------------
// AUXILIARY COMPONENTS
// ----------------------------------------------------------------------

function Intro() {
  return (
    <div className="intro-screen">
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
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-full bg-[#FFF3C5]/20 hover:bg-[#FFF3C5] hover:text-[#37192C] transition px-4 py-1.5 text-xs font-bold border border-[#FFF3C5]/30">
            عضویت در اینستاگرام
          </a>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#37192C] via-[#5A2548] to-[#37192C] p-5 sm:p-6 text-[#FFF3C5] flex items-center justify-between shadow-md">
        <div className="z-10">
          <h3 className="text-lg sm:text-xl font-black">کانال تلگرام آورا استایل</h3>
          <p className="mt-1 text-xs text-[#FFF3C5]/75">تخفیف‌های ویژه روزانه و سفارش سریع</p>
          <a href="https://t.me" target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-full bg-[#FFF3C5]/20 hover:bg-[#FFF3C5] hover:text-[#37192C] transition px-4 py-1.5 text-xs font-bold border border-[#FFF3C5]/30">
            عضویت در تلگرام
          </a>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="flex items-center gap-3.5 rounded-xl bg-[#FFF3C5]/10 p-4 border border-[#FFF3C5]/15">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C] font-bold shadow-xs">
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
    { q: 'چگونه سفارش خود را ثبت کنم؟', a: 'محصول مورد نظر را انتخاب کرده و روی افزودن به سبد خرید کلیک کنید، سپس فاکتور نهایی را مشاهده و تکمیل نمایید.' },
    { q: 'زمان و هزینه ارسال سفارش‌ها چگونه است؟', a: 'کلیه مرسولات به‌صورت پس‌کرایه ارسال شده و هزینه حمل هنگام تحویل دریافت می‌شود.' },
    { q: 'آیا زیورآلات آورا ضد حساسیت هستند؟', a: 'بله تمامی بدلیجات از استیل ۳۱۶ با روکش طلا و بدون نیکل ساخته شده‌اند.' }
  ];
  return (
    <div className="rounded-[2.5rem] bg-[#FFF3C5]/40 border border-[#37192c]/10 p-6 sm:p-10">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-[#37192C]">پاسخ به سوالات شما</h2>
      </div>
      <div className="mt-8 space-y-3 max-w-3xl mx-auto">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl bg-white border border-[#37192c]/10 overflow-hidden">
            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="flex w-full items-center justify-between p-5 text-right font-bold text-[#37192C]">
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
        <h2 className="text-2xl sm:text-3xl font-black text-[#37192C]">مجله استایل آورا</h2>
      </div>
      <div className="space-y-6">
        {articles.map((art) => (
          <div key={art.id} className="relative flex flex-col md:flex-row-reverse items-stretch overflow-hidden rounded-2xl border border-[#37192c]/10 bg-white shadow-xs">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#37192C]">{art.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-[#37192C]/80 leading-6">{art.digest}</p>
              </div>
            </div>
            <div className="md:w-2/5 shrink-0 h-48 md:h-auto overflow-hidden">
              <img src={art.image} alt={art.title} className="size-full object-cover" />
            </div>
          </div>
        ))}
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
          <h1 className="text-2xl sm:text-3xl font-black text-[#37192C]">مجله استایل آورا</h1>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => (
          <article key={art.id} className="rounded-2xl border border-[#37192c]/10 bg-white overflow-hidden shadow-xs p-5">
            <img src={art.image} alt={art.title} className="h-48 w-full object-cover rounded-xl" />
            <h2 className="mt-3 text-lg font-black text-[#37192C]">{art.title}</h2>
            <p className="mt-2 text-xs text-[#37192C]/75 leading-6">{art.digest}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProductSection({ title, intro, items, open, onViewMore, testid }: any) {
  return (
    <section className="mt-14">
      <div>
        <p className="label">{intro}</p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2>
      </div>
      <div className="product-row mt-6">
        {items.map((product: Product, index: number) => (
          <ProductCard key={product.id + '-' + index} product={product} open={open} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, open }: { product: Product; open: (p: Product) => void }) {
  return (
    <button onClick={() => open(product)} className="product-card group text-right">
      <div className="relative aspect-[.83] overflow-hidden rounded-[1.55rem] bg-[#f1e4c8]">
        <img src={product.images[0]} alt={product.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
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

function CategoryPageView({ categoryName, products, openProduct, backToHome }: any) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="border-b border-[#37192c]/10 pb-4">
        <button onClick={backToHome} className="flex items-center gap-1 text-xs font-bold text-[#8b627e] mb-1">
          <ArrowLeft size={14} className="rotate-180" /> صفحه اصلی
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-[#37192C]">دسته‌بندی: {categoryName}</h1>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p: Product) => (
          <button key={p.id} onClick={() => openProduct(p)} className="rounded-2xl border bg-white p-3 text-right">
            <img src={p.images[0]} alt={p.name} className="aspect-square w-full rounded-xl object-cover" />
            <h3 className="mt-2.5 truncate text-xs font-bold text-[#37192C]">{p.name}</h3>
            <span className="font-black text-xs text-[#37192C]">{money(p.price)} تومان</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductModal({ product, close, add, toggleWish, isWished, allProducts, openProduct }: any) {
  return (
    <div className="modal-backdrop p-3">
      <div className="product-modal max-h-[92vh] overflow-y-auto">
        <button className="absolute end-5 top-5 z-10 grid size-10 place-items-center rounded-full bg-white/80 shadow-xs" onClick={close}>
          <X size={20} />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="min-h-[300px] bg-[#f3e7cd] flex items-center justify-center p-4">
            <img src={product.images[0]} alt={product.name} className="max-h-[500px] w-full object-contain rounded-2xl" />
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="label">{product.category}</span>
              <h2 className="mt-2 text-2xl font-black text-[#37192C]">{product.name}</h2>
              <div className="mt-2 font-mono text-xs font-bold text-[#8b627e]">Product Code: {product.productCode}</div>
              <p className="mt-4 text-xs leading-7 text-[#37192C]/80">{product.description}</p>
              <div className="mt-6 text-2xl font-black text-[#37192C]">{money(product.price)} تومان</div>
              <button onClick={() => add(product)} className="mt-6 w-full rounded-full bg-[#37192C] py-3.5 text-xs font-bold text-[#FFF3C5]">
                افزودن به سبد خرید
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportModal({ close }: { close: () => void }) {
  return (
    <div className="support-panel shadow-2xl">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-sm font-black text-[#37192C]">پشتیبانی آنلاین آورا</h2>
        <button onClick={close} className="grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <X size={16} />
        </button>
      </div>
      <p className="mt-4 text-xs leading-6 text-[#37192C]">پشتیبانان ما در ۲۴ ساعت شبانه‌روز آماده پاسخگویی به سوالات شما درباره سفارشات هستند.</p>
    </div>
  );
}

function SearchModal({ close, openProduct, products }: any) {
  const [q, setQ] = useState('');
  const filtered = products.filter((p: Product) => p.name.includes(q) || p.productCode.includes(q));

  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <input type="text" placeholder="جستجوی محصول..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full font-bold outline-none text-sm" />
          <button onClick={close}><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {filtered.map((p: Product) => (
            <button key={p.id} onClick={() => { openProduct(p); close(); }} className="text-right p-2 border rounded-xl">
              <img src={p.images[0]} alt={p.name} className="h-24 w-full object-cover rounded-lg" />
              <div className="mt-1 font-bold text-xs truncate">{p.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountView({ tab, setTab, close, cart, total, orders, openCheckout, openOrderDetails }: any) {
  return (
    <div className="modal-backdrop p-3" onClick={close}>
      <div className="w-full max-w-md rounded-[2.5rem] bg-[#fffaf0] p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute end-5 top-5 grid size-8 place-items-center rounded-full bg-white">
          <X size={16} />
        </button>
        <div className="flex border-b border-[#37192c]/10 text-center mb-4">
          <button onClick={() => setTab('cart')} className={'flex-1 py-3 font-bold text-xs ' + (tab === 'cart' ? 'border-b-2 border-[#37192C]' : '')}>سبد خرید</button>
          <button onClick={() => setTab('orders')} className={'flex-1 py-3 font-bold text-xs ' + (tab === 'orders' ? 'border-b-2 border-[#37192C]' : '')}>سفارشات من</button>
        </div>

        {tab === 'cart' && (
          <div>
            {cart.map((item: Product, idx: number) => (
              <div key={idx} className="flex justify-between p-3 bg-white rounded-xl mb-2 text-xs font-bold">
                <span>{item.name}</span>
                <span>{money(item.price)} تومان</span>
              </div>
            ))}
            {cart.length > 0 && (
              <button onClick={() => { close(); openCheckout(); }} className="mt-4 w-full rounded-full bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5]">
                پرداخت فاکتور ({money(total)} تومان)
              </button>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {orders.map((o: Order) => (
              <div key={o.id} onClick={() => openOrderDetails(o)} className="p-4 bg-white rounded-2xl border text-xs cursor-pointer">
                <div className="flex justify-between font-bold">
                  <span>{o.orderNumber}</span>
                  <span className="text-emerald-700">{o.orderStatus}</span>
                </div>
                <div className="mt-1 text-[11px] text-[#8b627e]">مبلغ: {money(o.totalAmount)} تومان | روش: {o.shippingMethod.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutInvoiceModal({ cart, total, close, onPaymentComplete }: any) {
  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-4">
        <button onClick={close} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5]">
          <X size={16} />
        </button>
        <h3 className="text-lg font-black text-[#37192C]">فاکتور خرید آنلاین آورا</h3>
        <div className="flex justify-between text-xs font-bold">
          <span>مبلغ کل فاکتور:</span>
          <span>{money(total)} تومان</span>
        </div>
        <p className="text-[11px] font-semibold text-rose-700">هزینه ارسال پس‌کرایه است و هنگام تحویل پرداخته می‌شود.</p>
        <button onClick={onPaymentComplete} className="w-full rounded-full bg-[#37192C] py-3.5 font-bold text-[#FFF3C5]">
          تایید و پرداخت فاکتور
        </button>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, close }: any) {
  return (
    <div className="modal-backdrop p-3">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-3">
        <button onClick={close} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5]">
          <X size={16} />
        </button>
        <h3 className="text-base font-black text-[#37192C]">سفارش {order.orderNumber}</h3>
        <div className="text-xs space-y-1">
          <div><strong>وضعیت:</strong> {order.orderStatus}</div>
          <div><strong>روش ارسال:</strong> {order.shippingMethod.title}</div>
          <div><strong>آدرس:</strong> {order.customer.fullAddress}</div>
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
