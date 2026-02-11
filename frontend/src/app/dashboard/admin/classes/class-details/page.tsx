'use client';

import React, { useState } from 'react';
import { Calendar, UserCog } from 'lucide-react';
import CustomTabs from './components/Tabs';
import Overview from './components/Overview';
import TimetablePage from './components/timetable/page';
import ClassStudentsPage from './components/students/page';
import ClassSubjectsPage from './components/subjects/page';
import ClassExamsPage from './components/exams/page';
import ClassAttendancePage from './components/attendance/page';

export default function ClassDetailsPage() {
  // const [activeTab, setActiveTab] = useState('overview');

  // const tabs = [
  //   { id: 'overview', label: 'Overview' },
  //   { id: 'students', label: 'Students' },
  //   { id: 'subjects', label: 'Subjects' },
  //   { id: 'timetable', label: 'Timetable' },
  //   { id: 'exams', label: 'Exams' },
  //   { id: 'attendance', label: 'Attendance' },
  // ];

  const behaviourAlerts = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Late submission of Science homework',
      description: 'Student: Alice Johnson - Reported by: Ms. Davis',
      student: 'Alice Johnson',
      reportedBy: 'Ms. Davis',
    },
    {
      id: '2',
      type: 'danger' as const,
      title: 'Disruptive behaviour during History class',
      description: 'Student: Bob Williams - Reported by: Mr. Smith',
      student: 'Bob Williams',
      reportedBy: 'Mr. Smith',
    },
  ];
   const [activeTab, setActiveTab] = React.useState("tab1");
   
   const upcomingExams = [
     {
       id: '1',
       subject: 'Biology',
       date: '25 Oct 2024',
       type: 'Mid-term',
     },
     {
       id: '2',
       subject: 'Mathematics',
       date: '28 Oct 2024',
       type: 'Quiz',
     },
     {
       id: '3',
       subject: 'Geography',
       date: '02 Nov 2024',
       type: 'Test',
     },
   ];
  const tabs = [
    { id: "tab1", label: "Overview", content: <Overview behaviourAlerts={behaviourAlerts} upcomingExams={upcomingExams}/>},
     { id: 'students', label: 'Students', content: <ClassStudentsPage/>  },
    { id: 'subjects', label: 'Subjects' , content: <ClassSubjectsPage/> },
    { id: 'timetable', label: 'Timetable', content: <TimetablePage/>  },
    { id: 'exams', label: 'Exams' , content: <ClassExamsPage/> },
    { id: 'attendance', label: 'Attendance' , content: <ClassAttendancePage/> },
  ]


  return (
    <div className="relative flex min-h-screen w-full">
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Heading & Button Group */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                Grade 10 - Section A
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                Session: 2024-2025 | Homeroom Teacher: Mr. Smith | Total Students: 35
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                <Calendar size={18} />
                <span className="truncate">Manage Timetable</span>
              </button>
              
              <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90">
                <UserCog size={18} />
                <span className="truncate">Manage Students</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
         <CustomTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />

          {/* Content Grid */}
         
        </div>
      </main>
    </div>
  );
}