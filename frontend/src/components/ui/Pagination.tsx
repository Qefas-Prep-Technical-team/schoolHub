import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = [];
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
    <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200/60 dark:border-slate-800/60 gap-4 mt-6">
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        Showing <span className="text-slate-900 dark:text-slate-100 font-bold">{startItem}</span> to <span className="text-slate-900 dark:text-slate-100 font-bold">{endItem}</span> of <span className="text-slate-900 dark:text-slate-100 font-bold">{totalItems}</span> results
      </p>
      
      <div className="flex items-center gap-1.5">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          
          {pageNumbers.map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                className={`flex h-9 min-w-9 px-3 items-center justify-center rounded-xl text-xs font-black transition-all active:scale-90 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 dark:from-emerald-600 dark:to-emerald-700 dark:shadow-emerald-950/40 scale-105'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="text-slate-400 px-1 font-black select-none">
                {page}
              </span>
            )
          ))}
          
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
    </div>
  );
};

export default Pagination;
