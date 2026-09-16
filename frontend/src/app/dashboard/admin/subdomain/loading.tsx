import { Skeleton } from "@/components/ui/skeleton";

export default function SubdomainLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans -mt-4 -mx-4 md:-mt-8 md:-mx-8">
      {/* Skeleton Sub-Header */}
      <div className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Skeleton Main Split Screen */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-80px)]">
        {/* Skeleton Left Hand: Controls Panel */}
        <div className="w-full lg:w-[480px] border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col shrink-0">
          <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-900 p-2 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
          <div className="p-6 space-y-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
        
        {/* Skeleton Right Hand: Preview Area */}
        <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/20 p-4 lg:p-8 flex flex-col items-center overflow-y-auto">
          <Skeleton className="w-full max-w-[400px] md:max-w-[800px] h-[800px] rounded-b-2xl rounded-t-2xl border border-slate-200 dark:border-slate-900" />
        </div>
      </div>
    </div>
  );
}
