'use client';

import { useState } from 'react';
import { ParentSidebar } from '../components/app-sidebar';
import ParentHeader from './components/ParentHeader';
import StudentProfile from './components/StudentProfile';
import AttendanceAlert from './components/AttendanceAlert';
import AttendanceChart from './components/AttendanceChart';
import MonthlyTrend from './components/MonthlyTrend';
import RecentActivity from './components/RecentActivity';
import QuickContact from './components/QuickContact';

export default function ParentAttendancePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const student = {
        name: 'Alex Johnson',
        grade: 'Grade 10-B',
        studentId: '123456',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVQd10aNGazGlrieVRlGmes4vdPNWe6P7TDC4sQVKQduE-IGhHstIiFtePSTktPy9JAL0c9QU6ZfvalNO7Pc2kWwGAyQdiu3LUPUkaSNR1nR3Ss_QXzZfO7mzucnTuqrxtHNcn38w4Ih6212qp9gWgjCEXJGKK0kmmOV4zSC44CbzrwhlracWZkIK-cXV4NzodcP8omj61o78ewSWsgzFuGpqe5qUhKhsVNSVbwGQZFPfY1EwUkINtZWLbh8zmQqZ80rZ71sIgTaE',
    };

    const monthlyData = [
        { month: 'Aug', attendance: 98, isCurrent: false },
        { month: 'Sep', attendance: 100, isCurrent: false },
        { month: 'Oct', attendance: 94, isCurrent: false },
        { month: 'Nov', attendance: 96, isCurrent: true },
        { month: 'Dec', attendance: 0, isCurrent: false },
    ];

    const activities = [
        {
            id: '1',
            date: 'Today, Nov 14',
            status: 'present' as const,
            description: 'Present',
            time: 'On Time',
        },
        {
            id: '2',
            date: 'Wed, Nov 13',
            status: 'present' as const,
            description: 'Present',
            time: 'On Time',
        },
        {
            id: '3',
            date: 'Tue, Nov 12',
            status: 'late' as const,
            description: 'Late Arrival',
            lateMinutes: 15,
        },
        {
            id: '4',
            date: 'Mon, Nov 11',
            status: 'present' as const,
            description: 'Present',
            time: 'On Time',
        },
    ];

    const handleViewDetails = () => {
        console.log('View detailed breakdown');
        // Navigate to detailed view
    };

    const handleReportAbsence = () => {
        console.log('Report absence');
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
                        student={student}
                        lastUpdated="Today, 9:00 AM"
                    />

                    {/* Attendance Alert */}
                    <AttendanceAlert
                        attendanceRate={96}
                        message="Alex has maintained a {rate} attendance record this semester. Keep it up!"
                    />

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Attendance Chart */}
                            <AttendanceChart
                                attendance={96}
                                stats={{
                                    presentDays: 48,
                                    lateDays: 2,
                                    absentDays: 0,
                                }}
                                status="excellent"
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