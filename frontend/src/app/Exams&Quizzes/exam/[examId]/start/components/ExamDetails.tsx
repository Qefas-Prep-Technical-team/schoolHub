// src/components/Dashboard/ExamDetails.tsx
import React from 'react';
import { ExamDetail } from './types';

interface ExamDetailsProps {
    classLabel: string;
    durationMinutes: number;
    subjectName: string;
    totalQuestions: number;
}

const ExamDetails: React.FC<ExamDetailsProps> = ({ 
    classLabel, 
    durationMinutes, 
    subjectName, 
    totalQuestions 
}) => {
    const details: ExamDetail[] = [
        { label: 'Class', value: classLabel },
        { label: 'Duration', value: `${durationMinutes} Minutes` },
        { label: 'Subject', value: subjectName },
        { label: 'Total Questions', value: totalQuestions.toString() },
    ];

    return (
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 backdrop-blur-sm p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-4">
                {details.map((detail) => (
                    <div key={detail.label} className="flex flex-col gap-1 py-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {detail.label}
                        </p>
                        <p className="text-base font-bold leading-normal text-slate-900 dark:text-slate-100">
                            {detail.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamDetails;