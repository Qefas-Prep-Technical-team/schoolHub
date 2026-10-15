'use client';

import { useState } from 'react';
import StudentProfile from './components/StudentProfile';
import AttendanceAlert from './components/AttendanceAlert';
import AttendanceChart from './components/AttendanceChart';
import MonthlyTrend from './components/MonthlyTrend';
import RecentActivity from './components/RecentActivity';
import QuickContact from './components/QuickContact';
import DetailsModal from './components/DetailsModal';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isYesterday } from 'date-fns';
import { useRouter } from 'next/navigation';

import Breadcrumbs from '../performance/components/Breadcrumbs';

export default function ParentAttendancePage() {
    const [trendPeriod, setTrendPeriod] = useState('This Semester');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const { selectedChildId } = useParentStore();
    const { data: dashboard, isLoading: loadingDash } = useParentDashboard(selectedChildId);
    const { data: child, isLoading: loadingChild } = useChildDetails(selectedChildId);

    const router = useRouter();

    const isLoading = loadingDash || loadingChild;

    if (isLoading) {
        return (
            <div className="flex flex-col flex-1 gap-6 p-2 sm:p-4">
                <Skeleton className="h-28 w-full rounded-3xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full rounded-3xl" />
                        <Skeleton className="h-64 w-full rounded-3xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-80 w-full rounded-3xl" />
                        <Skeleton className="h-40 w-full rounded-3xl" />
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

    const attendances = (child as any)?.attendances || [];
    const presentDays = attendances.filter((a: any) => a.status.toLowerCase() === 'present').length;
    const lateDays = attendances.filter((a: any) => a.status.toLowerCase() === 'late').length;
    const absentDays = attendances.filter((a: any) => a.status.toLowerCase() === 'absent').length;
    const totalRecordedDays = presentDays + lateDays + absentDays;

    // Real-time calculation based on recorded attendance items (present + late / total)
    // If no records at all, fallback to dashboard rate or 100
    const calculatedRate = totalRecordedDays > 0
        ? Math.round(((presentDays + lateDays) / totalRecordedDays) * 100)
        : (dashboard?.stats?.attendanceRate ?? 100);

    const attendanceRate = calculatedRate;
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
    let breakdown = dashboard?.stats?.attendanceBreakdown || [];
    
    // Build breakdown from real attendance records if API doesn't provide stats breakdown
    if (breakdown.length === 0 && attendances.length > 0) {
        // Reverse so the chronological order flows left-to-right on the chart
        breakdown = [...attendances].reverse().map((a: any) => ({
            date: a.date,
            present: a.status.toLowerCase() === 'present' || a.status.toLowerCase() === 'late',
        }));
    } else if (breakdown.length === 0) {
        // Ultimate fallback if absolutely no data exists
        breakdown = [
            { date: new Date().toISOString(), present: true },
        ];
    }
    
    let sliceCount = 5;
    let trendText = "Average attendance improved by 2% compared to last semester";
    
    if (trendPeriod === 'Last Month') {
        sliceCount = 3;
        trendText = "Attendance remained stable over the last month";
    } else if (trendPeriod === 'Last 3 Months') {
        sliceCount = 7;
        trendText = "Average attendance improved by 1.5% over the last quarter";
    }

    const monthlyData = breakdown.slice(-sliceCount).map((b, i) => ({
        month: format(new Date(b.date), 'MMM dd'),
        attendance: b.present ? 100 : 0,
        isCurrent: i === Math.min(breakdown.length, sliceCount) - 1
    }));
    
    const handleViewDetails = () => {
        setIsDetailsModalOpen(true);
    };

    const handleReportAbsence = () => {
        setIsDetailsModalOpen(true);
    };

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 space-y-8">
            <Breadcrumbs 
                items={[
                    { label: 'Parent Hub', href: '/dashboard/parent' },
                    { label: 'Attendance', href: '/dashboard/parent/attendance' },
                ]}
            />

            {/* Student Profile & Header */}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
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
                    <MonthlyTrend 
                        data={monthlyData} 
                        period={trendPeriod}
                        onPeriodChange={setTrendPeriod}
                        trendText={trendText}
                    />
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 sm:gap-8">
                    {/* Recent Activity */}
                    <RecentActivity
                        activities={activities}
                        viewAllHref="/dashboard/parent/attendance/monthly"
                    />

                    {/* Quick Contact */}
                    <QuickContact
                        description={`Quickly view breakdown or notify the school if ${studentData.name} will be absent.`}
                        onButtonClick={handleReportAbsence}
                    />
                </div>
            </div>

            {/* Details Modal */}
            <DetailsModal 
                isOpen={isDetailsModalOpen} 
                onClose={() => setIsDetailsModalOpen(false)} 
                attendances={attendances} 
            />
        </main>
    );
}
