'use client';

import { useState } from 'react';
import TopNavbar from './TopNavbar';
import StatsCards from './StatsCards';
import AssignmentsExams from './AssignmentsExams';
import PerformanceAnalytics from './PerformanceAnalytics';
import AttendanceWidget from './AttendanceWidget';
import MessagesAnnouncements from './MessagesAnnouncements';

export default function DashboardPage() {
  const [stats] = useState({
    totalClasses: 5,
    totalStudents: 124,
    upcomingLessons: 3,
  });

  const assignments = [
    {
      id: '1',
      title: 'Biology Midterm Papers',
      description: '12 Submissions Pending Grading',
      icon: 'hourglass_top',
      iconColor: 'text-orange-500',
      status: 'pending',
      action: 'Grade Now',
      dueDate: null,
    },
    {
      id: '2',
      title: 'Chemistry Lab Report',
      description: 'Deadline: Tomorrow, 5:00 PM',
      icon: 'event_upcoming',
      iconColor: 'text-red-500',
      status: 'due_soon',
      action: null,
      dueDate: 'tomorrow',
    },
    {
      id: '3',
      title: 'Physics Homework 5',
      description: '2 new submissions',
      icon: 'history',
      iconColor: 'text-green-500',
      status: 'recent',
      action: null,
      dueDate: null,
    },
  ];

  const messages = [
    {
      id: '1',
      title: 'Parent-Teacher Conferences',
      description: 'School-wide announcement: Schedules are now available for booking...',
      sender: 'System',
      isUnread: true,
      isAnnouncement: true,
    },
    {
      id: '2',
      title: 'From: John Doe',
      description: 'Question about last week\'s homework...',
      sender: 'John Doe',
      isUnread: true,
      isAnnouncement: false,
    },
    {
      id: '3',
      title: 'From: Jane Smith',
      description: 'Absence note for today\'s class.',
      sender: 'Jane Smith',
      isUnread: false,
      isAnnouncement: false,
    },
  ];

  const attendanceData = {
    overallPercentage: 90,
    classes: [
      { name: 'Biology 101', absences: 5, color: 'text-red-600' },
      { name: 'Chemistry 202', absences: 1, color: 'text-gray-500' },
      { name: 'Physics 101', absences: 2, color: 'text-yellow-600' },
    ],
  };

  const handleCreateNew = () => {
    console.log('Create new item');
    // Open create modal or navigate
  };

  const handleViewAll = (section: string) => {
    console.log(`View all ${section}`);
    // Navigate to respective page
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <TopNavbar onCreateNew={handleCreateNew} />
      
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Welcome back, Ms. Vance!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here&apos;s a snapshot of your day.
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Assignments & Exams */}
              <AssignmentsExams   
                assignments={assignments} 
                onViewAll={() => handleViewAll('assignments')}
              />

              {/* Performance Analytics */}
              <PerformanceAnalytics />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Today's Attendance */}
              <AttendanceWidget data={attendanceData} />

              {/* Messages & Announcements */}
              <MessagesAnnouncements 
                messages={messages} 
                onViewAll={() => handleViewAll('messages')}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction 
              icon="assignment"
              label="Create Assignment"
              onClick={() => handleCreateNew()}
              color="bg-blue-500"
            />
            <QuickAction 
              icon="quiz"
              label="Schedule Exam"
              onClick={() => handleCreateNew()}
              color="bg-green-500"
            />
            <QuickAction 
              icon="checklist"
              label="Take Attendance"
              onClick={() => handleCreateNew()}
              color="bg-purple-500"
            />
            <QuickAction 
              icon="mail"
              label="Send Message"
              onClick={() => handleCreateNew()}
              color="bg-orange-500"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

interface QuickActionProps {
  icon: string;
  label: string;
  onClick: () => void;
  color: string;
}

function QuickAction({ icon, label, onClick, color }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center mb-3`}>
        <span className="material-symbols-outlined text-white text-2xl">
          {icon}
        </span>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
        {label}
      </span>
    </button>
  );
}