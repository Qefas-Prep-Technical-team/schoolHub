'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TeacherPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  className?: string;
  showShowingText?: boolean;
}

export function TeacherPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  itemName = 'items',
  className,
  showShowingText = true,
}: TeacherPaginationProps) {
  if (!totalItems || totalItems <= 0 || totalPages <= 0) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200/70 dark:border-emerald-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4',
        className
      )}
    >
      {showShowingText ? (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
          Showing <span className="font-bold text-slate-900 dark:text-white">{startItem}</span>
          {' - '}
          <span className="font-bold text-slate-900 dark:text-white">{endItem}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> {itemName}
        </p>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 dark:disabled:hover:border-emerald-800/50 active:scale-95"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-slate-400 dark:text-slate-500 px-1 font-bold text-xs select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = currentPage === page;
          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => onPageChange(page as number)}
              className={cn(
                'flex items-center justify-center h-8 min-w-8 sm:h-9 sm:min-w-9 px-2 sm:px-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all active:scale-95',
                isCurrent
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : 'border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50'
              )}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 dark:disabled:hover:border-emerald-800/50 active:scale-95"
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export default TeacherPagination;
