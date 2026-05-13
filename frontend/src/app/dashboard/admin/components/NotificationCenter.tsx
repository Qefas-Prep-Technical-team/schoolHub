'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertCircle, ExternalLink, Mail, Megaphone, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationService, Notification } from '@/lib/api/services/notificationService';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead
} from '@/lib/api/hooks/useNotifications';
import { useRespondToLinkRequest } from '@/lib/api/hooks/useLinks';
import { linkService } from '@/lib/api/services/linkService';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

export default function NotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { userType } = useAuthStore();
  const { data: notifications = [], isLoading: isLoadingNotifications } = useNotifications({ limit: 10 });
  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = unreadCountData?.count || 0;

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const respondMutation = useRespondToLinkRequest();

  const lastSeenId = React.useRef<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (lastSeenId.current && latestNotification.id !== lastSeenId.current && !latestNotification.isRead) {
        toast.info(
          <div className="flex flex-col gap-1">
            <p className="font-bold text-sm">{latestNotification.title}</p>
            <p className="text-xs opacity-90">{latestNotification.message}</p>
          </div>,
          { icon: getTypeIcon(latestNotification.type) }
        );
      }
      lastSeenId.current = latestNotification.id;
    }
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleLinkAction = async (notification: Notification, action: 'ACCEPT' | 'REJECT') => {
    const linkId = typeof notification.data?.linkId === 'string' ? notification.data.linkId : undefined;
    if (!linkId) return;

    respondMutation.mutate(
      { id: linkId, action },
      {
        onSuccess: () => {
          handleMarkAsRead(notification.id);
        },
      }
    );
  };

  // Remove filter to show all notification types
  const filteredNotifications = notifications;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return <Info className="h-4 w-4 text-blue-500" />;
      case 'SYSTEM': return <AlertCircle className="h-4 w-4 text-primary" />;
      case 'MESSAGE': return <Mail className="h-4 w-4 text-primary" />;
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4 text-purple-500" />;
      case 'ACADEMIC': return <Activity className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent h-10 w-10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-background text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0 shadow-2xl border-border bg-background rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="p-0 font-bold text-base">Activity & Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-primary hover:text-primary/80 font-semibold"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-6">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Megaphone className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">We'll let you know when school announcements or messages arrive.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredNotifications.map((n: any) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-4 border-b hover:bg-accent/50 transition-colors relative group cursor-pointer",
                    !n.isRead && "bg-primary/5 dark:bg-primary/10"
                  )}
                  onClick={() => {
                    if (n.link) router.push(n.link);
                    if (!n.isRead) handleMarkAsRead(n.id);
                    setIsOpen(false);
                  }}
                >
                  {!n.isRead && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}

                  <div className="flex gap-3">
                    <div className="mt-0.5 bg-background border rounded-full p-1.5 shrink-0 h-8 w-8 flex items-center justify-center">
                      {getTypeIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-[13px] leading-tight text-gray-900 dark:text-white truncate pr-4">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap pt-0.5 font-medium">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-normal mb-2">
                        {n.message}
                      </p>

                      {/* Action buttons for Link Requests */}
                      {n.type === 'LINK_REQUEST' && !n.isRead && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            disabled={respondMutation.isPending}
                            onClick={() => handleLinkAction(n, 'ACCEPT')}
                            size="sm"
                            className="h-8 bg-primary hover:bg-primary/90 text-white font-bold text-[11px] px-3 rounded-lg shadow-sm shadow-primary/20"
                          >
                            <Check className="h-3 w-3 mr-1" /> Accept
                          </Button>
                          <Button
                            disabled={respondMutation.isPending}
                            onClick={() => handleLinkAction(n, 'REJECT')}
                            variant="outline"
                            size="sm"
                            className="h-8 text-[11px] font-bold px-3 rounded-lg border-gray-200"
                          >
                            <X className="h-3 w-3 mr-1 text-red-500" /> Decline
                          </Button>
                        </div>
                      )}

                      {/* Link to details if exists */}
                      {n.link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] mt-1 p-0 text-primary hover:bg-transparent"
                          onClick={() => {
                            handleMarkAsRead(n.id);
                            router.push(n.link!);
                          }}
                        >
                          View details <ExternalLink className="h-2.5 w-2.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full h-9 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white"
            asChild
          >
            <Link
              href={`/dashboard/${userType?.toLowerCase() || 'admin'}/notifications`}
              onClick={() => setIsOpen(false)}
            >
              See all notifications
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

