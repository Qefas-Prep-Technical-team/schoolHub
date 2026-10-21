'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Info, 
  AlertCircle, 
  Trash2, 
  Clock,
  ChevronRight,
  Loader2,
  Search as SearchIcon,
  Megaphone,
  Mail,
  Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead, 
  useDeleteNotification 
} from '@/lib/api/hooks/useNotifications';
import { useRespondToLinkRequest } from '@/lib/api/hooks/useLinks';
import { cn } from '@/lib/utils';
import NotificationDetailModal from '@/components/notifications/NotificationDetailModal';
import { Notification } from '@/lib/api/services/notificationService';
import { resolveNotificationSender } from '@/lib/utils/notificationSender';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';
import { TeacherPagination } from '@/app/dashboard/teacher/components/TeacherPagination';
import { NotificationStatsCard } from './components/NotificationStatsCard';
import { NotificationFeedSkeleton, NotificationStatsSkeleton } from './components/NotificationsSkeleton';

export default function TeacherNotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [optimisticReadIds, setOptimisticReadIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  const { data: notifications = [], isLoading, refetch } = useNotifications();
  
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const respondMutation = useRespondToLinkRequest();
  const deleteMutation = useDeleteNotification();

  const displayNotifications = notifications.map((n: Notification) => 
    optimisticReadIds.has(n.id) ? { ...n, isRead: true } : n
  );

  const filteredNotifications = displayNotifications.filter((n: Notification) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !n.isRead) || 
                         (filter === 'LINK_REQUEST' && typeof n.type === 'string' && n.type.startsWith('LINK_')) ||
                         (filter === 'SYSTEM' && (n.type === 'SYSTEM' || !n.type)) ||
                         (filter === 'ACADEMIC' && n.type === 'ACADEMIC') ||
                         (filter === 'assignments' && (n.title?.includes('Subject Assignment') || n.title?.includes('Subject Unassigned'))) ||
                         (filter === 'devices' && n.title?.includes('Device Login'));
    return matchesSearch && matchesFilter;
  });

  const unreadNotifications = displayNotifications.filter((n: Notification) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  const stats = {
    total: displayNotifications.length,
    unread: unreadCount,
    linkRequests: unreadNotifications.filter((n: Notification) => typeof n.type === 'string' && n.type.startsWith('LINK_')).length,
    system: unreadNotifications.filter((n: Notification) => n.type === 'SYSTEM' || !n.type).length,
    academic: unreadNotifications.filter((n: Notification) => n.type === 'ACADEMIC').length,
    messages: unreadNotifications.filter((n: Notification) => n.type === 'MESSAGE' || n.type === 'ANNOUNCEMENT').length,
    assignments: unreadNotifications.filter((n: Notification) => n.title?.includes('Subject Assignment') || n.title?.includes('Subject Unassigned')).length,
    devices: unreadNotifications.filter((n: Notification) => n.title?.includes('Device Login')).length,
  };

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.isRead && !optimisticReadIds.has(notification.id)) {
      setOptimisticReadIds(prev => {
        const newSet = new Set(prev);
        newSet.add(notification.id);
        return newSet;
      });
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleLinkAction = (notificationId: string, linkId: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate(
      { id: linkId, action },
      {
        onSuccess: () => {
          markAsReadMutation.mutate(notificationId);
          setIsModalOpen(false);
          refetch();
        },
      }
    );
  };

  const getTypeIcon = (type: string, isRead: boolean) => {
    const iconClass = isRead ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white";
    switch (type) {
      case 'LINK_REQUEST': 
      case 'LINK_ACCEPTED':
      case 'LINK_REJECTED': return <Info className={isRead ? "h-4 w-4 sm:h-5 sm:w-5 text-blue-500" : iconClass} />;
      case 'SYSTEM':
      case 'GENERAL': return <AlertCircle className={isRead ? "h-4 w-4 sm:h-5 sm:w-5 text-amber-500" : iconClass} />;
      case 'MESSAGE': return <Mail className={isRead ? "h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" : iconClass} />;
      case 'ANNOUNCEMENT': return <Megaphone className={isRead ? "h-4 w-4 sm:h-5 sm:w-5 text-purple-500" : iconClass} />;
      case 'ACADEMIC': return <Activity className={isRead ? "h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" : iconClass} />;
      default: return <Bell className={isRead ? "h-4 w-4 sm:h-5 sm:w-5 text-slate-500" : iconClass} />;
    }
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-black font-sans">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        
        {/* Left Column: Main Content */}
        <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pb-2 border-b border-slate-200/60 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Bell size={15} className="fill-current" />
                </div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
                  Command Center Feed
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  Notifications
                </h1>
                <HeaderTooltip
                  content="Centralized notifications command feed for real-time institutional broadcasts, direct student linking requests, system status alerts, and academic assignment updates."
                  size={15}
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Stay updated with academic alerts, student link requests, and system events.
              </p>
            </div>

            {/* Mark All As Read Action */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {unreadCount > 0 && (
                <Button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-4 sm:px-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 transition-all font-bold text-xs uppercase tracking-wider active:scale-95 shadow-sm"
                >
                  {markAllAsReadMutation.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={15} />
                  ) : (
                    <Check className="mr-2 text-emerald-500" size={15} />
                  )}
                  <span>Mark all read</span>
                </Button>
              )}
            </div>
          </header>

          {/* Filters and Search Bar Card */}
          <div className="bg-white dark:bg-emerald-950/20 rounded-2xl border border-slate-200/80 dark:border-emerald-800/40 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            {/* Filter Pills with Horizontal Scroll on Mobile */}
            <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl overflow-x-auto scroll-smooth no-scrollbar border border-slate-200/60 dark:border-zinc-800 shrink-0">
              {([
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'LINK_REQUEST', label: 'Requests' },
                { id: 'SYSTEM', label: 'System' },
                { id: 'ACADEMIC', label: 'Academic' },
                { id: 'assignments', label: 'Assignments' },
                { id: 'devices', label: 'Devices' }
              ]).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setFilter(t.id); setCurrentPage(1); }}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0",
                    filter === t.id 
                      ? "bg-white dark:bg-emerald-950/60 shadow-sm text-emerald-600 dark:text-emerald-400 border border-slate-200/60 dark:border-emerald-700/50" 
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-72">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter notifications..."
                className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Notifications Feed */}
          {isLoading ? (
            <NotificationFeedSkeleton />
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-black py-16 sm:py-20 text-center shadow-none p-6 space-y-3">
              <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 dark:border-zinc-800">
                <Bell className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Signal Clear
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                No notifications match your active search or category filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-3.5">
              {paginatedNotifications.map((n: Notification) => {
                const senderInfo = resolveNotificationSender(n);

                return (
                  <div 
                    key={n.id} 
                    className={cn(
                      "rounded-2xl border transition-all duration-200 group overflow-hidden cursor-pointer p-3.5 sm:p-5 flex gap-3 sm:gap-4 items-start shadow-sm",
                      !n.isRead 
                        ? "bg-white dark:bg-emerald-950/40 border-emerald-500/40 dark:border-emerald-800/60 shadow-md shadow-emerald-500/5 hover:-translate-y-0.5" 
                        : "bg-white dark:bg-black border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-950"
                    )}
                    onClick={() => handleOpenModal(n)}
                  >
                    {/* Category Icon */}
                    <div className={cn(
                      "p-2.5 sm:p-3 rounded-xl shrink-0 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center transition-all",
                      !n.isRead 
                        ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" 
                        : "bg-slate-100 dark:bg-zinc-900 text-slate-400 border border-slate-200/60 dark:border-zinc-800"
                    )}>
                      {getTypeIcon(n.type, n.isRead)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h3 className={cn(
                            "text-sm sm:text-base leading-tight truncate tracking-tight font-bold",
                            !n.isRead ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"
                          )}>
                            {n.title}
                          </h3>
                          {!n.isRead && (
                            <Badge className="bg-emerald-500 text-white text-[9px] font-black uppercase py-0.5 px-1.5 shadow-none shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                          <Clock size={11} /> {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Sender Attribution */}
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">From</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {senderInfo.name}
                        </span>
                        {senderInfo.role && senderInfo.role.toLowerCase() !== senderInfo.name.toLowerCase() && (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-zinc-700/50">
                            {senderInfo.role}
                          </span>
                        )}
                      </div>

                      <p className={cn(
                        "text-xs sm:text-sm leading-relaxed mb-2.5 line-clamp-2",
                        !n.isRead ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-400 dark:text-slate-500"
                      )}>
                        {n.message}
                      </p>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Review Details</span>
                        <ChevronRight size={13} />
                      </span>

                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(n.id);
                        }}
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors opacity-70 group-hover:opacity-100"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <TeacherPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredNotifications.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  itemName="notifications"
                />
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Stats Card */}
        <div className="w-full lg:w-[320px] shrink-0">
          {isLoading ? (
            <NotificationStatsSkeleton />
          ) : (
            <NotificationStatsCard stats={stats} />
          )}
        </div>

      </div>

      <NotificationDetailModal 
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
        onRespondToLink={handleLinkAction}
        isResponding={respondMutation.isPending}
      />
    </div>
  );
}
