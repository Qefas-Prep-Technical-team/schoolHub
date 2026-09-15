import React from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LinkingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-slate-50 dark:border-slate-800 relative flex flex-col items-center p-6 pt-8 h-[280px]">
          <Skeleton className="h-16 w-16 rounded-full mb-4 mt-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24 mb-6" />
          <div className="w-full flex items-center justify-between gap-3 mb-6 px-1">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="flex-1 h-[2px] rounded-full" />
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
          <Skeleton className="w-full h-px mb-4" />
          <Skeleton className="h-2 w-16" />
        </Card>
      ))}
    </div>
  );
}
