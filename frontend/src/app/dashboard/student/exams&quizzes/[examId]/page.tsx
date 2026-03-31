"use client";

import { useParams, useRouter } from "next/navigation";
import { useExam, useExamAttempt, useStartExamAttempt } from "@/lib/api/hooks/useExams";
import { Loader2, AlertCircle, Clock, FileText, Calendar, Info, PlayCircle, ChevronLeft } from "lucide-react";
import { format, isAfter } from "date-fns";
import { Button as ShcnButton } from "@/components/ui/button";
import ExamDetails from '@/app/Exams&Quizzes/exam/[examId]/start/components/ExamDetails';
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

/**
 * ExamDetailsPage
 * Central entry point for student exams.
 * Shows details before starting or redirects to results.
 */
export default function ExamDetailsPage() {
  const { examId } = useParams();
  const router = useRouter();
  
  const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
  const { data: attempt, isLoading: isLoadingAttempt, isError: isErrorAttempt } = useExamAttempt(examId as string);
  const startAttemptMutation = useStartExamAttempt();
  const [isViewingResult, setIsViewingResult] = useState(false);

  const totalDuration = useMemo(() => {
    if (exam?.durationMinutes && exam.durationMinutes > 0) return exam.durationMinutes;
    return exam?.subjectPapers?.reduce((sum: number, p: any) => sum + (p.durationMinutes || 0), 0) || 0;
  }, [exam]);

  const startDate = useMemo(() => exam?.startDate ? new Date(exam.startDate) : null, [exam?.startDate]);
  const isStarted = useMemo(() => !startDate || isAfter(new Date(), startDate), [startDate]);

  const handleStartAction = () => {
    if (!isStarted) {
      toast.warning("The exam hasn't started yet!");
      return;
    }

    // If attempt exists and in progress, just go to the taker
    if (attempt?.status === "IN_PROGRESS") {
      router.push(`/Exams&Quizzes/exam/${examId}`);
      return;
    }

    // Start a new attempt
    startAttemptMutation.mutate(examId as string, {
      onSuccess: () => {
        router.push(`/Exams&Quizzes/exam/${examId}`);
      }
    });
  };

  const handleViewResult = () => {
    setIsViewingResult(true);
    router.push(`/dashboard/student/exams&quizzes/${examId}/result`);
  };

  if (isLoadingExam || isLoadingAttempt) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-500 animate-pulse">Loading exam details...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold">Exam Not Found</h2>
        <ShcnButton onClick={() => router.push('/dashboard/student/exams&quizzes')}>Return to Dashboard</ShcnButton>
      </div>
    );
  }

  const isTaken = attempt?.status === "SUBMITTED" || attempt?.status === "SCORED" || attempt?.status === "EXPIRED";

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-4">
           <ShcnButton variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ChevronLeft size={24} />
           </ShcnButton>
           <div>
              <h1 className="text-3xl font-bold text-[#111827] dark:text-white">{exam.title}</h1>
              <p className="text-slate-500">{exam.description || "Review the details before starting."}</p>
           </div>
        </div>

        {/* Stats Grid */}
        <ExamDetails 
          classLabel={`${exam.class?.name || "N/A"} ${exam.class?.section || ""}`}
          durationMinutes={totalDuration}
          subjectName={exam.subjectPapers?.[0]?.subject?.name || "Multiple Subjects"}
          totalQuestions={exam.subjectPapers?.reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0) || 0}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Left Column: Structure */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                 <FileText size={20} className="text-primary" />
                 Exam Structure
              </h2>
              <div className="grid grid-cols-1 gap-4">
                 {exam.subjectPapers?.map((paper: any) => (
                  <div key={paper.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1F2937] flex justify-between items-center shadow-sm">
                     <div className="flex flex-col">
                        <span className="font-bold">
                           {paper.title || paper.subject?.name || "Unnamed Paper"}
                        </span>
                        <span className="text-xs text-slate-500">{paper.durationMinutes} Minutes</span>
                     </div>
                     <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-lg">
                        {paper.questions?.length || 0} Questions
                     </span>
                  </div>
                ))}
              </div>
           </div>

           {/* Right Column: Timing & Info */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                 <Info size={20} className="text-primary" />
                 Timing & Information
              </h2>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                    <Calendar size={20} />
                    <div>
                       <p className="text-[10px] font-black uppercase">Schedule</p>
                       <p className="font-bold">{startDate ? format(startDate, "PPP p") : "Available Now"}</p>
                    </div>
                 </div>
                 <div className={`flex items-center gap-4 p-4 rounded-xl border ${
                    isTaken
                      ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-100 dark:border-green-900/30"
                      : attempt?.status === "IN_PROGRESS"
                      ? "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:amber-300 border-amber-100 dark:border-amber-900/30"
                      : "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-100 dark:border-blue-900/30"
                 }`}>
                    <Clock size={20} />
                    <div>
                       <p className="text-[10px] font-black uppercase">Your Status</p>
                       <p className="font-bold">
                          {isTaken
                             ? "Completed & Submitted"
                             : attempt?.status === "IN_PROGRESS"
                             ? "Attempt in Progress"
                             : "Not Started"}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Instructions */}
        {exam.instructions && (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
             <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Info size={16} /> Instructions
             </h3>
             <LaTeXRenderer 
                content={exam.instructions}
                className="text-slate-700 dark:text-slate-300"
             />
          </div>
        )}

        {/* Action Button Section */}
        <div className="pt-12 flex flex-col items-center space-y-6">
           {isTaken ? (
             <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500/10 text-green-600 font-bold border border-green-500/20">
                   <span className="material-symbols-outlined">check_circle</span>
                   Examination Completed
                </div>
                <p className="text-slate-500">You have already submitted this exam.</p>
                <ShcnButton 
                  size="lg" 
                  onClick={handleViewResult} 
                  disabled={isViewingResult}
                  className="rounded-xl font-bold min-w-[160px]"
                >
                  {isViewingResult ? <Loader2 className="animate-spin h-5 w-5" /> : "View Results"}
                </ShcnButton>
             </div>
           ) : (
             <>
               <ShcnButton 
                 size="lg" 
                 className="h-16 px-16 text-xl font-bold rounded-2xl gap-3 shadow-xl shadow-primary/20 transform transition-all active:scale-95"
                 disabled={!isStarted || startAttemptMutation.isPending}
                 onClick={handleStartAction}
               >
                  {startAttemptMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : !isStarted ? (
                    <><Clock /> Exam Starting Soon</>
                  ) : (
                    <><PlayCircle /> {attempt?.status === "IN_PROGRESS" ? "Continue Exam" : "Start Examination"}</>
                  )}
               </ShcnButton>
               <p className="text-slate-500 text-sm italic">
                 {attempt?.status === "IN_PROGRESS" 
                    ? "Click to resume your session." 
                    : "Clicking start will begin your official attempt."}
               </p>
             </>
           )}
        </div>
      </div>
    </div>
  );
}
