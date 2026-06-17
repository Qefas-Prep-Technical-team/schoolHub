'use client';

import { useState } from 'react';
import ParentHeader from './components/ParentHeader';
import StudentProfile from './components/StudentProfile';
import AttendanceAlert from './components/AttendanceAlert';
import AttendanceChart from './components/AttendanceChart';
import MonthlyTrend from './components/MonthlyTrend';
import RecentActivity from './components/RecentActivity';
import QuickContact from './components/QuickContact';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isYesterday } from 'date-fns';

export default function ParentAttendancePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { selectedChildId } = useParentStore();
    const { data: dashboard, isLoading: loadingDash } = useParentDashboard(selectedChildId);
    const { data: child, isLoading: loadingChild } = useChildDetails(selectedChildId);

    const isLoading = loadingDash || loadingChild;

    if (isLoading) {
        return (
            <div className="flex flex-col flex-1 gap-6 p-4 md:p-8 lg:p-10">
                <Skeleton className="h-32 w-full rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-96 w-full rounded-xl" />
                        <Skeleton className="h-40 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    const studentData = {
        name: child?.name || 'Student',
        grade: child?.classes?.[0]?.class?.name || 'Unassigned',
        studentId: child?.studentCode || 'N/A',
        imageUrl: child?.profileImage || `https://ui-avatars.com/api/?name=${child?.name}&background=random`,
    };

    const attendanceRate = dashboard?.stats?.attendanceRate ?? 100;
    
    const attendances = child?.attendances || [];
    const activities = attendances.slice(0, 5).map((a: any) => {
        let dateStr = '';
        const d = new Date(a.date);
        if (isToday(d)) dateStr = 'Today, ' + format(d, 'MMM dd');
        else if (isYesterday(d)) dateStr = 'Yesterday, ' + format(d, 'MMM dd');
        else dateStr = format(d, 'EEE, MMM dd');

        return {
            id: a.id,
            date: dateStr,
            status: a.status.toLowerCase() as 'present' | 'late' | 'absent',
            description: a.status.charAt(0).toUpperCase() + a.status.slice(1).toLowerCase(),
            time: 'Recorded',
        };
    });

    const breakdown = dashboard?.stats?.attendanceBreakdown || [];
    const monthlyData = breakdown.slice(-5).map((b, i) => ({
        month: format(new Date(b.date), 'MMM dd'),
        attendance: b.present ? 100 : 0,
        isCurrent: i === Math.min(breakdown.length, 5) - 1
    }));
    
    const presentDays = attendances.filter((a: any) => a.status.toLowerCase() === 'present').length;
    const lateDays = attendances.filter((a: any) => a.status.toLowerCase() === 'late').length;
    const absentDays = attendances.filter((a: any) => a.status.toLowerCase() === 'absent').length;

    const handleViewDetails = () => {
        // console.log('View detailed breakdown');
        // Navigate to detailed view
    };

    const handleReportAbsence = () => {
        // console.log('Report absence');
        // Open absence reporting modal
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar */}


            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
                {/* Mobile Header */}
                <ParentHeader onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Page Content */}
                <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 lg:p-10 flex flex-col gap-8">
                    {/* Student Profile */}
                    <StudentProfile
                        student={studentData}
                        lastUpdated={`Today, ${format(new Date(), 'h:mm a')}`}
                    />

                    {/* Attendance Alert */}
                    <AttendanceAlert
                        attendanceRate={attendanceRate}
                        message={`${studentData.name} has maintained a ${attendanceRate}% attendance record this semester.`}
                    />

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Attendance Chart */}
                            <AttendanceChart
                                attendance={attendanceRate}
                                stats={{
                                    presentDays: presentDays,
                                    lateDays: lateDays,
                                    absentDays: absentDays,
                                }}
                                status={attendanceRate >= 90 ? "excellent" : attendanceRate >= 75 ? "good" : "poor"}
                                onViewDetails={handleViewDetails}
                            />

                            {/* Monthly Trend */}
                            <MonthlyTrend data={monthlyData} />
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-6">
                            {/* Recent Activity */}
                            <RecentActivity
                                activities={activities}
                                viewAllHref="/dashboard/parent/attendance/monthly"
                            />

                            {/* Quick Contact */}
                            <QuickContact
                                onButtonClick={handleReportAbsence}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
