'use client';

import { BarChart3, TrendingUp, Sparkles, Activity, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import DonutChart from './DonutChart';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AcademicChartProps {
    analysis?: {
        averageScore: number;
        totalAssessments: number;
        subjectBreakdown: { name: string; average: number }[];
        insight: string;
    };
    isLoading?: boolean;
}

export default function AcademicChart({ analysis, isLoading }: AcademicChartProps) {
  const chartData = useMemo(() => {
    if (!analysis || !analysis.subjectBreakdown) return [
        { name: 'Excellence Rank', value: 0, color: '#10B981' },
        { name: 'Competency Rank', value: 0, color: '#3B82F6' },
        { name: 'Risk Assessment', value: 0, color: '#F43F5E' },
    ];

    const excellentCount = analysis.subjectBreakdown.filter(s => s.average >= 70).length;
    const goodCount = analysis.subjectBreakdown.filter(s => s.average >= 50 && s.average < 70).length;
    const atRiskCount = analysis.subjectBreakdown.filter(s => s.average < 50).length;
    const total = excellentCount + goodCount + atRiskCount || 1;

    return [
      { name: 'Excellence Rank', value: Math.round((excellentCount / total) * 100), color: '#10B981' },
      { name: 'Competency Rank', value: Math.round((goodCount / total) * 100), color: '#3B82F6' },
      { name: 'Risk Assessment', value: Math.round((atRiskCount / total) * 100), color: '#F43F5E' },
    ];
  }, [analysis]);

  const topSubject = useMemo(() => {
    if (!analysis?.subjectBreakdown || analysis.subjectBreakdown.length === 0) return null;
    return [...analysis.subjectBreakdown].sort((a, b) => b.average - a.average)[0];
  }, [analysis]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "relative overflow-hidden group",
        "bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl",
        "rounded-[3rem] border border-white/20 dark:border-slate-800/50",
        "shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10",
        "flex flex-col h-full transition-all duration-500 hover:shadow-primary/10"
      )}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-700" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-colors duration-700" />

      {/* Header Section */}
      <div className="relative z-10 flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Institutional Intelligence</span>
          </div>
          <h3 className="font-black text-3xl text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
            Academic Performance
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">Holistic mastery breakdown across all departments</p>
        </div>
        
        <div className="flex gap-2">
           <button className="h-12 w-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 text-slate-500 hover:text-primary hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-sm">
            <Activity size={20} />
          </button>
           <button className="h-12 w-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 flex items-center justify-center transition-all">
            <Sparkles size={20} />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Donut Chart Container */}
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl scale-125" />
          {isLoading ? (
            <div className="h-56 w-56 rounded-full border-[12px] border-slate-100 dark:border-slate-800 animate-pulse flex items-center justify-center shadow-inner" />
          ) : (
            <DonutChart
              data={chartData}
              innerRadius={70}
              outerRadius={95}
              centerLabel={{
                title: 'Overall Avg',
                value: analysis ? `${analysis.averageScore}%` : '--',
              }}
            />
          )}
        </div>

        {/* Intelligence Grid */}
        <div className="flex flex-col gap-6 w-full max-w-2xl mt-4">
          {/* Legend Items */}
          <div className="grid grid-cols-1 gap-3">
            {chartData.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl border border-white/10 dark:border-slate-700/30 group/item transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="size-3.5 rounded-full shadow-lg"
                    style={{ 
                        backgroundColor: item.color,
                        boxShadow: `0 0 15px ${item.color}40`
                    }}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-bold">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <span className="font-black text-slate-900 dark:text-white text-base">
                    {item.value}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium Mini Cards */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-5 rounded-[2rem] bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 dark:from-emerald-500/10 dark:to-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/20 backdrop-blur-xl relative overflow-hidden"
            >
                <Award className="absolute -right-2 -bottom-2 h-16 w-16 text-emerald-500/10 -rotate-12" />
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Dominant Subject</p>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate relative z-10">
                    {topSubject ? topSubject.name : "Analyzing..."}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                   <TrendingUp size={12} className="text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-600">{topSubject?.average || 0}% Avg Score</span>
                </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-5 rounded-[2rem] bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/10 dark:border-primary/20 backdrop-blur-xl relative overflow-hidden"
            >
                <ShieldCheck className="absolute -right-2 -bottom-2 h-16 w-16 text-primary/10 -rotate-12" />
                <p className="text-[9px] font-black uppercase tracking-widest text-primary dark:text-primary mb-2">Institutional Health</p>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate relative z-10">
                    {analysis?.totalAssessments || 0} Assessments
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                   <span className="text-[10px] font-black text-primary">Stable Trajectory</span>
                </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="mt-10 pt-6 border-t border-slate-200/30 dark:border-slate-800/50 flex items-center justify-between relative z-10">
         <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900" />
                ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400">Monitoring 45,000+ Student Data Points</p>
         </div>
         <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-white/5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Live AI Core</span>
         </div>
      </div>
    </motion.div>
  );
}

