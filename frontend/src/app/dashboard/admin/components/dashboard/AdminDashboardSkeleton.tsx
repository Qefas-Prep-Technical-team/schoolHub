import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-transparent py-4 md:py-6 lg:py-8">
      <div className="w-[95%] max-w-none mx-auto space-y-6">

        {/* Header Section */}
        <div>
          <Skeleton className="h-3.5 w-36 rounded-md mb-2 bg-slate-200/90 dark:bg-slate-700/80" />
          <Skeleton className="h-8 w-72 rounded-lg bg-slate-300/80 dark:bg-slate-700" />
        </div>

        {/* Top Hero & Glance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hero Banner Skeleton */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[280px]">
            <div className="p-8 h-full flex flex-col justify-end w-full">
              <Skeleton className="h-6 w-36 rounded-full mb-4 bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-8 w-3/4 rounded-lg mb-2 bg-slate-300/80 dark:bg-slate-700" />
              <Skeleton className="h-4 w-1/2 rounded-lg mb-6 bg-slate-200 dark:bg-slate-800" />
              
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-36 rounded-full bg-slate-300 dark:bg-slate-700" />
                <Skeleton className="h-10 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>

          {/* Today at a Glance Skeleton */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center">
            <div className="mb-6">
              <Skeleton className="h-5 w-44 rounded-md mb-2 bg-slate-300/80 dark:bg-slate-700" />
              <Skeleton className="h-3.5 w-32 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-28 rounded bg-slate-200/90 dark:bg-slate-800" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded bg-slate-300/80 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-3.5 w-24 rounded bg-slate-200/90 dark:bg-slate-800" />
                <Skeleton className="size-8 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div>
                <Skeleton className="h-8 w-20 rounded bg-slate-300/80 dark:bg-slate-700 mb-2" />
                <Skeleton className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[360px]">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-5 w-44 rounded bg-slate-300/80 dark:bg-slate-700" />
              <Skeleton className="h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl bg-slate-100/80 dark:bg-slate-800/50" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[360px]">
            <Skeleton className="h-5 w-36 rounded mb-6 bg-slate-300/80 dark:bg-slate-700" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28 rounded bg-slate-200/90 dark:bg-slate-800" />
                      <Skeleton className="h-3 w-20 rounded bg-slate-200/60 dark:bg-slate-800" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
