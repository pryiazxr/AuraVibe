import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  X,
  FileText,
  UserCheck,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { SupportTicket, TicketStatus, TicketPriority, db, AdminUser } from '../../services/db';

type TicketManagementViewProps = {
  currentAdmin: AdminUser;
};

export function TicketManagementView({ currentAdmin }: TicketManagementViewProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => db.getTickets());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState<TicketStatus>('Open');

  const refreshList = () => {
    setTickets(db.getTickets());
  };

  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setUpdatedStatus(ticket.status);
    setReplyText('');
    setIsInternalNote(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText) return;

    db.replyTicket(
      selectedTicket.id,
      replyText,
      'admin',
      `${currentAdmin.firstName} ${currentAdmin.lastName} (${currentAdmin.role})`,
      isInternalNote,
      updatedStatus
    );

    refreshList();
    setSelectedTicket(null);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.customerPhone.includes(search);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Waiting for Customer':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 font-black';
      case 'High':
        return 'bg-orange-100 text-orange-800 font-bold';
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">مدیریت تیکت‌ها و درخواست‌های پشتیبانی (Support Tickets)</h2>
          <p className="text-xs text-[#8b627e]">پاسخگویی آنلاین به مشتریان، یادداشت‌های داخلی ادمین و تغییر اولویت تیکت‌ها</p>
        </div>
        <span className="rounded-full bg-[#FFF3C5] px-4 py-1.5 text-xs font-bold text-[#37192C]">
          تعداد تیکت‌ها: {filteredTickets.length}
        </span>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-[#37192c]/10 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 px-3.5 py-2.5 w-full">
            <Search size={18} className="text-[#37192C]/50 shrink-0" />
            <input
              type="text"
              placeholder="جستجو بر اساس شماره تیکت، موضوع، نام مشتری یا تلفن..."
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
            <option value="Open">باز (Open)</option>
            <option value="In Progress">در حال بررسی (In Progress)</option>
            <option value="Waiting for Customer">در انتظار پاسخ مشتری</option>
            <option value="Resolved">حل شده (Resolved)</option>
            <option value="Closed">بسته شده (Closed)</option>
          </select>
        </div>
      </div>

      {/* Tickets List Table */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#fffaf0] border-b border-[#37192c]/10 text-[#37192C] font-black">
              <tr>
                <th className="p-4">کد تیکت</th>
                <th className="p-4">موضوع</th>
                <th className="p-4">مشتری</th>
                <th className="p-4">دسته‌بندی</th>
                <th className="p-4">اولویت</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 text-center">پاسخگویی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#37192c]/5">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#fffaf0]/60 transition">
                  <td className="p-4 font-mono font-bold text-[#37192C]">{ticket.ticketNumber}</td>
                  <td className="p-4 font-bold text-[#37192C]">{ticket.subject}</td>
                  <td className="p-4">
                    <strong className="text-[#37192C]">{ticket.customerName}</strong>
                    <div className="text-[10px] text-[#8b627e]">{ticket.customerPhone}</div>
                  </td>
                  <td className="p-4 font-semibold text-[#8b627e]">{ticket.category}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 font-bold text-[10px] border ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => openTicket(ticket)}
                      className="grid size-8 place-items-center rounded-lg bg-[#FFF3C5] text-[#37192C] hover:bg-[#ffe79a] mx-auto"
                      title="مشاهده پیام‌ها و ارسال پاسخ"
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

      {/* Ticket Details & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute end-5 top-5 grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"
            >
              <X size={18} />
            </button>

            <div className="border-b border-[#37192c]/10 pb-3">
              <span className="font-mono text-xs font-bold text-[#8b627e]">{selectedTicket.ticketNumber}</span>
              <h3 className="text-lg font-black text-[#37192C] mt-1">{selectedTicket.subject}</h3>
              <p className="text-xs text-[#37192C]/70 mt-1">
                مشتری: <strong>{selectedTicket.customerName}</strong> ({selectedTicket.customerPhone}) | دسته: {selectedTicket.category}
              </p>
            </div>

            {/* Conversation History */}
            <div className="space-y-3 max-h-64 overflow-y-auto p-3 rounded-2xl bg-[#fffaf0] border border-[#37192c]/10">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    'p-3 rounded-xl text-xs space-y-1 ' +
                    (msg.isInternalNote
                      ? 'bg-amber-100 border border-amber-300 text-amber-900 ms-8'
                      : msg.sender === 'admin'
                      ? 'bg-[#37192C] text-[#FFF3C5] ms-8'
                      : 'bg-white border border-[#37192c]/10 text-[#37192C] me-8')
                  }
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span>
                      {msg.isInternalNote ? '🔒 یادداشت داخلی ادمین: ' : ''}
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] opacity-75">{msg.createdAt}</span>
                  </div>
                  <p className="leading-6">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 text-xs pt-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#37192C]">متن پاسخ یا یادداشت ادمین:</label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-800">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="accent-amber-600 size-4"
                  />
                  <span>یادداشت مخفی/داخلی برای ادمین‌ها (مشتری نمی‌بیند)</span>
                </label>
              </div>

              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="متن پاسخ رسمی یا راهنمایی به خریدار را وارد کنید..."
                className="w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="font-bold text-[#37192C]">وضعیت جدید تیکت:</span>
                  <select
                    value={updatedStatus}
                    onChange={(e) => setUpdatedStatus(e.target.value as TicketStatus)}
                    className="rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 font-bold outline-none"
                  >
                    <option value="Open">باز (Open)</option>
                    <option value="In Progress">در حال بررسی (In Progress)</option>
                    <option value="Waiting for Customer">در انتظار پاسخ مشتری</option>
                    <option value="Resolved">حل شده (Resolved)</option>
                    <option value="Closed">بسته شده (Closed)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#37192C] px-6 py-3 font-bold text-[#FFF3C5] hover:bg-[#5a2548] shadow-md transition w-full sm:w-auto"
                >
                  <Send size={16} /> ثبت و ارسال پاسخ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
