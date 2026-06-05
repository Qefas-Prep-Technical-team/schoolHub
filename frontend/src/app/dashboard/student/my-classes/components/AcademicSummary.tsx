import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AcademicSummaryProps {
  totalSubjects: number;
  totalMarks: number;
  classPosition: string | null;
}

export function AcademicSummary({ totalSubjects, totalMarks, classPosition }: AcademicSummaryProps) {
  return (
    <section className="bg-slate-900 dark:bg-white rounded-[3.5rem] p-10 md:p-16 text-white dark:text-slate-900 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative mt-8 shadow-2xl">
      <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none rotate-12">
        <Sparkles size={400} />
      </div>

      <div className="space-y-6 max-w-lg relative z-10 text-center lg:text-left">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
          Academic <br /> Performance
        </h2>
        <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
          You&apos;re currently registered for{' '}
          <span className="text-white dark:text-slate-900 font-black">
            {totalSubjects} core subject{totalSubjects !== 1 ? 's' : ''}
          </span>
          . Focus on maintaining a strong continuous assessment record this term.
        </p>
        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          <Link href="/dashboard/student/schedule">
            <Button className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
              Timetable
            </Button>
          </Link>
          <Link href="/dashboard/student/exams&quizzes">
            <Button
              variant="outline"
              className="rounded-full px-8 h-12 border-slate-700 text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 dark:hover:bg-slate-100 dark:hover:text-slate-900 transition-colors"
            >
              Exams &amp; CA
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full lg:w-auto relative z-10">
        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 dark:bg-slate-50 dark:border-slate-200/50 text-center space-y-2 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Marks</p>
          <p className="text-5xl font-black tracking-tighter">
            {totalMarks > 0 ? totalMarks.toLocaleString() : '—'}
          </p>
          {totalMarks === 0 && (
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">No attempts yet</p>
          )}
        </div>
        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 dark:bg-slate-50 dark:border-slate-200/50 text-center space-y-2 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Position</p>
          <p className="text-5xl font-black tracking-tighter">
            {classPosition ?? '—'}
          </p>
          {!classPosition && (
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Coming soon</p>
          )}
        </div>
      </div>
    </section>
  );
}
