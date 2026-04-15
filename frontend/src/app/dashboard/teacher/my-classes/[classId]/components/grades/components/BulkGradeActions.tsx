'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '../../Icon'
import { GradeStatus, StudentGrade } from './types'

interface BulkGradeActionsProps {
  selectedGrades: string[]
  onBulkUpdate: (updates: Partial<StudentGrade>) => void
  className?: string
}

export function BulkGradeActions({
  selectedGrades,
  onBulkUpdate,
  className
}: BulkGradeActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<GradeStatus>('graded')

  const handleApply = () => {
    onBulkUpdate({ status })
    setIsOpen(false)
  }

  if (selectedGrades.length === 0) return null

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 transform -translate-x-1/2",
      "bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4",
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Icon name="check_circle" className="text-green-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedGrades.length} grade{selectedGrades.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as GradeStatus)}
            className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800"
          >
            <option value="graded">Mark as Graded</option>
            <option value="pending">Mark as Pending</option>
            <option value="missing">Mark as Missing</option>
            <option value="excused">Mark as Excused</option>
          </select>
          
          <button
            onClick={handleApply}
            className="px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Apply
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}