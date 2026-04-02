'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useSchoolPerformanceAnalysis } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, TrendingUp, Filter, MoreHorizontal, Lightbulb, Zap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.fullLabel}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">{payload[0].value}% <span className="text-xs font-bold text-slate-400">Avg</span></p>
      </div>
    );
  }
  return null;
};

export default function AcademicPerformanceChart() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || '';
  
  const { data: analysis, isLoading } = useSchoolPerformanceAnalysis(schoolId);

  const chartData = useMemo(() => {
    if (!analysis?.subjectBreakdown) return [];
    return analysis.subjectBreakdown.map((s: any) => ({
      name: s.name.substring(0, 3), 
      value: Math.round(s.average),
      fullLabel: s.name
    }));
  }, [analysis]);

  const stats = useMemo(() => {
    if (!chartData.length) return { avg: 0, best: { value: 0, fullLabel: 'N/A' }, worst: { value: 0, fullLabel: 'N/A' } };
    const values = chartData.map(d => d.value);
    const avg = Math.round(values.reduce((a, b: number) => a + b, 0) / values.length);
    const best = chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current);
    const worst = chartData.reduce((prev, current) => (prev.value < current.value) ? prev : current);
    return { avg, best, worst };
  }, [chartData]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "relative overflow-hidden group h-full",
        "bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl",
        "rounded-[3rem] border border-white/20 dark:border-slate-800/50",
        "shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10",
        "flex flex-col transition-all duration-500 hover:shadow-indigo-500/10"
      )}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Competency Metrics</span>
          </div>
          <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">
            Academic Trends
          </h3>
        </div>
        <div className="flex gap-2">
           <button className="h-10 w-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors">
              <Filter size={16} />
           </button>
           <button className="h-10 w-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors">
              <MoreHorizontal size={16} />
           </button>
        </div>
      </div>

      {/* Chart Main Display */}
      <div className="flex-1 relative min-h-[250px] mb-8">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col gap-4">
             <Skeleton className="h-full w-full rounded-3xl" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
             <RechartsBarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dx={-5}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 12 }} />
                <Bar 
                  dataKey="value" 
                  radius={[12, 12, 4, 4]} 
                  barSize={32}
                  animationBegin={200}
                  animationDuration={2000}
                >
                   {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value >= 70 ? '#10B981' : entry.value >= 40 ? '#6366F1' : '#F43F5E'} 
                        fillOpacity={0.8}
                      />
                   ))}
                </Bar>
             </RechartsBarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
               <BookOpen size={32} />
            </div>
            <p className="font-bold text-sm tracking-tight">Awaiting assessment inputs for Trend Generation</p>
          </div>
        )}
      </div>

      {/* Summary Micro-Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-[2rem] bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-800/50 backdrop-blur-md">
             <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Best Performance</span>
             </div>
             <p className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1">{stats.best.value}%</p>
             <p className="text-[10px] font-bold text-slate-500 capitalize truncate">{stats.best.fullLabel}</p>
          </div>
          <div className="p-4 rounded-[2rem] bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-800/50 backdrop-blur-md">
             <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Avg Standing</span>
             </div>
             <p className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1">{stats.avg}%</p>
             <p className="text-[10px] font-bold text-slate-500">Core Benchmark</p>
          </div>
      </div>

      {/* Bottom Insight Section */}
      <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/10 backdrop-blur-md flex items-start gap-4 transition-transform hover:scale-[1.02] duration-300">
        <div className="h-10 w-10 shrink-0 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-500 shadow-sm">
           <Lightbulb size={20} />
        </div>
        <div>
          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Observation</p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
            "{analysis?.insight || "Aggregate performance metrics are currently within expected institutional benchmarks."}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}