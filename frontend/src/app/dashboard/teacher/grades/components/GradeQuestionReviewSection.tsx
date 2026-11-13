'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { examService, SubjectExamQuestion } from '@/lib/api/services/examService';
import { PaperQuestionReviewItem, StudentAnswerRecord } from './types';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  AlertCircle,
  FileText,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

interface PaperAttemptResponse {
  id: string;
  studentId?: string;
  examAttempt?: {
    studentId?: string;
    student?: { id?: string };
  };
  answers?: StudentAnswerRecord[];
}

interface PaperWithAttemptsResponse {
  id: string;
  title?: string;
  questions?: SubjectExamQuestion[];
  examAttempts?: PaperAttemptResponse[];
}

interface ExamReviewQuestionRaw {
  questionId?: string;
  id?: string;
  question: string;
  images?: string[];
  type: string;
  options?: {
    optionA?: string | null;
    optionB?: string | null;
    optionC?: string | null;
    optionD?: string | null;
  };
  correctAnswer?: string;
  explanation?: string | null;
  studentAnswer?: string | null;
  isCorrect?: boolean | null;
  scoreAwarded?: number | null;
  maxMarks?: number;
  marks?: number;
  requiresManualReview?: boolean;
  manuallyReviewed?: boolean;
  reviewNote?: string | null;
}

interface ExamReviewSubjectRaw {
  subjectPaperId?: string;
  subjectName?: string;
  questions?: ExamReviewQuestionRaw[];
}

interface ExamReviewResponse {
  subjects?: ExamReviewSubjectRaw[];
}

interface GradeQuestionReviewSectionProps {
  studentId: string;
  examId?: string | null;
  subjectPaperId?: string | null;
  subjectExamAttemptId?: string | null;
  preloadedQuestions?: PaperQuestionReviewItem[];
  papers?: { id: string; name: string }[];
}

function evaluateCorrectness(item: PaperQuestionReviewItem): boolean | null {
  if (typeof item.isCorrect === 'boolean') return item.isCorrect;
  if (!item.studentAnswer) return null;
  return (
    item.studentAnswer.trim().toLowerCase() ===
    (item.correctAnswer || '').trim().toLowerCase()
  );
}

const GradeQuestionReviewSection: React.FC<GradeQuestionReviewSectionProps> = ({
  studentId,
  examId,
  subjectPaperId,
  subjectExamAttemptId,
  preloadedQuestions,
  papers,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [selectedPaperTabId, setSelectedPaperTabId] = useState<string | null>(
    subjectPaperId || papers?.[0]?.id || null
  );

  useEffect(() => {
    setSelectedPaperTabId(subjectPaperId || papers?.[0]?.id || null);
  }, [subjectPaperId, papers, studentId]);

  const activePaperId = selectedPaperTabId || subjectPaperId || papers?.[0]?.id || null;
  const hasPreloaded = Boolean(preloadedQuestions && preloadedQuestions.length > 0);
  const showPaperTabs = Boolean(!hasPreloaded && !subjectPaperId && papers && papers.length > 1);

  const {
    data: paperData,
    isLoading: isLoadingPaper,
    isError: isErrorPaper,
  } = useQuery({
    queryKey: ['paper-review-detail', activePaperId],
    queryFn: async () => {
      const res = await examService.getPaperById('none', activePaperId as string);
      return res as unknown as PaperWithAttemptsResponse;
    },
    enabled: !hasPreloaded && Boolean(activePaperId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const shouldFallbackToExamReview =
    !hasPreloaded &&
    Boolean(examId && studentId) &&
    (!activePaperId || (!isLoadingPaper && (!paperData?.questions || paperData.questions.length === 0)));

  const {
    data: examReviewData,
    isLoading: isLoadingExamReview,
    isError: isErrorExamReview,
  } = useQuery({
    queryKey: ['exam', examId, 'review', studentId],
    queryFn: async () => {
      const res = await examService.getExamReview(examId as string, studentId);
      return res as ExamReviewResponse;
    },
    enabled: shouldFallbackToExamReview,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const resolvedQuestions: PaperQuestionReviewItem[] = useMemo(() => {
    if (preloadedQuestions && preloadedQuestions.length > 0) {
      return preloadedQuestions;
    }

    if (paperData?.questions && paperData.questions.length > 0) {
      const matchingAttempt = (paperData.examAttempts || []).find(
        (attempt) =>
          (!showPaperTabs && subjectExamAttemptId && attempt.id === subjectExamAttemptId) ||
          attempt.studentId === studentId ||
          attempt.examAttempt?.studentId === studentId ||
          attempt.examAttempt?.student?.id === studentId
      );

      if (matchingAttempt) {
        const answerMap = new Map<string, StudentAnswerRecord>();
        (matchingAttempt.answers || []).forEach((ans) => {
          answerMap.set(ans.questionId, ans);
        });

        return paperData.questions.map((q) => {
          const ans = answerMap.get(q.id);
          return {
            id: q.id,
            question: q.question,
            type: q.type,
            images: q.images,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: q.marks,
            studentAnswer: ans?.answer ?? null,
            isCorrect: ans?.isCorrect ?? null,
            scoreAwarded: ans?.scoreAwarded ?? null,
            requiresManualReview: ans?.requiresManualReview,
            manuallyReviewed: ans?.manuallyReviewed,
            reviewNote: ans?.reviewNote ?? null,
          };
        });
      }
    }

    if (examReviewData?.subjects && examReviewData.subjects.length > 0) {
      const targetSubjects = activePaperId
        ? examReviewData.subjects.filter((s) => s.subjectPaperId === activePaperId)
        : examReviewData.subjects;
      const list = targetSubjects.length > 0 ? targetSubjects : examReviewData.subjects;

      return list.flatMap((sub) =>
        (sub.questions || []).map((q, idx) => ({
          id: q.questionId || q.id || `${sub.subjectPaperId || 'q'}-${idx}`,
          question: q.question,
          type: q.type,
          images: q.images,
          optionA: q.options?.optionA ?? null,
          optionB: q.options?.optionB ?? null,
          optionC: q.options?.optionC ?? null,
          optionD: q.options?.optionD ?? null,
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation ?? null,
          marks: q.maxMarks ?? q.marks ?? 1,
          studentAnswer: q.studentAnswer ?? null,
          isCorrect: q.isCorrect ?? null,
          scoreAwarded: q.scoreAwarded ?? null,
          requiresManualReview: q.requiresManualReview,
          manuallyReviewed: q.manuallyReviewed,
          reviewNote: q.reviewNote ?? null,
        }))
      );
    }

    return [];
  }, [
    preloadedQuestions,
    paperData,
    examReviewData,
    studentId,
    activePaperId,
    subjectExamAttemptId,
    showPaperTabs,
  ]);

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    resolvedQuestions.forEach((q) => {
      const isRight = evaluateCorrectness(q);
      if (isRight === true) {
        correct += 1;
      } else if (!q.studentAnswer) {
        unanswered += 1;
        incorrect += 1;
      } else {
        incorrect += 1;
      }
    });

    return {
      total: resolvedQuestions.length,
      answered: resolvedQuestions.length - unanswered,
      correct,
      incorrect,
    };
  }, [resolvedQuestions]);

  const filteredQuestions = useMemo(() => {
    if (filterMode === 'all') return resolvedQuestions;
    return resolvedQuestions.filter((q) => {
      const isRight = evaluateCorrectness(q);
      if (filterMode === 'correct') return isRight === true;
      return isRight !== true;
    });
  }, [resolvedQuestions, filterMode]);

  const isLoading = isLoadingPaper || isLoadingExamReview;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mb-2" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Loading student answers & question review...
        </p>
      </div>
    );
  }

  if (resolvedQuestions.length === 0) {
    const hadFetchSource = Boolean(activePaperId || examId);
    return (
      <div className="space-y-4">
        {showPaperTabs && papers && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {papers.map((p) => {
              const isSelected = activePaperId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPaperTabId(p.id);
                    setFilterMode('all');
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer',
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                  )}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        )}
        <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center space-y-2">
          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText size={18} />
          </div>
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
            {hadFetchSource
              ? 'No Online Question Attempt Recorded'
              : 'Manual / Offline Assessment Record'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {isErrorExamReview || isErrorPaper
              ? 'Question review data is unavailable for this entry, or the student did not complete an online question attempt.'
              : 'This grade does not have an online question-by-question submission attached (it may be a manual entry, offline marksheet, or override without online answers).'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showPaperTabs && papers && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {papers.map((p) => {
            const isSelected = activePaperId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPaperTabId(p.id);
                  setFilterMode('all');
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer',
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <BookOpen size={14} className="text-emerald-500" />
            <span>Answers & Question Review</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700">
            {stats.answered}/{stats.total} Answered
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
              filterMode === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('correct')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1',
              filterMode === 'correct'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            )}
          >
            <CheckCircle2 size={12} />
            Correct ({stats.correct})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('incorrect')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1',
              filterMode === 'incorrect'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-rose-600'
            )}
          >
            <XCircle size={12} />
            Incorrect ({stats.incorrect})
          </button>
        </div>
      </div>

      {/* Filtered Empty Notice */}
      {filteredQuestions.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
          No questions match the selected filter ({filterMode}).
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredQuestions.map((q) => {
            const globalNumber = resolvedQuestions.indexOf(q) + 1;
            const isRight = evaluateCorrectness(q);
            const isPendingReview = q.requiresManualReview && !q.manuallyReviewed;
            const awarded =
              typeof q.scoreAwarded === 'number'
                ? q.scoreAwarded
                : isRight === true
                  ? q.marks
                  : 0;

            const isOptionQuestion =
              q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE';

            const optionEntries: [string, string][] =
              q.type === 'TRUE_FALSE' && !q.optionA
                ? [
                  ['A', 'True'],
                  ['B', 'False'],
                ]
                : (
                  [
                    ['A', q.optionA],
                    ['B', q.optionB],
                    ['C', q.optionC],
                    ['D', q.optionD],
                  ] as [string, string | null | undefined][]
                ).filter((entry): entry is [string, string] => Boolean(entry[1]));

            return (
              <div
                key={q.id}
                className={cn(
                  'rounded-2xl border bg-white dark:bg-slate-900/90 overflow-hidden shadow-xs',
                  isRight === true
                    ? 'border-emerald-200/80 dark:border-emerald-800/50'
                    : isPendingReview
                      ? 'border-amber-200/80 dark:border-amber-800/50'
                      : 'border-rose-200/80 dark:border-rose-900/50'
                )}
              >
                {/* Question Card Header */}
                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-7 px-2.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-black flex items-center justify-center">
                      Q{globalNumber}
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
                      {q.type.replace('_', ' ')}
                    </span>

                    {isRight === true ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCircle2 size={12} /> Correct
                      </span>
                    ) : isPendingReview ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                        <AlertCircle size={12} /> Needs Manual Review
                      </span>
                    ) : !q.studentAnswer ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                        <HelpCircle size={12} /> Not Answered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
                        <XCircle size={12} /> Incorrect
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {awarded} / {q.marks} pts
                  </span>
                </div>

                {/* Question Body */}
                <div className="p-4 space-y-3.5">
                  {q.images && q.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.images.map((url, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 max-h-48 flex items-center justify-center"
                        >
                          <img
                            src={url}
                            alt={`Question ${globalNumber} Figure ${idx + 1}`}
                            className="max-h-48 w-auto object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    <LaTeXRenderer content={q.question} />
                  </div>

                  {/* MCQ & TRUE_FALSE Options */}
                  {isOptionQuestion && optionEntries.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {optionEntries.map(([label, text]) => {
                        const studentVal = (q.studentAnswer || '').trim().toLowerCase();
                        const correctVal = (q.correctAnswer || '').trim().toLowerCase();
                        const labelLower = label.toLowerCase();
                        const textLower = text.trim().toLowerCase();

                        const isStudentPick =
                          Boolean(studentVal) &&
                          (studentVal === labelLower ||
                            (q.type === 'TRUE_FALSE' && studentVal === textLower));

                        const isCorrectOpt =
                          Boolean(correctVal) &&
                          (correctVal === labelLower ||
                            (q.type === 'TRUE_FALSE' && correctVal === textLower));

                        return (
                          <div
                            key={label}
                            className={cn(
                              'flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-colors',
                              isCorrectOpt
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-700/60'
                                : isStudentPick
                                  ? 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-300 dark:border-rose-700/60'
                                  : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-800'
                            )}
                          >
                            <div
                              className={cn(
                                'h-6 w-6 shrink-0 rounded-lg flex items-center justify-center font-black text-[11px]',
                                isCorrectOpt
                                  ? 'bg-emerald-500 text-white'
                                  : isStudentPick
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                              )}
                            >
                              {label}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div
                                className={cn(
                                  'font-medium leading-snug break-words',
                                  isCorrectOpt
                                    ? 'text-emerald-900 dark:text-emerald-200 font-semibold'
                                    : isStudentPick
                                      ? 'text-rose-900 dark:text-rose-200 font-semibold'
                                      : 'text-slate-700 dark:text-slate-300'
                                )}
                              >
                                <LaTeXRenderer content={text} />
                              </div>

                              {(isCorrectOpt || isStudentPick) && (
                                <div className="flex flex-wrap gap-1">
                                  {isCorrectOpt && isStudentPick && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">
                                      <CheckCircle2 size={10} /> Student&apos;s Answer (Correct)
                                    </span>
                                  )}
                                  {isCorrectOpt && !isStudentPick && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">
                                      <CheckCircle2 size={10} /> Correct Key
                                    </span>
                                  )}
                                  {!isCorrectOpt && isStudentPick && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-1.5 py-0.5 rounded">
                                      <XCircle size={10} /> Student&apos;s Choice
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Short Answer / Subjective Comparison */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div
                        className={cn(
                          'p-3.5 rounded-xl border space-y-1',
                          isRight === true
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                        )}
                      >
                        <p
                          className={cn(
                            'text-[10px] font-black uppercase tracking-widest flex items-center gap-1',
                            isRight === true
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          )}
                        >
                          {isRight === true ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          Student&apos;s Answer
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">
                          {q.studentAnswer || 'No answer submitted'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={12} /> Expected / Correct Answer
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-100 break-words">
                          {q.correctAnswer || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Review Note (if manually reviewed) */}
                  {q.reviewNote && (
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-start gap-2">
                      <MessageSquare size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 dark:text-amber-200">
                        <span className="font-black uppercase tracking-wider text-[10px] block mb-0.5">
                          Reviewer Note
                        </span>
                        <span>{q.reviewNote}</span>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-black uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400 block mb-1">
                        Explanation
                      </span>
                      <LaTeXRenderer content={q.explanation} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GradeQuestionReviewSection;

