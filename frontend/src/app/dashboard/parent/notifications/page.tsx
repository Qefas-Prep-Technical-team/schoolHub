'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Check, 
  X, 
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

export default function ParentNotificationsPage() {
  const { selectedChildId } = useParentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'academic' | 'announcements'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: notifications = [], isLoading, refetch } = useNotifications();
  
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();
  const respondMutation = useRespondToLinkRequest();

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: Notification) => {
      // Child Filtering:
      // Show if:
      // 1. Notification has no child context (global announcement, link request for parent, etc)
      // 2. Notification has child context and it matches selectedChildId
      const notificationChildId = (n.data as any)?.childId || (n.data as any)?.studentId;
      const childMatch = !notificationChildId || notificationChildId === selectedChildId;
      
      const searchMatch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      let tabMatch = true;
      if (activeTab === 'unread') tabMatch = !n.isRead;
      if (activeTab === 'academic') tabMatch = n.type === 'ACADEMIC';
      if (activeTab === 'announcements') tabMatch = n.type === 'ANNOUNCEMENT';

      return childMatch && searchMatch && tabMatch;
    });
  }, [notifications, searchQuery, activeTab, selectedChildId]);

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

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
          refetch();
        },
      }
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return <Info className="h-5 w-5 text-blue-500" />;
      case 'SYSTEM': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'MESSAGE': return <Mail className="h-5 w-5 text-primary" />;
      case 'ANNOUNCEMENT': return <Megaphone className="h-5 w-5 text-purple-500" />;
      case 'ACADEMIC': return <Activity className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Retrieving Communication Logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-0 animate-in fade-in duration-700">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Console-style Header with Breadcrumbs */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              <span>Parent Hub</span>
              <ChevronRight size={10} className="text-orange-500" />
              <span>Communication</span>
              <ChevronRight size={10} className="text-orange-500" />
              <span className="text-orange-600">Dispatches</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-orange-600 rounded-[1.2rem] shadow-2xl shadow-orange-600/30">
                <Bell size={24} className="text-white fill-current" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Notifications
              </h1>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-tight max-w-xl leading-relaxed">
              Real-time monitoring of academic alerts, school announcements, and system dispatches for your selected child.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {unreadCount > 0 && (
              <Button 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="h-14 px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/20 transition-all font-black text-xs uppercase tracking-widest active:scale-95 group"
              >
                {markAllAsReadMutation.isPending ? <Loader2 className="animate-spin mr-3" size={18} /> : <Check className="mr-3 group-hover:scale-125 transition-transform" size={18} />}
                Clear Frequency
              </Button>
            )}
          </div>
        </header>

        {/* Dynamic Filters & Search Card */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 px-2">
          <div className="flex p-2 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-[2.2rem] border border-slate-200/50 dark:border-white/5 shadow-sm overflow-x-auto custom-scrollbar no-scrollbar">
            {(['all', 'unread', 'academic', 'announcements'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "flex items-center gap-2 px-8 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === t 
                    ? "bg-orange-600 shadow-xl shadow-orange-600/20 text-white scale-105" 
                    : "text-slate-500 hover:text-orange-600 dark:hover:text-white"
                )}
              >
                {t === 'all' && <Activity size={14} />}
                {t === 'unread' && <AlertCircle size={14} />}
                {t === 'academic' && <Activity size={14} />}
                {t === 'announcements' && <Megaphone size={14} />}
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-all duration-500" size={18} />
            <Input
              placeholder="Filter dispatch feed..."
              className="pl-16 h-16 rounded-[2rem] border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm focus:ring-4 focus:ring-orange-600/10 focus:border-orange-500/30 text-xs font-bold uppercase tracking-tight"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Notifications Grid */}
        <div className="grid grid-cols-1 gap-4 px-1">
          {filteredNotifications.length === 0 ? (
            <Card className="rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/5 bg-transparent overflow-hidden py-32 text-center relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardContent className="relative z-10">
                <div className="w-28 h-28 bg-slate-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <Bell className="h-14 w-14 text-slate-300 dark:text-slate-800" />
                </div>
                <h3 className="text-3xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tighter">Signal Dead</h3>
                <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-bold text-[11px] uppercase tracking-widest leading-relaxed opacity-60">
                  No active dispatches matched your current frequency filters. Adjust your parameters or select another child profile.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5">
              {filteredNotifications.map((n: Notification) => (
                <Card 
                  key={n.id} 
                  className={cn(
                    "rounded-[2.5rem] border transition-all duration-700 group overflow-hidden cursor-pointer hover:-translate-y-1",
                    !n.isRead 
                      ? "bg-white dark:bg-slate-900 shadow-2xl shadow-orange-600/5 border-orange-500/20 ring-1 ring-orange-500/5" 
                      : "bg-white/40 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-80"
                  )}
                  onClick={() => handleOpenModal(n)}
                >
                  <CardContent className="p-8 flex gap-8 items-start">
                    <div className={cn(
                      "p-5 rounded-[1.8rem] shrink-0 h-16 w-16 flex items-center justify-center transition-all duration-700 shadow-lg",
                      !n.isRead 
                        ? "bg-orange-600 text-white shadow-orange-600/30 scale-105 rotate-3 group-hover:rotate-0" 
                        : "bg-slate-100 dark:bg-white/5 text-slate-400 shadow-none border border-slate-200 dark:border-white/10"
                    )}>
                      {getTypeIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <h3 className={cn(
                              "text-xl leading-none truncate tracking-tight uppercase",
                              !n.isRead ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-500 dark:text-slate-400"
                            )}>
                              {n.title}
                            </h3>
                            {!n.isRead && (
                              <Badge className="bg-orange-600 text-white text-[9px] font-black tracking-widest uppercase py-1 px-2.5 shadow-lg shadow-orange-600/20 border-none animate-pulse">
                                Priority Dispatch
                              </Badge>
                            )}
                          </div>
                          {(n.data as any)?.childName && (
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                              Re: {(n.data as any).childName}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-black flex items-center gap-2 shrink-0 ml-4 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-slate-100 dark:border-white/5 shadow-sm">
                          <Clock size={12} className="text-orange-500" /> {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <p className={cn(
                        "text-[14px] leading-relaxed mb-6 line-clamp-2",
                        !n.isRead ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-500"
                      )}>
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-4 transition-all">
                              Initiate Deep Review <ChevronRight size={14} className="group-hover:scale-125 transition-transform" />
                            </span>
                         </div>

                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={(e) => {
                               e.stopPropagation();
                               deleteMutation.mutate(n.id);
                             }}
                             className="h-11 w-11 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm hover:shadow-xl active:scale-90"
                           >
                             <Trash2 size={18} />
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
