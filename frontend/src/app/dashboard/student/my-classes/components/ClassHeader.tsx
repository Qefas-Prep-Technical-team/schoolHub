'use client';

import { Search, LayoutGrid, List, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

interface ClassHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalClasses?: number;
  viewMode?: 'grid' | 'table';
  setViewMode?: (mode: 'grid' | 'table') => void;
}

export function ClassHeader({ 
  searchQuery, 
  setSearchQuery, 
  totalClasses = 0,
  viewMode = 'grid',
  setViewMode
}: ClassHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Enrolled Classes
        </h2>
        <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
          {totalClasses} {totalClasses === 1 ? 'Class' : 'Classes'}
        </span>
        <HeaderTooltip content="Directory of class streams and subject curricula you are officially enrolled in. Tap any class to explore assessments, schedules, materials, and learning discussions." />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Search input */}
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes or subjects..."
            className="pl-10 pr-9 h-10 sm:h-11 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs sm:text-sm shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        {setViewMode && (
          <div className="flex items-center p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              type="button"
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              type="button"
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <List size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
