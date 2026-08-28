/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Link2,
  MoreVertical,
  Info,
  X,
  Copy,
  Clock,
  ChevronRight,
  Loader2,
  User,
  Monitor
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { getMemberDetails, getLinkTypeConfig } from './LinkingUtils';

interface ConnectionCardProps {
  item: any;
  type: 'active' | 'pending';
  currentUserId?: string;
  onRevoke?: (id: string) => void;
  onRespond?: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onCancel?: (id: string) => void;
  onCopy?: (text: string) => void;
  onViewProfile?: (item: any, details: any) => void;
  isLoading?: boolean;
}

export function ConnectionCard({
  item,
  type,
  currentUserId,
  onRevoke,
  onRespond,
  onCancel,
  onCopy,
  onViewProfile,
  isLoading = false
}: ConnectionCardProps) {
  const details = getMemberDetails(item, currentUserId);
  const cfg = getLinkTypeConfig(item.linkType);
  const schoolId = item.schoolId || (item as any).targetSchoolId || (item as any).requesterSchoolId;
  const isOutgoing = type === 'pending' && (
    item.requesterId === currentUserId ||
    (item.requesterType === 'SCHOOL' && schoolId)
  );

  // ── ACTIVE CONNECTION CARD ────────────────────────────────────────────────
  if (type === 'active') {
    return (
      <Card className="rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-50 dark:border-slate-800 relative flex flex-col items-center p-6 pt-8 transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
        
        {/* Options Menu */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-2 border-none shadow-2xl">
              <DropdownMenuItem className="p-3 font-medium rounded-lg cursor-pointer" onClick={() => onViewProfile?.(item, details)}>
                <Info className="mr-3 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 font-medium rounded-lg text-red-500 focus:bg-red-50 cursor-pointer" onClick={() => !isLoading && onRevoke?.(item.id)} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <X className="mr-3 h-4 w-4" />} Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar Area */}
        <div className="relative mb-4 mt-2 cursor-pointer group" onClick={() => onViewProfile?.(item, details)}>
          {/* Avatar Ring */}
          <div className={cn("absolute -inset-[6px] rounded-full border-[1.5px] border-slate-200/50 dark:border-slate-700 transition-colors group-hover:border-slate-300", cfg.border)}></div>
          
          <Avatar className="h-16 w-16 rounded-full border border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage src={details.image} alt={details.name} className="object-cover" />
            <AvatarFallback className={cn("rounded-full text-white font-bold text-xl", cfg.avatar)}>
              {details.name?.charAt(0).toUpperCase() || <User size={20} />}
            </AvatarFallback>
          </Avatar>

          {/* Status Dot */}
          <div className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900", cfg.avatar)}></div>
        </div>

        {/* Name and Email */}
        <div className="text-center mb-6 cursor-pointer" onClick={() => onViewProfile?.(item, details)}>
          <h3 className="font-bold text-[#1e293b] dark:text-white text-[15px] mb-1 truncate max-w-[200px] tracking-tight">
            {details.name}
          </h3>
          <p className="text-[11px] text-[#94a3b8] font-medium truncate max-w-[200px]">
            {details.email}
          </p>
        </div>

        {/* Animated Connection Row */}
        <div className="w-full flex items-center justify-between gap-3 mb-6 px-1 relative">
           {/* Left Icon (Source) */}
           <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 z-10">
             <User size={12} className="text-slate-400" />
           </div>
           
           {/* Connecting Line with Animated Dots */}
           <div className="flex-1 h-6 relative flex items-center justify-center overflow-hidden">
             {/* Static dotted track */}
             <div className="absolute w-full border-t-[3px] border-dotted border-slate-200 dark:border-slate-700 opacity-70"></div>
             
             {/* Inline animation styles */}
             <style dangerouslySetInnerHTML={{__html: `
               @keyframes travel-pulse {
                 0% { left: 0%; opacity: 0; transform: scale(0.5); }
                 15% { opacity: 1; transform: scale(1); }
                 85% { opacity: 1; transform: scale(1); }
                 100% { left: 100%; opacity: 0; transform: scale(0.5); }
               }
               .animate-travel-pulse {
                 position: absolute;
                 animation: travel-pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
               }
             `}} />
             
             {/* The moving, glowing connection dot */}
             <div className={cn("animate-travel-pulse h-[6px] w-[6px] rounded-full", cfg.progressBar)}></div>

             {/* Center Desktop Icon */}
             <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center z-10 border border-slate-100 dark:border-slate-800 shadow-sm">
               <Monitor size={10} className="text-slate-400" />
             </div>
           </div>

           {/* Right Icon (Destination/Role) */}
           <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 z-10">
             <Link2 size={12} className={cn(cfg.code.split(' ')[0])} />
           </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-4"></div>

        {/* Bottom Role */}
        <div className="text-center w-full pb-1">
          <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">
            {cfg.label}
          </span>
        </div>

      </Card>
    );
  }

  // ── PENDING REQUEST CARD ──────────────────────────────────────────────────
  return (
    <Card className="rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-50 dark:border-slate-800 relative flex flex-col items-center p-6 pt-8 transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
      
      {/* Status Badge */}
      <div className="absolute top-4 left-4">
        <span className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[8px] font-bold tracking-widest text-[#94a3b8] uppercase">
          {isOutgoing ? 'Sent' : 'Incoming'}
        </span>
      </div>

      {/* Avatar Area */}
      <div className="relative mb-4 mt-2 cursor-pointer group" onClick={() => onViewProfile?.(item, details)}>
        {/* Avatar Ring */}
        <div className={cn(
          "absolute -inset-[6px] rounded-full border-[1.5px] border-dashed border-slate-200 dark:border-slate-700 transition-colors", 
          !isOutgoing && cfg.border
        )}></div>
        
        <Avatar className="h-16 w-16 rounded-full border border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105 opacity-90">
          <AvatarImage src={details.image} alt={details.name} className="object-cover" />
          <AvatarFallback className={cn("rounded-full text-white font-bold text-xl", isOutgoing ? "bg-slate-300 dark:bg-slate-700" : cfg.avatar)}>
            {details.name?.charAt(0).toUpperCase() || <User size={20} />}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name and Email */}
      <div className="text-center mb-6 cursor-pointer" onClick={() => onViewProfile?.(item, details)}>
        <h3 className="font-bold text-[#1e293b] dark:text-white text-[15px] mb-1 truncate max-w-[200px] tracking-tight">
          {details.name}
        </h3>
        <p className="text-[11px] text-[#94a3b8] font-medium truncate max-w-[200px]">
          {details.email}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex gap-2 mb-6 px-1">
      {!isOutgoing ? (
        <>
          <button
            onClick={() => onRespond?.(item.id, 'ACCEPT')}
            disabled={isLoading}
            className={cn(
              "flex-1 h-9 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-white disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-1",
              cfg.acceptBtn
            )}
          >
            {isLoading ? <Loader2 className="animate-spin" size={12} /> : "Accept"}
          </button>
          <Button
            onClick={() => onRespond?.(item.id, 'REJECT')}
            disabled={isLoading}
            variant="outline"
            className="flex-1 h-9 rounded-full border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors px-0"
          >
            Decline
          </Button>
        </>
      ) : (
        <Button
          onClick={() => onCancel?.(item.id)}
          disabled={isLoading}
          variant="outline"
          className="w-full h-9 rounded-full border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-widest hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
        >
          {isLoading ? <Loader2 className="animate-spin mr-2" size={12} /> : "Cancel Request"}
        </Button>
      )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-4"></div>

      {/* Bottom Role */}
      <div className="text-center w-full pb-1">
        <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">
          {cfg.label}
        </span>
      </div>

    </Card>
  );
}
