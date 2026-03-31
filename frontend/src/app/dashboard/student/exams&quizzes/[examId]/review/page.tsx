"use client";

import { useParams, useRouter } from "next/navigation";
import { useExam, useExamReview } from "@/lib/api/hooks/useExams";
import { 
  Loader2, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  Target,
  TrendingUp,
  Zap,
  GraduationCap,
  Eye,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { useState } from "react";

/**
 * ExamReviewPage
 * Shows question-by-question breakdown with student vs correct answers.
 */
export default function ExamReviewPage() {
  const { examId } = useParams();
  const router = useRouter();
  
  const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
  const { data: review, isLoading: isLoadingReview } = useExamReview(examId as string);

  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);

  if (isLoadingExam || isLoadingReview) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 text-center px-6">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Not Available</h2>
        <p className="mt-2 max-w-md">Detailed reviews are either not enabled for this exam or the results haven't been released yet.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-6">Go Back</Button>
      </div>
    );
  }

  const subjects = review.subjects || [];
  const currentSubject = subjects[activeSubjectIndex];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B0F1A] pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto p-6 md:p-12 lg:p-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-6">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()} 
                    className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all active:scale-95"
                >
                    <ChevronLeft size={28} className="text-slate-600 dark:text-slate-400" />
                </Button>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Review Session</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
                        <span className="h-1 w-6 bg-primary rounded-full" /> {exam?.title || "Examination Review"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                {subjects.map((sub: any, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => setActiveSubjectIndex(idx)}
                        className={cn(
                            "px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                            activeSubjectIndex === idx 
                                ? "bg-primary text-white shadow-lg shadow-primary/25 translate-y-[-2px]" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                    >
                        {sub.subjectName}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Stats & Progress */}
            <div className="lg:col-span-3 space-y-8">
                <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 sticky top-8">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Subject Mastery</p>
                        <div className="relative h-40 w-40 mx-auto">
                            <svg className="h-full w-full" viewBox="0 0 100 100">
                                <circle className="text-slate-100 dark:text-slate-800 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                                <circle 
                                    className="text-primary stroke-current" 
                                    strokeWidth="10" 
                                    strokeLinecap="round" 
                                    fill="transparent" 
                                    r="40" cx="50" cy="50" 
                                    style={{
                                        strokeDasharray: '251.2',
                                        strokeDashoffset: 251.2 - (251.2 * (currentSubject?.score / currentSubject?.totalMarks || 0)),
                                        transition: 'stroke-dashoffset 1s ease-in-out',
                                        transform: 'rotate(-90deg)',
                                        transformOrigin: 'center'
                                    }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">
                                    {Math.round((currentSubject?.score / currentSubject?.totalMarks || 0) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                            <span className="font-black text-slate-900 dark:text-white">{currentSubject?.score} / {currentSubject?.totalMarks}</span>
                        </div>
                        <div className="flex justify-between items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</span>
                            <span className="font-black text-slate-900 dark:text-white">{currentSubject?.questions?.length || 0}</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <div className="flex flex-wrap gap-2">
                             {currentSubject?.questions?.map((q: any, qIdx: number) => (
                                <div 
                                    key={qIdx} 
                                    className={cn(
                                        "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all duration-300",
                                        q.studentAnswer === q.correctAnswer 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30" 
                                            : "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
                                    )}
                                >
                                    {qIdx + 1}
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Stream */}
            <div className="lg:col-span-9 space-y-12">
                {currentSubject?.questions?.map((q: any, idx: number) => {
                    const isCorrect = q.studentAnswer === q.correctAnswer;
                    return (
                        <div key={idx} className="group relative">
                            <div className="absolute -left-16 top-10 hidden xl:flex flex-col items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 shadow-sm group-hover:scale-110 transition-transform">
                                    {idx + 1}
                                </div>
                                <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 rounded-full" />
                            </div>

                            <div className="rounded-[3rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] hover:border-primary/20 transition-all duration-500">
                                <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                                            isCorrect ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20" : "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/20"
                                        )}>
                                            {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                        </div>
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-widest",
                                            isCorrect ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {isCorrect ? "Precision Perfect" : "Learning Opportunity"}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                                        Value: {q.marks} Pts
                                    </div>
                                </div>

                                <div className="p-12 space-y-10">
                                    <LaTeXRenderer 
                                        content={q.question}
                                        className="text-2xl font-medium leading-relaxed text-slate-800 dark:text-slate-200"
                                    />

                                    {/* MCQ / TRUE_FALSE Redesign */}
                                    {(q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Normalize options logic */}
                                            {(() => {
                                                const options = (q.type === 'TRUE_FALSE' && (!q.options || !q.options.optionA))
                                                    ? { optionA: 'True', optionB: 'False' }
                                                    : (q.options || {});
                                                
                                                return Object.entries(options).map(([key, option]: [string, any]) => {
                                                    if (!option) return null;
                                                    const label = key.replace('option', '');
                                                    const isStudent = q.studentAnswer === label || (q.type === 'TRUE_FALSE' && q.studentAnswer?.toLowerCase() === option.toLowerCase());
                                                    const isCorrectOpt = q.correctAnswer === label || (q.type === 'TRUE_FALSE' && q.correctAnswer?.toLowerCase() === option.toLowerCase());
                                                    
                                                    return (
                                                        <div
                                                            key={key}
                                                            className={cn(
                                                                "flex items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden",
                                                                isCorrectOpt 
                                                                    ? "bg-emerald-50/50 border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-500/30" 
                                                                    : isStudent 
                                                                        ? "bg-rose-50/50 border-rose-500/30 dark:bg-rose-950/20 dark:border-rose-500/30"
                                                                        : "bg-slate-50/30 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm transition-transform duration-500",
                                                                isCorrectOpt ? "bg-emerald-500 text-white scale-110" : isStudent ? "bg-rose-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400 group-hover:scale-105"
                                                            )}>
                                                                {label}
                                                            </div>
                                                            <LaTeXRenderer 
                                                                content={option}
                                                                className={cn(
                                                                    "text-sm font-bold flex-1",
                                                                    isCorrectOpt ? "text-emerald-900 dark:text-emerald-200" : isStudent ? "text-rose-900 dark:text-rose-200" : "text-slate-600 dark:text-slate-400"
                                                                )}
                                                            />
                                                            {isCorrectOpt && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                                                            {!isCorrectOpt && isStudent && <XCircle className="h-6 w-6 text-rose-500" />}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    )}

                                    {/* Short Answer Redesign */}
                                    {(q.type === 'SHORT_ANSWER' || (!q.options && q.type !== 'TRUE_FALSE')) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-8 rounded-[2rem] bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 space-y-3">
                                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Your Submission
                                                </p>
                                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 italic">
                                                    {q.studentAnswer || "Explicit refusal/omission"}
                                                </p>
                                            </div>
                                            <div className="p-8 rounded-[2rem] bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 space-y-3">
                                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Validated Criterion
                                                </p>
                                                <p className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                                                    {q.correctAnswer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {(!currentSubject?.questions || currentSubject.questions.length === 0) && (
                    <div className="p-20 rounded-[4rem] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-6">
                        <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                            <HelpCircle size={48} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Zero Data points</h3>
                            <p className="text-slate-500 font-medium max-w-xs">Our analytical engines found no question records for this module.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
