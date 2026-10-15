'use client';

import React from 'react';

interface RecordsSkeletonProps {
  viewMode?: 'grid' | 'table';
}

export function RecordsSkeleton({ viewMode = 'grid' }: RecordsSkeletonProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-5 animate-pulse shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 bg-slate-200 dark:bg-zinc-900 rounded-lg" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-zinc-900 rounded-lg" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-900 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-900 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-zinc-900 rounded" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-850 flex items-center justify-between">
              <div className="h-4 w-20 bg-slate-200 dark:bg-zinc-900 rounded" />
              <div className="h-7 w-24 bg-slate-200 dark:bg-zinc-900 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800">
              <th className="px-6 py-3.5 w-12"><div className="h-3 w-4 bg-slate-200 dark:bg-zinc-900 rounded" /></th>
              <th className="px-4 py-3.5"><div className="h-3 w-24 bg-slate-200 dark:bg-zinc-900 rounded" /></th>
              <th className="px-4 py-3.5"><div className="h-3 w-16 bg-slate-200 dark:bg-zinc-900 rounded" /></th>
              <th className="px-4 py-3.5"><div className="h-3 w-28 bg-slate-200 dark:bg-zinc-900 rounded" /></th>
              <th className="px-4 py-3.5"><div className="h-3 w-20 bg-slate-200 dark:bg-zinc-900 rounded" /></th>
              <th className="px-4 py-3.5"><div className="h-3 w-16 bg-slate-200 dark:bg-zinc-900 rounded" /></th>
              <th className="px-6 py-3.5 text-right"><div className="h-3 w-12 bg-slate-200 dark:bg-zinc-900 rounded ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-900 rounded w-4" /></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-900 rounded w-28" /></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-900 rounded w-20" /></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-900 rounded w-32" /></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-900 rounded w-20" /></td>
                <td className="px-4 py-4"><div className="h-6 bg-slate-200 dark:bg-zinc-900 rounded-lg w-16" /></td>
                <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 dark:bg-zinc-900 rounded-xl w-20 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
