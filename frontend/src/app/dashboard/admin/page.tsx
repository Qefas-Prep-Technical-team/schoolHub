'use client';

import { useState } from 'react';
import DashboardLayout from './components/dashboard/DashboardLayout';
import AcademicChart from './components/dashboard/AcademicChart';
import AttendanceChart from './components/dashboard/AttendanceChart';
import ExamStatus from './components/dashboard/ExamStatus';
import StaffInsights from './components/dashboard/StaffInsights';
import DateControls from './components/dashboard/DateControls';
import AlertsPanel from './components/dashboard/AlertsPanel';
import RecentActivity from './components/dashboard/RecentActivity';
import QuickActions from './components/dashboard/QuickActions';
import MetricsGrid from './components/dashboard/MetricsGrid';

export default function AdminDashboard() {
  const [session, setSession] = useState('2023/2024');
  const [term, setTerm] = useState('Second Term');

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden">
      {/* <AdminHeader /> */}
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Page Header & Controls */}
        <DateControls
        //   session={session}
        //   term={term}
          onSessionChange={setSession}
          onTermChange={setTerm}
        />

        {/* Key Metrics Grid */}
        <MetricsGrid  />

        {/* Dashboard Layout */}
        <DashboardLayout
          leftColumn={
            <>
              {/* Performance & Attendance Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AcademicChart />
                <AttendanceChart />
              </div>

              {/* Exam Status & Staff Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExamStatus />
                <StaffInsights
                 />
              </div>
            </>
          }
          rightColumn={
            <>
              <QuickActions />
              <AlertsPanel />
              <RecentActivity />
            </>
          }
        />
      </main>
    </div>
  );
}