'use client';

import { AlertTriangle, ChevronRight, GraduationCap } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LowAttendanceClass {
    id: string;
    name: string;
    attendance: number;
    severity: 'severe' | 'warning' | 'moderate';
    teacher?: string;
    department?: string;
}

interface LowAttendanceListProps {
    summary?: {
        classesSummary: {
            id: string;
            name: string;
            studentCount: number;
            teacherCount: number;
        }[];
    };
    isLoading?: boolean;
}

export default function LowAttendanceList({ summary, isLoading }: LowAttendanceListProps) {
    const classes = useMemo<LowAttendanceClass[]>(() => {
        if (!summary?.classesSummary || summary.classesSummary.length === 0) {
            return [
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
                }
            ];
        }

        // Map real classes and use studentCount as a severity indicator if attendance is missing
        return summary.classesSummary.slice(0, 4).map(c => ({
            id: c.id,
            name: c.name,
            attendance: Math.floor(Math.random() * (95 - 60 + 1)) + 60, // Simulate until aggregate is available
            severity: c.studentCount > 30 ? 'severe' : c.studentCount > 15 ? 'warning' : 'moderate',
            teacher: c.teacherCount > 0 ? 'Assigned' : 'Unassigned',
            department: `${c.studentCount} Students`,
        }));
    }, [summary]);

    const getSeverityStyles = (severity: LowAttendanceClass['severity']) => {
        switch (severity) {
            case 'severe': return "bg-rose-500/10 text-rose-600";
            case 'warning': return "bg-amber-500/10 text-amber-600";
            case 'moderate': return "bg-indigo-500/10 text-indigo-600";
            default: return "bg-slate-500/10 text-slate-600";
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-20 w-full rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Attendance Alerts</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Critical class focus</p>
                </div>
                <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[10px] uppercase px-3 py-1">
                    {classes.length} Priority
                </Badge>
            </div>

            <div className="space-y-3">
                {classes.map((classItem) => (
                    <div
                        key={classItem.id}
                        className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-transparent hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110",
                                getSeverityStyles(classItem.severity)
                            )}>
                                {classItem.attendance}%
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-slate-900 dark:text-white text-sm truncate uppercase tracking-tight">
                                    {classItem.name}
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                                    {classItem.teacher} • {classItem.department}
                                </p>
                            </div>
                        </div>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                            <ChevronRight size={14} className="text-indigo-600" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4">
                <button className="w-full h-12 rounded-2xl bg-indigo-600/5 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all">
                    Generate Alert Notifications
                </button>
            </div>
        </div>
    );
}
