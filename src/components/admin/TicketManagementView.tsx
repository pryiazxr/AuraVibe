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

import { Mic, Paperclip, Image as ImageIconCheck } from 'lucide-react';

export function TicketManagementView({ currentAdmin }: TicketManagementViewProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => db.getTickets());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Ticket State for Chat UI
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [recordingVoice, setRecordingVoice] = useState(false);

  const refreshList = () => {
    setTickets(db.getTickets());
  };

  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyText('');
    setAttachmentUrl(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!replyText && !attachmentUrl)) return;

    let finalMessage = replyText;
    if (attachmentUrl) {
      finalMessage += `\n[پیوست تصویر: ${attachmentUrl}]`;
    }

    db.replyTicket(
      selectedTicket.id,
      finalMessage,
      'admin',
      `${currentAdmin.firstName} ${currentAdmin.lastName}`,
      false,
      'Waiting for Customer'
    );

    refreshList();
    setReplyText('');
    setAttachmentUrl(null);
    const updated = db.getTickets().find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleSendVoiceSample = () => {
    if (!selectedTicket) return;
    setRecordingVoice(true);
    setTimeout(() => {
      setRecordingVoice(false);
      db.replyTicket(
        selectedTicket.id,
        '🎤 [پیام صوتی ضبط شده پشتیبان]',
        'admin',
        `${currentAdmin.firstName} ${currentAdmin.lastName}`,
        false,
        'Waiting for Customer'
      );
      refreshList();
      const updated = db.getTickets().find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }, 1500);
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
          <h2 className="text-lg font-black text-[#37192C]">پشتیبانی چت آنلاین (Aura Support Chat)</h2>
          <p className="text-xs text-[#8b627e]">گفتگوی زنده، ارسال متن، تصویر و وویس به کاربران سایت</p>
        </div>
        <span className="rounded-full bg-[#FFF3C5] px-4 py-1.5 text-xs font-bold text-[#37192C]">
          تعداد گفتگوها: {filteredTickets.length}
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

      {/* Chat UI Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-[2.5rem] bg-[#fffaf0] p-6 shadow-2xl relative flex flex-col h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-3">
              <div>
                <h3 className="text-base font-black text-[#37192C]">گفتگو با {selectedTicket.customerName}</h3>
                <p className="text-xs text-[#8b627e] font-bold">{selectedTicket.subject} ({selectedTicket.customerPhone})</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="grid size-9 place-items-center rounded-full bg-white text-[#37192C]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 my-3 space-y-3">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    'max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ' +
                    (msg.sender === 'admin'
                      ? 'bg-[#37192C] text-[#FFF3C5] ms-auto rounded-tr-none text-right'
                      : 'bg-white text-[#37192C] me-auto rounded-tl-none text-right border border-[#37192c]/10')
                  }
                >
                  <div className="flex items-center justify-between text-[10px] font-bold opacity-80 mb-1">
                    <span>{msg.senderName}</span>
                    <span>{msg.createdAt}</span>
                  </div>
                  <p className="leading-6 font-semibold whitespace-pre-line">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Attachment preview */}
            {attachmentUrl && (
              <div className="relative mb-2 w-20 h-20 rounded-xl overflow-hidden border border-[#37192c]/20">
                <img src={attachmentUrl} alt="پیوست" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setAttachmentUrl(null)}
                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Chat Input Bar */}
            <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-2 border-t border-[#37192c]/10">
              <label className="grid size-10 place-items-center rounded-xl bg-white border border-[#37192c]/10 text-[#37192C] cursor-pointer hover:bg-[#FFF3C5]">
                <Paperclip size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>

              <button
                type="button"
                onClick={handleSendVoiceSample}
                className={`grid size-10 place-items-center rounded-xl text-[#37192C] transition ${
                  recordingVoice ? 'bg-rose-500 text-white animate-pulse' : 'bg-white border border-[#37192c]/10 hover:bg-[#FFF3C5]'
                }`}
                title="ارسال وویس صوتی"
              >
                <Mic size={18} />
              </button>

              <input
                type="text"
                placeholder="پیام خود را بنویسید..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-white border border-[#37192c]/10 rounded-xl px-4 py-2.5 text-xs font-bold outline-none text-[#37192C]"
              />

              <button
                type="submit"
                className="grid size-10 place-items-center rounded-xl bg-[#37192C] text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-md"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
