"use client";

import React, { useMemo, useState } from 'react';
import PageHeader from './components/PageHeader';
import InfoBanner from './components/InfoBanner';
import StatCard from './components/StatCard';
import AttendanceChart from './components/AttendanceChart';
import { useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { user } = useAuthStore();
    const studentId = user?.id || '';
    const [viewType, setViewType] = useState<'day' | 'week' | 'month' | 'term'>('day');

    const { data: response, isLoading } = useStudentAttendance(studentId);
    
    // Process attendance data
    const attendanceData = useMemo(() => {
        const records = response || [];
        
        let present = 0;
        let absent = 0;
        let late = 0;
        const total = records.length;
        
        // Group by day for the chart
        const chartDataMap: Record<string, { label: string; present: number; late: number; absent: number }> = {};
        
        records.forEach((record: any) => {
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
                // Group all into 'Current Term' for term view, or you can calculate terms if term dates are available.
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
            presentPct,
            absentPct,
            latePct,
            chartData
        };
    }, [response, viewType]);

    const stats: Array<React.ComponentProps<typeof StatCard>> = [
        {
            title: 'Present',
            value: `${attendanceData.presentPct}%`,
            icon: 'check_circle',
            iconColor: 'text-green-500',
        },
        {
            title: 'Absent',
            value: `${attendanceData.absentPct}%`,
            icon: 'cancel',
            iconColor: 'text-red-500',
        },
        {
            title: 'Late',
            value: `${attendanceData.latePct}%`,
            icon: 'schedule',
            iconColor: 'text-yellow-500',
        },
        {
            title: 'Total Days',
            value: `${attendanceData.total}`,
            icon: 'event_available',
            iconColor: 'text-text-light-secondary dark:text-dark-secondary',
            description: 'in this term',
        },
    ];

    return (
        <div className="relative flex min-h-screen w-full">
            <main className="flex-1 p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <PageHeader records={response || []} />
                    <InfoBanner />

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
                            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Loading attendance data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, index) => (
                                    <StatCard key={index} {...stat} />
                                ))}
                            </div>

                            {/* Chart Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Overview</h3>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
                                        {(['day', 'week', 'month', 'term'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setViewType(type)}
                                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                                    viewType === type 
                                                    ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' 
                                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <AttendanceChart data={attendanceData.chartData} />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
