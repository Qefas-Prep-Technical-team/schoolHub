'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarDay {
  day: number
  status?: 'present' | 'absent' | 'late' | 'today' | 'weekend' | 'inactive'
  isToday?: boolean
}

const monthDays: CalendarDay[] = [
  { day: 28, status: 'inactive' },
  { day: 29, status: 'inactive' },
  { day: 30, status: 'inactive' },
  { day: 1, status: 'present' },
  { day: 2, status: 'present' },
  { day: 3, status: 'present' },
  { day: 4, status: 'late' },
  { day: 5, status: 'weekend' },
  { day: 6, status: 'present' },
  { day: 7, status: 'present' },
  { day: 8, status: 'present' },
  { day: 9, status: 'present' },
  { day: 10, status: 'present' },
  { day: 11, status: 'weekend' },
  { day: 12, status: 'weekend' },
  { day: 13, status: 'absent' },
  { day: 14, status: 'present' },
  { day: 15, status: 'present' },
  { day: 16, status: 'today' },
  { day: 17, status: 'present' },
  { day: 18, status: 'weekend' },
  { day: 19, status: 'weekend' },
]

const statusConfig = {
  present: {
    bg: 'bg-white dark:bg-surface-dark',
    border: 'border-gray-100 dark:border-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    indicator: 'bg-emerald-500',
  },
  absent: {
    bg: 'bg-rose-50/50 dark:bg-rose-900/10',
    border: 'border-rose-100 dark:border-rose-900/30',
    text: 'text-rose-700 dark:text-rose-500 font-bold',
    indicator: 'bg-rose-500',
    label: 'ABSENT',
  },
  late: {
    bg: 'bg-amber-50/50 dark:bg-amber-900/10',
    border: 'border-amber-100 dark:border-amber-900/30',
    text: 'text-amber-700 dark:text-amber-500 font-bold',
    indicator: 'bg-amber-500',
    label: 'LATE',
  },
  today: {
    bg: 'bg-primary/5 dark:bg-primary/10',
    border: 'border-2 border-primary',
    text: 'text-primary font-bold',
    indicator: 'bg-gray-300 dark:bg-gray-600 animate-pulse',
  },
  weekend: {
    bg: 'bg-gray-50/50 dark:bg-gray-800/50',
    border: 'border-gray-100 dark:border-gray-800',
    text: 'text-gray-400',
  },
  inactive: {
    bg: 'transparent',
    border: 'border-transparent',
    text: 'text-gray-300 dark:text-gray-700',
  },
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState('October 2023')

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
          {currentMonth}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => {/* Previous month logic */}}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="text-gray-500 size-5" />
          </button>
          <button
            onClick={() => {/* Next month logic */}}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="text-gray-500 size-5" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 mb-4 text-center">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {monthDays.map((day, index) => {
            const status = statusConfig[day.status || 'present']
            
            return (
              <div
                key={index}
                className={`h-14 sm:h-20 p-1 flex flex-col items-center justify-start rounded-lg group transition-colors cursor-pointer relative ${status.bg} ${status.border} hover:border-primary/30`}
              >
                <span className={`text-sm font-medium ${status.text}`}>
                  {day.day}
                </span>
                
                {/* Status Indicator */}
                {status.indicator && (
                  <div className={`mt-auto w-1.5 h-1.5 rounded-full ${status.indicator} sm:hidden`}></div>
                )}
                
                {/* Label for special statuses */}
                {(day.status === 'absent' || day.status === 'late') && (
                  <div className="mt-auto mb-1 px-1.5 py-0.5 rounded text-[10px] font-bold hidden sm:block">
                    <span className={`${
                      day.status === 'absent'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                    } px-1.5 py-0.5 rounded`}>
                      {status.label}
                    </span>
                  </div>
                )}
                
                {/* Today indicator */}
                {day.status === 'today' && (
                  <div className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs font-bold mb-1">
                    {day.day}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-6 text-xs justify-center sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-rose-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-amber-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Late</span>
          </div>
        </div>
      </div>
    </div>
  )
}