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
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { format, isAfter, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo, useEffect, useState } from "react";

/**
 * ExamResultPage - Refined with A+ Grading Scale, Global Standing & Velocity Analytics
 */
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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-32">
            <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => router.push('/dashboard/student/exams&quizzes')}
                        className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest group no-print"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" />
                        Back to Performance Center
                    </button>

                    <Button 
                        onClick={() => window.print()}
                        className="rounded-2xl h-10 px-6 font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm hover:shadow-lg transition-all no-print"
                        variant="outline"
                    >
                        <Download className="mr-2" size={16} /> Download Result PDF
                    </Button>
                </div>

                {/* Hero Result Section */}
                <div className="relative overflow-hidden rounded-[4rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] p-10 md:p-16">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
                        <Trophy size={600} className="text-primary rotate-12 -translate-y-32 translate-x-32" />
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 relative z-10">
                        <div className="space-y-10 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 shadow-sm">
                                    <CheckCircle2 size={16} /> Submission Confirmed
                                </div>
                                {analytics && (
                                    <div className={cn("px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm", analytics.gradeColor)}>
                                        {analytics.grade} Official Standing
                                    </div>
                                )}
                            </div>

                            <div>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.9] mb-4">
                                    {result?.title || exam?.title}
                                </h1>
                                <p className="text-xl text-slate-500 font-medium italic border-l-4 border-primary pl-5 mt-8">
                                    Session performance from <span className="text-slate-900 dark:text-white font-black">{format(new Date(attempt.createdAt), "MMMM d, yyyy")}</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Average</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                                        {analytics?.hasAnalytics ? `${analytics.classAvg}%` : "TBD"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proficiency</p>
                                    <p className={cn("text-3xl font-black italic", analytics?.gradeColor.split(' ')[0])}>
                                        {analytics?.hasAnalytics ? analytics.proficiency : 'TBD'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Used</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.formattedDuration || 'TBD'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0 flex justify-center">
                            {isReleased && analytics ? (
                                <div className="relative group p-4">
                                    <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-150 opacity-40 animate-pulse" />
                                    <ProgressCircle
                                        value={analytics.scorePercentage}
                                        size={300}
                                        strokeWidth={24}
                                        label={`${result.totalScore}/${result.totalMarks}`}
                                        sublabel="Aggregated Score"
                                        className="relative z-10 transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-[3rem] p-12 border-2 border-dashed border-amber-200 dark:border-amber-900/30 text-center space-y-8 max-w-[360px]">
                                    <div className="h-20 w-20 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 shadow-xl border border-white dark:border-slate-800">
                                        <Lock size={40} />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-amber-900 dark:text-amber-100 italic tracking-tight uppercase">Scores Embargoed</h3>
                                        <p className="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                                            Your detailed analytical reports are currently being finalized and will be released on:
                                        </p>
                                    </div>
                                    <div className="font-mono text-lg font-black text-amber-900 dark:text-amber-100 py-4 px-6 bg-white dark:bg-slate-950 rounded-2xl shadow-inner border border-amber-200">
                                        {exam.resultReleaseAt ? format(new Date(exam.resultReleaseAt), "PPP p") : "TBD"}
                                    </div>
                                    <div className="pt-4">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => router.push('/dashboard/student/exams&quizzes')}
                                            className="w-full rounded-2xl border-amber-200 text-amber-800 hover:bg-amber-50"
                                        >
                                            Return to Performance Center
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!isReleased && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-700 delay-300">
                        <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                                <FileText size={24} />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight italic">Secure Storing</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">Your answers are stored in our encrypted database and are currently being audited for final accuracy.</p>
                        </div>
                        <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                                <Trophy size={24} />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight italic">Performance Audit</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">Ranking and percentile calculations will be performed once all candidates have completed the session.</p>
                        </div>
                        <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                                <Calendar size={24} />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight italic">Official Release</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">Once released, you will receive a notification and can download your official score transcipt.</p>
                        </div>
                    </div>
                )}

                {/* Subject Breakdown & Review Call-to-Action */}
                {isReleased && analytics && (
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                                    <BarChart3 className="text-primary h-8 w-8" /> 
                                    Subject performance Breakdown
                                </h3>
                                <p className="text-slate-500 font-medium mt-1">Detailed granular analysis of your competency across all tested sub-modules.</p>
                            </div>
                            
                            <Button
                                onClick={() => {
                                    setIsReviewing(true);
                                    router.push(`/dashboard/student/exams&quizzes/${examId}/review`);
                                }}
                                disabled={isReviewing}
                                className="h-14 px-8 text-sm font-black rounded-2xl gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group relative overflow-hidden shrink-0"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isReviewing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Eye size={18} /> Review All Answers</>}
                                </span>
                                {!isReviewing && <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {result?.subjects?.map((sub: any, i: number) => {
                                const percent = Math.round((sub.score / sub.totalMarks) * 100);
                                return (
                                    <div key={i} className="group p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none">
                                            <GraduationCap size={80} />
                                        </div>
                                        
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                                    <Target size={28} />
                                                </div>
                                                <div className={cn(
                                                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border",
                                                    percent >= 70 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : 
                                                    percent >= 40 ? "text-amber-600 bg-amber-50 border-amber-100" : 
                                                    "text-rose-600 bg-rose-50 border-rose-100"
                                                )}>
                                                    {percent}% Mastery
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xl font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">{sub.subjectName}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>{sub.score} / {sub.totalMarks} Points</span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span>{sub.totalQuestions || result.totalQuestions} Questions</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                                                    <div 
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]", 
                                                            percent >= 70 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : 
                                                            percent >= 40 ? "bg-gradient-to-r from-amber-400 to-amber-600" : 
                                                            "bg-gradient-to-r from-rose-400 to-rose-600"
                                                        )}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    <span>Beginning</span>
                                                    <span>Expertise</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
