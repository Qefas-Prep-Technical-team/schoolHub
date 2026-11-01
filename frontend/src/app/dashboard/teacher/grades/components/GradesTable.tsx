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
  onExport?: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  isExporting?: boolean;
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

function getDateGroupLabel(dateVal?: string | Date | null): string {
  if (!dateVal) return 'Undated & Previous Records';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Undated & Previous Records';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffTime = today.getTime() - itemDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  }

  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface DateGroup<T> {
  label: string;
  items: { item: T; globalIndex: number }[];
}

const GradesTable: React.FC<GradesTableProps> = ({
  grades,
  searchQuery,
  onSearchChange,
  onFilter,
  onSort,
  onExport,
  onExportPDF,
  onExportCSV,
  isExporting,
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

  const dateGroups = React.useMemo(() => {
    const map = new Map<string, { item: StudentGrade; globalIndex: number }[]>();
    const order: string[] = [];

    grades.forEach((grade, index) => {
      const globalIndex = (currentPage - 1) * 10 + index + 1;
      const label = getDateGroupLabel(grade.createdAt || grade.updatedAt);
      if (!map.has(label)) {
        map.set(label, []);
        order.push(label);
      }
      map.get(label)!.push({ item: grade, globalIndex });
    });

    return order.map((label) => ({ label, items: map.get(label)! }));
  }, [grades, currentPage]);

  return (
    <div className="flex flex-col rounded-2xl sm:rounded-3xl border border-emerald-100 dark:border-emerald-800/50 bg-white/60 dark:bg-emerald-950/20 backdrop-blur-md overflow-hidden shadow-sm">
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onFilter={onFilter}
        onSort={onSort}
        onExport={onExport}
        onExportPDF={onExportPDF}
        onExportCSV={onExportCSV}
        isExporting={isExporting}
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
            <div className="space-y-6">
              {dateGroups.map((section) => (
                <div key={section.label} className="space-y-3">
                  {/* Section Header */}
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {section.label}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                    </span>
                  </div>

                  {/* Grid of Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {section.items.map(({ item: grade }) => (
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
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 sm:p-5">
          {isLoading ? (
            <div className="overflow-x-auto @container rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <TableHeader />
                <tbody>
                  <TableSkeletonBody rows={7} />
                </tbody>
              </table>
            </div>
          ) : grades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No grade records match the current filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dateGroups.map((section) => (
                <div key={section.label} className="space-y-2">
                  {/* Section Header */}
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {section.label}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                    </span>
                  </div>

                  {/* Section Table */}
                  <div className="overflow-x-auto @container rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <TableHeader />
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {section.items.map(({ item: grade, globalIndex }) => (
                          <TableRow
                            key={grade.id}
                            grade={grade}
                            rowNumber={globalIndex}
                            onEdit={() => onEditGrade(grade)}
                            onPublish={() => onPublishGrade(grade)}
                            isPublishing={publishingGradeId === grade.id}
                            onDelete={() => onDeleteGrade(grade)}
                            onViewDetails={() => onViewDetailsGrade(grade)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
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
