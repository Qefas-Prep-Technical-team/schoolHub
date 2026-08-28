'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardChartsProps {
    stats?: any;
    analysis?: {
        averageScore: number;
        totalAssessments: number;
        subjectBreakdown?: { name: string; average: number }[];
        insight?: string;
    };
    hasPerformanceAccess?: boolean;
    primaryColor?: string;
}

export default function DashboardCharts({ stats, analysis, hasPerformanceAccess, primaryColor = '#2563eb' }: DashboardChartsProps) {
    const [timeRange, setTimeRange] = useState('Week');

    const attendanceData = useMemo(() => {
        const total = stats?.students || 1944;
        const basePresent = Math.floor(total * 0.9);
        
        // Helper to ensure values stay within 0 and total
        const getValues = (fluctuationPercent: number) => {
            const present = Math.min(total, Math.max(0, Math.floor(total * fluctuationPercent)));
            const absent = total - present;
            return { present, absent };
        };
        
        if (timeRange === 'Month') {
            return [
                { day: 'Week 1', ...getValues(0.85) },
                { day: 'Week 2', ...getValues(0.92) },
                { day: 'Week 3', ...getValues(0.80) },
                { day: 'Week 4', ...getValues(0.95) },
            ];
        }
        
        if (timeRange === 'Term') {
            return [
                { day: 'Month 1', ...getValues(0.88) },
                { day: 'Month 2', ...getValues(0.94) },
                { day: 'Month 3', ...getValues(0.85) },
                { day: 'Month 4', ...getValues(0.96) },
            ];
        }

        return [
            { day: 'Mon', ...getValues(0.85) },
            { day: 'Tue', ...getValues(0.95) },
            { day: 'Wed', ...getValues(0.88) },
            { day: 'Thu', ...getValues(0.98) },
            { day: 'Fri', ...getValues(0.82) },
        ];
    }, [stats, timeRange]);

    const academicData = useMemo(() => {
        if (!analysis || !analysis.subjectBreakdown) return [
            { name: 'High Performers', value: 0, color: primaryColor },
            { name: 'Average', value: 0, color: '#3b82f6' },
            { name: 'Review', value: 0, color: '#f59e0b' },
        ];

        const excellentCount = analysis.subjectBreakdown.filter(s => s.average >= 75).length;
        const goodCount = analysis.subjectBreakdown.filter(s => s.average >= 50 && s.average < 75).length;
        const atRiskCount = analysis.subjectBreakdown.filter(s => s.average < 50).length;

        return [
            { name: 'High Performers (75%+)', value: excellentCount, color: primaryColor },
            { name: 'Average (50-74%)', value: goodCount, color: '#3b82f6' },
            { name: 'Needs Review (<50%)', value: atRiskCount, color: '#f59e0b' },
        ];
    }, [analysis, primaryColor]);

    const totalAssessments = analysis?.totalAssessments || 0;
    const hasData = totalAssessments > 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Attendance Overview */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">Student Attendance Overview</h3>
                        <p className="text-xs text-slate-500">Daily present vs absent across all grades</p>
                    </div>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 self-start">
                        {['Week', 'Month', 'Term'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-medium rounded-full transition-all",
                                    timeRange === range 
                                        ? "text-white shadow-sm" 
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                                style={timeRange === range ? { backgroundColor: primaryColor } : {}}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={attendanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #f1f5f9)" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area type="monotone" dataKey="present" stroke={primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
                            <Area type="monotone" dataKey="absent" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAbsent)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Academic Performance (replaces Admissions in template) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col relative overflow-hidden">
                {!hasPerformanceAccess ? (
                    <div className="absolute inset-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shadow-md mb-2">
                            <Lock className="w-5 h-5 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Performance Insights</h3>
                        <p className="text-xs text-slate-500">Upgrade your subscription to unlock deep AI-driven academic analytics.</p>
                        <button className="px-5 py-2 text-white text-xs font-semibold rounded-full transition-colors mt-2" style={{ backgroundColor: primaryColor }}>
                            Upgrade Plan
                        </button>
                    </div>
                ) : null}

                <div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">Academic Performance</h3>
                    <p className="text-xs text-slate-500">Average score distribution - {totalAssessments} records</p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative my-6">
                    <div className="h-[200px] w-full">
                        {analysis ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={academicData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {academicData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Skeleton className="w-full h-full rounded-full opacity-20" />
                        )}
                    </div>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{hasData ? `${analysis?.averageScore}%` : 'N/A'}</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Avg Grade</span>
                    </div>
                </div>

                <div className="space-y-3 mt-auto">
                    {academicData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-600 dark:text-slate-300 text-xs">{item.name}</span>
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-white text-xs">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
