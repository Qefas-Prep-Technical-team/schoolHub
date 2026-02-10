export default function AttendanceLoading() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Header Skeleton */}
            <div className="animate-pulse sticky top-0 z-50 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-10 py-3">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="size-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                    </div>
                    <div className="hidden md:block h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-64" />
                </div>
                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center gap-9">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <main className="flex-1 flex justify-center py-8 px-40">
                <div className="w-full max-w-[1200px] flex flex-col gap-6">
                    {/* Page Header */}
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="space-y-2">
                            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-64" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96" />
                        </div>
                        <div className="flex gap-3">
                            <div className="hidden sm:block h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-32" />
                            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-40" />
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl w-24" />
                        ))}
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        ))}
                    </div>

                    {/* Charts & Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        <div className="space-y-6">
                            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}