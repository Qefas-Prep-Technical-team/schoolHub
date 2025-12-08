'use client';

import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface QuestionNavigationProps {
    totalQuestions: number;
    currentQuestion: number;
    onQuestionSelect: (questionNumber: number) => void;
    onSubmit: () => void;
}

export default function QuestionNavigation({
    totalQuestions,
    currentQuestion,
    onQuestionSelect,
    onSubmit,
}: QuestionNavigationProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-base font-bold">Questions</h3>

            <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
                    <Button
                        key={num}
                        variant={num === currentQuestion ? 'primary' : 'outline'}
                        size="icon"
                        onClick={() => onQuestionSelect(num)}
                        className="h-10 w-10"
                    >
                        {num}
                    </Button>
                ))}
            </div>

            <Button
                className="w-full"
                onClick={onSubmit}
                disabled={false} // Change based on your logic
            >
                Submit Quiz
            </Button>
        </div>
    );
}