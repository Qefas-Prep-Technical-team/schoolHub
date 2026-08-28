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
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer",
              mainTab === 'network' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            Network
          </button>
          <button
            onClick={() => setMainTab('classroom')}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer",
              mainTab === 'classroom' ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            Classroom
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSubTab('active')}
            className={cn(
              "h-9 rounded-full text-[10px] font-bold uppercase tracking-widest px-4 transition-all",
              subTab === 'active' 
                ? (mainTab === 'classroom' 
                    ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700 hover:text-white focus:bg-purple-600 focus:text-white focus:ring-0" 
                    : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 hover:text-white dark:hover:text-slate-900 focus:bg-slate-900 dark:focus:bg-slate-100 focus:text-white dark:focus:text-slate-900 focus:ring-0") 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800/50"
            )}
          >
            Connected
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSubTab('pending')}
            className={cn(
              "h-9 rounded-full text-[10px] font-bold uppercase tracking-widest relative px-4 transition-all",
              subTab === 'pending' 
                ? (mainTab === 'classroom' 
                    ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700 hover:text-white focus:bg-purple-600 focus:text-white focus:ring-0" 
                    : "bg-primary text-white shadow-sm hover:bg-primary/90 hover:text-white focus:bg-primary focus:text-white focus:ring-0") 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800/50"
            )}
          >
            Pending
            {(mainTab === 'network' ? networkPendingCount : classroomPendingCount) > 0 && (
              <span className={cn("ml-2 px-1.5 py-0.5 rounded-full text-[8px] font-black", subTab === 'pending' ? "bg-white text-primary" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300")}>
                {mainTab === 'network' ? networkPendingCount : classroomPendingCount}
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSubTab('history')}
            className={cn(
              "h-9 rounded-full text-[10px] font-bold uppercase tracking-widest px-4 transition-all",
              subTab === 'history' 
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white focus:ring-0" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800/50"
            )}
          >
            History
          </Button>
        </div>
      </div>

      <div className="relative group max-w-sm w-full lg:w-72">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder={`Search ${mainTab}...`}
          className="pl-12 h-12 rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm font-medium focus:ring-primary/20 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}

