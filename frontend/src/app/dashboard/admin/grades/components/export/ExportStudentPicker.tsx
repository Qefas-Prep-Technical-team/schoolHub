"use client";

import React from 'react';
import { Search, CheckSquare, Square, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExportStudentOption {
  id: string;
  name: string;
  studentCode?: string;
  className?: string;
  score?: number;
  totalMarks?: number;
  rawItem: unknown;
}

interface ExportStudentPickerProps {
  students: ExportStudentOption[];
  selectedIds: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleStudent: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export const ExportStudentPicker: React.FC<ExportStudentPickerProps> = ({
  students,
  selectedIds,
  searchQuery,
  onSearchChange,
  onToggleStudent,
  onSelectAll,
  onClearAll,
  disabled,
}) => {
  const filteredStudents = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
        (s.className && s.className.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-2 border border-border/70 rounded-xl p-3 bg-muted/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            disabled={disabled}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidate name, ID, or class..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={onSelectAll}
            className="text-[11px] font-medium text-primary hover:underline px-2 py-1"
          >
            Select All ({filteredStudents.length})
          </button>
          <span className="text-muted-foreground text-xs">&bull;</span>
          <button
            type="button"
            disabled={disabled}
            onClick={onClearAll}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1"
          >
            Clear ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
        {filteredStudents.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No students found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredStudents.map((s) => {
            const isChecked = selectedIds.includes(s.id);
            return (
              <div
                key={s.id}
                onClick={() => !disabled && onToggleStudent(s.id)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors",
                  isChecked
                    ? "border-primary/60 bg-primary/5 text-foreground"
                    : "border-border/50 bg-background/50 hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {s.studentCode ? `ID: ${s.studentCode}` : ''}
                      {s.className ? ` • Class: ${s.className}` : ''}
                    </p>
                  </div>
                </div>

                {s.score !== undefined && (
                  <span className="font-mono text-[11px] font-bold text-foreground shrink-0 ml-2">
                    {s.score} {s.totalMarks ? `/ ${s.totalMarks}` : 'pts'}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

