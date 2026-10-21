'use client';

import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Megaphone, 
  Bell, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { HeaderTooltip } from './HeaderTooltip';
import NotificationDetailModal from '@/components/notifications/NotificationDetailModal';
import { Notification } from '@/lib/api/services/notificationService';
import { useMarkAsRead } from '@/lib/api/hooks/useNotifications';
import { cn } from '@/lib/utils';

export interface MessageItem {
  id: string;
  title: string;
  description: string;
  sender: string;
  senderRole?: string;
  isUnread: boolean;
  isAnnouncement: boolean;
  createdAt?: string | Date;
  type?: string;
  rawNotification?: Notification;
}

interface MessagesAnnouncementsProps {
  messages?: MessageItem[];
  onViewAll?: () => void;
  onCompose?: () => void;
}

export default function MessagesAnnouncements({ 
  messages = [], 
  onViewAll,
  onCompose 
}: MessagesAnnouncementsProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'alerts' | 'messages'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const markAsReadMutation = useMarkAsRead();

  const unreadCount = useMemo(() => {
    return messages.filter(m => m.isUnread).length;
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (filter === 'alerts') {
      return messages.filter(m => m.isAnnouncement || m.type === 'ANNOUNCEMENT' || m.type === 'SYSTEM');
    }
    if (filter === 'messages') {
      return messages.filter(m => !m.isAnnouncement && m.type !== 'ANNOUNCEMENT');
    }
    return messages;
  }, [messages, filter]);

  const handleMessageClick = (msg: MessageItem) => {
    const notif: Notification = msg.rawNotification || {
      id: msg.id,
      userId: '',
      title: msg.title,
      message: msg.description,
      type: (msg.type as any) || (msg.isAnnouncement ? 'ANNOUNCEMENT' : 'MESSAGE'),
      priority: 'NORMAL',
      isRead: !msg.isUnread,
      meta: {
        senderName: msg.sender,
        senderRole: msg.senderRole,
      },
      createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString()
    };

    setSelectedNotification(notif);
    setIsDetailModalOpen(true);

    if (msg.isUnread) {
      markAsReadMutation.mutate(msg.id);
    }
  };

  const getRelativeTime = (dateInput?: string | Date) => {
    if (!dateInput) return 'Recently';
    try {
      return formatDistanceToNow(new Date(dateInput), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full flex flex-col justify-between transition-all duration-500 hover:border-emerald-500/20">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Inbox <span className="text-emerald-600 dark:text-emerald-400">&</span> Alerts
              </h2>
              <HeaderTooltip 
                content="Centralizes direct communications, administrative broadcasts, and student inquiries. Click any alert to read full details or dispatch new broadcast announcements." 
                size={14} 
              />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-0.5">Communications Hub</p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {unreadCount} New
              </span>
            )}
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                title="View all notifications"
              >
                <span className="hidden sm:inline">View All</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl mb-4 border border-slate-200/40 dark:border-slate-700/40">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              "flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer",
              filter === 'all'
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            )}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('alerts')}
            className={cn(
              "flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
              filter === 'alerts'
                ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            )}
          >
            <Megaphone size={11} />
            <span>Alerts</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('messages')}
            className={cn(
              "flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
              filter === 'messages'
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            )}
          >
            <Mail size={11} />
            <span>Direct</span>
          </button>
        </div>

        {/* Message Feed List */}
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 shadow-sm">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              All Caught Up
            </h3>
            <p className="text-[10px] font-semibold text-slate-400 max-w-[200px] leading-relaxed">
              No pending communications or unread broadcasts in this category.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredMessages.slice(0, 4).map((msg) => {
              const isAlert = msg.isAnnouncement || msg.type === 'ANNOUNCEMENT' || msg.type === 'SYSTEM';

              return (
                <div
                  key={msg.id}
                  onClick={() => handleMessageClick(msg)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3 relative",
                    msg.isUnread
                      ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-50/50 shadow-sm"
                      : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-sm hover:border-slate-200"
                  )}
                >
                  {/* Category Icon Badge */}
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5",
                    isAlert
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {isAlert ? <Megaphone size={14} /> : <Mail size={14} />}
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0 max-w-[200px]">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                          {msg.sender || 'System'}
                        </span>
                        {msg.senderRole && msg.senderRole.toLowerCase() !== (msg.sender || '').toLowerCase() && (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                            {msg.senderRole}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-medium text-slate-400 shrink-0">
                        {getRelativeTime(msg.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {msg.title}
                    </h4>

                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {msg.description}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {msg.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" title="Unread" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compose / Broadcast Action Button */}
      <button 
        onClick={onCompose}
        className="w-full mt-4 sm:mt-6 py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
      >
        <Megaphone className="w-3.5 h-3.5" />
        <span>Broadcast Alert / Announce</span>
      </button>

      {/* Detail Modal */}
      <NotificationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
        onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
        userType="teacher"
      />
    </div>
  );
}
