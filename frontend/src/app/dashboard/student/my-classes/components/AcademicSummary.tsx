'use client';

import { Sparkles, BookOpen, BarChart3, CalendarDays, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

interface AcademicSummaryProps {
  totalSubjects: number;
  totalMarks: number;
  classPosition: string | null;
  onOpenJoinModal?: () => void;
}

export function AcademicSummary({ totalSubjects, totalMarks, classPosition, onOpenJoinModal }: AcademicSummaryProps) {
  return (
    <section className="
      relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12
      flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12
      shadow-xl
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      dark:bg-gradient-to-br dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950
      border border-slate-700/50 dark:border-zinc-800
    ">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl sm:rounded-[2.5rem]">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-pink-500/20 dark:bg-pink-600/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rose-500/15 dark:bg-rose-700/15 blur-3xl" />
      </div>

      {/* Decorative background watermark */}
      <div className="absolute top-0 right-0 p-8 sm:p-14 opacity-5 dark:opacity-[0.03] pointer-events-none rotate-12">
        <Sparkles size={320} className="text-white" />
      </div>

      {/* Left: text content */}
      <div className="space-y-4 sm:space-y-6 max-w-xl relative z-10 text-center lg:text-left w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30">
          <BookOpen size={12} className="text-pink-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-pink-300">
            Academic Registry
          </span>
          <HeaderTooltip 
            content="Summary of your registered classes, active curriculum subjects, and continuous performance standing." 
            className="text-pink-300 hover:text-white"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
          Curriculum &amp; <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200">
            Class Standing
          </span>
        </h2>

        <p className="text-slate-300 dark:text-zinc-400 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
          You are currently enrolled across your class cohort with{' '}
          <span className="text-white font-bold">
            {totalSubjects} core subject{totalSubjects !== 1 ? 's' : ''}
          </span>
          . Stay proactive with upcoming lectures, assignments, and term examinations.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 w-full sm:w-auto">
          {onOpenJoinModal && (
            <button
              type="button"
              onClick={onOpenJoinModal}
              className="
                w-full sm:w-auto inline-flex items-center justify-center gap-2
                rounded-xl px-6 h-11 font-bold text-xs uppercase tracking-wider
                transition-all duration-300 ease-out cursor-pointer
                text-white bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-600/30
                hover:scale-[1.02] active:scale-[0.98]
              "
            >
              <Sparkles size={14} className="shrink-0" />
              Join Class
            </button>
          )}
          <Link href="/dashboard/student/timetable" className="w-full sm:w-auto">
            <button className="
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              rounded-xl px-5 h-11 font-bold text-xs uppercase tracking-wider
              transition-all duration-300 ease-out cursor-pointer
              text-slate-200 bg-white/10 border border-white/20 hover:bg-white/15
              backdrop-blur-sm
            ">
              <CalendarDays size={14} className="shrink-0" />
              Class Timetable
            </button>
          </Link>
          <Link href="/dashboard/student/exams&quizzes" className="w-full sm:w-auto">
            <button className="
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              rounded-xl px-5 h-11 font-bold text-xs uppercase tracking-wider
              transition-all duration-300 ease-out cursor-pointer
              text-slate-200 bg-white/10 border border-white/20 hover:bg-white/15
              backdrop-blur-sm
            ">
              <GraduationCap size={14} className="shrink-0" />
              Assessments &amp; CA
            </button>
          </Link>
        </div>
      </div>

      {/* Right: stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full lg:w-auto relative z-10 shrink-0">
        {/* Total Marks */}
        <div className="
          p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] text-center space-y-1.5 backdrop-blur-md transition-all duration-300
          bg-white/5 border border-white/10 hover:bg-white/10
          dark:bg-zinc-900/60 dark:border-zinc-800
          shadow-lg flex flex-col items-center justify-center min-w-[130px] sm:min-w-[160px]
        ">
          <div className="flex justify-center mb-1">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <BarChart3 size={15} className="text-pink-400" />
            </div>
          </div>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-400">
            Total Points
          </p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            {totalMarks > 0 ? totalMarks.toLocaleString() : '—'}
          </p>
          {totalMarks === 0 && (
            <p className="text-[9px] text-slate-500 dark:text-zinc-500 font-semibold uppercase tracking-wide">
              No scores yet
            </p>
          )}
        </div>

        {/* Position */}
        <div className="
          p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] text-center space-y-1.5 backdrop-blur-md transition-all duration-300
          bg-white/5 border border-white/10 hover:bg-white/10
          dark:bg-zinc-900/60 dark:border-zinc-800
          shadow-lg flex flex-col items-center justify-center min-w-[130px] sm:min-w-[160px]
        ">
          <div className="flex justify-center mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sparkles size={15} className="text-amber-400" />
            </div>
          </div>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-400">
            Stream Rank
          </p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            {classPosition ?? '—'}
          </p>
          {!classPosition && (
            <p className="text-[9px] text-slate-500 dark:text-zinc-500 font-semibold uppercase tracking-wide">
              Pending publish
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
