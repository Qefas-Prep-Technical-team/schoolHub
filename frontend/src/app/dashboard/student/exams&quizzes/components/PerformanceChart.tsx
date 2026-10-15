'use client';

import ProgressCircle from '@/components/ui/ProgressCircle';
import { Award } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

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
    <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/80 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">Academic Standing</h3>
        </div>
        <HeaderTooltip content="Aggregated percentile and class ranking based on your continuous assessment scores relative to peer scholars." />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 my-2">
        <div className="relative">
          <ProgressCircle
            value={performanceScore}
            size={160}
            strokeWidth={14}
            label={`${performanceScore}%`}
            sublabel="Avg Score"
          />
          <div className="absolute inset-0 rounded-full bg-pink-500/5 animate-ping -z-10" />
        </div>
        
        <div className="mt-4 sm:mt-6 text-center space-y-1.5">
          <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            {rank > 0 ? `${percentile}% Percentile` : 'Overall Performance'}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-[220px] leading-relaxed font-medium">
            {rank > 0 ? (
              <>You are ranked <span className="text-emerald-500 font-bold">#{rank}</span> out of {total} students in your cohort.</>
            ) : (
              'Complete more assessments to calculate your class cohort ranking.'
            )}
          </p>
        </div>
      </div>

      {/* Decorative gradient glow */}
      <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-all pointer-events-none" />
    </div>
  );
}
