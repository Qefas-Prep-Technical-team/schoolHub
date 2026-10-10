const fs = require('fs');
const sourcePath = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/students/[studentId]/page.tsx';
const targetPath = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/analytics/AnalyticsTab.tsx';

const sourceContent = fs.readFileSync(sourcePath, 'utf8');

const extract = (content, regex) => {
    const match = content.match(regex);
    return match ? match[0] : '';
};

const trendTooltipRegex = /const TrendChartTooltip = [\s\S]*?(?=\nconst |\nfunction )/;
const overallTooltipRegex = /const OverallPerformanceTooltip = [\s\S]*?(?=\nconst |\nfunction )/;

const trendChartRegex = /function TrendChart\([\s\S]*?\n\}/;
const overallChartRegex = /function OverallPerformanceChart\([\s\S]*?\n\}/;
const sectionCardRegex = /function SectionCard\([\s\S]*?\n\}/;

const tTooltip = extract(sourceContent, trendTooltipRegex);
const oTooltip = extract(sourceContent, overallTooltipRegex);
const tChart = extract(sourceContent, trendChartRegex);
const oChart = extract(sourceContent, overallChartRegex);
const sCard = extract(sourceContent, sectionCardRegex);

let newContent = `import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Activity, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, LineChart, Line, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useAdminGrades } from '@/lib/api/hooks/useGrades';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

${tTooltip}

${oTooltip}

${tChart}

${oChart}

${sCard}

export default function AnalyticsTab({ classId, classNameLabel }: { classId: string; classNameLabel?: string }) {
    const primaryColor = '#2563eb';
    const { user } = useAuthStore();
    const activeSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const { data: sessionsData } = useSessions(activeSchoolId);
    
    // Fetch all grades for this class
    const { data: gradesData, isLoading: isGradesLoading } = useAdminGrades({ classId });
    const grades = Array.isArray(gradesData?.data) ? gradesData.data : (Array.isArray(gradesData) ? gradesData : []);

    const [overallChartFilter, setOverallChartFilter] = useState<'TERM' | 'SESSION'>('SESSION');
    const [overallChartSubjectFilter, setOverallChartSubjectFilter] = useState('ALL');

    const activeSession = Array.isArray(sessionsData?.data) ? (sessionsData.data.find((s: any) => s.isActive) || sessionsData.data[0]) : null;
    const currentSessionId = activeSession?.id;
    const currentTerm = activeSession?.currentTerm;

    const filteredDashboardGrades = useMemo(() => {
        if (!currentSessionId || !currentTerm) return grades;
        return grades.filter((g: any) => {
            const matchesSession = g.sessionId === currentSessionId;
            const matchesTerm = g.term === currentTerm;
            return matchesSession && matchesTerm;
        });
    }, [grades, currentSessionId, currentTerm]);

    const analyticsData = useMemo(() => {
        if (!filteredDashboardGrades.length) return { assignment: [], quiz: [], exam: [], ca: [], overallPerformance: [] };

        const filterAndFormat = (types: string[]) => {
            return filteredDashboardGrades
                .filter((g: any) => {
                    const type = (g.assessmentType || '').toUpperCase();
                    return types.some((t: string) => type.includes(t));
                })
                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((g: any, index: number) => {
                    const max = g.maxMarks > 0 ? g.maxMarks : 100;
                    const dateStr = new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return {
                        uniqueLabel: \`\${dateStr}|\${index}\`,
                        date: dateStr,
                        score: Math.min(Math.round((g.score / max) * 100), 100),
                        subject: g.subject
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
        let baseGrades = grades;
        if (overallChartFilter === 'TERM' && currentSessionId && currentTerm) {
            baseGrades = grades.filter((g: any) => g.sessionId === currentSessionId && g.term === currentTerm);
        } else if (overallChartFilter === 'SESSION' && currentSessionId) {
            baseGrades = grades.filter((g: any) => g.sessionId === currentSessionId);
        }
        if (overallChartSubjectFilter !== 'ALL') {
            baseGrades = baseGrades.filter((g: any) => g.subject === overallChartSubjectFilter);
        }

        const byDateMap: Record<string, any> = {};
        baseGrades.forEach((g: any) => {
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
    }, [grades, overallChartFilter, overallChartSubjectFilter, currentSessionId, currentTerm]);

    if (isGradesLoading) {
        return <div className="p-8 text-center animate-pulse text-slate-400">Loading class analytics...</div>;
    }

    return (
        <TooltipProvider>
            <div className="space-y-6 w-full mx-auto pb-20">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Class Analytics</h2>
                        {activeSession && (
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: \`\${primaryColor}15\`, color: primaryColor }}>
                                {(() => {
                                    const termMap: Record<string, string> = { 'FIRST': 'First Term', 'SECOND': 'Second Term', 'THIRD': 'Third Term' };
                                    return \`\${activeSession.name} · \${termMap[activeSession.currentTerm] || activeSession.currentTerm || 'Current Term'}\`;
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
                        info={\`This chart provides a comprehensive, timeline-based view of the class's academic trajectory by aggregating all recorded assessments. It compares parallel trends across Assignments, Quizzes, Continuous Assessments, and Examinations, allowing you to easily spot correlations—such as whether strong homework grades translate to high exam scores. You are currently viewing data for the \${overallChartFilter === 'TERM' ? 'current term' : 'entire session'}\${overallChartSubjectFilter !== 'ALL' ? \`, specifically filtered for \${overallChartSubjectFilter}\` : ' across all subjects'}.\`}
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
`;

fs.writeFileSync(targetPath, newContent);
