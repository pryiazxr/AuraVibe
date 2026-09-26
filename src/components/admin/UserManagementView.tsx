import React, { useState } from 'react';
import {
  Users,
  Shield,
  Lock,
  UserCheck,
  UserX,
  Plus,
  X,
  Key,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { User, AdminUser, AdminRole, Permission, db } from '../../services/db';

type UserManagementViewProps = {
  currentAdmin: AdminUser;
};

export function UserManagementView({ currentAdmin }: UserManagementViewProps) {
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [admins, setAdmins] = useState<AdminUser[]>(() => db.getAdmins());
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');

  // Block User Modal
  const [blockModal, setBlockModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [blockReason, setBlockReason] = useState('');

  // Add User Modal
  const [addUserModal, setAddUserModal] = useState(false);
  const [uFirstName, setUFirstName] = useState('');
  const [uLastName, setULastName] = useState('');
  const [uPhone, setUPhone] = useState('');

  // Add Admin Modal (SUPER_ADMIN ONLY)
  const [adminModal, setAdminModal] = useState(false);
  const [aFirstName, setAFirstName] = useState('');
  const [aLastName, setALastName] = useState('');
  const [aUsername, setAUsername] = useState('');
  const [aPassword, setAPassword] = useState('');
  const [aRole, setARole] = useState<AdminRole>('MANAGER');

  const refreshData = () => {
    setUsers(db.getUsers());
    setAdmins(db.getAdmins());
  };

  const handleBlockUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockModal.user) return;
    db.blockUser(blockModal.user.id, blockReason || 'تخلف در سفارشات', {
      id: currentAdmin.id,
      name: `${currentAdmin.firstName} ${currentAdmin.lastName}`
    });
    refreshData();
    setBlockModal({ open: false, user: null });
  };

  const handleUnblockUser = (userId: number) => {
    db.unblockUser(userId, { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` });
    refreshData();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uFirstName || !uPhone) return;
    db.saveUser(
      { firstName: uFirstName, lastName: uLastName, phone: uPhone },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );
    refreshData();
    setAddUserModal(false);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAdmin.role !== 'SUPER_ADMIN') {
      alert('فقط مدیر ارشد کل (SUPER_ADMIN) مجاز به تعریف ادمین جدید می‌باشد.');
      return;
    }
    if (!aUsername || !aPassword) return;

    db.saveAdmin(
      {
        firstName: aFirstName,
        lastName: aLastName,
        username: aUsername,
        passwordHash: aPassword,
        role: aRole,
        customPermissions: ['manage_products', 'manage_orders', 'manage_banners']
      },
      {
        id: currentAdmin.id,
        name: `${currentAdmin.firstName} ${currentAdmin.lastName}`,
        role: currentAdmin.role
      }
    );

    refreshData();
    setAdminModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-tab switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">مدیریت کاربران و دسترسی‌های ادمین (Users & RBAC)</h2>
          <p className="text-xs text-[#8b627e]">مدیریت خریداران ثبت‌نام‌شده، مسدودی لایو و کنترل دسترسی‌های سطوح ادمین</p>
        </div>

        <div className="flex items-center rounded-xl bg-[#fffaf0] p-1 border border-[#37192c]/10">
          <button
            onClick={() => setActiveTab('users')}
            className={'rounded-lg px-4 py-2 text-xs font-bold transition ' + (activeTab === 'users' ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C]')}
          >
            کاربران و خریداران ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={'rounded-lg px-4 py-2 text-xs font-bold transition ' + (activeTab === 'admins' ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C]')}
          >
            مدیران و دسترسی‌ها ({admins.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CUSTOMERS / USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setAddUserModal(true)}
              className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-md"
            >
              <Plus size={16} /> ثبت کاربر دستی جدید
            </button>
          </div>

          <div className="rounded-2xl border border-[#37192c]/10 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#fffaf0] border-b border-[#37192c]/10 text-[#37192C] font-black">
                  <tr>
                    <th className="p-4">نام خریدار</th>
                    <th className="p-4">شماره همراه</th>
                    <th className="p-4">تاریخ ثبت‌نام</th>
                    <th className="p-4">تعداد سفارشات</th>
                    <th className="p-4">وضعیت</th>
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#37192c]/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#fffaf0]/60 transition">
                      <td className="p-4 font-bold text-[#37192C]">{u.firstName} {u.lastName}</td>
                      <td className="p-4 font-mono font-bold text-[#8b627e]">{u.phone}</td>
                      <td className="p-4 text-[#37192C]/80 font-semibold">{u.registrationDate}</td>
                      <td className="p-4 font-black text-[#37192C]">{u.orderCount} سفارش</td>
                      <td className="p-4">
                        <span className={'rounded-full px-3 py-1 font-bold text-[10px] ' + (u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')}>
                          {u.status === 'active' ? 'فعال' : `مسدود (${u.blockReason || ''})`}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {u.status === 'active' ? (
                          <button
                            onClick={() => setBlockModal({ open: true, user: u })}
                            className="flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-200 mx-auto"
                          >
                            <UserX size={14} /> مسدود کردن
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockUser(u.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-200 mx-auto"
                          >
                            <UserCheck size={14} /> رفع مسدودی
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ADMINS & RBAC (SUPER ADMIN PROTECTED VIEW) */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-bold text-amber-900">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} />
              <span>فقط نقش SUPER_ADMIN (مدیر ارشد اصلی) مجاز به تعریف، ویرایش و عزل سایر ادمین‌ها می‌باشد.</span>
            </div>
            {currentAdmin.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setAdminModal(true)}
                className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition"
              >
                <Plus size={16} /> تعریف ادمین جدید
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {admins.map((adm) => (
              <div key={adm.id} className="rounded-2xl border border-[#37192c]/10 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#37192c]/5 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-[#37192C]">{adm.firstName} {adm.lastName}</h3>
                    <p className="text-[11px] font-mono text-[#8b627e]">@{adm.username} ({adm.adminCode})</p>
                  </div>
                  <span className={'rounded-full px-3 py-1 text-[11px] font-bold ' + (adm.role === 'SUPER_ADMIN' ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-[#FFF3C5] text-[#37192C]')}>
                    {adm.role}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-[#37192C]/80">
                  <div><strong>دسته‌بندی دسترسی‌ها:</strong> {adm.customPermissions.join(' | ')}</div>
                  <div><strong>آخرین ورود:</strong> {adm.lastLogin}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block Modal */}
      {blockModal.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setBlockModal({ open: false, user: null })} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
              <X size={16} />
            </button>
            <h3 className="text-base font-black text-[#37192C]">مسدودسازی حساب کاربری</h3>
            <form onSubmit={handleBlockUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#37192C]">دلیل مسدودسازی</label>
                <input
                  type="text"
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="مثال: لغو مداوم سفارشات یا ثبت اطلاعات نامعتبر"
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
                />
              </div>
              <button type="submit" className="w-full rounded-full bg-rose-600 py-3 font-bold text-white">
                تایید مسدودی لایو کاربر
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setAddUserModal(false)} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
              <X size={16} />
            </button>
            <h3 className="text-base font-black text-[#37192C]">ثبت خریدار/کاربر جدید</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#37192C]">نام</label>
                <input type="text" required value={uFirstName} onChange={(e) => setUFirstName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none" />
              </div>
              <div>
                <label className="font-bold text-[#37192C]">نام خانوادگی</label>
                <input type="text" value={uLastName} onChange={(e) => setULastName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none" />
              </div>
              <div>
                <label className="font-bold text-[#37192C]">شماره همراه یکتا</label>
                <input type="text" required value={uPhone} onChange={(e) => setUPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none" placeholder="09120000000" />
              </div>
              <button type="submit" className="w-full rounded-full bg-[#37192C] py-3 font-bold text-[#FFF3C5]">
                ذخیره کاربر
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {adminModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setAdminModal(false)} className="absolute end-4 top-4 grid size-8 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
              <X size={16} />
            </button>
            <h3 className="text-base font-black text-[#37192C]">ایجاد حساب ادمین جدید (Super Admin View)</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#37192C]">نام</label>
                  <input type="text" required value={aFirstName} onChange={(e) => setAFirstName(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 outline-none" />
                </div>
                <div>
                  <label className="font-bold text-[#37192C]">نام خانوادگی</label>
                  <input type="text" required value={aLastName} onChange={(e) => setALastName(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 outline-none" />
                </div>
              </div>
              <div>
                <label className="font-bold text-[#37192C]">نام کاربری (Username)</label>
                <input type="text" required value={aUsername} onChange={(e) => setAUsername(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 outline-none" />
              </div>
              <div>
                <label className="font-bold text-[#37192C]">کلمه عبور اختصاصی</label>
                <input type="password" required value={aPassword} onChange={(e) => setAPassword(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 outline-none" />
              </div>
              <div>
                <label className="font-bold text-[#37192C]">نقش ادمین</label>
                <select value={aRole} onChange={(e) => setARole(e.target.value as AdminRole)} className="mt-1 w-full rounded-xl border p-2.5 outline-none font-bold">
                  <option value="MANAGER">MANAGER (مدیریت عملیاتی)</option>
                  <option value="PRODUCT_MANAGER">PRODUCT_MANAGER (محصولات)</option>
                  <option value="ORDER_MANAGER">ORDER_MANAGER (سفارشات)</option>
                  <option value="SUPPORT_AGENT">SUPPORT_AGENT (پشتیبانی)</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-full bg-[#37192C] py-3 font-bold text-[#FFF3C5]">
                ایجاد حساب ادمین
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
