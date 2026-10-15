"use client"
import { useState } from 'react'
import StatCards from './components/stat-cards'
import ExamList from './components/exam-list'
import SidebarRight from './components/sidebar-right'
import FinalResults from './components/final-results'
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip'
import { cn } from '@/lib/utils'

const tabs = [
  { key: 'exams', label: 'Exams & Grades' },
  { key: 'final', label: 'Final Result Grades' },
]

export default function ExamsResultsPage() {
  const [activeTab, setActiveTab] = useState<'exams' | 'final'>('exams')

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 w-full flex flex-col gap-4 sm:gap-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Exams & Results
              </h1>
              <HeaderTooltip
                content="This portal tracks your child's continuous assessments, upcoming test papers, and official term grade transcripts. Use this page to monitor score trajectories across subjects, identify areas needing academic reinforcement, and review verified end-of-term WAEC letter grades."
                size={18}
              />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
              Review real-time academic evaluations, test papers, and term standing.
            </p>
          </div>
        </div>

        <StatCards />

        {/* Tabs */}
        <div className="flex gap-1.5 sm:gap-2 bg-white dark:bg-slate-900 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 w-full sm:w-fit shadow-sm overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'exams' | 'final')}
              className={cn(
                "flex-1 sm:flex-none px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap text-center",
                activeTab === tab.key
                  ? "bg-orange-600 text-white shadow-md shadow-orange-500/20"
                  : "text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'exams' && (
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ExamList />
            <SidebarRight />
          </div>
        )}

        {activeTab === 'final' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FinalResults />
          </div>
        )}
      </div>
    </main>
  )
}
