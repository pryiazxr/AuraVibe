import React, { useState, useEffect } from 'react';
import { Settings, Save, Bell, Mail, Phone, MapPin, Globe, Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { db, GeneralSettings, AdminUser, CategoryItem, ProductBadgeItem } from '../../services/db';

type SettingsViewProps = {
  currentAdmin: AdminUser;
};

export function SettingsView({ currentAdmin }: SettingsViewProps) {
  const [settings, setSettings] = useState<GeneralSettings>({
    siteName: 'AuraVibe',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    workingHours: '',
    socialLinks: {},
    timezone: 'Asia/Tehran',
    language: 'fa',
    headerLinks: [],
    footerDescription: '',
    notifications: {
      newOrder: true,
      newUser: true,
      newTicket: true,
      securityAlert: true
    }
  });
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [badges, setBadges] = useState<ProductBadgeItem[]>([]);

  // Modal State for Adding / Editing Category
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catUploading, setCatUploading] = useState(false);
  const [catSaving, setCatSaving] = useState(false);
  const [catUploadError, setCatUploadError] = useState<string | null>(null);
  const [catDbError, setCatDbError] = useState<string | null>(null);

  // Modal State for Adding / Editing Badge
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<ProductBadgeItem | null>(null);
  const [badgeTitle, setBadgeTitle] = useState('');

  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [footerDesc, setFooterDesc] = useState('');

  // Payment Settings States
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [gwProviderName, setGwProviderName] = useState('');
  const [gwUrl, setGwUrl] = useState('');
  const [gwActive, setGwActive] = useState(false);

  const [notifOrder, setNotifOrder] = useState(true);
  const [notifUser, setNotifUser] = useState(true);
  const [notifTicket, setNotifTicket] = useState(true);

  const refreshAll = async () => {
    try {
      const [s, c, b] = await Promise.all([
        db.getGeneralSettings(),
        db.getCategories(),
        db.getBadges()
      ]);
      setSettings(s);
      setCategories(c);
      setBadges(b);
      setSiteName(s.siteName);
      setContactEmail(s.contactEmail);
      setContactPhone(s.contactPhone);
      setAddress(s.address);
      setWorkingHours(s.workingHours);
      setFooterDesc(s.footerDescription);
      setNotifOrder(s.notifications.newOrder);
      setNotifUser(s.notifications.newUser);
      setNotifTicket(s.notifications.newTicket);
      setCardNumber(s.cardToCardSettings?.cardNumber || '6037997512345678');
      setCardholderName(s.cardToCardSettings?.cardholderName || 'فروشگاه آورا وایب');
      setGwProviderName(s.paymentGatewaySettings?.providerName || 'درگاه پرداخت آنلاین');
      setGwUrl(s.paymentGatewaySettings?.gatewayUrl || 'https://api.zarinpal.com/pg/v4/payment/request.json');
      setGwActive(s.paymentGatewaySettings?.active || false);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    refreshAll();
    const unsub = db.subscribe(() => {
      refreshAll();
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.updateGeneralSettings(
      {
        siteName,
        contactEmail,
        contactPhone,
        address,
        workingHours,
        footerDescription: footerDesc,
        notifications: {
          newOrder: notifOrder,
          newUser: notifUser,
          newTicket: notifTicket,
          securityAlert: true
        },
        cardToCardSettings: {
          cardNumber: cardNumber.trim(),
          cardholderName: cardholderName.trim()
        },
        paymentGatewaySettings: {
          providerName: gwProviderName.trim(),
          gatewayUrl: gwUrl.trim(),
          active: gwActive
        }
      },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );
    await refreshAll();
    alert('تنظیمات عمومی سایت با موفقیت ذخیره شد.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">تنظیمات عمومی سایت (General Site Settings)</h2>
          <p className="text-xs text-[#8b627e]">مدیریت نام برند، اطلاعات تماس هدر/فوتر و فعال‌سازی اعلان‌های سیستمی</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Product Badges / Labels Management Section */}
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#37192C]">مدیریت برچسب‌ها و لیبل‌های کالا (Product Badges & Labels)</h3>
              <p className="text-[11px] text-[#8b627e] font-semibold mt-0.5">تعریف برچسب‌های ویژه مانند «جدیدترین‌ها»، «پرفروش‌ترین‌ها»، «تخفیف ویژه» و استفاده پویا در فرم‌ها و ویترین</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingBadge(null);
                setBadgeTitle('');
                setBadgeModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#37192C] px-3.5 py-2 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-xs"
            >
              <Plus size={15} /> افزودن برچسب جدید
            </button>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {badges.map((b) => (
              <div key={b.id} className="flex items-center gap-2 rounded-full bg-[#fffaf0] border border-[#37192c]/15 px-4 py-2 shadow-2xs">
                <span className="font-bold text-xs text-[#37192C]">{b.title}</span>
                <div className="flex items-center gap-1 ms-2 border-s border-[#37192c]/10 ps-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBadge(b);
                      setBadgeTitle(b.title);
                      setBadgeModalOpen(true);
                    }}
                    className="p-1 text-[#37192C] hover:text-[#8b627e]"
                    title="ویرایش برچسب"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`آیا از حذف برچسب «${b.title}» اطمینان دارید؟`)) {
                        await db.deleteBadge(b.id, { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` });
                        await refreshAll();
                      }
                    }}
                    className="p-1 text-rose-600 hover:text-rose-800"
                    title="حذف برچسب"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Management Section */}
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#37192C]">مدیریت دسته‌بندی‌ها (Category Management)</h3>
              <p className="text-[11px] text-[#8b627e] font-semibold mt-0.5">افزودن، ویرایش و حذف دسته‌بندی‌ها با نمایش دایره‌ای افقی (همگام با ویترین اصلی سایت)</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCatUploadError(null);
                setCatDbError(null);
                setEditingCategory(null);
                setCatName('');
                setCatImage('');
                setCatModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#37192C] px-3.5 py-2 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-xs"
            >
              <Plus size={15} /> افزودن دسته‌بندی جدید
            </button>
          </div>

          {/* Horizontally Scrollable Circular Category Items */}
          <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 select-none">
            {categories.map((cat) => (
              <div key={cat.id} className="group shrink-0 w-28 text-center bg-[#fffaf0] p-3 rounded-2xl border border-[#37192c]/10 flex flex-col items-center justify-between relative shadow-2xs hover:border-[#37192C] transition">
                {/* Circular Cover Image */}
                <div className="story-ring size-20 shadow-xs">
                  <img src={cat.image} alt={cat.name} className="size-full object-cover rounded-full" />
                </div>
                <span className="mt-2 block text-xs font-bold text-[#37192C] truncate max-w-full">{cat.name}</span>

                {/* Edit & Delete Action Overlay */}
                <div className="mt-3 flex items-center justify-center gap-2 pt-2 border-t border-[#37192c]/10 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setCatUploadError(null);
                      setCatDbError(null);
                      setEditingCategory(cat);
                      setCatName(cat.name);
                      setCatImage(cat.image);
                      setCatModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white text-[#37192C] border border-[#37192c]/10 hover:bg-[#FFF3C5] transition"
                    title="ویرایش دسته‌بندی"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`آیا از حذف دسته‌بندی «${cat.name}» اطمینان دارید؟`)) {
                        await db.deleteCategory(cat.id, { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` });
                        await refreshAll();
                      }
                    }}
                    className="p-1.5 rounded-lg bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition"
                    title="حذف دسته‌بندی"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Brand Info */}
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#37192C] border-b border-[#37192c]/10 pb-3">اطلاعات برند و هویت فروشگاه</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#37192C]">نام اصلی فروشگاه (Site Name)</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 font-bold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#37192C]">ساعات کاری پشتیبانی</label>
              <input
                type="text"
                required
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#37192C]">توضیحات کوتاه فوتر (Footer Description)</label>
            <textarea
              rows={2}
              required
              value={footerDesc}
              onChange={(e) => setFooterDesc(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
            />
          </div>
        </div>

        {/* Payment Methods Config (Card to Card & Online Gateway) */}
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-[#37192c]/10 pb-3">
            <h3 className="text-sm font-black text-[#37192C]">تنظیمات حساب و درگاه پرداخت (Payment Methods Configuration)</h3>
            <p className="text-[11px] text-[#8b627e] font-semibold mt-0.5">
              اطلاعات کارت به کارت و آدرس/تنظیمات درگاه پرداخت آنلاین قابل پیکربندی و ذخیره در دیتابیس
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-[#37192C] bg-[#FFF3C5]/50 p-2.5 rounded-xl border border-[#37192c]/10">
              ۱. تنظیمات کارت به کارت (Card to Card Account)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#37192C]">شماره کارت بانکی (۱۶ رقمی)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ۶۰۳۷۹۹۷۵۱۲۳۴۵۶۷۸"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-[#37192c]/20 bg-white p-3 font-bold text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#37192C]">نام صاحب حساب / کارت</label>
                <input
                  type="text"
                  required
                  placeholder="نام و خانوادگی صاحب کارت"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 font-bold text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-3 border-t border-[#37192c]/10">
            <h4 className="text-xs font-black text-[#37192C] bg-[#FFF3C5]/50 p-2.5 rounded-xl border border-[#37192c]/10">
              ۲. تنظیمات درگاه پرداخت آنلاین (Online Payment Gateway)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#37192C]">نام ارائه‌دهنده درگاه (Payment Provider)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: زیبال، زرین‌پال، سامان‌کیش..."
                  value={gwProviderName}
                  onChange={(e) => setGwProviderName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 font-bold text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#37192C]">آدرس API / Endpoint درگاه پرداخت</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={gwUrl}
                  onChange={(e) => setGwUrl(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-[#37192c]/20 bg-white p-3 font-bold text-xs outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-[#37192C] pt-1">
              <input
                type="checkbox"
                checked={gwActive}
                onChange={(e) => setGwActive(e.target.checked)}
                className="accent-[#37192C] size-4"
              />
              <span>فعال‌سازی درگاه پرداخت آنلاین در صفحه تسویه‌حساب (Checkout)</span>
            </label>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#37192C] border-b border-[#37192c]/10 pb-3">اطلاعات تماس و آدرس دفتر مرکزی</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#37192C]">ایمیل پشتیبانی</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1 w-full font-mono rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#37192C]">شماره تماس پشتیبانی</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 w-full font-mono rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#37192C]">آدرس دقیق دفتر</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
            />
          </div>
        </div>

        {/* System Notifications Config */}
        <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-[#37192C] border-b border-[#37192c]/10 pb-3">اعلان‌ها و هشدارهای پیشخوان</h3>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-[#37192C]">
            <input
              type="checkbox"
              checked={notifOrder}
              onChange={(e) => setNotifOrder(e.target.checked)}
              className="accent-[#37192C] size-4"
            />
            <span>ارسال هشدار آنی هنگام ثبت سفارش جدید توسط خریدار</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-[#37192C]">
            <input
              type="checkbox"
              checked={notifUser}
              onChange={(e) => setNotifUser(e.target.checked)}
              className="accent-[#37192C] size-4"
            />
            <span>اعلان هنگام ثبت‌نام کاربر جدید در سایت</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-[#37192C]">
            <input
              type="checkbox"
              checked={notifTicket}
              onChange={(e) => setNotifTicket(e.target.checked)}
              className="accent-[#37192C] size-4"
            />
            <span>اعلان هنگام ایجاد تیکت پشتیبانی جدید</span>
          </label>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-full bg-[#37192C] px-8 py-3.5 font-bold text-[#FFF3C5] hover:bg-[#5a2548] shadow-md transition"
        >
          <Save size={16} /> ذخیره کامل تنظیمات عمومی
        </button>
      </form>

      {/* Badge Add/Edit Modal */}
      {badgeModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 relative text-xs">
            <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-3">
              <h3 className="font-black text-sm text-[#37192C]">
                {editingBadge ? `ویرایش برچسب «${editingBadge.title}»` : 'افزودن برچسب محصول جدید'}
              </h3>
              <button
                type="button"
                onClick={() => setBadgeModalOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-[#fffaf0] text-[#37192C]"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block font-bold text-[#37192C] mb-1">عنوان برچسب</label>
              <input
                type="text"
                required
                placeholder="مثال: جدیدترین‌ها، پرفروش‌ترین‌ها، پیشنهاد ویژه..."
                value={badgeTitle}
                onChange={(e) => setBadgeTitle(e.target.value)}
                className="w-full rounded-xl border border-[#37192c]/20 p-3 font-bold text-xs outline-none bg-[#fffaf0]"
              />
            </div>

            <div className="pt-3 border-t border-[#37192c]/10 flex gap-2">
              <button
                type="button"
                onClick={() => setBadgeModalOpen(false)}
                className="flex-1 py-3 rounded-full border border-[#37192c]/20 text-[#37192C] font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!badgeTitle.trim()) {
                    alert('لطفاً عنوان برچسب را وارد کنید.');
                    return;
                  }
                  await db.saveBadge(
                    {
                      id: editingBadge?.id,
                      title: badgeTitle.trim()
                    },
                    { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
                  );
                  await refreshAll();
                  setBadgeModalOpen(false);
                }}
                className="flex-1 py-3 rounded-full bg-[#37192C] text-[#FFF3C5] font-bold shadow-md"
              >
                ذخیره برچسب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 relative text-xs">
            <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-3">
              <h3 className="font-black text-sm text-[#37192C]">
                {editingCategory ? `ویرایش دسته‌بندی «${editingCategory.name}»` : 'افزودن دسته‌بندی جدید'}
              </h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-[#fffaf0] text-[#37192C]"
              >
                <X size={16} />
              </button>
            </div>

            {catUploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {catUploadError}
              </div>
            )}

            {catDbError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {catDbError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#37192C] mb-1">نام دسته‌بندی</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ساعت، تل، زیورآلات..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-xl border border-[#37192c]/20 p-3 font-bold text-xs outline-none bg-[#fffaf0]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#37192C] mb-1">تصویر کاور دایره‌ای (آدرس یا گالری)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://... یا آپلود تصویر"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    className="flex-1 rounded-xl border border-[#37192c]/20 p-3 font-mono text-xs outline-none bg-[#fffaf0]"
                  />
                  <label className="flex items-center justify-center px-3.5 bg-[#37192C] text-[#FFF3C5] rounded-xl cursor-pointer hover:bg-[#5a2548] font-bold shrink-0">
                    <ImageIcon size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCatUploadError(null);
                          setCatUploading(true);
                          try {
                            const url = await db.uploadFile('products', file);
                            setCatImage(url);
                          } catch (err: any) {
                            console.error('Failed to upload category image to Supabase:', err);
                            setCatUploadError(err?.message || 'خطا در آپلود تصویر دسته‌بندی.');
                          } finally {
                            setCatUploading(false);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Preview */}
              {catImage && (
                <div className="flex items-center gap-3 p-3 bg-[#fffaf0] rounded-2xl border border-[#37192c]/10">
                  <div className="story-ring size-14 shrink-0">
                    <img src={catImage} alt="پیش‌نمایش" className="size-full object-cover rounded-full" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8b627e] block">پیش‌نمایش کاور</span>
                    <span className="font-black text-xs text-[#37192C]">{catName || 'نام دسته‌بندی'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#37192c]/10 flex gap-2">
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="flex-1 py-3 rounded-full border border-[#37192c]/20 text-[#37192C] font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={catUploading || catSaving}
                onClick={async () => {
                  if (!catName.trim() || !catImage.trim()) {
                    alert('لطفاً نام دسته‌بندی و تصویر کاور را وارد کنید.');
                    return;
                  }
                  if (catUploading) {
                    alert('لطفاً تا اتمام کامل آپلود تصویر شکیبا باشید.');
                    return;
                  }
                  setCatSaving(true);
                  setCatDbError(null);
                  try {
                    await db.saveCategory(
                      {
                        id: editingCategory?.id,
                        name: catName.trim(),
                        image: catImage.trim()
                      },
                      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
                    );
                    await refreshAll();
                    setCatModalOpen(false);
                  } catch (err: any) {
                    console.error('Failed to save category:', err);
                    setCatDbError(err?.message || 'خطا در ذخیره دسته‌بندی.');
                  } finally {
                    setCatSaving(false);
                  }
                }}
                className="flex-1 py-3 rounded-full bg-[#37192C] text-[#FFF3C5] font-bold shadow-md disabled:opacity-50"
              >
                {catSaving ? 'در حال ذخیره‌سازی...' : catUploading ? 'در حال آپلود...' : 'ذخیره دسته‌بندی'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
