'use client';

import { MonthlyData } from './types';
import Card from './ui/Card';

interface AttendanceChartProps {
    monthlyData: MonthlyData[];
    title?: string;
}

export default function AttendanceChart({ monthlyData, title = "Monthly Attendance Overview" }: AttendanceChartProps) {
    const maxHeight = 180; // Max height in pixels

    return (
        <Card title={title}>
            <div className="flex min-w-72 flex-1 flex-col gap-4">
                <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
                    {monthlyData.map((month, index) => {
                        const totalDays = month.present + month.absent + month.late;
                        const presentPercentage = totalDays > 0 ? (month.present / totalDays) * 100 : 0;
                        const absentPercentage = totalDays > 0 ? (month.absent / totalDays) * 100 : 0;
                        const latePercentage = totalDays > 0 ? (month.late / totalDays) * 100 : 0;

                        return (
                            <div key={index} className="flex flex-col items-center">
                                {/* Chart Bars */}
                                <div className="flex w-full h-full flex-col-reverse gap-1" style={{ height: `${maxHeight}px` }}>
                                    {/* Present bar */}
                                    {presentPercentage > 0 && (
                                        <div
                                            className={`w-full rounded-t ${month.isCurrent ? 'bg-primary/30' : 'bg-green-500/30 dark:bg-green-400/30'}`}
                                            style={{ height: `${(presentPercentage / 100) * maxHeight}px` }}
                                        />
                                    )}

                                    {/* Late bar */}
                                    {latePercentage > 0 && (
                                        <div
                                            className="w-full rounded-t bg-amber-500/30 dark:bg-amber-400/30"
                                            style={{ height: `${(latePercentage / 100) * maxHeight}px` }}
                                        />
                                    )}

                                    {/* Absent bar */}
                                    {absentPercentage > 0 && (
                                        <div
                                            className="w-full rounded-t bg-red-500/30 dark:bg-red-400/30"
                                            style={{ height: `${(absentPercentage / 100) * maxHeight}px` }}
                                        />
                                    )}
                                </div>

                                {/* Month Label */}
                                <p className={`text-[13px] font-bold leading-normal tracking-[0.015em] mt-2 ${month.isCurrent
                                        ? 'text-primary'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {month.month}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500/30 dark:bg-green-400/30 rounded"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500/30 dark:bg-amber-400/30 rounded"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500/30 dark:bg-red-400/30 rounded"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary/30 rounded"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">Current Month</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}