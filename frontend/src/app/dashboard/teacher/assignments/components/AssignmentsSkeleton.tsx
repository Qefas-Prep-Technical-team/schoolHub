import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const AssignmentsSkeleton: React.FC<{ view?: 'list' | 'grid' }> = ({ view = 'grid' }) => {
    if (view === 'list') {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 gap-4">
                        <div className="space-y-3 flex-1 w-full">
                            <Skeleton className="h-6 w-3/4 md:w-1/2 rounded-md" />
                            <div className="flex gap-2">
                                <Skeleton className="h-4 w-20 rounded-md" />
                                <Skeleton className="h-4 w-24 rounded-md" />
                            </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
                            <Skeleton className="h-8 w-24 rounded-lg" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-10 w-24 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 space-y-6">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-xl" />
                    </div>
                    
                    <div className="space-y-3 mt-4">
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-20 rounded-md" />
                            <Skeleton className="h-4 w-24 rounded-md" />
                        </div>
                    </div>

                    <div className="space-y-4 py-4 mt-auto">
                        <div className="flex justify-between items-end">
                            <Skeleton className="h-3 w-24 rounded-md" />
                            <Skeleton className="h-4 w-12 rounded-md" />
                        </div>
                        <Skeleton className="h-2.5 w-full rounded-full" />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/50">
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                        <Skeleton className="h-10 w-28 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
};

