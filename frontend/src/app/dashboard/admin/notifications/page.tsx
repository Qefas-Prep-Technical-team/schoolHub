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
import NotificationAnalyticsCard from '@/components/notifications/NotificationAnalyticsCard';
import { Notification } from '@/lib/api/services/notificationService';

export default function NotificationsPage() {
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
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
      case 'SYSTEM': return <AlertCircle className="h-5 w-5 text-primary" />;
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
    <div className="container mx-auto py-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
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

      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-6 items-start relative">

        {/* Notification list — 80% */}
        <div className="w-full min-w-0">
          {notifications.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden py-24 text-center">
          <CardContent>
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black mb-2">All clear!</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">You don&apos;t have any notifications at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {(() => {
            const totalPages = Math.ceil(notifications.length / itemsPerPage);
            const paginatedNotifications = notifications.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            );
            return (
              <>
                {paginatedNotifications.map((n: Notification) => (
                  <Card
                    key={n.id}
              className={cn(
                "rounded-2xl border transition-all duration-200 group overflow-hidden cursor-pointer hover:shadow-md",
                !n.isRead
                  ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm hover:border-primary/30 dark:hover:border-primary/40"
                  : "bg-gray-50/70 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 opacity-70 hover:opacity-100"
              )}
              onClick={() => handleOpenModal(n)}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Left accent stripe */}
                  <div className={cn(
                    "w-1 rounded-l-2xl shrink-0 transition-all",
                    !n.isRead ? "bg-primary" : "bg-transparent"
                  )} />

                  <div className="flex gap-4 p-5 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={cn(
                      "mt-0.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center transition-all",
                      !n.isRead
                        ? "bg-primary/10 dark:bg-primary/15 text-primary"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                    )}>
                      {getTypeIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: title + timestamp */}
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className={cn(
                            "text-sm leading-tight truncate",
                            !n.isRead
                              ? "font-black text-gray-900 dark:text-white"
                              : "font-semibold text-gray-500 dark:text-gray-400"
                          )}>
                            {n.title}
                          </h3>
                          {!n.isRead && (
                            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/15 dark:bg-primary/25 text-primary border border-primary/20 dark:border-primary/30">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1 shrink-0">
                          <Clock size={11} />
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Type chip */}
                      <span className={cn(
                        "inline-flex mb-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                        n.type === 'LINK_REQUEST' ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" :
                        n.type === 'SYSTEM' ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" :
                        n.type === 'ANNOUNCEMENT' ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" :
                        n.type === 'ACADEMIC' ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400" :
                        "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      )}>
                        {n.type.replace(/_/g, ' ')}
                      </span>

                      {/* Message */}
                      <p className={cn(
                        "text-sm leading-relaxed line-clamp-2",
                        !n.isRead
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-500"
                      )}>
                        {n.message}
                      </p>

                      {/* Actions row */}
                      {((n.type === 'LINK_REQUEST' && !n.isRead && Boolean(n.data?.linkId)) || n.link) ? (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {n.type === 'LINK_REQUEST' && !n.isRead && Boolean(n.data?.linkId) && (
                            <>
                              <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleLinkAction(n.id, n.data!.linkId as string, 'ACCEPT'); }}
                                disabled={respondMutation.isPending}
                                className="h-8 px-4 rounded-lg bg-primary text-white font-bold text-xs shadow-sm shadow-primary/20 hover:scale-105 transition-all"
                              >
                                <Check size={13} className="mr-1" /> Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleLinkAction(n.id, n.data!.linkId as string, 'REJECT'); }}
                                disabled={respondMutation.isPending}
                                className="h-8 px-4 rounded-lg border border-gray-200 dark:border-gray-700 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 transition-all"
                              >
                                <X size={13} className="mr-1 text-red-500" /> Decline
                              </Button>
                            </>
                          )}
                          {n.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); router.push(n.link!); }}
                              className="h-8 px-3 rounded-lg text-primary font-bold text-xs hover:bg-primary/5 dark:hover:bg-primary/15 transition-all"
                            >
                              View details <ExternalLink className="ml-1" size={12} />
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Hover action icons */}
                    <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                          className="h-8 w-8 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15"
                          title="Mark as read"
                        >
                          <Check size={15} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                        className="h-8 w-8 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mt-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, notifications.length)} of {notifications.length} notifications
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 rounded-lg text-xs font-bold border-gray-200 dark:border-gray-800"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 rounded-lg text-xs font-bold border-gray-200 dark:border-gray-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      );
    })()}
  </div>
)}
        </div>

        {/* Analytics sidebar — 20% */}
        <div className="hidden lg:block">
          <NotificationAnalyticsCard notifications={notifications} />
        </div>
      </div>

      {/* Mobile Modal */}
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

