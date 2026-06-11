import { Sparkles, BookOpen, BarChart3, CalendarDays, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface AcademicSummaryProps {
  totalSubjects: number;
  totalMarks: number;
  classPosition: string | null;
}

export function AcademicSummary({ totalSubjects, totalMarks, classPosition }: AcademicSummaryProps) {
  return (
    <section className="
      relative overflow-hidden mt-8 rounded-[3rem] p-10 md:p-16
      flex flex-col lg:flex-row items-center justify-between gap-12
      shadow-2xl
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      dark:bg-none dark:bg-gradient-to-br dark:from-indigo-950 dark:via-slate-900 dark:to-slate-900
      border border-white/5 dark:border-indigo-500/10
    ">
      {/* Ambient glow — light mode: subtle blue, dark mode: indigo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem]">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 dark:bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-violet-500/10 dark:bg-violet-700/20 blur-3xl" />
      </div>

      {/* Decorative icon */}
      <div className="absolute top-0 right-0 p-16 opacity-5 dark:opacity-[0.04] pointer-events-none rotate-12">
        <Sparkles size={380} className="text-white" />
      </div>

      {/* Left: text content */}
      <div className="space-y-6 max-w-lg relative z-10 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 dark:bg-indigo-500/20 border border-primary/30 dark:border-indigo-400/30 mb-1">
          <BookOpen size={12} className="text-primary dark:text-indigo-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-indigo-300">
            Academic Overview
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight text-white">
          Academic <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400 dark:from-indigo-300 dark:to-violet-300">
            Performance
          </span>
        </h2>

        <p className="text-slate-400 dark:text-slate-400 font-medium leading-relaxed">
          You&apos;re currently registered for{' '}
          <span className="text-white font-black">
            {totalSubjects} core subject{totalSubjects !== 1 ? 's' : ''}
          </span>
          . Focus on maintaining a strong continuous assessment record this term.
        </p>

        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
          <Link href="/dashboard/student/schedule">
            <button className="
              inline-flex items-center gap-2
              rounded-full px-7 h-11 font-black uppercase tracking-widest text-[10px]
              transition-all duration-300 ease-out cursor-pointer
              text-white
              bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30
              dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-500
              dark:hover:from-indigo-400 dark:hover:to-violet-400
              dark:shadow-[0_0_20px_rgba(99,102,241,0.45)]
              dark:hover:shadow-[0_0_28px_rgba(99,102,241,0.65)]
              dark:hover:scale-[1.03]
            ">
              <CalendarDays size={13} className="shrink-0" />
              Timetable
            </button>
          </Link>
          <Link href="/dashboard/student/exams&quizzes">
            <button className="
              inline-flex items-center gap-2
              rounded-full px-7 h-11 font-black uppercase tracking-widest text-[10px]
              transition-all duration-300 ease-out cursor-pointer
              text-white
              bg-white/5 border border-white/20 hover:bg-white/12
              dark:bg-white/5 dark:border-indigo-400/30 dark:hover:bg-indigo-500/10 dark:hover:border-indigo-400/50
              backdrop-blur-sm
            ">
              <GraduationCap size={13} className="shrink-0" />
              Exams &amp; CA
            </button>
          </Link>
        </div>
      </div>

      {/* Right: stat cards */}
      <div className="grid grid-cols-2 gap-5 w-full lg:w-auto relative z-10">
        {/* Total Marks */}
        <div className="
          group p-7 rounded-[2rem] text-center space-y-2 backdrop-blur-md transition-all duration-300
          bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
          dark:bg-indigo-500/5 dark:border-indigo-400/15 dark:hover:bg-indigo-500/10 dark:hover:border-indigo-400/25
          shadow-lg
        ">
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 dark:bg-indigo-500/20 flex items-center justify-center">
              <BarChart3 size={14} className="text-primary dark:text-indigo-300" />
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Total Marks
          </p>
          <p className="text-4xl font-black tracking-tighter text-white">
            {totalMarks > 0 ? totalMarks.toLocaleString() : '—'}
          </p>
          {totalMarks === 0 && (
            <p className="text-[9px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-wide">
              No attempts yet
            </p>
          )}
        </div>

        {/* Position */}
        <div className="
          group p-7 rounded-[2rem] text-center space-y-2 backdrop-blur-md transition-all duration-300
          bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
          dark:bg-violet-500/5 dark:border-violet-400/15 dark:hover:bg-violet-500/10 dark:hover:border-violet-400/25
          shadow-lg
        ">
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 dark:bg-violet-500/20 flex items-center justify-center">
              <Sparkles size={14} className="text-violet-400 dark:text-violet-300" />
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Position
          </p>
          <p className="text-4xl font-black tracking-tighter text-white">
            {classPosition ?? '—'}
          </p>
          {!classPosition && (
            <p className="text-[9px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-wide">
              Coming soon
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
