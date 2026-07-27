"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  useExam, 
  useExamAttempt, 
  useStartExamAttempt,
  useSaveAnswer, 
  useSubmitAttempt,
  useSubmitSubjectPaper,
} from "@/lib/api/hooks/useExams";
import { Loader2, AlertCircle, Clock, FileText, Calendar, Info, PlayCircle, ChevronLeft, BookOpen, Lock as LockIcon, ChevronRight as ChevronRightIcon } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { format, isAfter } from "date-fns";
import { Button as ShcnButton } from "@/components/ui/button";
import StudentReadingModal from "./components/StudentReadingModal";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import ImageLightbox from "@/components/ui/ImageLightbox";
import SubmissionProgressModal, { PaperSubmitState } from "./components/SubmissionProgressModal";

// UI Components from the "start" directory
import PageHeader from './start/components/PageHeader';
import ExamDetails from './start/components/ExamDetails';
import QuestionCard from './start/components/QuestionCard';
import QuestionNavigation from './start/components/QuestionNavigation';
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
  const submitSubjectPaperMutation = useSubmitSubjectPaper();

  // Mode State
  const [showDetails, setShowDetails] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  
  // Navigation State
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
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

  // Sequential submission progress state
  const [paperSubmitStates, setPaperSubmitStates] = useState<PaperSubmitState[]>([]);
  const [finaliseStatus, setFinaliseStatus] = useState<"idle" | "finalising" | "done" | "error">("idle");
  const [finaliseError, setFinaliseError] = useState<string | undefined>(undefined);
  const isSubmissionModalOpen = paperSubmitStates.length > 0;


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
    //   examId,
    //   subjectPaperId: activeSubjectId,
    //   questionId: activeQuestion.id,
    //   answer: optionId
    // });

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

  /**
   * Flushes all local answers for a given subject paper to the backend.
   * Processes them in chunks of 100 to avoid oversized payloads.
   * Each chunk is submitted sequentially — the next chunk only starts
   * when the previous one completes successfully.
   */
  const flushAnswersForPaper = useCallback(async (
    paperId: string,
    questionIds: string[]
  ) => {
    const CHUNK_SIZE = 100;
    const answersToFlush = questionIds
      .filter((qId) => localAnswers[qId] !== undefined)
      .map((qId) => ({ questionId: qId, answer: localAnswers[qId] }));

    if (answersToFlush.length === 0) return;

    for (let i = 0; i < answersToFlush.length; i += CHUNK_SIZE) {
      const chunk = answersToFlush.slice(i, i + CHUNK_SIZE);
      // Submit each answer in the chunk sequentially
      for (const { questionId, answer } of chunk) {
        await saveAnswerMutation.mutateAsync({
          examId: examId as string,
          data: { subjectPaperId: paperId, questionId, answer },
        });
      }
    }
  }, [examId, localAnswers, saveAnswerMutation]);

  /**
   * Core sequential submission flow:
   * 1. For each subject paper:
   *    a. Flush all local answers in batches of 100 (sequentially)
   *    b. Mark the paper as submitted on the backend (idempotent)
   * 2. Finalise the entire exam attempt (scoring)
   * 3. Redirect to result page
   *
   * Guards against double-execution via isSubmittingRef.
   */
  const handleSequentialSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const papers = currentSubjectPapers;
    if (!papers || papers.length === 0) {
      isSubmittingRef.current = false;
      return;
    }

    // Initialise all papers as pending in the progress modal
    setPaperSubmitStates(
      papers.map((p: SubjectPaper) => ({
        paperId: p.id,
        paperName: p.title || (p as { subject?: { name?: string } }).subject?.name || "Unnamed Paper",
        questionCount: p.questions?.length || 0,
        status: "pending",
      }))
    );
    setFinaliseStatus("idle");
    setFinaliseError(undefined);

    // Process each paper sequentially
    for (let i = 0; i < papers.length; i++) {
      const paper = papers[i];
      const questionIds = (paper.questions || []).map((q: { id: string }) => q.id);

      // Mark this paper as submitting
      setPaperSubmitStates((prev) =>
        prev.map((s) => (s.paperId === paper.id ? { ...s, status: "submitting" } : s))
      );

      try {
        // Step 1: Flush all local answers for this paper in chunks of 100
        await flushAnswersForPaper(paper.id, questionIds);

        // Step 2: Mark this subject paper as submitted on the backend (idempotent)
        await submitSubjectPaperMutation.mutateAsync({
          examId: examId as string,
          paperId: paper.id,
        });

        // Mark done
        setPaperSubmitStates((prev) =>
          prev.map((s) => (s.paperId === paper.id ? { ...s, status: "done" } : s))
        );
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const msg = axiosErr.response?.data?.message || axiosErr.message || "Unknown error";
        setPaperSubmitStates((prev) =>
          prev.map((s) =>
            s.paperId === paper.id ? { ...s, status: "error", errorMessage: msg } : s
          )
        );
        // Stop — don't proceed to the next paper or finalise
        isSubmittingRef.current = false;
        toast.error(`Failed to submit "${paper.title || "paper"}": ${msg}`, { toastId: "paper-submit-fail" });
        return;
      }
    }

    // All papers done — now finalise the entire attempt
    setFinaliseStatus("finalising");
    try {
      await submitAttemptMutation.mutateAsync(examId as string);
      setFinaliseStatus("done");
      // Brief delay so user sees the "done" state before redirect
      setTimeout(() => {
        router.push(`/dashboard/student/exams&quizzes/${examId}/result`);
      }, 1200);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg = axiosErr.response?.data?.message || axiosErr.message || "Finalisation failed";
      setFinaliseStatus("error");
      setFinaliseError(msg);
      isSubmittingRef.current = false;
      toast.error(`Finalisation failed: ${msg}`, { toastId: "finalise-fail" });
    }
  }, [currentSubjectPapers, examId, flushAnswersForPaper, submitSubjectPaperMutation, submitAttemptMutation, router]);


  const handleTimerExpire = useCallback(async () => {
    if (isSubmittingRef.current) return;
    setIsAutoSubmitting(true);
    toast.warning("Time is up! Submitting your exam automatically...", { toastId: "timer-expire" });
    // Delegate to the sequential flow for reliability
    await handleSequentialSubmit();
  }, [handleSequentialSubmit]);

  const handleZoom = useCallback((src: string, alt?: string) => {
    setLightboxImage({ src, alt });
  }, []);



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
               <div className="text-center space-y-2">
                 <p className="text-slate-500 text-sm italic">Clicking start will begin your official attempt.</p>
                 <div className="flex items-start gap-2 max-w-sm mx-auto text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                   <AlertCircle size={16} className="mt-0.5 shrink-0" />
                   <p className="text-xs font-medium leading-relaxed">
                     <strong>Important:</strong> You must start and end this exam on the <strong>same device</strong>. 
                     If the system detects you attempting to resume this exam on a different device, your session will be automatically submitted.
                   </p>
                 </div>
               </div>
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
                  onSubmit={handleSequentialSubmit}
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

      <SubmissionProgressModal
        isOpen={isSubmissionModalOpen}
        papers={paperSubmitStates}
        finaliseStatus={finaliseStatus}
        finaliseError={finaliseError}
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

      <ImageLightbox 
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        src={lightboxImage?.src || ""}
        alt={lightboxImage?.alt}
      />
    </div>
  );
}