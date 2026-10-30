// src/components/Dashboard/QuestionNavigation.tsx
'use client';

import React from 'react';
import Timer from './ui/Timer';
import QuestionButton from './ui/QuestionButton';
import Button from './ui/Button';

interface QuestionNavigationProps {
    totalQuestions: number;
    currentQuestion: number;
    remainingSeconds: number;
    answeredQuestionIds?: string[];
    onQuestionSelect: (questionIndex: number) => void;
    onNextQuestion: () => void;
    onSubmit: () => void;
    onTimerExpire?: () => void;
    hasReadingContent?: boolean;
    onOpenReadingModal?: () => void;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
    totalQuestions,
    currentQuestion,
    remainingSeconds,
    answeredQuestionIds = [],
    onQuestionSelect,
    onNextQuestion,
    onSubmit,
    hasReadingContent,
    onOpenReadingModal
}) => {
    return (
        <div className="sticky top-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-lg">timer</span>
                    <span>Time Remaining</span>
                </div>
                <Timer seconds={remainingSeconds} />

                {hasReadingContent && onOpenReadingModal && (
                    <button
                        type="button"
                        onClick={onOpenReadingModal}
                        className="mt-3.5 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                    >
                        <span className="material-symbols-outlined text-base">menu_book</span>
                        <span>Read Passage & Reference</span>
                    </button>
                )}
            </div>

            <div className="my-6 h-px w-full bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Questions</h3>
                <Button
                    variant="outline"
                    size="sm"
                    icon="arrow_forward"
                    onClick={onNextQuestion}
                    disabled={currentQuestion === totalQuestions}
                >
                    Next
                </Button>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
                    const isAnswered = answeredQuestionIds.includes((num - 1).toString()); 
                    return (
                        <QuestionButton
                            key={num}
                            number={num}
                            isActive={currentQuestion === num}
                            isAnswered={isAnswered}
                            onClick={() => onQuestionSelect(num - 1)}
                        />
                    );
                })}
            </div>

            <Button
                variant="primary"
                className="mt-6 w-full"
                onClick={onSubmit}
            >
                Submit Exam
            </Button>

            <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Current: Q{currentQuestion}</span>
                <span>Total: {totalQuestions}</span>
            </div>
        </div>
    );
};

export default QuestionNavigation;