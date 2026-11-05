import React from 'react';
import {
  TestTube2,
  Calculator,
  Globe,
  Calendar,
  Clock,
  Award,
  FileText,
  BookOpen,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { groupByDate } from '../../../utils/dateSectioning';

export interface ExamItem {
  id: string;
  title?: string;
  subject: string;
  date: string;
  rawDate?: string | null;
  type: string;
  status?: string;
  totalMarks?: number | null;
  durationMinutes?: number | null;
}

interface UpcomingExamsProps {
  exams: ExamItem[];
}

const UpcomingExams: React.FC<UpcomingExamsProps> = ({ exams }) => {
  const params = useParams();
  const classId = params.classId as string;

  const getSubjectIcon = (subject: string) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('bio') || s.includes('chem') || s.includes('phy') || s.includes('sci')) {
      return <TestTube2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (s.includes('math') || s.includes('calc') || s.includes('econ') || s.includes('acc')) {
      return <Calculator className="size-4.5 text-blue-600 dark:text-blue-400" />;
    }
    if (s.includes('geo') || s.includes('gov') || s.includes('hist') || s.includes('civic')) {
      return <Globe className="size-4.5 text-amber-600 dark:text-amber-400" />;
    }
    if (s.includes('eng') || s.includes('lit') || s.includes('lang')) {
      return <BookOpen className="size-4.5 text-purple-600 dark:text-purple-400" />;
    }
    return <FileText className="size-4.5 text-emerald-600 dark:text-emerald-400" />;
  };

  const getCategoryBadge = (type: string) => {
    const t = (type || 'EXAM').toUpperCase();
    if (t.includes('QUIZ')) {
      return {
        label: 'Quiz',
        style: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
      };
    }
    if (t.includes('CA') || t.includes('MID')) {
      return {
        label: 'Continuous Assessment',
        style: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
      };
    }
    return {
      label: 'Official Exam',
      style: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
    };
  };

  if (!exams || exams.length === 0) {
    return (
      <div className="bg-white dark:bg-emerald-950/40 p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-emerald-800/50 shadow-sm flex flex-col items-center justify-center text-center py-10 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
          <Calendar size={22} />
        </div>
        <p className="text-sm font-black text-slate-800 dark:text-white">No Upcoming Exams</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] mx-auto font-medium">
          No exams or scheduled assessments are pending for this class cohort.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-emerald-950/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Calendar className="size-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                Upcoming Exams
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Scheduled tests & assessments
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {exams.length} Active
          </span>
        </div>

        {/* Exams List */}
        <div className="flex flex-col gap-3">
          {groupByDate(exams, (e) => e.rawDate || e.date).map((group) => (
            <div key={group.label} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{group.label}</span>
                <span className="h-px flex-1 bg-slate-100 dark:bg-emerald-900/40" />
              </div>
              {group.items.map((exam) => {
                const badge = getCategoryBadge(exam.type);
                const displayTitle = exam.title || exam.subject || 'Class Assessment';

                return (
                  <div
                    key={exam.id}
                    className="group p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-emerald-950/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 border border-slate-200/70 dark:border-emerald-800/40 transition-all duration-200 flex flex-col gap-2.5"
                  >
                    {/* Top line: Icon + Title + Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-9 rounded-xl bg-white dark:bg-emerald-900/50 border border-slate-200/80 dark:border-emerald-700/50 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {getSubjectIcon(exam.subject)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {displayTitle}
                          </p>
                          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                            {exam.subject}
                          </p>
                        </div>
                      </div>

                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-lg border shrink-0 whitespace-nowrap",
                        badge.style
                      )}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Bottom line: Date + Optional Duration / Marks */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-emerald-900/40 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{exam.date}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                        {exam.durationMinutes && (
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="size-3" />
                            {exam.durationMinutes}m
                          </span>
                        )}
                        {exam.totalMarks && (
                          <span className="flex items-center gap-1 font-semibold">
                            <Award className="size-3 text-amber-500" />
                            {exam.totalMarks} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link to full exams tab */}
      {classId && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-900/40">
          <Link
            href={`/dashboard/teacher/my-classes/${classId}?tab=exams%26quizzes`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100/70 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all"
          >
            <span>View All Class Assessments</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingExams;