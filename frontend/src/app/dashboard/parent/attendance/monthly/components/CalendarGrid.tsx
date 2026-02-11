'use client';

import { CalendarDay } from "./types";
import CalendarDayCell from "./ui/CalendarDayCell";



interface CalendarGridProps {
    days: CalendarDay[];
    onDayClick?: (day: CalendarDay) => void;
    selectedDate?: Date;
}

export default function CalendarGrid({ days, onDayClick, selectedDate }: CalendarGridProps) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Group days into weeks (7 days each)
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-[minmax(100px,_1fr)] bg-slate-200 dark:bg-slate-800 gap-px">
                {days.map((day, index) => (
                    <CalendarDayCell
                        key={`${day.date.toISOString()}-${index}`}
                        day={day}
                        onClick={() => onDayClick?.(day)}
                        isSelected={selectedDate && day.date.toDateString() === selectedDate.toDateString()}
                    />
                ))}
            </div>
        </div>
    );
}