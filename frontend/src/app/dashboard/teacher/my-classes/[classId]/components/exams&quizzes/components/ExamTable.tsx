'use client'
import { cn } from '@/lib/utils'
import { Exam } from './types'
import { Icon } from '../../Icon'
import { formatExamDate, getExamStatusColor, getExamTypeLabel } from './examUtils'
import { ExamActions } from '../ExamActions'


interface ExamTableProps {
  exams: Exam[]
  onView: (exam: Exam) => void
  onEdit: (exam: Exam) => void
  onDelete: (exam: Exam) => void
  onDuplicate: (exam: Exam) => void
  onExport: (exam: Exam) => void
  className?: string
}

export function ExamTable({
  exams,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  className
}: ExamTableProps) {
  const headers = [
    { key: 'title', label: 'Title', className: 'text-left' },
    { key: 'type', label: 'Type', className: 'text-left' },
    { key: 'questions', label: 'Questions', className: 'text-left' },
    { key: 'marks', label: 'Marks', className: 'text-left' },
    { key: 'scheduledDate', label: 'Scheduled Date', className: 'text-left' },
    { key: 'status', label: 'Status', className: 'text-left' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  return (
    <div className={cn("mt-4 flow-root", className)}>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            {exams.length === 0 ? (
              <EmptyState />
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header.key}
                        scope="col"
                        className={cn(
                          "py-3.5 text-sm font-semibold text-gray-900 dark:text-white",
                          header.className,
                          header.key === 'title' && "pl-4 pr-3 sm:pl-6",
                          header.key === 'actions' && "relative py-3.5 pl-3 pr-4 sm:pr-6"
                        )}
                      >
                        {header.key === 'actions' ? (
                          <span className="sr-only">Actions</span>
                        ) : (
                          header.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        <div className="flex items-center gap-2">
                          <Icon
                            name={exam.type === 'quiz' ? 'quiz' : 'file_question'}
                            className={cn(
                              exam.type === 'quiz' 
                                ? "text-blue-500" 
                                : "text-purple-500"
                            )}
                          />
                          {exam.title}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {getExamTypeLabel(exam.type)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {exam.questions}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {exam.totalMarks}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {formatExamDate(exam.scheduledDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          getExamStatusColor(exam.status)
                        )}>
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <ExamActions
                          exam={exam}
                          onView={() => onView(exam)}
                          onEdit={() => onEdit(exam)}
                          onDelete={() => onDelete(exam)}
                          onDuplicate={() => onDuplicate(exam)}
                          onExport={() => onExport(exam)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 px-6">
      <Icon name="quiz" className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        No Exams or Quizzes Yet
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Click &apos;Create New Exam/Quiz&apos; to get started.
      </p>
    </div>
  )
}