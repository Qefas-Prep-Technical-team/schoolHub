import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface SectionCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
    info?: string;
    badge?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    children,
    className = '',
    headerAction,
    info,
    badge,
}) => {
    return (
        <div
            className={cn(
                "bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden transition-all duration-200 flex flex-col justify-between",
                className
            )}
        >
            <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3.5 mb-4">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                            {title}
                        </h3>
                        {badge}
                        {info && (
                            <UITooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="More information"
                                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-help shrink-0"
                                    >
                                        <Info size={14} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs font-medium leading-relaxed z-[80]">
                                    <p>{info}</p>
                                </TooltipContent>
                            </UITooltip>
                        )}
                    </div>
                    {headerAction && <div className="w-full sm:w-auto shrink-0">{headerAction}</div>}
                </div>
                <div className="flex-1 w-full flex flex-col">{children}</div>
            </div>
        </div>
    );
};

