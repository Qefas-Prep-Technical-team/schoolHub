'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface LowAttendanceClass {
    id: string;
    name: string;
    attendance: number;
    severity: 'severe' | 'warning' | 'moderate';
    teacher?: string;
    department?: string;
}

export default function LowAttendanceList() {
    const [classes] = useState<LowAttendanceClass[]>([
        {
            id: '1',
            name: 'Grade 10-B',
            attendance: 65,
            severity: 'severe',
            teacher: 'Mr. Johnson',
            department: 'Mathematics',
        },
        {
            id: '2',
            name: 'Grade 8-A',
            attendance: 72,
            severity: 'warning',
            teacher: 'Ms. Williams',
            department: 'Science',
        },
        {
            id: '3',
            name: 'Grade 12-C',
            attendance: 74,
            severity: 'warning',
            teacher: 'Mr. Davis',
            department: 'History',
        },
        {
            id: '4',
            name: 'Grade 9-D',
            attendance: 78,
            severity: 'moderate',
            teacher: 'Mrs. Thompson',
            department: 'English',
        },
    ]);

    const getSeverityConfig = (severity: LowAttendanceClass['severity']) => {
        switch (severity) {
            case 'severe':
                return {
                    color: 'text-red-500',
                    bg: 'bg-red-50 dark:bg-red-900/10',
                    border: 'border-red-200 dark:border-red-900',
                    label: 'Severe Alert',
                };
            case 'warning':
                return {
                    color: 'text-orange-500',
                    bg: 'bg-orange-50 dark:bg-orange-900/10',
                    border: 'border-orange-200 dark:border-orange-900',
                    label: 'Warning',
                };
            case 'moderate':
                return {
                    color: 'text-yellow-500',
                    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
                    border: 'border-yellow-200 dark:border-yellow-900',
                    label: 'Moderate',
                };
        }
    };

    return (
        <div className="flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary-light dark:text-text-primary-dark text-base font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Low Attendance Classes
                </h3>
                <button className="text-primary text-xs font-bold hover:underline">
                    View All
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {classes.map((classItem) => {
                    const severity = getSeverityConfig(classItem.severity);
                    return (
                        <div
                            key={classItem.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${severity.bg} border border-transparent hover:${severity.border} transition-colors group cursor-pointer`}
                        >
                            <div className="flex-1">
                                <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                                    {classItem.name}
                                </p>
                                {classItem.teacher && (
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                        {classItem.teacher} • {classItem.department}
                                    </p>
                                )}
                                <p className={`text-xs font-medium mt-1 ${severity.color}`}>
                                    {severity.label}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark group-hover:scale-110 transition-transform">
                                    {classItem.attendance}%
                                </p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                    Attendance
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary-light dark:text-text-secondary-dark">
                        {classes.length} classes need attention
                    </span>
                    <button className="text-primary text-sm font-medium hover:text-primary/80 transition-colors">
                        Send Notifications
                    </button>
                </div>
            </div>
        </div>
    );
}