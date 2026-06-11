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
  User
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
      <Card className={cn(
        "rounded-[2rem] overflow-hidden border-none bg-white dark:bg-gray-800/80 shadow-lg hover:shadow-2xl transition-all group relative border-l-4",
        cfg.border,
        cfg.shadow
      )}>
        {/* Coloured top-right corner accent */}
        <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-[3rem] opacity-5 pointer-events-none", cfg.avatar)} />

        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <div
              className="relative cursor-pointer group/avatar"
              onClick={() => onViewProfile?.(item, details)}
            >
              <div className={cn(
                "absolute -inset-1 rounded-2xl blur-md opacity-0 group-hover/avatar:opacity-40 transition-opacity",
                cfg.avatarGlow
              )} />
              <Avatar className="h-14 w-14 rounded-2xl border-2 border-white dark:border-gray-700 shadow-sm transition-transform group-hover/avatar:scale-105">
                <AvatarImage src={details.image} alt={details.name} className="object-cover" />
                <AvatarFallback className={cn("rounded-2xl text-white font-black text-xl", cfg.avatar)}>
                  {details.name?.charAt(0).toUpperCase() || <User size={20} />}
                </AvatarFallback>
              </Avatar>
            </div>
            <div
              className="cursor-pointer"
              onClick={() => onViewProfile?.(item, details)}
            >
              <CardTitle className={cn(
                "text-xl font-black truncate max-w-[180px] text-slate-900 dark:text-white transition-colors",
                cfg.hover
              )}>
                {details.name}
              </CardTitle>
              {/* Human-readable link type label with coloured dot */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.avatar)} />
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {cfg.label}
                </CardDescription>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-2 border-none shadow-2xl">
              <DropdownMenuItem
                className="p-3 font-semibold rounded-lg focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer"
                onClick={() => onViewProfile?.(item, details)}
              >
                <Info className="mr-3 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="p-3 font-semibold rounded-lg text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                onClick={() => !isLoading && onRevoke?.(item.id)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <X className="mr-3 h-4 w-4" />} Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight">Identifier</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">{details.email}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight">Linked Date</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            {/* Added school or class details if they exist */}
            {details.schoolName && (
              <div className="space-y-1 col-span-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight">School</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">{details.schoolName}</span>
              </div>
            )}
            {details.className && (
              <div className="space-y-1 col-span-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight">Class</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">{details.className}</span>
              </div>
            )}
          </div>

          {/* Code box — colour-coded per type */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-xl border h-14",
            cfg.codeBox
          )}>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Entity Code</span>
              <span className={cn("font-black tracking-widest text-sm", cfg.code)}>{details.code}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-700"
              onClick={() => onCopy?.(details.code)}
            >
              <Copy size={14} className="text-slate-400" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => onViewProfile?.(item, details)}
            className="w-full justify-between h-12 rounded-xl border-slate-100 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group/btn"
          >
            <span>View Full Profile</span>
            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    );
  }


  // ── PENDING REQUEST CARD ──────────────────────────────────────────────────
  return (
    <Card className={cn(
      "rounded-[2rem] overflow-hidden border-none bg-white dark:bg-gray-800/80 shadow-lg transition-all hover:shadow-2xl relative group",
      cfg.shadow
    )}>
      {/* Coloured top bar */}
      <div className={cn(
        "h-1.5 w-full absolute top-0 z-20",
        isOutgoing ? "bg-slate-300 dark:bg-slate-600" : cfg.topBar
      )} />

      {/* Type badge + direction badge */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
        <Badge className={cn(
          "border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest rounded-lg",
          isOutgoing ? "bg-slate-400 dark:bg-slate-600 text-white" : cfg.badge
        )}>
          {cfg.label}
        </Badge>
        <span className="px-2 py-1 rounded-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[8px] font-black tracking-widest border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500">
          {isOutgoing ? 'SENT' : 'INCOMING'}
        </span>
      </div>

      <CardHeader className="p-6 pb-2 mt-2">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="relative cursor-pointer group/avatar"
            onClick={() => onViewProfile?.(item, details)}
          >
            <div className={cn(
              "absolute -inset-1 rounded-2xl blur-md opacity-0 group-hover/avatar:opacity-40 transition-opacity",
              isOutgoing ? "bg-slate-400" : cfg.avatarGlow
            )} />
            <Avatar className="h-14 w-14 rounded-2xl shadow-sm transition-transform group-hover/avatar:scale-105 border-2 border-white dark:border-gray-700">
              <AvatarImage src={details.image} alt={details.name} className="object-cover" />
              <AvatarFallback className={cn(
                "rounded-2xl font-black text-xl text-white",
                isOutgoing ? "bg-slate-400 dark:bg-slate-600" : cfg.avatar
              )}>
                {details.name?.charAt(0).toUpperCase() || <Clock size={20} />}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-black tracking-wider uppercase">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            <CardTitle
              className={cn(
                "text-xl font-black truncate max-w-[150px] text-slate-900 dark:text-white leading-tight cursor-pointer transition-colors",
                cfg.hover
              )}
              onClick={() => onViewProfile?.(item, details)}
            >
              {details.name}
            </CardTitle>
          </div>
        </div>

        <CardDescription className="text-xs font-bold text-slate-400 truncate mt-1">
          {details.email} {details.className ? `• ${details.className}` : ''}
        </CardDescription>

        {item.note && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group/note">
            <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50 transition-opacity group-hover/note:opacity-100", cfg.noteBar)} />
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 italic line-clamp-2 leading-relaxed">"{item.note}"</p>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-900 text-[9px] font-black tracking-widest text-slate-500 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-lg">
            CODE: {isOutgoing ? item.targetCode : item.requesterCode}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-6 gap-3">
        {!isOutgoing ? (
          <div className="flex gap-2">
            <button
              onClick={() => onRespond?.(item.id, 'ACCEPT')}
              disabled={isLoading}
              className={cn(
                "flex-[3] h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-2",
                cfg.acceptBtn
              )}
            >
              {isLoading ? <Loader2 className="animate-spin" size={14} /> : null}
              {isLoading ? "Processing..." : "Accept Request"}
            </button>
            <Button
              onClick={() => onRespond?.(item.id, 'REJECT')}
              disabled={isLoading}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-slate-100 text-red-500 font-extrabold text-[10px] uppercase tracking-widest hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-950/20 px-0 transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin" size={14} /> : "Decline"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => onCancel?.(item.id)}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 rounded-xl border-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-red-600 hover:border-red-100 dark:border-slate-700 dark:hover:bg-slate-900 transition-all shadow-sm"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
            {isLoading ? "Cancelling..." : "Cancel My Request"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
