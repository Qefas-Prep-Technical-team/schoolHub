import { Loader2 } from "lucide-react";

export default function FinanceLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Financial Data...</p>
        </div>
    )
}
