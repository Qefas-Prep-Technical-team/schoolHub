'use client';

import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Activity, Zap } from 'lucide-react';
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const data = [
    { day: 'Mon', students: 96, teachers: 92 },
    { day: 'Tue', students: 98, teachers: 94 },
    { day: 'Wed', students: 94, teachers: 90 },
    { day: 'Thu', students: 97, teachers: 93 },
    { day: 'Fri', students: 95, teachers: 88 },
    { day: 'Sat', students: 65, teachers: 60 },
    { day: 'Today', students: 94, teachers: 88 },
];

interface AttendanceChartProps {
    stats?: {
        students: number;
        teachers: number;
        classes: number;
        exams: number;
        subjects: number;
    };
    isLoading?: boolean;
}

export default function AttendanceChart({ stats, isLoading }: AttendanceChartProps) {
    const [activeLine, setActiveLine] = useState<'students' | 'teachers' | 'both'>('both');

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm h-full min-h-[500px]">
                <Skeleton className="h-full w-full rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-8 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Presence Velocity
                        </h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
                        Comparative 7-day school-wide data
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setActiveLine('students')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeLine === 'students' ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Students
                    </button>
                    <button
                        onClick={() => setActiveLine('teachers')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeLine === 'teachers' ? "bg-white dark:bg-slate-900 shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Teachers
                    </button>
                    <button
                        onClick={() => setActiveLine('both')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeLine === 'both' ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Compare
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '1.5rem', 
                                border: 'none', 
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                padding: '1rem',
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        
                        {(activeLine === 'students' || activeLine === 'both') && (
                            <Area 
                                type="monotone" 
                                dataKey="students" 
                                stroke="#2563eb" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorStudents)" 
                                animationDuration={1500}
                            />
                        )}
                        {(activeLine === 'teachers' || activeLine === 'both') && (
                            <Area 
                                type="monotone" 
                                dataKey="teachers" 
                                stroke="#10b981" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorTeachers)" 
                                animationDuration={1500}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic uppercase">Institutional Growth</p>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed">
                            {stats ? `Presence metrics show positive stability across ${stats.classes} active classes.` : "Student attendance improved by 2.1% this week compared to last month."}
                        </p>
                    </div>
                </div>
                <button className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 whitespace-nowrap">
                    Download Raw Data
                </button>
            </div>
        </div>
    );
}

