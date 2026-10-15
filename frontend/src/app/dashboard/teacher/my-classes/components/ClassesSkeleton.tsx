import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { ViewType } from './ViewToggle';

interface ClassesSkeletonProps {
  viewType?: ViewType;
}

export const ClassesSkeleton: React.FC<ClassesSkeletonProps> = ({ viewType = 'Grid View' }) => {
  if (viewType === 'List View') {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-emerald-800/50 bg-white/50 dark:bg-emerald-950/50 backdrop-blur-sm">
            <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3 sm:w-1/4" />
              <div className="flex gap-2 sm:gap-4">
                <Skeleton className="h-4 w-16 sm:w-20" />
                <Skeleton className="h-4 w-20 sm:w-24" />
                <Skeleton className="h-4 w-12 sm:w-16" />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-slate-100 dark:border-emerald-800/50 bg-white/50 dark:bg-emerald-950/50 backdrop-blur-sm p-2">
          {/* Header Image Skeleton */}
          <Skeleton className="w-full h-32 sm:h-40 rounded-lg sm:rounded-xl" />
          
          {/* Content Skeleton */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-emerald-800/50">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12 mx-auto" />
                <Skeleton className="h-5 w-16 mx-auto" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-12 mx-auto" />
                <Skeleton className="h-5 w-16 mx-auto" />
              </div>
            </div>
            
            <div className="flex justify-between pt-2">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

