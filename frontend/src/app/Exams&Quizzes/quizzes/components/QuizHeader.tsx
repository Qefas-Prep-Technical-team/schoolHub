// src/components/Header/QuizHeader.tsx
import React from 'react';

const QuizHeader: React.FC = () => {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="flex min-w-72 flex-col gap-1">
                <p className="text-sm font-medium text-primary">
                    Math | Grade 8
                </p>
                <p className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                    Algebra Quick Check
                </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined !text-5xl">calculate</span>
            </div>
        </header>
    );
};

export default QuizHeader;