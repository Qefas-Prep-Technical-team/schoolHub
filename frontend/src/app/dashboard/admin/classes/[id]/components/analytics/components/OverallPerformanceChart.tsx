import React from 'react';
import { Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { OverallPerformanceTooltip } from './ChartTooltips';

export interface OverallPerformanceChartProps {
    data: any[];
}

export const OverallPerformanceChart: React.FC<OverallPerformanceChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="py-14 text-center space-y-3">
                <Activity size={32} className="text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    No timeline records available yet
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Recorded assignments, quizzes, continuous assessments, and exams will display here over time.
                </p>
            </div>
        );
    }

    return (
        <div className="h-64 sm:h-80 md:h-96 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b822" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={8}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <RechartsTooltip
                        content={<OverallPerformanceTooltip />}
                        cursor={{ stroke: '#6366f130', strokeWidth: 2, strokeDasharray: '3 3' }}
                        wrapperStyle={{ pointerEvents: 'auto' }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '12px', fontSize: '11px', fontWeight: 600 }}
                        iconType="circle"
                    />
                    <Line
                        type="monotone"
                        connectNulls
                        dataKey="assignment"
                        name="Assignment"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        connectNulls
                        dataKey="quiz"
                        name="Quiz/Test"
                        stroke="#0ea5e9"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        connectNulls
                        dataKey="ca"
                        name="Continuous Assessment"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        connectNulls
                        dataKey="exam"
                        name="Examination"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

