"use client";

import { useParams, useRouter } from "next/navigation";
import { useExam, useExamReview } from "@/lib/api/hooks/useExams";
import { 
  Loader2, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    <div className="max-w-5xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
           <ChevronLeft size={24} />
        </Button>
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white">Exam Review</h1>
           <p className="text-slate-500 font-medium">{exam?.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Subject Selector Sidebar */}
        <div className="lg:col-span-1 space-y-2">
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 mb-2">Subjects</p>
           {subjects.map((sub: any, idx: number) => (
             <button
               key={idx}
               onClick={() => setActiveSubjectIndex(idx)}
               className={cn(
                 "w-full text-left p-4 rounded-2xl transition-all border flex flex-col gap-1",
                 activeSubjectIndex === idx 
                   ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                   : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary/50"
               )}
             >
               <span className="font-bold">{sub.subjectName}</span>
               <span className={cn("text-[10px] font-black", activeSubjectIndex === idx ? "text-white/70" : "text-slate-400")}>
                  {sub.score} / {sub.totalMarks} Marks
               </span>
             </button>
           ))}
        </div>

        {/* Questions List */}
        <div className="lg:col-span-3 space-y-6">
           {currentSubject?.questions?.map((q: any, idx: number) => {
             const isCorrect = q.studentAnswer === q.correctAnswer;
             return (
               <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {/* Question Header */}
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <span className="text-xs font-black bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500">
                        QUESTION {idx + 1}
                     </span>
                     {isCorrect ? (
                       <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                          <CheckCircle2 size={14} /> CORRECT (+{q.marks})
                       </span>
                     ) : (
                       <span className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
                          <XCircle size={14} /> INCORRECT (0)
                       </span>
                     )}
                  </div>

                  <div className="p-8 space-y-6">
                     <div 
                      className="text-lg font-medium leading-relaxed dark:text-slate-200 prose prose-slate dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: q.question }}
                     />

                     {/* Options for MCQ */}
                     {q.options && typeof q.options === 'object' && (
                        <div className="grid grid-cols-1 gap-3">
                           {Object.entries(q.options).map(([key, option]: [string, any], oIdx: number) => {
                              if (!option) return null;
                              const label = key.replace('option', '');
                              const isStudentAnswer = q.studentAnswer === label;
                              const isCorrectAnswer = q.correctAnswer === label;

                              return (
                                <div
                                  key={key}
                                  className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                    isCorrectAnswer 
                                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50" 
                                      : isStudentAnswer 
                                        ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50"
                                        : "bg-white dark:bg-slate-950/50 border-slate-100 dark:border-slate-800"
                                  )}
                                >
                                   <div className={cn(
                                      "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm",
                                      isCorrectAnswer ? "bg-emerald-500 text-white" : isStudentAnswer ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                   )}>
                                      {label}
                                   </div>
                                   <span className={cn(
                                      "text-sm font-medium flex-1",
                                      isCorrectAnswer ? "text-emerald-900 dark:text-emerald-300" : isStudentAnswer ? "text-red-900 dark:text-red-300" : "text-slate-600 dark:text-slate-400"
                                   )}>
                                      {option}
                                   </span>
                                   {isCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                   {!isCorrect && isStudentAnswer && <XCircle className="h-5 w-5 text-red-500" />}
                                </div>
                              );
                           })}
                        </div>
                     )}

                     {!q.options && (
                        <div className="space-y-4">
                           <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Your Answer</p>
                              <p className="font-medium text-slate-700 dark:text-slate-300">{q.studentAnswer || "No answer provided"}</p>
                           </div>
                           <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                              <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Correct Answer</p>
                              <p className="font-bold text-emerald-900 dark:text-emerald-300">{q.correctAnswer}</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
             );
           })}

           {(!currentSubject?.questions || currentSubject.questions.length === 0) && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                 <HelpCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                 <p className="text-slate-500 font-medium">No questions found for this subject.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
