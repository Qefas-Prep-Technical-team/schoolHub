"use client"
import { useEffect } from "react";
import SuccessCard from "./components/SuccessCard";
import LogoTitle from "../../../verification/components/LogoTitle";
import { useRouter } from "next/navigation";

export default function ResetSuccessPage() {
  const router  = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-500">
      {/* Background Ambient Glow Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[15%] -left-[15%] w-[50%] h-[50%] bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-[30%] -right-[15%] w-[45%] h-[45%] bg-gradient-to-tl from-indigo-500/10 via-blue-500/10 to-transparent rounded-full blur-[140px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-lg space-y-6 z-10 animate-in fade-in zoom-in-95 duration-500">
        <LogoTitle />
        <SuccessCard />
      </div>
    </div>
  );
}
