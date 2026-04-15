/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { FC, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageHeader from './PageHeader';
import { TabPanel } from 'react-tabs';
import TabNavigation from './TabNavigation';
import ClassOverviewTab from './ClassOverviewTab';
import StudentsPage from './student/page';
import AssignmentsPage from './assignments/page';
import ExamsPage from './exams&quizzes/page';
import GradesPage from './grades/page';
import { teacherService } from '@/lib/api/services/teacherService';
import { Loader2 } from 'lucide-react';

const ClassDetails: FC = () => {
    const params = useParams();
    const classId = params.classId as string;
    const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'grades'>('overview');

    const { data, isLoading, error } = useQuery({
        queryKey: ['class-detail', classId],
        queryFn: () => teacherService.getClassDetail(classId),
        enabled: !!classId,
    });
    const handleAddAnnouncement = () => {
    console.log('Add new announcement');
    // Open announcement modal
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Loading class details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-2xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load class details</h2>
        <p className="text-gray-500 max-w-md">There was an issue retrieving the information for this class. Please try again later.</p>
      </div>
    );
  }

  const { classInfo, stats, upcomingActivities, topStudents, attendance, recentSubmissions } = data;

  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
       <div className="p-4 md:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <PageHeader 
                  classData={classInfo}
                  onAddAnnouncement={handleAddAnnouncement}
                />
      
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab as any}>
        <TabPanel>
        < ClassOverviewTab 
          stats={stats}
          upcomingActivities={upcomingActivities}
          topStudents={topStudents}
          attendance={attendance}
          recentSubmissions={recentSubmissions}
        />
        </TabPanel>
      
        <TabPanel>
         <StudentsPage />
        </TabPanel>
      
        <TabPanel>
         <AssignmentsPage/>
        </TabPanel>
      
        <TabPanel>
         <ExamsPage/>
        </TabPanel>
        <TabPanel>
          <GradesPage/>
        </TabPanel>
      </TabNavigation>
    </div>
      </div>
    </div>
  );
};

export default ClassDetails;