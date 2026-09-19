import React from 'react';
import { MoreVertical, X, Loader2, User, Monitor, Link2, Info } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils/clipboard';

interface StudentActiveLinksGridProps {
  links: any[];
  onRevoke: (id: string) => void;
  revokingId?: string | null;
  mainTab: 'network' | 'classroom';
}

export function StudentActiveLinksGrid({ links, onRevoke, revokingId, mainTab }: StudentActiveLinksGridProps) {
  if (links.length === 0) {
    return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
          <Link2 size={32} className="text-slate-400" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">No active {mainTab} connections found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {links.map((link) => {
        const isClass = link.variant === 'classroom';
        const isRevoking = revokingId === link.id;

        const borderClass = isClass ? "border-purple-500" : "border-pink-500";
        const avatarClass = isClass ? "bg-purple-500" : "bg-pink-500";
        const textClass = isClass ? "text-purple-600" : "text-pink-600";
        const bgClass = isClass ? "bg-purple-50" : "bg-pink-50";

        return (
          <Card key={link.id} className="rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-50 dark:border-slate-800 relative flex flex-col items-center p-6 pt-8 transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
            
            {/* Options Menu */}
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl p-2 border-none shadow-2xl">
                  <DropdownMenuItem 
                    className="p-3 font-medium rounded-lg cursor-pointer" 
                    onClick={() => {
                      const code = link.leftEntityId === link.userId ? link.rightCode : link.leftCode;
                      copyToClipboard(code, "Entity code");
                    }}
                  >
                    <Info className="mr-3 h-4 w-4" /> Copy Code
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="p-3 font-medium rounded-lg text-red-500 focus:bg-red-50 cursor-pointer" 
                    onClick={() => !isRevoking && onRevoke(link.id)} 
                    disabled={isRevoking}
                  >
                    {isRevoking ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <X className="mr-3 h-4 w-4" />} Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Avatar Area */}
            <div className="relative mb-4 mt-2 cursor-pointer group">
              {/* Avatar Ring */}
              <div className={cn("absolute -inset-[6px] rounded-full border-[1.5px] border-slate-200/50 dark:border-slate-700 transition-colors group-hover:border-slate-300", borderClass)}></div>
              
              <Avatar className="h-16 w-16 rounded-full border border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={link.peerImage} alt={link.peerName} className="object-cover" />
                <AvatarFallback className={cn("rounded-full text-white font-bold text-xl", avatarClass)}>
                  {link.peerName?.charAt(0).toUpperCase() || <User size={20} />}
                </AvatarFallback>
              </Avatar>

              {/* Status Dot */}
              <div className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900", avatarClass)}></div>
            </div>

            {/* Name and Email */}
            <div className="text-center mb-6 cursor-pointer">
              <h3 className="font-bold text-[#1e293b] dark:text-white text-[15px] mb-1 truncate max-w-[200px] tracking-tight">
                {link.peerName}
              </h3>
              <p className="text-[11px] text-[#94a3b8] font-medium truncate max-w-[200px]">
                {link.peerEmail}
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
                   @keyframes travel-pulse-student {
                     0% { left: 0%; opacity: 0; transform: scale(0.5); }
                     15% { opacity: 1; transform: scale(1); }
                     85% { opacity: 1; transform: scale(1); }
                     100% { left: 100%; opacity: 0; transform: scale(0.5); }
                   }
                   .animate-travel-pulse-student {
                     position: absolute;
                     animation: travel-pulse-student 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
                   }
                 `}} />
                 
                 {/* The moving, glowing connection dot */}
                 <div className={cn("animate-travel-pulse-student h-[6px] w-[6px] rounded-full", avatarClass)}></div>

                 {/* Center Desktop Icon */}
                 <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center z-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                   <Monitor size={10} className="text-slate-400" />
                 </div>
               </div>

               {/* Right Icon (Destination/Role) */}
               <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 z-10">
                 <Link2 size={12} className={textClass} />
               </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-4"></div>

            {/* Bottom Role */}
            <div className="text-center w-full pb-1">
              <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">
                {link.roleDisplay || link.type?.replace('_', ' ')}
              </span>
            </div>

          </Card>
        );
      })}
    </div>
  );
}
