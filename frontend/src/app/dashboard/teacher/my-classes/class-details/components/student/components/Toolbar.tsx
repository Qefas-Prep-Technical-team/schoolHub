'use client'

import { Icon } from './Icon'
import { FilterChip } from './FilterChip'

interface ToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddStudent: () => void
  filters: string[]
  onFilterClick: (filter: string) => void
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  onAddStudent,
  filters,
  onFilterClick,
}: ToolbarProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon
              name="search"
              className="text-slate-500 dark:text-slate-400"
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-background-light dark:bg-background-dark py-2 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-colors"
            placeholder="Search by name or ID..."
          />
        </div>
        <button
          onClick={onAddStudent}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-primary/90 transition-colors"
        >
          <Icon name="add" className="text-white" />
          <span className="truncate">Add Student</span>
        </button>
      </div>
      <div className="flex gap-3 p-3 overflow-x-auto">
        {filters.map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            onClick={() => onFilterClick(filter)}
          />
        ))}
      </div>
    </div>
  )
}