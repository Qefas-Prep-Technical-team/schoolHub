'use client'
import { cn } from '@/lib/utils'
import { GradeFilter } from './types'
import { Icon } from '../../Icon'


interface GradeToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFilterClick: () => void
  filters: GradeFilter
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  className?: string
}

export function GradeToolbar({
  searchQuery,
  onSearchChange,
  onFilterClick,
  filters,
  viewMode,
  onViewModeChange,
  className
}: GradeToolbarProps) {
  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof GradeFilter] !== undefined
  ).length

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-gray-200",
      "dark:border-gray-800 bg-white dark:bg-gray-900/50 p-3",
      className
    )}>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === 'list' 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Icon name="format_list_bulleted" className="text-base" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === 'grid' 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Icon name="grid_view" className="text-base" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
        <Icon
          name="search"
          className="text-gray-500 dark:text-gray-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0"
          placeholder="Search students..."
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          onClick={onFilterClick}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Icon name="filter_list" className="text-base" />
          Filter
          {activeFiltersCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}