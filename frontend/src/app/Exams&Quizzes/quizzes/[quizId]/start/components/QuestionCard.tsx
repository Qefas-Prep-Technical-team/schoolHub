'use client';

import { Card } from './ui/Card';
import { Question } from './types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
    question: Question;
    currentQuestion: number;
    totalQuestions: number;
}

export default function QuestionCard({
    question,
    currentQuestion,
    totalQuestions,
}: QuestionCardProps) {
    return (
        <Card className="p-6">
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold leading-tight">
                    Question {currentQuestion} of {totalQuestions}
                </h2>

                <p className="text-base leading-relaxed">{question.title}</p>

                {question.equation && (
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-center">
                        <p className="font-mono text-lg">{question.equation}</p>
                    </div>
                )}

                <div className="space-y-3">
                    {question.options.map((option) => (
                        <label
                            key={option.id}
                            className={cn(
                                'flex cursor-not-allowed items-center gap-4 rounded-lg border p-4 transition-colors',
                                'border-gray-200 dark:border-gray-700',
                                option.selected && 'border-primary bg-primary/10'
                            )}
                        >
                            <input
                                type="radio"
                                name={`question_${question.id}`}
                                checked={option.selected}
                                disabled={question.disabled}
                                className="h-5 w-5 cursor-not-allowed border-gray-300 text-primary focus:ring-primary disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                                onChange={() => { }}
                            />
                            <span
                                className={cn(
                                    'flex-1 text-base',
                                    option.selected
                                        ? 'font-medium text-primary'
                                        : 'text-gray-700 dark:text-gray-300'
                                )}
                            >
                                {option.text}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </Card>
    );
}