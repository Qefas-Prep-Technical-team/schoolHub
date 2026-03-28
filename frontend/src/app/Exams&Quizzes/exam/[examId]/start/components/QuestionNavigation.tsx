// src/components/Dashboard/QuestionNavigation.tsx
'use client';

import React, { useState } from 'react';
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
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
    totalQuestions,
    currentQuestion,
    remainingSeconds,
    answeredQuestionIds = [],
    onQuestionSelect,
    onNextQuestion,
    onSubmit,
    onTimerExpire
}) => {
    return (
        <div className="sticky top-6 rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] p-6">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-lg font-medium text-[#506795] dark:text-[#9CA3AF]">
                    <span className="material-symbols-outlined">timer</span>
                    <span>Time Remaining</span>
                </div>
                <Timer seconds={remainingSeconds} />
            </div>

            <div className="my-6 h-px w-full bg-[#E5E7EB] dark:bg-[#374151]"></div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold">Questions</h3>
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