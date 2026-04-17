'use client';

import { User, Award, BarChart3, TrendingUp, Star } from 'lucide-react';
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
  
  const totalStudents = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  const getDistributionWidth = (count: number) => {
    if (totalStudents === 0) return '0%';
    return `${(count / totalStudents) * 100}%`;
  };

  return (
    <div className="flex flex-col rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none h-full transition-all duration-500 hover:shadow-primary/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            Academic Performance
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Student Insights</p>
        </div>
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Top Students Section */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Top Performers</h3>
        </div>
        
        {topStudents.length > 0 ? (
          topStudents.map((student, index) => (
            <motion.div 
              key={student.id} 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-500">
                    {student.image ? (
                      <Image src={student.image} alt={student.name} fill className="object-cover" />
                    ) : (
                      <span className="text-xs font-black text-primary uppercase">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-lg border border-slate-50 dark:border-slate-800">
                    <span className="text-[10px] font-black text-primary">#{index + 1}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {student.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">#{student.studentCode || 'N/A'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {student.average}%
                </span>
                <div className="flex items-center text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded-md mt-1">
                  <Star className="w-2.5 h-2.5 mr-1 fill-current" />
                  <span>Elite</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Leaderboard Data</p>
          </div>
        )}
      </div>

      {/* Grade Distribution Section */}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Grade Distribution</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {[
            { label: 'Grade A', count: distribution.A, color: 'bg-emerald-500' },
            { label: 'Grade B', count: distribution.B, color: 'bg-blue-500' },
            { label: 'Grade C', count: distribution.C, color: 'bg-amber-500' },
            { label: 'Grade D/F', count: distribution.D + distribution.F, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="text-slate-900 dark:text-white">{item.count}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: getDistributionWidth(item.count) }}
                  transition={{ duration: 1, ease: "easeOut" }}
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
