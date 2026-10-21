"use client";

import { Clock, BookOpen, GraduationCap, FileQuestion, AlertCircle } from "lucide-react";

interface ExamInfoProps {
  examData: {
    class: string;
    duration: number;
    subject: string;
    totalQuestions: number;
  };
  isLoading?: boolean;
}

export default function ExamInfo({ examData, isLoading }: ExamInfoProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3 sm:p-5 shadow-sm backdrop-blur-sm">
      {/* 2x2 Grid on Mobile, 4-Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Class */}
        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Class
            </p>
            {isLoading ? (
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {examData.class}
              </p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Duration
            </p>
            {isLoading ? (
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {examData.duration} Mins
              </p>
            )}
          </div>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Subject
            </p>
            {isLoading ? (
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {examData.subject}
              </p>
            )}
          </div>
        </div>

        {/* Total Questions */}
        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileQuestion className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Questions
            </p>
            {isLoading ? (
              <div className="h-4 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {examData.totalQuestions} Items
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Mode Notice */}
      <div className="mt-2.5 sm:mt-3 px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl flex items-center gap-2 sm:gap-2.5 text-left">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
          <span className="font-bold">Student Simulator:</span> Questions and options match live examination mode. Answers are simulated and will not affect records.
        </p>
      </div>
    </div>
  );
}
