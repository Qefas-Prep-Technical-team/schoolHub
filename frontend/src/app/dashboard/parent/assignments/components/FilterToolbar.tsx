'use client'

import React from 'react'
import { Filter, Search, ArrowUpDown } from 'lucide-react'

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  availableSubjects: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Not Started' },
  { value: 'submitted', label: 'Submitted / In Progress' },
  { value: 'graded', label: 'Graded & Scored' },
  { value: 'late', label: 'Late / Overdue' },
];

const sortOptions = [
  { value: 'due_asc', label: 'Due Date: Earliest First' },
  { value: 'due_desc', label: 'Due Date: Latest First' },
  { value: 'highest_score', label: 'Highest Score' },
  { value: 'newest', label: 'Newest Assigned' },
];

export default function FilterToolbar({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  availableSubjects,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}: FilterToolbarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[22px] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      {/* Top Row: Search & Dropdowns */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assignments by title or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Status Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full sm:w-44 appearance-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl py-2.5 pl-3.5 pr-8 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none cursor-pointer"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
          </div>

          {/* Sort Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full sm:w-48 appearance-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl py-2.5 pl-3.5 pr-8 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      {availableSubjects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            Subject:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {availableSubjects.map((subject) => {
              const isSelected = selectedSubject === subject;
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => onSubjectChange(subject)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
