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
    <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700/50 gap-4 mt-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        Showing <span className="text-gray-900 dark:text-white font-bold">{startItem}</span> to <span className="text-gray-900 dark:text-white font-bold">{endItem}</span> of <span className="text-gray-900 dark:text-white font-bold">{totalItems}</span> results
      </p>
      
      <div className="flex items-center gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
          </button>
          
          {pageNumbers.map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  currentPage === page
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] dark:shadow-[0_8px_20px_rgba(59,130,246,0.4)] ring-1 ring-blue-500/50 dark:ring-blue-400'
                    : 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="text-gray-400 font-bold px-1 select-none">
                {page}
              </span>
            )
          ))}
          
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={20} />
          </button>
        </div>
    </div>
  );
};

export default Pagination;
