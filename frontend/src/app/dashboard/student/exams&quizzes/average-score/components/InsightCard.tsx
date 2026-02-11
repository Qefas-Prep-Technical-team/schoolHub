// src/components/Dashboard/InsightCard.tsx
import React from 'react';
import { InsightCard } from './types';

const InsightCardComponent: React.FC<InsightCard> = ({
    icon,
    title,
    description,
    color
}) => {
    const colorClasses = {
        green: {
            bg: 'bg-green-100 dark:bg-green-900/50',
            text: 'text-green-600 dark:text-green-400',
        },
        amber: {
            bg: 'bg-amber-100 dark:bg-amber-900/50',
            text: 'text-amber-600 dark:text-amber-400',
        },
        blue: {
            bg: 'bg-blue-100 dark:bg-blue-900/50',
            text: 'text-blue-600 dark:text-blue-400',
        },
        red: {
            bg: 'bg-red-100 dark:bg-red-900/50',
            text: 'text-red-600 dark:text-red-400',
        },
    };

    return (
        <div className="flex items-start gap-4 rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClasses[color].bg}`}>
                <span className={`material-symbols-outlined ${colorClasses[color].text}`}>
                    {icon}
                </span>
            </div>
            <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
            </div>
        </div>
    );
};

export default InsightCardComponent;