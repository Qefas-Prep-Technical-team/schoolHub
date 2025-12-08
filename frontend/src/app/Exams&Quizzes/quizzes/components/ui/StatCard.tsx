// src/components/UI/StatCard.tsx
import React from 'react';
import { QuizStat } from '../types';

const StatCard: React.FC<QuizStat> = ({ icon, value, label }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 text-center dark:bg-gray-800 shadow-sm">
            <span className="material-symbols-outlined text-secondary">
                {icon}
            </span>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
                {value}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {label}
            </p>
        </div>
    );
};

export default StatCard;