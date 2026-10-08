import React, { useState, useEffect } from 'react';
import { Lock, ShoppingBag, ShieldAlert } from 'lucide-react';
import { AnalyticsCharts, DateRangeKey } from '../AnalyticsCharts';
import { db, AdminUser, Product, Order } from '../../services/db';
import { ProductThumbnail } from '../ProductThumbnail';

type AnalyticsViewProps = {
  currentAdmin: AdminUser;
  onSelectProduct?: (product: Product) => void;
};

export function AnalyticsView({ currentAdmin, onSelectProduct }: AnalyticsViewProps) {
  const [dateRange, setDateRange] = useState<DateRangeKey>('30days');
  const [customDays, setCustomDays] = useState<number>(30);
  const [compareMode, setCompareMode] = useState<boolean>(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [validOrders, setValidOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [prods, vo] = await Promise.all([
          db.getProducts(),
          db.getValidOrders()
        ]);
        if (active) {
          setProducts(prods);
          setValidOrders(vo);
        }
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      }
    };

    load();
    const unsub = db.subscribe(() => {
      load();
    });

    return () => {
      active = false;
      unsub();
    };
  }, []);

  // SUPER ADMIN RESTRICTION
  if (currentAdmin.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl bg-white p-8 text-center border border-[#37192c]/10 shadow-sm space-y-4">
        <div className="grid size-16 place-items-center rounded-full bg-rose-100 text-rose-600">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-black text-[#37192C]">دسترسی محدود شده است</h2>
        <p className="text-xs text-[#8b627e] max-w-md font-bold leading-6">
          بخش «گزارشات و آمار فروش» و تحلیل مالی تنها برای مدیر کل (Super Admin) قابل مشاهده و دسترسی می‌باشد.
        </p>
      </div>
    );
  }

  const now = new Date();

  let periodDays = 30;
  if (dateRange === '1day') periodDays = 1;
  else if (dateRange === '7days') periodDays = 7;
  else if (dateRange === '30days') periodDays = 30;
  else if (dateRange === '365days') periodDays = 365;
  else if (dateRange === 'custom') periodDays = Math.max(1, customDays || 30);

  const startTime = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Filter valid orders by time range
  const filteredOrders = validOrders.filter((o) => {
    const oDate = new Date(o.createdAt);
    return oDate >= startTime && oDate <= now;
  });

  // Calculate KPIs
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const totalItemsSold = filteredOrders.reduce(
    (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  // Top Selling Products (Exactly Top 20)
  const productSalesMap: Record<number, { productId: number; name: string; code: string; image: string; count: number; revenue: number }> = {};

  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          productId: item.productId,
          name: item.productName,
          code: item.productCode,
          image: item.productImage,
          count: 0,
          revenue: 0
        };
      }
      productSalesMap[item.productId].count += item.quantity;
      productSalesMap[item.productId].revenue += item.lineTotal;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Category Revenue Share (PURE CATEGORIES ONLY - Excluding Badges)
  const categoryRevMap: Record<string, number> = {};

  // Standard Categories list in system
  const defaultCategories = [
    'ساعت',
    'تل',
    'کش',
    'اسکرانچی',
    'کلیپس',
    'گیره پینترستی',
    'گیره بچگانه',
    'کانزاشی',
    'تل توری و مجلسی',
    'زیور آلات مرواریدی',
    'دست بافت میوکی',
    'بدلیجات طرح جواهر',
    'گردنبند',
    'دستبند',
    'گوشواره',
    'انگشتر',
    'نیم ست'
  ];

  // Initialize revenue map for all categories
  defaultCategories.forEach((cat) => {
    categoryRevMap[cat] = 0;
  });

  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod?.category || 'گردنبند';
      // Ensure badge names like "تخفیف ویژه" or "جدیدترین‌ها" are not counted as categories
      if (['تخفیف ویژه', 'جدیدترین‌ها', 'پرفروش‌ترین‌ها'].includes(cat)) {
        categoryRevMap['گردنبند'] = (categoryRevMap['گردنبند'] || 0) + item.lineTotal;
      } else {
        categoryRevMap[cat] = (categoryRevMap[cat] || 0) + item.lineTotal;
      }
    });
  });

  const categoryShare = Object.entries(categoryRevMap)
    .map(([cat, rev]) => ({
      cat,
      rev,
      pct: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0
    }))
    .sort((a, b) => b.rev - a.rev);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">گزارشات و آمار فروش (Analytics & Reports)</h2>
          <p className="text-xs text-[#8b627e]">تحلیل KPIهای دقیق بر اساس سفارشات واقعی، مقایسه با دوره قبل و سهم دسته‌بندی‌ها</p>
        </div>
        <span className="rounded-full bg-[#37192C] px-3.5 py-1 text-[11px] font-bold text-[#FFF3C5]">
          دسترسی اختصاصی Super Admin
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">درآمد کل دوره</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{totalRevenue.toLocaleString('fa-IR')} تومان</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">بر اساس سفارشات معتبر</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">تعداد سفارشات</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{totalOrders.toLocaleString('fa-IR')} عدد</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">سفارش‌های معتبر ثبت شده</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">میانگین مبلغ هر سفارش (AOV)</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{avgOrderValue.toLocaleString('fa-IR')} تومان</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-[#8b627e]">ارزش متوسط هر سفارش معتبر</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">تعداد کل کالاهای فروخته‌شده</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{totalItemsSold.toLocaleString('fa-IR')} عدد</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-purple-600">
            {topSellingProducts[0] ? `پرفروش‌ترین: ${topSellingProducts[0].name}` : 'بدون فروش'}
          </span>
        </div>
      </div>

      {/* Interactive Timeline Chart */}
      <AnalyticsCharts
        dateRange={dateRange}
        setDateRange={setDateRange}
        customDays={customDays}
        setCustomDays={setCustomDays}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
      />

      {/* Top 20 Best Selling Products - Horizontal Carousel */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#37192C]">پرفروش‌ترین محصولات (۲۰ محصول برتر)</h3>
            <p className="text-[11px] text-[#8b627e] font-bold">مرتب‌شده بر اساس تعداد واحد فروخته‌شده در بازه زمانی (اسکرول افقی)</p>
          </div>
        </div>

        {topSellingProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8b627e] font-bold">هیچ سفارشی در این بازه زمانی وجود ندارد.</div>
        ) : (
          <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 select-none">
            {topSellingProducts.map((p, idx) => (
              <div
                key={p.productId}
                onClick={() => {
                  const targetProd = products.find((item) => item.id === p.productId);
                  if (targetProd && onSelectProduct) {
                    onSelectProduct(targetProd);
                  } else {
                    window.dispatchEvent(
                      new CustomEvent('auravibe:open-product-id', { detail: { productId: p.productId } })
                    );
                  }
                }}
                className="group shrink-0 w-48 rounded-2xl border border-[#37192c]/15 bg-[#fffaf0] p-3 text-right hover:border-[#37192C] transition shadow-xs hover:shadow-md flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <ProductThumbnail
                    productId={p.productId}
                    image={p.image}
                    alt={p.name}
                    allProducts={products}
                    containerClassName="relative aspect-square w-full overflow-hidden rounded-xl bg-white mb-2 block"
                    className="size-full object-cover group-hover:scale-105 transition"
                  >
                    <span className="absolute top-2 start-2 grid size-6 place-items-center rounded-full bg-[#37192C] text-[10px] font-black text-[#FFF3C5]">
                      #{idx + 1}
                    </span>
                  </ProductThumbnail>
                  <h4 className="font-bold text-xs text-[#37192C] line-clamp-2">{p.name}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-[#37192c]/10 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#8b627e]">تعداد فروش:</span>
                  <span className="font-black text-[#37192C] bg-[#FFF3C5] px-2 py-0.5 rounded-full">{p.count} عدد</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Revenue Share */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-[#37192C]">سهم درآمد دسته‌بندی‌ها (Category Revenue Share)</h3>
          <p className="text-[11px] text-[#8b627e] font-bold">محاسبه بر اساس دسته‌بندی‌های واقعی محصولات سایت (بدون باج و برچسب)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {categoryShare.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-[#37192c]/10 bg-[#fffaf0] p-3 space-y-1">
              <div className="flex justify-between font-bold text-[#37192C]">
                <span>{item.cat}</span>
                <span>{item.rev.toLocaleString('fa-IR')} تومان ({item.pct}٪)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white border border-[#37192c]/10">
                <div className="h-full bg-[#37192C]" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
