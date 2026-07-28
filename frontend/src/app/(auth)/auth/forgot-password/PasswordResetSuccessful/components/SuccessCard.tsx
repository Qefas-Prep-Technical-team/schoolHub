"use client";
import SuccessIcon from "./SuccessIcon";
import SuccessMessage from "./SuccessMessage";
import RedirectNotice from "./RedirectNotice";
import { useRouter } from "next/navigation";

export default function SuccessCard() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden w-full rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-none text-center space-y-6">
      <SuccessIcon />
      <SuccessMessage />

      <div className="flex w-full flex-col items-center gap-4 pt-2">
        <button
          onClick={() => router.push("/login")}
          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:bg-emerald-500 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
        >
          <span>Go to Login</span>
        </button>
        <RedirectNotice />
      </div>
    </div>
  );
}
