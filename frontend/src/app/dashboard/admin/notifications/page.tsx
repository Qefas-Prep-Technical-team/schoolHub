'use client';

import React, { useState } from 'react';
import {
  Bell,
  Check,
  X,
  Info,
  AlertCircle,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Loader2,
  Search as SearchIcon,
  Megaphone,
  Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Pagination from '@/components/ui/Pagination';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification
} from '@/lib/api/hooks/useNotifications';
import { useRespondToLinkRequest, useAcceptAllLinkRequests } from '@/lib/api/hooks/useLinks';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import NotificationDetailModal from '@/components/notifications/NotificationDetailModal';
import NotificationAnalyticsCard from '@/components/notifications/NotificationAnalyticsCard';
import { Notification } from '@/lib/api/services/notificationService';

export default function NotificationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [optimisticReadIds, setOptimisticReadIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();
  const respondMutation = useRespondToLinkRequest();
  const acceptAllMutation = useAcceptAllLinkRequests();

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
                         (filter === 'MESSAGES' && n.type === 'MESSAGE') ||
                         (filter === 'ASSESSMENTS' && (n.title?.includes('Assignment') || n.title?.includes('Assessment'))) ||
                         (filter === 'DEVICES' && n.title?.includes('Device Login'));
    return matchesSearch && matchesFilter;
  });

  const unreadCount = displayNotifications.filter((n: Notification) => !n.isRead).length;
  const linkRequests = displayNotifications.filter((n: Notification) => !n.isRead && typeof n.type === 'string' && n.type.startsWith('LINK_'));

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
          refetch(); // Refresh to show changes
        },
      }
    );
  };

  const getTypeIcon = (type: string, isRead: boolean) => {
    const iconClass = isRead ? "h-5 w-5" : "h-5 w-5 text-slate-900";
    switch (type) {
      case 'LINK_REQUEST': 
      case 'LINK_ACCEPTED':
      case 'LINK_REJECTED': return <Info className={isRead ? "h-5 w-5 text-blue-500" : iconClass} />;
      case 'SYSTEM':
      case 'GENERAL': return <AlertCircle className={isRead ? "h-5 w-5 text-orange-500" : iconClass} />;
      case 'MESSAGE':
      case 'ANNOUNCEMENT': return <Megaphone className={isRead ? "h-5 w-5 text-purple-500" : iconClass} />;
      case 'ACADEMIC': return <Activity className={isRead ? "h-5 w-5 text-green-500" : iconClass} />;
      default: return <Bell className={isRead ? "h-5 w-5 text-slate-500" : iconClass} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent py-8 animate-in fade-in duration-500">
        <div className="w-[80%] max-w-[80%] mx-auto flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8 min-w-0">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-11 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </header>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-slate-900/30 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex gap-2 p-1 w-full sm:w-auto">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
              <div className="h-10 w-full sm:w-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4" />
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mb-6" />
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Failed to load notifications</h3>
        <p className="text-gray-500 max-w-sm mb-6">There was an error fetching your notifications. Please try again.</p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 animate-in fade-in duration-500">
      <div className="w-[90%] max-w-[90%] mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Main Content */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-400 rounded-lg shadow-blue-400/20 shadow-lg">
                  <Bell size={16} className="text-white fill-current" />
                </div>
                <span className="text-[10px] font-black text-blue-500 tracking-widest uppercase">Admin Feed</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Stay updated with links, requests, and system alerts.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {unreadCount > 0 && (
                <Button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  variant="outline"
                  className="h-11 px-6 rounded-xl border-dashed border-2 border-slate-300 dark:border-slate-800 hover:border-blue-500 hover:text-blue-500 transition-all font-black text-xs uppercase tracking-widest"
                >
                  {markAllAsReadMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-2" size={16} />}
                  Mark all read
                </Button>
              )}

              {linkRequests.length > 0 && (
                <Button
                  onClick={() => {
                    if (window.confirm('Accept all pending link requests?')) {
                      acceptAllMutation.mutate(undefined as any);
                    }
                  }}
                  disabled={acceptAllMutation.isPending}
                  className="h-11 px-6 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-all font-black text-xs uppercase tracking-widest"
                >
                  {acceptAllMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
                  Accept All Links
                </Button>
              )}
            </div>
          </header>

          {/* Filters and Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-slate-900/30 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
              {([
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'LINK_REQUEST', label: 'Requests' },
                { id: 'SYSTEM', label: 'System' },
                { id: 'ACADEMIC', label: 'Academic' },
                { id: 'MESSAGES', label: 'Messages' },
                { id: 'ASSESSMENTS', label: 'Assessments' },
                { id: 'DEVICES', label: 'Devices' }
              ]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setFilter(t.id); setCurrentPage(1); }}
                  className={cn(
                    "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    filter === t.id 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-blue-500" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72 group px-1 sm:px-0">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <Input
                placeholder="Search notifications..."
                className="pl-11 h-10 rounded-xl border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 shadow-sm focus:ring-2 focus:ring-blue-500/20 text-xs font-bold"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card className="rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 overflow-hidden py-24 text-center shadow-none">
              <CardContent>
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tight">Signal Clear</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-bold text-xs uppercase tracking-widest opacity-60">No pending notifications in this frequency.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paginatedNotifications.map((n: Notification) => (
                <Card 
                  key={n.id} 
                  className={cn(
                    "rounded-[2rem] transition-all duration-300 group overflow-hidden cursor-pointer",
                    !n.isRead 
                      ? "bg-white dark:bg-slate-900 shadow-lg shadow-blue-500/5 border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5" 
                      : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
                  )}
                  onClick={() => handleOpenModal(n)}
                >
                  <CardContent className="p-5 flex gap-5 items-start">
                    <div className={cn(
                      "p-3 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center transition-all",
                      !n.isRead ? "bg-blue-400 text-white shadow-md shadow-blue-400/30" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                    )}>
                      {getTypeIcon(n.type, n.isRead)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "text-base leading-tight truncate tracking-tight",
                            !n.isRead ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-500 dark:text-slate-400"
                          )}>
                            {n.title}
                          </h3>
                          {!n.isRead && <Badge className="bg-blue-400 text-white text-[8px] font-black tracking-widest uppercase py-0.5 px-1.5 shadow-sm hover:bg-blue-500">New</Badge>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 shrink-0 ml-4 uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className={cn(
                        "text-sm leading-relaxed mb-3 line-clamp-1",
                        !n.isRead ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-500"
                      )}>
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 opacity-80 group-hover:opacity-100">
                           Review Details <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                         </span>

                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={(e) => {
                               e.stopPropagation();
                               deleteMutation.mutate(n.id);
                             }}
                             className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                           >
                             <Trash2 size={14} />
                           </Button>
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredNotifications.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Stats Card */}
        <div className="w-full lg:w-[320px] shrink-0">
          <NotificationAnalyticsCard notifications={displayNotifications} />
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
