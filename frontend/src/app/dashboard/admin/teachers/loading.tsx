import { Skeleton } from "@/components/ui/skeleton";

export default function TeachersLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex">
      {/* Sidebar Skeleton */}
      <div className="w-[260px] h-full border-r border-slate-100 dark:border-white/5 p-8 flex flex-col gap-8 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Skeleton */}
        <div className="h-20 border-b border-slate-100 dark:border-white/5 px-10 flex items-center justify-between">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <div className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-16 w-96 rounded-3xl" />
            </div>
            <Skeleton className="h-16 w-56 rounded-[2rem]" />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-[3rem]" />
            ))}
          </div>

          {/* Controls */}
          <div className="h-24 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center px-10 gap-8">
             <Skeleton className="h-12 flex-1 rounded-2xl" />
             <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>

          {/* Registry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-[4rem]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
