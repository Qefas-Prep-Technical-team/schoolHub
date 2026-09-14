import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface AssignmentsSkeletonProps {
    view?: 'list' | 'grid';
}

export const AssignmentsSkeleton: React.FC<AssignmentsSkeletonProps> = ({ view = 'list' }) => {
    if (view === 'list') {
        return (
            <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-[0.5fr_2.5fr_1.5fr_1.5fr_1.5fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-[0.5fr_2.5fr_1.5fr_1.5fr_1.5fr_1fr_auto] gap-4 items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                        <Skeleton className="h-4 w-4 hidden md:block" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-24 hidden md:block" />
                        <Skeleton className="h-4 w-20 hidden md:block" />
                        <div className="space-y-2 hidden md:block">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full hidden md:block" />
                        <div className="flex items-center justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-20 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    
                    <div className="mt-auto space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-8" />
                            </div>
                            <Skeleton className="h-1 w-full rounded-full" />
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <Skeleton className="h-6 w-20 rounded-lg" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

