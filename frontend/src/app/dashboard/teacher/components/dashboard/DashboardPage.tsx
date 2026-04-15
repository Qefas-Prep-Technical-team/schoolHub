/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import StatsCards from './StatsCards';
import AssignmentsExams from './AssignmentsExams';
import PerformanceAnalytics from './PerformanceAnalytics';
import StudentPerformanceWidget from './StudentPerformanceWidget';
import MessagesAnnouncements from './MessagesAnnouncements';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    upcomingLessons: 0,
    averagePerformance: 0,
    attendanceRate: 0,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    topStudents: [],
    distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
  });
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const { selectedSchoolId, schools, setSchools } = useDashboardStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Load stats for current selection
        const dashboardData = await teacherService.getDashboardStats(selectedSchoolId || undefined);
        setStats(dashboardData.stats);
        setPerformanceMetrics(dashboardData.performanceMetrics);
        setRecentExams(dashboardData.recentExams);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [selectedSchoolId]);


  const dashboardAssignments = recentExams.map(exam => ({
    id: exam.id,
    title: exam.title,
    description: `${exam.subject} - ${exam.className}`,
    icon: 'assignment',
    iconColor: 'text-blue-500',
    status: exam.status === 'PUBLISHED' ? 'recent' : 'pending',
    action: exam.status === 'DRAFT' ? 'Publish' : null,
    dueDate: exam.date,
  }));

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

  const handleCreateNew = () => {
    console.log('Create new item');
    // Open create modal or navigate
  };

  const handleViewAll = (section: string) => {
    console.log(`View all ${section}`);
    // Navigate to respective page
  };

  if (loading && schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Welcome back, Teacher!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {selectedSchoolId 
                  ? `Showing data for ${schools.find(s => s.id === selectedSchoolId)?.name}` 
                  : "Showing overview across all your connected schools."}
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-primary font-bold animate-pulse text-xs bg-primary/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Syncing School Data...
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Assignments & Exams */}
              <AssignmentsExams   
                assignments={dashboardAssignments as any} 
                onViewAll={() => handleViewAll('assignments')}
              />

              {/* Performance Analytics */}
              <PerformanceAnalytics />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Student Performance (Replaced Attendance) */}
              <StudentPerformanceWidget performanceMetrics={performanceMetrics} />

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