"use client";

import React from 'react';
import { FileText, FileSpreadsheet, FileCode, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExportFileFormat = 'pdf' | 'excel' | 'csv';

interface ExportFormatSelectorProps {
  selectedFormat: ExportFileFormat;
  onSelectFormat: (format: ExportFileFormat) => void;
  disabled?: boolean;
  isPaying?: boolean;
}

export const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  selectedFormat,
  onSelectFormat,
  disabled,
  isPaying = true,
}) => {
  const formats: Array<{
    id: ExportFileFormat;
    name: string;
    extension: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    isPremiumOnly?: boolean;
  }> = [
      {
        id: 'pdf',
        name: 'PDF Document',
        extension: '.pdf',
        description: isPaying
          ? 'Formal double-border PDF report with verified institutional signatures & stamp'
          : 'Standard Master Assessment Sheet PDF (Unendorsed)',
        icon: FileText,
        accentColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900',
        isPremiumOnly: false,
      },
      {
        id: 'excel',
        name: 'Excel Spreadsheet',
        extension: '.xlsx',
        description: 'Clean workbook with auto-calculated columns, scores, grades & remarks',
        icon: FileSpreadsheet,
        accentColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
        isPremiumOnly: true,
      },
      {
        id: 'csv',
        name: 'CSV File',
        extension: '.csv',
        description: 'Raw tabular comma-separated data ready for any statistical spreadsheet tool',
        icon: FileCode,
        accentColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
        isPremiumOnly: true,
      },
    ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
          1. Choose Export Format
        </label>
        {!isPaying && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Excel & CSV require paid plan
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          const isSelected = selectedFormat === fmt.id;
          const isLocked = !isPaying && fmt.isPremiumOnly;

          return (
            <button
              key={fmt.id}
              type="button"
              disabled={disabled || isLocked}
              onClick={() => !isLocked && onSelectFormat(fmt.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group",
                isSelected && !isLocked
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border/60 hover:border-border hover:bg-muted/40",
                isLocked && "opacity-60 bg-muted/20 border-dashed cursor-not-allowed",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn("p-2 rounded-lg border", fmt.accentColor)}>
                  <Icon className="w-4 h-4" />
                </div>
                {isLocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    <Lock className="w-2.5 h-2.5" /> PRO
                  </span>
                ) : isSelected ? (
                  <span className="text-[11px] font-bold text-primary">Selected</span>
                ) : null}
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-foreground">{fmt.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">{fmt.extension}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                  {fmt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
