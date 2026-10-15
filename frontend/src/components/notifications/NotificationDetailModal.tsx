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
  userType?: string | null;
}

const getModalRoleTheme = (userType?: string | null) => {
  const role = userType?.toLowerCase();
  switch (role) {
    case 'student':
      return {
        accentText: 'text-pink-600 dark:text-pink-400',
        alertBg: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/30',
        alertText: 'text-pink-600 dark:text-pink-400',
        dotBg: 'bg-pink-500',
        primaryBtn: 'bg-pink-600 hover:bg-pink-700 shadow-pink-500/20',
        avatarBg: 'bg-pink-600',
        hoverGhost: 'hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600 dark:text-pink-400',
      };
    case 'teacher':
      return {
        accentText: 'text-emerald-600 dark:text-emerald-400',
        alertBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/30',
        alertText: 'text-emerald-600 dark:text-emerald-400',
        dotBg: 'bg-emerald-500',
        primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
        avatarBg: 'bg-emerald-600',
        hoverGhost: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      };
    case 'parent':
      return {
        accentText: 'text-orange-600 dark:text-orange-400',
        alertBg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/30',
        alertText: 'text-orange-600 dark:text-orange-400',
        dotBg: 'bg-orange-500',
        primaryBtn: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20',
        avatarBg: 'bg-orange-600',
        hoverGhost: 'hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-400',
      };
    case 'admin':
    default:
      return {
        accentText: 'text-blue-600 dark:text-blue-400',
        alertBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/30',
        alertText: 'text-blue-600 dark:text-blue-400',
        dotBg: 'bg-blue-500',
        primaryBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
        avatarBg: 'bg-blue-600',
        hoverGhost: 'hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400',
      };
  }
};

export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onRespondToLink,
  isResponding,
  userType,
}: NotificationDetailModalProps) {
  const router = useRouter();
  const theme = getModalRoleTheme(userType);
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
      case 'LINK_REQUEST': return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/50";
      case 'SYSTEM': return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800/50";
      case 'LINK_ACCEPTED': return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800/50";
      case 'LINK_RESPONSE': return "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border-primary/20 dark:border-primary/30";
      case 'LINK_REJECTED': return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50";
      case 'MESSAGE': return "bg-primary/5 dark:bg-primary/10 text-primary border-primary/10 dark:border-primary/20";
      case 'ANNOUNCEMENT': return "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800/50";
      case 'ACADEMIC': return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800/50";
      default: return "bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800";
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

  const metaRecord = notification?.meta as Record<string, unknown> | undefined;
  const priority = metaRecord?.priority ? String(metaRecord.priority) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[480px] p-0 overflow-hidden border border-slate-200/80 dark:border-zinc-800 shadow-2xl rounded-2xl sm:rounded-[2rem] bg-white dark:bg-zinc-950">
        <div className="relative p-5 sm:p-8 pb-0">
           <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <Badge variant="outline" className={cn("px-3 py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border", getTypeColor(notification.type))}>
                {notification.type.replace('_', ' ')}
              </Badge>
              {priority && priority !== 'NORMAL' && (
                <Badge variant="outline" className={cn("px-3 py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border", priority === 'URGENT' ? 'border-rose-500 text-rose-500' : 'border-amber-500 text-amber-500')}>
                  {priority}
                </Badge>
              )}
              {!notification.isRead && (
                <div className={cn("flex items-center gap-1.5 border px-2.5 py-1 rounded-lg sm:rounded-xl", theme.alertBg)}>
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", theme.dotBg)} />
                  <span className={cn("text-[9px] sm:text-[10px] font-black uppercase tracking-widest", theme.alertText)}>New Alert</span>
                </div>
              )}
           </div>

           <DialogHeader className="space-y-3 sm:space-y-4">
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shadow-md border shrink-0",
                   getTypeColor(notification.type)
                )}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-base sm:text-2xl font-black leading-snug tracking-tight text-zinc-900 dark:text-white mb-1">
                    {notification.title}
                  </DialogTitle>
                   <DialogDescription className="text-zinc-500 dark:text-zinc-400 font-bold flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar size={13} className="text-zinc-400" /> {new Date(notification.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13} className="text-zinc-400" /> {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </DialogDescription>
                </div>
              </div>
           </DialogHeader>
        </div>

        <div className="p-5 sm:p-8 pt-5 sm:pt-6 space-y-4 sm:space-y-6">
          <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl sm:rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 dark:border-zinc-800">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold text-xs sm:text-sm">
              &quot;{notification.message}&quot;
            </p>
          </div>

          {/* Detailed Person Info for Link Requests */}
          {!!linkId && (
            <div className="space-y-4">
              {isLoadingLink ? (
                <div className="flex items-center justify-center p-6 sm:p-8 bg-slate-50 dark:bg-zinc-900/50 rounded-xl sm:rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800">
                  <Loader2 className={cn("animate-spin mr-2.5 h-4 w-4", theme.accentText)} />
                  <span className="font-bold text-xs uppercase tracking-widest text-zinc-500">Retrieving details...</span>
                </div>
              ) : details ? (
                <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-[1.5rem] p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5 sm:gap-4 group">
                   <Avatar className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 shrink-0">
                      <AvatarImage src={details.image || ''} className="object-cover" />
                      <AvatarFallback className={cn("text-white font-black text-base sm:text-xl rounded-xl sm:rounded-2xl", theme.avatarBg)}>
                        {details.name.charAt(0)}
                      </AvatarFallback>
                   </Avatar>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm sm:text-lg text-zinc-900 dark:text-white leading-tight truncate">{details.name}</h4>
                      <p className="text-xs font-medium text-zinc-400 mb-1.5 truncate max-w-[200px]">{details.email}</p>
                      <div className="flex items-center gap-2">
                        <UIBadge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-[8px] font-black rounded-md px-2 py-0.5">
                          {details.type}
                        </UIBadge>
                        <span className={cn("text-[10px] font-black tracking-widest", theme.accentText)}>{details.code}</span>
                      </div>
                   </div>
                </div>
              ) : null}

              {/* Action Buttons if Pending */}
              {lr?.status === 'PENDING' && (
                <div className="pt-1">
                  {lr.requesterId === user?.id ? (
                    <div className="flex items-center justify-center p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl sm:rounded-2xl border border-amber-200 dark:border-amber-900/30">
                      <Loader2 className="animate-spin text-amber-500 mr-2" size={15} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        Waiting for response...
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2.5 sm:gap-4">
                      <Button 
                        onClick={() => onRespondToLink?.(notification.id, linkId!, 'ACCEPT')}
                        disabled={isResponding || isLoadingLink}
                        className={cn("flex-[2] h-11 sm:h-14 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider cursor-pointer", theme.primaryBtn)}
                      >
                        {isResponding ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check size={18} className="mr-1.5" />} 
                        {isResponding ? "Processing..." : "Accept Request"}
                      </Button>
                      <Button 
                        onClick={() => onRespondToLink?.(notification.id, linkId!, 'REJECT')}
                        disabled={isResponding || isLoadingLink}
                        variant="outline"
                        className="flex-1 h-11 sm:h-14 border border-slate-200 dark:border-zinc-800 font-bold rounded-xl sm:rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/20 transition-all text-[10px] uppercase tracking-wider cursor-pointer"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {lr?.status && lr.status !== 'PENDING' && (
                <div className="flex items-center justify-center p-3.5 bg-slate-50 dark:bg-zinc-900/50 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 italic">
                    This request is already <span className={cn("font-black ml-1", theme.accentText)}>{lr.status}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {notification.link && (
            <div className="pt-1">
              <Button 
                variant="ghost" 
                onClick={handleAction}
                className={cn("w-full h-10 sm:h-11 rounded-xl font-bold text-xs group cursor-pointer", theme.hoverGhost)}
              >
                Go to details <ChevronRight size={15} className="ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50/70 dark:bg-zinc-900/50 p-3.5 sm:p-4 border-t border-slate-100 dark:border-zinc-800/80">
           <Button variant="outline" onClick={onClose} className="w-full h-10 rounded-xl font-bold text-xs border-slate-200 dark:border-zinc-800 cursor-pointer">
             Close
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
