'use client';

import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import AttendanceHeader from './components/AttendanceHeader';
import DateFilters from './components/DateFilters';
import KPICards from './components/KPICards';
import AttendanceChart from './components/AttendanceChart';
import LowAttendanceList from './components/LowAttendanceList';
import AbsentStaffList from './components/AbsentStaffList';

export default function AttendancePage() {
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden">
            <AttendanceHeader />

            <main className="flex-1 flex justify-center py-8 px-4 sm:px-8 lg:px-12 xl:px-40">
                <div className="w-full max-w-[1200px] flex flex-col gap-6">
                    {/* Page Heading & Actions */}
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-text-primary-light dark:text-text-primary-dark text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                                Attendance Overview
                            </h1>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal">
                                Daily snapshot of school-wide attendance health & trends
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="hidden sm:flex items-center justify-center rounded-xl h-10 px-4 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark text-sm font-bold hover:bg-background-light dark:hover:bg-border-dark transition-colors"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                View History
                            </button>

                            <button className="flex items-center justify-center rounded-xl h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-blue-600 transition-colors">
                                <Download className="mr-2 h-4 w-4" />
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {/* Date Filters */}
                    <DateFilters />

                    {/* KPI Cards */}
                    <KPICards />

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <AttendanceChart />

                        <div className="flex flex-col gap-6">
                            <LowAttendanceList />
                            <AbsentStaffList />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}