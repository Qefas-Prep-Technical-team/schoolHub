'use client';

import React, { useMemo, useState } from 'react';
import { Sparkles, Calendar, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAdminGrades } from '@/lib/api/hooks/useGrades';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { SectionCard } from './components/SectionCard';
import { TrendChart } from './components/TrendChart';
import { OverallPerformanceChart } from './components/OverallPerformanceChart';
import { AnalyticsSkeleton } from './components/AnalyticsSkeleton';

export interface AnalyticsTabProps {
    classId: string;
    classNameLabel?: string;
}

export default function AnalyticsTab({ classId, classNameLabel }: AnalyticsTabProps) {
    const primaryColor = '#4f46e5'; // Official indigo brand theme
    const { user } = useAuthStore();
    const activeSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const { data: sessionsData } = useSessions(activeSchoolId);

    // Fetch all grades for this class
    const { data: gradesData, isLoading: isGradesLoading } = useAdminGrades({ classId, includeExams: true });
    const grades = Array.isArray(gradesData) ? gradesData : [];

    const [overallChartFilter, setOverallChartFilter] = useState<'TERM' | 'SESSION'>('SESSION');
    const [overallChartSubjectFilter, setOverallChartSubjectFilter] = useState('ALL');

    const activeSession = Array.isArray(sessionsData?.data)
        ? sessionsData.data.find((s: any) => s.isActive) || sessionsData.data[0]
        : null;

    const filteredDashboardGrades = useMemo(() => {
        let baseGrades = grades;
        if (overallChartSubjectFilter !== 'ALL') {
            baseGrades = grades.filter((g: any) => g.subject === overallChartSubjectFilter);
        }

        return overallChartFilter === 'SESSION'
            ? baseGrades
            : baseGrades.length > 0
                ? (() => {
                    const sorted = [...baseGrades].sort(
                        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    const mostRecentDate = new Date(sorted[0].createdAt);
                    const termStart = new Date(mostRecentDate);
                    termStart.setMonth(mostRecentDate.getMonth() - 3);
                    return baseGrades.filter((g: any) => new Date(g.createdAt) >= termStart);
                })()
                : [];
    }, [grades, overallChartFilter, overallChartSubjectFilter]);

    // Format category trends
    const analyticsData = useMemo(() => {
        if (!filteredDashboardGrades.length) {
            return { assignment: [], quiz: [], exam: [], ca: [] };
        }

        const filterAndFormat = (typeMatches: string[]) => {
            const filtered = filteredDashboardGrades.filter((g: any) => {
                const type = (g.assessmentType || '').toUpperCase();
                return typeMatches.some((match) => type.includes(match));
            });

            // Group by date
            const groupedMap: Record<
                string,
                {
                    date: string;
                    totalScore: number;
                    count: number;
                    timestamp: number;
                    subjects: Record<string, { score: number, count: number }>;
                }
            > = {};

            filtered.forEach((g: any) => {
                const dateObj = new Date(g.createdAt);
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const subject = g.subject || 'General';

                const max = g.maxMarks > 0 ? g.maxMarks : 100;
                const pct = Math.min(Math.round((g.score / max) * 100), 100);

                if (!groupedMap[dateStr]) {
                    groupedMap[dateStr] = {
                        date: dateStr,
                        totalScore: 0,
                        count: 0,
                        timestamp: dateObj.getTime(),
                        subjects: {},
                    };
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
                        avg: Math.round(stats.score / stats.count),
                    }));

                    return {
                        uniqueLabel: `${d.date}|${index}`,
                        date: d.date,
                        score: Math.round(d.totalScore / d.count),
                        subjectBreakdown,
                    };
                });
        };

        return {
            assignment: filterAndFormat(['ASSIGNMENT']),
            quiz: filterAndFormat(['QUIZ', 'TEST']),
            exam: filterAndFormat(['EXAM', 'TOTAL']),
            ca: filterAndFormat(['CA', 'CONTINUOUS', 'AC']),
        };
    }, [filteredDashboardGrades]);

    // Multi-line overall performance
    const overallPerformanceLine = useMemo(() => {
        const filtered = filteredDashboardGrades;
        const byDateMap: Record<string, any> = {};

        filtered.forEach((g: any) => {
            const dateObj = new Date(g.createdAt);
            const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!byDateMap[date]) {
                byDateMap[date] = {
                    date,
                    timestamp: dateObj.getTime(),
                    assignment: [],
                    quiz: [],
                    ca: [],
                    exam: [],
                };
            }

            const type = (g.assessmentType || '').toUpperCase();
            const max = g.maxMarks > 0 ? g.maxMarks : 100;
            const score = Math.min(Math.round((g.score / max) * 100), 100);

            if (['ASSIGNMENT'].some((t) => type.includes(t))) byDateMap[date].assignment.push({ subject: g.subject, score });
            else if (['QUIZ', 'TEST'].some((t) => type.includes(t))) byDateMap[date].quiz.push({ subject: g.subject, score });
            else if (['CA', 'CONTINUOUS', 'AC'].some((t) => type.includes(t))) byDateMap[date].ca.push({ subject: g.subject, score });
            else if (['EXAM', 'TOTAL'].some((t) => type.includes(t))) byDateMap[date].exam.push({ subject: g.subject, score });
        });

        const sortedData = Object.values(byDateMap).sort((a: any, b: any) => a.timestamp - b.timestamp);

        let lastAssignment = 0, lastQuiz = 0, lastCa = 0, lastExam = 0;
        let lastAssignmentSubjects: any[] = [];
        let lastQuizSubjects: any[] = [];
        let lastCaSubjects: any[] = [];
        let lastExamSubjects: any[] = [];

        sortedData.forEach((d: any) => {
            const calcAvg = (arr: any[]) =>
                arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b.score, 0) / arr.length) : null;

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

    // Extract sorted unique subjects for the filter dropdown
    const availableSubjectList = useMemo(() => {
        return Array.from(new Set(grades.map((g: any) => g.subject).filter(Boolean))).sort();
    }, [grades]);

    if (isGradesLoading) {
        return <AnalyticsSkeleton />;
    }

    return (
        <TooltipProvider>
            <div className="w-full space-y-6 sm:space-y-8 pb-16">
                {/* Header Summary Banner */}
                <div className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                <Sparkles size={16} />
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                {classNameLabel ? `${classNameLabel} Analytics` : 'Class Academic Analytics'}
                            </h2>
                            {activeSession && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                                    <Calendar size={11} />
                                    <span>
                                        {activeSession.name} • {activeSession.currentTerm} Term
                                    </span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                            Real-time academic evaluation aggregating daily assignments, quizzes, continuous assessments, and examinations across this cohort.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-xl">
                            {grades.length} Recorded Grade{grades.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* 4 Cards Grid - Responsive from 1 col on mobile, 2 on tablet, to 4 on widescreen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                    <TrendChart
                        title="Assignments"
                        description="Tracks scores on all individual assignments over time. Use this to identify how well the class is keeping up with daily/weekly homework and short-term deliverables."
                        data={analyticsData.assignment}
                        themeColor="#8b5cf6"
                    />
                    <TrendChart
                        title="Quizzes & Tests"
                        description="Measures performance across pop quizzes and short tests. This highlights the class's ability to recall recently taught material and perform under lower-stakes testing conditions."
                        data={analyticsData.quiz}
                        themeColor="#0ea5e9"
                    />
                    <TrendChart
                        title="Continuous Assessment"
                        description="Evaluates overall continuous assessment (CA) progress throughout the term. This combined metric reflects consistent effort, participation, and mid-term evaluations before the final exams."
                        data={analyticsData.ca}
                        themeColor="#f59e0b"
                    />
                    <TrendChart
                        title="Examinations"
                        description="Highlights results from major formal examinations. This provides a clear picture of the class's performance under high-pressure, comprehensive testing environments at the end of the term."
                        data={analyticsData.exam}
                        themeColor="#10b981"
                    />
                </div>

                {/* Full-Width Overall Performance Timeline Section */}
                <SectionCard
                    title="Overall Performance Trajectory"
                    info={`This chart provides a comprehensive, timeline-based view of the class's academic trajectory by aggregating all recorded assessments. It compares parallel trends across Assignments, Quizzes, Continuous Assessments, and Examinations, allowing you to easily spot correlations—such as whether strong homework grades translate to high exam scores. You are currently viewing data for the ${overallChartFilter === 'TERM' ? 'current term' : 'entire session'}${overallChartSubjectFilter !== 'ALL' ? `, specifically filtered for ${overallChartSubjectFilter}` : ' across all subjects'}.`}
                    badge={
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <Layers size={11} /> Multi-Metric
                        </span>
                    }
                    headerAction={
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                            {/* Subject Filter */}
                            <div className="relative min-w-[140px] sm:w-44">
                                <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={overallChartSubjectFilter}
                                    onChange={(e) => setOverallChartSubjectFilter(e.target.value)}
                                    className="w-full pl-8 pr-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="ALL">All Subjects</option>
                                    {availableSubjectList.map((sub: any, idx: number) => (
                                        <option key={`${sub}-${idx}`} value={sub}>
                                            {sub as string}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Range toggle (Term vs Session) */}
                            <div className="inline-flex bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/60 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setOverallChartFilter('TERM')}
                                    className={cn(
                                        "px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                                        overallChartFilter === 'TERM'
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    )}
                                >
                                    Term
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOverallChartFilter('SESSION')}
                                    className={cn(
                                        "px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                                        overallChartFilter === 'SESSION'
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    )}
                                >
                                    Session
                                </button>
                            </div>
                        </div>
                    }
                >
                    <OverallPerformanceChart data={overallPerformanceLine} />
                </SectionCard>
            </div>
        </TooltipProvider>
    );
}
