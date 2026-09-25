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
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm">
      {/* Subject Filters */}
      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeSubject === subject
                ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
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
            className="w-full sm:w-40 appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg py-2 pl-3 pr-8 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-shadow hover:border-slate-300"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
        </div>

        {/* Sort Filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full sm:w-40 appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg py-2 pl-3 pr-8 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-shadow hover:border-slate-300"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Sort className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
