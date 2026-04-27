'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AcademicHistoryProps {
  attempts: any[];
  isLoading: boolean;
}

const AcademicHistory: React.FC<AcademicHistoryProps> = ({ attempts, isLoading }) => {
  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none min-h-[400px] relative overflow-hidden group h-full">
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
           <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Academic <span className="text-pink-600">History</span></h3>
           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Verified Performance Records</p>
        </div>
        <div className="p-3 bg-pink-500/10 rounded-2xl">
           <Trophy className="w-5 h-5 text-pink-600" />
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : attempts?.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-950/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <Trophy className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No records found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {attempts?.slice(0, 5).map((attempt, idx) => {
              const scorePercent = Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100);
              return (
                <motion.div 
                  key={attempt.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-slate-50/50 dark:bg-slate-950/40 border border-transparent hover:border-pink-500/20 rounded-[1.8rem] p-5 flex items-center justify-between gap-6 hover:bg-white dark:hover:bg-slate-900 transition-all duration-500 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="shrink-0 h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-pink-600 group-hover:scale-110 transition-all shadow-sm border border-slate-100 dark:border-slate-800">
                        <Trophy size={24} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-sm",
                          scorePercent >= 75 ? "bg-emerald-500 text-white" : scorePercent >= 50 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                        )}>
                          {scorePercent >= 75 ? 'A1' : scorePercent >= 50 ? 'C5' : 'F9'}
                        </Badge>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter opacity-70">• {format(new Date(attempt.submittedAt), "MMM d")}</span>
                      </div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white truncate tracking-tight uppercase italic group-hover:text-pink-600 transition-colors capitalize">{attempt.exam.title.toLowerCase()}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{scorePercent}%</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover:scale-110 transition-all shadow-lg">
                        <ChevronRight size={20} />
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
