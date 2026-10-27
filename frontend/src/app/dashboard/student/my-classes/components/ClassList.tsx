'use client';

import React from 'react';
import { Search, BookOpen } from 'lucide-react';
import { ClassItem, ClassTable } from './ClassTable';
import { ClassCard } from './ClassCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ClassListProps {
  isLoading: boolean;
  filteredClasses: ClassItem[];
  viewMode?: 'grid' | 'table';
  onClearSearch?: () => void;
  onOpenJoinModal?: () => void;
}

export function ClassList({ 
  isLoading, 
  filteredClasses, 
  viewMode = 'grid',
  onClearSearch,
  onOpenJoinModal
}: ClassListProps) {
  if (isLoading) {
    if (viewMode === 'table') {
      return <ClassTable isLoading={true} filteredClasses={[]} />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-950/80 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredClasses.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20 p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-pink-50 dark:bg-pink-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 text-pink-600 dark:text-pink-400">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          No classes match your search
        </h3>
        <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-sm mx-auto mt-1.5 text-xs sm:text-sm">
          We could not find any enrolled classes or curriculum subjects matching the entered search query.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              Clear Search
            </button>
          )}
          {onOpenJoinModal && (
            <button
              onClick={onOpenJoinModal}
              className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              Join a Class
            </button>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'table') {
    return <ClassTable isLoading={false} filteredClasses={filteredClasses} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredClasses.map((cls) => (
        <ClassCard key={cls.id} cls={cls} />
      ))}
    </div>
  );
}
