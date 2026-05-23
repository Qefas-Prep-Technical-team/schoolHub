import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMetadata } from '@/lib/api/services/examService';

interface PaginationProps {
  pagination: PaginationMetadata;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pages, total } = pagination || { page: 1, pages: 1, total: 0 };

  // Always render to maintain consistent layout, buttons will just be disabled if pages <= 1

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < pages) onPageChange(page + 1);
  };

  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (pages <= maxVisiblePages) {
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', pages);
      } else if (page >= pages - 2) {
        pageNumbers.push(1, '...', pages - 3, pages - 2, pages - 1, pages);
      } else {
        pageNumbers.push(1, '...', page - 1, page, page + 1, '...', pages);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-white/10 w-full">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * pagination.limit + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * pagination.limit, total)}</span> of <span className="font-bold text-slate-900 dark:text-white">{total}</span> results
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm w-full md:w-auto">
        <button
          onClick={handlePrevious}
          disabled={page === 1}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1">
          {generatePageNumbers().map((num, i) => (
            <React.Fragment key={i}>
              {num === '...' ? (
                <span className="px-3 py-2 text-slate-400 font-medium">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(num as number)}
                  className={`min-w-[40px] h-10 rounded-xl font-bold text-sm transition-all duration-200 ${
                    page === num
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={page === pages}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
