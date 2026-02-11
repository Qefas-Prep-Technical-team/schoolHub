// src/components/Dashboard/ExamHeader.tsx
import React from 'react';
import Badge from './ui/Badge';

const ExamHeader: React.FC = () => {
    return (
        <div className="flex flex-wrap justify-between items-start gap-6">
            <div className="flex min-w-72 flex-col gap-2">
                <p className="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Mathematics Mid-Term Examination
                </p>
                <p className="text-[#506795] dark:text-gray-400 text-base font-normal leading-normal">
                    Subject: Mathematics | Class: 10th Grade | Teacher: Mr. Alan Turing
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="status">Not Started</Badge>
            </div>
        </div>
    );
};

export default ExamHeader;