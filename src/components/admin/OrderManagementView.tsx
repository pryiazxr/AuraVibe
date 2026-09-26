import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UserCheck,
  Send,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Order, OrderStatus, ShippingMethodKey, db, AdminUser } from '../../services/db';

type OrderManagementViewProps = {
  currentAdmin: AdminUser;
};

export function OrderManagementView({ currentAdmin }: OrderManagementViewProps) {
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Order for Modal Details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('جدید');
  const [statusNote, setStatusNote] = useState('');
  const [shippingMethodKey, setShippingMethodKey] = useState<ShippingMethodKey>('POST');

  const refreshList = () => {
    setOrders(db.getOrders());
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShippingMethodKey(order.shippingMethod.key);
    setStatusNote('');
  };

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    db.updateOrderStatus(
      selectedOrder.id,
      newStatus,
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` },
      statusNote,
      shippingMethodKey
    );

    refreshList();
    setSelectedOrder(null);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.firstName.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.lastName.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.phone.includes(search);
      const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'جدید':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'در حال پردازش':
      case 'تأیید شده':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'در حال آماده‌سازی':
      case 'آماده ارسال':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'تحویل به شرکت حمل':
      case 'ارسال شده':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'تحویل داده شده':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'لغو شده':
      case 'مرجوع شده':
      case 'ناموفق / مشکل در ارسال':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">مدیریت سفارشات خریداران (Order Management)</h2>
          <p className="text-xs text-[#8b627e]">بررسی کامل فاکتور، اسنپ‌شات قیمت‌ها، تغییر روش ارسال و تایم‌لاین مراحل</p>
        </div>
        <span className="rounded-full bg-[#FFF3C5] px-4 py-1.5 text-xs font-bold text-[#37192C]">
          تعداد سفارشات: {filteredOrders.length}
        </span>
      </div>

      {/* Search & Filter */}
      <div className="rounded-2xl bg-white p-4 border border-[#37192c]/10 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 px-3.5 py-2.5 w-full">
            <Search size={18} className="text-[#37192C]/50 shrink-0" />
            <input
              type="text"
              placeholder="جستجو بر اساس شماره سفارش (ORD-xxxx)، نام خریدار یا شماره تلفن..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#37192C] outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-4 py-2.5 text-xs font-bold text-[#37192C] outline-none w-full sm:w-auto"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="جدید">جدید</option>
            <option value="در حال آماده‌سازی">در حال آماده‌سازی</option>
            <option value="ارسال شده">ارسال شده</option>
            <option value="تحویل داده شده">تحویل داده شده</option>
            <option value="لغو شده">لغو شده</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#fffaf0] border-b border-[#37192c]/10 text-[#37192C] font-black">
              <tr>
                <th className="p-4">شماره سفارش</th>
                <th className="p-4">خریدار</th>
                <th className="p-4">تاریخ ثبت</th>
                <th className="p-4">روش ارسال</th>
                <th className="p-4">مبلغ کل</th>
                <th className="p-4">وضعیت پرداخت</th>
                <th className="p-4">وضعیت سفارش</th>
                <th className="p-4 text-center">جزئیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#37192c]/5">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#fffaf0]/60 transition">
                  <td className="p-4 font-mono font-bold text-[#37192C]">{o.orderNumber}</td>
                  <td className="p-4">
                    <strong className="text-[#37192C]">{o.customer.firstName} {o.customer.lastName}</strong>
                    <div className="text-[10px] text-[#8b627e]">{o.customer.phone}</div>
                  </td>
                  <td className="p-4 text-[#37192C]/80 font-semibold">{o.timeline[0]?.date || 'امروز'}</td>
                  <td className="p-4 font-bold text-[#37192C]">{o.shippingMethod.title}</td>
                  <td className="p-4 font-black text-[#37192C]">{o.totalAmount.toLocaleString('fa-IR')} تومان</td>
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800">
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 font-bold text-[10px] border ${getStatusBadgeClass(o.orderStatus)}`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => openDetails(o)}
                      className="grid size-8 place-items-center rounded-lg bg-[#FFF3C5] text-[#37192C] hover:bg-[#ffe79a] mx-auto"
                      title="مشاهده فاکتور و ویرایش"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute end-5 top-5 grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="border-b border-[#37192c]/10 pb-4">
              <span className="font-mono text-xs font-bold text-[#8b627e]">{selectedOrder.orderNumber}</span>
              <h3 className="text-xl font-black text-[#37192C] mt-1">جزئیات کامل فاکتور و وضعیت سفارش</h3>
            </div>

            {/* Customer Info Box */}
            <div className="rounded-2xl border border-[#37192c]/10 bg-[#fffaf0] p-4 text-xs space-y-2">
              <h4 className="font-bold text-[#37192C] flex items-center gap-1.5">
                <MapPin size={16} /> اطلاعات خریدار و آدرس تحویل:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#37192C]/80">
                <div><strong>نام و خانوادگی:</strong> {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</div>
                <div><strong>شماره تماس:</strong> {selectedOrder.customer.phone}</div>
                <div><strong>استان و شهر:</strong> {selectedOrder.customer.province} / {selectedOrder.customer.city}</div>
                <div><strong>کد پستی:</strong> {selectedOrder.customer.postalCode}</div>
                <div className="sm:col-span-2"><strong>آدرس دقیق:</strong> {selectedOrder.customer.fullAddress}</div>
              </div>
            </div>

            {/* Product Item Snapshots Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#37192C]">اقلام سفارش (Snapshot ثبت شده هنگام خرید):</h4>
              <div className="rounded-xl border border-[#37192c]/10 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#fffaf0] border-b border-[#37192c]/10 font-bold">
                    <tr>
                      <th className="p-3">محصول</th>
                      <th className="p-3">کد کالا</th>
                      <th className="p-3">قیمت واحد</th>
                      <th className="p-3">تعداد</th>
                      <th className="p-3">جمع کل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#37192c]/5">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 flex items-center gap-2 font-bold text-[#37192C]">
                          <img src={item.productImage} alt={item.productName} className="size-10 rounded-lg object-cover" />
                          <span>{item.productName}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#8b627e]">{item.productCode}</td>
                        <td className="p-3 font-bold text-[#37192C]">{item.finalPrice.toLocaleString('fa-IR')} تومان</td>
                        <td className="p-3 font-bold">{item.quantity}</td>
                        <td className="p-3 font-black text-[#37192C]">{item.lineTotal.toLocaleString('fa-IR')} تومان</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations & Shipping Note */}
            <div className="rounded-2xl border border-[#37192c]/10 bg-[#FFF3C5]/40 p-4 text-xs space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <p className="font-bold text-[#37192C]">روش ارسال: {selectedOrder.shippingMethod.title}</p>
                <p className="text-[11px] font-semibold text-rose-700">{selectedOrder.shippingMethod.costNote}</p>
              </div>
              <div className="text-left font-black text-[#37192C] space-y-1">
                <div>جمع کل محصولات: {selectedOrder.subtotal.toLocaleString('fa-IR')} تومان</div>
                {selectedOrder.discount > 0 && <div className="text-emerald-700">تخفیف: {selectedOrder.discount.toLocaleString('fa-IR')} تومان-</div>}
                <div className="text-base">مبلغ قابل پرداخت: {selectedOrder.totalAmount.toLocaleString('fa-IR')} تومان</div>
              </div>
            </div>

            {/* Status & Shipping Update Form */}
            <form onSubmit={handleUpdateOrder} className="rounded-2xl border border-[#37192c]/10 bg-white p-4 space-y-4 text-xs">
              <h4 className="font-black text-[#37192C]">تغییر وضعیت سفارش و روش ارسال:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#37192C]">وضعیت جدید سفارش</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 font-bold outline-none"
                  >
                    {[
                      'جدید',
                      'در حال بررسی',
                      'تأیید شده',
                      'در حال آماده‌سازی',
                      'آماده ارسال',
                      'تحویل به شرکت حمل',
                      'ارسال شده',
                      'تحویل داده شده',
                      'لغو شده',
                      'مرجوع شده',
                      'ناموفق / مشکل در ارسال'
                    ].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#37192C]">روش ارسال (هزینه پس‌کرایه)</label>
                  <select
                    value={shippingMethodKey}
                    onChange={(e) => setShippingMethodKey(e.target.value as ShippingMethodKey)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 font-bold outline-none"
                  >
                    <option value="POST">پست پیشتاز (سراسر کشور)</option>
                    <option value="TIPAX">تیپاکس (سراسر کشور)</option>
                    <option value="AURA_EXPRESS">پیک اختصاصی آورا (فقط تهران)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#37192C]">یادداشت تغییر وضعیت (در تایم‌لاین خریدار ثبت می‌شود)</label>
                <input
                  type="text"
                  placeholder="مثال: مرسوله تحویل مامور پست گردید."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#37192C] py-3 font-bold text-[#FFF3C5] hover:bg-[#5a2548] shadow-md transition"
              >
                ذخیره تغییرات و اطلاع‌رسانی به خریدار
              </button>
            </form>

            {/* Order Timeline History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#37192C]">تاریخچه و تایم‌لاین تغییرات سفارش (Order Timeline):</h4>
              <div className="space-y-2 border-r-2 border-[#37192C]/20 pe-3 me-1">
                {selectedOrder.timeline.map((event, idx) => (
                  <div key={idx} className="relative pe-4 text-xs space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-[#37192C]">
                      <span className="size-2 rounded-full bg-[#37192C]" />
                      <span>{event.status}</span>
                      <span className="text-[10px] text-[#8b627e]">({event.date} - {event.time})</span>
                    </div>
                    {event.note && <p className="text-[11px] text-[#37192C]/70 ps-4">{event.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
