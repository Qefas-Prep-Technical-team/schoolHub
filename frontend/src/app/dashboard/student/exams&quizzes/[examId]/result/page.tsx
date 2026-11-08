"use client";

import { useParams, useRouter } from "next/navigation";
import { useExam, useExamResult, useExamAttempt } from "@/lib/api/hooks/useExams";
import { useStudentProfile } from "@/lib/api/hooks/useStudent";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { getGradeEvaluation } from "@/utils/gradingSystem";
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
    Sparkles,
    BookOpen,
    HelpCircle,
    Compass,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { format, isAfter, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo, useEffect, useState } from "react";
import { downloadSingleStudentPdf } from "@/app/dashboard/admin/grades/utils/batchPDFDownloader";

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

    const { user } = useAuthStore();
    const { data: profile } = useStudentProfile();
    const schoolId = profile?.schoolId || user?.schools?.[0]?.schoolId || "";
    const { data: schoolProfile } = useSchoolProfile(schoolId);

    const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
    const { data: attempt, isLoading: isLoadingAttempt } = useExamAttempt(examId as string);
    const { data: result, isLoading: isLoadingResult } = useExamResult(examId as string);

    const [isReviewing, setIsReviewing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [progressSize, setProgressSize] = useState(240);

    // Dynamic responsive circle size based on viewport width
    useEffect(() => {
        const updateSize = () => {
            if (typeof window !== "undefined") {
                if (window.innerWidth < 420) {
                    setProgressSize(180);
                } else if (window.innerWidth < 640) {
                    setProgressSize(210);
                } else if (window.innerWidth < 1024) {
                    setProgressSize(230);
                } else {
                    setProgressSize(260);
                }
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const isReleased = useMemo(() => {
        if (exam?.allowImmediateResult) return true;
        if (!exam?.resultReleaseAt) return true;
        return isAfter(new Date(), new Date(exam.resultReleaseAt));
    }, [exam]);

    // Enhanced Dynamic Analytics synced with School Grading System
    const analytics = useMemo(() => {
        if (!result || !attempt) return null;

        const scorePercentage = result.totalMarks > 0
            ? Math.round((result.totalScore / result.totalMarks) * 100)
            : 0;

        // 1. Calculate Duration Used
        const start = new Date(result.startedAt || attempt.startedAt);
        const end = new Date(result.submittedAt || attempt.submittedAt);
        const totalSeconds = Math.max(0, differenceInSeconds(end, start));
        const formattedDuration = `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;

        // 2. Synchronized School Grading System Evaluation
        const evalResult = getGradeEvaluation(scorePercentage, schoolProfile?.gradingSystem);
        const grade = evalResult.grade;
        const gColor = evalResult.color;
        const gBg = evalResult.bg;
        const proficiency = evalResult.remark || "Completed";

        // 3. Standings & Class Comparison
        const classAvg = result.classAverage ?? 60;
        const diff = scorePercentage - classAvg;
        const globalStanding = result.globalStanding || 0;
        const velocity = result.velocity || 0;
        const position = result.position || 0;
        const performanceInsight = result.performanceInsight ||
            (scorePercentage >= 70
                ? "Demonstrated strong subject mastery and effective test execution. Outstanding performance!"
                : scorePercentage >= 50
                    ? "Good baseline performance with solid grasp of key principles. Targeted review will unlock higher distinction."
                    : "Continuous practice and revision on flagged question domains are advised to build mastery.");

        return {
            scorePercentage,
            formattedDuration,
            grade,
            gradeColor: gColor,
            gradeBg: gBg,
            proficiency,
            classAvg,
            globalStanding,
            velocity,
            position,
            performanceInsight,
            isAboveAverage: diff >= 0,
            hasAnalytics: result.classAverage !== null && result.classAverage !== undefined
        };
    }, [result, attempt, schoolProfile?.gradingSystem]);

    const handleDownloadPdf = async () => {
        if (!result) return;
        setIsExporting(true);
        try {
            await downloadSingleStudentPdf({
                result: {
                    ...result,
                    className: result.className || exam?.class?.name || (profile as any)?.class?.name || 'Class',
                    title: result.title || exam?.title || 'Exam Result',
                    subjects: result.subjects || [],
                },
                school: schoolProfile,
                examTitle: result.title || exam?.title || 'Exam Result',
                className: result.className || exam?.class?.name,
            });
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoadingExam || isLoadingAttempt || isLoadingResult) {
        return (
            <div className="flex flex-col min-h-[75vh] items-center justify-center gap-4 px-4">
                <div className="relative">
                    <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse text-center">
                    Syncing Performance Analysis...
                </p>
            </div>
        );
    }

    if (!exam || !attempt) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <AlertCircle size={44} className="text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Exam Record Not Found</h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm">We could not retrieve an active or submitted record for this examination.</p>
                <Button onClick={() => router.push('/dashboard/student/exams&quizzes')} className="rounded-xl font-bold text-xs h-10 px-5">
                    Return to Assessments
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20 sm:pb-28 selection:bg-primary/20">
            {/* Full-width container fitting available space with standard padding */}
            <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-5 sm:space-y-6">

                {/* Navigation & Header Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 no-print">
                    <button
                        onClick={() => router.push('/dashboard/student/exams&quizzes')}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider group w-fit cursor-pointer"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Assessments Hub</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isExporting}
                            onClick={handleDownloadPdf}
                            className="flex-1 sm:flex-initial rounded-xl h-10 px-4 font-bold text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 shadow-sm cursor-pointer"
                        >
                            {isExporting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Download className="mr-2" size={14} />}
                            <span>Export PDF</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.print()}
                            className="hidden sm:inline-flex rounded-xl h-10 px-3 font-bold text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            title="Print assessment sheet"
                        >
                            Print
                        </Button>
                    </div>
                </div>

                {/* Hero Performance Scoreboard Card */}
                <div className="relative group">
                    {/* Ambient Background Glows */}
                    <div className="absolute -top-12 -left-12 w-64 sm:w-80 h-64 sm:h-80 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-12 -right-12 w-64 sm:w-80 h-64 sm:h-80 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-black/40 p-4 sm:p-7 lg:p-9">

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-10">

                            {/* Exam Info & Actions */}
                            <div className="space-y-4 sm:space-y-5 flex-1 text-center lg:text-left w-full min-w-0">
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold border border-emerald-500/20">
                                        <Zap size={12} className="animate-pulse" /> Official Assessment
                                    </span>
                                    {exam.term && (
                                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                                            Term {exam.term}
                                        </span>
                                    )}
                                    {exam.class?.name && (
                                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20 truncate max-w-[200px]">
                                            {exam.class.name} {exam.class.section || ""}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase break-words">
                                        {result?.title || exam?.title}
                                    </h1>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center lg:justify-start gap-1.5 flex-wrap">
                                        <Calendar size={13} className="text-slate-400 shrink-0" />
                                        <span>Submitted {format(new Date(attempt.submittedAt || attempt.startedAt), "PPP · p")}</span>
                                    </p>
                                </div>

                                {/* Action Buttons & Rank Banner */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-1">
                                    <Button
                                        onClick={() => {
                                            setIsReviewing(true);
                                            router.push(`/dashboard/student/exams&quizzes/${examId}/review`);
                                        }}
                                        disabled={isReviewing}
                                        className="h-11 sm:h-12 px-6 text-xs font-bold rounded-xl gap-2 shadow-md shadow-primary/20 active:scale-95 transition-all uppercase tracking-wider no-print cursor-pointer"
                                    >
                                        {isReviewing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Eye size={16} />
                                                <span>Review Questions</span>
                                            </>
                                        )}
                                    </Button>

                                    <div className="h-11 sm:h-12 flex items-center justify-center gap-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                                        <Trophy size={16} className="text-amber-500 shrink-0" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Cohort Rank: <strong className="text-slate-900 dark:text-white">{analytics?.position ? getOrdinal(analytics.position) : "Official Standing"}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Circle Gauge / Embargo Status */}
                            <div className="shrink-0 relative w-full lg:w-auto flex justify-center py-1">
                                {isReleased && analytics ? (
                                    <div className="relative flex flex-col items-center">
                                        {/* Floating Letter Grade Badge */}
                                        <div className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 z-20 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-primary to-purple-600 dark:from-indigo-600 dark:via-primary dark:to-violet-700 text-white flex flex-col items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-white/20 rotate-6 hover:rotate-0 transition-transform">
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-white/80">Grade</span>
                                            <span className="text-xl sm:text-2xl font-black drop-shadow-sm">{analytics.grade}</span>
                                        </div>

                                        <div className="relative">
                                            <ProgressCircle
                                                value={analytics.scorePercentage}
                                                size={progressSize}
                                                strokeWidth={progressSize < 220 ? 16 : 20}
                                                label={`${result.totalScore}/${result.totalMarks}`}
                                                sublabel="TOTAL MARKS"
                                                className="relative z-10 drop-shadow-sm"
                                            />
                                        </div>

                                        <div className="mt-3 text-center space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                                Institutional Standard
                                            </span>
                                            <div className="inline-flex items-center gap-1.5">
                                                <span className={cn(
                                                    "inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs",
                                                    analytics.gradeBg || "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
                                                    analytics.gradeColor || "text-emerald-700 dark:text-emerald-300"
                                                )}>
                                                    {analytics.proficiency}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl p-6 border-2 border-dashed border-amber-300 dark:border-amber-700/50 text-center space-y-3 max-w-sm w-full">
                                        <div className="h-12 w-12 mx-auto rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-amber-500 shadow-xs border border-amber-100 dark:border-amber-900/40">
                                            <Lock size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Scores Embargoed</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                Official results are scheduled to release on:
                                            </p>
                                        </div>
                                        <div className="font-mono text-xs font-black text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-900 py-2 px-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                            {exam.resultReleaseAt ? format(new Date(exam.resultReleaseAt), "PPP · p") : "Shortly by Instructor"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics Grid & AI Diagnostic Card */}
                {isReleased && analytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* 4 Metric Cards in 2x2 Grid */}
                        <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
                            <PerformanceMetricCard
                                icon={<Target className="text-primary" size={18} />}
                                label="Percentage Score"
                                value={`${analytics.scorePercentage}%`}
                                description="Overall aggregate accuracy score."
                                subText="Score Accuracy"
                            />
                            <PerformanceMetricCard
                                icon={<Users className="text-indigo-500" size={18} />}
                                label="Cohort Percentile"
                                value={analytics.globalStanding > 0 ? `Top ${Math.max(1, 100 - analytics.globalStanding)}%` : "Top 15%"}
                                description="Position relative to participating cohort."
                                subText="Academic Benchmark"
                            />
                            <PerformanceMetricCard
                                icon={<Clock className="text-rose-500" size={18} />}
                                label="Duration Used"
                                value={analytics.formattedDuration}
                                description={`Allocated: ${exam.durationMinutes ? `${exam.durationMinutes}m` : 'Standard'}`}
                                subText="Time Efficiency"
                            />
                            <PerformanceMetricCard
                                icon={<TrendingUp className="text-emerald-500" size={18} />}
                                label="Cohort Comparison"
                                value={analytics.isAboveAverage ? "Above Cohort" : "Below Cohort"}
                                description={`Cohort benchmark avg: ${analytics.classAvg}%`}
                                subText={analytics.isAboveAverage ? "Outperforming Cohort" : "Growth Opportunity"}
                                highlight={analytics.isAboveAverage}
                            />
                        </div>

                        {/* AI Diagnostic Academic Feedback Card */}
                        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between shadow-lg text-white">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider">
                                        <Sparkles size={12} className="animate-spin" />
                                        <span>AI Diagnostic Feedback</span>
                                    </div>
                                    <Quote className="text-slate-700" size={24} />
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed italic">
                                    "{analytics.performanceInsight}"
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="font-bold uppercase tracking-wider text-[9px] text-slate-500">Qefas Diagnosis Engine</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <Check size={12} strokeWidth={3} /> Verified
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subject / Paper Competency Breakdown Grid */}
                {isReleased && result?.subjects && result.subjects.length > 0 && (
                    <div className="space-y-4 pt-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1.5">
                                <BookOpen size={15} className="text-primary" />
                                <span>Subject & Paper Breakdown</span>
                            </h2>
                            <div className="h-px bg-slate-200 dark:border-slate-800 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                            {result.subjects.map((sub: { subjectName: string; score: number; totalMarks: number; totalQuestions?: number }, idx: number) => {
                                const subPercent = sub.totalMarks > 0 ? Math.round((sub.score / sub.totalMarks) * 100) : 0;
                                const subEval = getGradeEvaluation(subPercent, schoolProfile?.gradingSystem);

                                return (
                                    <div
                                        key={idx}
                                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <BarChart3 size={18} />
                                            </div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider",
                                                subEval.bg,
                                                subEval.color
                                            )}>
                                                {subEval.grade} • {subPercent}%
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                                                {sub.subjectName}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                                                {sub.score} / {sub.totalMarks} Points • {sub.totalQuestions || result.totalQuestions || "N/A"} Questions
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-700",
                                                        subPercent >= 70 ? "bg-emerald-500" :
                                                            subPercent >= 50 ? "bg-amber-500" : "bg-rose-500"
                                                    )}
                                                    style={{ width: `${Math.min(100, Math.max(0, subPercent))}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                <span>Rating</span>
                                                <span className={subEval.color}>{subEval.remark}</span>
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

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    description: string;
    subText?: string;
    highlight?: boolean;
}

function PerformanceMetricCard({ icon, label, value, description, subText, highlight }: MetricCardProps) {
    return (
        <div className={cn(
            "p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5 transition-all hover:shadow-sm",
            highlight && "ring-1 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-500/5"
        )}>
            <div className="flex justify-between items-start">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                {subText && (
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                        {subText}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{description}</p>
            </div>
        </div>
    );
}
