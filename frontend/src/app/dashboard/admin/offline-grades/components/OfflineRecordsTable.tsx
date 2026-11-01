"use client";

import React from 'react';
import { BookCheck, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { computeGradePill } from '@/utils/gradingSystem';
import { GradeBatchSummary } from '../types';

interface OfflineRecordsTableProps {
  records: GradeBatchSummary[];
  categoryColors: Record<string, { bg: string; text: string; border: string }>;
  isTeacher?: boolean;
  gradingSystem?: any[];
  onEditRecord: (record: GradeBatchSummary) => void;
  onDeleteRecord: (recordId: string) => void;
}

function getDateGroupLabel(dateVal?: string | Date): string {
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

export default function OfflineRecordsTable({
  records,
  categoryColors,
  isTeacher = false,
  gradingSystem,
  onEditRecord,
  onDeleteRecord,
}: OfflineRecordsTableProps) {
  const groupsMap = React.useMemo(() => {
    const map = new Map<string, GradeBatchSummary[]>();
    const order: string[] = [];
    records.forEach((rec) => {
      const label = getDateGroupLabel(rec.createdAt || rec.updatedAt);
      if (!map.has(label)) {
        map.set(label, []);
        order.push(label);
      }
      map.get(label)!.push(rec);
    });
    return order.map((label) => ({ label, items: map.get(label)! }));
  }, [records]);

  return (
    <div className="space-y-6">
      {groupsMap.map((section) => (
        <div key={section.label} className="space-y-2">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className={`size-2 rounded-full ${isTeacher ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {section.label}
            </h4>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
              {section.items.length} {section.items.length === 1 ? 'assessment' : 'assessments'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Assessment Title</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4 text-center">Category</th>
                    <th className="py-3.5 px-4 text-center">Date</th>
                    <th className="py-3.5 px-4 text-center">Graded</th>
                    <th className="py-3.5 px-4 text-center">Average</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {section.items.map((rec) => {
              const catStyle = categoryColors[rec.category] || categoryColors.CA;
              return (
                <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div>{rec.assessmentType}</div>
                    <div className="text-[10px] font-normal text-slate-400 dark:text-slate-500 mt-0.5">
                      By: <span className="font-semibold text-slate-600 dark:text-slate-300">{rec.teacherName || 'Faculty Staff'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{rec.subject}</span>
                      {isTeacher && rec.isAssignedSubject && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          <BookCheck size={10} className="text-emerald-600 dark:text-emerald-400" />
                          <span>My Subject</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {rec.className}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                      {rec.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                    {rec.createdAt ? (
                      <span title={new Date(rec.createdAt).toLocaleString()}>
                        {new Date(rec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold tabular-nums">
                    {rec.gradedStudents}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold tabular-nums">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{rec.averageScore.toFixed(1)} / {rec.maxMarks}</span>
                      {(() => {
                        const pct = rec.maxMarks > 0 ? Math.round((rec.averageScore / rec.maxMarks) * 100) : 0;
                        const pill = computeGradePill(pct, gradingSystem);
                        return (
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-black border ${pill.bg} ${pill.color}`}>
                            {pill.label}
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${rec.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {rec.status}
                      </span>
                      {rec.releaseDate && new Date(rec.releaseDate) > new Date() && (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-semibold ${isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                          <Clock size={9} />
                          {new Date(rec.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onEditRecord(rec)}
                        className={`h-8 px-3 text-xs font-bold ${isTeacher ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50' : 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'}`}
                      >
                        Edit Scores
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteRecord(rec.id)}
                        className="size-8 p-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
        </div>
      ))}
    </div>
  );
}
