import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const AssignmentsSkeleton: React.FC<{ view?: 'list' | 'grid' }> = ({ view = 'grid' }) => {
    if (view === 'list') {
        return (
            <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black gap-4 animate-pulse">
                        <div className="space-y-3 flex-1 w-full">
                            <Skeleton className="h-5 sm:h-6 w-3/4 md:w-1/2 rounded-md bg-slate-200 dark:bg-zinc-900" />
                            <div className="flex gap-2">
                                <Skeleton className="h-4 w-20 rounded-md bg-slate-200 dark:bg-zinc-900" />
                                <Skeleton className="h-4 w-24 rounded-md bg-slate-200 dark:bg-zinc-900" />
                            </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
                            <Skeleton className="h-7 w-20 rounded-lg bg-slate-200 dark:bg-zinc-900" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                                <Skeleton className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                                <Skeleton className="h-9 w-20 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black space-y-5 animate-pulse">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-6 w-3/4 rounded-md bg-slate-200 dark:bg-zinc-900" />
                        <Skeleton className="h-6 w-16 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                    </div>
                    
                    <div className="space-y-2 mt-3">
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-20 rounded-md bg-slate-200 dark:bg-zinc-900" />
                            <Skeleton className="h-4 w-24 rounded-md bg-slate-200 dark:bg-zinc-900" />
                        </div>
                    </div>

                    <div className="space-y-3 py-3 mt-auto">
                        <div className="flex justify-between items-end">
                            <Skeleton className="h-3 w-24 rounded-md bg-slate-200 dark:bg-zinc-900" />
                            <Skeleton className="h-3 w-12 rounded-md bg-slate-200 dark:bg-zinc-900" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-900" />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                        <div className="flex gap-1.5">
                            <Skeleton className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                            <Skeleton className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                            <Skeleton className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                    </div>
                </div>
            ))}
        </div>
    );
};
