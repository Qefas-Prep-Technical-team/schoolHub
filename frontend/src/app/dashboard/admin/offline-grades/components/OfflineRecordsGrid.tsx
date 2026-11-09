"use client";

import React from 'react';
import { BookCheck, Clock, Edit2, MoreVertical, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { computeGradePill } from '@/utils/gradingSystem';
import { groupByDate } from '@/app/dashboard/student/my-classes/[id]/components/materials/utils/dateSectioning';
import { GradeBatchSummary } from '../types';

interface OfflineRecordsGridProps {
  records: GradeBatchSummary[];
  categoryColors: Record<string, { bg: string; text: string; border: string }>;
  isTeacher?: boolean;
  gradingSystem?: any[];
  onEditRecord: (record: GradeBatchSummary) => void;
  onDeleteRecord: (recordId: string, record?: GradeBatchSummary) => void;
  onExportPDF: (record?: GradeBatchSummary) => void;
  onExportCSV: (record?: GradeBatchSummary) => void;
  onExportRecord?: (record: GradeBatchSummary) => void;
}

export default function OfflineRecordsGrid({
  records,
  categoryColors,
  isTeacher = false,
  gradingSystem,
  onEditRecord,
  onDeleteRecord,
  onExportPDF,
  onExportCSV,
  onExportRecord,
}: OfflineRecordsGridProps) {
  const groupsMap = React.useMemo(() => {
    return groupByDate(records, (rec) => rec.createdAt || rec.updatedAt);
  }, [records]);

  return (
    <div className="space-y-6">
      {groupsMap.map((section) => (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {section.items.map((rec) => {
              const catStyle = categoryColors[rec.category] || categoryColors.CA;
              const percentage = rec.maxMarks > 0 ? Math.round((rec.averageScore / rec.maxMarks) * 100) : 0;

              return (
                <div
                  key={rec.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md ${isTeacher ? 'hover:border-emerald-300 dark:hover:border-emerald-700' : 'hover:border-indigo-300 dark:hover:border-indigo-700'} transition-all flex flex-col justify-between group`}
                >
                  <div>
                    {/* Card Header: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                        {rec.category}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {rec.releaseDate && new Date(rec.releaseDate) > new Date() && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isTeacher ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80'}`} title={`Scheduled release: ${new Date(rec.releaseDate).toLocaleString()}`}>
                            <Clock size={10} />
                            {new Date(rec.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${rec.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                        >
                          <span className={`size-1.5 rounded-full ${rec.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {rec.status}
                        </span>
                      </div>
                    </div>

                    {/* Title & Subject */}
                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate mb-1">
                      {rec.assessmentType}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {rec.subject}
                      </span>
                      {isTeacher && rec.isAssignedSubject && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          <BookCheck size={10} className="text-emerald-600 dark:text-emerald-400" />
                          <span>My Subject</span>
                        </span>
                      )}
                      <span>•</span>
                      <span className="truncate">{rec.className}</span>
                    </div>

                    {/* Recorded By Teacher Pill */}
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                      <User size={12} className={isTeacher ? "text-emerald-500 shrink-0" : "text-indigo-500 shrink-0"} />
                      <span className="text-slate-400 dark:text-slate-500 font-normal">Recorded by:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {rec.teacherName || 'Faculty Staff'}
                      </span>
                    </div>

                    {/* Score & Graded Metrics Card */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Class Average:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                            {rec.averageScore.toFixed(1)} / {rec.maxMarks} ({percentage}%)
                          </span>
                          {(() => {
                            const pill = computeGradePill(percentage, gradingSystem);
                            return (
                              <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-black border ${pill.bg} ${pill.color}`}>
                                {pill.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} h-full rounded-full`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Graded: <strong>{rec.gradedStudents}</strong> students</span>
                        <div className="flex items-center gap-1.5">
                          <span>Term: {rec.term}</span>
                          {rec.createdAt && (
                            <>
                              <span>•</span>
                              <span title={new Date(rec.createdAt).toLocaleString()}>
                                {new Date(rec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onEditRecord(rec)}
                      className={`h-9 px-4 rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-xs font-bold gap-1.5 shadow-sm cursor-pointer`}
                    >
                      <Edit2 size={13} />
                      <span>View / Edit Scores</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteRecord(rec.id, rec)}
                        className="size-9 p-0 rounded-xl border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
                        title="Delete marksheet record"
                      >
                        <Trash2 size={15} />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="size-9 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="More actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl dark:bg-slate-800 dark:border-slate-700">
                          {onExportRecord ? (
                            <DropdownMenuItem onClick={() => onExportRecord(rec)} className="text-xs font-semibold cursor-pointer">
                              Export Marksheet
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => onExportPDF(rec)} className="text-xs font-semibold cursor-pointer">
                                Export as PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onExportCSV(rec)} className="text-xs font-semibold cursor-pointer">
                                Export as CSV
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => onDeleteRecord(rec.id, rec)}
                            className="text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer"
                          >
                            Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
