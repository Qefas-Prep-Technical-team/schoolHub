/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { 
  Link2, 
  UserPlus, 
  MoreVertical, 
  Info, 
  X, 
  Copy, 
  Clock, 
  Hash, 
  ChevronRight 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getMemberDetails, isClassLink } from './LinkingUtils';

interface ConnectionCardProps {
  item: any;
  type: 'active' | 'pending';
  currentUserId?: string;
  onRevoke?: (id: string) => void;
  onRespond?: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onCancel?: (id: string) => void;
  onCopy?: (text: string) => void;
}

export function ConnectionCard({
  item,
  type,
  currentUserId,
  onRevoke,
  onRespond,
  onCancel,
  onCopy
}: ConnectionCardProps) {
  const details = getMemberDetails(item, currentUserId);
  const isClass = isClassLink(item.linkType);
  const isOutgoing = type === 'pending' && item.requesterId === currentUserId;

  if (type === 'active') {
    return (
      <Card className={cn(
        "rounded-[2rem] overflow-hidden border-none bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all group relative border-l-4",
        isClass ? "border-l-purple-500 shadow-purple-100/50" : "border-l-blue-500 shadow-blue-100/50"
      )}>
        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all text-white group-hover:scale-110",
              isClass ? "bg-purple-500 shadow-purple-200" : "bg-blue-500 shadow-blue-200"
            )}>
              {isClass ? <Link2 size={24} /> : <UserPlus size={24} />}
            </div>
            <div>
              <CardTitle className="text-xl font-black truncate max-w-[180px] text-slate-900 dark:text-white">{details.name}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {item?.linkType?.replace('_', ' ')}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-2 border-none shadow-2xl">
              <DropdownMenuItem className="p-3 font-semibold rounded-lg focus:bg-slate-100 dark:focus:bg-slate-800">
                <Info className="mr-3 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="p-3 font-semibold rounded-lg text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer" 
                onClick={() => onRevoke?.(item.id)}
              >
                <X className="mr-3 h-4 w-4" /> Disconnect
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
          </div>
          
          <div className={cn(
            "flex items-center justify-between p-4 rounded-xl border group/code h-14",
            isClass ? "bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800/50" : "bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/50"
          )}>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Entity Code</span>
              <span className={cn("font-black tracking-widest text-sm", isClass ? "text-purple-600" : "text-blue-600")}>{details.code}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-800"
              onClick={() => onCopy?.(details.code)}
            >
              <Copy size={14} className="text-slate-400" />
            </Button>
          </div>

          <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all group/btn">
            <span>View Full Profile</span>
            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Pending Request Card
  return (
    <Card className={cn(
      "rounded-[2rem] overflow-hidden border-none bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-2xl relative group",
      isClass ? "shadow-purple-100/50" : "shadow-orange-100/50"
    )}>
      <div className={cn(
        "h-1.5 w-full absolute top-0 z-20", 
        isOutgoing ? "bg-slate-300 shadow-sm" : (isClass ? "bg-purple-500 shadow-purple-500/20" : "bg-orange-500 shadow-orange-500/20")
      )} />

      <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
        <Badge className={cn(
          "border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest rounded-lg",
          isClass ? "bg-purple-600 text-white" : "bg-orange-600 text-white"
        )}>
           {details.className || item.linkType.replace('_', ' ')}
        </Badge>
        <span className="px-2 py-1 rounded-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[8px] font-black tracking-widest border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500">
          {isOutgoing ? 'SENT' : 'INCOMING'}
        </span>
      </div>

      <CardHeader className="p-6 pb-2 mt-2">
        <div className="flex items-center gap-3 mb-5">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
            isClass ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20" : "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
          )}>
            <Clock size={24} />
          </div>
          <span className="text-[11px] text-slate-400 font-black tracking-wider uppercase">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>

        <CardTitle className="text-xl font-black truncate pr-20 text-slate-900 dark:text-white leading-tight">{details.name}</CardTitle>
        <CardDescription className="text-xs font-bold text-slate-400 truncate mt-1">
          {details.email} {details.className ? `• ${details.className}` : ''}
        </CardDescription>

        {item.note && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group/note">
             <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50 transition-opacity group-hover/note:opacity-100", isClass ? "bg-purple-300" : "bg-orange-300")} />
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
            <Button
              onClick={() => onRespond?.(item.id, 'ACCEPT')}
              className={cn(
                "flex-[3] h-12 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95",
                isClass ? "bg-purple-600 shadow-purple-200" : "bg-orange-500 shadow-orange-100"
              )}
            >
              Accept Request
            </Button>
            <Button
              onClick={() => onRespond?.(item.id, 'REJECT')}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-slate-100 text-red-500 font-extrabold text-[10px] uppercase tracking-widest hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-950/20 px-0 transition-colors"
            >
              Decline
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => onCancel?.(item.id)}
            variant="outline"
            className="w-full h-12 rounded-xl border-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-red-600 hover:border-red-100 dark:border-slate-800 dark:hover:bg-slate-900 transition-all shadow-sm"
          >
            Cancel My Request
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
