// app/components/AttendanceCalendar.tsx
'use client';

import { useState } from 'react';
import { CalendarDay } from './types';

export default function AttendanceCalendar() {
  const [currentMonth, setCurrentMonth] = useState<string>('October 2024');

  const weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const calendarDays: CalendarDay[] = [
    { day: 29, status: null, isCurrentMonth: false },
    { day: 30, status: null, isCurrentMonth: false },
    { day: 1, status: 'present', isCurrentMonth: true },
    { day: 2, status: 'present', isCurrentMonth: true },
    { day: 3, status: 'present', isCurrentMonth: true },
    { day: 4, status: 'present', isCurrentMonth: true },
    { day: 5, status: null, isCurrentMonth: true },
    { day: 6, status: null, isCurrentMonth: true },
    { day: 7, status: 'present', isCurrentMonth: true },
    { day: 8, status: 'absent', isCurrentMonth: true },
    { day: 9, status: 'present', isCurrentMonth: true },
    { day: 10, status: 'present', isCurrentMonth: true },
    { day: 11, status: 'present', isCurrentMonth: true },
    { day: 12, status: null, isCurrentMonth: true },
    { day: 13, status: null, isCurrentMonth: true },
    { day: 14, status: 'present', isCurrentMonth: true },
    { day: 15, status: 'present', isCurrentMonth: true },
    { day: 16, status: 'late', isCurrentMonth: true },
    { day: 17, status: 'present', isCurrentMonth: true },
    { day: 18, status: 'excused', isCurrentMonth: true },
    { day: 19, status: null, isCurrentMonth: true },
    { day: 20, status: null, isCurrentMonth: true },
    { day: 21, status: 'present', isCurrentMonth: true },
    { day: 22, status: 'present', isCurrentMonth: true },
    { day: 23, status: 'present', isCurrentMonth: true },
    { day: 24, status: 'absent', isCurrentMonth: true },
    { day: 25, status: 'present', isCurrentMonth: true, isToday: true },
    { day: 26, status: null, isCurrentMonth: true },
    { day: 27, status: null, isCurrentMonth: true },
    { day: 28, status: 'present', isCurrentMonth: true },
    { day: 29, status: 'present', isCurrentMonth: true },
    { day: 30, status: 'present', isCurrentMonth: true },
    { day: 31, status: 'present', isCurrentMonth: true },
    { day: 1, status: null, isCurrentMonth: false },
    { day: 2, status: null, isCurrentMonth: false }
  ];

  const getStatusColor = (status: CalendarDay['status']): string => {
    const colors: Record<NonNullable<CalendarDay['status']>, string> = {
      present: 'bg-present',
      absent: 'bg-absent',
      late: 'bg-late',
      excused: 'bg-excused'
    };
    return status ? colors[status] : '';
  };

  const handlePreviousMonth = (): void => {
    // Implement month navigation logic
    console.log('Previous month');
  };

  const handleNextMonth = (): void => {
    // Implement month navigation logic
    console.log('Next month');
  };

  const handleExportReport = (): void => {
    // Implement export logic
    console.log('Export report');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#d0d7e7] dark:border-gray-700 p-4 sm:p-6">
      {/* Calendar Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePreviousMonth}
              className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              type="button"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <h3 className="text-lg font-semibold text-[#0e121b] dark:text-gray-100">
              {currentMonth}
            </h3>
            <button 
              onClick={handleNextMonth}
              className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              type="button"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
        <button 
          onClick={handleExportReport}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          <span className="truncate">Export Report</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px text-center text-sm">
        {/* Weekday headers */}
        {weekdays.map((day: string) => (
          <div key={day} className="pb-2 font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map((dayData: CalendarDay, index: number) => (
          <div 
            key={index}
            className={`py-2 ${
              dayData.isToday 
                ? 'bg-primary/20 rounded-full text-primary font-bold' 
                : dayData.isCurrentMonth 
                  ? 'text-[#0e121b] dark:text-gray-100' 
                  : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            <span className="flex items-center justify-center flex-col">
              {dayData.day}
              {dayData.status && (
                <span 
                  className={`mt-1.5 size-2 rounded-full ${getStatusColor(dayData.status)} ${dayData.isToday ? 'bg-primary' : ''}`}
                  aria-label={`${dayData.status} on day ${dayData.day}`}
                ></span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-present" aria-hidden="true"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-absent" aria-hidden="true"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-late" aria-hidden="true"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-excused" aria-hidden="true"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Excused</span>
          </div>
        </div>
      </div>
    </div>
  );
}