// StudentTabs.jsx
"use client";
import React, { useState } from 'react'
import InfoPage from './InfoPage/InfoPage';
import AcademicPerformancePage from './AcademicPerformance/AcademicPerformancePage';
import AttendancePage from './attendance/AttendancePage';
import BehaviourPage from './Behaviour/BehaviourPage';


const tabNames = ['Overview', "info",'Academics', 'Attendance', 'Behaviour',]

interface StudentStats {
  gpa: number;
  attendance: number;
  incidents: number;
  balance: number;
}

interface BehaviorNote {
  type: 'warning' | 'positive';
  title: string;
  detail: string;
}

interface StudentData {
  name: string;
  stats: StudentStats;
  behaviorNotes: BehaviorNote[];
}

export default function StudentTabs({ student }: { student: StudentData }) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const renderTabContent = (tabIndex: number): React.ReactNode => {
    switch(tabIndex) {
      case 0: // Overview
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                <p className="text-base font-medium leading-normal text-gray-500 dark:text-gray-400">Current GPA</p>
                <p className="tracking-light text-3xl font-bold leading-tight text-text-light dark:text-text-dark">{student.stats.gpa}</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                <p className="text-base font-medium leading-normal text-gray-500 dark:text-gray-400">Attendance</p>
                <p className="tracking-light text-3xl font-bold leading-tight text-text-light dark:text-text-dark">{student.stats.attendance}%</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                <p className="text-base font-medium leading-normal text-gray-500 dark:text-gray-400">Incidents</p>
                <p className="tracking-light text-3xl font-bold leading-tight text-text-light dark:text-text-dark">{student.stats.incidents}</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                <p className="text-base font-medium leading-normal text-gray-500 dark:text-gray-400">Balance</p>
                <p className="tracking-light text-3xl font-bold leading-tight text-text-light dark:text-text-dark">${student.stats.balance.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Academic Progress Chart */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Academic Progress</h3>
              <div className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-4 h-64 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Chart/Graph placeholder</p>
              </div>
            </div>
            
            {/* Recent Behaviour Notes */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Recent Behaviour Notes</h3>
              <div className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-4">
                <div className="space-y-4">
                  {student.behaviorNotes.map((note: BehaviorNote, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 size-8 rounded-full ${
                        note.type === 'warning' 
                          ? 'bg-amber-100 dark:bg-amber-900' 
                          : 'bg-green-100 dark:bg-green-900'
                      } flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${
                          note.type === 'warning' 
                            ? 'text-amber-600 dark:text-amber-300' 
                            : 'text-green-600 dark:text-green-300'
                        } text-base`}>
                          {note.type === 'warning' ? 'priority_high' : 'thumb_up'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{note.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{note.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        case 1: // Academics
        return (
         <InfoPage/>
        )
        case 2 :
          return(
            <AcademicPerformancePage/>
          )
        case 3: // Attendance
        return (
          <AttendancePage />
        )
        case 4: // Behaviour
        return (
          <BehaviourPage/>
        )
      default:
        return (
          <div className="py-8">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {tabNames[activeTab]} content for {student.name} goes here...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-border-light dark:border-border-dark">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max px-2 md:px-6">
            {tabNames.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className={`flex flex-col items-center justify-center border-b-2 px-4 py-3 transition-colors flex-shrink-0 ${
                  activeTab === index
                    ? 'border-b-primary text-primary'
                    : 'border-b-transparent text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                <p className="text-sm font-bold leading-normal whitespace-nowrap">{tab}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 md:p-6 w-full">
        {renderTabContent(activeTab)}
      </div>
    </div>
  )
}