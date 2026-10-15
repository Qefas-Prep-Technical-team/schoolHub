'use client';

import React from 'react';
import TableHeader from "./TableHeader";
import TablePagination from "./TablePagination";
import TableRow from "./TableRow";
import TableToolbar from "./TableToolbar";
import GradeCard from "./GradeCard";
import { TableSkeletonBody } from "./TableSkeletonRow";
import { StudentGrade } from "./types";

interface GradesTableProps {
  grades: StudentGrade[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter: () => void;
  onSort: () => void;
  onExport: () => void;
  onEditGrade: (grade: StudentGrade) => void;
  onPublishGrade: (grade: StudentGrade) => void;
  publishingGradeId?: string | null;
  onDeleteGrade: (grade: StudentGrade) => void;
  onViewDetailsGrade: (grade: StudentGrade) => void;
  onPublishAll?: () => void;
  isPublishingAll?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
}

const GradesTable: React.FC<GradesTableProps> = ({
  grades,
  searchQuery,
  onSearchChange,
  onFilter,
  onSort,
  onExport,
  onEditGrade,
  onPublishGrade,
  publishingGradeId,
  onDeleteGrade,
  onViewDetailsGrade,
  onPublishAll,
  isPublishingAll,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading = false,
  viewMode = 'table',
  onViewModeChange
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);

  return (
    <div className="flex flex-col rounded-2xl sm:rounded-3xl border border-emerald-100 dark:border-emerald-800/50 bg-white/60 dark:bg-emerald-950/20 backdrop-blur-md overflow-hidden shadow-sm">
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onFilter={onFilter}
        onSort={onSort}
        onExport={onExport}
        onPublishAll={onPublishAll}
        isPublishingAll={isPublishingAll}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
      
      {viewMode === 'grid' ? (
        <div className="p-3 sm:p-5">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl sm:rounded-3xl bg-slate-100/60 dark:bg-slate-800/40 animate-pulse border border-slate-200/50 dark:border-slate-800" />
              ))}
            </div>
          ) : grades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No grade records match the current filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {grades.map((grade) => (
                <GradeCard
                  key={grade.id}
                  grade={grade}
                  onEdit={() => onEditGrade(grade)}
                  onPublish={() => onPublishGrade(grade)}
                  isPublishing={publishingGradeId === grade.id}
                  onDelete={() => onDeleteGrade(grade)}
                  onViewDetails={() => onViewDetailsGrade(grade)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto @container">
          <table className="w-full text-left">
            <TableHeader />
            <tbody>
              {isLoading ? (
                <TableSkeletonBody rows={7} />
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                    No grade records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                grades.map((grade, index) => (
                  <TableRow
                    key={grade.id}
                    grade={grade}
                    rowNumber={(currentPage - 1) * 10 + index + 1}
                    onEdit={() => onEditGrade(grade)}
                    onPublish={() => onPublishGrade(grade)}
                    isPublishing={publishingGradeId === grade.id}
                    onDelete={() => onDeleteGrade(grade)}
                    onViewDetails={() => onViewDetailsGrade(grade)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default GradesTable;
