'use client'

import { cn,} from '@/lib/utils'
import { Assignment } from './types'
import { formatDate, getStatusColor } from './utils'
import { Icon } from '../../Icon'

interface AssignmentTableProps {
  assignments: Assignment[]
  onView: (assignment: Assignment) => void
  onEdit: (assignment: Assignment) => void
  onGrade: (assignment: Assignment) => void
  className?: string
  startIndex?: number
}

export function AssignmentTable({
  assignments,
  onView,
  onEdit,
  onGrade,
  className,
  startIndex = 0
}: AssignmentTableProps) {
  const headers = [
    { key: 'number', label: '#', className: 'w-12 text-center' },
    { key: 'title', label: 'Assignment Title', className: 'w-2/5' },
    { key: 'dueDate', label: 'Due Date', className: 'w-1/5' },
    { key: 'status', label: 'Status', className: 'w-1/5' },
    { key: 'submissions', label: 'Submissions', className: 'w-1/5' },
    { key: 'actions', label: 'Actions', className: 'text-right w-auto' },
  ]

  return (
    <div className={cn(
      "bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm",
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
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
            {assignments.map((assignment, idx) => (
              <tr
                key={assignment.id}
                className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="p-4 text-xs font-black text-slate-300 dark:text-slate-600 text-center">
                  {startIndex + idx + 1}
                </td>
                <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                  {assignment.title}
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
                <td className="p-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={() => onView(assignment)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 transition-all hover:scale-105"
                      title="View assignment"
                    >
                      <Icon name="visibility" className="text-xl" />
                    </button>
                    <button
                      onClick={() => onEdit(assignment)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 transition-all hover:scale-105"
                      title="Edit assignment"
                    >
                      <Icon name="edit" className="text-xl" />
                    </button>
                    <button
                      onClick={() => onGrade(assignment)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 transition-all hover:scale-105"
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}