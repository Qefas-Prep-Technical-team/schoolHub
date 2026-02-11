'use client';

import { useState } from 'react';

const AttendanceTabStandalone: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(9);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const stats = [
    { count: 18, label: 'Days Present', status: 'present', icon: 'check_circle' },
    { count: 2, label: 'Days Late', status: 'late', icon: 'schedule' },
    { count: 1, label: 'Days Absent', status: 'absent', icon: 'cancel' }
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Simplified calendar data
  const calendarDays = [
    // Week 1
    { date: 29, type: 'prev' }, { date: 30, type: 'prev' },
    { date: 1, type: 'current', status: 'present' }, { date: 2, type: 'current', status: 'present' },
    { date: 3, type: 'current', status: 'present' }, { date: 4, type: 'current', status: 'present' },
    { date: 5, type: 'current', status: 'none' },
    // Week 2
    { date: 6, type: 'current', status: 'none' }, { date: 7, type: 'current', status: 'present' },
    { date: 8, type: 'current', status: 'late' }, { date: 9, type: 'current', status: 'present', hasNote: true },
    { date: 10, type: 'current', status: 'present' }, { date: 11, type: 'current', status: 'absent' },
    { date: 12, type: 'current', status: 'none' },
    // ... and so on for remaining days
  ];

  const handleDayClick = (date: number) => {
    setSelectedDate(date);
    setShowEditModal(true);
  };

  return (
    <div className="bg-white dark:bg-[#19212e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/60">
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-10 px-4 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <span className="material-symbols-outlined text-xl">calendar_month</span>
            <span className="text-sm font-medium">October 2024</span>
            <span className="material-symbols-outlined text-xl">arrow_drop_down</span>
          </button>
        </div>
        <button className="flex items-center justify-center gap-2 h-10 cursor-pointer rounded-lg bg-primary text-white text-sm font-bold leading-normal tracking-wide px-4 hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-lg">download</span>
          <span className="truncate">Download Report</span>
        </button>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.status} className={`bg-${stat.status}/10 dark:bg-${stat.status}/20 border border-${stat.status}/30 rounded-xl p-4 flex items-start gap-4`}>
              <div className={`bg-${stat.status} text-white rounded-full size-10 flex items-center justify-center flex-shrink-0`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div>
          <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700/60 pb-2 mb-2">
            {weekdays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`${
                  day.type === 'prev' || day.type === 'next'
                    ? 'text-gray-400 dark:text-gray-600 p-2 text-sm'
                    : selectedDate === day.date
                    ? 'relative cursor-pointer rounded-lg p-2 text-sm text-primary dark:text-primary-300 font-bold bg-primary/10 border border-primary'
                    : 'relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 text-sm text-gray-900 dark:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
                onClick={() => day.type === 'current' && handleDayClick(day.date)}
              >
                {day.date}
                {day.status && day.status !== 'none' && (
                  <div className={`absolute bottom-1 right-1 size-2 rounded-full bg-${day.status}`}></div>
                )}
                {day.hasNote && (
                  <span className="material-symbols-outlined absolute top-1 right-1 text-xs text-gray-500 dark:text-gray-400">
                    chat_bubble
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#19212e] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700/60">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700/60">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Attendance: October {selectedDate}, 2024</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update status and add comments.</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {['present', 'late', 'absent'].map((status) => (
                    <label key={status} className="flex items-center gap-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:border-gray-400">
                      <input type="radio" name="attendance-status" className="form-radio" />
                      <span className="font-medium capitalize text-gray-700 dark:text-gray-300">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment (Optional)</label>
                <textarea 
                  className="mt-2 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" 
                  placeholder="e.g., Left early for a doctor's appointment." 
                  rows={3}
                  defaultValue="Arrived on time but forgot his homework."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <button 
                className="h-10 px-4 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="flex items-center justify-center gap-2 h-10 cursor-pointer rounded-lg bg-primary text-white text-sm font-bold tracking-wide px-4 hover:bg-primary/90">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTabStandalone;