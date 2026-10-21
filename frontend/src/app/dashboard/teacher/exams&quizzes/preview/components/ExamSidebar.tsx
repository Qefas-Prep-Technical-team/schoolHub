'use client';

import { Clock, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

interface ExamSidebarProps {
  timeRemaining: string;
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  onNavigateToQuestion: (questionNumber: number) => void;
  onSubmitExam: () => void;
  isPreview: boolean;
  hideTimer?: boolean;
}

export default function ExamSidebar({
  timeRemaining,
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onNavigateToQuestion,
  onSubmitExam,
  isPreview,
  hideTimer = false,
}: ExamSidebarProps) {
  const getQuestionStatus = (questionNumber: number) => {
    if (questionNumber === currentQuestion) {
      return 'current';
    }
    if (answeredQuestions.has(questionNumber)) {
      return 'answered';
    }
    return 'unanswered';
  };

  const getQuestionButtonClass = (status: string) => {
    const baseClass = "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all font-bold text-xs sm:text-sm";
    switch (status) {
      case 'current':
        return `${baseClass} bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 scale-105`;
      case 'answered':
        return `${baseClass} bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60`;
      default:
        return `${baseClass} bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700`;
    }
  };

  const answeredCount = answeredQuestions.size;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-6 shadow-sm">
      {/* Timer (optional if shown in mobile sticky bar) */}
      {!hideTimer && (
        <>
          <div className="flex flex-col items-center mb-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>Time Remaining</span>
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {timeRemaining}
            </div>
          </div>
          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-5" />
        </>
      )}

      {/* Questions Grid Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Questions Map
          </h3>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>

        {/* Responsive Grid: 5 columns on phones, 5-6 on tablets */}
        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 justify-items-center">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const questionNumber = i + 1;
            const status = getQuestionStatus(questionNumber);
            
            return (
              <button
                key={questionNumber}
                type="button"
                onClick={() => onNavigateToQuestion(questionNumber)}
                className={getQuestionButtonClass(status)}
                title={`Question ${questionNumber} - ${status}`}
              >
                {questionNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Legend */}
      <div className="my-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1.5 text-center">
        <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Current</span>
        </div>
        <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500 mb-1" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Answered</span>
        </div>
        <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Pending</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {answeredCount}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Completed
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-slate-700 dark:text-slate-300">
              {unansweredCount}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Remaining
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmitExam}
        disabled={isPreview}
        className={`w-full py-2.5 sm:py-3 rounded-xl text-center text-xs sm:text-sm font-bold transition-all ${
          isPreview
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
        }`}
      >
        {isPreview ? 'Simulation Only (No Submit)' : 'Submit Assessment'}
      </button>

      {/* Preview Mode Notice */}
      {isPreview && (
        <div className="mt-3 p-2.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl flex items-center gap-2 text-left">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
            Read-only simulation preview.
          </p>
        </div>
      )}
    </div>
  );
}
