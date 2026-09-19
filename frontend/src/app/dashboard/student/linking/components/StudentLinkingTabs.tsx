import React from 'react';
import { Search } from 'lucide-react';
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
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
        {/* Main Categories */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setMainTab('network')}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              mainTab === 'network' ? "bg-white dark:bg-slate-700 shadow-sm text-pink-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Network
          </button>
          <button
            onClick={() => setMainTab('classroom')}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              mainTab === 'classroom' ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Classroom
          </button>
        </div>

        {/* Sub Tabs (Active/Pending) */}
        <div className="flex gap-2">
          <Button
            variant={subTab === 'active' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSubTab('active')}
            className={cn(
              "h-8 rounded-lg text-[10px] font-black uppercase tracking-widest",
              subTab === 'active' ? (mainTab === 'classroom' ? "bg-purple-600 text-white" : "bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white") : "text-slate-400"
            )}
          >
            Connected
          </Button>
          <Button
            variant={subTab === 'pending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSubTab('pending')}
            className={cn(
              "h-8 rounded-lg text-[10px] font-black uppercase tracking-widest relative px-3",
              subTab === 'pending' ? (mainTab === 'classroom' ? "bg-purple-600 text-white" : "bg-orange-500 text-white") : "text-slate-400"
            )}
          >
            Pending
            {(mainTab === 'network' ? networkPendingCount : classroomPendingCount) > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-white text-orange-600 text-[8px] font-black">
                {mainTab === 'network' ? networkPendingCount : classroomPendingCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="relative w-full lg:w-72">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <Input
          placeholder={`Search ${mainTab}...`}
          className="pl-11 h-11 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-pink-500/20 text-xs font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
