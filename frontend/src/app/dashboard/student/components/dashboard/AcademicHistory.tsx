'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Calendar, ArrowUpRight, Award, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { HeaderTooltip } from './HeaderTooltip';
import Link from 'next/link';

export interface HistoryAttempt {
  id: string;
  totalScore: number;
  totalMarks?: number;
  submittedAt: string | Date;
  exam: {
    title: string;
  };
}

interface AcademicHistoryProps {
  attempts: HistoryAttempt[];
  isLoading: boolean;
}

const AcademicHistory: React.FC<AcademicHistoryProps> = ({ attempts, isLoading }) => {
  return (
    <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 md:p-7 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Recent Assessment Grades
            </h3>
            <HeaderTooltip content="Verified examination logs showing your latest 5 exam attempts, calculated WAEC-standard letter grades (A1, C5, F9), and score percentages." />
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Verified performance records across evaluated subjects
          </p>
        </div>
        <Link
          href="/dashboard/student/result"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors shrink-0"
        >
          <span>View All Results</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-18 rounded-2xl bg-slate-100 dark:bg-zinc-900 animate-pulse border border-slate-200/50 dark:border-zinc-800" />
            ))}
          </div>
        ) : !attempts || attempts.length === 0 ? (
          <div className="text-center py-10 sm:py-12 bg-slate-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-6">
            <Trophy className="h-9 w-9 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-zinc-400 font-bold text-sm">No Assessment Records Found</p>
            <p className="text-slate-400 dark:text-zinc-500 text-xs mt-1">Completed tests and exams will appear here with score breakdowns.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            {attempts.slice(0, 5).map((attempt, idx) => {
              const totalPossible = attempt.totalMarks && attempt.totalMarks > 0 ? attempt.totalMarks : 100;
              const scorePercent = Math.min(100, Math.max(0, Math.round((attempt.totalScore / totalPossible) * 100)));

              // Standard Nigerian WAEC Grading Scheme
              const gradeConfig = (() => {
                if (scorePercent >= 75) {
                  return {
                    grade: 'A1',
                    label: 'Excellent',
                    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
                    barColor: 'bg-emerald-500',
                  };
                }
                if (scorePercent >= 70) {
                  return {
                    grade: 'B2',
                    label: 'Very Good',
                    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
                    barColor: 'bg-blue-500',
                  };
                }
                if (scorePercent >= 65) {
                  return {
                    grade: 'B3',
                    label: 'Good',
                    badgeBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
                    barColor: 'bg-indigo-500',
                  };
                }
                if (scorePercent >= 50) {
                  return {
                    grade: 'C5',
                    label: 'Credit',
                    badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
                    barColor: 'bg-amber-500',
                  };
                }
                if (scorePercent >= 45) {
                  return {
                    grade: 'D7',
                    label: 'Pass',
                    badgeBg: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
                    barColor: 'bg-orange-500',
                  };
                }
                if (scorePercent >= 40) {
                  return {
                    grade: 'E8',
                    label: 'Pass',
                    badgeBg: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
                    barColor: 'bg-orange-500',
                  };
                }
                return {
                  grade: 'F9',
                  label: 'Fail',
                  badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
                  barColor: 'bg-rose-500',
                };
              })();

              const formattedDate = (() => {
                try {
                  return format(new Date(attempt.submittedAt), "MMM d, yyyy");
                } catch {
                  return "Recent";
                }
              })();

              return (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group relative bg-slate-50/60 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 hover:border-pink-500/30 dark:hover:border-pink-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 shadow-none hover:shadow-md"
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Grade Badge */}
                    <div className={cn(
                      "shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black border transition-transform group-hover:scale-105",
                      gradeConfig.badgeBg
                    )}>
                      <span className="text-base leading-none tracking-tight">{gradeConfig.grade}</span>
                      <span className="text-[9px] uppercase font-bold opacity-80 leading-none mt-0.5">{gradeConfig.label}</span>
                    </div>

                    {/* Title & Metadata */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                          <Calendar size={12} className="text-slate-400 dark:text-zinc-500" />
                          {formattedDate}
                        </span>
                        <span className="text-slate-300 dark:text-zinc-700">•</span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                          {attempt.totalScore} / {totalPossible} pts
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate tracking-tight capitalize group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {attempt.exam?.title || 'Exam Assessment'}
                      </h4>
                    </div>
                  </div>

                  {/* Percentage Progress & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800">
                    <div className="w-28 sm:w-32 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500 dark:text-zinc-400 text-[11px]">Score</span>
                        <span className="font-black text-slate-900 dark:text-white">{scorePercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200/70 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", gradeConfig.barColor)}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/student/result`}
                      className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-pink-600 hover:text-white dark:bg-zinc-800 dark:hover:bg-pink-600 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-all shrink-0"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicHistory;
