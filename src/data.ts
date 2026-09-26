export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  colors: string[];
  description: string;
  relatedIds?: number[];
};

export type Article = {
  id: number;
  title: string;
  digest: string;
  date: string;
  image: string;
  tag: string;
};

export const satinImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><circle cx="150" cy="150" r="100" fill="%23FFF3C5"/><path d="M100 180 Q150 90 200 180" stroke="%2337192C" stroke-width="12" fill="none"/></svg>';
export const jewelryImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="90" fill="%2337192C"/><polygon points="150,75 172,127 225,127 180,157 198,210 150,180 102,210 120,157 75,127 128,127" fill="%23FFF3C5"/></svg>';
export const necklaceImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2337192C"/><path d="M70 80 Q150 220 230 80" stroke="%23FFF3C5" stroke-width="10" fill="none"/><circle cx="150" cy="180" r="22" fill="%23FFF3C5"/></svg>';
export const watchImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23FFF3C5"/><circle cx="150" cy="150" r="75" stroke="%2337192C" stroke-width="10" fill="none"/><line x1="150" y1="150" x2="150" y2="105" stroke="%2337192C" stroke-width="8"/><line x1="150" y1="150" x2="185" y2="150" stroke="%2337192C" stroke-width="8"/></svg>';

export const categoryList = [
  { name: 'تل', image: satinImage },
  { name: 'کش', image: satinImage },
  { name: 'اسکرانچی', image: satinImage },
  { name: 'کلیپس', image: satinImage },
  { name: 'گیره پینترستی', image: jewelryImage },
  { name: 'گیره بچگانه', image: satinImage },
  { name: 'کانزاشی', image: satinImage },
  { name: 'تل توری و مجلسی', image: jewelryImage },
  { name: 'زیورآلات مرواریدی', image: jewelryImage },
  { name: 'دست‌بافت میوکی', image: jewelryImage },
  { name: 'بدلیجات طرح جواهری', image: jewelryImage },
  { name: 'گردنبند', image: necklaceImage },
  { name: 'دستبند', image: jewelryImage },
  { name: 'گوشواره', image: jewelryImage },
  { name: 'انگشتر', image: jewelryImage },
  { name: 'نیم ست', image: necklaceImage },
];

export const generateProducts = (count: number, prefix: string, category: string, basePrice: number, isDiscounted = false): Product[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: Math.floor(Math.random() * 899999) + 100000 + i,
    name: `${prefix} مدل آورا کد ${i + 1}`,
    category,
    price: basePrice + i * 18000,
    oldPrice: isDiscounted || i % 2 === 0 ? basePrice + i * 18000 + 55000 : undefined,
    image: category === 'ساعت' ? watchImage : (category === 'گردنبند' || category === 'نیم ست' ? necklaceImage : (i % 2 === 0 ? satinImage : jewelryImage)),
    badge: isDiscounted ? 'تخفیف ویژه' : (i % 3 === 0 ? 'جدید' : undefined),
    colors: ['#37192C', '#FFF3C5', '#D2B4DE', '#FADBD8'],
    description: `محصول ${prefix} طراحی شده با بهترین متریال ضدحساسیت، رنگ‌بندی جذاب پاستیلی و بسته‌بندی لوکس آورا استایل.`
  }));
};

export const sampleArticles: Article[] = [
  {
    id: 1,
    title: 'استایل لایت آکادمیا چیست؟',
    digest: 'استایل لایت آکادمیا چیست؟ راهنمای کامل لباس و اکسسوری در فصل جدید با رنگ‌های ملایم و کرمی.',
    date: 'شنبه، ۲ خرداد ۱۴۰۵',
    image: satinImage,
    tag: 'ترند فصل'
  },
  {
    id: 2,
    title: 'چه رنگ لباسی بیشتر بهمون میاد؟',
    digest: 'چطور بفهمیم چه رنگ لباسی بیشتر بهمون میاد؟ راهنمای کامل انتخاب رنگ مناسب استایل بر اساس تناژ پوست.',
    date: 'چهارشنبه، ۳۰ اردیبهشت ۱۴۰۵',
    image: jewelryImage,
    tag: 'راهنمای استایل'
  },
  {
    id: 3,
    title: 'استایل اولد مانی چیست؟',
    digest: 'استایل اولد مانی چیست؟ راهنمای کامل ساعت و اکسسوری اولد مانی | وینا اکسسوری و آورا استایل.',
    date: 'سه‌شنبه، ۸ اردیبهشت ۱۴۰۵',
    image: watchImage,
    tag: 'اکسسوری کلاسیک'
  },
  {
    id: 4,
    title: 'رازهای نگهداری زیورآلات استیل و مروارید',
    digest: 'چگونه درخشش زیورآلات و بدلیجات رنگ ثابت را برای مدت طولانی مانند روز اول حفظ کنیم.',
    date: 'یکشنبه، ۲۵ فروردین ۱۴۰۵',
    image: necklaceImage,
    tag: 'مراقبت و نگهداری'
  }
];

export const iranLocations = [
  {
    city: 'تهران',
    districts: [
      { name: 'منطقه ۱ (شمرانات)', neighborhoods: ['الهیه', 'فرشته', 'تجریش', 'نیاوران', 'زعفرانیه'] },
      { name: 'منطقه ۳ (ونک - ولیعصر)', neighborhoods: ['ونک', 'جردن', 'میرداماد', 'ظفر', 'سیدخندان'] },
      { name: 'منطقه ۶ (مرکز)', neighborhoods: ['یوسف‌آباد', 'امیرآباد', 'کریم‌خان', 'میدان ولیعصر', 'بلوار کشاورز'] }
    ]
  },
  {
    city: 'اصفهان',
    districts: [
      { name: 'منطقه ۱ (مرکزی)', neighborhoods: ['چهارباغ', 'عباس‌آباد', 'خاقانی', 'نظر غربی'] },
      { name: 'منطقه ۵ (جلفا)', neighborhoods: ['جلفا', 'حکیم نظامی', 'توحید', 'سنگتراش‌ها'] }
    ]
  },
  {
    city: 'شیراز',
    districts: [
      { name: 'منطقه ۱ (معالی‌آباد)', neighborhoods: ['معالی‌آباد', 'فرهنگ‌شهر', 'قصردشت', 'عفیف‌آباد'] }
    ]
  },
  {
    city: 'مشهد',
    districts: [
      { name: 'منطقه ۱ (احمدآباد)', neighborhoods: ['احمدآباد', 'سجاد', 'فلسطین', 'راهنمایی'] }
    ]
  },
  {
    city: 'تبریز',
    districts: [
      { name: 'منطقه ۱ (ولیعصر)', neighborhoods: ['ولیعصر', 'شاهگلی', 'آبرسان', 'رشدیه'] }
    ]
  }
];
