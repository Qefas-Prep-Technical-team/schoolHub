'use client';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarDay } from '../types';

interface CalendarDayCellProps {
    day: CalendarDay;
    onClick?: () => void;
    isSelected?: boolean;
}

export default function CalendarDayCell({ day, onClick, isSelected }: CalendarDayCellProps) {
type AttendanceStatus = NonNullable<CalendarDay['attendance']>['status'];

const getStatusConfig = (status?: AttendanceStatus) => {
        switch (status) {
            case 'present':
                return {
                    icon: Check,
                    color: 'text-green-700 dark:text-green-400',
                    bg: 'bg-green-100 dark:bg-green-900/40',
                    label: 'Present',
                };
            case 'absent':
                return {
                    icon: X,
                    color: 'text-red-700 dark:text-red-400',
                    bg: 'bg-red-100 dark:bg-red-900/40',
                    label: 'Absent',
                };
            case 'late':
                return {
                    icon: Clock,
                    color: 'text-yellow-700 dark:text-yellow-400',
                    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
                    label: 'Late',
                };
            case 'holiday':
                return {
                    icon: Calendar,
                    color: 'text-blue-700 dark:text-blue-400',
                    bg: 'bg-blue-100 dark:bg-blue-900/40',
                    label: 'Holiday',
                };
            default:
                return null;
        }
    };

    const statusConfig = getStatusConfig(day.attendance?.status);

    const isToday = day.date.toDateString() === new Date().toDateString();

    return (
        <div
            onClick={onClick}
            className={cn(
                'p-2 flex flex-col gap-2 transition-colors cursor-pointer',
                day.isWeekend || day.attendance?.status === 'weekend'
                    ? 'bg-slate-50 dark:bg-surface-dark'
                    : 'bg-surface-light dark:bg-surface-dark',
                !day.isCurrentMonth && 'opacity-40',
                'hover:bg-slate-50 dark:hover:bg-slate-800',
                isSelected && 'ring-2 ring-primary ring-inset'
            )}
        >
            {/* Date Number */}
            <span className={cn(
                'text-sm font-medium',
                isToday && 'w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white shadow-sm',
                day.isWeekend || day.attendance?.status === 'weekend'
                    ? 'text-slate-400'
                    : 'text-slate-700 dark:text-slate-300'
            )}>
                {format(day.date, 'd')}
            </span>

            {/* Status Indicator */}
            {statusConfig && (
                <div className="flex-1 flex flex-col justify-center items-center">
                    <div className={`h-8 w-8 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center justify-center`}>
                        <statusConfig.icon className="h-[20px] w-[20px]" />
                    </div>
                    <span className="text-[10px] font-medium mt-1 text-center">
                        {day.attendance?.lateMinutes
                            ? `${statusConfig.label} (${day.attendance.lateMinutes}m)`
                            : statusConfig.label
                        }
                    </span>
                </div>
            )}

            {/* Holiday Label */}
            {day.attendance?.status === 'holiday' && !statusConfig && (
                <div className="flex-1 flex flex-col justify-center items-center opacity-70">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">
                        Holiday
                    </span>
                </div>
            )}
        </div>
    );
}