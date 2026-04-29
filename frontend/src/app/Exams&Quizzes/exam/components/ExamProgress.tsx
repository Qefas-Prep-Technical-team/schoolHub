// src/components/Dashboard/ExamProgress.tsx
import React from 'react';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';

interface ExamProgressProps {
    progress: number;
    totalQuestions: number;
    answeredQuestions: number;
}

const ExamProgress: React.FC<ExamProgressProps> = ({ progress, totalQuestions, answeredQuestions }) => {
    return (
        <div className="border-t border-[#d1d8e6] dark:border-gray-700 pt-6 flex flex-col gap-4">
            <div className="w-full">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-primary dark:text-primary">
                        Progress
                    </span>
                    <span className="text-sm font-medium text-primary dark:text-primary">
                        {Math.round(progress)}%
                    </span>
                </div>
                <ProgressBar progress={progress} />
            </div>
            <div className="flex justify-between text-sm">
                <p className="text-[#506795] dark:text-gray-400">
                    Questions Answered
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                    {answeredQuestions} / {totalQuestions}
                </p>
            </div>
        </div>
    );
};

export default ExamProgress;
