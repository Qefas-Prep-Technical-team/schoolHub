// src/components/Dashboard/ExamHeader.tsx
import React from 'react';
import Badge from './ui/Badge';

interface ExamHeaderProps {
    title: string;
    description?: string;
    status?: string;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ title, description, status }) => {
    return (
        <div className="flex flex-wrap justify-between items-start gap-6">
            <div className="flex min-w-72 flex-col gap-2">
                <p className="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    {title}
                </p>
                {description && (
                   <p className="text-[#506795] dark:text-gray-400 text-base font-normal leading-normal">
                       {description}
                   </p>
                )}
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="status">{status || "In Progress"}</Badge>
            </div>
        </div>
    );
};

export default ExamHeader;
