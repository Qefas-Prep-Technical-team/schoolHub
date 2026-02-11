/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { CalendarDay, ExamEvent } from './types';

interface CalendarGridProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function CalendarGrid({ currentMonth, onMonthChange }: CalendarGridProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Generate calendar days for current month
  const generateCalendarDays = (): CalendarDay[] => {
    // Implementation for generating days grid
    const days: CalendarDay[] = [];
    // Add logic to generate days...
    return days;
  };
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onMonthChange(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onMonthChange(nextMonth);
  };
  
  const calendarDays = generateCalendarDays();
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Week
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            
            <span className="text-lg font-bold text-slate-900 dark:text-white min-w-[140px] text-center">
              {monthYear}
            </span>
            
            <button
              onClick={handleNextMonth}
              className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary"></span>
            Upcoming
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500"></span>
            Completed
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-500"></span>
            Missed
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col min-w-[700px] overflow-x-auto">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-white dark:bg-surface-dark">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`border-b border-r border-slate-100 dark:border-slate-800 p-2 min-h-[100px] text-sm ${
                day.isCurrentMonth
                  ? 'text-slate-700 dark:text-slate-300 font-medium'
                  : 'text-slate-400'
              } ${
                day.isToday
                  ? 'bg-primary/5 dark:bg-primary/10'
                  : 'group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`inline-flex items-center justify-center size-6 text-xs font-bold ${
                  day.isToday
                    ? 'bg-primary text-white rounded-full shadow-sm'
                    : ''
                }`}>
                  {day.dayOfMonth}
                </span>
                {day.isToday && (
                  <span className="text-[10px] text-primary font-medium uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>
              
              {/* Event indicators */}
              {day.events?.map((event:any) => (
                <div
                  key={event.id}
                  className={`mt-1 ${event.colorClass.bg} border ${event.colorClass.border} ${event.colorClass.text} text-[10px] px-2 py-1 rounded-md font-medium truncate flex items-center gap-1`}
                >
                  <span className="material-symbols-outlined text-[10px]">
                    {event.type === 'completed' ? 'check' : 
                     event.type === 'missed' ? 'close' : 'schedule'}
                  </span>
                  {event.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}