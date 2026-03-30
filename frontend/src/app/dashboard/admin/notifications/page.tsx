'use client';

import React from 'react';
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
  MoreVertical,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Notification } from '@/lib/api/services/notificationService';

export default function NotificationsPage() {
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();
  const respondMutation = useRespondToLinkRequest();
  const acceptAllMutation = useAcceptAllLinkRequests();

  const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
  const linkRequests = unreadNotifications.filter((n: Notification) => n.type === 'LINK_REQUEST');

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleOpenModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleLinkAction = (notificationId: string, linkId: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate(
      { id: linkId, action },
      {
        onSuccess: () => {
          handleMarkAsRead(notificationId);
        },
      }
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return <Info className="h-5 w-5 text-blue-500" />;
      case 'SYSTEM': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading notifications...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-4">
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
    <div className="container mx-auto py-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Header section with Batch Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 font-medium mt-1">Stay updated with links, requests, and system alerts.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {unreadNotifications.length > 0 && (
            <Button 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              variant="outline"
              className="h-11 px-6 rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-all font-black text-xs uppercase tracking-widest"
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
              className="h-11 px-6 rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 hover:scale-105 transition-all font-black text-xs uppercase tracking-widest"
            >
              {acceptAllMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
              Accept All Links
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden py-24 text-center">
          <CardContent>
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black mb-2">All clear!</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">You don't have any notifications at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notifications.map((n: Notification) => (
            <Card 
              key={n.id} 
              className={cn(
                "rounded-3xl border-none transition-all duration-300 group overflow-hidden cursor-pointer",
                !n.isRead 
                  ? "bg-white dark:bg-gray-800 shadow-xl shadow-primary/5 ring-1 ring-primary/10" 
                  : "bg-gray-50/50 dark:bg-gray-900/50 opacity-80"
              )}
              onClick={() => handleOpenModal(n)}
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className={cn(
                    "mt-1 p-3 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center transition-all",
                    !n.isRead ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  )}>
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-3">
                        <h3 className={cn(
                          "text-lg leading-tight truncate",
                          !n.isRead ? "font-black text-gray-900 dark:text-white" : "font-bold text-gray-500 dark:text-gray-400"
                        )}>
                          {n.title}
                        </h3>
                        {!n.isRead && <Badge className="bg-primary text-white text-[9px] font-black tracking-widest uppercase py-0.5">New</Badge>}
                      </div>
                      <span className="text-xs text-gray-400 font-bold flex items-center gap-1.5 shrink-0 ml-4">
                        <Clock size={14} /> {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className={cn(
                      "text-sm leading-relaxed mb-4",
                      !n.isRead ? "text-gray-600 dark:text-gray-300 font-medium" : "text-gray-500 dark:text-gray-500"
                    )}>
                      {n.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                      <div className="flex gap-3">
                        {n.type === 'LINK_REQUEST' && !n.isRead && n.data?.linkId && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleLinkAction(n.id, n.data.linkId, 'ACCEPT')}
                              disabled={respondMutation.isPending}
                              className="px-5 rounded-xl bg-primary text-white font-bold text-xs h-10 shadow-md shadow-primary/20 hover:scale-105 transition-all"
                            >
                              <Check size={16} className="mr-1.5" /> Accept
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleLinkAction(n.id, n.data.linkId, 'REJECT')}
                              disabled={respondMutation.isPending}
                              className="px-5 rounded-xl border-2 font-bold text-xs h-10 hover:bg-gray-50"
                            >
                              <X size={16} className="mr-1.5 text-red-500" /> Decline
                            </Button>
                          </>
                        )}

                        {n.link && (
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleMarkAsRead(n.id);
                              router.push(n.link!);
                            }}
                            className="text-primary font-bold text-xs h-10 hover:bg-primary/5 transition-all"
                          >
                            View details <ExternalLink className="ml-1.5" size={14} />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMarkAsRead(n.id)}
                            className="h-10 w-10 rounded-xl text-gray-400 hover:text-primary"
                            title="Mark as read"
                          >
                            <Check size={18} />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteMutation.mutate(n.id)}
                          className="h-10 w-10 rounded-xl text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <NotificationDetailModal 
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onRespondToLink={(notificationId, linkId, action) => handleLinkAction(notificationId, linkId, action)}
        isResponding={respondMutation.isPending}
      />
    </div>
  );
}
