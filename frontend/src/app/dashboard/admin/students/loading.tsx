import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex">
      {/* Sidebar Skeleton */}
      <div className="w-[320px] h-full border-r border-white/5 p-10 flex flex-col gap-10 bg-slate-950/50 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-2 w-20 rounded-full bg-white/5" />
          </div>
        </div>
        <div className="space-y-6 pt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-xl bg-white/5" />
              <Skeleton className="h-3 w-28 rounded-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20">
        {/* Navbar Skeleton */}
        <div className="h-24 border-b border-white/5 px-12 flex items-center justify-between bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-4">
             <Skeleton className="h-10 w-48 rounded-2xl bg-white/10" />
             <div className="size-1.5 rounded-full bg-white/10" />
             <Skeleton className="h-4 w-32 rounded-full bg-white/5" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <Skeleton className="size-10 rounded-full bg-white/5" />
               <Skeleton className="h-3 w-20 rounded-full bg-white/5" />
            </div>
            <Skeleton className="size-12 rounded-2xl bg-white/10" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-12 space-y-16">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-6">
              <Skeleton className="h-6 w-48 rounded-full bg-white/10" />
              <Skeleton className="h-20 w-[500px] rounded-[2.5rem] bg-white/10" />
              <Skeleton className="h-4 w-[400px] rounded-full bg-white/5" />
            </div>
            <Skeleton className="h-20 w-64 rounded-[2.5rem] bg-white/10" />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 rounded-[3.5rem] bg-white/[0.03] border border-white/5 p-10 space-y-6 relative overflow-hidden">
                 <div className="flex justify-between items-start">
                    <Skeleton className="size-14 rounded-2xl bg-white/10" />
                    <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
                 </div>
                 <div className="space-y-3">
                    <Skeleton className="h-3 w-24 rounded-full bg-white/5" />
                    <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
                 </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="h-28 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex items-center px-12 gap-10">
             <Skeleton className="h-16 flex-1 rounded-[2rem] bg-white/5" />
             <Skeleton className="h-16 w-64 rounded-[2rem] bg-white/5" />
             <Skeleton className="size-16 rounded-[2rem] bg-white/10" />
          </div>

          {/* Registry Table Skeleton */}
          <div className="rounded-[4rem] bg-white/[0.02] border border-white/5 p-4 space-y-4 backdrop-blur-3xl">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-8 p-8 rounded-[3rem] bg-white/[0.01] border border-white/[0.02]">
                <Skeleton className="size-6 rounded-lg bg-white/5" />
                <div className="flex items-center gap-6 flex-1">
                   <Skeleton className="size-16 rounded-2xl bg-white/10" />
                   <div className="space-y-3">
                      <Skeleton className="h-5 w-48 rounded-lg bg-white/10" />
                      <Skeleton className="h-3 w-32 rounded-full bg-white/5" />
                   </div>
                </div>
                <Skeleton className="h-4 w-32 rounded-full bg-white/5" />
                <Skeleton className="h-4 w-40 rounded-full bg-white/5" />
                <Skeleton className="h-12 w-32 rounded-2xl bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
