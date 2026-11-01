import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-transparent p-3.5 sm:p-6 lg:p-8 font-sans pb-24 animate-in fade-in duration-300">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">

        {/* Header Skeleton */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Shield size={14} /> Team & Governance
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-9 w-44 sm:w-56 rounded-xl bg-slate-300/80 dark:bg-slate-700" />
              <Skeleton className="h-4 w-72 sm:w-96 max-w-full rounded-md bg-slate-200/90 dark:bg-slate-800" />
            </div>

            {/* Search Input Skeleton */}
            <div className="w-full md:w-80">
              <Skeleton className="h-10 sm:h-11 w-full rounded-xl bg-slate-200/90 dark:bg-slate-800" />
            </div>
          </div>
        </header>

        {/* 4 Team Stats Cards Skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <Skeleton className="size-10 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
                <Skeleton className="h-5 w-14 rounded-md bg-slate-200/70 dark:bg-slate-800/80" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded bg-slate-200/70 dark:bg-slate-800/80" />
                <div className="flex items-baseline justify-between pt-1">
                  <Skeleton className="h-7 sm:h-8 w-16 rounded-lg bg-slate-300/80 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-12 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-1 sm:p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs inline-flex w-full sm:w-auto">
            <div className="flex w-full sm:w-auto gap-1">
              <Skeleton className="h-10 w-36 sm:w-44 rounded-xl bg-slate-300/80 dark:bg-slate-700" />
              <Skeleton className="h-10 w-36 sm:w-44 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
            </div>
          </div>

          {/* Members Table / Card Container Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            
            {/* Desktop Table Header Skeleton */}
            <div className="hidden md:block border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5">
                  <Skeleton className="h-3 w-20 rounded bg-slate-300/70 dark:bg-slate-700" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-3 w-16 rounded bg-slate-300/70 dark:bg-slate-700" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-3 w-24 rounded bg-slate-300/70 dark:bg-slate-700" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Skeleton className="h-3 w-12 rounded bg-slate-300/70 dark:bg-slate-700" />
                </div>
              </div>
            </div>

            {/* Rows List (Responsive for both Mobile and Desktop) */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 sm:px-6 sm:py-4.5">
                  {/* Desktop Row */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 flex items-center gap-3.5">
                      <Skeleton className="size-10 rounded-2xl bg-slate-300/80 dark:bg-slate-700 shrink-0" />
                      <div className="space-y-1.5 min-w-0">
                        <Skeleton className="h-4 w-36 rounded-md bg-slate-300/90 dark:bg-slate-700" />
                        <Skeleton className="h-3 w-48 rounded bg-slate-200/80 dark:bg-slate-800" />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <Skeleton className="h-6 w-28 rounded-xl bg-slate-200/90 dark:bg-slate-800" />
                    </div>
                    <div className="col-span-3">
                      <Skeleton className="h-3.5 w-24 rounded bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Skeleton className="size-8 rounded-lg bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                  </div>

                  {/* Mobile Card Row */}
                  <div className="block md:hidden space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Skeleton className="size-11 rounded-2xl bg-slate-300/80 dark:bg-slate-700 shrink-0" />
                        <div className="space-y-1.5 min-w-0">
                          <Skeleton className="h-4 w-32 rounded bg-slate-300/90 dark:bg-slate-700" />
                          <Skeleton className="h-3 w-40 rounded bg-slate-200/80 dark:bg-slate-800" />
                        </div>
                      </div>
                      <Skeleton className="size-8 rounded-lg bg-slate-200/80 dark:bg-slate-800 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/40">
                      <Skeleton className="h-6 w-24 rounded-xl bg-slate-200/90 dark:bg-slate-800" />
                      <Skeleton className="h-3 w-20 rounded bg-slate-200/70 dark:bg-slate-800/80" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
