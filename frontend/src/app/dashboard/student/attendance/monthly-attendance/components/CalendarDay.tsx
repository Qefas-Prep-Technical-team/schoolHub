// src/components/Calendar/CalendarDay.tsx
import React from 'react';
import { CalendarDayProps } from './types';
import DayTooltip from './DayTooltip';
import Link from 'next/link';

const CalendarDay: React.FC<CalendarDayProps> = ({
    date,
    status,
    subject,
    comment,
    tooltip,
    isToday = false,
    onClick,
}) => {
    const getStatusClasses = () => {
        switch (status) {
            case 'present':
                return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
            case 'absent':
                return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
            case 'late':
                return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
            case 'no-class':
                return 'bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400';
            case 'today':
                return 'bg-primary text-white ring-2 ring-primary/50 dark:ring-primary/70 font-bold';
            default:
                return 'hover:bg-primary/10';
        }
    };

    const hasTooltip = tooltip && (status === 'absent' || status === 'late');

    return (
        <Link href={"/dashboard/student/attendance/daily-breakdown/1"} className={`p-1 relative ${hasTooltip ? 'group' : ''} cursor-pointer`}>
            <button
                onClick={onClick}
                className={`h-16 w-full flex items-center justify-center cursor-pointer rounded-xl text-sm font-medium ${getStatusClasses()}`}
            >
                {date}
            </button>
            {hasTooltip && tooltip && (
                <DayTooltip title={tooltip.title} description={tooltip.description} />
            )}
        </Link>
    );
};

export default CalendarDay;