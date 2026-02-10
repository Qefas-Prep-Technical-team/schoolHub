'use client';

import { useState, useCallback } from 'react';
import { generateCalendarDays, getNextMonth, getPreviousMonth } from './components/calendar';
import { CalendarDay } from './components/types';
import MonthlySidebar from './components/MonthlySidebar';
import MonthlyHeader from './components/MonthlyHeader';
import AttendanceExport from './components/AttendanceExport';
import StatsOverview from './components/StatsOverview';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import CalendarLegend from './components/CalendarLegend';


export default function MonthlyAttendancePage() {
    const [currentMonth, setCurrentMonth] = useState(new Date(2023, 9, 1)); // October 2023
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

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
        // Simulate export
        console.log('Exporting attendance report...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Attendance report exported successfully!');
    }, []);

    const handleRequestLeave = useCallback(() => {
        console.log('Requesting leave...');
        // Open leave request modal
    }, []);

    const handleDayClick = useCallback((day: CalendarDay) => {
        setSelectedDate(day.date);
        console.log('Selected day:', day);
        // Open day details modal
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
                            childName="Alex Johnson"
                        />

                        {/* Stats Overview */}
                        <StatsOverview stats={stats} />

                        {/* Calendar Section */}
                        <CalendarGrid
                            days={calendarDays}
                            onDayClick={handleDayClick}
                            selectedDate={selectedDate}
                        >
                            <CalendarControls
                                currentMonth={currentMonth}
                                onPrevious={handlePreviousMonth}
                                onNext={handleNextMonth}
                                onToday={handleToday}
                                showTodayButton
                            />
                        </CalendarGrid>

                        {/* Legend */}
                        <CalendarLegend />

                        {/* Footer */}
                        <div className="mt-12 text-center pb-6">
                            <p className="text-xs text-slate-400 dark:text-slate-600">
                                © 2023 EduConnect System. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}