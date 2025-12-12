'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'

const subjects = ['All Subjects', 'Mathematics', 'Science', 'History', 'Art']
const statuses = ['All Statuses', 'Pending', 'Submitted', 'Graded', 'Late']

export default function FilterBar() {
  const [selectedSubject, setSelectedSubject] = useState('All Subjects')
  const [selectedStatus, setSelectedStatus] = useState('All Statuses')
  const [filterQuery, setFilterQuery] = useState('')

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
          <Filter className="size-5" />
        </div>
        <input
          type="text"
          placeholder="Filter by title..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="block w-full p-2.5 pl-10 text-sm bg-background-light dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary placeholder:text-text-muted text-text-main dark:text-white"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-background-light dark:bg-slate-800 border-none text-text-main dark:text-white text-sm rounded-lg focus:ring-primary block w-auto p-2.5 pr-8 cursor-pointer"
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-background-light dark:bg-slate-800 border-none text-text-main dark:text-white text-sm rounded-lg focus:ring-primary block w-auto p-2.5 pr-8 cursor-pointer"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}