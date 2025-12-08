// src/components/Dashboard/StatsCard.tsx
import React from 'react';
import { StatsCardData } from './types';

const StatsCard: React.FC<StatsCardData> = ({ title, value, trend }) => {
    return (
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 text-base font-medium leading-normal">
                {title}
            </p>
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                {value}
            </p>
            {trend && (
                <div className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-lg ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                        trending_{trend.direction}
                    </span>
                    <p className={`${trend.color} text-sm font-medium leading-normal`}>
                        {trend.direction === 'up' ? '+' : ''}{trend.value}
                    </p>
                </div>
            )}
        </div>
    );
};

export default StatsCard;