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
}

export function AssignmentTable({
  assignments,
  onView,
  onEdit,
  onGrade,
  className
}: AssignmentTableProps) {
  const headers = [
    { key: 'title', label: 'Assignment Title', className: 'w-2/5' },
    { key: 'dueDate', label: 'Due Date', className: 'w-1/5' },
    { key: 'status', label: 'Status', className: 'w-1/5' },
    { key: 'submissions', label: 'Submissions', className: 'w-1/5' },
    { key: 'actions', label: 'Actions', className: 'text-right w-auto' },
  ]

  return (
    <div className={cn(
      "bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden",
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={cn(
                    "p-4 text-sm font-semibold text-[#506795] dark:text-gray-400",
                    header.className
                  )}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr
                key={assignment.id}
                className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="p-4 text-[#0e121b] dark:text-gray-200 font-medium">
                  {assignment.title}
                </td>
                <td className="p-4 text-[#506795] dark:text-gray-400">
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
                <td className="p-4 text-[#506795] dark:text-gray-400">
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
                      className="p-2 text-[#506795] dark:text-gray-400 hover:text-primary dark:hover:text-primary rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                      title="View assignment"
                    >
                      <Icon name="visibility" className="text-xl" />
                    </button>
                    <button
                      onClick={() => onEdit(assignment)}
                      className="p-2 text-[#506795] dark:text-gray-400 hover:text-primary dark:hover:text-primary rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                      title="Edit assignment"
                    >
                      <Icon name="edit" className="text-xl" />
                    </button>
                    <button
                      onClick={() => onGrade(assignment)}
                      className="p-2 text-[#506795] dark:text-gray-400 hover:text-primary dark:hover:text-primary rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
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