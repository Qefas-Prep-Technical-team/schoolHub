import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded-full bg-slate-100 dark:bg-white/5" />
            <Skeleton className="h-16 w-[280px] lg:w-[450px] rounded-2xl bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-6 w-full max-w-xl rounded-lg bg-slate-100 dark:bg-white/5 mt-4" />
          </div>
          <div className="hidden lg:block">
            <Skeleton className="h-16 w-56 rounded-[2rem] bg-slate-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Analytics Hub Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden space-y-6">
              <div 
                  className="absolute -right-6 -bottom-6 size-40 rounded-full blur-3xl opacity-[0.03] pointer-events-none bg-slate-500" 
              />
              <div className="flex justify-between items-center relative z-10">
                <Skeleton className="size-14 rounded-2xl bg-slate-100 dark:bg-white/5" />
                <Skeleton className="h-6 w-16 rounded-full bg-slate-100 dark:bg-white/5" />
              </div>
              <div className="space-y-4 relative z-10">
                <Skeleton className="h-4 w-28 rounded-lg bg-slate-100 dark:bg-white/5" />
                <Skeleton className="h-12 w-32 rounded-xl bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-40 rounded-lg bg-slate-100 dark:bg-white/5 mt-2" />
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <Skeleton className="h-16 w-full flex-1 max-w-xl rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5" />
            <div className="flex items-center gap-4">
               <Skeleton className="h-16 w-48 rounded-[2rem] hidden sm:block bg-slate-100 dark:bg-white/5" />
               <Skeleton className="h-16 w-24 rounded-[2rem] hidden sm:block bg-slate-100 dark:bg-white/5" />
            </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="rounded-[4rem] bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 p-4 lg:p-8 shadow-2xl space-y-2">
            {/* Table Header */}
            <div className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-3 w-28 rounded-full bg-slate-100 dark:bg-white/5" />
                ))}
            </div>
            
            {/* Table Rows */}
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-3xl bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100/50 dark:border-white/[0.02] mb-4 gap-6 md:gap-0">
                    <div className="flex items-center gap-6">
                        <Skeleton className="size-14 shrink-0 rounded-2xl bg-slate-200 dark:bg-white/10" />
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-48 rounded-lg bg-slate-200 dark:bg-white/10" />
                            <Skeleton className="h-3 w-32 rounded-full bg-slate-100 dark:bg-white/5" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg hidden md:block bg-slate-100 dark:bg-white/5" />
                    <Skeleton className="h-6 w-32 rounded-lg hidden lg:block bg-slate-100 dark:bg-white/5" />
                    <div className="flex items-center gap-4 justify-end">
                        <Skeleton className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-white/10" />
                        <Skeleton className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 hidden md:block" />
                    </div>
                </div>
            ))}
            
            {/* Footer Loader */}
            <div className="flex justify-center pt-12 pb-6">
                 <div className="flex items-center gap-3 text-slate-400 bg-slate-50 dark:bg-white/5 px-6 py-3 rounded-full border border-slate-100 dark:border-white/5">
                    <Loader2 className="animate-spin text-primary" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Preparing Dashboard...</span>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
