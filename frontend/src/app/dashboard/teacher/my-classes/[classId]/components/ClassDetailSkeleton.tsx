import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const ClassDetailSkeleton: React.FC = () => {
    return (
        <div className="space-y-10">
            {/* Header Hero Skeleton */}
            <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 flex flex-col border border-slate-200 dark:border-slate-800">
                <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-6 flex-1 max-w-2xl">
                        <div className="flex gap-3">
                            <Skeleton className="h-8 w-40 rounded-xl" />
                            <Skeleton className="h-8 w-24 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-12 md:h-16 w-3/4 rounded-2xl" />
                            <Skeleton className="h-6 w-1/2 rounded-xl" />
                        </div>
                    </div>
                    <Skeleton className="h-14 w-48 rounded-2xl shrink-0" />
                </div>
                {/* Meta Bar Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-5 md:p-6">
                            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-4 p-2 bg-slate-100 dark:bg-slate-900 rounded-[2rem] w-max">
                <Skeleton className="h-12 w-32 rounded-xl" />
                <Skeleton className="h-12 w-32 rounded-xl" />
                <Skeleton className="h-12 w-32 rounded-xl" />
                <Skeleton className="h-12 w-32 rounded-xl" />
            </div>

            {/* Grid Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-slate-100 dark:bg-slate-900 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Content Row Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
};

export default ClassDetailSkeleton;
