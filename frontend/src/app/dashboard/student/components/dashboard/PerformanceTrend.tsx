'use client';

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { HeaderTooltip } from './HeaderTooltip';

export interface PerformanceAttempt {
  id?: string;
  totalScore: number;
  totalMarks?: number;
  submittedAt?: string | Date;
  exam?: {
    id?: string;
    title?: string;
  };
}

export interface PerformanceGrade {
  id?: string;
  subject?: string;
  score: number;
  maxMarks?: number;
  dateLogged?: string | Date;
  createdAt?: string | Date;
}

interface PerformanceTrendProps {
  attempts: PerformanceAttempt[];
  standaloneGrades: PerformanceGrade[];
}

const PerformanceTrend: React.FC<PerformanceTrendProps> = ({ attempts, standaloneGrades }) => {
  const data = useMemo(() => {
    // Combine both attempts and standalone grades into a single timeline
    const timeline: { date: Date; score: number; label: string }[] = [];

    attempts?.forEach(a => {
      if (a.submittedAt) {
        timeline.push({
          date: new Date(a.submittedAt),
          score: Math.round((a.totalScore / (a.totalMarks || 1)) * 100),
          label: a.exam?.title || 'Exam'
        });
      }
    });

    standaloneGrades?.forEach(g => {
      const dateVal = g.dateLogged || g.createdAt;
      if (dateVal) {
        timeline.push({
          date: new Date(dateVal),
          score: Math.round((g.score / (g.maxMarks || 1)) * 100),
          label: g.subject || 'Assignment'
        });
      }
    });

    // Sort by date ascending
    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Format for recharts
    return timeline.map(t => ({
      name: t.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: t.score,
      fullLabel: t.label
    }));
  }, [attempts, standaloneGrades]);

  return (
    <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-none relative overflow-hidden group">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />
      
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 relative z-10">
        <div>
           <div className="flex items-center gap-2">
             <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
               Performance <span className="text-emerald-500">Trend</span>
             </h3>
             <HeaderTooltip content="Chronological scoring progression tracking your normalized exam percentages and assignment grades across the academic session." />
           </div>
           <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Score progression over time</p>
        </div>
        <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-xl sm:rounded-2xl shrink-0">
           <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
        </div>
      </div>

      <div className="relative z-10 h-60 sm:h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#888' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#888' }} 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#888', marginBottom: '4px' }}
                itemStyle={{ fontWeight: 'black', color: '#10b981' }}
                formatter={(value, _name, item) => [`${value}%`, (item?.payload as { fullLabel?: string } | undefined)?.fullLabel || 'Score']}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Not enough data to map trends</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTrend;
