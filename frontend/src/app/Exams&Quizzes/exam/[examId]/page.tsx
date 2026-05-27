"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  useExam, 
  useExamAttempt, 
  useStartExamAttempt,
  useSaveAnswer, 
  useSubmitAttempt 
} from "@/lib/api/hooks/useExams";
import { Loader2, AlertCircle, Clock, FileText, Calendar, Info, PlayCircle, ChevronLeft, BookOpen, Lock as LockIcon, ChevronRight as ChevronRightIcon } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { format, isAfter } from "date-fns";
import { Button as ShcnButton } from "@/components/ui/button";
import StudentReadingModal from "./components/StudentReadingModal";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import ImageLightbox from "@/components/ui/ImageLightbox";

// UI Components from the "start" directory
import PageHeader from './start/components/PageHeader';
import ExamDetails from './start/components/ExamDetails';
import QuestionCard from './start/components/QuestionCard';
import QuestionNavigation from './start/components/QuestionNavigation';
import ConfirmationModal from "@/app/dashboard/admin/exams/components/ui/ConfirmationModal";
import { SubjectPaper, SubjectAttempt } from "@/lib/api/services/examService";
import { AxiosError } from "axios";

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
  const [showDetails, setShowDetails] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  
  // Navigation State
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string, alt?: string } | null>(null);
  
  // Timer State
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Local Answer State (for responsive UI)
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});

  // Submission Guard & UI state
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isSubmittingRef = useRef(false);
  const initialAnswersRestoredRef = useRef(false);

  // Define basic memos first
  const totalDuration = useMemo(() => {
    if (exam?.durationMinutes && exam.durationMinutes > 0) return exam.durationMinutes;
    return exam?.subjectPapers?.reduce((sum: number, p: SubjectPaper) => sum + (p.durationMinutes || 0), 0) || 0;
  }, [exam]);

  const startDate = useMemo(() => exam?.startDate ? new Date(exam.startDate) : null, [exam?.startDate]);
  const isStarted = useMemo(() => !startDate || isAfter(new Date(), startDate), [startDate]);

  const isReleased = useMemo(() => {
    if (exam?.allowImmediateResult) return true;
    if (!exam?.resultReleaseAt) return true;
    return isAfter(new Date(), new Date(exam.resultReleaseAt));
  }, [exam]);

  const currentSubjectPapers = useMemo(() => {
    if (attempt?.status === "IN_PROGRESS" && attempt.subjectAttempts?.length > 0) {
      return attempt.subjectAttempts.map((sa: SubjectAttempt) => ({
        ...sa.subjectPaper,
        id: sa.subjectPaperId,
      }));
    }
    return (exam?.subjectPapers || []) as SubjectPaper[];
  }, [exam?.subjectPapers, attempt]);

  const activeSubject = useMemo(() => 
    currentSubjectPapers.find((p: SubjectPaper) => p.id === activeSubjectId), 
    [currentSubjectPapers, activeSubjectId]
  );

  const activeQuestion = useMemo(() => 
    activeSubject?.questions?.[activeQuestionIndex], 
    [activeSubject, activeQuestionIndex]
  );

  const totalQuestionsInActiveSubject = activeSubject?.questions?.length || 0;

  const activeSubjectImages = useMemo(() => activeSubject?.images || [], [activeSubject?.images]);
  const activeSubjectLabels = useMemo(() => activeSubject?.imageLabels || [], [activeSubject?.imageLabels]);
  const activeQuestionImages = useMemo(() => activeQuestion?.images || [], [activeQuestion?.images]);
  const activeQuestionLabels = useMemo(() => activeQuestion?.imageLabels || [], [activeQuestion?.imageLabels]);

  // Handlers
  const handleConfirmStart = () => {
    if (!isStarted) {
      toast.warning("The exam hasn't started yet!");
      return;
    }

    setIsTransitioning(true);

    if (attempt?.status === "IN_PROGRESS") {
      setTimeout(() => {
        setShowDetails(false);
        setIsTransitioning(false);
      }, 50);
      return;
    }

    startAttemptMutation.mutate(examId as string, {
      onSuccess: () => {
        setIsTransitioning(false);
        setShowDetails(false);
      },
      onError: () => {
        setIsTransitioning(false);
      }
    });
  };

  const handleSelectOption = async (optionId: string) => {
    if (!activeSubjectId || !activeQuestion?.id) {
      console.warn("Cannot save answer: missing subjectPaperId or questionId", { activeSubjectId, questionId: activeQuestion?.id });
      return;
    }

    // console.log("Saving answer:", {
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
      // console.log("Answer saved successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Failed to auto-save answer:", axiosError.response?.data || axiosError.message);
      const serverMsg = axiosError.response?.data?.message || axiosError.message;
      toast.error(`Auto-save failed: ${serverMsg}`);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < totalQuestionsInActiveSubject - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      const currentSubjectIdx = currentSubjectPapers.findIndex((p: SubjectPaper) => p.id === activeSubjectId) ?? -1;
      if (currentSubjectIdx < currentSubjectPapers.length - 1) {
        const nextSubject = currentSubjectPapers[currentSubjectIdx + 1];
        if (nextSubject) {
          setActiveSubjectId(nextSubject.id);
          setActiveQuestionIndex(0);
          toast.info(`Moving to next subject: ${nextSubject.title || (nextSubject as { subject?: { name?: string } }).subject?.name || "Unnamed Paper"}`, { toastId: "subject-switch" });
        }
      }
    }
  };

  const handleTimerExpire = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    setIsAutoSubmitting(true);
    toast.warning("Time is up! Submitting your exam automatically...", { toastId: "timer-expire" });
    
    try {
      await submitAttemptMutation.mutateAsync(examId as string);
      // Short delay to ensure user sees the "Submitting" state before redirect
      setTimeout(() => {
        router.push(`/dashboard/student/exams&quizzes/${examId}/result`);
      }, 1000);
    } catch (err) {
      console.error("Auto-submit failed:", err);
      setIsAutoSubmitting(false);
      isSubmittingRef.current = false;
      toast.error("Auto-submit failed. Please try manual submission.", { toastId: "auto-submit-fail" });
    }
  }, [examId, router, submitAttemptMutation]);

  const handleZoom = useCallback((src: string, alt?: string) => {
    setLightboxImage({ src, alt });
  }, []);

  const handleManualSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      await submitAttemptMutation.mutateAsync(examId as string);
      setShowSubmitModal(false);
      router.push(`/dashboard/student/exams&quizzes/${examId}/result`);
    } catch {
      isSubmittingRef.current = false;
      toast.error("Failed to submit exam");
    }
  };

  // --- Effects (Moved after memos and callbacks to avoid ReferenceError) ---

  // Initialize Exam State
  useEffect(() => {
    if (currentSubjectPapers.length && !activeSubjectId) {
      setActiveSubjectId(currentSubjectPapers[0].id);
    }

    // Initialize local answers from attempt ONLY once
    if (attempt?.subjectAttempts && !initialAnswersRestoredRef.current) {
      const restoredAnswers: Record<string, string> = {};
      let hasAnswers = false;
      attempt.subjectAttempts.forEach((sa: { answers?: { questionId: string, answer: string }[] }) => {
        sa.answers?.forEach((a) => {
          restoredAnswers[a.questionId] = a.answer;
          hasAnswers = true;
        });
      });
      
      if (hasAnswers) {
        // console.log("Restored saved answers:", Object.keys(restoredAnswers).length);
        setLocalAnswers(restoredAnswers);
      }
      initialAnswersRestoredRef.current = true;
    }
  }, [exam, attempt, activeSubjectId, initialAnswersRestoredRef, currentSubjectPapers]);

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
  }, [attempt?.startedAt, attempt?.status, attempt?.remainingSeconds, remainingSeconds, totalDuration, handleTimerExpire]);

  // PROTECTION: Hide taker view if already submitted
  useEffect(() => {
    const isSubmitted = attempt?.status === "SUBMITTED" || attempt?.status === "SCORED";
    // Only show toast and switch view if it wasn't triggered by our own auto-submit logic
    if (isSubmitted && !showDetails && !isAutoSubmitting) {
      setShowDetails(true);
      toast.info("This examination has already been submitted.", { toastId: "already-submitted" });
    }
  }, [attempt?.status, showDetails, isAutoSubmitting]);

  // PROTECTION: Hide taker view if no active attempt is in progress
  useEffect(() => {
    if (isLoadingAttempt) return;
    
    if (!attempt || attempt.status !== "IN_PROGRESS") {
      if (!showDetails) {
        // console.log("Blocking taker view: No active session found.");
        setShowDetails(true);
      }
    }
  }, [attempt, isLoadingAttempt, showDetails]);

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
            classLabel={`${exam.class?.name || "N/A"} ${exam.class?.section || ""}`}
            durationMinutes={totalDuration}
            subjectName={exam.subjectPapers?.[0]?.subject?.name || "Multiple Subjects"}
            totalQuestions={currentSubjectPapers.reduce((sum: number, p: SubjectPaper) => sum + (p.questions?.length || 0), 0)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   <FileText size={20} className="text-primary" />
                   Exam Structure
                </h2>
                <div className="grid grid-cols-1 gap-4">
                   {exam.subjectPapers?.map((paper: SubjectPaper) => (
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
                        ? "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:amber-300 border-amber-100 dark:border-amber-900/30"
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
               <LaTeXRenderer 
                  content={exam.instructions}
                  className="text-slate-700 dark:text-slate-300"
               />
            </div>
          )}

          {!(attempt?.status === "SUBMITTED" || attempt?.status === "SCORED") ? (
            <div className="pt-12 flex flex-col items-center space-y-6">
               <ShcnButton 
                 size="lg" 
                 className="h-16 px-16 text-xl font-bold rounded-2xl gap-3 shadow-xl shadow-primary/20 transform transition-all active:scale-95"
                 disabled={!isStarted || startAttemptMutation.isPending || isTransitioning}
                 onClick={handleConfirmStart}
               >
                  {startAttemptMutation.isPending || isTransitioning ? (
                    <><Loader2 className="animate-spin" /> Loading Exam Environment...</>
                  ) : !isStarted ? (
                    <><Clock /> Exam Starting Soon</>
                  ) : (
                    <><PlayCircle /> {attempt?.status === "IN_PROGRESS" ? "Continue Exam" : "Start Examination"}</>
                  )}
               </ShcnButton>
               <p className="text-slate-500 text-sm italic">Clicking start will begin your official attempt.</p>
            </div>
          ) : (
            <div className="pt-12 text-center space-y-6">
               <div className="inline-flex items-center gap-3 px-8 py-4 rounded-[2rem] bg-emerald-500/5 text-emerald-600 font-black border border-emerald-500/10 shadow-sm animate-in zoom-in duration-500">
                  <span className="material-symbols-outlined">check_circle</span>
                  SUBMISSION CONFIRMED
               </div>
               
               <div className="max-w-md mx-auto p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
                 <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                   Great job! Your examination attempt has been securely recorded. 
                 </p>
                 
                 {!isReleased ? (
                   <div className="mt-8 p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                     <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2 flex items-center justify-center gap-2">
                       <LockIcon size={12} /> Results Embargoed
                     </p>
                     <p className="text-sm font-bold text-amber-900 dark:text-amber-100 italic">
                       Official results will be released on:
                     </p>
                     <p className="mt-2 font-mono text-lg font-black text-amber-900 dark:text-amber-50">
                       {exam.resultReleaseAt ? format(new Date(exam.resultReleaseAt), "PPP p") : "TBD"}
                     </p>
                   </div>
                 ) : (
                   <div className="mt-8">
                     <ShcnButton 
                        onClick={() => router.push(`/dashboard/student/exams&quizzes/${examId}/result`)}
                        className="w-full h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
                     >
                        View Performance Analysis <ChevronRightIcon size={18} />
                     </ShcnButton>
                   </div>
                 )}
               </div>
               
               <ShcnButton variant="ghost" onClick={() => router.push('/dashboard/student/exams&quizzes')} className="text-slate-400 font-bold hover:text-primary">
                  Return to Performance Center
               </ShcnButton>
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
               <PageHeader 
                 title={exam.title} 
                 subtitle={exam.class?.name ? `${exam.class.name} ${exam.class.section || ""}` : undefined} 
               />
                <div className="flex items-center gap-3">
                   <ShcnButton 
                      variant="outline" 
                      className={`rounded-xl font-black flex items-center gap-2 px-5 transition-all ${
                         (activeSubject?.readingContent || (activeSubject?.images && activeSubject.images.length > 0))
                            ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => (activeSubject?.readingContent || (activeSubject?.images && activeSubject.images.length > 0)) && setShowReadingModal(true)}
                      disabled={!(activeSubject?.readingContent || (activeSubject?.images && activeSubject.images.length > 0))}
                   >
                      <BookOpen size={18} /> Read {(activeSubject?.readingContent || (activeSubject?.images && activeSubject.images.length > 0)) ? "Passage" : "Paper"}
                   </ShcnButton>
                   <ShcnButton variant="ghost" className="rounded-xl font-bold" onClick={() => setShowDetails(true)}>
                      <Info size={18} className="mr-2" /> View Details
                   </ShcnButton>
                </div>
            </div>
            
          <ExamDetails 
            classLabel={`${exam.class?.name || "N/A"} ${exam.class?.section || ""}`}
            durationMinutes={totalDuration}
            subjectName={exam.subjectPapers?.[0]?.subject?.name || "Multiple Subjects"}
            totalQuestions={currentSubjectPapers.reduce((sum: number, p: SubjectPaper) => sum + (p.questions?.length || 0), 0)}
          />

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

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <QuestionCard
                  id={activeQuestion?.id || ""}
                  number={activeQuestionIndex + 1}
                  totalQuestions={totalQuestionsInActiveSubject}
                  type={activeQuestion?.type}
                  text={activeQuestion?.question || ""}
                  images={activeQuestionImages}
                  imageLabels={activeQuestionLabels}
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
                  onZoom={handleZoom}
                  showNextButton={true}
                />
              </div>

              <div className="lg:col-span-1">
                <QuestionNavigation
                  totalQuestions={totalQuestionsInActiveSubject}
                  currentQuestion={activeQuestionIndex + 1}
                  remainingSeconds={remainingSeconds || 0}
                  answeredQuestionIds={activeSubject?.questions?.map((q: { id: string }, idx: number) => 
                    localAnswers[q.id] ? idx.toString() : ""
                  ).filter(Boolean) || []}
                  onQuestionSelect={setActiveQuestionIndex}
                  onNextQuestion={handleNextQuestion}
                  onSubmit={() => setShowSubmitModal(true)}
                  onTimerExpire={handleTimerExpire}
                />
                
                 {currentSubjectPapers && currentSubjectPapers.length > 1 && (
                   <div className="mt-6 p-4 rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937]">
                      <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-slate-400">Switch Subject</h3>
                      <div className="space-y-2">
                         {currentSubjectPapers.map((paper: SubjectPaper) => (
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
                             {paper.title || (paper as { subject?: { name?: string } }).subject?.name || "Unnamed Paper"}
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

      <StudentReadingModal
        isOpen={showReadingModal && !!(activeSubject?.readingContent || (activeSubject?.images && activeSubject.images.length > 0))}
        onClose={() => setShowReadingModal(false)}
        content={activeSubject?.readingContent || ""}
        images={activeSubjectImages}
        imageLabels={activeSubjectLabels}
        subjectName={activeSubject?.title || activeSubject?.subject?.name || "Subject"}
        onZoom={handleZoom}
      />

      {/* Auto-submission Overlay */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="flex flex-col items-center space-y-6 text-center max-w-md px-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Clock className="text-primary h-8 w-8 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-[#111827] dark:text-white uppercase italic">Time Is Up!</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your examination is being finalized and submitted...</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs font-black text-primary uppercase">Encrypted Submission in Progress</span>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox 
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        src={lightboxImage?.src || ""}
        alt={lightboxImage?.alt}
      />
    </div>
  );
}