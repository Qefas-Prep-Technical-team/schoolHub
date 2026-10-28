'use client'


import { cn } from '@/lib/utils'
import { Icon } from '../../Icon'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onFilterClick?: () => void
  activeFiltersCount?: number
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  onFilterClick,
  activeFiltersCount = 0
}: SearchBarProps) {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0"
          placeholder={placeholder}
        />
      </div>
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
        >
          <Icon name="filter_list" className="text-base" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}