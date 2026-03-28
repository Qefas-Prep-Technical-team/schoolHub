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

interface QuestionCardProps {
    id: string;
    number: number;
    totalQuestions: number;
    text: string;
    type?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    equation?: string;
    options: { id: string; text: string }[];
    selectedOptionId?: string;
    onSelectOption?: (optionId: string) => void;
    onNext?: () => void;
    showNextButton?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    number,
    totalQuestions,
    text,
    type = "MULTIPLE_CHOICE",
    equation,
    options,
    selectedOptionId,
    onSelectOption,
    onNext,
    showNextButton = true
}) => {
    return (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] p-6">
            <div className="flex justify-between gap-4 items-center mb-4">
                <h1 className="text-[22px] font-bold leading-tight tracking-tight">
                    Question {number} of {totalQuestions}
                </h1>
                {showNextButton && (
                    <Button
                        variant="primary"
                        size="md"
                        icon="arrow_forward"
                        onClick={onNext}
                        disabled={number === totalQuestions}
                    >
                        Next
                    </Button>
                )}
            </div>

            <div 
                className="mt-4 text-base leading-relaxed prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: text }}
            />
            
            {equation && (
                <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-center">
                    <p className="font-mono text-lg">{equation}</p>
                </div>
            )}
            {type === "SHORT_ANSWER" ? (
                <div className="mt-6">
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Your Answer</label>
                    <textarea 
                        className="w-full p-4 rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none min-h-[120px]"
                        placeholder="Type your answer here..."
                        value={selectedOptionId || ""}
                        onChange={(e) => onSelectOption?.(e.target.value)}
                    />
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {options.map((option) => (
                        <QuestionOptionComponent 
                            key={option.id} 
                            {...option} 
                            isSelected={selectedOptionId === option.id}
                            onSelect={onSelectOption}
                            name={`question_${id}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuestionCard;