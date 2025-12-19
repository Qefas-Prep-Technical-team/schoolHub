export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header Skeleton */}
      <div className="animate-pulse sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-64" />
            <div className="flex items-center gap-2">
              <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="size-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Page Header */}
        <div className="animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-40" />
          </div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="size-10 bg-slate-300 dark:bg-slate-600 rounded-lg" />
                <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-16" />
              </div>
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-24 mb-2" />
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Dashboard Layout Skeleton */}
        <div className="animate-pulse grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="xl:col-span-8 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 space-y-6 md:space-y-8">
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}