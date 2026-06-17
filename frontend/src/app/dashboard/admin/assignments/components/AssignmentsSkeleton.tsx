import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const AssignmentsSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm space-y-6">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-6 w-12 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-xl" />
                    </div>
                    
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex gap-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>

                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-end">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
};

