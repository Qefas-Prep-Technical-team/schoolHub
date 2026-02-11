// src/components/Dashboard/StatCard.tsx
import React from 'react';
import { AttendanceStat } from './types';

const StatCard: React.FC<AttendanceStat> = ({ type, count, icon, label }) => {
    const getColorClasses = () => {
        switch (type) {
            case 'present':
                return 'text-green-600 dark:text-green-400';
            case 'absent':
                return 'text-red-600 dark:text-red-400';
            case 'late':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'excused':
                return 'text-blue-600 dark:text-blue-400';
            default:
                return 'text-slate-600 dark:text-slate-400';
        }
    };

    return (
        <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`flex items-center gap-2 ${getColorClasses()}`}>
                <span className="material-symbols-outlined">{icon}</span>
                <p className="text-base font-medium">{label}</p>
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {count}
            </p>
        </div>
    );
};

export default StatCard;