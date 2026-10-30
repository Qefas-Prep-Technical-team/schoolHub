import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, History } from "lucide-react";

export default function AdminTransactionsLoading() {
  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-28 rounded-xl bg-slate-200/70 dark:bg-slate-800/80" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-64 sm:w-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800/90" />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-800/40">
                <History className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Loading</span>
              </div>
            </div>
            <Skeleton className="h-5 w-80 sm:w-96 rounded-lg bg-slate-200/60 dark:bg-slate-800/70" />
          </div>
        </div>
      </div>

      {/* Analytics KPI Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="size-12 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80" />
              <Skeleton className="h-5 w-20 rounded-full bg-slate-200/60 dark:bg-slate-800/70" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-md bg-slate-200/50 dark:bg-slate-800/60" />
              <Skeleton className="h-8 w-36 rounded-lg bg-slate-200/80 dark:bg-slate-800/90" />
              <Skeleton className="h-3 w-48 rounded-md bg-slate-200/40 dark:bg-slate-800/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Skeleton Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="h-11 w-full sm:w-80 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80" />
          <Skeleton className="h-11 w-32 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80" />
        </div>

        {/* Table Header Row Skeleton */}
        <div className="hidden md:grid grid-cols-6 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-4 w-20 rounded-md bg-slate-200/60 dark:bg-slate-800/70" />
          ))}
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl bg-slate-200/70 dark:bg-slate-800/80" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 sm:w-48 rounded-md bg-slate-200/80 dark:bg-slate-800/90" />
                  <Skeleton className="h-3 w-24 rounded-md bg-slate-200/50 dark:bg-slate-800/60" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded-md hidden md:block bg-slate-200/60 dark:bg-slate-800/70" />
              <Skeleton className="h-4 w-24 rounded-md hidden sm:block bg-slate-200/60 dark:bg-slate-800/70" />
              <Skeleton className="h-6 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800/80" />
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <div className="flex items-center gap-2 text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200/60 dark:border-slate-800">
            <Loader2 className="animate-spin text-primary" size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Loading Transaction Ledger...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
