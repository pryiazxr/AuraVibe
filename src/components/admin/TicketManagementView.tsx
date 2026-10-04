import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  Send,
  X,
  Paperclip,
  Mic,
  Pin,
  Lock,
  Trash2,
  Check,
  CheckCheck,
  UserX,
  Image as ImageIcon,
  Video,
  Volume2,
  Clock,
  MoreVertical,
  ChevronLeft
} from 'lucide-react';
import { SupportTicket, TicketMessage, TicketStatus, db, AdminUser } from '../../services/db';

type TicketManagementViewProps = {
  currentAdmin: AdminUser;
};

export function TicketManagementView({ currentAdmin }: TicketManagementViewProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => db.getTickets());
  const [activeTab, setActiveTab] = useState<'New' | 'Open' | 'Closed'>('New');
  const [search, setSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Message Form state
  const [inputText, setInputText] = useState('');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video' | 'audio'>('text');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [recordingVoice, setRecordingVoice] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      const latest = db.getTickets();
      setTickets(latest);
    });
    return () => unsub();
  }, []);

  const refreshData = () => {
    setTickets(db.getTickets());
  };

  const selectedTicket = useMemo(() => {
    return tickets.find((t) => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  // Mark ticket as read by admin when opened
  useEffect(() => {
    if (selectedTicketId) {
      db.markTicketAsReadByAdmin(selectedTicketId);
    }
  }, [selectedTicketId]);

  const handleSelectTicket = (tId: string) => {
    setSelectedTicketId(tId);
    db.markTicketAsReadByAdmin(tId);
    setInputText('');
    setMediaUrl(null);
    setMediaType('text');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      reader.onload = () => {
        if (reader.result) {
          setMediaUrl(reader.result as string);
          if (isVideo) setMediaType('video');
          else if (isAudio) setMediaType('audio');
          else setMediaType('image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || (!inputText.trim() && !mediaUrl)) return;

    db.replyTicket(
      selectedTicketId,
      inputText.trim() || (mediaType === 'image' ? '[تصویر]' : mediaType === 'video' ? '[ویدیو]' : '[وویس صوتی]'),
      'admin',
      `${currentAdmin.firstName} ${currentAdmin.lastName}`,
      false,
      'Open',
      mediaType,
      mediaUrl || undefined
    );

    setInputText('');
    setMediaUrl(null);
    setMediaType('text');
    refreshData();
  };

  const handleSendVoiceSample = () => {
    if (!selectedTicketId) return;
    setRecordingVoice(true);
    setTimeout(() => {
      setRecordingVoice(false);
      db.replyTicket(
        selectedTicketId,
        'پیام صوتی پشتیبانی آورا',
        'admin',
        `${currentAdmin.firstName} ${currentAdmin.lastName}`,
        false,
        'Open',
        'audio',
        'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg' // Sample valid audio
      );
      refreshData();
    }, 1200);
  };

  const handleTogglePin = (ticketId: string, currentPin?: boolean) => {
    db.updateTicketState(ticketId, { isPinned: !currentPin });
    refreshData();
  };

  const handleToggleBlock = (ticketId: string, currentBlock?: boolean) => {
    db.updateTicketState(ticketId, { isBlocked: !currentBlock });
    refreshData();
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    db.updateTicketState(ticketId, { status: newStatus });
    refreshData();
  };

  const handleDeleteMessage = (ticketId: string, msgId: string) => {
    if (confirm('آیا از حذف این پیام اطمینان دارید؟')) {
      db.deleteMessageFromTicket(ticketId, msgId);
      refreshData();
    }
  };

  // Filtered tickets list based on active tab and search
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        // Tab classification
        let tabMatch = false;
        if (activeTab === 'New') {
          tabMatch = t.status === 'New' || (t.unreadAdminCount ?? 0) > 0;
        } else if (activeTab === 'Open') {
          tabMatch = t.status === 'Open' || t.status === 'In Progress' || t.status === 'Waiting for Customer';
        } else if (activeTab === 'Closed') {
          tabMatch = t.status === 'Closed' || t.status === 'Resolved';
        }

        const searchMatch =
          t.customerName.toLowerCase().includes(search.toLowerCase()) ||
          t.customerPhone.includes(search) ||
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.ticketNumber.toLowerCase().includes(search.toLowerCase());

        return tabMatch && searchMatch;
      })
      .sort((a, b) => {
        // Pinned conversations first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [tickets, activeTab, search]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">پشتیبانی چت آنلاین (Support Center)</h2>
          <p className="text-xs text-[#8b627e]">گفتگوی زنده دوطرفه، ارسال متن، عکس، ویدیو و وویس به کاربران آنلاین</p>
        </div>
      </div>

      {/* Main Chat Messenger Layout */}
      <div className="rounded-[2.5rem] bg-white border border-[#37192c]/10 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] max-h-[750px]">
        {/* Left Column: Conversations List */}
        <div
          className={
            'md:col-span-4 border-e border-[#37192c]/10 flex flex-col bg-[#fffdf7] ' +
            (selectedTicketId ? 'hidden md:flex' : 'flex')
          }
        >
          {/* Status Tabs Header */}
          <div className="p-3 border-b border-[#37192c]/10 bg-white space-y-3">
            <div className="flex items-center rounded-xl bg-[#fffaf0] p-1 border border-[#37192c]/10 text-xs font-bold">
              <button
                onClick={() => setActiveTab('New')}
                className={
                  'flex-1 py-2 text-center rounded-lg transition relative ' +
                  (activeTab === 'New' ? 'bg-[#37192C] text-[#FFF3C5] shadow-xs' : 'text-[#37192C]/70 hover:text-[#37192C]')
                }
              >
                پیام‌های جدید
                {db.getUnreadSupportConversationsCount() > 0 && (
                  <span className="ms-1 px-1.5 py-0.5 text-[9px] rounded-full bg-rose-500 text-white font-black">
                    {db.getUnreadSupportConversationsCount()}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('Open')}
                className={
                  'flex-1 py-2 text-center rounded-lg transition ' +
                  (activeTab === 'Open' ? 'bg-[#37192C] text-[#FFF3C5] shadow-xs' : 'text-[#37192C]/70 hover:text-[#37192C]')
                }
              >
                پیام‌های باز
              </button>

              <button
                onClick={() => setActiveTab('Closed')}
                className={
                  'flex-1 py-2 text-center rounded-lg transition ' +
                  (activeTab === 'Closed' ? 'bg-[#37192C] text-[#FFF3C5] shadow-xs' : 'text-[#37192C]/70 hover:text-[#37192C]')
                }
              >
                بسته‌شده
              </button>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 px-3 py-2">
              <Search size={16} className="text-[#37192C]/40" />
              <input
                type="text"
                placeholder="جستجوی کاربر یا شماره گفتگو..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#37192C] outline-none"
              />
            </div>
          </div>

          {/* Conversations Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#37192c]/5">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8b627e] font-bold">گفتگویی در این دسته یافت نشد.</div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = t.id === selectedTicketId;
                const lastMsg = t.messages[t.messages.length - 1];
                const unreadCount = t.unreadAdminCount || 0;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t.id)}
                    className={
                      'p-4 cursor-pointer transition flex items-start gap-3 relative ' +
                      (isSelected ? 'bg-[#FFF3C5]/60 border-s-4 border-[#37192C]' : 'hover:bg-[#fffaf0]')
                    }
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      <div className="size-11 rounded-full bg-[#37192C] text-[#FFF3C5] grid place-items-center font-black text-sm border-2 border-white shadow-xs overflow-hidden">
                        {t.customerAvatar ? (
                          <img src={t.customerAvatar} alt={t.customerName} className="size-full object-cover" />
                        ) : (
                          t.customerName[0] || 'U'
                        )}
                      </div>
                      {t.isPinned && (
                        <span className="absolute -top-1 -start-1 grid size-5 place-items-center rounded-full bg-[#37192C] text-[#FFF3C5]">
                          <Pin size={10} />
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-[#37192C] truncate">{t.customerName}</h4>
                        <span className="text-[10px] text-[#8b627e] font-semibold">{lastMsg?.createdAt || ''}</span>
                      </div>

                      <div className="text-[11px] text-[#8b627e] font-bold truncate mt-0.5">{t.subject}</div>

                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <p className="text-[#37192C]/70 truncate max-w-[160px] font-semibold">
                          {lastMsg ? lastMsg.message : 'پیامی وجود ندارد'}
                        </p>

                        {unreadCount > 0 && (
                          <span className="grid size-5 place-items-center rounded-full bg-rose-500 text-[10px] font-black text-white shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Stream */}
        <div
          className={
            'md:col-span-8 flex flex-col bg-white h-full ' +
            (selectedTicketId ? 'flex' : 'hidden md:flex')
          }
        >
          {selectedTicket ? (
            <>
              {/* Active Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#37192c]/10 bg-[#fffaf0]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    className="md:hidden grid size-8 place-items-center rounded-xl bg-white text-[#37192C]"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="size-10 rounded-full bg-[#37192C] text-[#FFF3C5] grid place-items-center font-black text-sm shadow-xs overflow-hidden">
                    {selectedTicket.customerAvatar ? (
                      <img src={selectedTicket.customerAvatar} alt={selectedTicket.customerName} className="size-full object-cover" />
                    ) : (
                      selectedTicket.customerName[0] || 'U'
                    )}
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-[#37192C] flex items-center gap-2">
                      <span>{selectedTicket.customerName}</span>
                      {selectedTicket.isBlocked && (
                        <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">
                          مسدود شده
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#8b627e] font-bold">
                      {selectedTicket.customerPhone} | کد تیکت: {selectedTicket.ticketNumber}
                    </p>
                  </div>
                </div>

                {/* Conversation Actions Toolbar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(selectedTicket.id, selectedTicket.isPinned)}
                    className={
                      'grid size-8 place-items-center rounded-xl transition ' +
                      (selectedTicket.isPinned ? 'bg-[#37192C] text-[#FFF3C5]' : 'bg-white border border-[#37192c]/10 text-[#37192C]')
                    }
                    title={selectedTicket.isPinned ? 'برداشتن سنجاق' : 'سنجاق کردن گفتگو'}
                  >
                    <Pin size={14} />
                  </button>

                  <button
                    onClick={() => handleToggleBlock(selectedTicket.id, selectedTicket.isBlocked)}
                    className={
                      'grid size-8 place-items-center rounded-xl transition ' +
                      (selectedTicket.isBlocked ? 'bg-rose-600 text-white' : 'bg-white border border-[#37192c]/10 text-rose-600')
                    }
                    title={selectedTicket.isBlocked ? 'خروج از مسدودی' : 'مسدود کردن کاربر'}
                  >
                    <UserX size={14} />
                  </button>

                  {selectedTicket.status !== 'Closed' ? (
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, 'Closed')}
                      className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-200 transition"
                    >
                      بستن گفتگو
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, 'Open')}
                      className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition"
                    >
                      بازگشایی گفتگو
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#fffdfa]">
                {selectedTicket.messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';

                  return (
                    <div
                      key={msg.id}
                      className={
                        'group relative max-w-[80%] rounded-2xl p-4 text-xs font-semibold shadow-xs space-y-1.5 transition ' +
                        (isAdmin
                          ? 'ms-auto bg-[#37192C] text-[#FFF3C5] rounded-tr-none text-right'
                          : 'me-auto bg-white text-[#37192C] rounded-tl-none border border-[#37192c]/10 text-right')
                      }
                    >
                      {/* Delete Action Button */}
                      <button
                        onClick={() => handleDeleteMessage(selectedTicket.id, msg.id)}
                        className="absolute top-2 start-2 opacity-0 group-hover:opacity-100 transition grid size-6 place-items-center rounded-full bg-rose-500 text-white"
                        title="حذف پیام"
                      >
                        <Trash2 size={12} />
                      </button>

                      <div className="flex items-center justify-between text-[10px] font-bold opacity-80 border-b border-white/10 pb-1">
                        <span>{msg.senderName}</span>
                        <span>{msg.createdAt}</span>
                      </div>

                      {/* Render Media Types */}
                      {msg.mediaUrl && (
                        <div className="my-2 overflow-hidden rounded-xl border border-black/10">
                          {msg.type === 'image' && (
                            <img src={msg.mediaUrl} alt="تصویر پیوست" className="max-h-60 w-full object-cover" />
                          )}
                          {msg.type === 'video' && (
                            <video src={msg.mediaUrl} controls className="max-h-60 w-full rounded-xl bg-black" />
                          )}
                          {msg.type === 'audio' && (
                            <audio src={msg.mediaUrl} controls className="w-full my-1" />
                          )}
                        </div>
                      )}

                      {/* Text Message Content */}
                      {msg.message && <p className="leading-6 whitespace-pre-line font-bold">{msg.message}</p>}

                      {/* Message Delivery & Read Ticks for Admin */}
                      {isAdmin && (
                        <div className="flex justify-end pt-1">
                          {msg.readByUser ? (
                            <span className="flex items-center gap-1 text-[10px] text-amber-300 font-black" title="خوانده شده توسط کاربر">
                              <CheckCheck size={14} /> دیده شد
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-white/70 font-bold" title="تحویل داده شده">
                              <Check size={14} /> ارسال شد
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Media Preview Box */}
              {mediaUrl && (
                <div className="p-3 bg-[#fffaf0] border-t border-[#37192c]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {mediaType === 'image' && <img src={mediaUrl} alt="پیش‌نمایش" className="size-12 rounded-xl object-cover border" />}
                    {mediaType === 'video' && <Video size={24} className="text-[#37192C]" />}
                    {mediaType === 'audio' && <Volume2 size={24} className="text-[#37192C]" />}
                    <span className="text-xs font-bold text-[#37192C]">فایل آماده ارسال</span>
                  </div>

                  <button
                    onClick={() => {
                      setMediaUrl(null);
                      setMediaType('text');
                    }}
                    className="grid size-7 place-items-center rounded-full bg-rose-600 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Input Chat Bar */}
              {selectedTicket.isBlocked ? (
                <div className="p-4 bg-rose-50 text-center text-xs font-bold text-rose-800 border-t">
                  این کاربر توسط مدیر مسدود شده است. برای ارسال پاسخ ابتدا کاربر را از مسدودی خارج کنید.
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="p-3 border-t border-[#37192c]/10 bg-white flex items-center gap-2">
                  <label className="grid size-10 place-items-center rounded-xl bg-[#fffaf0] border border-[#37192c]/10 text-[#37192C] cursor-pointer hover:bg-[#FFF3C5] transition">
                    <Paperclip size={18} />
                    <input type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={handleFileUpload} />
                  </label>

                  <button
                    type="button"
                    onClick={handleSendVoiceSample}
                    className={`grid size-10 place-items-center rounded-xl transition ${
                      recordingVoice ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#fffaf0] border border-[#37192c]/10 text-[#37192C] hover:bg-[#FFF3C5]'
                    }`}
                    title="ضبط و ارسال پیام صوتی"
                  >
                    <Mic size={18} />
                  </button>

                  <input
                    type="text"
                    placeholder="پیام خود را تایپ کنید..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-[#fffaf0] border border-[#37192c]/10 rounded-xl px-4 py-2.5 text-xs font-bold text-[#37192C] outline-none"
                  />

                  <button
                    type="submit"
                    className="grid size-10 place-items-center rounded-xl bg-[#37192C] text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-md"
                  >
                    <Send size={18} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 grid place-items-center p-8 text-center text-xs text-[#8b627e] font-bold space-y-2">
              <div className="grid size-16 place-items-center rounded-full bg-[#fffaf0] text-[#37192C]">
                <MessageSquare size={32} />
              </div>
              <p>برای مشاهده پیام‌ها و پاسخ‌گویی، یک گفتگو را از سمت راست انتخاب کنید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
