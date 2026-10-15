'use client';

import { FileText, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { HeaderTooltip } from "@/app/dashboard/student/components/dashboard/HeaderTooltip";

export default function PageHeader() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
        <Link href="/dashboard/student" className="hover:text-pink-600 transition-colors flex items-center gap-1">
          <Home size={12} />
          Dashboard
        </Link>
        <ChevronRight size={10} />
        <span className="text-slate-600 dark:text-zinc-300">Exams &amp; Quizzes</span>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-pink-600 text-white shadow-lg shadow-pink-600/20 shrink-0">
              <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                Assessments
              </h1>
              <HeaderTooltip content="Central assessment hub for all your scheduled examinations, continuous assessments (CA), class quizzes, and homework assignments." />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium pl-1">
            Track your progress, view upcoming exams, and inspect question-by-question performance.
          </p>
        </div>
      </div>
    </div>
  );
}
