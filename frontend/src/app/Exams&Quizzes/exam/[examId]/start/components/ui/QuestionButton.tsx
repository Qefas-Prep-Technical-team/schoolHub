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
            className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl font-bold text-sm transition-all duration-200 ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105 z-10'
                    : 'border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-500/50'
                }`}
        >
            {number}
            {isAnswered && !isActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                </span>
            )}
        </button>
    );
};

export default QuestionButton;