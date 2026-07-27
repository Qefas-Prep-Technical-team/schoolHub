"use client";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ButtonGroupProps {
  isPending: boolean;
  isValid: boolean;
  onSubmit: () => void;
}

export default function ButtonGroup({ isPending, isValid, onSubmit }: ButtonGroupProps) {
  const isSubmitDisabled = isPending || !isValid;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        className="flex h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {isPending ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending Link...</span>
          </div>
        ) : (
          "Send Reset Link"
        )}
      </button>
      
      <Link 
        href="/login" 
        className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 py-2 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Login</span>
      </Link>
    </div>
  );
}
