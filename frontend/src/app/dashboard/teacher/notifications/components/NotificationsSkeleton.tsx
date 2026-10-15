'use client';

import React from 'react';

export function NotificationFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-5 animate-pulse shadow-sm h-[110px] sm:h-[120px] flex gap-3.5 sm:gap-5 items-start"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-200 dark:bg-zinc-900 shrink-0" />
          <div className="flex-1 space-y-2.5 mt-0.5">
            <div className="flex justify-between items-center">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-zinc-900 rounded" />
              <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-900 rounded" />
            </div>
            <div className="h-3.5 w-3/4 bg-slate-200 dark:bg-zinc-900 rounded" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-900 rounded" />
              <div className="h-5 w-5 bg-slate-200 dark:bg-zinc-900 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationStatsSkeleton() {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-6 shadow-sm min-h-[380px] animate-pulse flex flex-col justify-between">
      <div className="flex flex-col items-center mb-6 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-zinc-900" />
        <div className="h-8 w-16 bg-slate-200 dark:bg-zinc-900 rounded-lg" />
        <div className="h-3 w-28 bg-slate-200 dark:bg-zinc-900 rounded" />
      </div>

      <div className="space-y-3.5 flex-1">
        <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-zinc-900" />
        <div className="pt-3 space-y-3">
          <div className="h-2.5 w-24 bg-slate-200 dark:bg-zinc-900 rounded mb-3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex gap-2.5 items-center">
                <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-zinc-900" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-900 rounded" />
              </div>
              <div className="h-3.5 w-6 bg-slate-200 dark:bg-zinc-900 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
