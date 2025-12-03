'use client';

import { Clock, AlertTriangle } from 'lucide-react';

interface ExamSidebarProps {
  timeRemaining: string;
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  onNavigateToQuestion: (questionNumber: number) => void;
  onSubmitExam: () => void;
  isPreview: boolean;
}

export default function ExamSidebar({
  timeRemaining,
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onNavigateToQuestion,
  onSubmitExam,
  isPreview,
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
    switch (status) {
      case 'current':
        return 'bg-primary text-white hover:bg-primary/90';
      case 'answered':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
    }
  };

  const answeredCount = answeredQuestions.size;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="sticky top-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
      {/* Timer */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-2 text-lg font-medium text-gray-600 dark:text-gray-400">
          <Clock className="w-5 h-5" />
          <span>Time Remaining</span>
        </div>
        <div className="mt-2 text-4xl font-bold text-gray-900 dark:text-white font-mono">
          {timeRemaining}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-200 dark:bg-gray-700 mb-6" />

      {/* Questions Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Questions
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {answeredCount}/{totalQuestions} answered
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const questionNumber = i + 1;
            const status = getQuestionStatus(questionNumber);
            
            return (
              <button
                key={questionNumber}
                onClick={() => onNavigateToQuestion(questionNumber)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${getQuestionButtonClass(status)}`}
                title={`Question ${questionNumber} - ${status}`}
              >
                {questionNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Legend */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-gray-600 dark:text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Answered</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 border border-gray-300 dark:border-gray-600 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Unanswered</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {answeredCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Answered
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {unansweredCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Unanswered
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmitExam}
        disabled={isPreview}
        className={`w-full py-3 rounded-lg text-center font-semibold transition-all ${
          isPreview
            ? 'bg-primary/50 text-white cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {isPreview ? 'Preview Mode (Submit Disabled)' : 'Submit Exam'}
      </button>

      {/* Preview Mode Notice */}
      {isPreview && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Preview Mode
            </span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Submit button is disabled. This is how students will see the exam.
          </p>
        </div>
      )}
    </div>
  );
}