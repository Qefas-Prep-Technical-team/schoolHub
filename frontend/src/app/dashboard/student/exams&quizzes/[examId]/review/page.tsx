"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useExam, useExamReview } from "@/lib/api/hooks/useExams";
import { 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  LayoutGrid,
  Filter,
  MessageSquare,
  Award,
  Download
} from "lucide-react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { useStudentProfile } from "@/lib/api/hooks/useStudent";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { generatePDF } from "@/utils/pdfGenerator";
import { assertSchoolPayingPlan } from "@/utils/subscriptionPlanCheck";

interface ReviewQuestion {
  questionId: string;
  question: string;
  images?: string[];
  type: string;
  options?: Record<string, string>;
  correctAnswer?: string;
  studentAnswer?: string | null;
  isCorrect?: boolean | null;
  scoreAwarded?: number;
  maxMarks?: number;
  requiresManualReview?: boolean;
  manuallyReviewed?: boolean;
  reviewNote?: string | null;
}

interface ReviewSubject {
  id?: string;
  subjectId?: string;
  subjectPaperId: string;
  subjectName: string;
  score: number;
  totalMarks: number;
  questions: ReviewQuestion[];
  subjectPaper?: { id: string };
  subject?: { id: string };
}

export function ExamReviewContent({ examId, isTab }: { examId: string; isTab?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: exam, isLoading: isLoadingExam } = useExam(examId);
  const { data: review, isLoading: isLoadingReview } = useExamReview(examId);

  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [filterMode, setFilterMode] = useState<"all" | "correct" | "incorrect">("all");
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const { user } = useAuthStore();
  const { data: profile } = useStudentProfile();

  const subjects: ReviewSubject[] = useMemo(() => {
    const allSubjects = (review?.subjects || []) as ReviewSubject[];
    const targetSubjectId = searchParams.get("subjectId");
    if (targetSubjectId) {
      const filtered = allSubjects.filter((s) => 
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

  const currentSubject: ReviewSubject | undefined = subjects[activeSubjectIndex];

  // Filtered question indices based on filterMode
  const filteredIndices = useMemo(() => {
    if (!currentSubject?.questions) return [];
    return currentSubject.questions
      .map((q, idx) => {
        const isCorrect = q.studentAnswer === q.correctAnswer;
        if (filterMode === "correct" && !isCorrect) return -1;
        if (filterMode === "incorrect" && isCorrect) return -1;
        return idx;
      })
      .filter((idx) => idx !== -1);
  }, [currentSubject?.questions, filterMode]);

  // Loading state
  if (isLoadingExam || isLoadingReview) {
    return (
      <div className={isTab ? "pb-20 animate-in fade-in duration-500" : "min-h-screen bg-slate-50/50 dark:bg-[#0B0F1A] pb-20 animate-in fade-in duration-500"}>
        <div className={isTab ? "w-full" : "w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:p-10"}>
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-2">
                <div className="h-7 w-48 sm:w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse mx-auto flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-slate-300 dark:text-slate-600 animate-spin" />
                </div>
                <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                <div className="h-8 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not available state
  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 text-center px-4 py-12">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Review Not Available</h2>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Detailed question reviews are either not enabled for this exam or the official score report has not yet been released.
        </p>
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          className="mt-6 rounded-xl font-bold border-slate-200 dark:border-slate-800"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" /> Go Back
        </Button>
      </div>
    );
  }

  const questions = currentSubject?.questions || [];
  const currentQuestion = questions[activeQuestionIndex];
  const totalQuestions = questions.length;
  const isCurrentCorrect = currentQuestion?.studentAnswer === currentQuestion?.correctAnswer;
  
  // Calculate accuracy
  const correctCount = questions.filter((q) => q.studentAnswer === q.correctAnswer).length;
  const incorrectCount = totalQuestions - correctCount;
  const scorePercent = currentSubject?.totalMarks && currentSubject.totalMarks > 0
    ? Math.round((currentSubject.score / currentSubject.totalMarks) * 100)
    : 0;

  const handleExportReviewPDF = async () => {
    if (!review) return;
    const schoolToVerify = profile?.school || (review as any).school || user?.schools?.[0];
    if (!assertSchoolPayingPlan(schoolToVerify)) {
      return;
    }

    try {
      setIsExportingPDF(true);

      const tableHeaders = [
        ['Q#', 'Question Text', 'Student Answer', 'Official Key', 'Points', 'Evaluation']
      ];

      const currentQuestions = currentSubject?.questions || [];
      const tableData = currentQuestions.map((q, idx) => {
        const studentAns = q.studentAnswer || '(No answer)';
        const correctAns = q.correctAnswer || '(N/A)';
        const isCorrect = q.studentAnswer === q.correctAnswer;
        const awarded = q.scoreAwarded !== undefined ? q.scoreAwarded : (isCorrect ? (q.maxMarks || 1) : 0);
        const max = q.maxMarks || 1;
        const cleanQuestion = q.question?.replace(/<[^>]+>/g, '').trim() || `Question ${idx + 1}`;

        return [
          `Q${idx + 1}`,
          cleanQuestion.length > 80 ? cleanQuestion.slice(0, 80) + '...' : cleanQuestion,
          studentAns,
          correctAns,
          `${awarded} / ${max}`,
          isCorrect ? 'CORRECT' : 'INCORRECT'
        ];
      });

      const studentNameDisplay = profile?.name || user?.name || 'Student';
      const studentIdDisplay = profile?.studentCode || user?.studentCode || 'N/A';
      const subjectNameDisplay = currentSubject?.subjectName || 'General';
      const examTitleDisplay = exam?.title || 'Examination';

      const metaData = [
        { label: 'Student Name', value: studentNameDisplay },
        { label: 'Student ID', value: studentIdDisplay },
        { label: 'Class / Grade', value: profile?.classes?.[0]?.class?.name || 'Enrolled Class' },
        { label: 'Examination', value: examTitleDisplay },
        { label: 'Subject Paper', value: subjectNameDisplay },
        { label: 'Subject Score', value: `${currentSubject?.score || 0} / ${currentSubject?.totalMarks || 0}` },
        { label: 'Accuracy Rate', value: `${scorePercent}%` },
        { label: 'Correct Questions', value: `${correctCount} of ${totalQuestions}` },
        { label: 'Review Date', value: format(new Date(), 'PPpp') }
      ];

      const additionalTables = subjects.length > 1 ? [
        {
          title: 'Overall Examination Subjects Summary',
          headers: [['Subject Paper', 'Score Obtained', 'Total Marks', 'Accuracy']],
          data: subjects.map(s => {
            const pct = s.totalMarks > 0 ? Math.round((s.score / s.totalMarks) * 100) : 0;
            return [s.subjectName, s.score.toString(), s.totalMarks.toString(), `${pct}%`];
          })
        }
      ] : undefined;

      await generatePDF({
        title: `${examTitleDisplay} - Solution Key & Performance Review`,
        filename: `${studentNameDisplay.replace(/\s+/g, '_')}_${subjectNameDisplay.replace(/\s+/g, '_')}_Review.pdf`,
        schoolProfile: schoolToVerify,
        metaData,
        tableHeaders,
        tableData,
        additionalTables,
        orientation: 'portrait'
      });
    } catch (err) {
      console.error('Error generating review PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className={isTab ? "pb-20 animate-in fade-in duration-500" : "min-h-screen bg-slate-50/50 dark:bg-[#0B0F1A] pb-24 animate-in fade-in duration-500"}>
      <div className={isTab ? "w-full" : "w-full max-w-7xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:p-8"}>
        
        {/* Top Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {!isTab && (
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()} 
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 active:scale-95"
                  aria-label="Back to results"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700 dark:text-slate-300" />
                </Button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      Exam Review
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                      Solution Key
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {exam?.title || "Examination Review"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Subject Selector Pills (Horizontal Scrollable Track) */}
              {subjects.length > 1 && (
                <div className="w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
                  <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    {subjects.map((sub, idx) => {
                      const isSelected = activeSubjectIndex === idx;
                      return (
                        <button
                          key={sub.subjectPaperId || idx}
                          onClick={() => {
                            setActiveSubjectIndex(idx);
                            setActiveQuestionIndex(0);
                          }}
                          className={cn(
                            "px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0",
                            isSelected
                              ? "bg-pink-500 text-white shadow-md shadow-pink-500/20 scale-[1.02]"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          {sub.subjectName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Export Solution Key PDF Button */}
              <Button
                onClick={handleExportReviewPDF}
                disabled={isExportingPDF || !review}
                variant="outline"
                className="h-10 sm:h-11 px-3.5 sm:px-4 text-xs font-bold rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
                title="Export Exam Review as PDF"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-600" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                )}
                <span>{isExportingPDF ? 'Exporting...' : 'Export Solution Key'}</span>
              </Button>
            </div>
          </div>

          {/* Mobile Quick Performance Bar (< lg) */}
          <div className="lg:hidden flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-black text-sm shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {currentSubject?.subjectName || "Subject"}
                    </span>
                    <span className="text-xs font-black text-pink-600 dark:text-pink-400">
                      {scorePercent}%
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {currentSubject?.score ?? 0} <span className="text-slate-400 font-normal text-xs">/ {currentSubject?.totalMarks ?? 0} pts</span>
                  </div>
                </div>
              </div>

              {/* Quick stats badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {correctCount}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                  <XCircle className="h-3.5 w-3.5" /> {incorrectCount}
                </span>
              </div>
            </div>

            {/* Mobile Question Quick-Scroll Strip + Grid Trigger */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex-1 overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-1.5">
                  {questions.map((q, qIdx) => {
                    const isCorrect = q.studentAnswer === q.correctAnswer;
                    const isActive = activeQuestionIndex === qIdx;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => setActiveQuestionIndex(qIdx)}
                        className={cn(
                          "h-8 min-w-[32px] px-1.5 rounded-lg flex items-center justify-center text-xs font-bold border transition-all duration-150 shrink-0",
                          isActive
                            ? "bg-pink-500 text-white border-pink-500 shadow-sm scale-105"
                            : isCorrect
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800"
                        )}
                        aria-label={`Go to question ${qIdx + 1}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sheet Trigger Button for Mobile Drawer */}
              <Sheet open={isGridOpen} onOpenChange={setIsGridOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 rounded-lg border-slate-200 dark:border-slate-800 text-xs font-bold gap-1 shrink-0"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    All ({totalQuestions})
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] p-6 flex flex-col">
                  <SheetHeader className="text-left pb-3 border-b border-slate-100 dark:border-slate-800">
                    <SheetTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Question Navigator</span>
                      <span className="text-xs font-bold text-slate-500">
                        {currentSubject?.subjectName}
                      </span>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 pt-4 pb-2">
                    <button
                      onClick={() => setFilterMode("all")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        filterMode === "all"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      All ({totalQuestions})
                    </button>
                    <button
                      onClick={() => setFilterMode("correct")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        filterMode === "correct"
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      )}
                    >
                      Correct ({correctCount})
                    </button>
                    <button
                      onClick={() => setFilterMode("incorrect")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        filterMode === "incorrect"
                          ? "bg-rose-600 text-white"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                      )}
                    >
                      Incorrect ({incorrectCount})
                    </button>
                  </div>

                  {/* Question Grid inside Sheet */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                      {filteredIndices.map((qIdx) => {
                        const q = questions[qIdx];
                        const isCorrect = q.studentAnswer === q.correctAnswer;
                        const isActive = activeQuestionIndex === qIdx;
                        return (
                          <button
                            key={qIdx}
                            onClick={() => {
                              setActiveQuestionIndex(qIdx);
                              setIsGridOpen(false);
                            }}
                            className={cn(
                              "h-12 rounded-xl flex flex-col items-center justify-center border font-bold text-xs transition-all",
                              isActive
                                ? "ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-slate-900 bg-pink-500 text-white border-pink-500 shadow-md scale-105"
                                : isCorrect
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800"
                            )}
                          >
                            <span className="text-xs font-black">{qIdx + 1}</span>
                            <span className="text-[9px] opacity-75">
                              {isCorrect ? "Correct" : "Wrong"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Main Review Section: Desktop Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Desktop Left Sidebar (Sticky on lg screens) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-6 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Mastery Progress Gauge */}
              <div className="text-center">
                <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-3">
                  Subject Mastery
                </p>
                <div className="relative h-32 w-32 mx-auto">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle 
                      className="text-slate-100 dark:text-slate-800 stroke-current" 
                      strokeWidth="10" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                    <circle 
                      className="text-pink-500 stroke-current" 
                      strokeWidth="10" 
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                      style={{
                        strokeDasharray: "251.2",
                        strokeDashoffset: 251.2 - (251.2 * scorePercent) / 100,
                        transition: "stroke-dashoffset 1s ease-in-out",
                        transform: "rotate(-90deg)",
                        transformOrigin: "center"
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {scorePercent}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      Accuracy
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Score</span>
                  <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                    {currentSubject?.score ?? 0} <span className="text-xs font-normal text-slate-400">/ {currentSubject?.totalMarks ?? 0}</span>
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Questions</span>
                  <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                    {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Filter Tabs on Sidebar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Filter className="h-3 w-3" /> Jump to Question
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs">
                  <button
                    onClick={() => setFilterMode("all")}
                    className={cn(
                      "py-1 rounded-lg font-bold text-[11px] transition-all",
                      filterMode === "all" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterMode("correct")}
                    className={cn(
                      "py-1 rounded-lg font-bold text-[11px] transition-all",
                      filterMode === "correct" ? "bg-emerald-500 text-white shadow-xs" : "text-slate-500 hover:text-emerald-500"
                    )}
                  >
                    Correct
                  </button>
                  <button
                    onClick={() => setFilterMode("incorrect")}
                    className={cn(
                      "py-1 rounded-lg font-bold text-[11px] transition-all",
                      filterMode === "incorrect" ? "bg-rose-500 text-white shadow-xs" : "text-slate-500 hover:text-rose-500"
                    )}
                  >
                    Wrong
                  </button>
                </div>

                {/* Question Numbers Grid */}
                <div className="grid grid-cols-5 gap-1.5 pt-1 max-h-60 overflow-y-auto pr-1">
                  {filteredIndices.map((qIdx) => {
                    const q = questions[qIdx];
                    const isCorrect = q.studentAnswer === q.correctAnswer;
                    const isActive = activeQuestionIndex === qIdx;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => setActiveQuestionIndex(qIdx)}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-all duration-200",
                          isActive
                            ? "bg-pink-500 text-white border-pink-500 shadow-md ring-2 ring-pink-500/30 scale-105"
                            : isCorrect
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-800/60 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-800/60 hover:bg-rose-100"
                        )}
                        aria-label={`Jump to question ${qIdx + 1}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Active Question Review Card (lg:col-span-8 or 9) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6">
            {currentQuestion ? (
              <div className="space-y-4">
                
                {/* Question Card */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-xs">
                  
                  {/* Card Header Banner */}
                  <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xs sm:text-sm font-black shadow-xs shrink-0">
                        {activeQuestionIndex + 1}
                      </div>

                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shadow-2xs",
                        isCurrentCorrect
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800"
                      )}>
                        {isCurrentCorrect ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {activeQuestionIndex + 1} of {totalQuestions}
                      </span>
                      <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {currentQuestion.scoreAwarded ?? (isCurrentCorrect ? currentQuestion.maxMarks : 0)} / {currentQuestion.maxMarks || 1} pts
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-6 md:p-8 space-y-6">
                    
                    {/* Figures / Question Images */}
                    {currentQuestion.images && currentQuestion.images.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {currentQuestion.images.map((url, i) => (
                          <div 
                            key={i} 
                            className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-xs"
                          >
                            <NextImage 
                              src={url} 
                              alt={`Question Figure ${i + 1}`} 
                              fill
                              className="object-contain sm:object-cover" 
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Question Stem (Formatted with LaTeX Renderer) */}
                    <div className="overflow-x-auto custom-scrollbar">
                      <LaTeXRenderer 
                        content={currentQuestion.question}
                        className="text-base sm:text-lg font-medium leading-relaxed text-slate-900 dark:text-slate-100 break-words"
                      />
                    </div>

                    {/* MCQ & TRUE_FALSE Options */}
                    {(currentQuestion.type === "MULTIPLE_CHOICE" || currentQuestion.type === "TRUE_FALSE") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {(() => {
                          const options = (currentQuestion.type === "TRUE_FALSE" && (!currentQuestion.options || !currentQuestion.options.optionA))
                            ? { optionA: "True", optionB: "False" }
                            : (currentQuestion.options || {});

                          return Object.entries(options).map(([key, optionText]) => {
                            if (!optionText) return null;
                            const label = key.replace("option", "");
                            const isStudentPick = 
                              currentQuestion.studentAnswer === label || 
                              (currentQuestion.type === "TRUE_FALSE" && currentQuestion.studentAnswer?.toLowerCase() === optionText.toLowerCase());
                            const isCorrectOpt = 
                              currentQuestion.correctAnswer === label || 
                              (currentQuestion.type === "TRUE_FALSE" && currentQuestion.correctAnswer?.toLowerCase() === optionText.toLowerCase());

                            return (
                              <div
                                key={key}
                                className={cn(
                                  "flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 relative",
                                  isCorrectOpt
                                    ? "bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/15 dark:border-emerald-500/40 shadow-xs"
                                    : isStudentPick
                                      ? "bg-rose-500/10 border-rose-500/40 dark:bg-rose-500/15 dark:border-rose-500/40 shadow-xs"
                                      : "bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800"
                                )}
                              >
                                <div className={cn(
                                  "h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-xl flex items-center justify-center font-black text-xs transition-colors",
                                  isCorrectOpt 
                                    ? "bg-emerald-500 text-white shadow-xs" 
                                    : isStudentPick 
                                      ? "bg-rose-500 text-white shadow-xs" 
                                      : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                                )}>
                                  {label}
                                </div>

                                <div className="flex-1 min-w-0 pt-0.5">
                                  <div className="overflow-x-auto">
                                    <LaTeXRenderer 
                                      content={optionText}
                                      className={cn(
                                        "text-sm font-medium leading-relaxed break-words",
                                        isCorrectOpt 
                                          ? "text-emerald-900 dark:text-emerald-200 font-semibold" 
                                          : isStudentPick 
                                            ? "text-rose-900 dark:text-rose-200 font-semibold" 
                                            : "text-slate-700 dark:text-slate-300"
                                      )}
                                    />
                                  </div>

                                  {/* Badges for answer status */}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    {isCorrectOpt && isStudentPick && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="h-3 w-3" /> Your Answer (Correct)
                                      </span>
                                    )}
                                    {isCorrectOpt && !isStudentPick && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="h-3 w-3" /> Correct Key
                                      </span>
                                    )}
                                    {!isCorrectOpt && isStudentPick && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-900/40 px-2 py-0.5 rounded-md">
                                        <XCircle className="h-3 w-3" /> Your Choice
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}

                    {/* Short Answer / Fill in the blank / Essay */}
                    {(currentQuestion.type === "SHORT_ANSWER" || (!currentQuestion.options && currentQuestion.type !== "TRUE_FALSE")) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/15 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                          <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                            <XCircle className="h-3.5 w-3.5" /> Your Answer
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 break-words">
                            {currentQuestion.studentAnswer || "No answer submitted"}
                          </p>
                        </div>
                        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/15 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5">
                          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Correct Answer
                          </p>
                          <p className="text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-100 break-words">
                            {currentQuestion.correctAnswer || "Not specified"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Teacher Feedback / Review Note (if available) */}
                    {currentQuestion.reviewNote && (
                      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            Teacher Feedback
                          </span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {currentQuestion.reviewNote}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Bottom Navigation Buttons (Responsive & Touch-Friendly) */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
                    disabled={activeQuestionIndex === 0}
                    className={cn(
                      "h-11 sm:h-12 px-4 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm border transition-all active:scale-95",
                      activeQuestionIndex === 0
                        ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-pink-500 hover:text-pink-600"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                    Question {activeQuestionIndex + 1} of {totalQuestions}
                  </div>

                  <Button
                    onClick={() => setActiveQuestionIndex(Math.min(totalQuestions - 1, activeQuestionIndex + 1))}
                    disabled={activeQuestionIndex === totalQuestions - 1}
                    className={cn(
                      "h-11 sm:h-12 px-4 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95",
                      activeQuestionIndex === totalQuestions - 1
                        ? "opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400"
                        : "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/20"
                    )}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Questions Available
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no questions recorded for this subject paper.
                </p>
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
