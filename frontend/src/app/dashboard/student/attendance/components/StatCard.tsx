'use client';

import React from 'react';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    color?: string;
    trend?: {
        value: string;
        color?: string;
        isPositive: boolean;
    };
    description?: string;
    tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10",
    trend,
    description,
    tooltip
}) => {
    return (
        <div className="flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-1.5 sm:gap-3 mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    {icon && (
                        <div className={cn("h-8 w-8 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5", color)}>
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                            {title}
                        </p>
                    </div>
                </div>

                {tooltip && (
                    <div className="shrink-0">
                        <HeaderTooltip content={tooltip} size={13} />
                    </div>
                )}
            </div>

            <div className="pt-1.5 sm:pt-2 flex items-baseline justify-between gap-1.5">
                <div className="min-w-0">
                    <p className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {value}
                    </p>
                    {description && (
                        <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium mt-0.5 truncate">
                            {description}
                        </p>
                    )}
                </div>

                {trend && (
                    <span className={cn(
                        "text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0",
                        trend.isPositive 
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" 
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50"
                    )}>
                        {trend.isPositive ? '+' : ''}{trend.value}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;

