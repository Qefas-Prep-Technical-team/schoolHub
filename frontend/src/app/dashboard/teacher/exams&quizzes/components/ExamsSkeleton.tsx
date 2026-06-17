import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const ExamsTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Row Skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-8 px-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          <Skeleton className="h-10 w-10 md:w-32 rounded-xl" />
        </div>
      ))}
    </div>
  );
};

