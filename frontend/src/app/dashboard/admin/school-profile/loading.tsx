import { Skeleton } from "@/components/ui/skeleton";

export default function SchoolProfileLoading() {
  return (
    <div className="min-h-screen bg-transparent pb-20 animate-in fade-in duration-300">
      {/* Hero Cover Banner & Identity Header */}
      <section className="relative p-4 md:p-6 lg:p-8 pb-0">
        <div className="w-[95%] max-w-[1600px] mx-auto">
          {/* Cover Banner Skeleton */}
          <div className="h-44 sm:h-56 md:h-72 w-full relative overflow-hidden rounded-2xl md:rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/60 shadow-sm">
            <Skeleton className="w-full h-full bg-slate-200/70 dark:bg-slate-800/60" />
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <Skeleton className="h-9 sm:h-10 w-20 sm:w-28 rounded-xl bg-white/90 dark:bg-slate-800/90" />
            </div>
          </div>

          {/* Logo & Header Info Row */}
          <div className="px-4 sm:px-6 relative">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 -mt-12 md:-mt-16 relative z-20">
              {/* School Logo Square */}
              <div className="size-28 md:size-36 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shrink-0">
                <Skeleton className="w-full h-full rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
              </div>

              {/* Title & Metadata Skeleton */}
              <div className="flex-1 pt-2 md:pt-20 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 md:h-9 w-64 md:w-96 rounded-xl bg-slate-300/80 dark:bg-slate-700" />
                    <Skeleton className="h-4 w-48 md:w-72 rounded-md bg-slate-200/90 dark:bg-slate-800" />
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Skeleton className="h-4 w-36 rounded-md bg-slate-200/80 dark:bg-slate-800" />
                      <Skeleton className="h-4 w-44 rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                  </div>

                  {/* Edit Profile Button Placeholder */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-0">
                    <Skeleton className="h-10 w-32 rounded-xl bg-slate-300/80 dark:bg-slate-700" />
                  </div>
                </div>

                {/* Student & Teacher Counter Tags */}
                <div className="flex items-center gap-6 pt-2">
                  <Skeleton className="h-5 w-24 rounded-md bg-slate-200/80 dark:bg-slate-800" />
                  <Skeleton className="h-5 w-24 rounded-md bg-slate-200/80 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body Grid */}
      <main className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Main Column (2 spans on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Institution Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-40 rounded-md bg-slate-300/80 dark:bg-slate-700" />
            </div>
            <Skeleton className="h-4 w-full rounded-md bg-slate-200/80 dark:bg-slate-800" />
            <Skeleton className="h-4 w-5/6 rounded-md bg-slate-200/80 dark:bg-slate-800" />
            <Skeleton className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800" />
          </div>

          {/* Academic Leadership Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            <Skeleton className="h-5 w-44 rounded-md bg-slate-300/80 dark:bg-slate-700" />
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <Skeleton className="size-12 rounded-xl bg-slate-200/80 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36 rounded-md bg-slate-300/70 dark:bg-slate-700" />
                    <Skeleton className="h-3.5 w-28 rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    <Skeleton className="h-3 w-48 rounded-md bg-slate-200/70 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Digital Capabilities Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            <Skeleton className="h-5 w-44 rounded-md bg-slate-300/80 dark:bg-slate-700" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <Skeleton className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-6 w-32 rounded bg-slate-300/80 dark:bg-slate-700" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <Skeleton className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-6 w-44 rounded bg-slate-300/80 dark:bg-slate-700" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-7 w-24 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
              ))}
            </div>
          </div>

          {/* Governance & Social Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44 rounded-md bg-slate-300/80 dark:bg-slate-700" />
                <Skeleton className="h-3 w-56 rounded-md bg-slate-200/70 dark:bg-slate-800" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <Skeleton className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-5 w-32 rounded bg-slate-300/80 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          </div>

          {/* Academic Grading Configuration Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-56 rounded-md bg-slate-300/80 dark:bg-slate-700" />
              <Skeleton className="h-6 w-20 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/30 flex flex-col items-center justify-center space-y-2">
                  <Skeleton className="size-8 rounded-md bg-slate-300/80 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right / Sidebar Column */}
        <div className="space-y-6">
          
          {/* Connectivity / Contact Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            <Skeleton className="h-5 w-32 rounded-md bg-slate-300/80 dark:bg-slate-700" />
            
            <div className="space-y-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-4 w-44 rounded bg-slate-300/70 dark:bg-slate-700" />
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-center gap-3 border-t border-slate-100 dark:border-slate-800">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="size-9 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
              ))}
            </div>
          </div>

          {/* Operational Stats Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
            <Skeleton className="h-5 w-36 rounded-md bg-slate-300/80 dark:bg-slate-700" />
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
                    <Skeleton className="h-3.5 w-24 rounded bg-slate-200/90 dark:bg-slate-800" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded bg-slate-300/80 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          </div>

          {/* System Health Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-3">
            <Skeleton className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-7 w-40 rounded-lg bg-slate-300/80 dark:bg-slate-700" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="size-2 rounded-full bg-emerald-500/80" />
              <Skeleton className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
