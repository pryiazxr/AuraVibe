import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  Truck,
  MapPin,
  ChevronDown,
  X,
  CheckCircle,
  XCircle,
  FileText,
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, ShippingMethodKey, db, AdminUser } from '../../services/db';

type OrderManagementViewProps = {
  currentAdmin: AdminUser;
};

export function OrderManagementView({ currentAdmin }: OrderManagementViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Custom Dropdown Open States
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [formStatusOpen, setFormStatusOpen] = useState(false);
  const [formShippingOpen, setFormShippingOpen] = useState(false);

  // Selected Order for Modal Details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('سفارش جدید');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('در حال بررسی');
  const [statusNote, setStatusNote] = useState('');
  const [shippingMethodKey, setShippingMethodKey] = useState<ShippingMethodKey>('POST');
  const [viewingReceiptModal, setViewingReceiptModal] = useState<string | null>(null);
  const [formPaymentStatusOpen, setFormPaymentStatusOpen] = useState(false);

  const refreshList = async () => {
    try {
      const list = await db.getOrders();
      setOrders(list);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    refreshList();
    const unsub = db.subscribe(() => {
      refreshList();
    });
    return () => unsub();
  }, []);

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setShippingMethodKey(order.shippingMethod.key);
    setStatusNote('');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    await db.updateOrderPaymentStatus(
      selectedOrder.id,
      newPaymentStatus,
      newStatus,
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` },
      statusNote
    );

    await refreshList();
    setSelectedOrder(null);
  };

  const handleApproveCardToCard = async (order: Order) => {
    if (window.confirm(`آیا از تأیید پرداخت کارت‌به‌کارت سفارش ${order.orderNumber} اطمینان دارید؟`)) {
      await db.updateOrderPaymentStatus(
        order.id,
        'پرداخت تأیید شده',
        'در حال آماده‌سازی',
        { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` },
        'پرداخت کارت‌به‌کارت توسط ادمین تأیید شد و سفارش وارد مرحله آماده‌سازی گردید.'
      );
      await refreshList();
      setSelectedOrder(null);
    }
  };

  const handleRejectCardToCard = async (order: Order) => {
    const reason = window.prompt('لطفاً علت رد پرداخت کارت‌به‌کارت را وارد نمایید (مثال: رسید نامعتبر یا عدم واریز وجه):', 'عدم انطباق یا ناخوانا بودن رسید پرداخت');
    if (reason !== null) {
      await db.updateOrderPaymentStatus(
        order.id,
        'رد شده',
        'لغو شده',
        { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` },
        `پرداخت کارت‌به‌کارت رد شد. علت: ${reason}`
      );
      await refreshList();
      setSelectedOrder(null);
    }
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
      case 'سفارش جدید':
      case 'جدید':
      case 'در انتظار پرداخت':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'در حال بررسی پرداخت':
      case 'در حال بررسی':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'پرداخت کارت‌به‌کارت تأیید شد':
      case 'تأیید شده':
      case 'در حال آماده‌سازی':
      case 'آماده ارسال':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'تحویل به شرکت حمل':
      case 'ارسال شده':
      case 'تکمیل شده':
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

  const getPaymentStatusBadgeClass = (pStatus: PaymentStatus) => {
    switch (pStatus) {
      case 'پرداخت تأیید شده':
      case 'پرداخت شده':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'در حال بررسی':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'در انتظار پرداخت':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'رد شده':
      case 'ناموفق':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const allOrderStatuses: OrderStatus[] = [
    'سفارش جدید',
    'در انتظار پرداخت',
    'در حال بررسی پرداخت',
    'پرداخت کارت‌به‌کارت تأیید شد',
    'در حال آماده‌سازی',
    'آماده ارسال',
    'ارسال شده',
    'تکمیل شده',
    'لغو شده'
  ];

  const allPaymentStatuses: PaymentStatus[] = [
    'در حال بررسی',
    'پرداخت تأیید شده',
    'پرداخت شده',
    'در انتظار پرداخت',
    'ناموفق',
    'رد شده'
  ];

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

      {/* Search & Custom Filter */}
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

          {/* Custom Status Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              className="flex items-center justify-between gap-2 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-4 py-2.5 text-xs font-bold text-[#37192C] w-full sm:w-48"
            >
              <span>{statusFilter === 'all' ? 'همه وضعیت‌ها' : statusFilter}</span>
              <ChevronDown size={16} />
            </button>
            {statusFilterOpen && (
              <div className="absolute z-30 mt-1 w-full rounded-2xl border bg-white p-1.5 shadow-xl max-h-60 overflow-y-auto space-y-1">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setStatusFilterOpen(false);
                  }}
                  className="w-full text-right rounded-xl px-3 py-2 text-xs font-bold text-[#37192C] hover:bg-[#fffaf0]"
                >
                  همه وضعیت‌ها
                </button>
                {allStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setStatusFilterOpen(false);
                    }}
                    className={
                      'w-full text-right rounded-xl px-3 py-2 text-xs font-bold transition ' +
                      (statusFilter === st ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fffaf0]')
                    }
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
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
                <th className="p-4">روش پرداخت</th>
                <th className="p-4">رسید پرداخت</th>
                <th className="p-4">مبلغ کل</th>
                <th className="p-4">وضعیت پرداخت</th>
                <th className="p-4">وضعیت سفارش</th>
                <th className="p-4 text-center">عملیات</th>
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
                  <td className="p-4 font-bold text-[#37192C]">
                    {o.paymentMethod === 'online_gateway' ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-[10px]">
                        <CreditCard size={12} /> آنلاین ({o.paymentGatewayProvider || 'درگاه'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#37192C] bg-[#FFF3C5] px-2.5 py-1 rounded-full text-[10px]">
                        💳 کارت به کارت
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {o.paymentReceiptUrl ? (
                      <button
                        onClick={() => setViewingReceiptModal(o.paymentReceiptUrl!)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                      >
                        <ImageIcon size={14} /> مشاهده رسید
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-semibold">بدون رسید</span>
                    )}
                  </td>
                  <td className="p-4 font-black text-[#37192C]">{o.totalAmount.toLocaleString('fa-IR')} تومان</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 font-bold text-[10px] border ${getPaymentStatusBadgeClass(o.paymentStatus)}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 font-bold text-[10px] border ${getStatusBadgeClass(o.orderStatus)}`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {o.paymentMethod === 'card_to_card' && o.paymentStatus === 'در حال بررسی' && (
                        <>
                          <button
                            onClick={() => handleApproveCardToCard(o)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            title="تأیید کارت‌به‌کارت"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => handleRejectCardToCard(o)}
                            className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                            title="رد کارت‌به‌کارت"
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openDetails(o)}
                        className="p-1.5 rounded-lg bg-[#FFF3C5] text-[#37192C] hover:bg-[#ffe79a] transition"
                        title="مشاهده فاکتور و ویرایش"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
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
            <div className="border-b border-[#37192c]/10 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#8b627e]">{selectedOrder.orderNumber}</span>
                <h3 className="text-xl font-black text-[#37192C] mt-1">جزئیات کامل فاکتور و وضعیت پرداختی</h3>
              </div>

              {selectedOrder.paymentMethod === 'card_to_card' && selectedOrder.paymentStatus === 'در حال بررسی' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveCardToCard(selectedOrder)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs"
                  >
                    <CheckCircle size={16} /> تأیید کارت‌به‌کارت
                  </button>
                  <button
                    onClick={() => handleRejectCardToCard(selectedOrder)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs"
                  >
                    <XCircle size={16} /> رد کارت‌به‌کارت
                  </button>
                </div>
              )}
            </div>

            {/* Customer & Payment Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Info Box */}
              <div className="rounded-2xl border border-[#37192c]/10 bg-[#fffaf0] p-4 text-xs space-y-2">
                <h4 className="font-bold text-[#37192C] flex items-center gap-1.5">
                  <MapPin size={16} /> اطلاعات خریدار و آدرس:
                </h4>
                <div className="space-y-1 text-[#37192C]/80 font-semibold">
                  <div><strong>نام:</strong> {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</div>
                  <div><strong>تلفن:</strong> {selectedOrder.customer.phone}</div>
                  <div><strong>مقصد:</strong> {selectedOrder.customer.province} - {selectedOrder.customer.city}</div>
                  <div><strong>کد پستی:</strong> {selectedOrder.customer.postalCode}</div>
                  <div><strong>آدرس:</strong> {selectedOrder.customer.fullAddress}</div>
                </div>
              </div>

              {/* Payment Details Box */}
              <div className="rounded-2xl border border-[#37192c]/10 bg-[#FFF3C5]/30 p-4 text-xs space-y-2">
                <h4 className="font-bold text-[#37192C] flex items-center gap-1.5">
                  <CreditCard size={16} /> اطلاعات و روش پرداخت:
                </h4>
                <div className="space-y-1 text-[#37192C]">
                  <div><strong>روش پرداخت:</strong> {selectedOrder.paymentMethod === 'online_gateway' ? 'درگاه پرداخت آنلاین' : 'کارت به کارت بانکی'}</div>
                  <div><strong>وضعیت پرداخت:</strong> <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${getPaymentStatusBadgeClass(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</span></div>
                  <div><strong>مبلغ فاکتور:</strong> <span className="font-black text-sm">{selectedOrder.totalAmount.toLocaleString('fa-IR')} تومان</span></div>

                  {selectedOrder.paymentReceiptUrl && (
                    <div className="pt-2 border-t border-[#37192c]/10">
                      <span className="font-bold block mb-1">تصویر رسید واریزی:</span>
                      <button
                        onClick={() => setViewingReceiptModal(selectedOrder.paymentReceiptUrl!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#37192c]/20 rounded-xl font-bold text-xs hover:bg-[#FFF3C5] transition"
                      >
                        <ImageIcon size={16} /> مشاهده کامل تصویر رسید
                      </button>
                    </div>
                  )}
                </div>
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
                      <tr key={idx} className="hover:bg-[#fffaf0] transition">
                        <td className="p-3 flex items-center gap-2 font-bold text-[#37192C]">
                          <img src={item.productImage} alt={item.productName} className="size-10 rounded-lg object-cover" />
                          <span className="text-xs">{item.productName}</span>
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
              <h4 className="font-black text-[#37192C]">تغییر وضعیت سفارش و پرداخت:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Custom Order Status Selector */}
                <div className="relative">
                  <label className="font-bold text-[#37192C] block mb-1">وضعیت سفارش</label>
                  <button
                    type="button"
                    onClick={() => setFormStatusOpen(!formStatusOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 font-bold text-[#37192C]"
                  >
                    <span>{newStatus}</span>
                    <ChevronDown size={16} />
                  </button>
                  {formStatusOpen && (
                    <div className="absolute z-30 mt-1 w-full rounded-2xl border bg-white p-1.5 shadow-xl max-h-52 overflow-y-auto space-y-1">
                      {allOrderStatuses.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setNewStatus(st);
                            setFormStatusOpen(false);
                          }}
                          className={
                            'w-full text-right rounded-xl px-3 py-2 text-xs font-bold transition ' +
                            (newStatus === st ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fffaf0]')
                          }
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Payment Status Selector */}
                <div className="relative">
                  <label className="font-bold text-[#37192C] block mb-1">وضعیت پرداخت</label>
                  <button
                    type="button"
                    onClick={() => setFormPaymentStatusOpen(!formPaymentStatusOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 font-bold text-[#37192C]"
                  >
                    <span>{newPaymentStatus}</span>
                    <ChevronDown size={16} />
                  </button>
                  {formPaymentStatusOpen && (
                    <div className="absolute z-30 mt-1 w-full rounded-2xl border bg-white p-1.5 shadow-xl max-h-52 overflow-y-auto space-y-1">
                      {allPaymentStatuses.map((pst) => (
                        <button
                          key={pst}
                          type="button"
                          onClick={() => {
                            setNewPaymentStatus(pst);
                            setFormPaymentStatusOpen(false);
                          }}
                          className={
                            'w-full text-right rounded-xl px-3 py-2 text-xs font-bold transition ' +
                            (newPaymentStatus === pst ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fffaf0]')
                          }
                        >
                          {pst}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#37192C]">یادداشت تغییر وضعیت (در تایم‌لاین خریدار ثبت می‌شود)</label>
                <input
                  type="text"
                  placeholder="مثال: واریزی تأیید شد و مرسوله جهت بسته‌بندی تحویل گردید."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none font-semibold"
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
                    {event.note && <p className="text-[11px] text-[#37192C]/70 ps-4 font-semibold">{event.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High Res Receipt Modal */}
      {viewingReceiptModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-xs" onClick={() => setViewingReceiptModal(null)}>
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewingReceiptModal(null)}
              className="absolute top-4 end-4 grid size-9 place-items-center rounded-full bg-[#37192C] text-[#FFF3C5] z-10"
            >
              <X size={18} />
            </button>
            <div className="font-bold text-sm text-[#37192C] mb-3 border-b pb-2">تصویر رسید پرداخت آپلود شده توسط خریدار:</div>
            <img src={viewingReceiptModal} alt="رسید پرداخت" className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
