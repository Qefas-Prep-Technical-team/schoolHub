"use client"
import React, { FC, useState } from 'react';
import PageHeader from './PageHeader';
import { TabPanel } from 'react-tabs';
import TabNavigation from './TabNavigation';
import ClassOverviewTab from './ClassOverviewTab';
import StudentsPage from './student/page';
import AssignmentsPage from './assignments/page';
import ExamsPage from './exams&quizzes/page';
import GradesPage from './grades/page';

const ClassDetails: FC = () => {
      const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'grades'>('overview');
       const classData = {
    name: 'Grade 10 - Biology - BIO101',
    subject: 'Biology',
    subjectCode: 'BIO101',
    level: 'Grade 10',
    teacher: 'Mr. Harrison',
    studentCount: 28,
    academicYear: '2024-2025',
    term: 'Term 2',
    room: 'Lab 3',
    schedule: 'Mon/Wed/Fri 10:00 AM',
  };
    const handleAddAnnouncement = () => {
    console.log('Add new announcement');
    // Open announcement modal
  };


  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
       <div className="p-4 md:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <PageHeader 
                  classData={classData}
                  onAddAnnouncement={handleAddAnnouncement}
                />
      
                {/* <TabNavigation 
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                /> */}
      
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab}>
        <TabPanel>
        < ClassOverviewTab/>
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