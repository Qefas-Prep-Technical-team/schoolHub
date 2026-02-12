'use client';

import Button from './ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationFooterProps {
    currentQuestion: number;
    totalQuestions: number;
    onPrevious: () => void;
    onNext: () => void;
    className?: string;
}

export default function NavigationFooter({
    currentQuestion,
    totalQuestions,
    onPrevious,
    onNext,
    className = '',
}: NavigationFooterProps) {
    const canGoPrevious = currentQuestion > 1;
    const canGoNext = currentQuestion < totalQuestions;

    return (
        <div className={`mt-8 flex items-center justify-between border-t border-gray-200/80 pt-6 dark:border-gray-700/80 ${className}`}>
            <Button
                variant="outline"
                onClick={canGoPrevious ? onPrevious : undefined}
                icon={<ArrowLeft className="h-4 w-4" />}
            >
                Previous Question
            </Button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestion} of {totalQuestions}
            </div>

            <Button
                onClick={canGoNext ? onNext : undefined}
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
            >
                Next Question
            </Button>
        </div>
    );
}