'use client';

import React from 'react';
import { Loader2, User, Clock, Check, X } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';

export interface PendingRequestEntity {
  id: string;
  requesterId?: string;
  peerName: string;
  peerEmail: string;
  peerImage?: string;
  variant: 'network' | 'classroom';
  linkType?: string;
  status: string;
}

interface StudentPendingRequestsGridProps {
  requests: PendingRequestEntity[];
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
      <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-8">
        <div className="p-3.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl text-zinc-400">
          <Clock size={28} />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          No pending {mainTab} requests.
        </p>
        <p className="text-xs text-zinc-400 max-w-sm">
          Any incoming connection requests from parents or teachers will appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {requests.map((req) => {
        const isOutgoing = req.requesterId === userId;
        const isClass = req.variant === 'classroom';
        const isResponding = respondingId === req.id;
        const isCancelling = cancellingId === req.id;

        const borderClass = isClass ? "border-purple-500" : "border-amber-500";
        const avatarBg = isClass ? "bg-purple-600" : "bg-amber-600";
        const acceptBtnClass = isClass ? "bg-purple-600 hover:bg-purple-700" : "bg-pink-600 hover:bg-pink-700";

        return (
          <Card 
            key={req.id} 
            className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md relative flex flex-col items-center p-5 pt-6 transition-all duration-200"
          >
            {/* Status Badge */}
            <div className="absolute top-3.5 left-3.5">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border",
                isOutgoing 
                  ? "bg-slate-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-slate-200/80 dark:border-zinc-800"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
              )}>
                {isOutgoing ? 'Sent by you' : 'Incoming'}
              </span>
            </div>

            {/* Avatar Profile Area */}
            <div className="relative mb-3 mt-4 cursor-pointer group">
              <div className={cn(
                "absolute -inset-[3px] rounded-full border-2 border-dashed", 
                !isOutgoing ? borderClass : "border-slate-300 dark:border-zinc-700"
              )} />
              
              <Avatar className="h-16 w-16 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm transition-transform group-hover:scale-105">
                {req.peerImage && <AvatarImage src={req.peerImage} alt={req.peerName} className="object-cover" />}
                <AvatarFallback className={cn("rounded-full text-white font-bold text-lg", isOutgoing ? "bg-zinc-400 dark:bg-zinc-700" : avatarBg)}>
                  {req.peerName?.charAt(0).toUpperCase() || <User size={20} />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Email */}
            <div className="text-center mb-4 w-full px-2">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-0.5 truncate tracking-tight" title={req.peerName}>
                {req.peerName}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium truncate" title={req.peerEmail}>
                {req.peerEmail}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-2 mb-4 px-1">
              {!isOutgoing ? (
                <>
                  <button
                    onClick={() => onRespond(req.id, 'ACCEPT')}
                    disabled={isResponding}
                    className={cn(
                      "flex-1 h-9 rounded-xl font-bold text-xs shadow-sm transition-all text-white disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-1",
                      acceptBtnClass
                    )}
                  >
                    {isResponding ? <Loader2 className="animate-spin" size={13} /> : <Check size={13} />}
                    <span>Accept</span>
                  </button>
                  <Button
                    onClick={() => onRespond(req.id, 'REJECT')}
                    disabled={isResponding}
                    variant="outline"
                    className="flex-1 h-9 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X size={13} className="mr-1" />
                    Decline
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => onCancel(req.id)}
                  disabled={isCancelling}
                  variant="outline"
                  className="w-full h-9 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all cursor-pointer"
                >
                  {isCancelling ? <Loader2 className="animate-spin mr-1.5" size={13} /> : <X size={13} className="mr-1.5" />}
                  Cancel Request
                </Button>
              )}
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-zinc-800/80 mb-3" />

            {/* Bottom Role Label */}
            <div className="text-center w-full">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                {req.linkType?.replace('_', ' ')}
              </span>
            </div>

          </Card>
        );
      })}
    </div>
  );
}
