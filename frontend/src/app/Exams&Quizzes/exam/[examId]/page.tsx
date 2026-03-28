"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  useExam, 
  useExamAttempt, 
  useStartExamAttempt,
  useSaveAnswer, 
  useSubmitAttempt 
} from "@/lib/api/hooks/useExams";
import { Loader2, AlertCircle, Clock, FileText, Calendar, Info, PlayCircle, ChevronLeft } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { format, isAfter } from "date-fns";
import { Button as ShcnButton } from "@/components/ui/button";

// UI Components from the "start" directory
import PageHeader from './start/components/PageHeader';
import ExamDetails from './start/components/ExamDetails';
import QuestionCard from './start/components/QuestionCard';
import QuestionNavigation from './start/components/QuestionNavigation';
import ConfirmationModal from "@/app/dashboard/admin/exams/components/ui/ConfirmationModal";
import Button from './start/components/ui/Button';

/**
 * Unified Exam Page
 * Handles both Details (Preview) and Taking (Taker) modes at the same route.
 */
export default function UnifiedExamPage() {
  const { examId } = useParams();
  const router = useRouter();
  
  const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
  const { data: attempt, isLoading: isLoadingAttempt } = useExamAttempt(examId as string);
  
  const startAttemptMutation = useStartExamAttempt();
  const saveAnswerMutation = useSaveAnswer();
  const submitAttemptMutation = useSubmitAttempt();

  // Mode State
  const [showDetails, setShowDetails] = useState(true);
  
  // Navigation State
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Timer State
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Local Answer State (for responsive UI)
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});

  // Define basic memos first
  const totalDuration = useMemo(() => 
    exam?.subjectPapers?.reduce((sum: number, p: any) => sum + (p.durationMinutes || 0), 0) || exam?.durationMinutes || 0,
    [exam]
  );

  const startDate = useMemo(() => exam?.startDate ? new Date(exam.startDate) : null, [exam?.startDate]);
  const isStarted = useMemo(() => !startDate || isAfter(new Date(), startDate), [startDate]);

  const activeSubject = useMemo(() => 
    exam?.subjectPapers?.find(p => p.id === activeSubjectId), 
    [exam, activeSubjectId]
  );

  const activeQuestion = useMemo(() => 
    activeSubject?.questions?.[activeQuestionIndex], 
    [activeSubject, activeQuestionIndex]
  );

  const totalQuestionsInActiveSubject = activeSubject?.questions?.length || 0;

  // Handlers
  const handleConfirmStart = () => {
    if (!isStarted) {
      toast.warning("The exam hasn't started yet!");
      return;
    }

    if (attempt?.status === "IN_PROGRESS") {
      setShowDetails(false);
      return;
    }

    startAttemptMutation.mutate(examId as string, {
      onSuccess: () => {
        setShowDetails(false);
      }
    });
  };

  const handleSelectOption = async (optionId: string) => {
    if (!activeSubjectId || !activeQuestion?.id) {
      console.warn("Cannot save answer: missing subjectPaperId or questionId", { activeSubjectId, questionId: activeQuestion?.id });
      return;
    }

    console.log("Saving answer:", {
      examId,
      subjectPaperId: activeSubjectId,
      questionId: activeQuestion.id,
      answer: optionId
    });

    // Update local state immediately for responsive UI
    setLocalAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: optionId
    }));

    try {
      await saveAnswerMutation.mutateAsync({
        examId: examId as string,
        data: {
          subjectPaperId: activeSubjectId,
          questionId: activeQuestion.id,
          answer: optionId
        }
      });
      console.log("Answer saved successfully");
    } catch (error: any) {
      console.error("Failed to auto-save answer:", error.response?.data || error.message);
      const serverMsg = error.response?.data?.message || error.message;
      toast.error(`Auto-save failed: ${serverMsg}`);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < totalQuestionsInActiveSubject - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      const currentSubjectIdx = exam?.subjectPapers?.findIndex(p => p.id === activeSubjectId) ?? -1;
      if (currentSubjectIdx < (exam?.subjectPapers?.length ?? 0) - 1) {
        const nextSubject = exam?.subjectPapers?.[currentSubjectIdx + 1];
        setActiveSubjectId(nextSubject.id);
        setActiveQuestionIndex(0);
        toast.info(`Moving to next subject: ${nextSubject.subject?.name || nextSubject.title}`);
      }
    }
  };

  const handleTimerExpire = useCallback(async () => {
    toast.warning("Time is up! Submitting your exam automatically...");
    try {
      await submitAttemptMutation.mutateAsync(examId as string);
      router.push(`/dashboard/student/exams&quizzes/${examId}/result`);
    } catch (err) {
      toast.error("Auto-submit failed. Please try manual submission.");
    }
  }, [examId, router, submitAttemptMutation]);

  const handleManualSubmit = async () => {
    try {
      await submitAttemptMutation.mutateAsync(examId as string);
      setShowSubmitModal(false);
      router.push(`/dashboard/student/exams&quizzes/${examId}/result`);
    } catch (err) {
      toast.error("Failed to submit exam");
    }
  };

  const getSavedAnswer = (questionId: string) => {
    return attempt?.answers?.find((a: any) => a.questionId === questionId)?.answer;
  };

  // --- Effects (Moved after memos and callbacks to avoid ReferenceError) ---

  // Initialize Exam State
  useEffect(() => {
    if (exam?.subjectPapers?.length && !activeSubjectId) {
      setActiveSubjectId(exam.subjectPapers[0].id);
    }

    // Initialize local answers from attempt ONLY when attempt first loads
    if (attempt?.answers && Object.keys(localAnswers).length === 0) {
      const answers: Record<string, string> = {};
      attempt.answers.forEach((a: any) => {
        answers[a.questionId] = a.answer;
      });
      setLocalAnswers(answers);
    }
  }, [exam, attempt, activeSubjectId, localAnswers]);

  // Sync Timer and Progress
  useEffect(() => {
    if (attempt?.startedAt && totalDuration > 0 && attempt.status === "IN_PROGRESS") {
      const calculateInitial = () => {
        const startedAt = new Date(attempt.startedAt).getTime();
        const now = new Date().getTime();
        const totalDurationSeconds = totalDuration * 60;
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);
        return Math.max(0, totalDurationSeconds - elapsedSeconds);
      };

      setRemainingSeconds(calculateInitial());

      const interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 0) {
            if (prev === 0 && attempt.status === "IN_PROGRESS") {
              handleTimerExpire();
            }
            return 0;
          }
          const nextValue = prev - 1;
          // Silent log to verify it's ticking without spamming
          if (nextValue % 10 === 0) console.log("Timer tick:", nextValue);
          return nextValue;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else if (attempt?.remainingSeconds !== undefined && remainingSeconds === null) {
      setRemainingSeconds(attempt.remainingSeconds);
    }
  }, [attempt?.startedAt, attempt?.status, totalDuration, handleTimerExpire]);

  // PROTECTION: Hide taker view if already submitted
  useEffect(() => {
    const isSubmitted = attempt?.status === "SUBMITTED" || attempt?.status === "SCORED";
    if (isSubmitted && !showDetails) {
      setShowDetails(true);
      toast.info("This examination has already been submitted.");
    }
  }, [attempt?.status, showDetails]);

  if (isLoadingExam || isLoadingAttempt) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-background-light dark:bg-background-dark">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold">Exam Not Found</h2>
        <ShcnButton onClick={() => router.push('/dashboard/student/exams&quizzes')}>Return to Dashboard</ShcnButton>
      </div>
    );
  }

  // DETAILS VIEW
  if (showDetails) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 lg:p-12 animate-in fade-in duration-500">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex items-center gap-4">
             <ShcnButton variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                <ChevronLeft size={24} />
             </ShcnButton>
             <div>
                <h1 className="text-3xl font-bold text-[#111827] dark:text-white">{exam.title}</h1>
                <p className="text-slate-500">{exam.description || "Review the details before starting."}</p>
             </div>
          </div>

          <ExamDetails 
            durationMinutes={totalDuration}
            subjectName={exam.subjectPapers?.[0]?.subject?.name || "Multiple Subjects"}
            totalQuestions={exam.subjectPapers?.reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0) || 0}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   <FileText size={20} className="text-primary" />
                   Exam Structure
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {exam.subjectPapers?.map((paper: any) => (
                    <div key={paper.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1F2937] flex justify-between items-center shadow-sm">
                       <div className="flex flex-col">
                          <span className="font-bold">{paper.subject?.name || paper.title}</span>
                          <span className="text-xs text-slate-500">{paper.durationMinutes} Minutes</span>
                       </div>
                       <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-lg">
                          {paper.questions?.length || 0} Questions
                       </span>
                    </div>
                  ))}
                </div>
             </div>

             <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   <Info size={20} className="text-primary" />
                   Quick Info
                </h2>
                <div className="space-y-4">
                   <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                      <Calendar size={20} />
                      <div>
                         <p className="text-[10px] font-black uppercase">Start Date</p>
                         <p className="font-bold">{startDate ? format(startDate, "PPP p") : "Immediate"}</p>
                      </div>
                   </div>
                   <div className={`flex items-center gap-4 p-4 rounded-xl border ${
                      (attempt?.status === "SUBMITTED" || attempt?.status === "SCORED")
                        ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-100 dark:border-green-900/30"
                        : attempt?.status === "IN_PROGRESS"
                        ? "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-100 dark:border-amber-900/30"
                        : "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-100 dark:border-blue-900/30"
                   }`}>
                      <Clock size={20} />
                      <div>
                         <p className="text-[10px] font-black uppercase">Current Session</p>
                         <p className="font-bold">
                            {(attempt?.status === "SUBMITTED" || attempt?.status === "SCORED")
                              ? "Exam Submitted"
                              : attempt?.status === "IN_PROGRESS"
                              ? "Session Ongoing"
                              : "New Attempt"}
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {exam.instructions && (
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
               <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Info size={16} /> Instructions
               </h3>
               <div 
                  className="text-slate-700 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: exam.instructions }}
               />
            </div>
          )}

          {!(attempt?.status === "SUBMITTED" || attempt?.status === "SCORED") ? (
            <div className="pt-12 flex flex-col items-center space-y-6">
               <ShcnButton 
                 size="lg" 
                 className="h-16 px-16 text-xl font-bold rounded-2xl gap-3 shadow-xl shadow-primary/20 transform transition-all active:scale-95"
                 disabled={!isStarted || startAttemptMutation.isPending}
                 onClick={handleConfirmStart}
               >
                  {startAttemptMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : !isStarted ? (
                    <><Clock /> Exam Starting Soon</>
                  ) : (
                    <><PlayCircle /> {attempt?.status === "IN_PROGRESS" ? "Continue Exam" : "Start Examination"}</>
                  )}
               </ShcnButton>
               <p className="text-slate-500 text-sm italic">Clicking start will begin your official attempt.</p>
            </div>
          ) : (
            <div className="pt-12 text-center">
               <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500/10 text-green-600 font-bold border border-green-500/20">
                  <span className="material-symbols-outlined">check_circle</span>
                  Examination Completed
               </div>
               <p className="mt-4 text-slate-500">You have already submitted this exam. You can view your results in the dashboard.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // TAKER VIEW
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#111827] dark:text-[#D1D5DB]">
      <div className="flex min-h-screen w-full">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
               <PageHeader title={exam.title} />
               <ShcnButton variant="ghost" className="rounded-xl font-bold" onClick={() => setShowDetails(true)}>
                  <Info size={18} className="mr-2" /> View Details
               </ShcnButton>
            </div>
            
          <ExamDetails 
            durationMinutes={totalDuration}
            subjectName={exam.subjectPapers?.[0]?.subject?.name || "Multiple Subjects"}
            totalQuestions={exam.subjectPapers?.reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0) || 0}
          />

          {exam.instructions && (
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
               <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Info size={16} /> Instructions
               </h3>
               <div 
                  className="text-slate-700 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: exam.instructions }}
               />
            </div>
          )}

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <QuestionCard
                  id={activeQuestion?.id || ""}
                  number={activeQuestionIndex + 1}
                  totalQuestions={totalQuestionsInActiveSubject}
                  type={activeQuestion?.type}
                  text={activeQuestion?.question || ""}
                  options={
                    activeQuestion?.type === "TRUE_FALSE" 
                      ? [
                          { id: "TRUE", text: "True" },
                          { id: "FALSE", text: "False" }
                        ]
                      : [
                          ...(activeQuestion?.optionA ? [{ id: 'A', text: activeQuestion.optionA }] : []),
                          ...(activeQuestion?.optionB ? [{ id: 'B', text: activeQuestion.optionB }] : []),
                          ...(activeQuestion?.optionC ? [{ id: 'C', text: activeQuestion.optionC }] : []),
                          ...(activeQuestion?.optionD ? [{ id: 'D', text: activeQuestion.optionD }] : []),
                        ]
                  }
                  selectedOptionId={localAnswers[activeQuestion?.id || ""]}
                  onSelectOption={handleSelectOption}
                  onNext={handleNextQuestion}
                  showNextButton={true}
                />
              </div>

              <div className="lg:col-span-1">
                <QuestionNavigation
                  totalQuestions={totalQuestionsInActiveSubject}
                  currentQuestion={activeQuestionIndex + 1}
                  remainingSeconds={remainingSeconds || 0}
                  answeredQuestionIds={activeSubject?.questions?.map((q: any, idx: number) => 
                    localAnswers[q.id] ? idx.toString() : ""
                  ).filter(Boolean) || []}
                  onQuestionSelect={setActiveQuestionIndex}
                  onNextQuestion={handleNextQuestion}
                  onSubmit={() => setShowSubmitModal(true)}
                  onTimerExpire={handleTimerExpire}
                />
                
                {exam.subjectPapers && exam.subjectPapers.length > 1 && (
                   <div className="mt-6 p-4 rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937]">
                      <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-slate-400">Switch Subject</h3>
                      <div className="space-y-2">
                         {exam.subjectPapers.map(paper => (
                           <button
                             key={paper.id}
                             onClick={() => {
                               setActiveSubjectId(paper.id);
                               setActiveQuestionIndex(0);
                             }}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                               activeSubjectId === paper.id 
                                 ? "bg-primary text-white" 
                                 : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                             }`}
                           >
                             {paper.subject?.name || paper.title}
                           </button>
                         ))}
                      </div>
                   </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleManualSubmit}
        title="Submit Examination?"
        description="Are you sure you want to finish the exam? You will not be able to change your answers once submitted."
        variant="warning"
        confirmText="Yes, Submit it"
        isLoading={submitAttemptMutation.isPending}
      />
    </div>
  );
}