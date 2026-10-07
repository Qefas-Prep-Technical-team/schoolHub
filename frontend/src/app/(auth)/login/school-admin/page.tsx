"use client";
import LoginCard from "./components/LoginCard";
import PreviewImage from "./components/PreviewImage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      
      {/* Mobile Dynamic Background */}
      <div className="absolute inset-0 md:hidden overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[20%] w-[80%] h-[60%] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[100px]" />
        <div className="absolute top-[50%] -right-[30%] w-[90%] h-[70%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Background Image Layer for Left Side (Desktop) */}
      <div className="absolute inset-0 hidden md:block w-[55%] lg:w-[60%]">
        <PreviewImage />
      </div>

      <div className="relative z-10 w-full flex">
        {/* Left Side spacer */}
        <div className="hidden md:block md:w-[55%] lg:w-[60%]"></div>
        
        {/* Right Side Form */}
        <div className="w-full md:w-[45%] lg:w-[40%] min-h-screen flex flex-col justify-center px-4 sm:px-10 lg:px-16 py-10 md:py-16 md:bg-white md:dark:bg-slate-950">
           
           {/* Back Button */}
           <div className="w-full max-w-[440px] mx-auto mb-6 md:mb-10">
             <Link href="/login" className="flex items-center gap-3 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors w-max group">
               <div className="p-2.5 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 group-hover:shadow-md transition-all group-hover:-translate-x-1">
                 <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
               </div>
               Back to Portals
             </Link>
           </div>
           
           {/* Card (Glassmorphic on mobile, flat on desktop) */}
           <div className="w-full max-w-[440px] mx-auto bg-white/70 dark:bg-slate-900/70 md:bg-transparent md:dark:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-white/60 dark:border-white/5 md:border-none rounded-[2.5rem] md:rounded-none shadow-2xl shadow-blue-900/5 md:shadow-none p-6 sm:p-12 md:p-0 animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
             
             {/* Mobile-only inner glass shine effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-50 md:hidden pointer-events-none" />

             <div className="relative z-10">
               <div className="md:hidden flex justify-center mb-8">
                  <div className="h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <img src="/logo/favicon.svg" className="w-10 h-10 brightness-0 invert" alt="Logo" />
                  </div>
               </div>
               <LoginCard />
             </div>
           </div>

           {/* Mobile Footer Decor */}
           <div className="mt-12 text-center md:hidden">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Qefas Hub Admin Portal</p>
           </div>
        </div>
      </div>
    </div>
  );
}
