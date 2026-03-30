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
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl w-full sm:w-auto border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setMainTab('network')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              mainTab === 'network' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Network
          </button>
          <button
            onClick={() => setMainTab('classroom')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              mainTab === 'classroom' ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Classroom
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-2">
          <Button 
            variant={subTab === 'active' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setSubTab('active')}
            className={cn(
              "h-9 rounded-xl text-[10px] font-black uppercase tracking-widest px-4",
              subTab === 'active' ? (mainTab === 'classroom' ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-slate-900 text-white shadow-lg") : "text-gray-400"
            )}
          >
            Connected
          </Button>
          <Button 
            variant={subTab === 'pending' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setSubTab('pending')}
            className={cn(
              "h-9 rounded-xl text-[10px] font-black uppercase tracking-widest relative px-4",
              subTab === 'pending' ? (mainTab === 'classroom' ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-orange-500 text-white shadow-lg shadow-orange-200") : "text-gray-400"
            )}
          >
            Pending
            {(mainTab === 'network' ? networkPendingCount : classroomPendingCount) > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white text-orange-600 text-[8px] font-black">
                {mainTab === 'network' ? networkPendingCount : classroomPendingCount}
              </span>
            )}
          </Button>
          <Button 
            variant={subTab === 'history' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setSubTab('history')}
            className={cn(
              "h-9 rounded-xl text-[10px] font-black uppercase tracking-widest px-4",
              subTab === 'history' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-400"
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
          className="pl-12 h-12 rounded-2xl border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm font-medium focus:ring-primary/20 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
