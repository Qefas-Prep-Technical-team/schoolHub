"use client";

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ArrowRight,
  Eye,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { computeGradePill } from '@/utils/gradingSystem';
import { groupByDate } from '@/app/dashboard/student/my-classes/[id]/components/materials/utils/dateSectioning';
import { GradeBatchSummary } from '../types';

interface OfflineGradesHistoryTableProps {
  batches: GradeBatchSummary[];
  gradingSystem?: any[];
  isTeacher?: boolean;
  onSelectBatch: (batch: GradeBatchSummary) => void;
  onPublishBatch: (batchId: string) => void;
  onDeleteBatch: (batchId: string) => void;
}

export default function OfflineGradesHistoryTable({
  batches,
  gradingSystem,
  isTeacher = false,
  onSelectBatch,
  onPublishBatch,
  onDeleteBatch,
}: OfflineGradesHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [batchToDelete, setBatchToDelete] = useState<GradeBatchSummary | null>(null);

  const filtered = useMemo(() => {
    return batches.filter(b =>
      !searchTerm.trim() ||
      b.assessmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.className.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [batches, searchTerm]);

  const groupedBatches = useMemo(() => {
    return groupByDate(filtered, (b) => b.createdAt || b.updatedAt);
  }, [filtered]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Search */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input
            placeholder="Search records by assessment or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-800 text-xs border-slate-200 dark:border-slate-700"
          />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          {filtered.length} saved assessment batch{filtered.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {/* Batches Table (Desktop) */}
      <div className="hidden md:block p-4 sm:p-5 space-y-6">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium text-xs">
            No recorded grade batches found. Start by entering grades above!
          </div>
        ) : (
          groupedBatches.map((section) => (
            <div key={section.label} className="space-y-2">
              <div className="flex items-center gap-2.5 px-1 py-1">
                <div className={`size-2 rounded-full ${isTeacher ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {section.label}
                </h4>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                  {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4">Assessment Title</th>
                      <th className="py-3.5 px-4">Subject</th>
                      <th className="py-3.5 px-4">Class</th>
                      <th className="py-3.5 px-4 text-center">Category</th>
                      <th className="py-3.5 px-4 text-center">Graded</th>
                      <th className="py-3.5 px-4 text-center">Average</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {section.items.map((batch) => {
                      const pct = batch.maxMarks > 0 ? Math.round((batch.averageScore / batch.maxMarks) * 100) : 0;
                      const pill = computeGradePill(pct, gradingSystem);
                      return (
                        <tr
                          key={batch.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {batch.assessmentType}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {batch.subject}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {batch.className}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {batch.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white tabular-nums">
                            {batch.gradedStudents} / {batch.totalStudents}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white tabular-nums">
                            <div className="flex items-center justify-center gap-1.5">
                              <span>{batch.averageScore.toFixed(1)} / {batch.maxMarks}</span>
                              <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-black border ${pill.bg} ${pill.color}`}>
                                {pill.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${batch.status === 'PUBLISHED'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                }`}
                            >
                              <span className={`size-1.5 rounded-full ${batch.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {batch.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => onSelectBatch(batch)}
                                className="h-8 px-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer gap-1"
                              >
                                <Edit2 size={13} />
                                Edit Roster
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setBatchToDelete(batch)}
                                className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Batches Mobile Cards */}
      <div className="block md:hidden p-3 space-y-6">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium">
            No recorded grade batches found.
          </div>
        ) : (
          groupedBatches.map((section) => (
            <div key={section.label} className="space-y-3">
              <div className="flex items-center gap-2.5 px-1 py-1">
                <div className={`size-2 rounded-full ${isTeacher ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {section.label}
                </h4>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                  {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              <div className="space-y-3">
                {section.items.map((batch) => {
                  const pct = batch.maxMarks > 0 ? Math.round((batch.averageScore / batch.maxMarks) * 100) : 0;
                  const pill = computeGradePill(pct, gradingSystem);
                  return (
                    <div
                      key={batch.id}
                      className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {batch.assessmentType}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {batch.subject} • {batch.className}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${batch.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                        >
                          {batch.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span>Graded: <strong>{batch.gradedStudents}/{batch.totalStudents}</strong></span>
                        <div className="flex items-center gap-1.5">
                          <span>Avg: <strong>{batch.averageScore.toFixed(1)}/{batch.maxMarks}</strong></span>
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-black border ${pill.bg} ${pill.color}`}>
                            {pill.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectBatch(batch)}
                          className="h-8 px-3 text-xs font-bold"
                        >
                          Edit Scores
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {batchToDelete && (
        <Dialog open={!!batchToDelete} onOpenChange={() => setBatchToDelete(null)}>
          <DialogContent className="max-w-md rounded-2xl dark:bg-slate-900 dark:border-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-600">
                Delete Grade Records?
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete all recorded marks for &quot;{batchToDelete.assessmentType}&quot; ({batchToDelete.subject})? This action will remove these scores from the student records.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBatchToDelete(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onDeleteBatch(batchToDelete.id);
                  setBatchToDelete(null);
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Delete Scores
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
