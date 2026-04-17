import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const ClassDetailSkeleton: React.FC = () => {
    return (
        <div className="space-y-10">
            {/* Header Hero Skeleton */}
            <div className="relative h-64 md:h-80 w-full rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-900 flex flex-col justify-end p-10">
                <div className="space-y-4 max-w-2xl">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-12 w-3/4 rounded-2xl" />
                    <div className="flex gap-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-32" />
                    </div>
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
