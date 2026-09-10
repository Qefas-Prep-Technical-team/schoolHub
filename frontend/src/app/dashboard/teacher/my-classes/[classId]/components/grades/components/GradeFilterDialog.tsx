import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { GradeFilter } from './types'

interface GradeFilterDialogProps {
  open: boolean
  onClose: () => void
  currentFilters: GradeFilter
  onApply: (filters: GradeFilter) => void
  availableTypes?: string[]
  availableSubjects?: string[]
}

export function GradeFilterDialog({ 
  open, 
  onClose, 
  currentFilters, 
  onApply,
  availableTypes = ['EXAM', 'ASSIGNMENT', 'QUIZ', 'CA'],
  availableSubjects = []
}: GradeFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<GradeFilter>({})

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalFilters(currentFilters)
    }
  }, [open, currentFilters])

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({})
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Filter Grades</DialogTitle>
        </DialogHeader>
        
        <div className="mt-6 space-y-6">
          {/* Status Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Grade Status
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value || undefined })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published (Graded)</option>
              <option value="DRAFT">Draft (Pending)</option>
              <option value="ARCHIVED">Archived</option>
              <option value="graded">Graded</option>
              <option value="missing">Missing</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                value={localFilters.type || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value || undefined })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Types</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </label>
              <select
                value={localFilters.subject || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, subject: e.target.value || undefined })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Subjects</option>
                {availableSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Score Range Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Score Range (%)
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={localFilters.minScore !== undefined ? localFilters.minScore : ''}
                  onChange={(e) => setLocalFilters({ 
                    ...localFilters, 
                    minScore: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <span className="text-gray-500">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={localFilters.maxScore !== undefined ? localFilters.maxScore : ''}
                  onChange={(e) => setLocalFilters({ 
                    ...localFilters, 
                    maxScore: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only applies to students with graded scores.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-8 flex justify-between sm:justify-between items-center">
          <button
            onClick={handleClear}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Clear Filters
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
