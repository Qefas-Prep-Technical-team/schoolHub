'use client';

import { AttendanceStatsType } from "./types";
import Card from "./ui/Card";


interface AttendanceStatsProps {
    stats: AttendanceStatsType;
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
    const formatPercentage = (value: number) => {
        return `${value.toFixed(0)}%`;
    };

    const getTrendIcon = (change: number) => {
        if (change > 0) {
            return (
                <span className="material-symbols-outlined text-lg">
                    arrow_upward
                </span>
            );
        } else if (change < 0) {
            return (
                <span className="material-symbols-outlined text-lg">
                    arrow_downward
                </span>
            );
        }
        return null;
    };

    const getTrendColor = (change: number) => {
        if (change > 0) return 'text-green-600 dark:text-green-500';
        if (change < 0) return 'text-red-600 dark:text-red-500';
        return 'text-slate-600 dark:text-slate-400';
    };

    return (
        <div className="flex flex-wrap gap-4">
            {/* Overall Attendance Rate */}
            <Card padding="lg" hover className="flex-1 min-w-[158px]">
                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal">
                    Overall Attendance Rate
                </p>
                <p className="text-slate-900 dark:text-white tracking-light text-2xl font-bold leading-tight mt-2">
                    {formatPercentage(stats.overallRate)}
                </p>
                <div className={`text-base font-medium leading-normal flex items-center gap-1 mt-2 ${getTrendColor(stats.changeFromPrevious.rate)}`}>
                    {getTrendIcon(stats.changeFromPrevious.rate)}
                    <span>{Math.abs(stats.changeFromPrevious.rate)}%</span>
                </div>
            </Card>

            {/* Days Absent */}
            <Card padding="lg" hover className="flex-1 min-w-[158px]">
                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal">
                    Days Absent
                </p>
                <p className="text-slate-900 dark:text-white tracking-light text-2xl font-bold leading-tight mt-2">
                    {stats.daysAbsent}
                </p>
                <div className={`text-base font-medium leading-normal flex items-center gap-1 mt-2 ${getTrendColor(-stats.changeFromPrevious.absent)}`}>
                    {getTrendIcon(-stats.changeFromPrevious.absent)}
                    <span>{Math.abs(stats.changeFromPrevious.absent)}</span>
                </div>
            </Card>

            {/* Late Arrivals */}
            <Card padding="lg" hover className="flex-1 min-w-[158px]">
                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal">
                    Late Arrivals
                </p>
                <p className="text-slate-900 dark:text-white tracking-light text-2xl font-bold leading-tight mt-2">
                    {stats.lateArrivals}
                </p>
                <div className={`text-base font-medium leading-normal flex items-center gap-1 mt-2 ${getTrendColor(stats.changeFromPrevious.late)}`}>
                    {getTrendIcon(stats.changeFromPrevious.late)}
                    <span>{Math.abs(stats.changeFromPrevious.late)}</span>
                </div>
            </Card>
        </div>
    );
}