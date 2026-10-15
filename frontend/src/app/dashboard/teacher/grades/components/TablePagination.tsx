'use client';

import React from 'react';
import { TeacherPagination } from '../../components/TeacherPagination';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem?: number;
  endItem?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange
}) => {
  return (
    <TeacherPagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      itemName="grade records"
      className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/30 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800 mt-0 pt-0"
    />
  );
};

export default TablePagination;
