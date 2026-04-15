'use client'
import { cn } from '@/lib/utils'
import { Icon } from '../../Icon'
import { ExamFilter } from './types'


interface ExamToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFilterClick: () => void
  filters: ExamFilter
  className?: string
}

export function ExamToolbar({
  searchQuery,
  onSearchChange,
  onFilterClick,
  filters,
  className
}: ExamToolbarProps) {
  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof ExamFilter] !== undefined
  ).length

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 rounded-xl border border-gray-200",
      "dark:border-gray-800 bg-white dark:bg-gray-900/50 p-3",
      className
    )}>
      <div className="flex flex-1 items-center gap-2">
        <Icon
          name="search"
          className="text-gray-500 dark:text-gray-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0"
          placeholder="Search exams or quizzes..."
        />
      </div>
      <button
        onClick={onFilterClick}
        className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Icon name="filter_list" className="text-base" />
        Filter
        {activeFiltersCount > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  )
}