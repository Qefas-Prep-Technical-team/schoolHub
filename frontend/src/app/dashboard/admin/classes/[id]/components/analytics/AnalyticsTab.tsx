import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Activity, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, LineChart, Line, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useAdminGrades } from '@/lib/api/hooks/useGrades';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

const TrendChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        const color = payload[0].color || payload[0].stroke || '#2563eb';
        const displayLabel = typeof label === 'string' ? label.split('|')[0] : label;
        return (
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 space-y-1.5 z-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{displayLabel}</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {dataPoint.subject || 'Assessment'}: <span style={{ color }}>{dataPoint.score}%</span>
                </p>
            </div>
        );
    }
    return null;
};


const OverallPerformanceTooltip = ({ active, payload, label }: any) => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);

    React.useEffect(() => {
        // Reset index when hovering a new date
        setActiveIndex(0);
    }, [label]);

    const lengthRef = React.useRef(0);

    React.useEffect(() => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            const validPayloads = payload.filter((entry: any) =>
                dataPoint.realValues && dataPoint.realValues[entry.dataKey] !== undefined
            );
            lengthRef.current = validPayloads.length;
        }
    }, [active, payload]);

    React.useEffect(() => {
        if (!active || isPaused || lengthRef.current <= 1) return;

        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev < lengthRef.current - 1 ? prev + 1 : 0));
        }, 2500);

        return () => clearInterval(timer);
    }, [active, isPaused, label]);

    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;

        const validPayloads = payload.filter((entry: any) =>
            dataPoint.realValues && dataPoint.realValues[entry.dataKey] !== undefined
        );

        if (validPayloads.length === 0) return null;

        const safeIndex = Math.min(Math.max(activeIndex, 0), validPayloads.length - 1);
        const activeEntry = validPayloads[safeIndex];
        const realData = dataPoint.realValues[activeEntry.dataKey];

        const handlePrev = (e: React.MouseEvent) => {
            e.stopPropagation();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : validPayloads.length - 1));
        };

        const handleNext = (e: React.MouseEvent) => {
            e.stopPropagation();
            setActiveIndex((prev) => (prev < validPayloads.length - 1 ? prev + 1 : 0));
        };

        return (
            <div
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 z-50 min-w-[240px] pointer-events-auto"
                onWheel={(e) => e.stopPropagation()}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>

                    {validPayloads.length > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrev}
                                className="size-6 rounded-md bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-[9px] font-bold text-slate-400 w-8 text-center">
                                {safeIndex + 1} / {validPayloads.length}
                            </span>
                            <button
                                onClick={handleNext}
                                className="size-6 rounded-md bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <p className="text-[13px] font-black tracking-tight" style={{ color: activeEntry.color }}>
                        {activeEntry.name}: {realData.avg}%
                    </p>
                    <div className="pl-3 border-l-2 border-slate-100 dark:border-slate-700 ml-1 mt-2">
                        {realData.subjects.length > 0 ? (
                            <div className="max-h-[140px] overflow-y-auto custom-scrollbar pr-2 space-y-1.5">
                                {realData.subjects.map((sub: any, i: number) => (
                                    <p key={i} className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex justify-between gap-4">
                                        <span className="truncate">{sub.subject}</span>
                                        <span className="font-bold shrink-0">{sub.score}%</span>
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] font-medium text-slate-400 italic">No breakdown available.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return null;
};


function TrendChart({ title, description, data, themeColor }: { title: string, description: string, data: any[], themeColor: string }) {
    const avg = data?.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length) : 0;

    let insight = '';
    let colorClass = 'text-slate-600 bg-slate-100 dark:bg-white/5 dark:text-slate-300';
    if (data?.length > 0) {
        if (avg >= 80) {
            insight = 'Excellent performance with high consistency.';
            colorClass = 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400';
        } else if (avg >= 60) {
            insight = 'Solid performance, maintaining a steady average.';
            colorClass = 'text-blue-700 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400';
        } else if (avg >= 40) {
            insight = 'Average performance, showing room for improvement.';
            colorClass = 'text-amber-700 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400';
        } else {
            insight = 'Needs attention. Performance is currently below expectations.';
            colorClass = 'text-red-700 bg-red-100 dark:bg-red-500/20 dark:text-red-400';
        }
    }

    if (!data || data.length === 0) {
        return (
            <SectionCard title={title} info={description}>
                <div className="py-12 text-center space-y-3">
                    <Activity size={32} className="text-slate-200 dark:text-slate-700 mx-auto" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No data available yet</p>
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard title={title} info={description}>
            <div className="space-y-2 mb-6">
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md transition-colors", colorClass)}>
                        Avg: {avg}%
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">{insight}</span>
                </div>
            </div>
            <div className="h-48 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`color-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={themeColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="uniqueLabel"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickFormatter={(val) => typeof val === 'string' ? val.split('|')[0] : val}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                            domain={[0, 100]}
                        />
                        <RechartsTooltip content={<TrendChartTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke={themeColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color-${title.replace(/\s+/g, '-')})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </SectionCard>
    );
}

function OverallPerformanceChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="py-12 text-center space-y-3">
                <Activity size={32} className="text-slate-200 dark:text-slate-700 mx-auto" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No data available yet</p>
            </div>
        );
    }

    return (
        <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        domain={[0, 100]}
                    />
                    <RechartsTooltip
                        content={<OverallPerformanceTooltip />}
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '3 3' }}
                        wrapperStyle={{ pointerEvents: 'auto' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                    <Line type="monotone" connectNulls dataKey="assignment" name="Assignment" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" connectNulls dataKey="quiz" name="Quiz/Test" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" connectNulls dataKey="ca" name="Continuous Assessment" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" connectNulls dataKey="exam" name="Examination" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function SectionCard({ title, children, className = '', headerAction, info }: { title: string; children: React.ReactNode; className?: string; headerAction?: React.ReactNode; info?: string }) {
    return (
        <div className={cn("bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden", className)}>
            <div className="p-5 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                        {info && (
                            <UITooltip>
                                <TooltipTrigger asChild>
                                    <div className="text-slate-400 hover:text-primary transition-colors cursor-help p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <Info size={16} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs font-medium">
                                    <p>{info}</p>
                                </TooltipContent>
                            </UITooltip>
                        )}
                    </div>
                    {headerAction && <div className="w-full sm:w-auto">{headerAction}</div>}
                </div>
                {children}
            </div>
        </div>
    )
}


function AnalyticsSkeleton() {
    return (
        <div className="space-y-6 w-full mx-auto pb-20 animate-pulse">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                </div>
                <div className="h-4 w-full max-w-3xl bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-4 w-3/4 max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden p-5 md:p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-4">
                            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        </div>
                        <div className="space-y-2 mb-6">
                            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                        </div>
                        <div className="h-48 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                    </div>
                ))}
            </div>

            <div className="mt-12 space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden p-5 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                        </div>
                    </div>
                    <div className="h-80 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}

export default function AnalyticsTab({ classId, classNameLabel }: { classId: string; classNameLabel?: string }) {
    const primaryColor = '#2563eb';
    const { user } = useAuthStore();
    const activeSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const { data: sessionsData } = useSessions(activeSchoolId);
    
    // Fetch all grades for this class
    const { data: gradesData, isLoading: isGradesLoading } = useAdminGrades({ classId, includeExams: true });
    const grades = Array.isArray(gradesData) ? gradesData : [];

    const [overallChartFilter, setOverallChartFilter] = useState<'TERM' | 'SESSION'>('SESSION');
    const [overallChartSubjectFilter, setOverallChartSubjectFilter] = useState('ALL');

    const activeSession = Array.isArray(sessionsData?.data) ? (sessionsData.data.find((s: any) => s.isActive) || sessionsData.data[0]) : null;
    const currentSessionId = activeSession?.id;
    const currentTerm = activeSession?.currentTerm;

    const filteredDashboardGrades = useMemo(() => {
        let baseGrades = grades;
        if (overallChartSubjectFilter !== 'ALL') {
            baseGrades = grades.filter((g: any) => g.subject === overallChartSubjectFilter);
        }

        return overallChartFilter === 'SESSION'
            ? baseGrades
            : baseGrades.length > 0
                ? (() => {
                    const sorted = [...baseGrades].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    const mostRecentDate = new Date(sorted[0].createdAt);
                    const termStart = new Date(mostRecentDate);
                    termStart.setMonth(mostRecentDate.getMonth() - 3);
                    return baseGrades.filter((g: any) => new Date(g.createdAt) >= termStart);
                })()
                : [];
    }, [grades, overallChartFilter, overallChartSubjectFilter]);

    const analyticsData = useMemo(() => {
        if (!filteredDashboardGrades.length) return { assignment: [], quiz: [], exam: [], ca: [], overallPerformance: [] };

        const filterAndFormat = (types: string[]) => {
            const filtered = filteredDashboardGrades.filter((g: any) => {
                const type = (g.assessmentType || '').toUpperCase();
                return types.some((t: string) => type.includes(t));
            });

            // Group by date
            const groupedMap: Record<string, { date: string, totalScore: number, count: number, timestamp: number, subjects: Record<string, { score: number, count: number }> }> = {};
            
            filtered.forEach((g: any) => {
                const dateObj = new Date(g.createdAt);
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const subject = g.subject || 'General';
                
                const max = g.maxMarks > 0 ? g.maxMarks : 100;
                const pct = Math.min(Math.round((g.score / max) * 100), 100);

                if (!groupedMap[dateStr]) {
                    groupedMap[dateStr] = { date: dateStr, totalScore: 0, count: 0, timestamp: dateObj.getTime(), subjects: {} };
                }
                groupedMap[dateStr].totalScore += pct;
                groupedMap[dateStr].count += 1;
                
                if (!groupedMap[dateStr].subjects[subject]) {
                    groupedMap[dateStr].subjects[subject] = { score: 0, count: 0 };
                }
                groupedMap[dateStr].subjects[subject].score += pct;
                groupedMap[dateStr].subjects[subject].count += 1;
            });

            return Object.values(groupedMap)
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((d, index) => {
                    const subjectBreakdown = Object.entries(d.subjects).map(([sub, stats]) => ({
                        subject: sub,
                        avg: Math.round(stats.score / stats.count)
                    }));
                    
                    return {
                        uniqueLabel: `${d.date}|${index}`,
                        date: d.date,
                        score: Math.round(d.totalScore / d.count),
                        subjectBreakdown
                    };
                });
        };

        return {
            assignment: filterAndFormat(['ASSIGNMENT']),
            quiz: filterAndFormat(['QUIZ', 'TEST']),
            exam: filterAndFormat(['EXAM', 'TOTAL']),
            ca: filterAndFormat(['CA', 'CONTINUOUS', 'AC'])
        };
    }, [filteredDashboardGrades]);

    const overallPerformanceLine = useMemo(() => {
        const filtered = filteredDashboardGrades;

        const byDateMap: Record<string, any> = {};
        filtered.forEach((g: any) => {
            const dateObj = new Date(g.createdAt);
            const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!byDateMap[date]) byDateMap[date] = { date, timestamp: dateObj.getTime(), assignment: [], quiz: [], ca: [], exam: [] };

            const type = (g.assessmentType || '').toUpperCase();
            const max = g.maxMarks > 0 ? g.maxMarks : 100;
            const score = Math.min(Math.round((g.score / max) * 100), 100);

            if (['ASSIGNMENT'].some(t => type.includes(t))) byDateMap[date].assignment.push({ subject: g.subject, score });
            else if (['QUIZ', 'TEST'].some(t => type.includes(t))) byDateMap[date].quiz.push({ subject: g.subject, score });
            else if (['CA', 'CONTINUOUS', 'AC'].some(t => type.includes(t))) byDateMap[date].ca.push({ subject: g.subject, score });
            else if (['EXAM', 'TOTAL'].some(t => type.includes(t))) byDateMap[date].exam.push({ subject: g.subject, score });
        });

        const sortedData = Object.values(byDateMap).sort((a: any, b: any) => a.timestamp - b.timestamp);

        let lastAssignment = 0, lastQuiz = 0, lastCa = 0, lastExam = 0;
        let lastAssignmentSubjects: any[] = [];
        let lastQuizSubjects: any[] = [];
        let lastCaSubjects: any[] = [];
        let lastExamSubjects: any[] = [];

        sortedData.forEach((d: any) => {
            const calcAvg = (arr: any[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b.score, 0) / arr.length) : null;

            const aAvg = calcAvg(d.assignment);
            const qAvg = calcAvg(d.quiz);
            const cAvg = calcAvg(d.ca);
            const eAvg = calcAvg(d.exam);

            if (aAvg !== null) { lastAssignment = aAvg; lastAssignmentSubjects = d.assignment; }
            if (qAvg !== null) { lastQuiz = qAvg; lastQuizSubjects = d.quiz; }
            if (cAvg !== null) { lastCa = cAvg; lastCaSubjects = d.ca; }
            if (eAvg !== null) { lastExam = eAvg; lastExamSubjects = d.exam; }

            d.realValues = {};
            if (lastAssignmentSubjects.length > 0) d.realValues.assignment = { avg: lastAssignment, subjects: lastAssignmentSubjects };
            if (lastQuizSubjects.length > 0) d.realValues.quiz = { avg: lastQuiz, subjects: lastQuizSubjects };
            if (lastCaSubjects.length > 0) d.realValues.ca = { avg: lastCa, subjects: lastCaSubjects };
            if (lastExamSubjects.length > 0) d.realValues.exam = { avg: lastExam, subjects: lastExamSubjects };

            d.assignment = lastAssignment;
            d.quiz = lastQuiz;
            d.ca = lastCa;
            d.exam = lastExam;
        });

        return sortedData;
    }, [filteredDashboardGrades]);

    if (isGradesLoading) {
        return <AnalyticsSkeleton />;
    }

    return (
        <TooltipProvider>
            <div className="space-y-6 w-full mx-auto pb-20">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Class Analytics</h2>
                        {activeSession && (
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                {(() => {
                                    const termMap: Record<string, string> = { 'FIRST': 'First Term', 'SECOND': 'Second Term', 'THIRD': 'Third Term' };
                                    return `${activeSession.name} · ${termMap[activeSession.currentTerm] || activeSession.currentTerm || 'Current Term'}`;
                                })()}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                        This dashboard visualizes the aggregate academic progress of {classNameLabel || 'this class'} over time. It aggregates scores across different assessment types—such as assignments, quizzes, continuous assessments, and formal examinations—allowing you to easily identify performance trends, strengths, and areas needing improvement throughout the current academic period.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6">
                    <TrendChart title="Assignment Trend" description="Tracks scores on all individual assignments over time. Use this to identify how well the class is keeping up with daily/weekly homework and short-term deliverables." data={analyticsData.assignment} themeColor="#8b5cf6" />
                    <TrendChart title="Quiz & Test Trend" description="Measures performance across pop quizzes and short tests. This highlights the class's ability to recall recently taught material and perform under lower-stakes testing conditions." data={analyticsData.quiz} themeColor="#0ea5e9" />
                    <TrendChart title="Continuous Assessment (CA)" description="Evaluates overall continuous assessment (CA) progress throughout the term. This combined metric reflects consistent effort, participation, and mid-term evaluations before the final exams." data={analyticsData.ca} themeColor="#f59e0b" />
                    <TrendChart title="Examination Trend" description="Highlights results from major formal examinations. This provides a clear picture of the class's performance under high-pressure, comprehensive testing environments at the end of the term." data={analyticsData.exam} themeColor={primaryColor} />
                </div>

                <div className="mt-12 space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <SectionCard
                        title="Overall Performance Trend"
                        info={`This chart provides a comprehensive, timeline-based view of the class's academic trajectory by aggregating all recorded assessments. It compares parallel trends across Assignments, Quizzes, Continuous Assessments, and Examinations, allowing you to easily spot correlations—such as whether strong homework grades translate to high exam scores. You are currently viewing data for the ${overallChartFilter === 'TERM' ? 'current term' : 'entire session'}${overallChartSubjectFilter !== 'ALL' ? `, specifically filtered for ${overallChartSubjectFilter}` : ' across all subjects'}.`}
                        headerAction={
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                <select
                                    value={overallChartSubjectFilter}
                                    onChange={(e) => setOverallChartSubjectFilter(e.target.value)}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                >
                                    <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium" value="ALL">All Subjects</option>
                                    {Array.from(new Set(grades.map((g: any) => g.subject).filter(Boolean))).sort().map((sub: any) => (
                                        <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium" key={sub} value={sub}>{sub as string}</option>
                                    ))}
                                </select>
                                <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50">
                                    <button
                                        onClick={() => setOverallChartFilter('TERM')}
                                        className={cn("px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all", overallChartFilter === 'TERM' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
                                    >
                                        Current Term
                                    </button>
                                    <button
                                        onClick={() => setOverallChartFilter('SESSION')}
                                        className={cn("px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all", overallChartFilter === 'SESSION' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
                                    >
                                        Full Session
                                    </button>
                                </div>
                            </div>
                        }
                    >
                        <OverallPerformanceChart data={overallPerformanceLine} />
                    </SectionCard>
                </div>
            </div>
        </TooltipProvider>
    );
}
