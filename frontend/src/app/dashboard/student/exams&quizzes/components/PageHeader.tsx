import { FileText, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default function PageHeader() {
  return (
    <div className="mb-10 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <Link href="/dashboard/student" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home size={12} />
          Dashboard
        </Link>
        <ChevronRight size={10} />
        <span className="text-slate-500 dark:text-slate-300">Exams & Quizzes</span>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    <FileText size={28} />
                </div>
                Assessments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Track your progress, view upcoming exams, and analyze your performance.
            </p>
        </div>
      </div>
    </div>
  );
}