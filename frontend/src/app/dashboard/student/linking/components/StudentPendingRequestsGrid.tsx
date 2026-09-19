import React from 'react';
import { Loader2, User } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';

interface StudentPendingRequestsGridProps {
  requests: any[];
  onRespond: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onCancel: (id: string) => void;
  userId?: string;
  respondingId?: string | null;
  cancellingId?: string | null;
  mainTab: 'network' | 'classroom';
}

export function StudentPendingRequestsGrid({ 
  requests, 
  onRespond, 
  onCancel, 
  userId, 
  respondingId, 
  cancellingId,
  mainTab
}: StudentPendingRequestsGridProps) {
  if (requests.length === 0) {
    return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
          <User size={32} className="text-slate-400" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">No pending {mainTab} requests.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {requests.map((req) => {
        const isOutgoing = req.requesterId === userId;
        const isClass = req.variant === 'classroom';
        const isResponding = respondingId === req.id;
        const isCancelling = cancellingId === req.id;

        const borderClass = isClass ? "border-purple-500" : "border-orange-500";
        const avatarClass = isClass ? "bg-purple-500" : "bg-orange-500";
        const acceptBtnClass = isClass ? "bg-purple-600 hover:bg-purple-700 shadow-purple-100" : "bg-orange-500 hover:bg-orange-600 shadow-orange-100";

        return (
          <Card key={req.id} className="rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-50 dark:border-slate-800 relative flex flex-col items-center p-6 pt-8 transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[8px] font-bold tracking-widest text-[#94a3b8] uppercase">
                {isOutgoing ? 'Sent' : 'Incoming'}
              </span>
            </div>

            {/* Avatar Area */}
            <div className="relative mb-4 mt-2 cursor-pointer group">
              {/* Avatar Ring */}
              <div className={cn(
                "absolute -inset-[6px] rounded-full border-[1.5px] border-dashed border-slate-200 dark:border-slate-700 transition-colors", 
                !isOutgoing && borderClass
              )}></div>
              
              <Avatar className="h-16 w-16 rounded-full border border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105 opacity-90">
                <AvatarImage src={req.peerImage} alt={req.peerName} className="object-cover" />
                <AvatarFallback className={cn("rounded-full text-white font-bold text-xl", isOutgoing ? "bg-slate-300 dark:bg-slate-700" : avatarClass)}>
                  {req.peerName?.charAt(0).toUpperCase() || <User size={20} />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Email */}
            <div className="text-center mb-6 cursor-pointer">
              <h3 className="font-bold text-[#1e293b] dark:text-white text-[15px] mb-1 truncate max-w-[200px] tracking-tight">
                {req.peerName}
              </h3>
              <p className="text-[11px] text-[#94a3b8] font-medium truncate max-w-[200px]">
                {req.peerEmail}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-2 mb-6 px-1">
            {!isOutgoing ? (
              <>
                <button
                  onClick={() => onRespond(req.id, 'ACCEPT')}
                  disabled={isResponding}
                  className={cn(
                    "flex-1 h-9 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-white disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-1",
                    acceptBtnClass
                  )}
                >
                  {isResponding ? <Loader2 className="animate-spin" size={12} /> : "Accept"}
                </button>
                <Button
                  onClick={() => onRespond(req.id, 'REJECT')}
                  disabled={isResponding}
                  variant="outline"
                  className="flex-1 h-9 rounded-full border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors px-0"
                >
                  Decline
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onCancel(req.id)}
                disabled={isCancelling}
                variant="outline"
                className="w-full h-9 rounded-full border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-widest hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
              >
                {isCancelling ? <Loader2 className="animate-spin mr-2" size={12} /> : "Cancel Request"}
              </Button>
            )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-4"></div>

            {/* Bottom Role */}
            <div className="text-center w-full pb-1">
              <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">
                {req.linkType?.replace('_', ' ')}
              </span>
            </div>

          </Card>
        );
      })}
    </div>
  );
}
