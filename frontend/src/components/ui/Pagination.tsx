import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  theme?: 'emerald' | 'blue' | 'pink' | 'orange';
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  theme = 'emerald'
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers: (number | string)[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  if (!totalItems || totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-200/80 dark:border-zinc-800 gap-3 sm:gap-4 mt-6 w-full">
      <p className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center sm:text-left">
        Showing <span className="text-slate-900 dark:text-white font-bold">{startItem}</span> to <span className="text-slate-900 dark:text-white font-bold">{endItem}</span> of <span className="text-slate-900 dark:text-white font-bold">{totalItems}</span> results
      </p>
      
      <div className="flex items-center gap-1.5 shrink-0">
          <button
            className={`flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 focus:outline-none ${
              theme === 'pink' 
                ? 'hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-800 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 dark:focus:border-pink-500' 
                : theme === 'orange'
                ? 'hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-800 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:focus:border-orange-500'
                : 'focus:ring-2 focus:ring-emerald-500/30'
            }`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          
          {pageNumbers.map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                className={`flex h-8 sm:h-9 min-w-8 sm:min-w-9 px-2.5 sm:px-3 items-center justify-center rounded-xl text-xs font-black transition-all active:scale-90 focus:outline-none ${
                  currentPage === page
                    ? theme === 'blue'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 dark:from-blue-600 dark:to-indigo-700 scale-105 focus:ring-2 focus:ring-blue-400'
                      : theme === 'pink'
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-md shadow-pink-500/30 scale-105 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-950'
                      : theme === 'orange'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20 scale-105 focus:ring-2 focus:ring-orange-400'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 dark:from-green-600 dark:to-emerald-700 scale-105 focus:ring-2 focus:ring-emerald-400'
                    : `border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 ${
                        theme === 'pink' 
                          ? 'hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-200 dark:hover:border-pink-900/40 focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 dark:focus:border-pink-400' 
                          : theme === 'orange'
                          ? 'hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-900/40 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 dark:focus:border-orange-400'
                          : 'focus:ring-2 focus:ring-emerald-500/30'
                      }`
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="text-slate-400 dark:text-zinc-600 px-1 font-bold select-none text-xs">
                {page}
              </span>
            )
          ))}
          
          <button
            className={`flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 focus:outline-none ${
              theme === 'pink' 
                ? 'hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-800 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 dark:focus:border-pink-500' 
                : theme === 'orange'
                ? 'hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-800 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:focus:border-orange-500'
                : 'focus:ring-2 focus:ring-emerald-500/30'
            }`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
    </div>
  );
};

export default Pagination;
