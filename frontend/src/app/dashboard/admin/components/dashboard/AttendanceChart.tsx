'use client';

import { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useSchoolPerformanceAnalysis, useSchoolStats } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, TrendingUp, Lightbulb, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

type ChartDataItem = { name: string; value: number; fullLabel: string };

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-xl">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.fullLabel}</p>
        <p className="text-base font-black text-slate-900 dark:text-white">{payload[0].value}% <span className="text-[10px] font-bold text-slate-400">Avg</span></p>
      </div>
    );
  }
  return null;
};

export default function AcademicPerformanceChart({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';

  const { data: schoolStatsData } = useSchoolStats(schoolId);
  const { data: analysis, isLoading } = useSchoolPerformanceAnalysis(schoolId, schoolStatsData);

  const chartData: ChartDataItem[] = useMemo(() => {
    if (!analysis?.subjectBreakdown) return [];
    return analysis.subjectBreakdown.map((s: any) => ({
      name: s.name.substring(0, 4),
      value: Math.round(s.average),
      fullLabel: s.name,
    }));
  }, [analysis]);

  const stats = useMemo(() => {
    if (!chartData.length) return { avg: 0, best: { value: 0, fullLabel: 'N/A' } };
    const values = chartData.map((d) => d.value);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const best = chartData.reduce((p, c) => (p.value > c.value ? p : c));
    return { avg, best };
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden group bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-slate-800/50 p-6 md:p-8 flex flex-col"
      style={{ boxShadow: `0 20px 40px -12px ${primaryColor}12` } as any}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" style={{ backgroundColor: primaryColor }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor }} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>Student Grades</span>
          </div>
          <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tighter">Student Performance</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
            <TrendingUp size={16} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 h-[160px] mb-5">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-2xl" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dx={-5} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: `${primaryColor}08`, radius: 8 }} />
              <Bar dataKey="value" radius={[8, 8, 3, 3]} barSize={24} animationBegin={200} animationDuration={1500}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value >= 70 ? '#10B981' : entry.value >= 40 ? primaryColor : '#F43F5E'} fillOpacity={0.85} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <BookOpen size={22} className="text-slate-300" />
            </div>
            <div>
              <p className="font-black text-xs tracking-tight">No performance data</p>
              <p className="font-bold text-[10px] text-slate-400 mt-0.5">Awaiting assessment inputs</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={11} className="text-emerald-500" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Best Subject</span>
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white leading-none">{stats.best.value}%</p>
          <p className="text-[9px] font-bold text-slate-500 truncate mt-0.5">{stats.best.fullLabel}</p>
        </div>
        <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={11} style={{ color: primaryColor }} />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">School Avg</span>
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white leading-none">{stats.avg}%</p>
          <p className="text-[9px] font-bold text-slate-500 mt-0.5">All subjects</p>
        </div>
      </div>

      {/* Insight strip */}
      {analysis?.insight && (
        <div
          className="relative z-10 flex items-start gap-3 p-3 rounded-2xl border"
          style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}15` }}
        >
          <div className="h-7 w-7 shrink-0 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm" style={{ color: primaryColor }}>
            <Lightbulb size={14} />
          </div>
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-2">
            "{analysis.insight}"
          </p>
        </div>
      )}
    </motion.div>
  );
}
