'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ExamFilter, ExamType, ExamStatus } from './types';
import { Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExamFilterDialogProps {
  open: boolean;
  onClose: () => void;
  currentFilters: ExamFilter;
  onApply: (filters: ExamFilter) => void;
  availableSubjects?: string[];
}

export function ExamFilterDialog({
  open,
  onClose,
  currentFilters,
  onApply,
  availableSubjects = [],
}: ExamFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<ExamFilter>({});

  useEffect(() => {
    if (open) {
      setLocalFilters(currentFilters || {});
    }
  }, [open, currentFilters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
  };

  const activeCount = Object.values(localFilters).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Filter size={16} />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Filter Exams & Papers
              </DialogTitle>
            </div>
            {activeCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {activeCount} active
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Assessment Type Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Assessment Type
            </label>
            <select
              value={localFilters.type || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, type: (e.target.value as ExamType) || undefined })}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/70 px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              <option value="exam">Terminal Examination</option>
              <option value="ca">Continuous Assessment (CA)</option>
              <option value="quiz">Quiz / Test</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>

          {/* Publishing Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Status
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, status: (e.target.value as ExamStatus) || undefined })}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/70 px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft (Pending)</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="graded">Graded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Subject Filter */}
          {availableSubjects.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Subject
              </label>
              <select
                value={(localFilters as { subject?: string }).subject || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, subject: e.target.value || undefined } as ExamFilter)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/70 px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Subjects</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-row items-center justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            disabled={activeCount === 0}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
          >
            Clear All
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Check size={14} />
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
