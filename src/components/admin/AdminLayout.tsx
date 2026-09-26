import React, { useState } from 'react';
import {
  LayoutDashboard,
  Box,
  ShoppingBag,
  Image,
  Users,
  MessageSquare,
  BarChart3,
  Globe,
  Settings,
  Activity,
  Menu,
  X,
  ArrowLeft,
  ChevronLeft,
  LogOut,
  ShieldCheck,
  Bell,
  Search
} from 'lucide-react';
import { AdminUser, db } from '../../services/db';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'banners'
  | 'orders'
  | 'users'
  | 'support'
  | 'analytics'
  | 'seo'
  | 'settings'
  | 'audit';

type AdminLayoutProps = {
  currentAdmin: AdminUser;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  goHome: () => void;
  children: React.ReactNode;
};

export function AdminLayout({ currentAdmin, activeTab, setActiveTab, goHome, children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = db.getNotifications('admin');
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'داشبورد اصلی', icon: <LayoutDashboard size={18} />, permission: null },
    { id: 'products', label: 'مدیریت محصولات', icon: <Box size={18} />, permission: 'manage_products' },
    { id: 'banners', label: 'مدیریت بنرها', icon: <Image size={18} />, permission: 'manage_banners' },
    { id: 'orders', label: 'مدیریت سفارشات', icon: <ShoppingBag size={18} />, permission: 'manage_orders' },
    { id: 'users', label: 'کاربران و نقش‌ها (RBAC)', icon: <Users size={18} />, permission: 'manage_users' },
    { id: 'support', label: 'تیکت‌های پشتیبانی', icon: <MessageSquare size={18} />, permission: 'manage_support' },
    { id: 'analytics', label: 'گزارشات و آمار فروش', icon: <BarChart3 size={18} />, permission: 'manage_orders' },
    { id: 'seo', label: 'تنظیمات سئو (SEO)', icon: <Globe size={18} />, permission: 'manage_seo' },
    { id: 'settings', label: 'تنظیمات عمومی سایت', icon: <Settings size={18} />, permission: 'manage_settings' },
    { id: 'audit', label: 'سوابق ادمین (Audit Logs)', icon: <Activity size={18} />, permission: 'view_audit_logs', superOnly: true },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#fffaf0] text-[#37192C] font-vazir">
      {/* Desktop Sidebar */}
      <aside
        className={
          'hidden md:flex flex-col justify-between sticky top-0 h-screen transition-all duration-300 border-e border-[#37192c]/10 bg-white shadow-sm z-20 ' +
          (sidebarCollapsed ? 'w-20' : 'w-64')
        }
      >
        <div>
          {/* Logo & Toggle Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#37192c]/10">
            {!sidebarCollapsed && (
              <div>
                <div className="brand-font text-xl font-black text-[#37192C]">AuraVibe</div>
                <span className="text-[10px] font-bold text-[#8b627e]">پیشخوان مدیریتی ۳۶۰</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="grid size-9 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C] hover:bg-[#ffe79a] transition"
              aria-label="تغییر منو"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              // Permission check
              if (item.superOnly && currentAdmin.role !== 'SUPER_ADMIN') return null;
              if (
                item.permission &&
                currentAdmin.role !== 'SUPER_ADMIN' &&
                !currentAdmin.customPermissions.includes(item.permission as any)
              ) {
                return null;
              }

              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id as AdminTab)}
                  className={
                    'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition ' +
                    (isActive
                      ? 'bg-[#37192C] text-[#FFF3C5] shadow-sm'
                      : 'text-[#37192C] hover:bg-[#FFF3C5]/50')
                  }
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#37192c]/10 space-y-2">
          <button
            onClick={goHome}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF3C5] py-2.5 text-xs font-black text-[#37192C] hover:bg-[#ffe79a] transition shadow-xs"
          >
            <ArrowLeft size={16} />
            {!sidebarCollapsed && <span>بازگشت به فروشگاه</span>}
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Bar */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#37192c]/10 px-4 py-3 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid size-10 place-items-center rounded-xl bg-[#FFF3C5] text-[#37192C] md:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-sm font-black text-[#37192C]">
                {currentAdmin.firstName} {currentAdmin.lastName}
              </h2>
              <p className="text-[10px] font-bold text-[#8b627e]">
                نقش: {currentAdmin.role === 'SUPER_ADMIN' ? 'مدیر ارشد کل (Super Admin)' : currentAdmin.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="grid size-10 place-items-center rounded-full bg-[#fffaf0] border border-[#37192c]/10 text-[#37192C]">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={goHome}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#37192C] px-4 py-2 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition"
            >
              مشاهده اصلی سایت
            </button>
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-[#37192C]/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-white p-4 shadow-2xl z-10">
            <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-4">
              <div>
                <div className="brand-font text-xl font-black text-[#37192C]">AuraVibe</div>
                <span className="text-[10px] font-bold text-[#8b627e]">پنل مدیریتی آورا</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="mt-4 space-y-1.5 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id as AdminTab)}
                  className={
                    'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition ' +
                    (activeTab === item.id ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#FFF3C5]/50')
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <button
              onClick={() => { setMobileMenuOpen(false); goHome(); }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF3C5] py-3 text-xs font-black text-[#37192C]"
            >
              <ArrowLeft size={16} /> خروج به فروشگاه
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
