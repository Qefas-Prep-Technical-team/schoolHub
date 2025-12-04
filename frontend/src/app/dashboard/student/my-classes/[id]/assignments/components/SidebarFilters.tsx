// app/student/classes/[id]/assignments/components/SidebarFilters.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Assignment, filterOptions } from './assignmentsData'

interface SidebarFiltersProps {
  assignments: Assignment[]
  onFilterChange: (filtered: Assignment[]) => void
  onClearFilters: () => void
}

export default function SidebarFilters({ 
  assignments, 
  onFilterChange,
  onClearFilters 
}: SidebarFiltersProps) {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const handleStatusChange = (status: string) => {
    const newSelected = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status]
    
    setSelectedStatus(newSelected)
    applyFilters(newSelected, selectedTypes)
  }

  const handleTypeChange = (type: string) => {
    const newSelected = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    
    setSelectedTypes(newSelected)
    applyFilters(selectedStatus, newSelected)
  }

  const applyFilters = (statuses: string[], types: string[]) => {
    let filtered = assignments

    if (statuses.length > 0) {
      filtered = filtered.filter(a => statuses.includes(a.status))
    }

    if (types.length > 0) {
      filtered = filtered.filter(a => a.type && types.includes(a.type))
    }

    onFilterChange(filtered)
  }

  const handleClearAll = () => {
    setSelectedStatus([])
    setSelectedTypes([])
    onClearFilters()
  }

  const FilterSection = ({ 
    title, 
    options, 
    selected, 
    onChange 
  }: { 
    title: string
    options: string[]
    selected: string[]
    onChange: (value: string) => void
  }) => (
    <div>
      <h3 className="mb-3 text-base font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="flex flex-col">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="h-5 w-5 rounded border-2 border-gray-300 bg-transparent text-primary checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 dark:border-gray-600"
            />
            <span className="text-sm font-normal text-gray-700 dark:text-gray-300 capitalize">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Filter by
      </h2>

      <div className="space-y-8">
        <FilterSection
          title="Status"
          options={filterOptions.status}
          selected={selectedStatus}
          onChange={handleStatusChange}
        />

        <FilterSection
          title="Type"
          options={filterOptions.type}
          selected={selectedTypes}
          onChange={handleTypeChange}
        />

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearAll}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  )
}