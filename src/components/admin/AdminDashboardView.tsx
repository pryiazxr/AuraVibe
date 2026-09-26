import React from 'react';
import {
  BarChart3,
  ShoppingBag,
  Box,
  Image,
  PlusCircle,
  Activity,
  ArrowUpRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db } from '../../services/db';

type AdminDashboardViewProps = {
  navigateToTab: (tab: any) => void;
  openProductModal: () => void;
  openBannerModal: () => void;
};

export function AdminDashboardView({ navigateToTab, openProductModal, openBannerModal }: AdminDashboardViewProps) {
  const products = db.getProducts();
  const banners = db.getBanners();
  const orders = db.getOrders();
  const auditLogs = db.getAuditLogs().slice(0, 5);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeBannersCount = banners.filter((b) => b.active).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <button
          onClick={() => navigateToTab('analytics')}
          className="group text-right rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#37192C]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#37192C]/60">کل درآمد فروش</span>
            <div className="grid size-10 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C] group-hover:scale-105 transition">
              <BarChart3 size={20} />
            </div>
          </div>
          <h3 className="mt-3 text-2xl font-black text-[#37192C]">
            {totalRevenue.toLocaleString('fa-IR')} تومان
          </h3>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ArrowUpRight size={14} /> <span>+۱۲.۵٪ نسبت به بازه قبل</span>
          </div>
        </button>

        {/* New Orders Card */}
        <button
          onClick={() => navigateToTab('orders')}
          className="group text-right rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#37192C]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#37192C]/60">سفارشات نیازمند بررسی</span>
            <div className="grid size-10 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C] group-hover:scale-105 transition">
              <ShoppingBag size={20} />
            </div>
          </div>
          <h3 className="mt-3 text-2xl font-black text-[#37192C]">
            {orders.length.toLocaleString('fa-IR')} سفارش
          </h3>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-600">
            <Clock size={14} /> <span>آخرین سفارش ثبت شده هم‌اکنون</span>
          </div>
        </button>

        {/* Active Products Card */}
        <button
          onClick={() => navigateToTab('products')}
          className="group text-right rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#37192C]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#37192C]/60">تعداد محصولات فعال</span>
            <div className="grid size-10 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C] group-hover:scale-105 transition">
              <Box size={20} />
            </div>
          </div>
          <h3 className="mt-3 text-2xl font-black text-[#37192C]">
            {products.length.toLocaleString('fa-IR')} کالا
          </h3>
          <div className="mt-2 text-[11px] font-bold text-[#8b627e]">آماده فروش در کاتالوگ آنلاین</div>
        </button>

        {/* Active Banners Card */}
        <button
          onClick={() => navigateToTab('banners')}
          className="group text-right rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#37192C]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#37192C]/60">بنرهای فعال صفحه اصلی</span>
            <div className="grid size-10 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C] group-hover:scale-105 transition">
              <Image size={20} />
            </div>
          </div>
          <h3 className="mt-3 text-2xl font-black text-[#37192C]">
            {activeBannersCount.toLocaleString('fa-IR')} اسلاید
          </h3>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 size={14} /> <span>در حال چرخش مستقیم در سایت</span>
          </div>
        </button>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black text-[#37192C]">میانبر عملیات فوری ادمین (Quick Shortcuts)</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={openProductModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-xs"
          >
            <PlusCircle size={16} /> افزودن محصول جدید
          </button>
          <button
            onClick={openBannerModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#FFF3C5] py-3 text-xs font-bold text-[#37192C] hover:bg-[#ffe79a] transition shadow-xs"
          >
            <Image size={16} /> افزودن بنر تبلیغاتی
          </button>
          <button
            onClick={() => navigateToTab('orders')}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 py-3 text-xs font-bold text-[#37192C] hover:bg-[#FFF3C5] transition"
          >
            <ShoppingBag size={16} /> بررسی سفارش‌ها
          </button>
          <button
            onClick={() => navigateToTab('audit')}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 py-3 text-xs font-bold text-[#37192C] hover:bg-[#FFF3C5] transition"
          >
            <Activity size={16} /> لوگ‌های امنیتی
          </button>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-[#37192c]/5 pb-3">
          <div>
            <h3 className="text-sm font-black text-[#37192C]">آخرین سفارشات ثبت شده (۵ سفارش اخیر)</h3>
            <p className="text-[11px] text-[#8b627e]">برای جزییات کامل روی سفارش کلیک کنید</p>
          </div>
          <button
            onClick={() => navigateToTab('orders')}
            className="flex items-center gap-1 text-xs font-bold text-[#37192C] hover:text-[#8b627e]"
          >
            مشاهده مدیریت سفارشات <ChevronLeft size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              onClick={() => navigateToTab('orders')}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-[#fffaf0] p-4 text-xs border border-[#37192c]/5 cursor-pointer hover:bg-[#FFF3C5]/40 transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-[#37192C] bg-white px-2.5 py-1 rounded-lg border border-[#37192c]/10">
                  {order.orderNumber}
                </span>
                <div>
                  <h4 className="font-bold text-[#37192C]">
                    {order.customer.firstName} {order.customer.lastName} ({order.customer.city})
                  </h4>
                  <p className="text-[10px] text-[#37192C]/60 mt-0.5">
                    {order.items.length} کالا | روش: {order.shippingMethod.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="font-black text-[#37192C]">
                  {order.totalAmount.toLocaleString('fa-IR')} تومان
                </span>
                <span
                  className={
                    'rounded-full px-3 py-1 font-bold text-[11px] ' +
                    (order.orderStatus === 'جدید'
                      ? 'bg-amber-100 text-amber-800'
                      : order.orderStatus === 'تحویل داده شده'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800')
                  }
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Activity Feed */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black text-[#37192C] mb-4">آخرین فعالیت‌های مدیریتی سیستم</h3>
        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-xl bg-[#fffaf0] p-3 text-xs border border-[#37192c]/5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#37192C]" />
                <strong className="text-[#37192C]">{log.adminName}:</strong>
                <span className="text-[#37192C]/80">{log.details}</span>
              </div>
              <span className="text-[10px] text-[#8b627e] font-semibold">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
