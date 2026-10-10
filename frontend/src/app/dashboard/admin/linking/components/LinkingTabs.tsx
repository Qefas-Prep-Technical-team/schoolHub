import React from 'react';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

interface LinkingTabsProps {
  mainTab: 'network' | 'classroom';
  setMainTab: (tab: 'network' | 'classroom') => void;
  subTab: 'active' | 'pending' | 'history';
  setSubTab: (tab: 'active' | 'pending' | 'history') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  networkPendingCount: number;
  classroomPendingCount: number;
}

export function LinkingTabs({
  mainTab,
  setMainTab,
  subTab,
  setSubTab,
  searchQuery,
  setSearchQuery,
  networkPendingCount,
  classroomPendingCount
}: LinkingTabsProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
        {/* Main Categories */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-full w-full sm:w-auto border border-slate-200 dark:border-slate-700 shadow-inner">
          <button
            onClick={() => setMainTab('network')}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex-1 sm:flex-none",
              mainTab === 'network' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            Network
          </button>
          <button
            onClick={() => setMainTab('classroom')}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex-1 sm:flex-none",
              mainTab === 'classroom' ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            Classroom
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-full w-full sm:w-auto border border-slate-200 dark:border-slate-700 shadow-inner">
          <button
            onClick={() => setSubTab('active')}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex-1 sm:flex-none",
              subTab === 'active' 
                ? (mainTab === 'classroom' 
                    ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" 
                    : "bg-white dark:bg-slate-700 shadow-sm text-primary") 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            Connected
          </button>
          <button
            onClick={() => setSubTab('pending')}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex-1 sm:flex-none relative flex items-center justify-center",
              subTab === 'pending' 
                ? (mainTab === 'classroom' 
                    ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" 
                    : "bg-white dark:bg-slate-700 shadow-sm text-primary") 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            Pending
            {(mainTab === 'network' ? networkPendingCount : classroomPendingCount) > 0 && (
              <span className={cn(
                "ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none", 
                subTab === 'pending' 
                  ? (mainTab === 'classroom' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" : "bg-indigo-100 text-primary dark:bg-indigo-900/50 dark:text-indigo-300")
                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              )}>
                {mainTab === 'network' ? networkPendingCount : classroomPendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex-1 sm:flex-none",
              subTab === 'history' 
                ? (mainTab === 'classroom' 
                    ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" 
                    : "bg-white dark:bg-slate-700 shadow-sm text-primary") 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            History
          </button>
        </div>
      </div>

      <div className="relative group w-full lg:max-w-sm lg:w-72">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder={`Search ${mainTab}...`}
          className="pl-12 h-12 w-full rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm font-medium focus:ring-primary/20 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}

