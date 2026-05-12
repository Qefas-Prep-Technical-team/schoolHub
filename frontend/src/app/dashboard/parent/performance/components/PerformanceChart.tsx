"use client";

import { useMemo, useState } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    Defs,
    LinearGradient,
    Stop
} from 'recharts';
import { Download, Filter } from 'lucide-react';
import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function PerformanceChart() {
    const { selectedChildId } = useParentStore();
    const { data: student, isLoading } = useChildExams(selectedChildId);
    const [selectedSubject, setSelectedSubject] = useState('All Subjects');

    const chartData = useMemo(() => {
        if (!student?.grades) return [];
        
        let filteredGrades = student.grades;
        if (selectedSubject !== 'All Subjects') {
            filteredGrades = student.grades.filter((g: { subject?: string, subjectPaper?: { subject?: { name: string } } }) => 
                (g.subject || g.subjectPaper?.subject?.name) === selectedSubject
            );
        }

        return [...filteredGrades].reverse().map((g: { createdAt: string, score: number, maxMarks: number, subject?: string, subjectPaper?: { subject?: { name: string } } }) => ({
            date: format(new Date(g.createdAt), 'MMM dd'),
            score: Math.round((g.score / g.maxMarks) * 100),
            subject: g.subject || g.subjectPaper?.subject?.name || 'Unknown'
        })).slice(-10); // Show last 10 assessments
    }, [student, selectedSubject]);

    const subjects = useMemo(() => {
        if (!student?.grades) return ['All Subjects'];
        const uniqueSubjects = Array.from(new Set(student.grades.map((g: { subject?: string, subjectPaper?: { subject?: { name: string } } }) => 
            g.subject || g.subjectPaper?.subject?.name
        ).filter(Boolean)));
        return ['All Subjects', ...uniqueSubjects];
    }, [student]);

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-3xl" />;
    }

    return (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/10 p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        Academic Trend
                    </h3>
                    <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                        Analysis of recent assessments
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-orange-500/10 py-3 px-6 cursor-pointer outline-none transition-all"
                    >
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>

                    <button className="flex items-center gap-2 bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm active:scale-95">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={10}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={10}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: 'none',
                                borderRadius: '1rem',
                                padding: '12px',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            }}
                            itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', marginBottom: '4px' }}
                            formatter={(value) => [`${value}%`, 'SCORE']}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#ea580c"
                            fill="url(#colorScore)"
                            strokeWidth={4}
                            fillOpacity={1}
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

