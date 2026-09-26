import React, { useState, useMemo } from 'react';
import { Activity, Search, ShieldAlert, Filter, Lock } from 'lucide-react';
import { AuditLog, db, AdminUser } from '../../services/db';

type AuditLogsViewProps = {
  currentAdmin: AdminUser;
};

export function AuditLogsView({ currentAdmin }: AuditLogsViewProps) {
  const [logs] = useState<AuditLog[]>(() => db.getAuditLogs());
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  // SUPER_ADMIN Security Check
  if (currentAdmin.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-3 text-rose-900">
        <ShieldAlert size={32} className="mx-auto text-rose-600" />
        <h3 className="text-base font-black">دسترسی غیرمجاز</h3>
        <p className="text-xs">مشاهده سوابق و لوگ‌های فعالیت‌های ادمین‌ها منحصراً متعلق به مدیر ارشد کل (SUPER_ADMIN) می‌باشد.</p>
      </div>
    );
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.adminName.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.target.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase());
      const matchModule = moduleFilter === 'all' || log.module === moduleFilter;
      return matchSearch && matchModule;
    });
  }, [logs, search, moduleFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">سوابق و لوگ‌های فعالیت ادمین‌ها (Audit Logs)</h2>
          <p className="text-xs text-[#8b627e]">ثبت تمام تغییرات حساس محصولات، سفارشات، کاربران و دسترسی‌ها همراه با IP و زمان دقیق</p>
        </div>
        <span className="rounded-full bg-[#37192C] px-4 py-1.5 text-xs font-bold text-[#FFF3C5]">
          Super Admin Access
        </span>
      </div>

      {/* Search & Module Filters */}
      <div className="rounded-2xl bg-white p-4 border border-[#37192c]/10 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 px-3.5 py-2.5 w-full">
            <Search size={18} className="text-[#37192C]/50 shrink-0" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام ادمین، عنوان عملیات یا جزییات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#37192C] outline-none"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-4 py-2.5 text-xs font-bold text-[#37192C] outline-none w-full sm:w-auto"
          >
            <option value="all">همه ماژول‌ها</option>
            <option value="Products">Products (محصولات)</option>
            <option value="Orders">Orders (سفارشات)</option>
            <option value="Banners">Banners (بنرها)</option>
            <option value="Users">Users (کاربران)</option>
            <option value="Admins">Admins (ادمین‌ها)</option>
            <option value="Settings">Settings (تنظیمات)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Cards Stream */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-[#37192c]/10 bg-white p-4 shadow-sm hover:border-[#37192C] transition space-y-2 text-xs"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#37192c]/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#37192C]" />
                <strong className="text-[#37192C] font-black">{log.adminName}</strong>
                <span className="rounded-full bg-[#FFF3C5] px-2.5 py-0.5 text-[10px] font-bold text-[#37192C]">
                  [{log.module}] {log.action}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#8b627e]">
                {log.date} - {log.time} ({log.timestamp})
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[#37192C]/80">
              <div>
                <strong>هدف عملیات (Target): </strong>
                <span className="font-bold text-[#37192C]">{log.target}</span>
                <p className="mt-1 text-[11px] text-[#37192C]/70">{log.details}</p>
              </div>
              <div className="font-mono text-[10px] text-gray-500 bg-[#fffaf0] px-3 py-1 rounded-lg border">
                IP: {log.ip} | Device: {log.device}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
