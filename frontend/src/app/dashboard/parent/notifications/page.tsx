'use client';

import React, { useState, useMemo } from 'react';
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
import Pagination from '@/components/ui/Pagination';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead,
  useDeleteNotification 
} from '@/lib/api/hooks/useNotifications';
import { useRespondToLinkRequest } from '@/lib/api/hooks/useLinks';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { cn } from '@/lib/utils';
import NotificationDetailModal from '@/components/notifications/NotificationDetailModal';
import { Notification } from '@/lib/api/services/notificationService';
import { NotificationStatsCard } from './components/NotificationStatsCard';
import { NotificationFeedSkeleton, NotificationStatsSkeleton } from './components/NotificationsSkeleton';

export default function ParentNotificationsPage() {
  const { selectedChildId } = useParentStore();
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

  const displayNotifications = useMemo(() => {
    return notifications.map((n: Notification) => 
      optimisticReadIds.has(n.id) ? { ...n, isRead: true } : n
    );
  }, [notifications, optimisticReadIds]);

  const filteredNotifications = useMemo(() => {
    return displayNotifications.filter((n: Notification) => {
      // Child Filtering:
      const notificationChildId = (n.data as any)?.childId || (n.data as any)?.studentId;
      const childMatch = !notificationChildId || notificationChildId === selectedChildId;
      
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           n.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
                           (filter === 'unread' && !n.isRead) || 
                           (filter === 'LINK_REQUEST' && typeof n.type === 'string' && n.type.startsWith('LINK_')) ||
                           (filter === 'SYSTEM' && (n.type === 'SYSTEM' || !n.type)) ||
                           (filter === 'ACADEMIC' && n.type === 'ACADEMIC') ||
                           (filter === 'announcements' && n.type === 'ANNOUNCEMENT');

      return childMatch && matchesSearch && matchesFilter;
    });
  }, [displayNotifications, searchQuery, filter, selectedChildId]);

  const parentNotifications = displayNotifications.filter((n: Notification) => {
    const notificationChildId = (n.data as any)?.childId || (n.data as any)?.studentId;
    return !notificationChildId || notificationChildId === selectedChildId;
  });

  const unreadNotifications = parentNotifications.filter((n: Notification) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  const stats = {
    total: parentNotifications.length,
    unread: unreadCount,
    linkRequests: unreadNotifications.filter((n: Notification) => typeof n.type === 'string' && n.type.startsWith('LINK_')).length,
    system: unreadNotifications.filter((n: Notification) => n.type === 'SYSTEM' || !n.type).length,
    academic: unreadNotifications.filter((n: Notification) => n.type === 'ACADEMIC').length,
    announcements: unreadNotifications.filter((n: Notification) => n.type === 'ANNOUNCEMENT').length,
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
          refetch(); // Refresh to show changes
        },
      }
    );
  };

  const getTypeIcon = (type: string, isRead: boolean) => {
    const iconClass = isRead ? "h-5 w-5" : "h-5 w-5 text-slate-900 dark:text-white";
    switch (type) {
      case 'LINK_REQUEST': 
      case 'LINK_ACCEPTED':
      case 'LINK_REJECTED': return <Info className={isRead ? "h-5 w-5 text-blue-500" : iconClass} />;
      case 'SYSTEM':
      case 'GENERAL': return <AlertCircle className={isRead ? "h-5 w-5 text-orange-500" : iconClass} />;
      case 'MESSAGE': return <Mail className={isRead ? "h-5 w-5 text-primary" : iconClass} />;
      case 'ANNOUNCEMENT': return <Megaphone className={isRead ? "h-5 w-5 text-purple-500" : iconClass} />;
      case 'ACADEMIC': return <Activity className={isRead ? "h-5 w-5 text-green-500" : iconClass} />;
      default: return <Bell className={isRead ? "h-5 w-5 text-slate-500" : iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 animate-in fade-in duration-500">
      <div className="w-[95%] max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Main Content */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-orange-600 tracking-widest uppercase">
                <span>Parent Hub</span>
                <ChevronRight size={10} className="text-slate-400" />
                <span>Command Center Feed</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Stay updated with academic alerts, messages, and system dispatches.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {unreadCount > 0 && (
                <Button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  variant="outline"
                  className="h-11 px-6 rounded-xl border-dashed border-2 border-slate-300 dark:border-slate-800 hover:border-orange-600 hover:text-orange-600 transition-all font-black text-xs uppercase tracking-widest"
                >
                  {markAllAsReadMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-2" size={16} />}
                  Mark all read
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
                { id: 'announcements', label: 'Announcements' }
              ]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setFilter(t.id); setCurrentPage(1); }}
                  className={cn(
                    "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    filter === t.id 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-orange-600" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72 group px-1 sm:px-0">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={16} />
              <Input
                placeholder="Filter activity..."
                className="pl-11 h-10 rounded-xl border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 shadow-sm focus:ring-2 focus:ring-orange-600/20 text-xs font-bold"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <NotificationFeedSkeleton />
          ) : filteredNotifications.length === 0 ? (
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
                      ? "bg-white dark:bg-slate-900 shadow-lg shadow-orange-600/5 border-orange-600/20 hover:shadow-xl hover:shadow-orange-600/10 hover:-translate-y-0.5" 
                      : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
                  )}
                  onClick={() => handleOpenModal(n)}
                >
                  <CardContent className="p-5 flex gap-5 items-start">
                    <div className={cn(
                      "p-3 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center transition-all",
                      !n.isRead ? "bg-orange-500 text-white shadow-md shadow-orange-500/30" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
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
                          {!n.isRead && <Badge className="bg-orange-500 text-white text-[8px] font-black tracking-widest uppercase py-0.5 px-1.5 shadow-sm hover:bg-orange-500/90">New</Badge>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 shrink-0 ml-4 uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {(n.data as any)?.childName && (
                        <div className="mb-1">
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-md">
                            Re: {(n.data as any).childName}
                          </span>
                        </div>
                      )}

                      <p className={cn(
                        "text-sm leading-relaxed mb-3 line-clamp-1 mt-1",
                        !n.isRead ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-500"
                      )}>
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1 opacity-80 group-hover:opacity-100">
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
