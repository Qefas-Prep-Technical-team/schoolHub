'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { TeacherPagination } from '../../components/TeacherPagination';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem?: number;
  endItem?: number;
  itemsPerPage?: number;
  onPageSizeChange?: (size: number) => void;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageSizeChange,
  onPageChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/30 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>Rows per page:</span>
        {onPageSizeChange ? (
          <div className="relative inline-flex items-center">
            <select
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1 pr-7 text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-colors"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2" />
          </div>
        ) : (
          <span className="font-bold text-slate-700 dark:text-slate-200">{itemsPerPage}</span>
        )}
      </div>

      <TeacherPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="grade records"
        className="mt-0 pt-0 border-t-0 flex-1 justify-end"
      />
    </div>
  );
};

export default TablePagination;
