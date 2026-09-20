import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        {/* Modern Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded-full" />
            <Skeleton className="h-16 lg:h-20 w-[280px] lg:w-[450px]" />
            <Skeleton className="h-6 w-full max-w-xl rounded-lg mt-4" />
          </div>
          
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-[180px] rounded-[2rem]" />
            <Skeleton className="h-16 w-[220px] rounded-[2rem]" />
          </div>
        </div>

        {/* Department & School Statistics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="size-10 rounded-xl" />
                </div>
                <div>
                    <Skeleton className="h-10 w-24 mb-1" />
                    <Skeleton className="h-3 w-28 mt-2" />
                </div>
            </div>
          ))}
        </div>

        {/* Operational Terminal Control Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex-1 max-w-xl">
                <Skeleton className="w-full h-16 rounded-3xl" />
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-inner gap-1">
                    <Skeleton className="size-12 rounded-xl" />
                    <Skeleton className="size-12 rounded-xl" />
                 </div>
                 <Skeleton className="h-16 w-32 rounded-3xl hidden sm:flex" />
            </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6">
                        <Skeleton className="size-16 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-16 rounded-md" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-8 rounded-lg" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-8 rounded-lg" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-24 rounded-xl" />
                        <Skeleton className="size-10 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
