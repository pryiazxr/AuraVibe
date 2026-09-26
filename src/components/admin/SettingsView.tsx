import React, { useState } from 'react';
import { Settings, Save, Bell, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { db, GeneralSettings, AdminUser } from '../../services/db';

type SettingsViewProps = {
  currentAdmin: AdminUser;
};

export function SettingsView({ currentAdmin }: SettingsViewProps) {
  const [settings, setSettings] = useState<GeneralSettings>(() => db.getGeneralSettings());

  const [siteName, setSiteName] = useState(settings.siteName);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [address, setAddress] = useState(settings.address);
  const [workingHours, setWorkingHours] = useState(settings.workingHours);
  const [footerDesc, setFooterDesc] = useState(settings.footerDescription);

  const [notifOrder, setNotifOrder] = useState(settings.notifications.newOrder);
  const [notifUser, setNotifUser] = useState(settings.notifications.newUser);
  const [notifTicket, setNotifTicket] = useState(settings.notifications.newTicket);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateGeneralSettings(
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
        }
      },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );
    setSettings(db.getGeneralSettings());
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
    </div>
  );
}
