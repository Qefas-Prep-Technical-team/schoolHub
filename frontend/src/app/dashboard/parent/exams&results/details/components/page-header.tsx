"use client"

import { useState } from 'react'

interface ChildOption {
  name: string
}

export default function PageHeader() {
  const [selectedChild, setSelectedChild] = useState('Alex Johnson')
  
  const childOptions: ChildOption[] = [
    { name: 'Alex Johnson' },
    { name: 'Sarah Johnson' },
  ]

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            Mathematics
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            Oct 14, 2023
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Mid-Term Examination
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Mr. Anderson • Written Exam • Term 1
        </p>
      </div>

      {/* Child Switcher */}
      <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-1 flex items-center shadow-sm">
        <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Student
        </span>
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="bg-transparent border-none text-sm font-medium text-gray-900 dark:text-white focus:ring-0 cursor-pointer py-1 pr-8 pl-2"
        >
          {childOptions.map((child) => (
            <option key={child.name} value={child.name}>
              {child.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}