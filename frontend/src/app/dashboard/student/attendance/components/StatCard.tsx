// src/components/Dashboard/StatCard.tsx
import React from 'react';
import { StatCardData } from './types';

const StatCard: React.FC<StatCardData> = ({
    title,
    value,
    bgColor = "bg-blue-500",
    textColor = "text-white",
    ringColor = "ring-blue-500",
    trend,
    description
}) => {
    return (
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className={`px-6 py-4 ${bgColor} ${textColor}`}>
                <h3 className="text-lg font-bold tracking-wide">{title}</h3>
            </div>
            <div className="p-6 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {value}
                        </p>
                        {description && (
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    
                    {trend && (
                        <div className="flex flex-col items-end">
                            <span className={`text-xs font-black ${trend.color} flex items-center gap-0.5`}>
                                {trend.isPositive ? '+' : ''}{trend.value}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
