'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null; // Don't show if there's only 1 page or none

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center pt-4 pb-8">
      <nav className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-50 transition-colors"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Page Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`size-9 rounded-lg text-sm transition-colors ${
              currentPage === page
                ? 'bg-slate-900 dark:bg-orange-500 text-white font-bold shadow-sm'
                : 'font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 transition-colors"
        >
          <ChevronRight className="size-5" />
        </button>
      </nav>
    </div>
  )
}
