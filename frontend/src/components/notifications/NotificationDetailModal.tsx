'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Check, 
  X, 
  Info, 
  AlertCircle, 
  Clock, 
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Notification } from '@/lib/api/services/notificationService';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface NotificationDetailModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
  onRespondToLink?: (notificationId: string, linkId: string, action: 'ACCEPT' | 'REJECT') => void;
  isResponding?: boolean;
}

export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onRespondToLink,
  isResponding
}: NotificationDetailModalProps) {
  const router = useRouter();

  if (!notification) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return <Info className="h-6 w-6 text-blue-500" />;
      case 'SYSTEM': return <AlertCircle className="h-6 w-6 text-orange-500" />;
      case 'LINK_ACCEPTED': return <Check className="h-6 w-6 text-green-500" />;
      case 'LINK_REJECTED': return <X className="h-6 w-6 text-red-500" />;
      default: return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return "bg-blue-50 text-blue-700 border-blue-100";
      case 'SYSTEM': return "bg-orange-50 text-orange-700 border-orange-100";
      case 'LINK_ACCEPTED': return "bg-green-50 text-green-700 border-green-100";
      case 'LINK_REJECTED': return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const handleAction = () => {
    if (notification.link) {
      if (onMarkAsRead && !notification.isRead) {
        onMarkAsRead(notification.id);
      }
      router.push(notification.link);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-[1.5rem]">
        <div className="relative p-6 pb-0">
           <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", getTypeColor(notification.type))}>
                {notification.type.replace('_', ' ')}
              </Badge>
              {!notification.isRead && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">New Alert</span>
                </div>
              )}
           </div>

           <DialogHeader className="space-y-3">
             <div className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm",
               getTypeColor(notification.type)
             )}>
               {getTypeIcon(notification.type)}
             </div>
             <DialogTitle className="text-2xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
               {notification.title}
             </DialogTitle>
             <DialogDescription className="text-gray-500 font-medium flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> {new Date(notification.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </DialogDescription>
           </DialogHeader>
        </div>

        <div className="p-6 pt-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold text-sm">
              {notification.message}
            </p>
          </div>

          {/* Special Data Sections (e.g. Link Requests) */}
          {notification.type === 'LINK_REQUEST' && !notification.isRead && notification.data?.linkId && (
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex gap-3">
                <Button 
                  onClick={() => onRespondToLink?.(notification.id, notification.data!.linkId!, 'ACCEPT')}
                  disabled={isResponding}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  <Check size={18} className="mr-2" /> Accept Request
                </Button>
                <Button 
                  onClick={() => onRespondToLink?.(notification.id, notification.data!.linkId!, 'REJECT')}
                  disabled={isResponding}
                  variant="outline"
                  className="flex-1 h-12 border-2 font-black rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                >
                  <X size={18} className="mr-2" /> Decline
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            {notification.link && (
              <Button 
                variant="ghost" 
                onClick={handleAction}
                className="w-full h-12 rounded-xl text-primary font-black text-xs hover:bg-primary/5 group"
              >
                Go to details <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            )}

            {!notification.isRead && notification.type !== 'LINK_REQUEST' && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  onMarkAsRead?.(notification.id);
                  onClose();
                }}
                className="w-full h-12 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white font-black text-xs"
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800">
           <Button variant="outline" onClick={onClose} className="w-full h-10 rounded-xl font-bold text-xs border-slate-200">
             Close
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
