"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useExam, useExamReview } from "@/lib/api/hooks/useExams";
import { 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  Target,
  Eye
} from "lucide-react";
import NextImage from 'next/image';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import React, { useState, useEffect, useMemo } from "react";

export function ExamReviewContent({ examId, isTab }: { examId: string, isTab?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
  const { data: review, isLoading: isLoadingReview } = useExamReview(examId as string);

  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const subjects = useMemo(() => {
    const allSubjects = review?.subjects || [];
    const targetSubjectId = searchParams.get('subjectId');
    if (targetSubjectId) {
      const filtered = allSubjects.filter((s: any) => 
        s.id === targetSubjectId || 
        s.subjectPaperId === targetSubjectId || 
        s.subjectPaper?.id === targetSubjectId || 
        s.subjectId === targetSubjectId || 
        s.subject?.id === targetSubjectId
      );
      if (filtered.length > 0) return filtered;
    }
    return allSubjects;
  }, [review?.subjects, searchParams]);
  if (isLoadingExam || isLoadingReview) {
    return (
      <div className={isTab ? "pb-20 animate-in fade-in duration-500" : "min-h-screen bg-slate-50/50 dark:bg-[#0B0F1A] pb-20 animate-in fade-in duration-500"}>
        <div className={isTab ? "" : "w-[95%] max-w-[95%] mx-auto p-6 md:p-12 lg:p-16"}>
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            {!isTab && (
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
               <div className="h-10 w-24 rounded-[1.5rem] bg-pink-100 dark:bg-pink-900/20 animate-pulse" />
               <div className="h-10 w-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />
               <div className="h-10 w-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-3 space-y-8">
              <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto animate-pulse" />
                <div className="relative h-40 w-40 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse border-[10px] border-slate-50 dark:border-slate-900 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-slate-300 dark:text-slate-700 animate-spin" />
                </div>
                <div className="space-y-4">
                  <div className="h-14 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  <div className="h-14 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="lg:col-span-9 space-y-6">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  </div>
                  <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
                <div className="p-6 md:p-8 space-y-8">
                  <div className="space-y-4">
                    <div className="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-6 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                 <div className="flex gap-1.5">
                   {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                   ))}
                 </div>
                 <div className="h-10 w-28 rounded-xl bg-pink-100 dark:bg-pink-900/30 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
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


  const currentSubject = subjects[activeSubjectIndex];

  return (
    <div className={isTab ? "pb-20 animate-in fade-in duration-700" : "min-h-screen bg-slate-50/50 dark:bg-[#0B0F1A] pb-20 animate-in fade-in duration-700"}>
      <div className={isTab ? "" : "w-[95%] max-w-[95%] mx-auto p-6 md:p-12 lg:p-16"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            {!isTab && (
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
            )}

            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                {subjects.map((sub: Record<string, any>, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => { setActiveSubjectIndex(idx); setActiveQuestionIndex(0); }}
                        className={cn(
                            "px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                            activeSubjectIndex === idx 
                                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25 translate-y-[-2px]" 
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
                <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 sticky top-8">
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

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-5 sm:grid-cols-6 xl:grid-cols-7 gap-2 pt-2">
                             {currentSubject?.questions?.map((q: Record<string, any>, qIdx: number) => (
                                <button 
                                    key={qIdx} 
                                    onClick={() => setActiveQuestionIndex(qIdx)}
                                    className={cn(
                                        "w-full aspect-square rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black border transition-all duration-300",
                                        q.studentAnswer === q.correctAnswer 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30" 
                                            : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30",
                                        activeQuestionIndex === qIdx && "ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-md"
                                    )}
                                >
                                    {qIdx + 1}
                                </button>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Stream */}
            <div className="lg:col-span-9 space-y-6">
                {currentSubject?.questions && currentSubject.questions[activeQuestionIndex] && (() => {
                    const idx = activeQuestionIndex;
                    const q = currentSubject.questions[idx];
                    const isCorrect = q.studentAnswer === q.correctAnswer;
                    const total = currentSubject.questions.length;
                    return (
                        <div key={idx} className="group animate-in slide-in-from-right-8 duration-500 space-y-4">
                            {/* Card */}
                            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                {/* Card Header */}
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-xs font-black text-pink-600 dark:text-pink-400 shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold",
                                            isCorrect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                        )}>
                                            {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                            {isCorrect ? "Correct" : "Incorrect"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {idx + 1} / {total}
                                        </span>
                                        <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                            {q.maxMarks || 0} pts
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 md:p-8 space-y-8">
                                    {q.images && q.images.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {q.images.map((url: string, i: number) => (
                                                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm w-full">
                                                  <NextImage 
                                                    src={url} 
                                                    alt={`Question Figure ${i + 1}`} 
                                                    fill
                                                    className="object-cover" 
                                                  />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <LaTeXRenderer 
                                        content={q.question}
                                        className="text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-200"
                                    />

                                    {/* MCQ / TRUE_FALSE */}
                                    {(q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                                                "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                                                                isCorrectOpt 
                                                                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800" 
                                                                    : isStudent 
                                                                        ? "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800"
                                                                        : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-black text-xs",
                                                                isCorrectOpt ? "bg-emerald-500 text-white" : isStudent ? "bg-rose-500 text-white" : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                                                            )}>
                                                                {label}
                                                            </div>
                                                            <LaTeXRenderer 
                                                                content={option}
                                                                className={cn(
                                                                    "text-sm font-medium flex-1",
                                                                    isCorrectOpt ? "text-emerald-800 dark:text-emerald-300" : isStudent ? "text-rose-800 dark:text-rose-300" : "text-slate-600 dark:text-slate-400"
                                                                )}
                                                            />
                                                            {isCorrectOpt && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                                                            {!isCorrectOpt && isStudent && <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    )}

                                    {/* Short Answer */}
                                    {(q.type === 'SHORT_ANSWER' || (!q.options && q.type !== 'TRUE_FALSE')) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 rounded-xl bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 space-y-2">
                                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                                    <XCircle size={12} /> Your Answer
                                                </p>
                                                <p className="text-base font-semibold text-slate-700 dark:text-slate-300 italic">
                                                    {q.studentAnswer || "No answer submitted"}
                                                </p>
                                            </div>
                                            <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 space-y-2">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                    <CheckCircle2 size={12} /> Correct Answer
                                                </p>
                                                <p className="text-base font-bold text-emerald-800 dark:text-emerald-200">
                                                    {q.correctAnswer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Prev / Next Navigation */}
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    onClick={() => setActiveQuestionIndex(Math.max(0, idx - 1))}
                                    disabled={idx === 0}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all",
                                        idx === 0
                                            ? "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
                                            : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-pink-400 hover:text-pink-600 dark:hover:text-pink-400"
                                    )}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>

                                <div className="hidden sm:flex items-center gap-1.5">
                                    {currentSubject.questions.slice(
                                        Math.max(0, idx - 4),
                                        Math.min(total, idx + 5)
                                    ).map((_: any, dotI: number) => {
                                        const realIdx = Math.max(0, idx - 4) + dotI;
                                        return (
                                            <button
                                                key={realIdx}
                                                onClick={() => setActiveQuestionIndex(realIdx)}
                                                className={cn(
                                                    "rounded-full transition-all duration-200",
                                                    realIdx === idx
                                                        ? "w-6 h-2 bg-pink-500"
                                                        : "w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-pink-300"
                                                )}
                                            />
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setActiveQuestionIndex(Math.min(total - 1, idx + 1))}
                                    disabled={idx === total - 1}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all",
                                        idx === total - 1
                                            ? "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
                                            : "border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-500 hover:text-white hover:border-pink-500"
                                    )}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })()} 

                {(!currentSubject?.questions || currentSubject.questions.length === 0) && (
                    <div className="p-16 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                            <HelpCircle size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">No Questions Found</h3>
                            <p className="text-sm text-slate-500">No question records are available for this subject.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}


export default function ExamReviewPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = React.use(params);
  return <ExamReviewContent examId={examId} />;
}
