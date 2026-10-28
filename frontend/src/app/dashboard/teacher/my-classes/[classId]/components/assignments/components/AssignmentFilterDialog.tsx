'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AssignmentFilter {
  status?: 'published' | 'draft' | 'closed';
  subject?: string;
  submissionStatus?: 'all' | 'has_submissions' | 'no_submissions';
}

interface AssignmentFilterDialogProps {
  open: boolean;
  onClose: () => void;
  currentFilters: AssignmentFilter;
  onApply: (filters: AssignmentFilter) => void;
  availableSubjects?: string[];
}

export function AssignmentFilterDialog({
  open,
  onClose,
  currentFilters,
  onApply,
  availableSubjects = [],
}: AssignmentFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<AssignmentFilter>({});

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
                Filter Assignments
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
          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Assignment Status
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, status: (e.target.value as any) || undefined })}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/70 px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="published">Published (Active)</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Subject Filter */}
          {availableSubjects.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Subject
              </label>
              <select
                value={localFilters.subject || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, subject: e.target.value || undefined })}
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

          {/* Submissions Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Submissions
            </label>
            <select
              value={localFilters.submissionStatus || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, submissionStatus: (e.target.value as any) || undefined })}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/70 px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Submissions</option>
              <option value="has_submissions">Has Student Submissions</option>
              <option value="no_submissions">No Submissions Yet</option>
            </select>
          </div>
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
