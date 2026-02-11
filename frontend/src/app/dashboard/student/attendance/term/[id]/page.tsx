// src/app/page.tsx
import React from 'react';
import PageHeader from '../components/PageHeader';
import TermSelector from '../components/TermSelector';
import OverallAttendance from '../components/OverallAttendance';
import StatCard from '../components/StatCard';
import AttendanceTable from '../components/AttendanceTable';

export default function Home() {
    const attendanceStats = [
        { type: 'present' as const, count: 88, icon: 'check_circle', label: 'Present' },
        { type: 'absent' as const, count: 1, icon: 'cancel', label: 'Absent' },
        { type: 'late' as const, count: 1, icon: 'hourglass_top', label: 'Late' },
        { type: 'excused' as const, count: 0, icon: 'verified', label: 'Excused' },
    ];

    return (
        <div className="relative flex min-h-screen w-full">
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <PageHeader />
                    <TermSelector />

                    {/* Grid for Summary and Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-1">
                            <OverallAttendance />
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {attendanceStats.map((stat) => (
                                <StatCard key={stat.type} {...stat} />
                            ))}
                        </div>
                    </div>

                    {/* Attendance Log Table */}
                    <AttendanceTable />
                </div>
            </main>
        </div>
    );
}