"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useExam,
  useExamAttempt,
  useStartExamAttempt,
  useSaveAnswer,
  useSubmitAttempt,
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
import ConfirmSubmitModal, { PaperAnswerSummary } from "./components/ConfirmSubmitModal";

// UI Components from the "start" directory
import PageHeader from './start/components/PageHeader';
import ExamDetails from './start/components/ExamDetails';
import QuestionCard from './start/components/QuestionCard';
import QuestionNavigation from './start/components/QuestionNavigation';
import { SubjectPaper, SubjectAttempt, examService } from "@/lib/api/services/examService";
import { executeRefreshToken } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { AxiosError } from "axios";


/**
 * Unified Exam Page
 * Handles both Details (Preview) and Taking (Taker) modes at the same route.
 */
export default function UnifiedExamPage() {
  const { examId } = useParams();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
  const { data: attempt, isLoading: isLoadingAttempt } = useExamAttempt(examId as string);

  const startAttemptMutation = useStartExamAttempt();
  const saveAnswerMutation = useSaveAnswer();
  const submitAttemptMutation = useSubmitAttempt();
  const saveAnswerMutationRef = useRef(saveAnswerMutation);
  saveAnswerMutationRef.current = saveAnswerMutation;
  const submitAttemptMutationRef = useRef(submitAttemptMutation);
  submitAttemptMutationRef.current = submitAttemptMutation;

  const localBackupKey = useMemo(
    () => `qefas_exam_answers_${examId}_${currentUser?.id || attempt?.studentId || "anon"}`,
    [examId, currentUser?.id, attempt?.studentId],
  );
  const sharedBackupKey = useMemo(() => `qefas_exam_answers_${examId}`, [examId]);
  const progressBackupKey = useMemo(() => `qefas_exam_progress_${examId}`, [examId]);

  // Mode State
  const [showDetails, setShowDetails] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);

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
  const initialPositionRestoredRef = useRef(false);
  const targetEndTimeMsRef = useRef<{ attemptId: string; endTimeMs: number } | null>(null);
  // Track questions whose answers have not yet been successfully saved to the backend
  const dirtyAnswerQuestionIdsRef = useRef<Set<string>>(new Set());

  // Sequential submission progress state
  const [paperSubmitStates, setPaperSubmitStates] = useState<PaperSubmitState[]>([]);
  const [finaliseStatus, setFinaliseStatus] = useState<"idle" | "pending" | "finalising" | "done" | "error">("idle");
  const [finaliseError, setFinaliseError] = useState<string | undefined>(undefined);
  const isSubmissionModalOpen = paperSubmitStates.length > 0;


  // Define basic memos first
  const totalDuration = useMemo(() => {
    if (exam?.durationMinutes && exam.durationMinutes > 0) return exam.durationMinutes;
    return exam?.subjectPapers?.reduce((sum: number, p: SubjectPaper) => sum + (p.durationMinutes || 0), 0) || 0;
  }, [exam]);

  const startDate = useMemo(() => exam?.startDate ? new Date(exam.startDate) : null, [exam?.startDate]);
  const endDate = useMemo(() => exam?.endDate ? new Date(exam.endDate) : null, [exam?.endDate]);
  const isStarted = useMemo(() => !startDate || isAfter(new Date(), startDate), [startDate]);

  // Assessment status: 'live' (active now or to be discussed/taken), 'upcoming' (future), 'ended', or 'submitted'
  const examStatus = useMemo((): 'live' | 'upcoming' | 'ended' | 'submitted' => {
    if (attempt?.status === "SUBMITTED" || attempt?.status === "SCORED") return "submitted";
    const now = new Date();
    if (startDate && !isAfter(now, startDate)) {
      return "upcoming";
    }
    if (endDate && isAfter(now, endDate)) {
      return "ended";
    }
    return "live";
  }, [attempt?.status, startDate, endDate]);

  const examStatusLabel = useMemo(() => {
    if (examStatus === 'live') return 'Live Assessment';
    if (examStatus === 'upcoming') return 'Upcoming';
    if (examStatus === 'submitted') return 'Submitted';
    return 'Ended';
  }, [examStatus]);

  const isReleased = useMemo(() => {
    if (exam?.allowImmediateResult) return true;
    if (!exam?.resultReleaseAt) return true;
    return isAfter(new Date(), new Date(exam.resultReleaseAt));
  }, [exam]);

  const currentSubjectPapers = useMemo(() => {
    if (attempt?.status === "IN_PROGRESS" && attempt.subjectAttempts?.length > 0) {
      return attempt.subjectAttempts.map((sa: SubjectAttempt) => {
        const fallbackPaper = exam?.subjectPapers?.find(
          (p: SubjectPaper) => p.id === sa.subjectPaperId || p.id === sa.subjectPaper?.id
        );
        return {
          ...fallbackPaper,
          ...sa.subjectPaper,
          id: sa.subjectPaperId || sa.subjectPaper?.id,
          readingContent: sa.subjectPaper?.readingContent || fallbackPaper?.readingContent || "",
          images: (sa.subjectPaper?.images && sa.subjectPaper.images.length > 0)
            ? sa.subjectPaper.images
            : (fallbackPaper?.images || []),
          imageLabels: (sa.subjectPaper?.imageLabels && sa.subjectPaper.imageLabels.length > 0)
            ? sa.subjectPaper.imageLabels
            : (fallbackPaper?.imageLabels || []),
        };
      });
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

  const isContinuingExam = useMemo(() => {
    if (attempt?.status === "SUBMITTED" || attempt?.status === "SCORED") return false;
    if (attempt) return true;
    return Object.keys(localAnswers).length > 0;
  }, [attempt, localAnswers]);

  const paperSummaries = useMemo((): PaperAnswerSummary[] => {
    return currentSubjectPapers.map((p: SubjectPaper) => {
      const questions = p.questions || [];
      const answeredCount = questions.filter((q) => {
        const ans = localAnswers[q.id];
        return ans !== undefined && ans !== "";
      }).length;
      return {
        paperId: p.id,
        paperName: p.title || (p as { subject?: { name?: string } }).subject?.name || "Unnamed Paper",
        answeredCount,
        totalCount: questions.length,
      };
    });
  }, [currentSubjectPapers, localAnswers]);

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

    // Update local state immediately for responsive UI and persist to localStorage backup
    const qId = activeQuestion.id;
    setLocalAnswers(prev => {
      const next = {
        ...prev,
        [qId]: optionId,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(localBackupKey, JSON.stringify(next));
          localStorage.setItem(
            sharedBackupKey,
            JSON.stringify({
              studentId: currentUser?.id || attempt?.studentId || null,
              answers: next,
              updatedAt: Date.now(),
            }),
          );
        } catch {
          // Ignore storage quota errors
        }
      }
      return next;
    });
    dirtyAnswerQuestionIdsRef.current.add(qId);

    try {
      await saveAnswerMutation.mutateAsync({
        examId: examId as string,
        data: {
          subjectPaperId: activeSubjectId,
          questionId: qId,
          answer: optionId
        }
      });
      dirtyAnswerQuestionIdsRef.current.delete(qId);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Failed to auto-save answer:", axiosError.response?.data || axiosError.message);
      // Answer remains in localAnswers + localStorage + dirtyAnswerQuestionIdsRef and will be submitted automatically in the final submit payload
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
   * Fast & resilient submission flow:
   * 1. Collects all selected local answers across all papers.
   * 2. Shows each paper in the progress modal and submits everything atomically in a single fast call
   *    (plus background paper-level submit calls that never block finalisation on expiry).
   * 3. Redirects to the result page.
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

    // Collect all local answers mapped to their subjectPaperId so the backend can persist any unsaved answers in a single round-trip
    const allPendingAnswers: Array<{ subjectPaperId: string; questionId: string; answer: string }> = [];
    for (const paper of papers) {
      const questions = paper.questions || [];
      for (const q of questions) {
        const ans = localAnswers[q.id];
        if (ans !== undefined && ans !== "") {
          allPendingAnswers.push({
            subjectPaperId: paper.id,
            questionId: q.id,
            answer: ans,
          });
        }
      }
    }

    // 1. Initialise all papers: paper 0 is submitting, subsequent papers are pending, finaliseStatus is pending
    setPaperSubmitStates(
      papers.map((p: SubjectPaper, idx: number) => ({
        paperId: p.id,
        paperName: p.title || (p as { subject?: { name?: string } }).subject?.name || "Unnamed Paper",
        questionCount: p.questions?.length || 0,
        status: idx === 0 ? "submitting" : "pending",
      }))
    );
    setFinaliseStatus("pending");
    setFinaliseError(undefined);

    try {
      // 2. Iterate papers sequentially: mark active paper submitting, submit paper endpoint, mark done
      for (let i = 0; i < papers.length; i++) {
        const currentPaper = papers[i];

        // Update paper states: current paper is 'submitting', earlier papers 'done', later papers 'pending'
        setPaperSubmitStates((prev) =>
          prev.map((s, idx) => {
            if (idx < i) return { ...s, status: "done" };
            if (idx === i) return { ...s, status: "submitting" };
            return { ...s, status: "pending" };
          })
        );

        // Submit individual subject paper (idempotent; marks subjectAttempt submittedAt in backend)
        try {
          await examService.submitSubjectPaperAttempt(examId as string, currentPaper.id);
        } catch (paperErr) {
          // Non-blocking warning: even if paper submit returned 400 (e.g. already submitted), continue
          console.warn(`Paper ${currentPaper.id} submit non-critical notification:`, paperErr);
        }

        // Mark this paper as done
        setPaperSubmitStates((prev) =>
          prev.map((s, idx) => (idx <= i ? { ...s, status: "done" } : s))
        );

        // Visual pacing: ensure user sees the step transition clearly
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // 3. All subject papers complete! Now transition Finalising & Scoring to ACTIVE
      setFinaliseStatus("finalising");

      // Submit and score the entire exam attempt (along with any unsaved answers)
      await submitAttemptMutationRef.current.mutateAsync({
        examId: examId as string,
        answers: allPendingAnswers,
      });

      dirtyAnswerQuestionIdsRef.current.clear();
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(localBackupKey);
          localStorage.removeItem(sharedBackupKey);
          localStorage.removeItem(progressBackupKey);
        } catch {
          // Ignore storage errors
        }
      }

      setFinaliseStatus("done");

      // Brief delay so user sees the "done" state before redirect
      setTimeout(() => {
        router.push(`/dashboard/student/exams&quizzes/${examId}/result`);
      }, 700);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg = axiosErr.response?.data?.message || axiosErr.message || "Finalisation failed";

      // If the backend indicates the exam was already submitted, treat as success and redirect
      if (msg.toLowerCase().includes("already submitted")) {
        setPaperSubmitStates((prev) =>
          prev.map((s) => ({ ...s, status: "done", errorMessage: undefined }))
        );
        setFinaliseStatus("done");
        setTimeout(() => {
          router.push(`/dashboard/student/exams&quizzes/${examId}/result`);
        }, 600);
        return;
      }

      setPaperSubmitStates((prev) =>
        prev.map((s) => ({ ...s, status: "done" }))
      );
      setFinaliseStatus("error");
      setFinaliseError(msg);
      isSubmittingRef.current = false;
      toast.error(`Submission failed: ${msg}. Please click Retry.`, { toastId: "finalise-fail" });
    }
  }, [currentSubjectPapers, examId, localAnswers, localBackupKey, sharedBackupKey, progressBackupKey, router]);


  const handleTimerExpire = useCallback(async () => {
    if (isSubmittingRef.current) return;
    setShowConfirmSubmitModal(false);
    setIsAutoSubmitting(true);
    toast.warning("Time is up! Submitting your exam automatically...", { toastId: "timer-expire" });
    // Delegate to the sequential flow for reliability
    await handleSequentialSubmit();
  }, [handleSequentialSubmit]);

  const handleTimerExpireRef = useRef(handleTimerExpire);
  handleTimerExpireRef.current = handleTimerExpire;

  const handleRequestSubmit = useCallback(() => {
    if (isSubmittingRef.current) return;
    setShowConfirmSubmitModal(true);
  }, []);

  const handleConfirmManualSubmit = useCallback(async () => {
    // Gracefully dismiss confirmation modal before opening submission progress modal
    setShowConfirmSubmitModal(false);
    // Allow the confirmation modal exit animation to finish smoothly
    await new Promise((resolve) => setTimeout(resolve, 200));
    await handleSequentialSubmit();
  }, [handleSequentialSubmit]);

  const handleZoom = useCallback((src: string, alt?: string) => {
    setLightboxImage({ src, alt });
  }, []);



  // --- Effects (Moved after memos and callbacks to avoid ReferenceError) ---

  // Initialize Exam State, Restore Local Backup & Exact Question Position
  useEffect(() => {
    // 1. Read any locally backed-up answers immediately (even before server attempt resolves)
    const localBackupAnswers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      try {
        const rawShared = localStorage.getItem(sharedBackupKey);
        if (rawShared) {
          const parsedShared = JSON.parse(rawShared) as {
            studentId?: string | null;
            answers?: Record<string, string>;
          };
          const activeStudentId = currentUser?.id || attempt?.studentId;
          if (
            !parsedShared.studentId ||
            !activeStudentId ||
            parsedShared.studentId === activeStudentId
          ) {
            for (const [qId, ans] of Object.entries(parsedShared.answers || {})) {
              if (ans !== undefined && ans !== "") {
                localBackupAnswers[qId] = ans;
              }
            }
          }
        }

        const rawBackup = localStorage.getItem(localBackupKey);
        if (rawBackup) {
          const parsedBackup = JSON.parse(rawBackup) as Record<string, string>;
          for (const [qId, ans] of Object.entries(parsedBackup)) {
            if (ans !== undefined && ans !== "") {
              localBackupAnswers[qId] = ans;
            }
          }
        }
      } catch {
        // Ignore malformed localStorage backup
      }
    }

    if (
      !initialAnswersRestoredRef.current &&
      !attempt?.subjectAttempts &&
      Object.keys(localBackupAnswers).length > 0
    ) {
      setLocalAnswers((prev) =>
        Object.keys(prev).length > 0 ? prev : localBackupAnswers,
      );
    }

    // 2. Initialize local answers from server attempt + localStorage backup once attempt is available
    if (attempt?.subjectAttempts && !initialAnswersRestoredRef.current) {
      const restoredAnswers: Record<string, string> = {};
      attempt.subjectAttempts.forEach((sa: { answers?: { questionId: string; answer: string }[] }) => {
        sa.answers?.forEach((a) => {
          restoredAnswers[a.questionId] = a.answer;
        });
      });

      for (const [qId, ans] of Object.entries(localBackupAnswers)) {
        if (ans !== undefined && ans !== "") {
          if (restoredAnswers[qId] !== ans) {
            dirtyAnswerQuestionIdsRef.current.add(qId);
          }
          restoredAnswers[qId] = ans;
        }
      }

      if (Object.keys(restoredAnswers).length > 0) {
        setLocalAnswers(restoredAnswers);
      }
      initialAnswersRestoredRef.current = true;
    }

    // 3. Restore exact activeSubjectId and activeQuestionIndex where the student stopped
    if (currentSubjectPapers.length > 0 && !initialPositionRestoredRef.current) {
      let restoredSubjId: string | null = null;
      let restoredQIdx: number | null = null;

      if (typeof window !== "undefined") {
        try {
          const rawProgress = localStorage.getItem(progressBackupKey);
          if (rawProgress) {
            const parsedProgress = JSON.parse(rawProgress) as {
              studentId?: string | null;
              activeSubjectId?: string | null;
              activeQuestionIndex?: number;
            };
            const activeStudentId = currentUser?.id || attempt?.studentId;
            if (
              !parsedProgress.studentId ||
              !activeStudentId ||
              parsedProgress.studentId === activeStudentId
            ) {
              const matchedPaper = currentSubjectPapers.find(
                (p: SubjectPaper) => p.id === parsedProgress.activeSubjectId,
              );
              if (matchedPaper) {
                restoredSubjId = matchedPaper.id;
                const maxIdx = Math.max(0, (matchedPaper.questions?.length || 1) - 1);
                const candidateIdx =
                  typeof parsedProgress.activeQuestionIndex === "number"
                    ? parsedProgress.activeQuestionIndex
                    : 0;
                restoredQIdx = Math.min(Math.max(0, candidateIdx), maxIdx);
              }
            }
          }
        } catch {
          // Ignore malformed progress backup
        }
      }

      // If no explicit progress key was stored in localStorage, infer resume position from answered questions
      if (!restoredSubjId && attempt?.subjectAttempts) {
        const mergedAnswers: Record<string, string> = { ...localBackupAnswers };
        attempt.subjectAttempts.forEach((sa: { answers?: { questionId: string; answer: string }[] }) => {
          sa.answers?.forEach((a) => {
            if (!mergedAnswers[a.questionId]) {
              mergedAnswers[a.questionId] = a.answer;
            }
          });
        });

        if (Object.keys(mergedAnswers).length > 0) {
          for (const paper of currentSubjectPapers) {
            const questions = paper.questions || [];
            const firstUnansweredIdx = questions.findIndex((q) => !mergedAnswers[q.id]);
            if (firstUnansweredIdx !== -1) {
              restoredSubjId = paper.id;
              restoredQIdx = firstUnansweredIdx;
              break;
            }
          }
          // If all questions in all papers are answered, land on the last question of the last paper
          if (!restoredSubjId) {
            const lastPaper = currentSubjectPapers[currentSubjectPapers.length - 1];
            if (lastPaper) {
              restoredSubjId = lastPaper.id;
              restoredQIdx = Math.max(0, (lastPaper.questions?.length || 1) - 1);
            }
          }
        }
      }

      if (restoredSubjId) {
        setActiveSubjectId(restoredSubjId);
        if (restoredQIdx !== null) {
          setActiveQuestionIndex(restoredQIdx);
        }
        initialPositionRestoredRef.current = true;
      } else if (!activeSubjectId) {
        setActiveSubjectId(currentSubjectPapers[0].id);
        if (attempt !== undefined) {
          initialPositionRestoredRef.current = true;
        }
      }
    }
  }, [
    exam,
    attempt,
    activeSubjectId,
    currentSubjectPapers,
    localBackupKey,
    sharedBackupKey,
    progressBackupKey,
    currentUser?.id,
  ]);

  // Persist active subject paper and question index so a student can resume from the exact question after refresh or re-login
  useEffect(() => {
    if (!activeSubjectId || !initialPositionRestoredRef.current) return;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          progressBackupKey,
          JSON.stringify({
            studentId: currentUser?.id || attempt?.studentId || null,
            activeSubjectId,
            activeQuestionIndex,
            updatedAt: Date.now(),
          }),
        );
      } catch {
        // Ignore storage errors
      }
    }
  }, [activeSubjectId, activeQuestionIndex, progressBackupKey, currentUser?.id, attempt?.studentId]);

  // Automatically flush any dirty answers restored from localStorage after a session expiry / re-login
  useEffect(() => {
    if (
      attempt?.status !== "IN_PROGRESS" ||
      !initialAnswersRestoredRef.current ||
      dirtyAnswerQuestionIdsRef.current.size === 0 ||
      currentSubjectPapers.length === 0
    ) {
      return;
    }

    const dirtyIds = Array.from(dirtyAnswerQuestionIdsRef.current);
    const syncDirtyAnswers = async () => {
      for (const qId of dirtyIds) {
        const answerVal = localAnswers[qId];
        if (!answerVal) continue;
        const ownerPaper = currentSubjectPapers.find((p: SubjectPaper) =>
          p.questions?.some((q) => q.id === qId),
        );
        if (!ownerPaper) continue;
        try {
          await saveAnswerMutationRef.current.mutateAsync({
            examId: examId as string,
            data: {
              subjectPaperId: ownerPaper.id,
              questionId: qId,
              answer: answerVal,
            },
          });
          dirtyAnswerQuestionIdsRef.current.delete(qId);
        } catch {
          // Keep in dirty set; will be sent in bulk on submit
        }
      }
    };

    void syncDirtyAnswers();
  }, [attempt?.status, currentSubjectPapers, examId, localAnswers]);

  // Proactive Session Keep-Alive while taking an exam (prevents token expiry & logout mid-exam)
  useEffect(() => {
    if (attempt?.status !== "IN_PROGRESS" || showDetails) return;

    // Refresh immediately if token is close to expiry, and every 10 minutes during the exam
    const keepAlive = () => {
      executeRefreshToken().catch(() => {
        // Silent catch: if offline transiently, next heartbeat or interceptor will retry
      });
    };

    const interval = setInterval(keepAlive, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [attempt?.status, showDetails]);

  // Sync Timer and Progress (anchored to wall-clock targetEndTimeMs so opening modals or selecting answers never resets/glitches the clock)
  useEffect(() => {
    if (attempt?.status !== "IN_PROGRESS" || !attempt?.id) return;

    let targetEndTimeMs: number | null = null;

    if (
      targetEndTimeMsRef.current &&
      targetEndTimeMsRef.current.attemptId === attempt.id
    ) {
      targetEndTimeMs = targetEndTimeMsRef.current.endTimeMs;
    } else if (attempt.expiresAt) {
      targetEndTimeMs = new Date(attempt.expiresAt).getTime();
      targetEndTimeMsRef.current = {
        attemptId: attempt.id,
        endTimeMs: targetEndTimeMs,
      };
    } else if (
      typeof attempt.remainingSeconds === "number" &&
      attempt.remainingSeconds >= 0
    ) {
      targetEndTimeMs = Date.now() + attempt.remainingSeconds * 1000;
      targetEndTimeMsRef.current = {
        attemptId: attempt.id,
        endTimeMs: targetEndTimeMs,
      };
    } else if (attempt.startedAt && totalDuration > 0) {
      targetEndTimeMs =
        new Date(attempt.startedAt).getTime() + totalDuration * 60 * 1000;
      targetEndTimeMsRef.current = {
        attemptId: attempt.id,
        endTimeMs: targetEndTimeMs,
      };
    }

    if (targetEndTimeMs === null) return;

    const initialSecondsLeft = Math.max(
      0,
      Math.round((targetEndTimeMs - Date.now()) / 1000),
    );
    setRemainingSeconds(initialSecondsLeft);

    if (initialSecondsLeft <= 0) {
      void handleTimerExpireRef.current();
      return;
    }

    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.round((targetEndTimeMs! - Date.now()) / 1000),
      );
      setRemainingSeconds((prev) => (prev === secondsLeft ? prev : secondsLeft));
      if (secondsLeft <= 0) {
        clearInterval(interval);
        void handleTimerExpireRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    attempt?.id,
    attempt?.status,
    attempt?.expiresAt,
    attempt?.startedAt,
    attempt?.remainingSeconds,
    totalDuration,
  ]);

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
      <div className="min-h-screen bg-background-light dark:bg-background-dark px-4 sm:px-6 lg:px-12 pt-24 sm:pt-28 lg:pt-32 pb-16 animate-in fade-in duration-500">
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
            status={examStatus}
            statusLabel={examStatusLabel}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Exam Structure
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {exam.subjectPapers?.map((paper: SubjectPaper, pIdx: number) => (
                  <div key={paper.id ? `${paper.id}-${pIdx}` : `paper-${pIdx}`} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1F2937] flex justify-between items-center shadow-sm">
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
                <div className={`flex items-center gap-4 p-4 rounded-xl border ${(attempt?.status === "SUBMITTED" || attempt?.status === "SCORED")
                  ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-100 dark:border-green-900/30"
                  : isContinuingExam
                    ? "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:amber-300 border-amber-100 dark:border-amber-900/30"
                    : "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-100 dark:border-blue-900/30"
                  }`}>
                  <Clock size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase">Current Session</p>
                    <p className="font-bold">
                      {(attempt?.status === "SUBMITTED" || attempt?.status === "SCORED")
                        ? "Exam Submitted"
                        : isContinuingExam
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
                  <><PlayCircle /> {isContinuingExam ? "Continue Exam" : "Start Exam"}</>
                )}
              </ShcnButton>
              <div className="text-center space-y-2">
                <p className="text-slate-500 text-sm italic">
                  {isContinuingExam
                    ? "Click Continue Exam to resume your assessment from where you stopped."
                    : "Clicking start will begin your official attempt."}
                </p>
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

  const hasReadingContent = Boolean(
    activeSubject?.readingContent ||
    (activeSubject?.images && activeSubject.images.length > 0)
  );

  // TAKER VIEW
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#111827] dark:text-[#D1D5DB]">
      <div className="flex min-h-screen w-full">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <PageHeader
                title={exam.title}
                subtitle={exam.class?.name ? `${exam.class.name} ${exam.class.section || ""}` : undefined}
                subject={activeSubject?.title || activeSubject?.subject?.name}
              />
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {hasReadingContent && (
                  <ShcnButton
                    variant="outline"
                    className="rounded-xl font-black flex items-center gap-2 px-5 py-2.5 transition-all bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-sm active:scale-95 cursor-pointer ring-1 ring-emerald-500/20"
                    onClick={() => setShowReadingModal(true)}
                  >
                    <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Read Passage & Reference</span>
                  </ShcnButton>
                )}
                <ShcnButton variant="ghost" className="rounded-xl font-bold" onClick={() => setShowDetails(true)}>
                  <Info size={18} className="mr-2" /> View Details
                </ShcnButton>
              </div>
            </div>

            {/* High-Visibility Reading Passage Banner */}
            {hasReadingContent && (
              <div className="mb-6 px-4 py-3 sm:px-5 sm:py-3.5 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Reading Passage & Reference Materials Available
                    </p>
                    <p className="text-[11px] sm:text-xs text-emerald-800/80 dark:text-emerald-300/80">
                      This assessment paper includes reading text and reference illustrations. You can open and view them at any time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReadingModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shrink-0 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Passage</span>
                </button>
              </div>
            )}

            <ExamDetails
              classLabel={`${exam.class?.name || "N/A"} ${exam.class?.section || ""}`}
              durationMinutes={totalDuration}
              subjectName={currentSubjectPapers[0]?.subject?.name || currentSubjectPapers[0]?.title || exam.subjectPapers?.[0]?.subject?.name || "Multiple Subjects"}
              totalQuestions={currentSubjectPapers.reduce((sum: number, p: SubjectPaper) => sum + (p.questions?.length || 0), 0)}
              status={examStatus}
              statusLabel={examStatusLabel}
            />

            {(exam.instructions || currentSubjectPapers[0]?.instructions) && (
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Info size={16} /> Instructions
                </h3>
                <LaTeXRenderer
                  content={exam.instructions || currentSubjectPapers[0]?.instructions || ""}
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
                  hasReadingContent={hasReadingContent}
                  onOpenReadingModal={() => setShowReadingModal(true)}
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
                  onSubmit={handleRequestSubmit}
                  onTimerExpire={handleTimerExpire}
                  hasReadingContent={hasReadingContent}
                  onOpenReadingModal={() => setShowReadingModal(true)}
                />

                {currentSubjectPapers && currentSubjectPapers.length > 1 && (
                  <div className="mt-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <h3 className="text-xs font-bold mb-3 uppercase tracking-wider text-slate-500 dark:text-slate-400">Switch Subject</h3>
                    <div className="space-y-2">
                      {currentSubjectPapers.map((paper: SubjectPaper, pIdx: number) => (
                        <button
                          key={paper.id ? `${paper.id}-${pIdx}` : `paper-btn-${pIdx}`}
                          onClick={() => {
                            setActiveSubjectId(paper.id);
                            setActiveQuestionIndex(0);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeSubjectId === paper.id
                            ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                            : "bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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

      <ConfirmSubmitModal
        isOpen={showConfirmSubmitModal}
        onClose={() => setShowConfirmSubmitModal(false)}
        onConfirm={handleConfirmManualSubmit}
        paperSummaries={paperSummaries}
        remainingSeconds={remainingSeconds}
        isSubmitting={isSubmissionModalOpen}
      />

      <SubmissionProgressModal
        isOpen={isSubmissionModalOpen}
        papers={paperSubmitStates}
        finaliseStatus={finaliseStatus}
        finaliseError={finaliseError}
        onRetry={handleSequentialSubmit}
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