import React from 'react';
import { Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { SectionCard } from './SectionCard';
import { TrendChartTooltip } from './ChartTooltips';

export interface TrendChartProps {
    title: string;
    description: string;
    data: any[];
    themeColor: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ title, description, data, themeColor }) => {
    const avg = data?.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length) : 0;

    let insight = '';
    let colorClass = 'text-slate-600 bg-slate-100 dark:bg-white/5 dark:text-slate-300';
    if (data?.length > 0) {
        if (avg >= 80) {
            insight = 'Consistent High Mastery';
            colorClass = 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 dark:text-emerald-400';
        } else if (avg >= 60) {
            insight = 'Steady Proficiency';
            colorClass = 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 dark:text-blue-400';
        } else if (avg >= 40) {
            insight = 'Room for Growth';
            colorClass = 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 dark:text-amber-400';
        } else {
            insight = 'Needs Attention';
            colorClass = 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 dark:text-rose-400';
        }
    }

    if (!data || data.length === 0) {
        return (
            <SectionCard title={title} info={description}>
                <div className="py-10 text-center space-y-2.5 my-auto">
                    <Activity size={28} className="text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        No recorded data yet
                    </p>
                </div>
            </SectionCard>
        );
    }

    const gradientId = `color-${title.replace(/[^a-zA-Z0-9]/g, '-')}`;

    return (
        <SectionCard
            title={title}
            info={description}
            badge={
                <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md", colorClass)}>
                    Avg {avg}%
                </span>
            }
        >
            <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Status: <strong className="text-slate-800 dark:text-slate-200">{insight}</strong>
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                    {data.length} Entry Point{data.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="h-40 sm:h-44 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={themeColor} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="uniqueLabel"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickFormatter={(val) => (typeof val === 'string' ? val.split('|')[0] : val)}
                            dy={6}
                        />
                        <YAxis hide={true} domain={[0, 100]} />
                        <RechartsTooltip content={<TrendChartTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke={themeColor}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </SectionCard>
    );
};

