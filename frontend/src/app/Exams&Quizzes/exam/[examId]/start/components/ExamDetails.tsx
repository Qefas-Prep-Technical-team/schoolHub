// src/components/Dashboard/ExamDetails.tsx
import React from 'react';
import { ExamDetail } from './types';

interface ExamDetailsProps {
    className?: string;
    durationMinutes: number;
    subjectName: string;
    totalQuestions: number;
}

const ExamDetails: React.FC<ExamDetailsProps> = ({ 
    className = "Grade 10 - Section A", 
    durationMinutes, 
    subjectName, 
    totalQuestions 
}) => {
    const details: ExamDetail[] = [
        { label: 'Class', value: className },
        { label: 'Duration', value: `${durationMinutes} Minutes` },
        { label: 'Subject', value: subjectName },
        { label: 'Total Questions', value: totalQuestions.toString() },
    ];

    return (
        <div className="mt-6 rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] p-4">
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 md:grid-cols-4">
                {details.map((detail) => (
                    <div key={detail.label} className="flex flex-col gap-1 py-2">
                        <p className="text-sm font-normal leading-normal text-[#506795] dark:text-[#9CA3AF]">
                            {detail.label}
                        </p>
                        <p className="text-sm font-medium leading-normal">
                            {detail.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamDetails;