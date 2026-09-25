import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Facebook,
  Filter,
  Grid,
  Headphones,
  Heart,
  Home,
  Instagram,
  Menu,
  Minus,
  PackageCheck,
  PackageOpen,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
  Truck,
  UserCheck,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import './index.css';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  colors: string[];
  description: string;
};

const satinImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%2337192C"/><circle cx="100" cy="100" r="70" fill="%23FFF3C5"/><path d="M70 120 Q100 60 130 120" stroke="%2337192C" stroke-width="8" fill="none"/></svg>';
const jewelryImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23FFF3C5"/><circle cx="100" cy="100" r="60" fill="%2337192C"/><polygon points="100,50 115,85 150,85 120,105 132,140 100,120 68,140 80,105 50,85 85,85" fill="%23FFF3C5"/></svg>';

const categories = [
  ['تل', satinImage], ['کش', satinImage], ['اسکرانچی', satinImage], ['کلیپس', satinImage],
  ['گیره پینترستی', jewelryImage], ['گیره بچگانه', satinImage], ['کانزاشی', satinImage], ['تل توری و مجلسی', jewelryImage],
  ['زیورآلات مرواریدی', jewelryImage], ['دست‌بافت میوکی', jewelryImage], ['بدلیجات طرح جواهری', jewelryImage],
];

const generateTen = (titlePrefix: string, category: string, basePrice: number, isDiscounted = false): Product[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: Math.floor(Math.random() * 100000) + i + 100,
    name: `${titlePrefix} کد ${i + 1}`,
    category,
    price: basePrice + i * 15000,
    oldPrice: isDiscounted ? basePrice + i * 15000 + 45000 : undefined,
    image: category === 'ساعت' ? jewelryImage : (i % 2 === 0 ? satinImage : jewelryImage),
    badge: isDiscounted ? 'تخفیف ویژه' : (i % 3 === 0 ? 'جدید' : undefined),
    colors: ['#37192C', '#FFF3C5', '#B9A8D4'],
    description: `محصول ${titlePrefix} با کیفیت عالی، رنگ‌بندی پاستیلی و بسته‌بندی هدیه‌ای آورا.`
  }));
};

const newestProducts = generateTen('محصول تازه', 'جدیدترین‌ها', 150000);
const bestSellerProducts = generateTen('پرفروش آورا', 'پرفروش‌ترین‌ها', 210000);
const specialDiscountProducts = generateTen('آیتم ویژه', 'تخفیف ویژه', 170000, true);
const watchProducts = generateTen('ساعت زنانه آورا', 'ساعت', 390000, true);

const money = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

function App() {
  const [intro, setIntro] = useState(true);
  const [followModal, setFollowModal] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [categoryNotice, setCategoryNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountView, setAccountView] = useState<{ tab: 'profile' | 'cart' | 'fav' | 'history' } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const menuSections = [
    { id: 'home', label: 'خانه' },
    { id: 'stories', label: 'دسته‌بندی‌ها' },
    { id: 'new-products', label: 'تازه رسیده‌ها' },
    { id: 'best-sellers', label: 'پرطرفدارها' },
    { id: 'sale-products', label: 'فرصت‌های خوش‌رنگ' },
    { id: 'journal', label: 'مجله' },
    { id: 'cart-summary', label: 'سبد خرید' },
  ];
  const goToSection = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

  useEffect(() => {
    const timer = window.setTimeout(() => { setIntro(false); setFollowModal(true); }, 6000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % 4), 4800);
    return () => window.clearInterval(timer);
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, product) => sum + product.price, 0), [cart]);
  const addToCart = (product: Product) => { setCart((current) => [...current, product]); setSelected(null); };
  const banners = [
    { eyebrow: 'دست‌ساز، برای تو', title: 'لطافتِ کوچکِ هر روز', subtitle: 'اکسسوری‌هایی که با رنگ و جزئیاتشان، حال خوب می‌سازند.', image: satinImage },
    { eyebrow: 'NEW DROP', title: 'درخشش آرام مروارید', subtitle: 'مجموعه‌ای ظریف برای قرارهای خاطره‌انگیز تو.', image: jewelryImage },
    { eyebrow: 'AURAVIBE EDIT', title: 'یاسی، شیری، رویایی', subtitle: 'جزئیات کوچک، امضای استایل شخصی تو هستند.', image: satinImage },
    { eyebrow: 'هدیه‌ای برای خودت', title: 'یک انتخاب دوست‌داشتنی', subtitle: 'برای تو، برای یک لبخند، برای همین امروز.', image: jewelryImage },
  ];

  return (
    <main className="pb-nav min-h-screen overflow-x-hidden bg-[#fffaf0] text-[#37192C]">
      {intro && <Intro />}
      {followModal && <FollowModal close={() => setFollowModal(false)} />}
      <header className="sticky top-0 z-30 border-b border-[#37192c]/8 bg-[#fffaf0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button className="grid size-11 place-items-center rounded-full hover:bg-[#37192c]/7 md:hidden" data-testid="menu-button" aria-label="منو" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
          <a className="brand-font text-2xl tracking-[.08em] sm:text-3xl" href="#home" data-testid="site-brand">AuraVibe</a>
          <nav className="hidden items-center gap-7 text-sm md:flex"><a href="#stories">دسته‌بندی‌ها</a><a href="#collection">کالکشن‌ها</a><a href="#journal">مجله</a></nav>
          <div className="flex items-center gap-1">
            <button className="icon-button relative" data-testid="cart-button" aria-label="سبد خرید" onClick={() => setAccountView({ tab: 'cart' })}><ShoppingBag size={20} />{cart.length > 0 && <span className="absolute -end-0 -top-0 grid size-5 place-items-center rounded-full bg-[#37192C] text-[10px] text-white">{cart.length}</span>}</button>
          </div>
        </div>
      </header>

      <section id="home" className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3"><div><p className="label">انتخاب کن، بدرخش</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">دسته‌بندی‌های محبوب</h1></div><ChevronLeft className="mb-1" /></div>
        <div id="stories" className="story-row mt-5" data-testid="categories-list">
          {categories.map(([name, image]) => <button key={name} onClick={() => setCategoryNotice(`نمایش محصولات «${name}» به‌زودی با کالکشن کامل این دسته آماده می‌شود.`)} className="group w-[105px] shrink-0 text-center" data-testid={'category-' + name}><span className="story-ring"><img src={image} alt={name} /></span><span className="mt-2 block text-xs font-semibold leading-5">{name}</span></button>)}
        </div>
        {categoryNotice && <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fff3c5] px-4 py-3 text-sm" data-testid="category-notice">{categoryNotice}<button onClick={() => setCategoryNotice('')}><X size={17} /></button></div>}
      </section>

      <section className="relative mt-10 overflow-hidden" data-testid="banner-carousel">
        <div className="banner-shell" style={{ transform: `translateX(-${bannerIndex * 100}%)` }}>
          {banners.map((banner) => <article className="relative w-full shrink-0 overflow-hidden" key={banner.title}><img src={banner.image} alt="کالکشن AuraVibe" className="absolute inset-0 size-full object-cover opacity-45" /><div className="banner-overlay" /><div className="relative mx-auto flex min-h-[520px] w-full max-w-7xl flex-col justify-end px-5 pb-16 sm:min-h-[620px] sm:px-8 lg:px-12"><p className="label text-[#FFF3C5]">{banner.eyebrow}</p><h2 className="mt-3 max-w-lg text-4xl font-black leading-tight text-white sm:text-6xl">{banner.title}</h2><p className="mt-4 max-w-md text-base leading-8 text-white/85">{banner.subtitle}</p><a href="#collection" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF3C5] px-5 py-3 text-sm font-bold transition hover:scale-105">دیدن کالکشن <ArrowLeft size={17} /></a></div></article>)}
        </div>
        <button onClick={() => setBannerIndex((bannerIndex + 3) % 4)} className="carousel-arrow start-4" aria-label="بنر قبل" data-testid="previous-banner"><ChevronRight /></button><button onClick={() => setBannerIndex((bannerIndex + 1) % 4)} className="carousel-arrow end-4" aria-label="بنر بعد" data-testid="next-banner"><ChevronLeft /></button>
        <div className="absolute bottom-6 start-1/2 flex -translate-x-1/2 gap-2">{banners.map((_, index) => <button key={index} onClick={() => setBannerIndex(index)} className={'h-2.5 rounded-full transition-all ' + (index === bannerIndex ? 'w-7 bg-[#FFF3C5]' : 'w-2.5 bg-white/60')} aria-label={`بنر ${index + 1}`} />)}</div>
      </section>

      <section className="mx-auto my-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="social-banner">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#37192C] via-[#5c2d4e] to-[#37192C] p-8 text-[#FFF3C5] shadow-xl sm:p-12">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-right">
            <div>
              <span className="inline-block rounded-full bg-[#FFF3C5]/20 px-4 py-1 text-xs font-bold tracking-wider text-[#FFF3C5]">ارتباط با ما در شبکه‌های اجتماعی</span>
              <h2 className="mt-3 text-2xl font-black sm:text-4xl">به خانواده آورا استایل بپیوندید</h2>
              <p className="mt-2 text-sm text-[#FFF3C5]/80">جدیدترین محصولات، تخفیف‌های ویژه و ایده‌های استایل را در اینستاگرام و بله دنبال کنید.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-[#FFF3C5] px-6 py-3.5 text-sm font-black text-[#37192C] transition hover:scale-105 shadow-md">
                <Instagram size={19} />
                صفحه اینستاگرام
              </a>
              <a href="https://ble.ir" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border-2 border-[#FFF3C5] px-6 py-3.5 text-sm font-black text-[#FFF3C5] transition hover:bg-[#FFF3C5] hover:text-[#37192C]">
                <Send size={19} />
                کانال بله
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="collection" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductSection title="جدیدترین‌ها" intro="تازه‌ترین‌های آورا استایل" items={newestProducts} open={setSelected} onViewMore={(title) => setCategoryNotice(`صفحه «${title}» با تمام محصولات و فیلترهای تخصصی باز شد.`)} testid="new-products" />
        <ProductSection title="پرفروش‌ترین‌ها" intro="محبوب‌ترین انتخاب‌های کاربران" items={bestSellerProducts} open={setSelected} onViewMore={(title) => setCategoryNotice(`صفحه «${title}» با تمام محصولات و فیلترهای تخصصی باز شد.`)} testid="best-sellers" />
        <div id="sale-products"><ProductSection title="تخفیف ویژه" intro="پیشنهادهای استثنایی و محدود" items={specialDiscountProducts} open={setSelected} onViewMore={(title) => setCategoryNotice(`صفحه «${title}» با تمام محصولات و فیلترهای تخصصی باز شد.`)} testid="special-offers" /></div>
        <ProductSection title="ساعت" intro="کالکشن ساعت‌های ظریف و خاص" items={watchProducts} open={setSelected} onViewMore={(title) => setCategoryNotice(`صفحه «${title}» با تمام محصولات و فیلترهای تخصصی باز شد.`)} testid="watches" />
      </div>

      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="faq-section">
        <FaqSection />
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="trust-section">
        <TrustSection />
      </section>

      <section id="journal" className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="journal-section">
        <div className="journal-card p-6 sm:p-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#37192c]/10 pb-6">
            <div>
              <p className="label">مجله استایل آورا</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black">جدیدترین مقالات و ایده‌های مد</h2>
            </div>
            <button
              onClick={() => alert('ورود به صفحه مجله استایل آورا')}
              className="inline-flex items-center gap-2 rounded-full bg-[#37192C] px-6 py-3 text-xs font-bold text-[#FFF3C5] hover:bg-[#5c2d4e]"
            >
              موارد بیشتر
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-[#37192c]/10 overflow-hidden bg-white">
              <img src={jewelryImage} alt="مقاله‌ ۱" className="h-48 w-full object-cover" />
              <div className="p-5">
                <span className="text-[10px] font-bold text-[#8b627e]">ترند فصل</span>
                <h3 className="mt-2 text-base font-bold text-[#37192C]">راهنمای ست کردن زیورآلات مرواریدی</h3>
                <p className="mt-2 text-xs leading-6 text-[#37192C]/70">چگونه مرواریدهای کلاسیک را با استایل مدرن خیابانی هماهنگ کنیم...</p>
              </div>
            </article>
            <article className="rounded-2xl border border-[#37192c]/10 overflow-hidden bg-white">
              <img src={satinImage} alt="مقاله‌ ۲" className="h-48 w-full object-cover" />
              <div className="p-5">
                <span className="text-[10px] font-bold text-[#8b627e]">مراقبت از اکسسوری</span>
                <h3 className="mt-2 text-base font-bold text-[#37192C]">روش‌های نگهداری از کش و کلیپس ساتن</h3>
                <p className="mt-2 text-xs leading-6 text-[#37192C]/70">نکات کلیدی برای شستشو و حفظ درخشش پارچه ساتن آورا...</p>
              </div>
            </article>
            <article className="rounded-2xl border border-[#37192c]/10 overflow-hidden bg-white">
              <img src={jewelryImage} alt="مقاله‌ ۳" className="h-48 w-full object-cover" />
              <div className="p-5">
                <span className="text-[10px] font-bold text-[#8b627e]">ترکیب رنگ</span>
                <h3 className="mt-2 text-base font-bold text-[#37192C]">هارمونی بنفش آلیره و کرم وانیلی</h3>
                <p className="mt-2 text-xs leading-6 text-[#37192C]/70">چگونه رنگ‌های اصلی برند آورا را در پوشش روزانه به کار ببریم...</p>
              </div>
            </article>
          </div>
        </div>
      </section>


      <footer className="mt-16 bg-[#FFF3C5] border-t border-[#37192c]/10 py-12 text-[#37192C]" data-testid="site-footer">
        <div className="mx-auto grid w-full max-w-7xl gap-9 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="brand-font text-3xl font-black">AuraVibe</div>
            <p className="mt-4 text-xs leading-7 text-[#37192C]/80">فروشگاه تخصصی اکسسوری و زیورآلات ظریف با تم کرم وانیلی و بنفش آلیره. جزئیات کوچکی که استایل شما را درخشان‌تر می‌کنند.</p>
          </div>
          <FooterLinks title="خرید" links={['جدیدترین‌ها', 'پرفروش‌ترین‌ها', 'تخفیف ویژه', 'ساعت']} />
          <FooterLinks title="راهنما" links={['روش ارسال', 'تعویض و بازگشت', 'سوالات پرتکرار', 'مجله استایل']} />
          <div>
            <h3 className="font-bold text-base">ارتباط با ما</h3>
            <a className="mt-4 block text-sm font-semibold" href="tel:02100000000">پشتیبانی: ۰۲۱-۰۰۰۰۰۰۰۰</a>
            <a className="mt-2 block text-sm font-semibold" href="mailto:hello@auravibe.ir">ایمیل: hello@auravibe.ir</a>
            <p className="mt-4 text-xs leading-6 text-[#37192C]/60">تمامی حقوق برای برند AuraVibe محفوظ است.</p>
          </div>
        </div>
      </footer>

      <button className="support-button" onClick={() => setSupportOpen(true)} data-testid="support-button" aria-label="پشتیبانی"><Headphones size={22} /></button>
      {supportOpen && <Support close={() => setSupportOpen(false)} />}
      {selected && <ProductModal product={selected} close={() => setSelected(null)} add={addToCart} />}
      {menuOpen && <SectionMenu sections={menuSections} close={() => setMenuOpen(false)} go={goToSection} />}
      {searchOpen && <SearchModal close={() => setSearchOpen(false)} openProduct={setSelected} />}
      {accountView && <AccountView tab={accountView.tab} setTab={(tab) => setAccountView({ tab })} close={() => setAccountView(null)} cart={cart} total={cartTotal} openProduct={setSelected} />}

      <nav className="bottom-nav" dir="ltr" data-testid="bottom-nav">
        <button className="bottom-nav-item" onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })} aria-label="خانه" data-testid="nav-home"><Home size={22} /></button>
        <button className="bottom-nav-item" onClick={() => setSearchOpen(true)} aria-label="جستجو" data-testid="nav-search"><Search size={22} /></button>
        <button className="bottom-nav-item" onClick={() => setAccountView({ tab: 'profile' })} aria-label="حساب کاربری" data-testid="nav-account"><UserRound size={22} /></button>
      </nav>
    </main>
  );
}

function TrustSection() {
  const trustBadges = [
    { icon: <Truck size={28} />, title: 'ارسال سریع و مطمئن', desc: 'تحویل به موقع در سراسر کشور' },
    { icon: <ShieldCheck size={28} />, title: 'تضمین اصالت کالا', desc: 'استفاده از بهترین متریال' },
    { icon: <RefreshCw size={28} />, title: '۷ روز ضمانت بازگشت', desc: 'تعویض بدون قید و شرط' },
    { icon: <Headphones size={28} />, title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی سریع در تمام ساعات' },
  ];
  return (
    <div className="rounded-[2.5rem] bg-[#37192C] p-8 sm:p-12 text-[#FFF3C5]">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-block rounded-full bg-[#FFF3C5]/20 px-4 py-1 text-xs font-bold tracking-wider text-[#FFF3C5]">خرید امن و با خیال راحت</span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-black">مطمئن خرید کنید</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#FFF3C5]/10 border border-[#FFF3C5]/15">
            <div className="grid size-14 place-items-center rounded-2xl bg-[#FFF3C5] text-[#37192C] shadow-md mb-4">
              {badge.icon}
            </div>
            <h3 className="text-base font-bold text-white">{badge.title}</h3>
            <p className="mt-1.5 text-xs text-[#FFF3C5]/70 leading-6">{badge.desc}</p>
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

function Intro() { return <div className="intro-screen" data-testid="intro-teaser"><div className="intro-orb intro-orb-one" /><div className="intro-orb intro-orb-two" /><div className="relative text-center"><div className="line-logo"><span>A</span><i /><span>V</span></div><p className="brand-font mt-5 text-3xl tracking-[.18em]">AuraVibe</p><p className="mt-4 text-xs tracking-[.26em] text-[#37192C]/60">MADE FOR YOUR LITTLE JOYS</p></div></div> }
function FollowModal({ close }: { close: () => void }) { return <div className="modal-backdrop"><div className="follow-modal"><button className="absolute end-5 top-5" onClick={close} aria-label="بستن"><X size={20} /></button><div className="mx-auto grid size-16 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"><Heart fill="currentColor" /></div><h2 className="mt-5 text-xl font-black">با ما نزدیک‌تر باش</h2><p className="mt-3 text-sm leading-7 text-[#37192C]/70">برای دیدن پشت‌صحنه‌ها، محصولات تازه و حال‌وهوای AuraVibe ما را دنبال کن.</p><div className="mt-6 flex justify-center gap-3"><a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="اینستاگرام"><Instagram /></a><a href="https://t.me" target="_blank" rel="noreferrer" className="social-icon" aria-label="تلگرام"><Send /></a><a href="https://ble.ir" target="_blank" rel="noreferrer" className="social-icon" aria-label="بله"><Facebook /></a></div><button onClick={close} className="mt-6 text-sm font-bold underline underline-offset-4">فعلاً فقط می‌خوام فروشگاه را ببینم</button></div></div> }
function ProductSection({ title, intro, items, open, onViewMore, testid }: { title: string; intro: string; items: Product[]; open: (p: Product) => void; onViewMore: (title: string) => void; testid: string }) {
  return (
    <section className="mt-15">
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
          onClick={() => onViewMore(title)}
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
function ProductCard({ product, open }: { product: Product; open: (p: Product) => void }) { return <button onClick={() => open(product)} className="product-card group text-right" data-testid={'product-' + product.id}><div className="relative aspect-[.83] overflow-hidden rounded-[1.55rem] bg-[#f1e4c8]"><img src={product.image} alt={product.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />{product.badge && <span className="absolute end-3 top-3 rounded-full bg-[#FFF3C5] px-2.5 py-1 text-[10px] font-bold">{product.badge}</span>}</div><h3 className="mt-3 truncate text-sm font-bold">{product.name}</h3><div className="mt-1 flex items-center gap-2 text-xs"><span className="font-black">{money(product.price)} تومان</span>{product.oldPrice && <del className="text-[#37192C]/45">{money(product.oldPrice)}</del>}</div></button> }
function ProductModal({ product, close, add }: { product: Product; close: () => void; add: (p: Product) => void }) {
  const [count, setCount] = useState(1);
  const [color, setColor] = useState(product.colors[0]);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    { name: 'سارا', text: 'کیفیتش واقعاً فوق‌العاده بود و بسته‌بندی خیلی زیبایی داشت!' },
    { name: 'مریم', text: 'دقیقاً مطابق عکس بود و رنگش بسیار دلنشینه.' }
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, { name: 'کاربر آورا', text: newComment }]);
    setNewComment('');
  };

  return (
    <div className="modal-backdrop p-3">
      <div className="product-modal max-h-[90vh] overflow-y-auto" data-testid="product-modal">
        <button className="absolute end-5 top-5 z-10 grid size-10 place-items-center rounded-full bg-white/80 shadow-sm" onClick={close} aria-label="بستن">
          <X size={20} />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="min-h-[300px] bg-[#f3e7cd]">
            <img src={product.image} alt={product.name} className="size-full max-h-[570px] object-cover" />
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="label">{product.category}</span>
                {product.badge && <span className="rounded-full bg-[#FFF3C5] px-3 py-1 text-[11px] font-bold text-[#37192C]">{product.badge}</span>}
              </div>
              <h2 className="mt-2 text-2xl font-black text-[#37192C]">{product.name}</h2>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-black text-[#37192C]">{money(product.price)} تومان</span>
                {product.oldPrice && (
                  <del className="text-sm font-semibold text-[#37192C]/45">{money(product.oldPrice)} تومان</del>
                )}
              </div>
              <p className="mt-5 text-xs sm:text-sm leading-7 text-[#37192C]/80">{product.description}</p>

              <div className="mt-6">
                <p className="text-xs font-bold text-[#37192C]">انتخاب رنگ</p>
                <div className="mt-2.5 flex gap-3">
                  {product.colors.map((item) => (
                    <button
                      onClick={() => setColor(item)}
                      key={item}
                      className={'size-8 rounded-full border-2 ' + (color === item ? 'border-[#37192C] outline outline-2 outline-offset-2 outline-[#37192C]/40' : 'border-white')}
                      style={{ backgroundColor: item }}
                      aria-label="انتخاب رنگ"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
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
                  onClick={() => { for (let i = 0; i < count; i += 1) add(product); }}
                  className="flex-1 rounded-full bg-[#37192C] py-3.5 text-sm font-bold text-[#FFF3C5] transition hover:bg-[#5c2d4e]"
                  data-testid="add-to-cart"
                >
                  افزودن به سبد خرید
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-[#37192c]/10 pt-5">
              <p className="text-xs font-bold text-[#37192C] mb-3">نظرات خریداران ({comments.length})</p>
              <div className="space-y-2 max-h-36 overflow-y-auto pe-1">
                {comments.map((c, i) => (
                  <div key={i} className="rounded-xl bg-[#FFF3C5]/40 p-3 text-xs">
                    <span className="font-bold text-[#37192C] block">{c.name}:</span>
                    <p className="mt-1 text-[#37192C]/80">{c.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="نظر شما درباره این محصول..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 rounded-full border border-[#37192c]/20 bg-white px-4 py-2 text-xs text-[#37192C] outline-none"
                />
                <button type="submit" className="rounded-full bg-[#37192C] px-4 py-2 text-xs font-bold text-[#FFF3C5]">ثبت</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function MiniProduct({ product, open }: { product: Product; open: (p: Product) => void }) { return <button onClick={() => open(product)} className="min-w-0 text-right"><img src={product.image} className="aspect-square w-full rounded-2xl object-cover" alt={product.name} /><span className="mt-2 block truncate text-xs font-bold">{product.name}</span></button> }
function FooterLinks({ title, links }: { title: string; links: string[] }) { return <div><h3 className="font-bold">{title}</h3><div className="mt-4 space-y-3">{links.map((link) => <a href="#collection" key={link} className="block text-sm text-[#37192C]/70 hover:text-[#37192C]">{link}</a>)}</div></div> }
function Support({ close }: { close: () => void }) {
  const [answer, setAnswer] = useState('');
  const [liveChat, setLiveChat] = useState(false);
  const faqs = [
    { q: 'سفارشم کی می‌رسه؟', a: 'بعد از آماده‌سازی، سفارش شما با پست پیشتاز ارسال شده و ظرف ۲ الی ۴ روز کاری تحویل می‌گردد.' },
    { q: 'امکان تعویض هست؟', a: 'بله، تا ۷ روز پس از دریافت کالا امکان تعویض وجود دارد.' },
    { q: 'آیا محصولات ضد حساسیت هستند؟', a: 'بله تمامی بدلیجات از استیل ضدحساسیت و بدون نیکل ساخته شده‌اند.' }
  ];

  return (
    <div className="support-panel" data-testid="support-panel">
      <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-3">
        <div>
          <span className="label">پشتیبانی هوشمند آورا</span>
          <h2 className="mt-0.5 text-sm font-black text-[#37192C]">چگونه می‌توانم کمکتان کنم؟</h2>
        </div>
        <button onClick={close} className="grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
          <X size={16} />
        </button>
      </div>

      {!liveChat ? (
        <>
          <p className="mt-3 text-[11px] leading-5 text-[#37192C]/70">پاسخ‌های هوشمند به سوالات پرتکرار:</p>
          <div className="mt-3 space-y-1.5">
            {faqs.map((faq) => (
              <button
                key={faq.q}
                onClick={() => setAnswer(faq.a)}
                className="w-full rounded-xl bg-[#fffaf0] p-2.5 text-right text-xs font-bold text-[#37192C] hover:bg-[#FFF3C5] transition border border-[#37192c]/5"
              >
                {faq.q}
              </button>
            ))}
          </div>
          {answer && (
            <div className="mt-3 rounded-xl bg-[#FFF3C5] p-3 text-xs leading-6 text-[#37192C] font-semibold" data-testid="support-answer">
              {answer}
            </div>
          )}
          <button
            onClick={() => setLiveChat(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#37192C] py-2.5 text-xs font-bold text-[#FFF3C5]"
          >
            <Headphones size={15} /> گفت‌وگو با پشتیبان زنده
          </button>
        </>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-[#FFF3C5]/60 p-3 text-xs leading-6 text-[#37192C]">
            پشتیبان آنلاین در حال متصل شدن است... پیام خود را بنویسید.
          </div>
          <textarea
            placeholder="پیام شما برای پشتیبان آورا استایل..."
            rows={3}
            className="w-full rounded-xl border border-[#37192c]/20 bg-white p-2.5 text-xs outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => alert('پیام شما ارسال شد. پشتیبان به‌زودی پاسخ خواهد داد.')}
              className="flex-1 rounded-full bg-[#37192C] py-2 text-xs font-bold text-[#FFF3C5]"
            >
              ارسال پیام
            </button>
            <button
              onClick={() => setLiveChat(false)}
              className="rounded-full bg-[#FFF3C5] px-4 py-2 text-xs font-bold text-[#37192C]"
            >
              بازگشت
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function SearchModal({ close, openProduct }: { close: () => void; openProduct: (p: Product) => void }) {
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');

  const allProducts = useMemo(() => [
    ...newestProducts,
    ...bestSellerProducts,
    ...specialDiscountProducts,
    ...watchProducts,
  ], []);

  const filtered = useMemo(() => {
    return allProducts.filter((item) => {
      const matchQuery = item.name.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase());
      const matchCat = selectedCategory === 'همه' || item.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [allProducts, query, selectedCategory]);

  return (
    <div className="modal-backdrop p-0 sm:p-4" data-testid="search-modal">
      <div className="h-full w-full max-w-xl bg-[#fffaf0] sm:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
        {/* Instagram Header Search Bar */}
        <div className="flex items-center gap-2 border-b border-[#37192c]/10 bg-white p-4">
          <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-[#efefef] px-3.5 py-2">
            <Search size={18} className="text-[#8e8e8e] shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#262626] outline-none font-sans placeholder-[#8e8e8e]"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="grid size-5 place-items-center rounded-full bg-[#c7c7c7] text-white">
                <X size={12} />
              </button>
            )}
          </div>
          <button onClick={() => setFilterOpen(true)} className="grid size-10 place-items-center rounded-xl bg-[#37192C] text-[#FFF3C5]" aria-label="فیلتر">
            <SlidersHorizontal size={18} />
          </button>
          <button onClick={close} className="grid size-10 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C]" aria-label="بستن">
            <X size={20} />
          </button>
        </div>

        {/* Product Results Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[#37192C]">نتایج جستجو ({filtered.length})</span>
            {selectedCategory !== 'همه' && <span className="rounded-full bg-[#FFF3C5] px-3 py-1 text-[10px] font-bold text-[#37192C]">دسته: {selectedCategory}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((product, idx) => (
              <button
                key={product.id + '-' + idx}
                onClick={() => { openProduct(product); close(); }}
                className="group rounded-2xl border border-[#37192c]/10 bg-white p-2 text-right transition hover:shadow-md"
              >
                <img src={product.image} alt={product.name} className="aspect-square w-full rounded-xl object-cover" />
                <h4 className="mt-2 truncate text-xs font-bold text-[#37192C]">{product.name}</h4>
                <p className="mt-1 text-[11px] font-black text-[#37192C]">{money(product.price)} تومان</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Overlay */}
      {filterOpen && (
        <div className="modal-backdrop p-4" onClick={() => setFilterOpen(false)}>
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#37192c]/10">
              <h3 className="font-black text-[#37192C]">فیلتر بر اساس دسته‌بندی</h3>
              <button onClick={() => setFilterOpen(false)} className="grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['همه', 'جدیدترین‌ها', 'پرفروش‌ترین‌ها', 'تخفیف ویژه', 'ساعت', 'اسکرانچی', 'کلیپس', 'تل'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setFilterOpen(false); }}
                  className={'rounded-full px-4 py-2 text-xs font-bold transition ' + (selectedCategory === cat ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-[#FFF3C5]/60 text-[#37192C]')}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionMenu({ sections, close, go }: { sections: { id: string; label: string }[]; close: () => void; go: (id: string) => void }) { return <><div className="menu-drawer-backdrop" onClick={close} /><div className="menu-drawer" data-testid="section-menu"><div className="flex items-center justify-between pb-3 border-b border-[#37192c]/10"><span className="brand-font text-xl text-[#37192C]">AuraVibe</span><button onClick={close} className="grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]" aria-label="بستن"><X size={18} /></button></div><div className="mt-5 space-y-1.5">{sections.map((section) => <button key={section.id} onClick={() => go(section.id)} className="menu-link" data-testid={'menu-link-' + section.id}><span>{section.label}</span><ChevronLeft size={16} className="text-[#37192C]/40" /></button>)}</div></div></> }
function AccountView({ tab, setTab, close, cart, total, openProduct }: { tab: 'profile' | 'cart' | 'fav' | 'history'; setTab: (tab: 'profile' | 'cart' | 'fav' | 'history') => void; close: () => void; cart: Product[]; total: number; openProduct: (p: Product) => void }) {
  const [userInfo, setUserInfo] = useState({
    name: 'آرتین کریمی',
    username: 'artin_aura',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    email: 'artin@auravibe.ir',
    address: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی، کوچه دوم، پلاک ۱۵',
    postalCode: '۱۹۶۸۷۱۲۳۴۵'
  });
  const [editing, setEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const favorites = [newestProducts[0], bestSellerProducts[1], watchProducts[0]];
  const history = [
    { id: 'ORD-9821', date: '۱۴۰۳/۰۶/۱۵', price: 434000, status: 'تحویل داده شده', items: [newestProducts[0], newestProducts[1]] },
    { id: 'ORD-9412', date: '۱۴۰۳/۰۵/۰۲', price: 289000, status: 'تحویل داده شده', items: [watchProducts[1]] }
  ];

  return (
    <div className="modal-backdrop p-0 sm:p-3" onClick={close} data-testid="account-view">
      <div className="h-full w-full max-w-lg bg-[#fffaf0] sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Instagram Profile Header */}
        <div className="flex items-center justify-between border-b border-[#37192c]/10 bg-white px-5 py-3.5">
          <span className="font-bold text-[#37192C] font-mono" style={{ fontFamily: 'system-ui, sans-serif' }}>{userInfo.username}</span>
          <button onClick={close} className="grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Instagram Profile Info Box */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative">
              <div className="size-20 rounded-full border-2 border-[#37192C] p-1 bg-gradient-to-tr from-[#FFF3C5] to-[#37192C]">
                <div className="grid size-full place-items-center rounded-full bg-[#37192C] text-[#FFF3C5] font-black text-xl">
                  {userInfo.name.charAt(0)}
                </div>
              </div>
            </div>
            <div className="flex flex-1 justify-around text-center">
              <div>
                <span className="block font-black text-[#37192C] text-base">{favorites.length}</span>
                <span className="text-[11px] text-[#37192C]/70">علاقه‌مندی</span>
              </div>
              <div>
                <span className="block font-black text-[#37192C] text-base">{cart.length}</span>
                <span className="text-[11px] text-[#37192C]/70">سبد خرید</span>
              </div>
              <div>
                <span className="block font-black text-[#37192C] text-base">{history.length}</span>
                <span className="text-[11px] text-[#37192C]/70">خریدها</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-black text-sm text-[#37192C]">{userInfo.name}</h3>
            <p className="text-xs text-[#37192C]/70 mt-1 leading-5">مشتری ویژه آورا استایل ✨️ علاقه‌مند به اکسسوری‌های ساتن و زیورآلات مرواریدی</p>
          </div>

          {savedNotice && (
            <div className="mt-3 rounded-xl bg-[#FFF3C5] p-2.5 text-center text-xs font-bold text-[#37192C]">
              اطلاعات با موفقیت ویرایش و ثبت گردید.
            </div>
          )}

          {/* Instagram Profile Tabs */}
          <div className="mt-6 flex border-b border-[#37192c]/10 text-center">
            <button
              onClick={() => setTab('fav')}
              className={'flex-1 py-3 flex justify-center items-center gap-1.5 border-b-2 text-xs font-bold transition ' + (tab === 'fav' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
              title="علاقه‌مندی‌ها"
            >
              <Heart size={18} />
              <span>علاقه‌مندی‌ها</span>
            </button>
            <button
              onClick={() => setTab('cart')}
              className={'flex-1 py-3 flex justify-center items-center gap-1.5 border-b-2 text-xs font-bold transition ' + (tab === 'cart' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
              title="سبد خرید"
            >
              <ShoppingBag size={18} />
              <span>سبد خرید</span>
            </button>
            <button
              onClick={() => setTab('profile')}
              className={'flex-1 py-3 flex justify-center items-center gap-1.5 border-b-2 text-xs font-bold transition ' + (tab === 'profile' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
              title="اطلاعات کاربر"
            >
              <UserCheck size={18} />
              <span>اطلاعات</span>
            </button>
            <button
              onClick={() => setTab('history')}
              className={'flex-1 py-3 flex justify-center items-center gap-1.5 border-b-2 text-xs font-bold transition ' + (tab === 'history' ? 'border-[#37192C] text-[#37192C]' : 'border-transparent text-[#37192C]/40')}
              title="سابقه خرید"
            >
              <Clock size={18} />
              <span>سابقه خرید</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {tab === 'fav' && (
              <div className="grid grid-cols-3 gap-2">
                {favorites.map((item) => (
                  <button key={item.id} onClick={() => { openProduct(item); close(); }} className="aspect-square overflow-hidden rounded-xl bg-white border border-[#37192c]/10">
                    <img src={item.image} alt={item.name} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {tab === 'cart' && (
              <div>
                {cart.length ? (
                  <>
                    <div className="space-y-3 max-h-60 overflow-y-auto pe-1">
                      {cart.map((item, idx) => (
                        <div key={item.id + '-' + idx} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 border border-[#37192c]/10">
                          <img src={item.image} alt={item.name} className="size-14 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-bold text-[#37192C]">{item.name}</p>
                            <p className="mt-1 text-[11px] font-black text-[#37192C]">{money(item.price)} تومان</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#37192c]/10 pt-3">
                      <span className="text-xs font-bold text-[#37192C]">مبلغ قابل پرداخت</span>
                      <span className="font-black text-[#37192C]">{money(total)} تومان</span>
                    </div>
                    <button onClick={() => alert('پرداخت با موفقیت شبیه‌سازی شد.')} className="mt-3 w-full rounded-full bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5]">
                      تکمیل و پرداخت سفارش
                    </button>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-[#37192C]/70">سبد خرید شما خالی است.</div>
                )}
              </div>
            )}

            {tab === 'profile' && (
              <div>
                {editing ? (
                  <form onSubmit={handleSaveInfo} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#37192C]">نام و نام خانوادگی</label>
                      <input
                        type="text"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#37192C]">شماره همراه</label>
                      <input
                        type="text"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#37192C]">آدرس کامل تحویل</label>
                      <textarea
                        value={userInfo.address}
                        onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#37192C]">کد پستی</label>
                      <input
                        type="text"
                        value={userInfo.postalCode}
                        onChange={(e) => setUserInfo({ ...userInfo, postalCode: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 text-xs outline-none"
                      />
                    </div>
                    <button type="submit" className="w-full rounded-full bg-[#37192C] py-2.5 text-xs font-bold text-[#FFF3C5]">
                      ذوب و ثبت تغییرات
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#37192c]/10 text-xs">
                    <div className="flex justify-between border-b border-[#37192c]/5 pb-2">
                      <span className="text-[#37192C]/60">نام:</span>
                      <span className="font-bold text-[#37192C]">{userInfo.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#37192c]/5 pb-2">
                      <span className="text-[#37192C]/60">شماره همراه:</span>
                      <span className="font-bold text-[#37192C]">{userInfo.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#37192c]/5 pb-2">
                      <span className="text-[#37192C]/60">کد پستی:</span>
                      <span className="font-bold text-[#37192C]">{userInfo.postalCode}</span>
                    </div>
                    <div className="border-b border-[#37192c]/5 pb-2">
                      <span className="text-[#37192C]/60 block mb-1">آدرس ارسال:</span>
                      <span className="font-bold text-[#37192C] leading-5 block">{userInfo.address}</span>
                    </div>
                    <button onClick={() => setEditing(true)} className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-[#FFF3C5] py-2 text-xs font-bold text-[#37192C]">
                      <Edit size={14} /> ویرایش مشخصات و آدرس
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'history' && (
              <div className="space-y-3">
                {history.map((order) => (
                  <div key={order.id} className="rounded-2xl bg-white p-4 border border-[#37192c]/10 text-xs">
                    <div className="flex items-center justify-between border-b border-[#37192c]/5 pb-2">
                      <span className="font-mono font-bold text-[#37192C]">{order.id}</span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">{order.status}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-[#37192C]/70">
                      <span>تاریخ: {order.date}</span>
                      <span className="font-bold text-[#37192C]">{money(order.price)} تومان</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
