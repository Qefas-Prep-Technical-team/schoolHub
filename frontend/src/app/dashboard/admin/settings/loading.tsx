import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Settings Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-lg" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs Skeleton */}
        <div className="w-full lg:w-64 space-y-2 shrink-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl" />
          ))}
        </div>

        {/* Settings Content Area Skeleton */}
        <div className="flex-1 space-y-8">
          <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-xl" />
                <div>
                  <Skeleton className="h-6 w-32 rounded-lg mb-2" />
                  <Skeleton className="h-4 w-64 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {[1, 2, 3].map((section) => (
                <div key={section} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40 rounded-lg" />
                      <Skeleton className="h-4 w-56 rounded-lg" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="space-y-3">
                     <Skeleton className="h-4 w-24 rounded-lg" />
                     <Skeleton className="h-12 w-full rounded-2xl" />
                 </div>
                 <div className="space-y-3">
                     <Skeleton className="h-4 w-24 rounded-lg" />
                     <Skeleton className="h-12 w-full rounded-2xl" />
                 </div>
              </div>

              <div className="flex justify-end pt-8">
                 <Skeleton className="h-12 w-32 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
