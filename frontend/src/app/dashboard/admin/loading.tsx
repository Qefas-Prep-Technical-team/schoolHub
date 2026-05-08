import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full gap-4">
      <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
      </div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Content...</p>
    </div>
  );
}
