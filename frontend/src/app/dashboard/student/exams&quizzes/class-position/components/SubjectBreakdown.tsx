// src/components/Dashboard/SubjectBreakdown.tsx
import React from 'react';
import { SubjectPosition } from './types';
import ProgressBar from './ui/ProgressBar';

const subjects: SubjectPosition[] = [
    { position: '2nd', subject: 'Science', percentage: 95.2, color: 'bg-green-600', darkColor: 'dark:bg-green-500' },
    { position: '3rd', subject: 'Mathematics', percentage: 92.8, color: 'bg-blue-600', darkColor: 'dark:bg-blue-500' },
    { position: '4th', subject: 'Art', percentage: 88.1, color: 'bg-indigo-600', darkColor: 'dark:bg-indigo-500' },
    { position: '5th', subject: 'History', percentage: 85.5, color: 'bg-purple-600', darkColor: 'dark:bg-purple-500' },
    { position: '8th', subject: 'English', percentage: 76.3, color: 'bg-yellow-500', darkColor: 'dark:bg-yellow-400' },
    { position: '11th', subject: 'Economics', percentage: 69.0, color: 'bg-red-600', darkColor: 'dark:bg-red-500' },
];

const getPositionColor = (position: string): string => {
    const colors: Record<string, string> = {
        '2nd': 'text-green-600 dark:text-green-400',
        '3rd': 'text-blue-600 dark:text-blue-400',
        '4th': 'text-indigo-600 dark:text-indigo-400',
        '5th': 'text-purple-600 dark:text-purple-400',
        '8th': 'text-yellow-600 dark:text-yellow-400',
        '11th': 'text-red-600 dark:text-red-400',
    };
    return colors[position] || 'text-gray-600 dark:text-gray-400';
};

const SubjectBreakdown: React.FC = () => {
    return (
        <div className="bg-white dark:bg-[#1C2431] rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#0e121b] dark:text-white mb-6">
                Subject Position Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {subjects.map((subject) => (
                    <div key={subject.subject} className="flex items-center gap-4">
                        <p className={`text-3xl font-bold w-12 text-center ${getPositionColor(subject.position)}`}>
                            {subject.position}
                        </p>
                        <div className="w-full">
                            <p className="text-base font-medium text-[#0e121b] dark:text-gray-300 mb-1">
                                {subject.subject}
                            </p>
                            <ProgressBar
                                percentage={subject.percentage}
                                color={subject.color}
                                darkColor={subject.darkColor}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubjectBreakdown;