'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff,
  Check, 
  CheckCheck,
  X, 
  Info, 
  AlertCircle, 
  ChevronRight, 
  Mail, 
  Megaphone, 
  Activity,
  Sparkles
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkAsRead, 
  useMarkAllAsRead 
} from '@/lib/api/hooks/useNotifications';
import { useRespondToLinkRequest } from '@/lib/api/hooks/useLinks';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import NotificationDetailModal from './NotificationDetailModal';
import { Notification } from '@/lib/api/services/notificationService';
import { resolveNotificationSender } from '@/lib/utils/notificationSender';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

interface RoleTheme {
  primaryBadge: string;
  badgePill: string;
  actionText: string;
  itemHover: string;
  unreadBg: string;
  accentBar: string;
  iconBg: string;
  footerText: string;
}

const getRoleTheme = (userType?: string | null): RoleTheme => {
  const role = userType?.toLowerCase();
  switch (role) {
    case 'student':
      return {
        primaryBadge: 'bg-pink-600',
        badgePill: 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900/40',
        actionText: 'text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30',
        itemHover: 'hover:bg-pink-50/40 dark:hover:bg-zinc-900/70 focus:bg-pink-50/40 dark:focus:bg-zinc-900/70',
        unreadBg: 'bg-pink-50/30 dark:bg-pink-950/10',
        accentBar: 'bg-pink-500 shadow-pink-500/50',
        iconBg: 'bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400',
        footerText: 'text-pink-600 dark:text-pink-400',
      };
    case 'teacher':
      return {
        primaryBadge: 'bg-emerald-600',
        badgePill: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40',
        actionText: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
        itemHover: 'hover:bg-emerald-50/40 dark:hover:bg-zinc-900/70 focus:bg-emerald-50/40 dark:focus:bg-zinc-900/70',
        unreadBg: 'bg-emerald-50/30 dark:bg-emerald-950/10',
        accentBar: 'bg-emerald-500 shadow-emerald-500/50',
        iconBg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
        footerText: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'parent':
      return {
        primaryBadge: 'bg-orange-600',
        badgePill: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40',
        actionText: 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30',
        itemHover: 'hover:bg-orange-50/40 dark:hover:bg-zinc-900/70 focus:bg-orange-50/40 dark:focus:bg-zinc-900/70',
        unreadBg: 'bg-orange-50/30 dark:bg-orange-950/10',
        accentBar: 'bg-orange-500 shadow-orange-500/50',
        iconBg: 'bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400',
        footerText: 'text-orange-600 dark:text-orange-400',
      };
    case 'admin':
    default:
      return {
        primaryBadge: 'bg-blue-600',
        badgePill: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
        actionText: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30',
        itemHover: 'hover:bg-blue-50/40 dark:hover:bg-zinc-900/70 focus:bg-blue-50/40 dark:focus:bg-zinc-900/70',
        unreadBg: 'bg-blue-50/30 dark:bg-blue-950/10',
        accentBar: 'bg-blue-500 shadow-blue-500/50',
        iconBg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
        footerText: 'text-blue-600 dark:text-blue-400',
      };
  }
};

export default function NotificationCenter() {
  const router = useRouter();
  const { userType } = useAuthStore();
  const theme = getRoleTheme(userType);
  const { data: notifications = [] } = useNotifications({ limit: 10 });
  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = unreadCountData?.count || 0;

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const respondMutation = useRespondToLinkRequest();

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lastSeenId = React.useRef<string | null>(null);

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    markAllAsReadMutation.mutate();
  };

  const handleOpenModal = React.useCallback((notification: Notification) => {
    setSelectedNotification(notification);
    setTimeout(() => {
      setIsModalOpen(true);
      if (!notification.isRead) {
        handleMarkAsRead(notification.id);
      }
    }, 250);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST':
        return {
          icon: <Info size={15} />,
          label: 'Connect',
          badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          iconBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
        };
      case 'LINK_ACCEPTED':
        return {
          icon: <Check size={15} />,
          label: 'Linked',
          badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
        };
      case 'LINK_REJECTED':
        return {
          icon: <X size={15} />,
          label: 'Declined',
          badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          iconBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
        };
      case 'MESSAGE':
        return {
          icon: <Mail size={15} />,
          label: 'Message',
          badgeClass: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
          iconBg: 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400',
        };
      case 'ANNOUNCEMENT':
        return {
          icon: <Megaphone size={15} />,
          label: 'Notice',
          badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          iconBg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
        };
      case 'ACADEMIC':
        return {
          icon: <Activity size={15} />,
          label: 'Academic',
          badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          iconBg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
        };
      case 'SYSTEM':
        return {
          icon: <AlertCircle size={15} />,
          label: 'System',
          badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
        };
      default:
        return {
          icon: <Bell size={15} />,
          label: 'Alert',
          badgeClass: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
          iconBg: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400',
        };
    }
  };

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (lastSeenId.current && latestNotification.id !== lastSeenId.current && !latestNotification.isRead) {
        const cfg = getTypeConfig(latestNotification.type);
        toast.info(
          <div className="flex flex-col gap-1 cursor-pointer" onClick={() => handleOpenModal(latestNotification)}>
            <p className="font-bold text-sm">{latestNotification.title}</p>
            <p className="text-xs opacity-90">{latestNotification.message}</p>
          </div>,
          { icon: cfg.icon }
        );
      }
      lastSeenId.current = latestNotification.id;
    }
  }, [notifications, handleOpenModal]);

  const handleLinkAction = async (notificationId: string, linkId: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate(
      { id: linkId, action },
      {
        onSuccess: () => {
          handleMarkAsRead(notificationId);
          setIsModalOpen(false);
        },
      }
    );
  };

  const filteredNotifications = notifications.filter((n: Notification) => 
    ['MESSAGE', 'ANNOUNCEMENT', 'LINK_REQUEST', 'LINK_RESPONSE', 'LINK_ACCEPTED', 'LINK_REJECTED', 'SYSTEM', 'ACADEMIC', 'GENERAL'].includes(n.type)
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 h-10 w-10 border border-slate-200/60 dark:border-zinc-800/80 transition-all cursor-pointer text-slate-700 dark:text-zinc-200"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5 transition-transform group-hover:scale-105" />
            {unreadCount > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-zinc-950 text-[10px] font-black shadow-sm animate-in zoom-in-75",
                theme.primaryBadge
              )}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-[calc(100vw-24px)] sm:w-[390px] max-w-[420px] p-0 shadow-2xl border border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl rounded-2xl overflow-hidden z-50 mr-1 sm:mr-0 animate-in fade-in-50 zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", theme.iconBg)}>
                <Bell size={14} />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notifications</span>
              {unreadCount > 0 ? (
                <Badge className={cn("border px-2 py-0.5 text-[10px] font-bold", theme.badgePill)}>
                  {unreadCount} new
                </Badge>
              ) : (
                <span className="text-[11px] font-medium text-zinc-400">All caught up</span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors", theme.actionText)}
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                  <BellOff size={22} />
                </div>
                <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No new notifications</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-[220px]">
                  You&apos;re completely up to date! Messages and announcements will appear here.
                </p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map((n: Notification) => {
                  const cfg = getTypeConfig(n.type);
                  const metaRecord = n.meta as Record<string, unknown> | undefined;
                  const priority = metaRecord?.priority as string | undefined;

                  return (
                    <DropdownMenuItem 
                      key={n.id} 
                      className={cn(
                        "p-3.5 sm:p-4 transition-all cursor-pointer outline-none flex items-start gap-3 relative group",
                        theme.itemHover,
                        !n.isRead && theme.unreadBg
                      )}
                      onSelect={() => handleOpenModal(n)}
                    >
                      {/* Unread Accent Bar */}
                      {!n.isRead && (
                        <div className={cn("absolute left-0 top-2 bottom-2 w-1 rounded-r-full shadow-sm", theme.accentBar)} />
                      )}
                      
                      {/* Icon */}
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-xs transition-transform group-hover:scale-105",
                        cfg.iconBg,
                        priority === 'URGENT' ? 'border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 text-rose-500' :
                        priority === 'HIGH' ? 'border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-500' :
                        'border-transparent'
                      )}>
                        {cfg.icon}
                      </div>
                      
                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0 rounded-md uppercase tracking-wider shrink-0 border", cfg.badgeClass)}>
                              {cfg.label}
                            </Badge>
                            <p className={cn(
                              "text-xs truncate text-zinc-900 dark:text-zinc-100",
                              !n.isRead ? "font-bold" : "font-medium text-zinc-700 dark:text-zinc-300"
                            )}>
                              {n.title}
                            </p>
                          </div>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 font-medium">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>

                        {/* Sender info */}
                        {(() => {
                          const senderInfo = resolveNotificationSender(n);
                          return (
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">From</span>
                              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                                {senderInfo.name}
                              </span>
                              {senderInfo.role && senderInfo.role.toLowerCase() !== senderInfo.name.toLowerCase() && (
                                <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0 rounded bg-slate-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                                  {senderInfo.role}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        
                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full h-9 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer group",
                theme.actionText
              )}
              onClick={() => {
                const rolePath = userType?.toLowerCase() || 'admin';
                router.push(`/dashboard/${rolePath}/notifications`);
              }}
            >
              <span>View All Notifications</span>
              <ChevronRight size={14} className={cn("transition-transform group-hover:translate-x-1", theme.footerText)} />
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDetailModal 
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onRespondToLink={handleLinkAction}
        isResponding={respondMutation.isPending}
        userType={userType}
      />
    </>
  );
}
