'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { Assignment } from './types'
import { formatDate, getStatusColor } from './utils'
import { Icon } from '../../Icon'

interface AssignmentTableProps {
  assignments: Assignment[]
  onView: (assignment: Assignment) => void
  onEdit: (assignment: Assignment) => void
  onGrade: (assignment: Assignment) => void
  onDelete?: (assignment: Assignment) => void
  onUnpublish?: (assignment: Assignment) => void
  currentUserId?: string
  className?: string
  startIndex?: number
}

function getDateGroupLabel(dateVal?: string | Date): string {
  if (!dateVal) return 'Undated & Previous Assignments';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Undated & Previous Assignments';
  
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
  items: T[];
}

function groupByDate<T>(items: T[], getDateFn: (item: T) => string | Date | undefined): DateGroup<T>[] {
  const groupsMap = new Map<string, T[]>();
  const groupOrder: string[] = [];

  items.forEach(item => {
    const label = getDateGroupLabel(getDateFn(item));
    if (!groupsMap.has(label)) {
      groupsMap.set(label, []);
      groupOrder.push(label);
    }
    groupsMap.get(label)!.push(item);
  });

  return groupOrder.map(label => ({
    label,
    items: groupsMap.get(label)!
  }));
}

export function AssignmentTable({
  assignments,
  onView,
  onEdit,
  onGrade,
  onDelete,
  onUnpublish,
  currentUserId,
  className,
  startIndex = 0
}: AssignmentTableProps) {
  const headers = [
    { key: 'number', label: '#', className: 'w-12 text-center' },
    { key: 'title', label: 'Assignment Title', className: 'w-1/4' },
    { key: 'subject', label: 'Subject', className: 'w-[15%]' },
    { key: 'creator', label: 'Creator', className: 'w-[15%]' },
    { key: 'dueDate', label: 'Due Date', className: 'w-[15%]' },
    { key: 'status', label: 'Status', className: 'w-[10%]' },
    { key: 'submissions', label: 'Submissions', className: 'w-[10%]' },
    { key: 'actions', label: 'Actions', className: 'text-right w-auto' },
  ]

  const dateSections = groupByDate(assignments, a => a.createdAt || a.updatedAt);
  let runningIndex = startIndex;

  return (
    <div className={cn(
      "bg-white dark:bg-emerald-950/60 rounded-2xl border border-slate-200/80 dark:border-emerald-800/50 overflow-hidden shadow-sm",
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 dark:border-emerald-800/50 bg-slate-50 dark:bg-emerald-950/40">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={cn(
                    "p-4 text-[10px] font-black uppercase tracking-widest text-slate-400",
                    header.className
                  )}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-16 px-4 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="size-14 rounded-2xl bg-slate-100 dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/60 flex items-center justify-center text-slate-400 dark:text-emerald-400 shadow-2xs">
                      <Icon name="assignment" className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">
                        No assignments available at this moment
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        There are currently no assignments posted for this class. Create a new assignment to share homework or coursework tasks.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              dateSections.map((section) => (
                <React.Fragment key={section.label}>
                  <tr className="bg-slate-100/75 dark:bg-emerald-950/90 border-y border-slate-200/80 dark:border-emerald-800/60">
                    <td colSpan={headers.length} className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                          {section.label}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-emerald-800/60">
                          {section.items.length} {section.items.length === 1 ? 'assignment' : 'assignments'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {section.items.map((assignment) => {
                    const currentRowIdx = ++runningIndex;
                    return (
                      <tr
                        key={assignment.id}
                        className="border-b border-slate-100 dark:border-emerald-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => onView(assignment)}
                      >
                        <td className="p-4 text-xs font-black text-slate-300 dark:text-slate-600 text-center">
                          {currentRowIdx}
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                          {assignment.title}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {assignment.subjectName || '-'}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {assignment.teacherName || '-'}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {formatDate(assignment.dueDate)}
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getStatusColor(assignment.status)
                          )}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {assignment.status === 'draft' ? (
                            '- / -'
                          ) : (
                            `${assignment.submissions.submitted} / ${assignment.submissions.total}`
                          )}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end items-center gap-2">
                            {/* View logic visible for all teachers in class */}
                            <button
                              onClick={() => onView(assignment)}
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-600 rounded-xl hover:bg-emerald-600/10 dark:hover:bg-emerald-600/20 transition-all hover:scale-105"
                              title="View assignment"
                            >
                              <Icon name="visibility" className="text-xl" />
                            </button>
                            {/* Restrict edit/delete action buttons to creator */}
                            {(!currentUserId || assignment.teacherId === currentUserId) && (
                              <button
                                onClick={() => onEdit(assignment)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-600 rounded-xl hover:bg-emerald-600/10 dark:hover:bg-emerald-600/20 transition-all hover:scale-105"
                                title="Edit assignment"
                              >
                                <Icon name="edit" className="text-xl" />
                              </button>
                            )}
                            {assignment.canGrade && (!currentUserId || assignment.teacherId === currentUserId) && (
                              <button
                                onClick={() => onGrade(assignment)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-600 rounded-xl hover:bg-emerald-600/10 dark:hover:bg-emerald-600/20 transition-all hover:scale-105"
                                title="Grade submissions"
                                disabled={assignment.status === 'draft'}
                              >
                                <Icon
                                  name="grading"
                                  className={cn(
                                    "text-xl",
                                    assignment.status === 'draft' && "opacity-50"
                                  )}
                                />
                              </button>
                            )}
                            {(!currentUserId || assignment.teacherId === currentUserId) && (
                              assignment.status === 'published' ? (
                                onUnpublish && (
                                  <button
                                    onClick={() => onUnpublish(assignment)}
                                    className="p-2 text-amber-500 hover:text-amber-600 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105"
                                    title="Unpublish assignment"
                                  >
                                    <Icon name="unpublished" className="text-xl" />
                                  </button>
                                )
                              ) : (
                                onDelete && (
                                  <button
                                    onClick={() => onDelete(assignment)}
                                    className="p-2 text-red-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105"
                                    title="Delete assignment"
                                  >
                                    <Icon name="delete" className="text-xl" />
                                  </button>
                                )
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}