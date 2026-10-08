import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Copy,
  Check,
  Upload,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  X,
  FileText,
  Home,
  ChevronDown
} from 'lucide-react';
import {
  db,
  CartItem,
  User,
  GeneralSettings,
  OrderItemSnapshot,
  ShippingMethod,
  Order
} from '../services/db';

type CheckoutViewProps = {
  cart: CartItem[];
  total: number;
  user: User | null;
  onBackToCart: () => void;
  onOrderCompleted: (createdOrder: Order) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openHome: () => void;
};

const money = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

export function CheckoutView({
  cart,
  total,
  user,
  onBackToCart,
  onOrderCompleted,
  openAuthModal,
  openHome
}: CheckoutViewProps) {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card_to_card' | 'online_gateway'>('card_to_card');

  // Card to Card state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Order submission state
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<Order | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);

  // Online gateway placeholder modal
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);

  // Shipping Method selection
  const [shippingKey, setShippingKey] = useState<'POST' | 'TIPAX' | 'AURA_EXPRESS'>('POST');
  const [shippingDropdownOpen, setShippingDropdownOpen] = useState(false);

  // Preview Order Number
  const previewOrderNumber = useMemo(() => `ORD-${Math.floor(10000 + Math.random() * 89999)}`, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await db.getGeneralSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings in Checkout:', err);
      }
    };
    fetchSettings();
  }, []);

  const cardInfo = settings?.cardToCardSettings || {
    cardNumber: '۶۰۳۷۹۹۷۵۱۲۳۴۵۶۷۸',
    cardholderName: 'فروشگاه آورا وایب'
  };

  const gatewayInfo = settings?.paymentGatewaySettings || {
    providerName: 'درگاه پرداخت آنلاین',
    gatewayUrl: 'https://api.zarinpal.com/pg/v4/payment/request.json',
    active: false
  };

  const handleCopyCardNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cardInfo.cardNumber.replace(/\s+/g, ''));
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    }
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.oldPrice || item.product.price) * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    return Math.max(0, subtotal - total);
  }, [subtotal, total]);

  const shippingMethods: Record<'POST' | 'TIPAX' | 'AURA_EXPRESS', ShippingMethod> = {
    POST: {
      key: 'POST',
      title: 'پست پیشتاز',
      subtitle: 'تحویل ۲ تا ۴ روز کاری',
      costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
    },
    TIPAX: {
      key: 'TIPAX',
      title: 'تیپاکس سریع',
      subtitle: 'تحویل ۱ تا ۲ روز کاری',
      costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
    },
    AURA_EXPRESS: {
      key: 'AURA_EXPRESS',
      title: 'پیک اختصاصی آورا (تهران)',
      subtitle: 'تحویل همان‌روز',
      costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
    }
  };

  const selectedShipping = shippingMethods[shippingKey];

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (cart.length === 0) {
      alert('سبد خرید شما خالی است.');
      return;
    }

    if (paymentMethod === 'card_to_card' && !receiptFile && !receiptPreview) {
      alert('آپلود تصویر رسید پرداخت برای روش کارت به کارت الزامی می‌باشد.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedReceiptUrl: string | undefined = undefined;

      if (paymentMethod === 'card_to_card' && (receiptFile || receiptPreview)) {
        setUploadingReceipt(true);
        uploadedReceiptUrl = await db.uploadFile(
          'receipts',
          receiptFile || receiptPreview!
        );
        setUploadingReceipt(false);
      }

      const itemsSnapshot: OrderItemSnapshot[] = cart.map((item) => ({
        productId: item.product.id,
        productCode: item.product.productCode,
        productName: item.product.name,
        productImage: item.product.images[0],
        originalPrice: item.product.oldPrice || item.product.price,
        finalPrice: item.product.price,
        quantity: item.quantity,
        color: item.color,
        lineTotal: item.product.price * item.quantity
      }));

      const newOrder = await db.createOrder({
        customer: {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          province: user.province || 'تهران',
          city: user.city || 'تهران',
          fullAddress: user.address || 'تهران، خیابان اصلی',
          postalCode: user.postalCode || '1234567890'
        },
        items: itemsSnapshot,
        shippingMethod: selectedShipping,
        paymentMethod: paymentMethod,
        paymentReceiptUrl: uploadedReceiptUrl,
        paymentGatewayProvider: paymentMethod === 'online_gateway' ? gatewayInfo.providerName : undefined,
        orderStatus: paymentMethod === 'card_to_card' ? 'در حال بررسی پرداخت' : 'سفارش جدید',
        paymentStatus: paymentMethod === 'card_to_card' ? 'در حال بررسی' : 'در انتظار پرداخت'
      });

      setOrderCreated(newOrder);
      onOrderCompleted(newOrder);
    } catch (err: any) {
      console.error('Failed to submit checkout order:', err);
      alert(err?.message || 'خطا در ثبت سفارش. لطفاً مجدداً تلاش فرمایید.');
    } finally {
      setSubmitting(false);
      setUploadingReceipt(false);
    }
  };

  // Confirmation view after order creation
  if (orderCreated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8 font-vazir text-right" dir="rtl">
        <div className="rounded-[2.5rem] bg-white p-8 sm:p-12 border border-[#37192c]/10 shadow-xl text-center space-y-6">
          <div className="mx-auto size-20 sm:size-24 rounded-full bg-emerald-100 border-4 border-emerald-200 grid place-items-center text-emerald-700 shadow-md">
            <CheckCircle size={48} />
          </div>

          <div className="space-y-3">
            <span className="font-mono text-xs font-bold text-[#8b627e] bg-[#fffaf0] px-3 py-1 rounded-full border border-[#37192c]/10 inline-block">
              شماره پیگیری: {orderCreated.orderNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#37192C]">
              پرداخت شما ثبت شد و در انتظار بررسی ادمین است.
            </h1>
            <p className="text-xs sm:text-sm text-[#37192C]/80 leading-7 font-bold max-w-lg mx-auto">
              رسید پرداخت و مشخصات فاکتور شما با موفقیت در سیستم ثبت گردید. همکاران ما پس از بررسی کارت‌به‌کارت، وضعیت سفارش شما را به «در حال آماده‌سازی» تغییر خواهند داد.
            </p>
          </div>

          <div className="rounded-2xl bg-[#fffaf0] p-4 border border-[#37192c]/10 max-w-md mx-auto text-xs space-y-2 text-right">
            <div className="flex justify-between font-bold">
              <span>مبلغ کل پرداخت شده:</span>
              <span className="font-black text-sm text-[#37192C]">{money(orderCreated.totalAmount)} تومان</span>
            </div>
            <div className="flex justify-between font-bold text-[#8b627e]">
              <span>روش پرداخت:</span>
              <span>{orderCreated.paymentMethod === 'online_gateway' ? 'درگاه آنلاین' : 'کارت به کارت'}</span>
            </div>
            <div className="flex justify-between font-bold text-[#8b627e]">
              <span>وضعیت بررسی:</span>
              <span className="text-amber-700 font-extrabold">{orderCreated.paymentStatus}</span>
            </div>
          </div>

          <div className="pt-4 max-w-sm mx-auto">
            <button
              onClick={openHome}
              className="w-full py-4 px-6 rounded-full bg-[#37192C] text-[#FFF3C5] font-black text-sm shadow-md hover:bg-[#5a2548] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home size={18} />
              <span>بازگشت به صفحه اصلی فروشگاه</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 font-vazir text-right" dir="rtl">
      {/* Header Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-4 mb-8">
        <div>
          <button
            onClick={onBackToCart}
            className="flex items-center gap-1.5 text-xs font-bold text-[#8b627e] mb-1 hover:underline cursor-pointer"
          >
            <ChevronLeft size={16} /> بازگشت به سبد خرید
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#37192C]">تسویه‌حساب و پرداخت آنلاین فاکتور</h1>
        </div>
        <span className="font-mono text-xs font-bold text-[#8b627e] bg-[#FFF3C5] px-3.5 py-1.5 rounded-full border border-[#37192c]/10">
          پیش‌نمایش سفارش: {previewOrderNumber}
        </span>
      </div>

      <form onSubmit={handleFinalSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Section: Payment Method & Customer Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Address Card */}
          <div className="rounded-[2rem] bg-white p-6 border border-[#37192c]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-3">
              <h2 className="text-sm sm:text-base font-black text-[#37192C] flex items-center gap-2">
                <MapPin size={18} /> اطلاعات و آدرس تحویل سفارش
              </h2>
              {user && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  کاربر تأیید شده
                </span>
              )}
            </div>

            {!user ? (
              <div className="bg-[#FFF3C5]/50 p-4 rounded-2xl text-center space-y-2">
                <p className="text-xs font-bold text-[#37192C]">برای تکمیل خرید باید ابتدا وارد حساب کاربری شوید.</p>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2.5 rounded-full bg-[#37192C] text-[#FFF3C5] font-bold text-xs hover:bg-[#5a2548] transition"
                >
                  ورود / ثبت‌نام
                </button>
              </div>
            ) : (
              <div className="text-xs space-y-1.5 text-[#37192C]/80 font-semibold">
                <div><strong className="text-[#37192C]">تحویل‌گیرنده:</strong> {user.firstName} {user.lastName} ({user.phone})</div>
                <div><strong className="text-[#37192C]">مقصد:</strong> استان {user.province || 'تهران'}، شهر {user.city || 'تهران'}</div>
                <div><strong className="text-[#37192C]">کد پستی:</strong> {user.postalCode || 'ثبت نشده'}</div>
                <div><strong className="text-[#37192C]">آدرس دقیق:</strong> {user.address || 'آدرسی ثبت نشده است (در پروفایل قابل ثبت است)'}</div>
              </div>
            )}
          </div>

          {/* Shipping Method Selector */}
          <div className="rounded-[2rem] bg-white p-6 border border-[#37192c]/10 shadow-xs space-y-3">
            <h2 className="text-sm sm:text-base font-black text-[#37192C]">انتخاب روش ارسال</h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShippingDropdownOpen(!shippingDropdownOpen)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#37192c]/20 bg-[#fffaf0] font-bold text-xs text-[#37192C]"
              >
                <div>
                  <div className="text-sm font-black">{selectedShipping.title}</div>
                  <div className="text-[11px] text-[#8b627e] font-semibold">{selectedShipping.subtitle}</div>
                </div>
                <ChevronDown size={18} />
              </button>

              {shippingDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-2xl border bg-white p-2 shadow-xl space-y-1">
                  {(Object.keys(shippingMethods) as Array<keyof typeof shippingMethods>).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setShippingKey(key);
                        setShippingDropdownOpen(false);
                      }}
                      className={
                        'w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center justify-between ' +
                        (shippingKey === key ? 'bg-[#37192C] text-[#FFF3C5]' : 'hover:bg-[#fffaf0] text-[#37192C]')
                      }
                    >
                      <div>
                        <div>{shippingMethods[key].title}</div>
                        <div className="text-[10px] opacity-80">{shippingMethods[key].subtitle}</div>
                      </div>
                      {shippingKey === key && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Payment Method Selection (بخش دوم: انتخاب روش پرداخت) */}
          <div className="rounded-[2rem] bg-white p-6 border border-[#37192c]/10 shadow-xs space-y-5">
            <h2 className="text-base sm:text-lg font-black text-[#37192C]">انتخاب روش پرداخت (Payment Method)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Card to Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card_to_card')}
                className={
                  'p-4 rounded-2xl border-2 text-right transition flex flex-col justify-between space-y-2 cursor-pointer ' +
                  (paymentMethod === 'card_to_card'
                    ? 'border-[#37192C] bg-[#FFF3C5]/40 shadow-xs'
                    : 'border-[#37192c]/10 bg-white hover:border-[#37192c]/30')
                }
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-[#37192C]">💳 روش ۱: کارت به کارت</span>
                  {paymentMethod === 'card_to_card' && <CheckCircle size={18} className="text-[#37192C]" />}
                </div>
                <p className="text-[11px] text-[#8b627e] font-semibold leading-5">
                  واریز به شماره کارت و آپلود تصویر رسید پرداخت
                </p>
              </button>

              {/* Option 2: Payment Gateway */}
              <button
                type="button"
                onClick={() => setPaymentMethod('online_gateway')}
                className={
                  'p-4 rounded-2xl border-2 text-right transition flex flex-col justify-between space-y-2 cursor-pointer ' +
                  (paymentMethod === 'online_gateway'
                    ? 'border-[#37192C] bg-[#FFF3C5]/40 shadow-xs'
                    : 'border-[#37192c]/10 bg-white hover:border-[#37192c]/30')
                }
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-[#37192C]">🌐 روش ۲: پرداخت آنلاین</span>
                  {paymentMethod === 'online_gateway' && <CheckCircle size={18} className="text-[#37192C]" />}
                </div>
                <p className="text-[11px] text-[#8b627e] font-semibold leading-5">
                  اتصال به درگاه بانکی ({gatewayInfo.providerName})
                </p>
              </button>
            </div>

            {/* Details for Method 1: Card to Card */}
            {paymentMethod === 'card_to_card' && (
              <div className="rounded-2xl bg-[#fffaf0] p-5 border border-[#37192c]/15 space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-black text-[#37192C] block">اطلاعات حساب جهت کارت به کارت:</span>
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#37192c]/10 font-mono text-sm font-bold text-[#37192C]">
                    <div className="space-y-1">
                      <div className="tracking-widest text-base font-black">{cardInfo.cardNumber}</div>
                      <div className="text-xs font-vazir font-bold text-[#8b627e]">صاحب حساب: {cardInfo.cardholderName}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCardNumber}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#37192C] text-[#FFF3C5] text-xs font-bold hover:bg-[#5a2548] transition cursor-pointer"
                    >
                      {copiedCard ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedCard ? 'کپی شد' : 'کپی شماره کارت'}</span>
                    </button>
                  </div>
                </div>

                {/* Receipt Upload Requirement */}
                <div className="space-y-2 pt-2 border-t border-[#37192c]/10">
                  <label className="block text-xs font-black text-[#37192C]">
                    آپلود رسید پرداخت <span className="text-rose-600 font-extrabold">(اجباری)</span>:
                  </label>
                  <p className="text-[11px] text-[#8b627e] font-semibold leading-5">
                    پس از واریز مبلغ فاکتور، عکس رسید بانکی را انتخاب و آپلود فرمایید.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#37192c]/30 bg-white text-[#37192C] font-bold text-xs hover:border-[#37192C] cursor-pointer transition">
                      <Upload size={18} />
                      <span>{receiptFile ? receiptFile.name : 'انتخاب تصویر رسید پرداخت'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        required={paymentMethod === 'card_to_card'}
                        onChange={handleReceiptFileChange}
                        className="hidden"
                      />
                    </label>

                    {receiptPreview && (
                      <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border-2 border-[#37192C]">
                        <img src={receiptPreview} alt="رسید" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptFile(null);
                            setReceiptPreview(null);
                          }}
                          className="absolute top-0 end-0 bg-rose-600 text-white p-0.5 rounded-bl"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!receiptFile && !receiptPreview && (
                    <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1 pt-1">
                      <AlertCircle size={14} />
                      <span>تا زمانی که تصویر رسید آپلود نشود، امکان ثبت سفارش کارت به کارت وجود ندارد.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Details for Method 2: Online Payment Gateway */}
            {paymentMethod === 'online_gateway' && (
              <div className="rounded-2xl bg-[#fffaf0] p-5 border border-[#37192c]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#37192C]">درگاه پرداخت انتخاب شده:</span>
                  <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {gatewayInfo.providerName}
                  </span>
                </div>
                <p className="text-xs text-[#37192C]/80 font-semibold leading-6">
                  پس از فشردن دکمه «تأیید و انتقال به درگاه پرداخت»، به سامانه پرداخت آنلاین منتقل خواهید شد.
                </p>
                <div className="p-3 bg-white rounded-xl border border-[#37192c]/10 text-[11px] font-mono text-[#8b627e]">
                  Endpoint API: {gatewayInfo.gatewayUrl}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Section 1 - Invoice Summary (بخش اول: خلاصه فاکتور) (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="rounded-[2.5rem] bg-white p-6 sm:p-7 border border-[#37192c]/10 shadow-lg space-y-5">
            <div className="border-b border-[#37192c]/10 pb-3 flex items-center justify-between">
              <h2 className="text-base font-black text-[#37192C] flex items-center gap-2">
                <FileText size={20} /> خلاصه فاکتور خرید
              </h2>
              <span className="text-xs font-bold text-[#8b627e]">{cart.length} محصول</span>
            </div>

            {/* Product Items Table / List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#fffaf0] rounded-2xl border border-[#37192c]/10 text-xs font-bold">
                  <img src={item.product.images[0]} alt={item.product.name} className="size-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="truncate text-[#37192C]">{item.product.name}</h3>
                    {item.color && <div className="text-[10px] text-[#8b627e]">رنگ: {item.color}</div>}
                    <div className="mt-1 text-[11px] text-[#37192C]/70">
                      {item.quantity} عدد × {money(item.product.price)} تومان
                    </div>
                  </div>
                  <div className="font-black text-[#37192C] text-left shrink-0">
                    {money(item.product.price * item.quantity)} تومان
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-[#37192c]/10 text-xs font-bold text-[#37192C]/80">
              <div className="flex justify-between">
                <span>جمع کل اقلام (subtotal):</span>
                <span>{money(subtotal)} تومان</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>تخفیف ویژه:</span>
                  <span>{money(discount)} تومان-</span>
                </div>
              )}

              <div className="flex justify-between text-rose-700">
                <span>هزینه ارسال ({selectedShipping.title}):</span>
                <span>پس‌کرایه</span>
              </div>

              <div className="flex justify-between text-base font-black text-[#37192C] pt-3 border-t border-[#37192c]/10">
                <span>مبلغ نهایی فاکتور:</span>
                <span className="text-lg">{money(total)} تومان</span>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={
                submitting ||
                uploadingReceipt ||
                !user ||
                (paymentMethod === 'card_to_card' && !receiptFile && !receiptPreview)
              }
              className="w-full py-4 px-6 rounded-full bg-[#37192C] text-[#FFF3C5] font-black text-sm shadow-md hover:bg-[#5a2548] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span>{uploadingReceipt ? 'در حال آپلود رسید پرداخت...' : 'در حال ثبت سفارش...'}</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>
                    {paymentMethod === 'card_to_card'
                      ? 'ثبت نهایی سفارش و ارسال رسید'
                      : 'تأیید و انتقال به درگاه پرداخت'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
