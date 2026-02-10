'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarControlsProps {
    currentMonth: Date;
    onPrevious: () => void;
    onNext: () => void;
    onToday?: () => void;
    showTodayButton?: boolean;
}

export default function CalendarControls({
    currentMonth,
    onPrevious,
    onNext,
    onToday,
    showTodayButton = true,
}: CalendarControlsProps) {
    const monthYear = format(currentMonth, 'MMMM yyyy');

    return (
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <button
                onClick={onPrevious}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Previous month"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {monthYear}
                </h3>

                {showTodayButton && onToday && (
                    <button
                        onClick={onToday}
                        className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                )}
            </div>

            <button
                onClick={onNext}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Next month"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}