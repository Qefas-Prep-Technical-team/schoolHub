export const TabSkeleton = ({ tabId }: { tabId: string }) => {
  if (tabId === "overview") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-slate-200/80 dark:border-emerald-800/50 space-y-4 shadow-sm">
            <div className="h-6 bg-slate-200 dark:bg-emerald-800/40 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-emerald-800/40 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-emerald-800/40 rounded w-5/6" />
              <div className="h-4 bg-slate-200 dark:bg-emerald-800/40 rounded w-4/5" />
            </div>
          </div>
          <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-slate-200/80 dark:border-emerald-800/50 space-y-4 shadow-sm">
            <div className="h-6 bg-slate-200 dark:bg-emerald-800/40 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-100 dark:bg-emerald-900/40 rounded-xl" />
              <div className="h-20 bg-slate-100 dark:bg-emerald-900/40 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-slate-200/80 dark:border-emerald-800/50 space-y-4 h-96 shadow-sm">
          <div className="h-6 bg-slate-200 dark:bg-emerald-800/40 rounded w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-emerald-800/40 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 dark:bg-emerald-800/40 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-emerald-800/40 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Generic List/Table Skeleton for other tabs
  return (
    <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-slate-200/80 dark:border-emerald-800/50 p-6 space-y-4 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-200 dark:bg-emerald-800/40 rounded w-1/6" />
        <div className="h-10 bg-slate-200 dark:bg-emerald-800/40 rounded w-1/4" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-800/40 py-3 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 dark:bg-emerald-800/40 rounded-full" />
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-200 dark:bg-emerald-800/40 rounded w-32" />
                <div className="h-3 bg-slate-200 dark:bg-emerald-800/40 rounded w-20" />
              </div>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-emerald-800/40 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};
