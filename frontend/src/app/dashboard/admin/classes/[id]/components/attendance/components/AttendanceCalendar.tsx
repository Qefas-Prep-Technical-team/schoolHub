import React from 'react';
import { CalendarDay } from './types';

interface AttendanceCalendarProps {
  days: CalendarDay[];
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ 
  days, 
  selectedDate, 
  onDateSelect 
}) => {
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthYear = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const handlePrevMonth = () => {
    const prev = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    onDateSelect?.(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
    onDateSelect?.(next);
  };

  const getDayColor = (day: CalendarDay) => {
    const baseClasses = 'w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-colors';
    const isToday = day.date.toDateString() === new Date().toDateString();
    const todayBorder = isToday ? ' ring-2 ring-primary ring-offset-1 dark:ring-offset-gray-900 font-bold' : '';
    
    if (day.date.toDateString() === selectedDate.toDateString()) {
      return `${baseClasses} bg-primary text-white ring-2 ring-primary hover:bg-primary/90`;
    }
    
    if (day.status === 'present') {
      return `${baseClasses} bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-800${todayBorder}`;
    } else if (day.status === 'absent') {
      return `${baseClasses} bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-200 hover:bg-red-300 dark:hover:bg-red-800${todayBorder}`;
    } else if (day.status === 'late') {
      return `${baseClasses} bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-300 dark:hover:bg-yellow-800${todayBorder}`;
    } else if (day.hasAttendance) {
      return `${baseClasses} bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-800${todayBorder}`;
    } else if (day.isCurrentMonth) {
      return `${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600${todayBorder}`;
    } else {
      return `${baseClasses} bg-transparent text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800${todayBorder}`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Attendance Calendar
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => {
              if (e.target.value) {
                onDateSelect?.(new Date(e.target.value));
              }
            }}
            className="w-8 h-8 p-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md cursor-pointer text-xs focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
            title="Pick specific date"
          />
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="px-2 py-1 hover:bg-white dark:hover:bg-gray-750 rounded-md text-gray-600 dark:text-gray-300 transition-colors font-bold text-sm"
              title="Previous Month"
            >
              &larr;
            </button>
            <span className="px-2 text-xs font-bold text-gray-700 dark:text-gray-300 min-w-[90px] text-center truncate">
              {currentMonthYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="px-2 py-1 hover:bg-white dark:hover:bg-gray-750 rounded-md text-gray-600 dark:text-gray-300 transition-colors font-bold text-sm"
              title="Next Month"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect?.(day.date)}
            className={getDayColor(day)}
            aria-label={`Date: ${day.date.toLocaleDateString()}`}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-600"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-600"></div>
          <span>Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-600"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <span>No Attendance</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;