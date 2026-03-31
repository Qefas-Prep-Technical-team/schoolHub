'use client';

import ProgressCircle from '@/components/ui/ProgressCircle';
import { Award, Info } from 'lucide-react';

interface PerformanceChartProps {
  stats?: {
    averageScore: number;
    overallRank: number;
    totalStudentsInClass: number;
  };
}

export default function PerformanceChart({ stats }: PerformanceChartProps) {
  const performanceScore = stats?.averageScore || 0;
  const rank = stats?.overallRank || 0;
  const total = stats?.totalStudentsInClass || 0;

  const percentile = total > 0 ? Math.round((1 - (rank - 1) / total) * 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-primary/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/40 dark:backdrop-blur-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Award size={18} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider">Academic Standing</h3>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors cursor-help">
          <Info size={14} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative">
            <ProgressCircle
            value={performanceScore}
            size={190}
            strokeWidth={16}
            label={`${performanceScore}%`}
            sublabel="Avg Score"
            />
            {/* Subtle pulsator for the chart */}
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping -z-10" />
        </div>
        
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {rank > 0 ? `${percentile}% Percentile` : 'Overall Performance'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[210px] leading-relaxed font-medium">
            {rank > 0 ? (
              <>You are ranked <span className="text-emerald-500 font-black">#{rank}</span> out of {total} students in your class.</>
            ) : (
                'Complete more assessments to see your class ranking and comparative performance.'
            )}
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
    </div>
  );
}