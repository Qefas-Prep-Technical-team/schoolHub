'use client';

import React from 'react';
import ClassStats from './ClassStats';
import UpcomingActivities from './UpcomingActivities';
import TopPerformingStudents from './TopPerformingStudents';
import AttendanceSummary from './AttendanceSummary';
import RecentSubmissions from './RecentSubmissions';
import QuickActions from './QuickActions';



interface ClassOverviewTabProps {
  stats: {
    averageGrade: number;
    assignmentsCompleted: number;
    quizzesCompleted: number;
    upcomingDeadlines: number;
    participationRate: number;
  };
  upcomingActivities: {
    id: string;
    title: string;
    type: 'quiz' | 'assignment' | 'exam' | 'project';
    date: string;
    description: string;
    status: 'upcoming' | 'overdue' | 'completed';
    icon: string;
    color: 'yellow' | 'orange' | 'red' | 'blue' | 'green';
  }[];
  topStudents: {
    id: string;
    name: string;
    rank: number;
    score: number;
    avatar: string;
    improvement: string;
  }[];
  attendance: {
    overallPercentage: number;
    present: number;
    absent: number;
    late: number;
    trend: string;
  };
  recentSubmissions: {
    id: string;
    studentName: string;
    avatar: string;
    assignment: string;
    submittedDate: string;
    status: 'pending' | 'graded' | 'late';
    grade?: number;
  }[];
}

export default function ClassOverviewTab({ 
  stats, 
  upcomingActivities, 
  topStudents, 
  attendance, 
  recentSubmissions 
}: ClassOverviewTabProps) {


  const handleGradeSubmission = (submissionId: string) => {
    // console.log('Grade submission:', submissionId);
    // Open grading interface
  };

  const handleViewAll = (section: string) => {
    // console.log(`View all ${section}`);
    // Navigate to appropriate tab
  };

  return (
  
     <>
      <div className="space-y-8 mt-4">
        {/* Quick Stats Bar */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Session Analytics</h3>
            <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-primary/20 animate-pulse">Live Data</span>
          </div>
          <ClassStats stats={stats} />
        </section>

        {/* 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
             <UpcomingActivities 
               activities={upcomingActivities}
               onViewAll={() => handleViewAll('activities')}
             />
            
             <RecentSubmissions 
               submissions={recentSubmissions}
               onGradeSubmission={handleGradeSubmission}
               onViewAll={() => handleViewAll('submissions')}
             />
          </div>

          {/* Sidebar Area (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
             <AttendanceSummary 
               data={attendance}
               onViewAll={() => handleViewAll('attendance')}
             />

             <TopPerformingStudents 
               students={topStudents}
               onViewAll={() => handleViewAll('students')}
             />
          </div>
        </div>

        {/* Quick Actions */}
        <section className="pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
          <QuickActions 
            onAddAssignment={() => console.log('Add assignment')}
            onAddQuiz={() => console.log('Add quiz')}
            onTakeAttendance={() => console.log('Take attendance')}
            onSendMessage={() => console.log('Send message')}
          />
        </section>
      </div>
       </>
  );
}