export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-transparent py-8 animate-in fade-in duration-500">
      <div className="w-[90%] max-w-[90%] mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8 min-w-0">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="h-11 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          </header>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-slate-900/30 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex gap-2 p-1 w-full sm:w-auto">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-10 w-full sm:w-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4" />
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mb-6" />
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
