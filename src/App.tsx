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
                            onClick={() => handleNavClick(banner.targetCategory || 'جدیدترین‌ها')}
                            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF3C5] px-5 py-3 text-sm font-bold text-[#37192C] transition hover:scale-105"
                          >
                            {banner.ctaText || 'دیدن کالکشن'} <ArrowLeft size={17} />
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

              {/* Category Banners Section (10 Banners for 10 Categories) */}
              <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                  <p className="label">کالکشن‌های آورا وایب</p>
                  <h2 className="mt-1 text-2xl font-black sm:text-3xl text-[#37192C]">دسته‌بندی‌های ویژه</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoryList.slice(0, 10).map((cat) => {
                    const matchedBanner = banners.find(b => b.targetCategory === cat.name);
                    const bannerImage = matchedBanner?.image || cat.image;
                    const bannerTitle = matchedBanner?.title || `کالکشن ${cat.name}`;
                    const bannerSubtitle = matchedBanner?.subtitle || `جدیدترین مدل‌های ${cat.name} آورا استایل`;
                    return (
                      <div
                        key={cat.name}
                        className="group relative overflow-hidden rounded-[2rem] bg-[#37192C] p-6 text-[#FFF3C5] shadow-md border border-[#FFF3C5]/15 flex flex-col justify-between min-h-[200px]"
                      >
                        <img
                          src={bannerImage}
                          alt={cat.name}
                          className="absolute inset-0 size-full object-cover opacity-35 group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#37192C] via-[#37192C]/60 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                          <span className="text-[10px] font-extrabold text-[#FFF3C5]/80 uppercase tracking-wider bg-[#37192C]/60 px-2.5 py-1 rounded-full border border-[#FFF3C5]/20">
                            {cat.name}
                          </span>
                          <h3 className="mt-3 text-xl font-black text-white">{bannerTitle}</h3>
                          <p className="mt-1.5 text-xs text-white/80 line-clamp-2 leading-5">{bannerSubtitle}</p>
                        </div>
                        <div className="relative z-10 mt-4">
                          <button
                            onClick={() => handleNavClick(cat.name)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C5] px-4 py-2 text-xs font-bold text-[#37192C] hover:bg-white transition shadow-xs"
                          >
                            دیدن کالکشن <ArrowLeft size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

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
              setTab={(tab: string) => setAccountView({ tab: tab as any })}
              close={() => setAccountView(null)}
              cart={cart}
              setCart={setCart}
              total={cartTotal}
              wishlist={wishlist}
              user={currentUser}
              setUser={setCurrentUser}
              orders={orders}
              openCheckout={() => setCheckoutModal(true)}
              openOrderDetails={(order: Order) => setSelectedOrderDetails(order)}
              openProduct={setSelectedProduct}
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
            <button className="bottom-nav-item" onClick={() => setAccountView({ tab: 'profile' })} aria-label="حساب کاربری">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Instagram Card: Text Right | Logo Left */}
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center justify-between overflow-hidden rounded-[2rem] bg-[#37192C] p-6 sm:p-7 text-[#FFF3C5] shadow-lg border border-[#FFF3C5]/15 transition hover:scale-[1.01]"
      >
        {/* Text Content on Right */}
        <div className="z-10 text-right max-w-[65%]">
          <span className="text-[10px] font-bold text-[#FFF3C5]/70 tracking-widest block uppercase">Instagram</span>
          <h3 className="mt-1 text-lg sm:text-xl font-black text-[#FFF3C5]">وینا اکسسوری در اینستاگرام</h3>
          <p className="mt-1.5 text-xs text-[#FFF3C5]/80 leading-5 font-semibold">
            جدیدترین کالکشن‌ها و ویدیوهای آنباکسینگ استایل آورا
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C5] px-4 py-1.5 text-xs font-extrabold text-[#37192C] shadow-xs group-hover:bg-white transition">
            دنبال کردن اینستاگرام <ArrowLeft size={14} />
          </span>
        </div>

        {/* Independent Logo Container on Left */}
        <div className="z-10 grid size-16 sm:size-20 shrink-0 place-items-center rounded-2xl bg-[#FFF3C5]/10 text-[#FFF3C5] border border-[#FFF3C5]/20 group-hover:bg-[#FFF3C5] group-hover:text-[#37192C] transition">
          <Instagram size={36} />
        </div>
      </a>

      {/* Telegram Card: Logo Right | Text Left */}
      <a
        href="https://t.me"
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center justify-between overflow-hidden rounded-[2rem] bg-[#37192C] p-6 sm:p-7 text-[#FFF3C5] shadow-lg border border-[#FFF3C5]/15 transition hover:scale-[1.01]"
      >
        {/* Independent Logo Container on Right */}
        <div className="z-10 grid size-16 sm:size-20 shrink-0 place-items-center rounded-2xl bg-[#FFF3C5]/10 text-[#FFF3C5] border border-[#FFF3C5]/20 group-hover:bg-[#FFF3C5] group-hover:text-[#37192C] transition">
          <Send size={36} />
        </div>

        {/* Text Content on Left */}
        <div className="z-10 text-left max-w-[65%]">
          <span className="text-[10px] font-bold text-[#FFF3C5]/70 tracking-widest block uppercase">Telegram</span>
          <h3 className="mt-1 text-lg sm:text-xl font-black text-[#FFF3C5]">کانال تلگرام آورا استایل</h3>
          <p className="mt-1.5 text-xs text-[#FFF3C5]/80 leading-5 font-semibold">
            تخفیف‌های ویژه روزانه، کدهای تخفیف و سفارش سریع
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C5] px-4 py-1.5 text-xs font-extrabold text-[#37192C] shadow-xs group-hover:bg-white transition">
            عضویت در تلگرام <ArrowLeft size={14} className="rotate-180" />
          </span>
        </div>
      </a>
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
    {
      q: 'چگونه می‌توانم سفارشم را ثبت کنم؟',
      a: 'محصول موردنظر را انتخاب کنید و پس از بررسی مشخصات، آن را به سبد خرید اضافه کنید. سپس وارد سبد خرید شوید، اطلاعات ارسال را تکمیل کنید و سفارش خود را از طریق روش پرداخت موجود نهایی کنید.'
    },
    {
      q: 'چگونه می‌توانم وضعیت سفارشم را پیگیری کنم؟',
      a: 'بعد از ثبت سفارش، می‌توانید از بخش «حساب کاربری» و قسمت سفارش‌های من، وضعیت سفارش را مشاهده کنید. پس از ارسال مرسوله نیز اطلاعات رهگیری در صورت فعال بودن برای سفارش نمایش داده می‌شود.'
    },
    {
      q: 'سفارش من چه زمانی ارسال می‌شود؟',
      a: 'پس از ثبت و تأیید سفارش، کالا برای ارسال آماده می‌شود. زمان تحویل بسته به روش ارسال و مقصد متفاوت است و اطلاعات دقیق‌تر در مراحل ثبت سفارش یا بخش پیگیری سفارش نمایش داده می‌شود.'
    },
    {
      q: 'هزینه ارسال سفارش چقدر است؟',
      a: 'هزینه ارسال با توجه به مقصد، روش ارسال و شرایط سفارش محاسبه می‌شود و مبلغ نهایی قبل از تکمیل خرید به کاربر نمایش داده خواهد شد.'
    },
    {
      q: 'آیا امکان لغو یا تغییر سفارش بعد از ثبت وجود دارد؟',
      a: 'در صورت امکان و تا قبل از ورود سفارش به مرحله ارسال، برای لغو یا تغییر سفارش با پشتیبانی تماس بگیرید. امکان تغییر سفارش به وضعیت پردازش آن بستگی دارد.'
    },
    {
      q: 'اگر پرداخت انجام شود ولی سفارش ثبت نشود چه کار کنم؟',
      a: 'ابتدا وضعیت سفارش و تراکنش را بررسی کنید. اگر مبلغ از حساب شما کسر شده ولی سفارش ثبت نشده است، اطلاعات تراکنش و شماره سفارش در صورت وجود را نگه دارید و با پشتیبانی تماس بگیرید تا وضعیت پرداخت بررسی شود.'
    },
    {
      q: 'شرایط مرجوعی یا تعویض کالا چگونه است؟',
      a: 'شرایط مرجوعی و تعویض بر اساس وضعیت کالا و قوانین فروشگاه تعیین می‌شود. در صورت وجود مغایرت، ایراد یا مشکل در سفارش، قبل از اقدام برای بازگشت کالا با پشتیبانی هماهنگ کنید.'
    }
  ];

  return (
    <div className="rounded-[2.5rem] bg-[#FFF3C5]/40 border border-[#37192c]/10 p-6 sm:p-10">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-[#37192C]">پاسخ به سوالات شما</h2>
      </div>
      <div className="mt-8 space-y-3 max-w-3xl mx-auto">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl bg-white border border-[#37192c]/10 overflow-hidden shadow-xs">
            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="flex w-full items-center justify-between p-5 text-right font-bold text-[#37192C]">
              <span className="text-sm sm:text-base">{item.q}</span>
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#37192C] text-[#FFF3C5]">
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
  const displayArticles = articles.slice(0, 3);

  return (
    <div className="rounded-[2.5rem] bg-[#fffdf7] border border-[#37192c]/10 p-6 sm:p-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#37192C]">مجله استایل وینا</h2>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {displayArticles.map((art) => (
          <div key={art.id} className="space-y-2">
            {/* Horizontal Rectangular Article Card */}
            <div
              onClick={onViewMore}
              className="group relative overflow-hidden rounded-2xl h-44 sm:h-52 border border-[#37192c]/10 shadow-xs flex items-center justify-between bg-[#37192C] cursor-pointer transition hover:shadow-md"
            >
              {/* Article Background Image */}
              <img
                src={art.image}
                alt={art.title}
                className="absolute inset-0 size-full object-cover group-hover:scale-105 transition duration-500"
              />

              {/* Gradient Overlay: #37192C starting on LEFT, fading toward RIGHT */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#37192C] via-[#37192C]/80 to-transparent pointer-events-none" />

              {/* White Box on RIGHT side */}
              <div className="z-10 mr-0 ml-auto bg-white/95 backdrop-blur-md text-[#37192C] p-5 sm:p-7 rounded-l-2xl rounded-r-none h-full max-w-[68%] sm:max-w-[55%] flex flex-col justify-center shadow-md">
                <h3 className="text-base sm:text-xl font-black text-[#37192C] leading-snug">
                  {art.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-light text-[#37192C]/85 leading-relaxed truncate">
                  {art.subtitle || art.digest}
                </p>
              </div>
            </div>

            {/* Full Article Title Below Card */}
            <div className="px-2 pt-1">
              <h4
                onClick={onViewMore}
                className="text-xs sm:text-sm font-bold text-[#37192C] leading-6 hover:text-[#8b627e] transition cursor-pointer"
              >
                {art.fullArticleTitle || art.title}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button "مشاهده همه موارد" */}
      <div className="mt-8 text-center">
        <button
          onClick={onViewMore}
          className="inline-flex items-center gap-2 rounded-full bg-[#37192C] px-6 py-3 text-xs sm:text-sm font-bold text-[#FFF3C5] transition hover:bg-[#5a2548] shadow-md"
        >
          مشاهده همه موارد <ArrowLeft size={16} />
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

function ProductSection({ title, intro, items, open, onViewMore }: any) {
  const displayItems = items.slice(0, 10);
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between">
        <div>
          <p className="label">{intro}</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl text-[#37192C]">{title}</h2>
        </div>
        <button
          onClick={onViewMore}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#37192C] bg-[#FFF3C5] px-4 py-2 rounded-full hover:bg-[#37192C] hover:text-[#FFF3C5] transition shadow-xs"
        >
          مشاهده همه موارد <ArrowLeft size={15} />
        </button>
      </div>

      <div className="product-row mt-6 flex items-stretch gap-3 overflow-x-auto pb-4">
        {displayItems.map((product: Product, index: number) => (
          <ProductCard key={product.id + '-' + index} product={product} open={open} />
        ))}
        {/* End of Slider CTA Card */}
        <button
          onClick={onViewMore}
          className="product-card shrink-0 flex flex-col items-center justify-center gap-3 rounded-[1.55rem] bg-[#FFF3C5]/60 hover:bg-[#FFF3C5] border border-[#37192c]/15 p-6 text-center transition group min-h-[220px]"
        >
          <div className="grid size-12 place-items-center rounded-full bg-[#37192C] text-[#FFF3C5] group-hover:scale-110 transition">
            <ArrowLeft size={20} />
          </div>
          <span className="text-xs font-black text-[#37192C]">مشاهده همه موارد</span>
        </button>
      </div>

      {/* Mobile View More CTA */}
      <div className="mt-3 sm:hidden text-center">
        <button
          onClick={onViewMore}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#37192C] bg-[#FFF3C5] px-5 py-2.5 rounded-full hover:bg-[#37192C] hover:text-[#FFF3C5] transition"
        >
          مشاهده همه موارد <ArrowLeft size={15} />
        </button>
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
  const getInitialFilters = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      inStockOnly: params.get('inStock') === 'true',
      sort: params.get('sort') || 'newest',
      colors: params.get('colors') ? params.get('colors')!.split(',') : [],
      badges: params.get('badges') ? params.get('badges')!.split(',') : [],
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL without full-page reloads
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.inStockOnly) params.set('inStock', 'true');
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.colors.length > 0) params.set('colors', filters.colors.join(','));
    if (filters.badges.length > 0) params.set('badges', filters.badges.join(','));

    const queryStr = params.toString();
    const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [filters]);

  useEffect(() => {
    const handlePopState = () => {
      setFilters(getInitialFilters());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const categoryPrices = products.map((p: Product) => p.price);
  const minCategoryPrice = categoryPrices.length ? Math.min(...categoryPrices) : 0;
  const maxCategoryPrice = categoryPrices.length ? Math.max(...categoryPrices) : 1000000;

  const availableColors = Array.from(
    new Set(products.flatMap((p: Product) => p.colors || []))
  ) as string[];

  const availableBadges = Array.from(
    new Set(products.map((p: Product) => p.badge).filter(Boolean))
  ) as string[];

  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && p.stock <= 0) return false;
      if (filters.colors.length > 0) {
        if (!p.colors || !p.colors.some((c: string) => filters.colors.includes(c))) return false;
      }
      if (filters.badges.length > 0) {
        if (!p.badge || !filters.badges.includes(p.badge)) return false;
      }
      return true;
    }).sort((a: Product, b: Product) => {
      if (filters.sort === 'cheapest') return a.price - b.price;
      if (filters.sort === 'expensive') return b.price - a.price;
      if (filters.sort === 'discount') {
        const discA = (a.oldPrice || a.price) - a.price;
        const discB = (b.oldPrice || b.price) - b.price;
        return discB - discA;
      }
      if (filters.sort === 'bestselling') {
        if (a.badge === 'پرفروش') return -1;
        if (b.badge === 'پرفروش') return 1;
        return a.stock - b.stock;
      }
      return b.id - a.id;
    });
  }, [products, filters]);

  const clearAllFilters = () => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: false,
      sort: 'newest',
      colors: [],
      badges: []
    });
  };

  const hasActiveFilters =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStockOnly ||
    filters.colors.length > 0 ||
    filters.badges.length > 0 ||
    filters.sort !== 'newest';

  const toggleColor = (col: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(col)
        ? prev.colors.filter(c => c !== col)
        : [...prev.colors, col]
    }));
  };

  const toggleBadge = (badge: string) => {
    setFilters(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge]
    }));
  };

  const renderFilterControls = () => (
    <div className="space-y-6 text-xs text-[#37192C]">
      {/* Price Filter */}
      <div className="bg-white p-4 rounded-2xl border border-[#37192c]/10 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-[#37192C] flex items-center justify-between">
          <span>محدوده قیمت (تومان)</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-[#8b627e] mb-1 font-semibold">حداقل قیمت</label>
            <input
              type="number"
              placeholder={minCategoryPrice ? money(minCategoryPrice) : '۰'}
              value={filters.minPrice ?? ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full p-2 rounded-xl border bg-[#fffaf0] font-bold text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#8b627e] mb-1 font-semibold">حداکثر قیمت</label>
            <input
              type="number"
              placeholder={maxCategoryPrice ? money(maxCategoryPrice) : '۱,۰۰۰,۰۰۰'}
              value={filters.maxPrice ?? ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full p-2 rounded-xl border bg-[#fffaf0] font-bold text-xs"
            />
          </div>
        </div>
        {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
          <div className="text-[11px] font-bold text-[#8b627e] pt-1">
            از {money(filters.minPrice || minCategoryPrice)} تا {money(filters.maxPrice || maxCategoryPrice)} تومان
          </div>
        )}
      </div>

      {/* Stock Filter */}
      <div className="bg-white p-4 rounded-2xl border border-[#37192c]/10 shadow-xs space-y-2">
        <h3 className="font-bold text-sm text-[#37192C]">وضعیت موجودی</h3>
        <label className="flex items-center gap-2 cursor-pointer font-semibold py-1">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
            className="size-4 rounded accent-[#37192C]"
          />
          <span>فقط کالاهای موجود</span>
        </label>
      </div>

      {/* Color Filter */}
      {availableColors.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-[#37192c]/10 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#37192C]">فیلتر رنگ</h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((col) => {
              const selected = filters.colors.includes(col);
              return (
                <button
                  key={col}
                  onClick={() => toggleColor(col)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition ${
                    selected ? 'bg-[#37192C] text-[#FFF3C5] border-[#37192C]' : 'bg-[#fffaf0] text-[#37192C] border-[#37192c]/20 hover:border-[#37192C]'
                  }`}
                >
                  <span className="size-3.5 rounded-full border border-black/20" style={{ backgroundColor: col }} />
                  {selected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Attributes / Badges Filter */}
      {availableBadges.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-[#37192c]/10 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#37192C]">ویژگی‌های محصول</h3>
          <div className="flex flex-wrap gap-2">
            {availableBadges.map((badge) => {
              const selected = filters.badges.includes(badge);
              return (
                <button
                  key={badge}
                  onClick={() => toggleBadge(badge)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-bold transition ${
                    selected ? 'bg-[#37192C] text-[#FFF3C5] border-[#37192C]' : 'bg-[#fffaf0] text-[#37192C] border-[#37192c]/20 hover:border-[#37192C]'
                  }`}
                >
                  {badge}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2.5 rounded-2xl border border-rose-300 text-rose-600 font-bold bg-rose-50 hover:bg-rose-100 transition flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={15} /> حذف همه فیلترها
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Header & Breadcrumb */}
      <div className="border-b border-[#37192c]/10 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <button onClick={backToHome} className="flex items-center gap-1 text-xs font-bold text-[#8b627e] mb-1 hover:underline">
            <ArrowLeft size={14} className="rotate-180" /> صفحه اصلی
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#37192C]">دسته‌بندی: {categoryName}</h1>
        </div>
        <div className="text-xs font-bold text-[#8b627e]">
          نمایش {filteredProducts.length} محصول از {products.length} محصول
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#37192c]/10 shadow-xs">
        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-[#37192C] text-[#FFF3C5] font-bold text-xs"
        >
          <SlidersHorizontal size={16} /> فیلترها {hasActiveFilters && '(فعال)'}
        </button>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 mr-auto lg:mr-0">
          <span className="text-xs font-bold text-[#8b627e]">مرتب‌سازی:</span>
          <select
            value={filters.sort}
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            className="p-2 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] font-bold text-xs text-[#37192C] outline-none cursor-pointer"
          >
            <option value="newest">جدیدترین</option>
            <option value="bestselling">پرفروش‌ترین</option>
            <option value="cheapest">ارزان‌ترین</option>
            <option value="expensive">گران‌ترین</option>
            <option value="discount">بیشترین تخفیف</option>
          </select>
        </div>

        {/* Desktop Active Filter Pills */}
        {hasActiveFilters && (
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            {filters.minPrice !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF3C5] text-[#37192C] text-xs font-bold">
                از {money(filters.minPrice)} تومان
                <button onClick={() => setFilters(prev => ({ ...prev, minPrice: undefined }))}><X size={12} /></button>
              </span>
            )}
            {filters.maxPrice !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF3C5] text-[#37192C] text-xs font-bold">
                تا {money(filters.maxPrice)} تومان
                <button onClick={() => setFilters(prev => ({ ...prev, maxPrice: undefined }))}><X size={12} /></button>
              </span>
            )}
            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF3C5] text-[#37192C] text-xs font-bold">
                موجود
                <button onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))}><X size={12} /></button>
              </span>
            )}
            {filters.colors.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF3C5] text-[#37192C] text-xs font-bold">
                رنگ
                <button onClick={() => toggleColor(c)}><X size={12} /></button>
              </span>
            ))}
            {filters.badges.map(b => (
              <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF3C5] text-[#37192C] text-xs font-bold">
                {b}
                <button onClick={() => toggleBadge(b)}><X size={12} /></button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-rose-600 font-bold underline mr-2">
              حذف فیلترها
            </button>
          </div>
        )}
      </div>

      {/* Main Grid + Sidebar */}
      <div className="mt-6 flex gap-6 items-start">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
          {renderFilterControls()}
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-[#37192c]/10">
              <p className="text-base font-bold text-[#37192C]">محصولی با فیلترهای انتخابی یافت نشد.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-5 py-2.5 rounded-full bg-[#37192C] text-[#FFF3C5] text-xs font-bold"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p: Product) => (
                <ProductCard key={p.id} product={p} open={openProduct} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="modal-backdrop p-3 lg:hidden" onClick={() => setMobileFilterOpen(false)}>
          <div
            className="w-full max-w-md rounded-t-[2.5rem] rounded-b-2xl bg-[#fffaf0] p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-base font-black text-[#37192C] flex items-center gap-2">
                <Filter size={18} /> فیلتر محصولات
              </h2>
              <button onClick={() => setMobileFilterOpen(false)} className="grid size-8 place-items-center rounded-full bg-white">
                <X size={16} />
              </button>
            </div>
            {renderFilterControls()}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full py-3.5 rounded-full bg-[#37192C] text-[#FFF3C5] font-bold text-xs shadow-md"
            >
              مشاهده {filteredProducts.length} محصول
            </button>
          </div>
        </div>
      )}
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
  const filtered = q.trim() === ''
    ? []
    : products.filter((p: Product) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.productCode.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(q.toLowerCase()))
      );

  return (
    <div className="modal-backdrop p-3" onClick={close}>
      <div className="w-full max-w-xl rounded-[2.5rem] bg-white p-6 shadow-2xl space-y-4 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2 flex-1 pl-2">
            <Search size={20} className="text-[#8b627e]" />
            <input
              type="text"
              placeholder="جستجوی عنوان محصول، کد یا دسته‌بندی..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              className="w-full font-bold outline-none text-sm bg-transparent"
            />
            {q && (
              <button onClick={() => setQ('')} className="text-[#8b627e] hover:text-[#37192C]">
                <X size={16} />
              </button>
            )}
          </div>
          <button onClick={close} className="grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
            <X size={18} />
          </button>
        </div>

        {q.trim() === '' ? (
          <div className="py-10 text-center text-xs font-semibold text-[#8b627e]">
            عبارت مورد نظر خود را برای جستجو وارد کنید.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-xs font-semibold text-[#8b627e]">
            هیچ محصولی با مشخصات «{q}» یافت نشد.
          </div>
        ) : (
          <div>
            <div className="text-xs font-bold text-[#8b627e] mb-3">
              {filtered.length} محصول یافت شد:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {filtered.map((p: Product) => (
                <button
                  key={p.id}
                  onClick={() => {
                    openProduct(p);
                    close();
                  }}
                  className="flex items-center gap-3 p-2.5 border rounded-2xl text-right hover:border-[#37192C]/40 hover:bg-[#fffaf0] transition"
                >
                  <img src={p.images[0]} alt={p.name} className="size-16 object-cover rounded-xl shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-[#8b627e] bg-[#FFF3C5] px-2 py-0.5 rounded-full inline-block mb-1">
                      {p.category}
                    </span>
                    <div className="mt-0.5 font-bold text-xs truncate text-[#37192C]">{p.name}</div>
                    <div className="mt-1 font-black text-xs text-[#37192C]">{money(p.price)} تومان</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountView({ tab, setTab, close, cart, setCart, total, wishlist, user, setUser, orders, openCheckout, openOrderDetails, openProduct }: any) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    province: user?.province || '',
    city: user?.city || '',
    address: user?.address || '',
    postalCode: user?.postalCode || ''
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (setUser) {
      setUser((prev: User) => ({ ...prev, ...formData }));
    }
    setEditing(false);
  };

  return (
    <div className="modal-backdrop p-3" onClick={close}>
      <div className="w-full max-w-lg rounded-[2.5rem] bg-[#fffaf0] p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute end-5 top-5 grid size-8 place-items-center rounded-full bg-white text-[#37192C] hover:bg-[#FFF3C5] transition">
          <X size={16} />
        </button>

        {/* Tab Headers */}
        <div className="flex border-b border-[#37192c]/10 text-center mb-5 gap-1 pb-1 overflow-x-auto">
          <button
            onClick={() => setTab('profile')}
            className={'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition min-w-[80px] ' + (tab === 'profile' ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-white text-[#37192C] hover:bg-[#FFF3C5]/50')}
          >
            پروفایل
          </button>
          <button
            onClick={() => setTab('orders')}
            className={'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition min-w-[80px] ' + (tab === 'orders' ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-white text-[#37192C] hover:bg-[#FFF3C5]/50')}
          >
            سفارشات ({orders.length})
          </button>
          <button
            onClick={() => setTab('fav')}
            className={'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition min-w-[80px] ' + (tab === 'fav' ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-white text-[#37192C] hover:bg-[#FFF3C5]/50')}
          >
            علاقمندی‌ها ({wishlist?.length || 0})
          </button>
          <button
            onClick={() => setTab('cart')}
            className={'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition min-w-[80px] ' + (tab === 'cart' ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-white text-[#37192C] hover:bg-[#FFF3C5]/50')}
          >
            سبد خرید ({cart.length})
          </button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-full bg-[#37192C] text-[#FFF3C5] font-black text-lg">
                  {user?.firstName ? user.firstName[0] : 'U'}
                </div>
                <div>
                  <h3 className="font-black text-base text-[#37192C]">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-xs text-[#8b627e]">{user?.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1 text-xs font-bold text-[#37192C] bg-[#FFF3C5] px-3 py-1.5 rounded-full hover:bg-[#37192C] hover:text-[#FFF3C5] transition"
              >
                <Edit size={14} /> {editing ? 'انصراف' : 'ویرایش'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">نام</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full p-2 rounded-xl border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">نام خانوادگی</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full p-2 rounded-xl border bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">ایمیل</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 rounded-xl border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">تلفن</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 rounded-xl border bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">آدرس تحویل</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 rounded-xl border bg-white h-20"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-full bg-[#37192C] text-[#FFF3C5] font-bold">
                  ذخیره تغییرات
                </button>
              </form>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="bg-white p-3 rounded-2xl border flex justify-between">
                  <span className="text-[#8b627e] font-bold">نام و خانوادگی:</span>
                  <span className="font-bold">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border flex justify-between">
                  <span className="text-[#8b627e] font-bold">شماره همراه:</span>
                  <span className="font-bold">{user?.phone}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border flex justify-between">
                  <span className="text-[#8b627e] font-bold">ایمیل:</span>
                  <span className="font-bold">{user?.email || 'ثبت نشده'}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border">
                  <span className="text-[#8b627e] font-bold block mb-1">آدرس ارسال:</span>
                  <span className="font-bold leading-6">{user?.address || 'آدرسی ثبت نشده است'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cart Tab */}
        {tab === 'cart' && (
          <div>
            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-[#8b627e]">
                سبد خرید شما خالی است.
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item: Product, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-2xl border text-xs font-bold">
                      <div className="flex items-center gap-3">
                        <img src={item.images[0]} alt={item.name} className="size-10 rounded-lg object-cover" />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#37192C]">{money(item.price)} تومان</span>
                        <button
                          onClick={() => setCart((prev: Product[]) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:bg-rose-50 p-1 rounded-full"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-black">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-base text-[#37192C]">{money(total)} تومان</span>
                </div>
                <button onClick={() => { close(); openCheckout(); }} className="mt-4 w-full rounded-full bg-[#37192C] py-3.5 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition">
                  تکمیل سفارش و پرداخت
                </button>
              </>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {tab === 'fav' && (
          <div>
            {(!wishlist || wishlist.length === 0) ? (
              <div className="py-8 text-center text-xs font-bold text-[#8b627e]">
                هیچ محصولی در لیست علاقمندی‌ها وجود ندارد.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {wishlist.map((item: Product) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border text-xs font-bold">
                    <button
                      onClick={() => { close(); openProduct(item); }}
                      className="flex items-center gap-3 text-right hover:opacity-80 transition"
                    >
                      <img src={item.images[0]} alt={item.name} className="size-10 rounded-lg object-cover" />
                      <div>
                        <div className="truncate max-w-[150px]">{item.name}</div>
                        <div className="text-[11px] text-[#8b627e]">{money(item.price)} تومان</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { close(); openProduct(item); }}
                      className="px-3 py-1.5 rounded-full bg-[#FFF3C5] text-[#37192C] text-[11px] font-bold"
                    >
                      مشاهده
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-[#8b627e]">
                هنوز هیچ سفارشی ثبت نکرده‌اید.
              </div>
            ) : (
              orders.map((o: Order) => (
                <div key={o.id} onClick={() => openOrderDetails(o)} className="p-4 bg-white rounded-2xl border text-xs cursor-pointer hover:border-[#37192C]/40 transition">
                  <div className="flex justify-between font-bold">
                    <span>شماره سفارش: {o.orderNumber}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{o.orderStatus}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-[11px] text-[#8b627e]">
                    <span>مبلغ: {money(o.totalAmount)} تومان</span>
                    <span>روش ارسال: {o.shippingMethod.title}</span>
                  </div>
                </div>
              ))
            )}
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
