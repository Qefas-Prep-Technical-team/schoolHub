"use client"
import { useState } from 'react'
import StatCards from './components/stat-cards'
import ExamList from './components/exam-list'
import SidebarRight from './components/sidebar-right'
import FinalResults from './components/final-results'
import { cn } from '@/lib/utils'

const tabs = [
  { key: 'exams', label: 'Exams & Grades' },
  { key: 'final', label: 'Final Result Grades' },
]

export default function ExamsResultsPage() {
  const [activeTab, setActiveTab] = useState<'exams' | 'final'>('exams')

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark relative">
      <div className="p-6 md:p-8 w-full flex flex-col gap-6">
        <StatCards />

        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'exams' | 'final')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
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
          <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
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
