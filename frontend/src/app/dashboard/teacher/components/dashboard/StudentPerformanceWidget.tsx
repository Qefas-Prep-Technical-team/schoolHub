'use client';

import { useState } from 'react';
import { User, Award, BarChart3, TrendingUp, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface StudentPerformanceWidgetProps {
  performanceMetrics: {
    topStudents: Array<{
      id: string;
      name: string;
      studentCode?: string;
      image?: string;
      average: number;
    }>;
    distribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  };
}

export default function StudentPerformanceWidget({ performanceMetrics }: StudentPerformanceWidgetProps) {
  const { topStudents, distribution } = performanceMetrics;
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(topStudents.length / itemsPerPage));
  
  const currentStudents = topStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalStudents = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  const getDistributionWidth = (count: number) => {
    if (totalStudents === 0) return '0%';
    return `${(count / totalStudents) * 100}%`;
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm h-full transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Pulse
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Top Performer Tracking
          </p>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
          <BarChart3 className="w-5 h-5 text-slate-500" />
        </div>
      </div>

      {/* Top Students Section */}
      <div className="space-y-4 mb-4">
        {topStudents.length > 0 ? (
          currentStudents.map((student, index) => {
            const overallIndex = (currentPage - 1) * itemsPerPage + index;
            return (
              <motion.div 
                key={student.id} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between group p-3 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-500"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-all duration-500 shadow-sm">
                      {student.image ? (
                        <Image src={student.image} alt={student.name} fill className="object-cover" />
                      ) : (
                        <span className="text-sm font-black text-emerald-600 uppercase">
                          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 scale-90">
                      <span className="text-[10px] font-black italic">{overallIndex + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
                      {student.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{student.studentCode || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-base font-black text-emerald-600">
                    {student.average}%
                  </span>
                  <div className="flex items-center text-[7px] font-black text-emerald-500/70 border border-emerald-500/20 px-1.5 py-0.5 rounded-full mt-1.5 uppercase tracking-tighter">
                     Elite
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
             <Star className="w-8 h-8 text-slate-300 mx-auto mb-3 opacity-50" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Awaiting Leaderboard Data</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {topStudents.length > itemsPerPage && (
        <div className="mb-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Grade Distribution Section */}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Class Distribution</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {[
            { label: 'Grade A', count: distribution.A, color: 'bg-emerald-600' },
            { label: 'Grade B', count: distribution.B, color: 'bg-emerald-400/70' },
            { label: 'Grade C', count: distribution.C, color: 'bg-teal-500/50' },
            { label: 'Grade D/F', count: distribution.D + distribution.F, color: 'bg-slate-300' },
          ].map((item) => (
            <div key={item.label} className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-tighter">{item.label}</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.count}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: getDistributionWidth(item.count) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
