'use client';

import { useState } from 'react';

import StatsOverview from './components/StatsOverview';
import CalendarGrid from './components/CalendarGrid';
import UpcomingPanel from './components/UpcomingPanel';
import { ExamEvent } from './components/types';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2023, 9, 1)); // October 2023
  const [selectedStudent, setSelectedStudent] = useState<string>('Sarah Jenkins');

  // Mock data - in a real app, fetch from API
  const upcomingExams: ExamEvent[] = [
    {
      id: '1',
      title: 'Mathematics',
      subject: 'Mid-Term Assessment',
      date: '2023-10-18',
      time: '09:00 AM - 11:00 AM',
      type: 'upcoming',
      icon: 'functions',
      colorClass: {
        bg: 'bg-blue-100 dark:bg-blue-900/50',
        text: 'text-primary',
        border: 'border-blue-100 dark:border-blue-800/50'
      }
    },
    // Add more events...
  ];

  return (

      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Heading & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Exam Schedule
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Track upcoming assessments and view past results.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Child Selector */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-primary">face</span>
                  </div>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="appearance-none pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none cursor-pointer shadow-sm"
                  >
                    <option>Sarah Jenkins</option>
                    <option>John Jenkins</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">expand_more</span>
                  </div>
                </div>
                
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-xl">sync</span>
                  <span className="hidden sm:inline">Sync Calendar</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20">
                  <span className="material-symbols-outlined text-xl">download</span>
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
            
            <StatsOverview />
            
            {/* Main Calendar Area & Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 h-[800px] lg:h-auto">
              <CalendarGrid currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
              <UpcomingPanel exams={upcomingExams} />
            </div>
          </div>
        </div>
      </main>
  );
}