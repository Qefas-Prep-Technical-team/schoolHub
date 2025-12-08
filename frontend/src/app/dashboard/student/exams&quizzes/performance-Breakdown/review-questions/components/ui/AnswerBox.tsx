import { ReactNode } from 'react';

interface AnswerBoxProps {
    title: string;
    answer: string;
    variant?: 'user' | 'correct' | 'explanation';
    children?: ReactNode;
}

export default function AnswerBox({ title, answer, variant = 'user', children }: AnswerBoxProps) {
    const variantClasses = {
        user: 'bg-green-50 dark:bg-green-900/30',
        correct: 'bg-gray-100 dark:bg-gray-700/50',
        explanation: 'border border-gray-200/80 dark:border-gray-700/80',
    };

    const variantColors = {
        user: 'text-green-700 dark:text-green-300',
        correct: 'text-primary dark:text-primary-300',
        explanation: 'text-gray-700 dark:text-gray-300',
    };

    return (
        <div className={`rounded-lg p-4 ${variantClasses[variant]}`}>
            <p className={`text-sm font-medium ${variantColors[variant]}`}>{title}</p>
            {children ? (
                <div className="mt-1">{children}</div>
            ) : (
                <p className="font-medium text-gray-900 dark:text-white">{answer}</p>
            )}
        </div>
    );
}