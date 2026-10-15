import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TeacherLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      {/* Mobile Dynamic Background Orbs */}
      <div className="absolute inset-0 md:hidden overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[20%] w-[85%] h-[60%] rounded-full bg-emerald-500/20 dark:bg-emerald-600/15 blur-[100px]" />
        <div className="absolute top-[50%] -right-[30%] w-[90%] h-[70%] rounded-full bg-teal-500/20 dark:bg-teal-600/10 blur-[120px]" />
      </div>

      {/* Background Image Layer for Left Side (Desktop) */}
      <div className="absolute inset-0 hidden md:block w-[46%] lg:w-[50%]">
        <LeftPanel />
      </div>

      <div className="relative z-10 w-full flex">
        {/* Left Side spacer */}
        <div className="hidden md:block md:w-[46%] lg:w-[50%]"></div>
        
        {/* Right Side Form Container */}
        <div className="w-full md:w-[54%] lg:w-[50%] min-h-screen flex flex-col justify-center items-center px-2.5 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:bg-white/50 md:dark:bg-slate-950/50 backdrop-blur-sm md:backdrop-blur-none">
          {/* Back Button */}
          <div className="w-full max-w-[680px] mb-6 sm:mb-8">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group cursor-pointer"
            >
              <div className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 group-hover:shadow-md transition-all group-hover:-translate-x-1">
                <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </div>
              <span>Back to Portals</span>
            </Link>
          </div>
          
          {/* Main Login Card - Expands inputs and buttons to 580px+ width */}
          <div className="w-full max-w-[680px] bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-emerald-950/10 dark:shadow-none border border-slate-100 dark:border-slate-800 px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <RightPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
