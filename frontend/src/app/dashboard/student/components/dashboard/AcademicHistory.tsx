'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { HeaderTooltip } from './HeaderTooltip';

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
    <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-none relative overflow-hidden group">
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 relative z-10">
        <div>
           <div className="flex items-center gap-2">
             <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
               Academic <span className="text-pink-600 dark:text-pink-400">History</span>
             </h3>
             <HeaderTooltip content="Verified examination logs showing your latest 5 exam attempts, calculated WAEC-standard letter grades (A1, C5, F9), and score percentages." />
           </div>
           <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Verified Performance Records</p>
        </div>
        <div className="p-2.5 sm:p-3 bg-pink-500/10 rounded-xl sm:rounded-2xl shrink-0">
           <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />
        </div>
      </div>

      <div className="relative z-10 space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 sm:h-24 rounded-2xl sm:rounded-3xl bg-slate-100 dark:bg-zinc-900 animate-pulse border border-slate-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : !attempts || attempts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-slate-50/50 dark:bg-zinc-900/40 rounded-2xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 p-4">
             <Trophy className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
             <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">No records found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {attempts.slice(0, 5).map((attempt, idx) => {
              const scorePercent = Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100);
              return (
                <motion.div 
                  key={attempt.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/80 hover:border-pink-500/30 dark:hover:border-pink-500/30 rounded-2xl sm:rounded-[1.8rem] p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-6 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                    <div className="shrink-0 h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 group-hover:scale-105 transition-all shadow-sm border border-slate-100 dark:border-zinc-700">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Badge className={cn(
                          "px-2 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border-none shadow-sm",
                          scorePercent >= 75 ? "bg-emerald-500 text-white" : scorePercent >= 50 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                        )}>
                          {scorePercent >= 75 ? 'A1' : scorePercent >= 50 ? 'C5' : 'F9'}
                        </Badge>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-tight">
                          • {format(new Date(attempt.submittedAt), "MMM d")}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate tracking-tight uppercase italic group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors capitalize">
                        {attempt.exam?.title?.toLowerCase() || 'Exam Attempt'}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{scorePercent}%</p>
                    </div>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover:scale-105 transition-all shadow">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
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
