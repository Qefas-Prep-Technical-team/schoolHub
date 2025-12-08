import { QuizInfo } from './types';
import Button from './ui/Button';
import { List } from 'lucide-react';

interface PageHeaderProps {
    quiz: QuizInfo;
    onJumpToQuestion?: () => void;
}

export default function PageHeader({ quiz, onJumpToQuestion }: PageHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-6 dark:border-gray-700/80">
            <div className="flex min-w-72 flex-col gap-2">
                <p className="text-3xl font-bold leading-tight tracking-tight text-[#0e0e1b] dark:text-white">
                    Review: {quiz.title}
                </p>
                <p className="text-base font-normal leading-normal text-[#505095] dark:text-gray-400">
                    {quiz.description}
                </p>
            </div>
            <Button
                variant="outline"
                onClick={onJumpToQuestion}
                icon={<List className="h-4 w-4" />}
            >
                Jump to Question
            </Button>
        </div>
    );
}