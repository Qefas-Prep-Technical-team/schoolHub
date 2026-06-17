import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const ClassesSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-2">
          {/* Header Image Skeleton */}
          <Skeleton className="w-full h-48 rounded-[1.8rem]" />
          
          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
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

