'use client';

import React from 'react';
import { MoreVertical, X, Loader2, User, Monitor, Link2, Info, Copy, GraduationCap } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils/clipboard';

export interface ActiveLinkEntity {
  id: string;
  peerName: string;
  peerEmail: string;
  peerCode?: string;
  roleDisplay?: string;
  peerImage?: string;
  variant: 'network' | 'classroom';
  leftEntityId?: string;
  rightCode?: string;
  leftCode?: string;
  userId?: string;
  linkType: string;
  isGraduated?: boolean;
}

interface StudentActiveLinksGridProps {
  links: ActiveLinkEntity[];
  onRevoke: (id: string) => void;
  revokingId?: string | null;
  mainTab: 'network' | 'classroom';
}

export function StudentActiveLinksGrid({ links, onRevoke, revokingId, mainTab }: StudentActiveLinksGridProps) {
  if (links.length === 0) {
    return (
      <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-8">
        <div className="p-3.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl text-zinc-400">
          <Link2 size={28} />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          No active {mainTab} connections found.
        </p>
        <p className="text-xs text-zinc-400 max-w-sm">
          Connect with your classmates or school teachers using the &quot;New Connection&quot; button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {links.map((link) => {
        const isClass = link.variant === 'classroom';
        const isRevoking = revokingId === link.id;

        const borderClass = link.isGraduated
          ? "border-amber-400 dark:border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          : (isClass ? "border-purple-500" : "border-pink-500");
        const avatarBg = link.isGraduated
          ? "bg-amber-600"
          : (isClass ? "bg-purple-600" : "bg-pink-600");
        const textClass = link.isGraduated
          ? "text-amber-600 dark:text-amber-400"
          : (isClass ? "text-purple-600 dark:text-purple-400" : "text-pink-600 dark:text-pink-400");

        return (
          <Card 
            key={link.id} 
            className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md relative flex flex-col items-center p-5 pt-6 transition-all duration-200"
          >
            {/* Graduated Alumni Badge */}
            {link.isGraduated && (
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[10px] font-bold tracking-wide text-amber-700 dark:text-amber-400 shadow-sm">
                  <GraduationCap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Graduated Scholar
                </span>
              </div>
            )}

            {/* Options Dropdown Menu */}
            <div className="absolute top-3.5 right-3.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl p-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl">
                  {link.peerCode && (
                    <DropdownMenuItem 
                      className="p-2.5 font-medium rounded-lg cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900" 
                      onClick={() => copyToClipboard(link.peerCode || "", "Entity code")}
                    >
                      <Copy className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Copy Code
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="p-2.5 font-medium rounded-lg text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer text-xs" 
                    onClick={() => !isRevoking && onRevoke(link.id)} 
                    disabled={isRevoking}
                  >
                    {isRevoking ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <X className="mr-2 h-3.5 w-3.5" />} 
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Avatar Profile Area */}
            <div className="relative mb-3 mt-1 cursor-pointer group">
              <div className={cn("absolute -inset-[3px] rounded-full border-2", borderClass)} />
              
              <Avatar className="h-16 w-16 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm transition-transform group-hover:scale-105">
                {link.peerImage && <AvatarImage src={link.peerImage} alt={link.peerName} className="object-cover" />}
                <AvatarFallback className={cn("rounded-full text-white font-bold text-lg", avatarBg)}>
                  {link.peerName?.charAt(0).toUpperCase() || <User size={20} />}
                </AvatarFallback>
              </Avatar>

              {/* Status Dot */}
              <div className={cn(
                "absolute -top-0.5 -right-0.5 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center",
                link.isGraduated ? "w-4 h-4 bg-amber-500 text-white" : cn("w-3 h-3", avatarBg)
              )}>
                {link.isGraduated && <GraduationCap size={9} className="stroke-[2.5]" />}
              </div>
            </div>

            {/* Name and Contact */}
            <div className="text-center mb-4 w-full px-2">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-0.5 truncate tracking-tight" title={link.peerName}>
                {link.peerName}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium truncate" title={link.peerEmail}>
                {link.peerEmail}
              </p>
            </div>

            {/* Animated Connection Row */}
            <div className="w-full flex items-center justify-between gap-2 mb-4 px-1 relative">
               <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center shrink-0 z-10 text-zinc-500">
                 <User size={12} />
               </div>
               
               <div className="flex-1 h-6 relative flex items-center justify-center overflow-hidden">
                 <div className="absolute w-full border-t border-dashed border-slate-300 dark:border-zinc-700" />
                 
                 <style dangerouslySetInnerHTML={{__html: `
                   @keyframes travel-pulse-student {
                     0% { left: 0%; opacity: 0; transform: scale(0.5); }
                     15% { opacity: 1; transform: scale(1); }
                     85% { opacity: 1; transform: scale(1); }
                     100% { left: 100%; opacity: 0; transform: scale(0.5); }
                   }
                   .animate-travel-pulse-student {
                     position: absolute;
                     animation: travel-pulse-student 2.4s infinite cubic-bezier(0.4, 0, 0.2, 1);
                   }
                 `}} />
                 
                 <div className={cn("animate-travel-pulse-student h-1.5 w-1.5 rounded-full", link.isGraduated ? "bg-amber-500" : avatarBg)} />

                 <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center z-10 border border-slate-200/80 dark:border-zinc-800 shadow-sm text-zinc-400">
                   <Monitor size={10} />
                 </div>
               </div>

               <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center shrink-0 z-10">
                 <Link2 size={12} className={textClass} />
               </div>
            </div>

            <div className="w-full h-px bg-slate-100 dark:border-zinc-800/80 dark:bg-zinc-800/80 mb-3" />

            {/* Bottom Role Badge */}
            <div className="text-center w-full">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                link.isGraduated ? "text-amber-600 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"
              )}>
                {link.isGraduated ? 'Alumni • Graduated from School' : (link.roleDisplay || link.linkType?.replace('_', ' '))}
              </span>
            </div>

          </Card>
        );
      })}
    </div>
  );
}
