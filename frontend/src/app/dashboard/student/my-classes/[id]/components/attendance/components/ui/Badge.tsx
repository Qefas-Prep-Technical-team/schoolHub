/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AttendanceStatsType } from "../types";



interface BadgeProps {
    status: AttendanceStatsType;
    className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'present':
                return {
                    bg: 'bg-green-100 dark:bg-green-900/50',
                    text: 'text-green-800 dark:text-green-300',
                    label: 'Present'
                };
            case 'absent':
                return {
                    bg: 'bg-red-100 dark:bg-red-900/50',
                    text: 'text-red-800 dark:text-red-300',
                    label: 'Absent'
                };
            case 'late':
                return {
                    bg: 'bg-amber-100 dark:bg-amber-900/50',
                    text: 'text-ambers-800 dark:text-amber-300',
                    label: 'Late'
                };
            default:
                return {
                    bg: 'bg-slate-100 dark:bg-slate-700/50',
                    text: 'text-slate-800 dark:text-slate-300',
                    label: status
                };
        }
    };

    const config = getStatusConfig(status as any );

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${className}`}>
            {config.label}
        </span>
    );
}