import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header Section */}
        <div>
            <Skeleton className="h-3 w-32 rounded-md mb-2 bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Top Hero & Glance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Hero Banner */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-800/50 min-h-[280px]">
                <div className="absolute z-10 p-8 h-full flex flex-col justify-end w-full">
                    <Skeleton className="h-6 w-32 rounded-full mb-4 bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-8 w-2/3 rounded-lg mb-2 bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-4 w-1/2 rounded-lg mb-6 bg-slate-200 dark:bg-slate-700" />
                    
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-36 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <Skeleton className="h-10 w-28 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                </div>
            </div>

            {/* Today at a Glance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center">
                <div className="mb-6">
                    <Skeleton className="h-5 w-40 rounded-md mb-2 bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-3 w-28 rounded-md bg-slate-100 dark:bg-slate-800/50" />
                </div>
                
                <div className="space-y-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                                <Skeleton className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800/50" />
                            </div>
                            <Skeleton className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start mb-4">
                        <Skeleton className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="size-8 rounded-full bg-slate-100 dark:bg-slate-800/50" />
                    </div>
                    <div>
                        <Skeleton className="h-8 w-20 rounded-lg mb-3 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-12 rounded-md bg-slate-100 dark:bg-slate-800/50" />
                            <Skeleton className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800/50" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Dashboard Charts / Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Skeleton className="h-5 w-40 rounded-md mb-2 bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-3 w-64 rounded-md bg-slate-100 dark:bg-slate-800/50" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full bg-slate-100 dark:bg-slate-800/50" />
                </div>
                <div className="flex items-end justify-between h-64 gap-4 px-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Skeleton key={i} className={`w-full rounded-t-lg bg-slate-200 dark:bg-slate-800 ${i % 2 === 0 ? 'h-32' : 'h-48'}`} />
                    ))}
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 min-h-[400px]">
                <div className="mb-8">
                    <Skeleton className="h-5 w-40 rounded-md mb-2 bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-3 w-32 rounded-md bg-slate-100 dark:bg-slate-800/50" />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="size-10 rounded-full shrink-0 bg-slate-200 dark:bg-slate-800" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                                <Skeleton className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800/50" />
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
