// src/components/Dashboard/QuestionCard.tsx
'use client';

import React from 'react';
import { Question } from './types';
import QuestionOptionComponent from './QuestionOption';
import Button from './ui/Button';

interface QuestionCardProps extends Question {
    onNext?: () => void;
    showNextButton?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    number,
    totalQuestions,
    text,
    equation,
    options,
    onNext,
    showNextButton = true
}) => {
    const handleNext = () => {
        if (onNext) {
            onNext();
        }
    };

    return (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-[22px] font-bold leading-tight tracking-tight">
                    Question {number} of {totalQuestions}
                </h1>
                {showNextButton && (
                    <Button
                        variant="primary"
                        size="md"
                        icon="arrow_forward"
                        onClick={handleNext}
                        disabled={number === totalQuestions}
                    >
                        Next
                    </Button>
                )}
            </div>

            <p className="mt-4 text-base leading-relaxed">
                {text}
            </p>
            {equation && (
                <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-center">
                    <p className="font-mono text-lg">{equation}</p>
                </div>
            )}
            <div className="mt-6 space-y-4">
                {options.map((option) => (
                    <QuestionOptionComponent key={option.id} {...option} />
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;