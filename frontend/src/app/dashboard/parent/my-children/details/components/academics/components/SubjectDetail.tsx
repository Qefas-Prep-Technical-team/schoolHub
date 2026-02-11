'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import PerformanceChart from './PerformanceChart'
import GradedItems from './GradedItems'
import UpcomingTasks from './UpcomingTasks'
import TeacherNotes from './TeacherNotes'

const tabs = ['Overview', 'Assignments', 'Resources']

export default function SubjectDetail() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="w-full lg:w-2/3 flex flex-col gap-6">
      {/* Detail Header Card */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold">Mathematics</h3>
              <span className="bg-primary/10 text-primary dark:text-blue-300 text-xs px-2 py-0.5 rounded font-medium">
                Core Subject
              </span>
            </div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Instructor: <span className="font-medium text-text-main-light dark:text-text-main-dark">Mr. Anderson</span> • Room 302
            </p>
          </div>
          <button className="mt-3 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark rounded-lg text-sm font-medium border border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors">
            <Mail className="size-5" />
            Contact Teacher
          </button>
        </div>

        {/* Performance Tabs */}
        <div className="flex gap-6 border-b border-border-light dark:border-border-dark mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-main-light dark:hover:text-text-main-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Analytics Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PerformanceChart />
          <GradedItems />
        </div>

        {/* Bottom Section: Tasks & Teacher Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <UpcomingTasks />
          <TeacherNotes />
        </div>
      </div>
    </div>
  )
}