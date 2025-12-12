'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination() {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="flex justify-center pt-4 pb-8">
      <nav className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-50 transition-colors"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Page Numbers */}
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`size-9 rounded-lg font-medium text-sm transition-colors ${
              currentPage === page
                ? 'bg-primary text-white font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <ChevronRight className="size-5" />
        </button>
      </nav>
    </div>
  )
}