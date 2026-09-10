import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const StudentSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 rounded-[2rem] border border-slate-200 dark:border-emerald-800/50 bg-white/70 dark:bg-emerald-950/60/70 backdrop-blur-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      <Skeleton className="h-11 w-full rounded-xl mt-2" />
    </div>
  );
};

export const StudentGridSkeleton: React.FC<{ limit?: number }> = ({ limit = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: limit }).map((_, i) => (
        <StudentSkeleton key={i} />
      ))}
    </div>
  );
};

export default StudentSkeleton;
