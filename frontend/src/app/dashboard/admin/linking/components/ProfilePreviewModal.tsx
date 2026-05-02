/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { 
  X, 
  Mail, 
  Hash, 
  Calendar, 
  MapPin, 
  User, 
  Shield, 
  GraduationCap, 
  Users,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: any;
  item: any;
}

export function ProfilePreviewModal({
  isOpen,
  onClose,
  details,
  item
}: ProfilePreviewModalProps) {
  if (!details) return null;

  const isClass = item?.linkType?.includes('CLASS');
  const role = item?.linkType?.split('_')[0] || 'Member';
  
  // Create initials for avatar fallback
  const initials = details.name
    ? details.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-gray-900 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>User Profile Preview</DialogTitle>
        </DialogHeader>

        {/* Hero Banner Section */}
        <div className="relative h-40 w-full overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br transition-all duration-500",
            isClass ? "from-purple-600 to-primary" : "from-blue-600 to-cyan-700"
          )} />
          
          {/* Animated Patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Profile Info Section */}
        <div className="relative px-8 pb-10 -mt-16">
          <div className="flex flex-col items-center text-center">
            {/* Large Avatar */}
            <div className="relative group">
              <div className={cn(
                "absolute -inset-1.5 rounded-[2.5rem] blur-xl opacity-40 transition-all duration-500 group-hover:opacity-70 group-hover:blur-2xl",
                isClass ? "bg-purple-500" : "bg-blue-500"
              )} />
              <div className="relative p-1.5 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl">
                <Avatar className="h-32 w-32 rounded-[2.2rem] border-4 border-white dark:border-gray-800 shadow-inner">
                  <AvatarImage src={details.image} alt={details.name} className="object-cover" />
                  <AvatarFallback className={cn(
                    "rounded-[2.2rem] text-4xl font-black text-white",
                    isClass ? "bg-purple-500" : "bg-blue-500"
                  )}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Role Badge Overlapping Avatar */}
              <div className="absolute -bottom-2 translate-x-1/2 right-1/2">
                <Badge className={cn(
                  "px-4 py-1.5 rounded-full border-2 border-white dark:border-gray-900 font-black text-[9px] uppercase tracking-widest shadow-lg",
                  isClass ? "bg-purple-600 text-white" : "bg-blue-600 text-white"
                )}>
                  {role}
                </Badge>
              </div>
            </div>

            <div className="mt-8 space-y-1.5">
              <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                {details.name}
              </h2>
              <p className="text-base font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <Mail size={16} className="text-slate-400" />
                {details.email}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 w-full mt-8">
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identifier</span>
                <span className="font-black text-sm text-slate-900 dark:text-white">{details.code}</span>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Connected</span>
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Details List */}
            <div className="w-full mt-8 space-y-4 text-left">
               <div className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    isClass ? "bg-purple-50 text-purple-600 dark:bg-purple-950/30" : "bg-blue-50 text-blue-600 dark:bg-blue-950/30"
                  )}>
                    {isClass ? <GraduationCap size={24} /> : <Shield size={24} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Entity Relationship</span>
                    <span className="font-black text-slate-900 dark:text-white tracking-tight">
                      {item.linkType.replace('_', ' ')}
                    </span>
                  </div>
               </div>

               {details.className && (
                 <div className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary dark:bg-primary/20/30 flex items-center justify-center shrink-0">
                      <Users size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assigned Class</span>
                      <span className="font-black text-slate-900 dark:text-white tracking-tight">
                        {details.className}
                      </span>
                    </div>
                 </div>
               )}
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-10 grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 group"
              >
                Full Analytics <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
              <Button 
                className={cn(
                  "h-14 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95",
                  isClass ? "bg-purple-600 shadow-purple-200/50" : "bg-blue-600 shadow-blue-200/50"
                )}
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

