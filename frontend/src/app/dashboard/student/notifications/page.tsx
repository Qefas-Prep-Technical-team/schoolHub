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
  Filter,
  Search as SearchIcon
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import NotificationDetailModal from '@/components/notifications/NotificationDetailModal';
import { Notification } from '@/lib/api/services/notificationService';

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'requests'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();
  const respondMutation = useRespondToLinkRequest();

  const filteredNotifications = notifications.filter((n: Notification) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !n.isRead) || 
                         (filter === 'requests' && n.type === 'LINK_REQUEST');
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleOpenModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.isRead) {
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
        },
      }
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return <Info className="h-5 w-5 text-blue-500" />;
      case 'SYSTEM': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'LINK_ACCEPTED': return <Check className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-indigo-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Synchronizing notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-black/95 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-blue-200 shadow-lg">
                <Bell size={16} className="text-white fill-current" />
              </div>
              <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">Inbox</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-slate-500 font-medium">Manage your requests, alerts, and system updates.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {unreadCount > 0 && (
              <Button 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                variant="outline"
                className="h-11 px-6 rounded-xl border-dashed border-2 border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-widest"
              >
                {markAllAsReadMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-2" size={16} />}
                Mark all read
              </Button>
            )}
          </div>
        </header>

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl w-full lg:w-auto">
            {(['all', 'unread', 'requests'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "flex-1 lg:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === t 
                    ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search notifications..."
              className="pl-11 h-11 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500/20 text-xs font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Notifications Grid */}
        {filteredNotifications.length === 0 ? (
          <Card className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-sm overflow-hidden py-24 text-center">
            <CardContent>
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Clean inbox!</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">No notifications match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotifications.map((n: Notification) => (
              <Card 
                key={n.id} 
                className={cn(
                  "rounded-2xl border-none transition-all duration-300 group overflow-hidden cursor-pointer",
                  !n.isRead 
                    ? "bg-white dark:bg-slate-800 shadow-xl shadow-blue-500/5 ring-1 ring-blue-500/10" 
                    : "bg-slate-50/50 dark:bg-slate-900/50 opacity-80"
                )}
                onClick={() => handleOpenModal(n)}
              >
                <CardContent className="p-5 flex gap-5 items-start">
                  <div className={cn(
                    "p-3 rounded-xl shrink-0 h-12 w-12 flex items-center justify-center transition-all shadow-sm",
                    !n.isRead ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "text-base leading-tight truncate",
                          !n.isRead ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-500 dark:text-gray-400"
                        )}>
                          {n.title}
                        </h3>
                        {!n.isRead && <Badge className="bg-blue-600 text-white text-[8px] font-black tracking-widest uppercase py-0.5 px-1.5">New</Badge>}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 shrink-0 ml-4 uppercase tracking-tighter">
                        <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className={cn(
                      "text-sm leading-relaxed mb-3 line-clamp-1",
                      !n.isRead ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-500"
                    )}>
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                         View details <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                       </span>

                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={(e) => {
                             e.stopPropagation();
                             deleteMutation.mutate(n.id);
                           }}
                           className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                         >
                           <Trash2 size={14} />
                         </Button>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
