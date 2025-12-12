'use client'

import { useState } from 'react'
import { Filter, SortAsc as Sort } from 'lucide-react'

const subjects = ['All', 'Math', 'Science', 'English', 'History']
const statusOptions = ['Status: All', 'Pending', 'Completed', 'Late']
const sortOptions = ['Sort by: Due Date', 'Newest Assigned', 'Highest Score']

export default function FilterToolbar() {
  const [activeSubject, setActiveSubject] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('Status: All')
  const [selectedSort, setSelectedSort] = useState('Sort by: Due Date')

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Subject Filters */}
      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSubject === subject
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Status Filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-40 appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-primary focus:border-primary"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
        </div>

        {/* Sort Filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full sm:w-40 appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-primary focus:border-primary"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Sort className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}