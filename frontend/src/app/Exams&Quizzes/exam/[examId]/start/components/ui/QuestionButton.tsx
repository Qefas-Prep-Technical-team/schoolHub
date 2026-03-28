// src/components/UI/QuestionButton.tsx
import React from 'react';

interface QuestionButtonProps {
    number: number;
    isActive?: boolean;
    isAnswered?: boolean;
    onClick?: () => void;
}

const QuestionButton: React.FC<QuestionButtonProps> = ({
    number,
    isActive = false,
    isAnswered = false,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
        >
            {number}
            {isAnswered && !isActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-[#1F2937]"></span>
                </span>
            )}
        </button>
    );
};

export default QuestionButton;