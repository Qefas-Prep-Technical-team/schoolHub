'use client';

import React from 'react';
import PageHeader from './PageHeader';
import TabNavigation from './TabNavigation';
import ClassStats from './ClassStats';
import UpcomingActivities from './UpcomingActivities';
import TopPerformingStudents from './TopPerformingStudents';
import AttendanceSummary from './AttendanceSummary';
import RecentSubmissions from './RecentSubmissions';
import QuickActions from './QuickActions';



interface ClassOverviewTabProps {
  stats: Record<string, any>;
  upcomingActivities: Record<string, any>[];
  topStudents: Record<string, any>[];
  attendance: any;
  recentSubmissions: Record<string, any>[];
}

export default function ClassOverviewTab({ 
  stats, 
  upcomingActivities, 
  topStudents, 
  attendance, 
  recentSubmissions 
}: ClassOverviewTabProps) {


  const handleGradeSubmission = (submissionId: string) => {
    console.log('Grade submission:', submissionId);
    // Open grading interface
  };

  const handleViewAll = (section: string) => {
    console.log(`View all ${section}`);
    // Navigate to appropriate tab
  };

  return (
  
     <>
          {/* Quick Stats Bar */}
          <ClassStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Left Column */}
            <div className="space-y-6">
              <UpcomingActivities 
                activities={upcomingActivities}
                onViewAll={() => handleViewAll('activities')}
              />
              
              <TopPerformingStudents 
                students={topStudents}
                onViewAll={() => handleViewAll('students')}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <AttendanceSummary 
                data={attendance}
                onViewAll={() => handleViewAll('attendance')}
              />
              
              <RecentSubmissions 
                submissions={recentSubmissions}
                onGradeSubmission={handleGradeSubmission}
                onViewAll={() => handleViewAll('submissions')}
              />
            </div>

          </div>

          {/* Quick Actions */}
          <QuickActions 
            onAddAssignment={() => console.log('Add assignment')}
            onAddQuiz={() => console.log('Add quiz')}
            onTakeAttendance={() => console.log('Take attendance')}
            onSendMessage={() => console.log('Send message')}
          />
       </>
  );
}