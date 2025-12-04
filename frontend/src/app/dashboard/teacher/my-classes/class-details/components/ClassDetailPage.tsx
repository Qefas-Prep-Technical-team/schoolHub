'use client';

import { useState } from 'react';
import Breadcrumbs from '@/components/classes/detail/Breadcrumbs';
import ClassHeader from '@/components/classes/detail/ClassHeader';
import TabNavigation from '@/components/classes/detail/TabNavigation';
import OverviewSection from '@/components/classes/detail/OverviewSection';
import ActivitySection from '@/components/classes/detail/ActivitySection';

export default function ClassDetailPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'exams' | 'timetable' | 'attendance' | 'grades'>('overview');

  const classData = {
    id: 'jss-2a',
    name: 'JSS 2A',
    subject: 'Mathematics',
    teacher: 'Mrs. Anya',
    studentCount: 32,
    academicYear: '2023-2024',
    term: 'Term 2',
    room: 'Room 204',
    schedule: 'Mon 10:00 AM, Wed 02:00 PM, Fri 09:00 AM',
  };

  const upcomingDeadlines = [
    { title: 'Algebra Homework 2', dueDate: 'Due Tomorrow', status: 'urgent' },
    { title: 'Geometry Project', dueDate: 'Due in 3 days', status: 'upcoming' },
    { title: 'Chapter 5 Quiz', dueDate: 'Due in 5 days', status: 'upcoming' },
  ];

  const announcements = [
    {
      content: 'Reminder: Parent-teacher meetings are next week. Please sign up for a slot.',
      date: 'Posted 2 days ago'
    },
    {
      content: 'Mid-term exams will be held from November 15-20.',
      date: 'Posted 5 days ago'
    },
  ];

  const performanceMetrics = {
    classAverage: 85,
    attendanceRate: 94,
    assignmentsSubmitted: 28,
    pendingGrading: 5,
  };

  const recentActivities = [
    {
      studentName: 'Adewale Johnson',
      activity: 'Submitted Algebra Homework 2',
      date: 'Oct 26, 2023',
      status: 'on_time',
      grade: null,
    },
    {
      studentName: 'Bisi Adekunle',
      activity: 'Submitted Algebra Homework 2',
      date: 'Oct 27, 2023',
      status: 'late',
      grade: null,
    },
    {
      studentName: 'Chidinma Okoro',
      activity: 'Viewed Geometry Project Brief',
      date: 'Oct 26, 2023',
      status: 'viewed',
      grade: null,
    },
    {
      studentName: 'David Musa',
      activity: 'Submitted Chapter 4 Quiz',
      date: 'Oct 25, 2023',
      status: 'graded',
      grade: 92,
    },
    {
      studentName: 'Emeka Nwachukwu',
      activity: 'Asked question about problem set',
      date: 'Oct 24, 2023',
      status: 'question',
      grade: null,
    },
  ];

  const handleAddAssignment = () => {
    console.log('Add assignment for class:', classData.id);
    // Open assignment creation modal
  };

  const handleAddExam = () => {
    console.log('Add exam for class:', classData.id);
    // Open exam creation modal
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-5 md:py-10">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs className="mb-4" />

          {/* Class Header */}
          <ClassHeader
            classData={classData}
            onAddAssignment={handleAddAssignment}
            onAddExam={handleAddExam}
          />

          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Main Content */}
          <div className="mt-8">
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-8">
                <OverviewSection
                  upcomingDeadlines={upcomingDeadlines}
                  announcements={announcements}
                  performanceMetrics={performanceMetrics}
                  classData={classData}
                />

                <ActivitySection activities={recentActivities} />
              </div>
            )}

            {/* Other tabs would be rendered here */}
            {activeTab !== 'overview' && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-lg font-medium mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                </div>
                <p className="text-sm">
                  This section is under development
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}