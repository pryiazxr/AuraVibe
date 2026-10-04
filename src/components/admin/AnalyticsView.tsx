import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { AnalyticsCharts, DateRangeOption } from '../AnalyticsCharts';
import { db } from '../../services/db';

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('thisMonth');
  const [compareMode, setCompareMode] = useState(true);

  const products = db.getProducts();
  const orders = db.getOrders();

  // Filter orders by selected date range
  const now = new Date();

  const filteredOrders = orders.filter((o) => {
    const oDate = new Date(o.createdAt);
    if (isNaN(oDate.getTime())) return true;

    if (dateRange === 'today') {
      return oDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'thisWeek' || dateRange === 'last7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return oDate >= sevenDaysAgo;
    }
    if (dateRange === 'thisMonth' || dateRange === 'last30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return oDate >= thirtyDaysAgo;
    }
    return true;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const totalItemsSold = filteredOrders.reduce(
    (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  // Calculate Best Selling Products from filtered orders
  const productSalesMap: Record<number, { name: string; code: string; image: string; count: number; revenue: number }> = {};

  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
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

  const topSellingProducts = Object.values(productSalesMap).sort((a, b) => b.count - a.count);

  // Category Revenue Share
  const categoryRevMap: Record<string, number> = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod?.category || 'اکسسوری';
      categoryRevMap[cat] = (categoryRevMap[cat] || 0) + item.lineTotal;
    });
  });

  const categoryShare = Object.entries(categoryRevMap).map(([cat, rev]) => ({
    cat,
    rev,
    pct: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0
  })).sort((a, b) => b.rev - a.rev);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">گزارش‌ها و تحلیل هوشمند فروش (Analytics & Decision Support)</h2>
          <p className="text-xs text-[#8b627e]">تحلیل KPIهای درآمد، ارزش میانگین سفارشات، مقایسه بازه‌های زمانی و پرفروش‌ترین‌ها</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">درآمد کل دوره</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{totalRevenue.toLocaleString('fa-IR')} تومان</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">بر اساس سفارشات ثبت شده</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">تعداد کل سفارشات</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{totalOrders.toLocaleString('fa-IR')} عدد</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">تعداد سفارش خریداران</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">میانگین مبلغ هر سفارش (AOV)</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{avgOrderValue.toLocaleString('fa-IR')} تومان</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-[#8b627e]">محاسبه‌شده از دیتابیس سفارشات</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">تعداد کالاهای فروخته شده</span>
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
        compareMode={compareMode}
        setCompareMode={setCompareMode}
      />

      {/* Product & Category Sales Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#37192C]">پرفروش‌ترین محصولات (Best Sellers)</h3>
          {topSellingProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8b627e] font-bold">هیچ سفارشی در این بازه زمانی وجود ندارد.</div>
          ) : (
            <div className="space-y-3">
              {topSellingProducts.slice(0, 4).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-[#fffaf0] p-3 text-xs border">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="size-10 rounded-lg object-cover" />
                    <div>
                      <strong className="text-[#37192C]">{p.name}</strong>
                      <div className="text-[10px] text-[#8b627e]">{p.code} - {p.count} عدد فروخته شده</div>
                    </div>
                  </div>
                  <span className="font-black text-[#37192C]">{p.revenue.toLocaleString('fa-IR')} تومان</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#37192C]">سهم درآمد دسته‌بندی‌ها (Category Revenue)</h3>
          {categoryShare.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8b627e] font-bold">هیچ سفارشی در این بازه زمانی وجود ندارد.</div>
          ) : (
            <div className="space-y-3 text-xs">
              {categoryShare.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold text-[#37192C]">
                    <span>{item.cat}</span>
                    <span>{item.rev.toLocaleString('fa-IR')} تومان ({item.pct}٪)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#fffaf0] border border-[#37192c]/10">
                    <div className="h-full bg-[#37192C]" style={{ width: `${item.pct}%` }} />
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
