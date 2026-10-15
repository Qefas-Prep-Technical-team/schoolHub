import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const StudentSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-zinc-900 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-zinc-900" />
          <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-zinc-900" />
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-zinc-900" />
          <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-zinc-900" />
        </div>
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-zinc-900" />
          <Skeleton className="h-4 w-10 bg-slate-200 dark:bg-zinc-900" />
        </div>
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-zinc-900" />
          <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-zinc-900" />
        </div>
      </div>
      
      <Skeleton className="h-10 sm:h-11 w-full rounded-xl sm:rounded-2xl mt-1 sm:mt-2 bg-slate-200 dark:bg-zinc-900" />
    </div>
  );
};

export const StudentGridSkeleton: React.FC<{ limit?: number }> = ({ limit = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: limit }).map((_, i) => (
        <StudentSkeleton key={i} />
      ))}
    </div>
  );
};

export default StudentSkeleton;
