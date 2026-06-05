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
  ChevronRight,
  Activity,
  Mail,
  Megaphone
} from 'lucide-react';
import { Notification } from '@/lib/api/services/notificationService';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSingleLinkRequest } from '@/lib/api/hooks/useLinks';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from 'lucide-react';
import { Badge as UIBadge } from "@/components/ui/badge";

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
  const { user } = useAuthStore();
  const linkId = notification?.linkRequestId || ((notification?.meta || notification?.data) as Record<string, unknown> & { linkId?: string })?.linkId;
  const { data: linkRequest, isLoading: isLoadingLink } = useSingleLinkRequest(
    linkId || '',
    { enabled: isOpen && !!linkId }
  );

  const lr = linkRequest as Record<string, unknown> & { status?: string; requesterId?: string; targetStudent?: Record<string, string>; targetTeacher?: Record<string, string>; targetParent?: Record<string, string>; requesterStudent?: Record<string, string>; requesterTeacher?: Record<string, string>; requesterParent?: Record<string, string>; targetSchool?: Record<string, string>; requesterSchool?: Record<string, string>; targetType?: string; requesterType?: string };

  if (!notification) return null;

  const getRequesterDetails = () => {
    if (!lr) return null;
    const isRequester = lr.requesterId === user?.id;
    const person = isRequester ? (lr.targetStudent || lr.targetTeacher || lr.targetParent) : (lr.requesterStudent || lr.requesterTeacher || lr.requesterParent);
    const school = isRequester ? lr.targetSchool : lr.requesterSchool;

    if (person) {
      return {
        name: person.name || 'User',
        email: person.email,
        image: person.profileImage,
        code: person.studentCode || person.teacherCode || person.parentCode || '---',
        type: isRequester ? lr.targetType : lr.requesterType
      };
    }
    if (school) {
      return {
        name: school.name,
        email: school.schoolEmail,
        image: school.logo,
        code: school.schoolCode,
        type: 'SCHOOL'
      };
    }
    return null;
  };

  const details = getRequesterDetails();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return <Info className="h-6 w-6 text-blue-500" />;
      case 'SYSTEM': return <AlertCircle className="h-6 w-6 text-orange-500" />;
      case 'LINK_ACCEPTED': return <Check className="h-6 w-6 text-green-500" />;
      case 'LINK_RESPONSE': return <Activity className="h-6 w-6 text-primary" />;
      case 'LINK_REJECTED': return <X className="h-6 w-6 text-red-500" />;
      case 'MESSAGE': return <Mail className="h-6 w-6 text-primary" />;
      case 'ANNOUNCEMENT': return <Megaphone className="h-6 w-6 text-purple-500" />;
      case 'ACADEMIC': return <Activity className="h-6 w-6 text-green-500" />;
      default: return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return "bg-blue-50 text-blue-700 border-blue-100";
      case 'SYSTEM': return "bg-orange-50 text-orange-700 border-orange-100";
      case 'LINK_ACCEPTED': return "bg-green-50 text-green-700 border-green-100";
      case 'LINK_RESPONSE': return "bg-primary/10 text-primary border-primary/20";
      case 'LINK_REJECTED': return "bg-red-50 text-red-700 border-red-100";
      case 'MESSAGE': return "bg-primary/5 text-primary border-primary/10";
      case 'ANNOUNCEMENT': return "bg-purple-50 text-purple-700 border-purple-100";
      case 'ACADEMIC': return "bg-green-50 text-green-700 border-green-100";
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
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white dark:bg-gray-950">
        <div className="relative p-8 pb-0">
           <div className="flex items-center justify-between mb-6">
              <Badge variant="outline" className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2", getTypeColor(notification.type))}>
                {notification.type.replace('_', ' ')}
              </Badge>
              {!notification.isRead && (
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">New Alert</span>
                </div>
              )}
           </div>

           <DialogHeader className="space-y-4">
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg border-2",
                   getTypeColor(notification.type)
                )}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-black leading-tight tracking-tight text-gray-900 dark:text-white mb-1">
                    {notification.title}
                  </DialogTitle>
                   <DialogDescription className="text-gray-500 font-bold flex items-center gap-4 text-[10px] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> {new Date(notification.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </DialogDescription>
                </div>
              </div>
           </DialogHeader>
        </div>

        <div className="p-8 pt-8 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold text-sm italic">
              &quot;{notification.message}&quot;
            </p>
          </div>

          {/* Detailed Person Info for Link Requests */}
          {!!linkId && (
            <div className="space-y-4">
              {isLoadingLink ? (
                <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border-2 border-dashed">
                  <Loader2 className="animate-spin text-primary mr-3" />
                  <span className="font-black text-xs uppercase tracking-widest text-slate-500">Retrieving details...</span>
                </div>
              ) : details ? (
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border-2 border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group">
                   <Avatar className="h-16 w-16 rounded-2xl shadow-md border-2 border-white dark:border-slate-800">
                      <AvatarImage src={details.image || ''} className="object-cover" />
                      <AvatarFallback className="bg-primary text-white font-black text-xl rounded-2xl">
                        {details.name.charAt(0)}
                      </AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                      <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{details.name}</h4>
                      <p className="text-xs font-bold text-slate-400 mb-2 truncate max-w-[200px]">{details.email}</p>
                      <div className="flex items-center gap-2">
                        <UIBadge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-[8px] font-black rounded-md px-2 py-0.5">
                          {details.type}
                        </UIBadge>
                        <span className="text-[10px] font-black text-primary tracking-widest">{details.code}</span>
                      </div>
                   </div>
                </div>
              ) : null}

              {/* Action Buttons if Pending */}
              {lr?.status === 'PENDING' && (
                <div className="pt-2">
                  {lr.requesterId === user?.id ? (
                    <div className="flex items-center justify-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                      <Loader2 className="animate-spin text-orange-500 mr-2" size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                        Waiting for response...
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => onRespondToLink?.(notification.id, linkId!, 'ACCEPT')}
                        disabled={isResponding || isLoadingLink}
                        className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest"
                      >
                        {isResponding ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check size={20} className="mr-2" />} 
                        {isResponding ? "Processing..." : "Accept Request"}
                      </Button>
                      <Button 
                        onClick={() => onRespondToLink?.(notification.id, linkId!, 'REJECT')}
                        disabled={isResponding || isLoadingLink}
                        variant="outline"
                        className="flex-1 h-14 border-2 border-slate-100 dark:border-slate-800 font-black rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:hover:bg-red-950/20 transition-all text-[10px] uppercase tracking-widest"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {lr?.status && lr.status !== 'PENDING' && (
                <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    This request is already <span className="text-primary font-black ml-1">{lr.status}</span>
                  </span>
                </div>
              )}
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
