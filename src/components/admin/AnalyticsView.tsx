import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { AnalyticsCharts, DateRangeOption } from '../AnalyticsCharts';
import { db } from '../../services/db';

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('thisMonth');
  const [compareMode, setCompareMode] = useState(true);

  const products = db.getProducts();
  const orders = db.getOrders();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

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
          <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">↑ ۱4.۲٪ مقایسه با دوره قبل</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">تعداد کل سفارشات</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{totalOrders.toLocaleString('fa-IR')} عدد</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">↑ ۹.۵٪ نرخ تبدیل خریدار</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">میانگین مبلغ هر سفارش (AOV)</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">{avgOrderValue.toLocaleString('fa-IR')} تومان</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-[#8b627e]">محاسبه‌شده بر اساس تمام سبدها</span>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-[#37192C]/60">تعداد کالاهای فروخته شده</span>
          <h3 className="mt-2 text-2xl font-black text-[#37192C]">۱۸۴ عدد</h3>
          <span className="mt-1 inline-block text-[11px] font-bold text-purple-600">پرفروش‌ترین: گردنبند مروارید</span>
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
          <div className="space-y-3">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-[#fffaf0] p-3 text-xs border">
                <div className="flex items-center gap-3">
                  <img src={p.images[0]} alt={p.name} className="size-10 rounded-lg object-cover" />
                  <div>
                    <strong className="text-[#37192C]">{p.name}</strong>
                    <div className="text-[10px] text-[#8b627e]">{p.productCode}</div>
                  </div>
                </div>
                <span className="font-black text-[#37192C]">{p.price.toLocaleString('fa-IR')} تومان</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#37192C]">سهم درآمد دسته‌بندی‌ها (Category Revenue)</h3>
          <div className="space-y-3 text-xs">
            {[
              { cat: 'گردنبند و نیم‌ست', pct: 42, rev: '۵,۲۳۰,۰۰۰ تومان' },
              { cat: 'ساعت مچی زنانه', pct: 28, rev: '۳,۴۸۰,۰۰۰ تومان' },
              { cat: 'اسکرانچی و کش مو', pct: 18, rev: '۲,۲۴۰,۰۰۰ تومان' },
              { cat: 'انگشتر و گوشواره', pct: 12, rev: '۱,۵۰۰,۰۰۰ تومان' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-bold text-[#37192C]">
                  <span>{item.cat}</span>
                  <span>{item.rev} ({item.pct}٪)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#fffaf0] border border-[#37192c]/10">
                  <div className="h-full bg-[#37192C]" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
