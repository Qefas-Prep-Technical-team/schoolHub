'use client'
import { cn } from '@/lib/utils'
import { Icon } from '../../Icon'

interface ImportExportButtonsProps {
  onImport: () => void
  onExport: () => void
  className?: string
}

export function ImportExportButtons({
  onImport,
  onExport,
  className
}: ImportExportButtonsProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={onImport}
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Icon name="upload" className="text-base" />
        Import Grades
      </button>
      <button
        onClick={onExport}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
      >
        <Icon name="download" className="text-base" />
        Export Grades
      </button>
    </div>
  )
}