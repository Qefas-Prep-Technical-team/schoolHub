"use client";
import LoginCard from "./components/LoginCard";
import PreviewImage from "./components/PreviewImage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full bg-[#e0e7ff] dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      {/* Background Image Layer for Left Side */}
      <div className="absolute inset-0 hidden md:block w-[55%] lg:w-[60%]">
        <PreviewImage />
      </div>

      <div className="relative z-10 w-full flex">
        {/* Left Side spacer */}
        <div className="hidden md:block md:w-[55%] lg:w-[60%]"></div>
        
        {/* Right Side Form */}
        <div className="w-full md:w-[45%] lg:w-[40%] min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 py-12 bg-white/40 dark:bg-slate-950/80 md:bg-transparent md:dark:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
           {/* Back Button */}
           <div className="w-full max-w-[550px] mb-8">
             <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-full w-max">
               <ArrowLeft className="w-4 h-4" />
               Back to Portals
             </Link>
           </div>
           
           {/* Card */}
           <div className="w-full max-w-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none dark:border dark:border-slate-800 p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <LoginCard />
           </div>
        </div>
      </div>
    </div>
  );
}
