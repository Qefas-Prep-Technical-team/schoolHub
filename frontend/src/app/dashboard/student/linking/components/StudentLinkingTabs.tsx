'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

interface StudentLinkingTabsProps {
  mainTab: 'network' | 'classroom';
  setMainTab: (tab: 'network' | 'classroom') => void;
  subTab: 'active' | 'pending';
  setSubTab: (tab: 'active' | 'pending') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  networkPendingCount: number;
  classroomPendingCount: number;
}

export function StudentLinkingTabs({
  mainTab,
  setMainTab,
  subTab,
  setSubTab,
  searchQuery,
  setSearchQuery,
  networkPendingCount,
  classroomPendingCount
}: StudentLinkingTabsProps) {
  const pendingCount = mainTab === 'network' ? networkPendingCount : classroomPendingCount;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        {/* Main Categories Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
          <button
            onClick={() => setMainTab('network')}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer",
              mainTab === 'network' 
                ? "bg-pink-600 text-white shadow-sm shadow-pink-500/25" 
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60"
            )}
          >
            Network Peers
          </button>
          <button
            onClick={() => setMainTab('classroom')}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer",
              mainTab === 'classroom' 
                ? "bg-purple-600 text-white shadow-sm shadow-purple-500/25" 
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60"
            )}
          >
            Classrooms
          </button>
        </div>

        {/* Sub Tabs (Connected / Pending) */}
        <div className="flex gap-2">
          <Button
            variant={subTab === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSubTab('active')}
            className={cn(
              "h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              subTab === 'active' 
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm" 
                : "bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
            )}
          >
            Connected
          </Button>
          <Button
            variant={subTab === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSubTab('pending')}
            className={cn(
              "h-9 px-3.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer",
              subTab === 'pending' 
                ? (mainTab === 'classroom' ? "bg-purple-600 text-white" : "bg-amber-600 text-white") 
                : "bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
            )}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className={cn(
                "ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] font-black",
                subTab === 'pending' ? "bg-white text-zinc-900" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              )}>
                {pendingCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full lg:w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
        <Input
          placeholder={`Search ${mainTab}...`}
          className="pl-9 pr-8 h-10 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-pink-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
