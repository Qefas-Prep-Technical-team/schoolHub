"use client";

import { useParams, useRouter } from "next/navigation";
import { useExam, useExamResult, useExamAttempt } from "@/lib/api/hooks/useExams";
import {
    Loader2,
    Trophy,
    Clock,
    FileText,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Lock,
    ChevronRight,
    TrendingUp,
    Percent,
    Award,
    ArrowLeft,
    Timer,
    Zap,
    Target,
    Quote,
    GraduationCap,
    Users,
    BarChart3,
    Eye,
    Download,
    Info,
    LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { format, isAfter, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo, useEffect, useState } from "react";

/**
 * ExamResultPage - Refined with A+ Grading Scale, Global Standing & Velocity Analytics
 */
const getOrdinal = (n: number) => {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return n + "st";
    if (j === 2 && k !== 12) return n + "nd";
    if (j === 3 && k !== 13) return n + "rd";
    return n + "th";
};

export default function ExamResultPage() {
    const { examId } = useParams();
    const router = useRouter();

    const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
    const { data: attempt, isLoading: isLoadingAttempt } = useExamAttempt(examId as string);
    const { data: result, isLoading: isLoadingResult } = useExamResult(examId as string);

    const [showConfetti, setShowConfetti] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);

    const isReleased = useMemo(() => {
        if (exam?.allowImmediateResult) return true;
        if (!exam?.resultReleaseAt) return true;
        return isAfter(new Date(), new Date(exam.resultReleaseAt));
    }, [exam]);

    // Enhanced Dynamic Analytics
    const analytics = useMemo(() => {
        if (!result || !attempt) return null;

        const scorePercentage = Math.round((result.totalScore / result.totalMarks) * 100);

        // 1. Calculate Duration Used
        const start = new Date(result.startedAt || attempt.startedAt);
        const end = new Date(result.submittedAt || attempt.submittedAt);
        const totalSeconds = differenceInSeconds(end, start);
        const formattedDuration = `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;

        // 2. Official Grading Scale (As Requested)
        let grade = "F";
        let gColor = "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
        let proficiency = "Failing";
        
        if (scorePercentage >= 90) { 
            grade = "A+"; 
            gColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"; 
            proficiency = "Elite Mastery"; 
        } else if (scorePercentage >= 70) { 
            grade = "A"; 
            gColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"; 
            proficiency = "Distinction"; 
        } else if (scorePercentage >= 60) { 
            grade = "B"; 
            gColor = "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"; 
            proficiency = "Proficient"; 
        } else if (scorePercentage >= 50) { 
            grade = "C"; 
            gColor = "text-amber-500 bg-amber-50 dark:bg-amber-500/10"; 
            proficiency = "Competent"; 
        } else if (scorePercentage >= 45) { 
            grade = "D"; 
            gColor = "text-orange-500 bg-orange-50 dark:bg-orange-500/10"; 
            proficiency = "Approaching"; 
        } else if (scorePercentage >= 40) { 
            grade = "D"; 
            gColor = "text-orange-500 bg-orange-50 dark:bg-orange-500/10"; 
            proficiency = "Marginal"; 
        }

        // 3. Standings & Velocity (Now from Backend)
        const classAvg = result.classAverage || 63;
        const diff = scorePercentage - classAvg;
        const globalStanding = result.globalStanding || 0;
        const velocity = result.velocity || 0;
        const position = result.position || 0;
        const performanceInsight = result.performanceInsight || "Great job completing your assessment!";

        return {
            scorePercentage,
            formattedDuration,
            grade,
            gradeColor: gColor,
            proficiency,
            classAvg,
            globalStanding,
            velocity,
            position,
            performanceInsight,
            isAboveAverage: diff >= 0,
            hasAnalytics: result.classAverage !== null && result.globalStanding !== null
        };
    }, [result, attempt]);

    if (isLoadingExam || isLoadingAttempt || isLoadingResult) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center gap-6">
                <div className="relative">
                    <Loader2 className="h-14 w-14 animate-spin text-primary" />
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                </div>
                <p className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-[10px]">Syncing Performance Data...</p>
            </div>
        );
    }

    if (!exam || !attempt) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-32 selection:bg-primary/20">
            <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 md:space-y-12">
                
                <div className="flex items-center justify-between px-2">
                    <button
                        onClick={() => router.push('/dashboard/student/exams&quizzes')}
                        className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all text-[11px] font-black uppercase tracking-[0.2em] group no-print"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" />
                        Performance Center
                    </button>

                    <div className="flex gap-4 no-print">
                        <Button 
                            variant="ghost"
                            onClick={() => window.print()}
                            className="rounded-2xl h-12 px-6 font-black text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                        >
                            <Download className="mr-3" size={18} /> Export Performance Data
                        </Button>
                    </div>
                </div>

                {/* Meta-Style Performance Scoreboard */}
                <div className="relative group">
                    {/* Background Decorative Blurs */}
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse delay-1000 pointer-events-none" />

                    <div className="relative overflow-hidden rounded-[3rem] md:rounded-[4.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-20">
                        
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-20">
                            
                            <div className="space-y-10 flex-1 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-4">
                                    <div className="px-5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                                       <Zap size={14} className="inline mr-2 animate-pulse" /> Finalized Record
                                    </div>
                                    <div className="px-5 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em]">
                                        Term 3 Result
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.85] italic uppercase selection:bg-primary/30">
                                        {result?.title || exam?.title}
                                    </h1>
                                    <p className="text-lg md:text-xl text-slate-500 font-bold italic opacity-60">
                                        Evaluated on {format(new Date(attempt.createdAt), "MMMM d, yyyy")}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                                    <Button
                                        onClick={() => {
                                            setIsReviewing(true);
                                            router.push(`/dashboard/student/exams&quizzes/${examId}/review`);
                                        }}
                                        disabled={isReviewing}
                                        className="h-16 px-10 text-xs font-black rounded-3xl gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest no-print"
                                    >
                                        {isReviewing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Eye size={20} /> Review My Responses</>}
                                    </Button>
                                    
                                    <div className="h-16 flex items-center gap-4 px-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <Trophy size={20} className="text-amber-500" />
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                            Position: <span className="text-slate-900 dark:text-white">{analytics?.hasAnalytics ? getOrdinal(analytics.position) : "TBD"}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 relative">
                                {isReleased && analytics ? (
                                    <div className="relative p-6">
                                        {/* Floating Score Badge */}
                                        <div className="absolute -top-4 -right-4 z-20 h-24 w-24 rounded-[2rem] bg-primary flex flex-col items-center justify-center text-white shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Grade</p>
                                            <p className="text-3xl font-black">{analytics.grade}</p>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-110 opacity-30 animate-pulse pointer-events-none" />
                                            <ProgressCircle
                                                value={analytics.scorePercentage}
                                                size={320}
                                                strokeWidth={28}
                                                label={`${result.totalScore}/${result.totalMarks}`}
                                                sublabel="AGGREGATED SCORE"
                                                className="relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-700 hover:scale-[1.02]"
                                            />
                                        </div>

                                        <div className="mt-8 text-center space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Rating</p>
                                            <p className={cn("text-2xl font-black italic uppercase", analytics.gradeColor.split(' ')[0])}>
                                                {analytics.proficiency}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-[3.5rem] p-12 border-4 border-dashed border-white dark:border-slate-800 shadow-2xl text-center space-y-8 max-w-[360px] backdrop-blur-xl">
                                        <div className="h-24 w-24 mx-auto rounded-[2rem] bg-white dark:bg-slate-900 flex items-center justify-center text-amber-500 shadow-xl border border-slate-100 dark:border-slate-800">
                                            <Lock size={44} />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase leading-none">Record Sealed</h3>
                                            <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                                                Final analytical reports release on:
                                            </p>
                                        </div>
                                        <div className="font-mono text-lg font-black text-amber-600 bg-white dark:bg-slate-950 py-5 px-8 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800">
                                            {exam.resultReleaseAt ? format(new Date(exam.resultReleaseAt), "PPP p") : "TBD"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meta-Style Grid Analytics */}
                {isReleased && analytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Summary Widget */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PerformanceMetricCard 
                                icon={<Target className="text-primary" size={24} />}
                                label="Aggregated Mastery"
                                value={`${analytics.scorePercentage}%`}
                                description="Your overall competency in this session."
                                trend={analytics.velocity}
                            />
                            <PerformanceMetricCard 
                                icon={<Users className="text-indigo-500" size={24} />}
                                label="Peer Percentile"
                                value={`Top ${100 - analytics.globalStanding}%`}
                                description="Standing against global cohort."
                                subText="Academic Elite Status"
                            />
                            <PerformanceMetricCard 
                                icon={<Clock className="text-rose-500" size={24} />}
                                label="Completion Velocity"
                                value={analytics.formattedDuration}
                                description="Time used for session submission."
                                subText="Efficient Processing"
                            />
                            <PerformanceMetricCard 
                                icon={<TrendingUp className="text-emerald-500" size={24} />}
                                label="Class Comparison"
                                value={analytics.isAboveAverage ? "Exceeded" : "Below"}
                                description={`Class average: ${analytics.classAvg}%`}
                                subText={analytics.isAboveAverage ? "Leading the class" : "Room for growth"}
                                highlight={analytics.isAboveAverage}
                            />
                        </div>

                        {/* AI Insights Sidebar */}
                        <div className="relative group overflow-hidden rounded-[3rem] bg-slate-900 border border-slate-800 p-10 flex flex-col justify-between shadow-2xl">
                             <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                <Zap size={240} className="text-primary rotate-12" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                    AI performance Insight
                                </div>
                                <Quote className="text-slate-700" size={40} />
                                <p className="text-xl font-bold text-slate-300 italic leading-relaxed">
                                    "{analytics.performanceInsight}"
                                </p>
                            </div>
                            <div className="relative z-10 pt-10 border-t border-slate-800 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Qefas Academic AI</p>
                                <Button variant="ghost" size="sm" className="rounded-xl text-primary hover:bg-primary/10 font-bold">Details</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subject performance Breakdown - Meta Cards */}
                {isReleased && analytics && (
                    <div className="space-y-10 pt-10">
                        <div className="flex items-center gap-5">
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] shrink-0">Competency Breakdown</h3>
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {result?.subjects?.map((sub: { subjectName: string; score: number; totalMarks: number; totalQuestions?: number }, i: number) => {
                                const percent = Math.round((sub.score / sub.totalMarks) * 100);
                                return (
                                    <CompetencyCard 
                                        key={i}
                                        name={sub.subjectName}
                                        percentage={percent}
                                        details={`${sub.score} / ${sub.totalMarks} Points • ${sub.totalQuestions || result.totalQuestions} Questions`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    description: string;
    trend?: number;
    subText?: string;
    highlight?: boolean;
}

function PerformanceMetricCard({ icon, label, value, description, trend, subText, highlight }: MetricCardProps) {
    return (
        <div className={cn(
            "p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-all hover:shadow-xl group",
            highlight && "ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-500/10"
        )}>
            <div className="flex justify-between items-start">
                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                    {icon}
                </div>
                {trend !== undefined && (
                   <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2", trend >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50")}>
                        {trend >= 0 ? <TrendingUp size={14} /> : <TrendingUp className="rotate-180" size={14} />}
                        {trend}% Growth
                   </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">{value}</p>
                <p className="text-[11px] font-bold text-slate-400 italic mt-2">{description}</p>
            </div>
            {subText && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subText}</span>
                    <ChevronRight size={14} className="text-slate-300" />
                </div>
            )}
        </div>
    );
}

interface CompetencyCardProps {
    name: string;
    percentage: number;
    details: string;
}

function CompetencyCard({ name, percentage, details }: CompetencyCardProps) {
    const isMastery = percentage >= 70;
    const isComp = percentage >= 40;

    return (
        <div className="group p-8 rounded-[3rem] bg-white/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
            <div className="absolute -right-8 -top-8 p-10 opacity-[0.02] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none">
                <GraduationCap size={160} />
            </div>
            
            <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                        <BarChart3 size={28} />
                    </div>
                    <div className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border",
                        isMastery ? "text-emerald-600 bg-emerald-50 border-emerald-100" : 
                        isComp ? "text-amber-600 bg-amber-50 border-amber-100" : 
                        "text-rose-600 bg-rose-50 border-rose-100"
                    )}>
                        {percentage}% Proficiency
                    </div>
                </div>

                <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors italic uppercase">{name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{details}</p>
                </div>

                <div className="space-y-4">
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800 relative shadow-inner">
                        <div 
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out", 
                                isMastery ? "bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : 
                                isComp ? "bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]" : 
                                "bg-gradient-to-r from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                            )}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
