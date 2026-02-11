// src/components/Dashboard/StatCard.tsx
import React from 'react';
import { ExamStat } from './types';

const StatCard: React.FC<ExamStat> = ({ label, value }) => {
    return (
        <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 border border-[#d1d8e6] dark:border-gray-700 bg-white dark:bg-[#1a232f]">
            <p className="text-[#506795] dark:text-gray-400 text-base font-medium leading-normal">
                {label}
            </p>
            <p className="text-[#0e121b] dark:text-white tracking-light text-2xl font-bold leading-tight">
                {value}
            </p>
        </div>
    );
};

export default StatCard;