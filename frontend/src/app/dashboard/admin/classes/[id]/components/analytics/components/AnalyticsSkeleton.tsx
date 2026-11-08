import React from 'react';

export const AnalyticsSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 w-full animate-pulse">
            {/* Header skeleton */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="h-4 w-full max-w-2xl bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>

            {/* 4 Cards Grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 sm:p-5 space-y-4"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                        </div>
                        <div className="h-32 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
                    </div>
                ))}
            </div>

            {/* Bottom Overall Chart skeleton */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="flex gap-2">
                        <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                </div>
                <div className="h-64 sm:h-80 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            </div>
        </div>
    );
};

