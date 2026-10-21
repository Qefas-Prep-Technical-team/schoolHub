'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: 'grid' | 'list';
  onChange: (value: 'grid' | 'list') => void;
}

export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="flex h-11 items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
          value === 'grid'
            ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        )}
        title="Grid View"
        aria-label="Grid View"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
          value === 'list'
            ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        )}
        title="List View"
        aria-label="List View"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
