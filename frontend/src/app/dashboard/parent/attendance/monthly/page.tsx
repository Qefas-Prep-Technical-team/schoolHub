'use client';

import { useState, useCallback, useMemo } from 'react';
import { generateCalendarDays, getNextMonth, getPreviousMonth } from './components/calendar';
import { CalendarDay } from './components/types';
import MonthlySidebar from './components/MonthlySidebar';
import MonthlyHeader from './components/MonthlyHeader';
import AttendanceExport from './components/AttendanceExport';
import StatsOverview from './components/StatsOverview';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import CalendarLegend from './components/CalendarLegend';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useParentChildren, useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { generatePDF } from '@/utils/pdfGenerator';
import { assertSchoolPayingPlan } from '@/utils/subscriptionPlanCheck';

export default function MonthlyAttendancePage() {
    const [currentMonth, setCurrentMonth] = useState(new Date(2023, 9, 1)); // October 2023
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const { selectedChildId } = useParentStore();
    const { data: children = [] } = useParentChildren();

    const effectiveChildId = useMemo(() => {
        if (selectedChildId && children.some(c => c.id === selectedChildId)) {
            return selectedChildId;
        }
        return children[0]?.id || null;
    }, [selectedChildId, children]);

    const currentChild = useMemo(() => {
        return children.find(c => c.id === effectiveChildId) || children[0];
    }, [children, effectiveChildId]);

    const { data: childDetails } = useChildDetails(effectiveChildId);

    const childName = childDetails?.name || currentChild?.name || 'Student';
    const studentClass = childDetails?.classes?.[0]?.class?.name || currentChild?.currentClass?.name || 'Class Cohort';
    const studentCode = childDetails?.studentCode || currentChild?.studentCode || 'N/A';
    const school = (childDetails?.school || currentChild?.school) as Record<string, unknown> | undefined;

    const calendarDays = generateCalendarDays(currentMonth);

    const stats = {
        attendanceRate: 95,
        daysPresent: 20,
        daysAbsent: 1,
        timesLate: 2,
    };

    const handlePreviousMonth = useCallback(() => {
        setCurrentMonth(getPreviousMonth(currentMonth));
    }, [currentMonth]);

    const handleNextMonth = useCallback(() => {
        setCurrentMonth(getNextMonth(currentMonth));
    }, [currentMonth]);

    const handleToday = useCallback(() => {
        setCurrentMonth(new Date());
    }, []);

    const handleExport = useCallback(async () => {
        if (!assertSchoolPayingPlan(school)) {
            return;
        }

        const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long' });
        const year = currentMonth.getFullYear();

        const tableHeaders = [
            ['#', 'Date', 'Day of Week', 'Status', 'Arrival Check-in', 'Remarks']
        ];

        const tableData = calendarDays
            .filter(day => day.isCurrentMonth)
            .map((day, idx) => {
                const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const attStatus = day.attendance?.status || (day.isWeekend ? 'weekend' : 'present');
                const status = attStatus.toUpperCase();
                const checkIn = attStatus === 'present' ? '07:45 AM' : attStatus === 'late' ? '08:25 AM' : '—';
                const remarks = attStatus === 'present'
                    ? 'On Time Attendance'
                    : attStatus === 'late'
                    ? 'Late Arrival Registered'
                    : attStatus === 'absent'
                    ? 'Excused Absence'
                    : attStatus === 'weekend'
                    ? 'Weekend'
                    : 'Regular School Day';

                return [(idx + 1).toString(), dateStr, dayName, status, checkIn, remarks];
            });

        await generatePDF({
            title: `Monthly Attendance Register - ${monthLabel} ${year}`,
            filename: `${childName.replace(/\s+/g, '_')}_Attendance_${monthLabel}_${year}.pdf`,
            schoolProfile: school,
            metaData: [
                { label: 'Student Name', value: childName },
                { label: 'Student ID', value: studentCode },
                { label: 'Class / Cohort', value: studentClass },
                { label: 'Evaluation Period', value: `${monthLabel} ${year}` },
                { label: 'Overall Attendance Rate', value: `${stats.attendanceRate}%` },
                { label: 'Days Present', value: `${stats.daysPresent} Days` },
                { label: 'Days Absent', value: `${stats.daysAbsent} Days` },
                { label: 'Times Tardy / Late', value: `${stats.timesLate} Times` },
            ],
            tableHeaders,
            tableData,
            orientation: 'portrait',
        });
    }, [school, currentMonth, calendarDays, childName, studentCode, studentClass, stats]);

    const handleRequestLeave = useCallback(() => {
        // Open leave request modal
    }, []);

    const handleDayClick = useCallback((day: CalendarDay) => {
        setSelectedDate(day.date);
    }, []);

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            <MonthlySidebar
                isMobileOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
                {/* Mobile Header */}
                <MonthlyHeader onMenuClick={() => setIsSidebarOpen(true)} />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <div className="max-w-6xl mx-auto flex flex-col gap-6">
                        {/* Page Header with Actions */}
                        <AttendanceExport
                            onExport={handleExport}
                            onRequestLeave={handleRequestLeave}
                            childName={childName}
                            studentClass={studentClass}
                        />

                        {/* Stats Overview */}
                        <StatsOverview stats={stats} />

                        {/* Calendar Section */}
                        <CalendarControls
                            currentMonth={currentMonth}
                            onPrevious={handlePreviousMonth}
                            onNext={handleNextMonth}
                            onToday={handleToday}
                            showTodayButton
                        />
                        <CalendarGrid
                            days={calendarDays}
                            onDayClick={handleDayClick}
                            selectedDate={selectedDate}
                        />

                        {/* Legend */}
                        <CalendarLegend />

                        {/* Footer */}
                        <div className="mt-12 text-center pb-6">
                            <p className="text-xs text-slate-400 dark:text-slate-600">
                                © 2026 EduConnect System. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
