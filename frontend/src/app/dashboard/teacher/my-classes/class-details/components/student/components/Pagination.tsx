'use client'

import { Icon } from './Icon'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) pages.push('...')
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }

      if (currentPage < totalPages - 2) pages.push('...')
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={cn(
                "relative inline-flex items-center rounded-l-lg px-2 py-2",
                "ring-1 ring-inset ring-slate-300 dark:ring-slate-600",
                "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                currentPage === 1 && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon name="chevron_left" className="text-slate-500 dark:text-slate-400" />
            </button>

            {renderPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold",
                    "ring-1 ring-inset ring-slate-300 dark:ring-slate-600",
                    "focus:z-20 focus:outline-offset-0",
                    page === currentPage
                      ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                    page > 3 && page < totalPages - 1 && "hidden md:inline-flex"
                  )}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-600"
                >
                  ...
                </span>
              )
            ))}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "relative inline-flex items-center rounded-r-lg px-2 py-2",
                "ring-1 ring-inset ring-slate-300 dark:ring-slate-600",
                "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                currentPage === totalPages && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon name="chevron_right" className="text-slate-500 dark:text-slate-400" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}