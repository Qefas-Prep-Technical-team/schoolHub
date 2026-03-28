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
      <Card className="rounded-[2rem] overflow-hidden border-none bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all group relative">
        <div className={cn(
          "absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2",
          isClass ? "bg-purple-500" : "bg-primary"
        )} />
        
        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-all text-white",
              isClass ? "bg-purple-500 shadow-purple-200" : "bg-primary shadow-primary/20"
            )}>
              {isClass ? <Link2 size={24} /> : <UserPlus size={24} />}
            </div>
            <div>
              <CardTitle className="text-lg font-black truncate max-w-[150px]">{details.name}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {item?.linkType?.replace('_', ' ')}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full ring-offset-background transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-2 border-none shadow-2xl">
              <DropdownMenuItem className="p-3 font-semibold rounded-lg focus:bg-gray-100 dark:focus:bg-gray-700">
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
              <span className="text-[10px] font-black uppercase text-gray-400 block tracking-tight">Identifier</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white truncate block">{details.email}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-gray-400 block tracking-tight">Linked Date</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white block">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700/50 group/code h-14">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider mb-0.5">Entity Code</span>
              <span className={cn("font-black tracking-widest text-sm", isClass ? "text-purple-600" : "text-primary")}>{details.code}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg transition-all hover:bg-white dark:hover:bg-gray-800"
              onClick={() => onCopy?.(details.code)}
            >
              <Copy size={14} className="text-gray-400" />
            </Button>
          </div>

          <Button variant="outline" className="w-full justify-between h-11 rounded-xl border-gray-100 dark:border-gray-700 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all">
            <span>View Profile</span>
            <ChevronRight size={14} />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Pending Request Card
  return (
    <Card className="rounded-[2rem] overflow-hidden border-none bg-white dark:bg-gray-800 shadow-lg shadow-orange-500/5 transition-all hover:shadow-xl relative group">
      <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1.5 z-10">
        <Badge className={cn(
          "border-none px-2 py-0.5 font-black uppercase text-[8px] tracking-widest",
          isClass ? "bg-purple-500 text-white" : "bg-orange-500 text-white"
        )}>
           {details.className || item.linkType.replace('_', ' ')}
        </Badge>
        <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-[8px] font-black tracking-widest border border-gray-100 dark:border-gray-700 shadow-sm">
          {isOutgoing ? 'OUTGOING' : 'INCOMING'}
        </span>
      </div>

      <CardHeader className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
            isClass ? "bg-purple-50 text-purple-500" : "bg-orange-50 text-orange-500"
          )}>
            <Clock size={20} />
          </div>
          <span className="text-[10px] text-gray-400 font-bold">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>

        <CardTitle className="text-lg font-black truncate pr-16">{details.name}</CardTitle>
        <CardDescription className="text-xs font-bold text-gray-400 truncate mt-0.5">
          {details.email} {details.className ? `• ${details.className}` : ''}
        </CardDescription>

        {item.note && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-100 dark:border-gray-700/50 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-300 opacity-50" />
            <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 italic line-clamp-2">"{item.note}"</p>
          </div>
        )}
        
        <div className="mt-4 flex items-center gap-2 group/code-p">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700/50 flex items-center gap-2 transition-colors group-hover/code-p:bg-white">
            <Hash size={12} className="text-gray-400" />
            <span className="text-xs font-black text-primary tracking-widest">
              {isOutgoing ? item.targetCode : item.requesterCode}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-6 space-y-3">
        <div className="flex gap-2">
          {!isOutgoing ? (
            <>
              <Button
                onClick={() => onRespond?.(item.id, 'ACCEPT')}
                className="flex-[2] h-11 rounded-xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100 hover:scale-[1.02] transition-all"
              >
                Approve Request
              </Button>
              <Button
                onClick={() => onRespond?.(item.id, 'REJECT')}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-red-100 text-red-500 font-extrabold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all px-0"
              >
                Decline
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onCancel?.(item.id)}
              variant="outline"
              className="w-full h-11 rounded-xl border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 hover:text-red-500 hover:border-red-100 transition-all"
            >
              Cancel Outgoing Request
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
