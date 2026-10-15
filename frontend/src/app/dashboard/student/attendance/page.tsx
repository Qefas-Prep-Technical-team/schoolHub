"use client";

import React, { useMemo, useState } from 'react';
import PageHeader from './components/PageHeader';
import InfoBanner from './components/InfoBanner';
import StatCard from './components/StatCard';
import AttendanceChart from './components/AttendanceChart';
import AttendanceList from './components/AttendanceList';
import { useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { format } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

interface AttendanceRecordItem {
    id?: string;
    date: string;
    status: string;
    notes?: string;
    note?: string;
    class?: {
        name?: string;
    };
}

export default function StudentAttendancePage() {
    const { user } = useAuthStore();
    const studentId = user?.id || '';
    const [viewType, setViewType] = useState<'day' | 'week' | 'month' | 'term'>('day');

    const { data: response, isLoading } = useStudentAttendance(studentId);
    
    // Process attendance data
    const attendanceData = useMemo(() => {
        const records = (response as AttendanceRecordItem[]) || [];
        
        let present = 0;
        let absent = 0;
        let late = 0;
        const total = records.length;
        
        // Group by time-series for the chart
        const chartDataMap: Record<string, { label: string; present: number; late: number; absent: number }> = {};
        
        records.forEach((record) => {
            const status = record.status?.toUpperCase() || '';
            if (status === 'PRESENT') present++;
            else if (status === 'ABSENT') absent++;
            else if (status === 'LATE') late++;
            
            // Format label based on viewType
            const dateObj = new Date(record.date);
            let dateStr = '';
            
            if (viewType === 'day') {
                dateStr = format(dateObj, 'MMM dd');
            } else if (viewType === 'week') {
                dateStr = `Week ${format(dateObj, 'w')}`;
            } else if (viewType === 'month') {
                dateStr = format(dateObj, 'MMM yyyy');
            } else {
                dateStr = 'Current Term';
            }
            
            if (!chartDataMap[dateStr]) {
                chartDataMap[dateStr] = { label: dateStr, present: 0, late: 0, absent: 0 };
            }
            
            if (status === 'PRESENT') chartDataMap[dateStr].present += 1;
            else if (status === 'ABSENT') chartDataMap[dateStr].absent += 1;
            else if (status === 'LATE') chartDataMap[dateStr].late += 1;
        });
        
        // Convert map to array
        const chartData = Object.values(chartDataMap);

        const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
        const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;
        const latePct = total > 0 ? Math.round((late / total) * 100) : 0;
        
        return {
            total,
            presentCount: present,
            absentCount: absent,
            lateCount: late,
            presentPct,
            absentPct,
            latePct,
            chartData
        };
    }, [response, viewType]);

    const stats = [
        {
            title: 'Present Sessions',
            value: `${attendanceData.presentPct}%`,
            description: `${attendanceData.presentCount} of ${attendanceData.total} days logged`,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
            color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            tooltip: "Percentage of total school days where presence was officially verified and confirmed.",
        },
        {
            title: 'Unexcused / Absent',
            value: `${attendanceData.absentPct}%`,
            description: `${attendanceData.absentCount} missed sessions`,
            icon: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
            color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
            tooltip: "Percentage of recorded absences. Keep attendance above 75% to maintain examination qualification status.",
        },
        {
            title: 'Late Arrivals',
            value: `${attendanceData.latePct}%`,
            description: `${attendanceData.lateCount} delayed check-ins`,
            icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
            color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
            tooltip: "Sessions where arrival was registered after the morning assembly or morning roll call bell.",
        },
        {
            title: 'Evaluated Days',
            value: `${attendanceData.total} Days`,
            description: 'Official academic days recorded',
            icon: <Calendar className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
            color: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400",
            tooltip: "Cumulative sum of recorded attendance days within this term's academic calendar.",
        },
    ];

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
            <PageHeader records={response || []} />
            <InfoBanner />

            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[11px] tracking-widest">
                        Loading attendance data...
                    </p>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-5">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                        Attendance Trend Overview
                                    </h3>
                                    <HeaderTooltip 
                                        content="Visual projection of your presence, tardiness, and absences over time. Switch between day, week, month, and term views to analyze longitudinal consistency."
                                    />
                                </div>
                                <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                    Presence Frequency Timeline
                                </p>
                            </div>
                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 w-full sm:w-auto">
                                {(['day', 'week', 'month', 'term'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setViewType(type)}
                                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 capitalize cursor-pointer ${
                                            viewType === type 
                                            ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/25' 
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <AttendanceChart data={attendanceData.chartData} />
                    </div>

                    {/* Recent Attendance List with Grid/Table toggle & Pink pagination */}
                    <AttendanceList records={response || []} />
                </>
            )}
        </div>
    );
}
