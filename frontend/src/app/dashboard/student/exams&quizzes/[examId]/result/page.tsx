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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

/**
 * ExamResultPage
 * Shows results if released, otherwise shows status and release date.
 */
export default function ExamResultPage() {
  const { examId } = useParams();
  const router = useRouter();
  
  const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
  const { data: attempt, isLoading: isLoadingAttempt } = useExamAttempt(examId as string);
  const { data: result, isLoading: isLoadingResult } = useExamResult(examId as string);

  const isReleased = useMemo(() => {
    if (exam?.allowImmediateResult) return true;
    if (!exam?.resultReleaseAt) return false;
    return isAfter(new Date(), new Date(exam.resultReleaseAt));
  }, [exam]);

  if (isLoadingExam || isLoadingAttempt || isLoadingResult) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam || !attempt) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Exam or attempt details not found.</p>
        <Button variant="ghost" onClick={() => router.push('/dashboard/student/exams&quizzes')} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="p-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-b border-slate-100 dark:border-slate-800 relative">
          <div className="absolute top-10 right-10 opacity-10">
             <Trophy size={160} className="text-primary" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{exam.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
               <span className="flex items-center gap-1.5"><Calendar size={16} /> Taken on {format(new Date(attempt.createdAt), "PPP")}</span>
               <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
               <span className="flex items-center gap-1.5"><Clock size={16} /> Total Duration: {exam.durationMinutes} mins</span>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-12">
          {/* Main Status / Score Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div className="space-y-6">
                <div className="space-y-2">
                   <h2 className="text-xl font-bold dark:text-white">Submission Successful</h2>
                   <p className="text-slate-500 leading-relaxed">Your answers have been recorded. Based on the examination settings, your detailed breakdown is shown below.</p>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                   <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <CheckCircle2 size={24} />
                   </div>
                   <div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Status</p>
                      <p className="text-lg font-black text-emerald-900 dark:text-emerald-300">Attempt {attempt.status}</p>
                   </div>
                </div>
             </div>

             {isReleased && result ? (
               <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 h-40 w-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-4">Total Score</p>
                  <div className="flex items-baseline justify-center gap-2">
                     <span className="text-7xl font-black">{result.totalScore || 0}</span>
                     <span className="text-2xl text-slate-400 font-bold">/ {result.totalMarks || 100}</span>
                  </div>
                  <div className="mt-6 inline-block px-6 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-black">
                     Grade: {result.grade || "A"}
                  </div>
               </div>
             ) : (
               <div className="bg-amber-50 dark:bg-amber-950/20 rounded-3xl p-8 border border-amber-200 dark:border-amber-900/30 text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                     <Lock size={32} />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Results Pending</h3>
                     <p className="text-sm text-amber-700 dark:text-amber-400">Detailed results will be released on:</p>
                  </div>
                  <div className="font-mono text-xl font-bold text-amber-900 dark:text-amber-100 py-3 bg-white dark:bg-slate-950 rounded-xl shadow-inner">
                     {exam.resultReleaseAt ? format(new Date(exam.resultReleaseAt), "PPP p") : "TBD"}
                  </div>
               </div>
             )}
          </div>

          {/* Detailed Breakdown if released */}
          {isReleased && result?.subjectResults && (
            <div className="space-y-6">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <FileText className="text-primary" /> Subject wise Breakdown
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.subjects.map((sub: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all bg-slate-50/50 dark:bg-slate-800/30">
                       <div className="flex justify-between items-start mb-4">
                          <p className="font-black text-slate-900 dark:text-white">{sub.subjectName}</p>
                          <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">Passed</span>
                       </div>
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                             <p className="text-2xl font-black tracking-tight">{sub.score} <span className="text-sm text-slate-400">/ {sub.totalMarks}</span></p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</p>
                             <p className="text-lg font-bold text-emerald-600">{((sub.score / sub.totalMarks) * 100).toFixed(0)}%</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <Button 
                onClick={() => router.push(`/dashboard/student/exams&quizzes/${examId}/review`)}
                className="w-full h-14 text-lg font-bold rounded-2xl gap-2 shadow-lg hover:shadow-primary/20 transition-all"
               >
                  Review Questions & Answers <ChevronRight />
               </Button>
            </div>
          )}

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
             <Button variant="ghost" onClick={() => router.push('/dashboard/student/exams&quizzes')} className="text-slate-500 font-bold hover:text-primary">
                Return to Exams & Quizzes
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

