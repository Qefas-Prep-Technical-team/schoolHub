/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import PageHeader from './PageHeader';
import TabNavigation from './TabNavigation';
import ClassStats from './ClassStats';
import UpcomingActivities from './UpcomingActivities';
import TopPerformingStudents from './TopPerformingStudents';
import AttendanceSummary from './AttendanceSummary';
import RecentSubmissions from './RecentSubmissions';
import QuickActions from './QuickActions';
import { TabPanel } from 'react-tabs';


export default function ClassOverviewTab() {


 
  const upcomingActivities = [
    {
      id: '1',
      title: 'Quiz 3 - Photosynthesis',
      type: 'quiz',
      date: 'Oct 28, 2024',
      description: 'Upcoming Quiz',
      status: 'upcoming' as const,
      icon: 'quiz',
      color: 'yellow',
    },
    {
      id: '2',
      title: 'Assignment: Lab Report',
      type: 'assignment',
      date: 'Nov 02, 2024',
      description: 'Assignment Deadline',
      status: 'upcoming' as const,
      icon: 'assignment',
      color: 'orange',
    },
    {
      id: '3',
      title: 'Midterm Exam',
      type: 'exam',
      date: 'Nov 15, 2024',
      description: 'Next Exam',
      status: 'upcoming' as const,
      icon: 'description',
      color: 'red',
    },
  ];

  const attendanceData = {
    overallPercentage: 92,
    present: 26,
    absent: 2,
    late: 3,
    trend: '+2% from last week',
  };

  const topStudents = [
    {
      id: '1',
      name: 'Olivia Chen',
      rank: 1,
      score: 98,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2tfKIgpWRNybGWX7lC6RubWSxDAJh_H9mStJwlqdSO0x85w3HxgLUc8howOmtyYwWX35cfHI0OEkn14spcrL4wPkhBxf7DUA6IRVZ5qyVy2fPzQIyxgs-ykaAUqhh8CMEmQEkIqA9q3O23FKt5tREQvNvDmkJSD2QWzvqbtOOgDjNa_2Lk1NdYZgh-64k3xiR-8OugXxSfoH7_SbcmwU9Ppc6h7L5STiiLsonthB6j9vi6IL0rs1TvN6Uc7h3kFrTUz-pKi1nGUw',
      improvement: '+5%',
    },
    {
      id: '2',
      name: 'Benjamin Carter',
      rank: 2,
      score: 95,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4vJz8ZYz_X8WNq4S-sFAHAv5eQJ3ihufdaWkADVXAE24HrzcUUe-5zfP9aiXH462nG3rojsK1fIGqCdnL-72ezagO-xCl_qBjfr-zfzVkBaGKaodniy1KkoCJcjPe5zNWwMD8JwIrI_jeesWPPPl4ebgH8uWhQV5sFJxwq_r_2gNg8FRSLnc4qE98L5y-TRZr9-WA4CHlzo9VtugUFYcG52TSBTRGJ2D1qf8YPiQ4K5O5WWFqX-tEeI9r7jR4SQpML4t2n1NLNjE',
      improvement: '+3%',
    },
    {
      id: '3',
      name: 'Ethan Rodriguez',
      rank: 3,
      score: 94,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzI9yH7JN7xkTBE3jLZhGadUuZQRH9U1k0PW7gIPn20clP9HgZO3sfSkm8fUsJGPj5v1lyjvim-x0uC3QdRXVD8n_9Blh1x1s26dWhVSO1cTvP7-SJmn85j_AHx5OGx66idgxDG_JXAR2J_YPEOhWpn5VtgCAGsS8b_4ORnPrZZWw38vaDR7y8e9MHtJHB7AMJAgCGT-b09h1Piuf3KNJHMhvC4HVSV7lULB_iFRfy-0umOs_9bq2l4Ua0O0zJkI4FMveW18ymgFs',
      improvement: '+7%',
    },
  ];

  const recentSubmissions = [
    {
      id: '1',
      studentName: 'Amelia Grant',
      assignment: 'Quiz 2: Cellular Respiration',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiaMkWOKk_EpI3SQzaUNPHcSQZu6r9VWAX1nkBGtj-Svb3e_5UNF9ufxmo1KjY50GVa3dGAErNdpycUBNxrJwzQqZeI3wQK0ocPZZFMkgVYnKBrJtuNaFuHxJtU-vGduv8Nt0IaQLQgPL8W3QNG6i7TfV9B9gcYvAr8XD75KH2R1cpBWuikpTyPUvwtmERYkSAcOtQDlhT-g8TEL__6ifnbOLQskOSVLj0yzdF3acnNurndz1O_uBEDZwRMpb11jaMu7vozRspYcM',
      submittedDate: 'Oct 26, 2024',
      status: 'pending' as const,
    },
    {
      id: '2',
      studentName: 'Noah Patel',
      assignment: 'Quiz 2: Cellular Respiration',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE3JrgRQBBygVLFPPaWHjhTa3W2W1yVm116uVBXRhtx5_xeTqu3EfQxlXQdpjeSaFZARN52PjZ2AFAyZ7e76LX9sJNzzP8fDxKDM_i9V_YrTB5ag1XgR0e5D3c1ueiHhYe_AH9Jy-VSpv5hlveVpVnqHpw_nffgMQTCJ318NNPxF_KLpwLB_xvS_4AZDuHy2HmZ-fMbQuWkUiydF1vRoowf7QY9rQmycG_u2yaE19rABDhZ1YOGJA42nnMiKRISzwcLHN4YGKML9c',
      submittedDate: 'Oct 26, 2024',
      status: 'pending' as const,
    },
    {
      id: '3',
      studentName: 'Sophia Kim',
      assignment: 'Assignment: Genetics Worksheet',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx7QUWyKJB-1WJWnJ7mRxGwFkTEh0jSwnQL-OdPpqa4p-DMePgRzvSG_B-7y8EldliMXYcHHHNKIiiRFZxwLfcnYxq0EIlosve0WDKem14geESUDLnThKvs5SzKRVGB-LGl5AQr85iamf8O3xyu3TYJDOLPlJ87RSxgr__ntu2nxfxnh3OsgZmrIhHmJ1vNLGd0Rmb9zMZiNSizoKiIKzqZDLMeJjxSLIvduwKohWnBNhrn5lq4ENla7qxOgIs0CuSG2XCStgUIhU',
      submittedDate: 'Oct 25, 2024',
      status: 'pending' as const,
    },
  ];

  const classStats = {
    averageGrade: 85,
    assignmentsCompleted: 3,
    quizzesCompleted: 2,
    upcomingDeadlines: 3,
    participationRate: 89,
  };


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
          <ClassStats stats={classStats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Left Column */}
            <div className="space-y-6">
              <UpcomingActivities 
                activities={upcomingActivities as any}
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
                data={attendanceData}
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