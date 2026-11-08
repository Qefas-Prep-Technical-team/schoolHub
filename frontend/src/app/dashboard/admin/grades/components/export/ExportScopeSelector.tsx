"use client";

import React from 'react';
import { Archive, TableProperties, Users, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExportFileFormat } from './ExportFormatSelector';

export type ExportScopeMode = 'all_zip' | 'combined_pdf' | 'custom';

interface ExportScopeSelectorProps {
  scopeMode: ExportScopeMode;
  onSelectScope: (mode: ExportScopeMode) => void;
  format: ExportFileFormat;
  totalStudents: number;
  disabled?: boolean;
  isPaying?: boolean;
}

export const ExportScopeSelector: React.FC<ExportScopeSelectorProps> = ({
  scopeMode,
  onSelectScope,
  format,
  totalStudents,
  disabled,
  isPaying = true,
}) => {
  const isPdf = format === 'pdf';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
          2. Scope & Packaging
        </label>
        {!isPaying && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Master Sheet only on Free tier
          </span>
        )}
      </div>

      <div className={cn("grid gap-2.5", isPdf ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
        {/* Option 1: Combined Master Sheet / All Records */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectScope('combined_pdf')}
          className={cn(
            "p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between",
            scopeMode === 'combined_pdf'
              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
              : "border-border/60 hover:border-border hover:bg-muted/40",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <TableProperties className="w-4 h-4" />
            </div>
            {scopeMode === 'combined_pdf' && (
              <span className="text-[11px] font-bold text-primary">Selected</span>
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block">
              {isPdf ? "Master Result Sheet" : "Full Roster Sheet"}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Single document listing all {totalStudents} candidates with scores, grades, and stats.
            </p>
          </div>
        </button>

        {/* Option 2: Individual Archive (.zip) - PDF only */}
        {isPdf && (
          <button
            type="button"
            disabled={disabled || !isPaying}
            onClick={() => isPaying && onSelectScope('all_zip')}
            className={cn(
              "p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between",
              scopeMode === 'all_zip' && isPaying
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border/60 hover:border-border hover:bg-muted/40",
              !isPaying && "opacity-60 bg-muted/20 border-dashed cursor-not-allowed",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                <Archive className="w-4 h-4" />
              </div>
              {!isPaying ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              ) : scopeMode === 'all_zip' ? (
                <span className="text-[11px] font-bold text-primary">Selected</span>
              ) : null}
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block">Individual PDFs (.zip)</span>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                One standalone report card PDF per student packaged into a single zip archive.
              </p>
            </div>
          </button>
        )}

        {/* Option 3: Custom Candidates Selection */}
        <button
          type="button"
          disabled={disabled || !isPaying}
          onClick={() => isPaying && onSelectScope('custom')}
          className={cn(
            "p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between",
            scopeMode === 'custom' && isPaying
              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
              : "border-border/60 hover:border-border hover:bg-muted/40",
            !isPaying && "opacity-60 bg-muted/20 border-dashed cursor-not-allowed",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900">
              <Users className="w-4 h-4" />
            </div>
            {!isPaying ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                <Lock className="w-2.5 h-2.5" /> PRO
              </span>
            ) : scopeMode === 'custom' ? (
              <span className="text-[11px] font-bold text-primary">Selected</span>
            ) : null}
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block">Select Specific Candidates</span>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Search and pick individual students to export for specific requirements.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
