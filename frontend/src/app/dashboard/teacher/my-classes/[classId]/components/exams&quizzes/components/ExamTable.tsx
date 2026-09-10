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
  startIndex?: number
  currentTeacherId?: string
  authorizedSubjects?: Set<string>
}

export function ExamTable({
  exams,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  className,
  startIndex = 0,
  currentTeacherId,
  authorizedSubjects
}: ExamTableProps) {
  const headers = [
    { key: 'number', label: '#', className: 'w-12 text-center' },
    { key: 'title', label: 'Title', className: 'text-left' },
    { key: 'type', label: 'Type', className: 'text-left' },
    { key: 'questions', label: 'Questions', className: 'text-left' },
    { key: 'marks', label: 'Marks', className: 'text-left' },
    { key: 'scheduledDate', label: 'Scheduled Date', className: 'text-left' },
    { key: 'status', label: 'Status', className: 'text-left' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  return (
    <div className={cn("bg-white dark:bg-emerald-950/60 rounded-2xl border border-slate-200/80 dark:border-emerald-800/50 overflow-hidden shadow-sm mt-4", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {exams.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <EmptyState />
                  </td>
                </tr>
              </tbody>
            ) : (
              <>
                <thead className="border-b border-slate-200 dark:border-emerald-800/50 bg-slate-50 dark:bg-emerald-950/40">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header.key}
                        scope="col"
                        className={cn(
                          "p-4 text-[10px] font-black uppercase tracking-widest text-slate-400",
                          header.className
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
                <tbody>
                  {exams.map((exam, idx) => (
                    <tr 
                      key={exam.id} 
                      className="border-b border-slate-100 dark:border-emerald-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => onView(exam)}
                    >
                      <td className="p-4 text-xs font-black text-slate-300 dark:text-slate-600 text-center">
                        {startIndex + idx + 1}
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Icon
                            name={
                              exam.type === 'quiz' ? 'quiz' 
                              : exam.type === 'subject_paper' ? 'description' 
                              : exam.type === 'ca' ? 'assignment_turned_in' 
                              : exam.type === 'assignment' ? 'assignment'
                              : 'file_question'
                            }
                            className={cn(
                              exam.type === 'quiz' 
                                ? "text-emerald-500" 
                                : exam.type === 'subject_paper'
                                ? "text-emerald-500"
                                : exam.type === 'ca'
                                ? "text-blue-500"
                                : exam.type === 'assignment'
                                ? "text-orange-500"
                                : "text-purple-500"
                            )}
                          />
                          {exam.title}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                          exam.type === 'quiz' ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                          : exam.type === 'subject_paper' ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                          : exam.type === 'ca' ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                          : exam.type === 'assignment' ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400"
                          : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400"
                        )}>
                          {getExamTypeLabel(exam.type)}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {exam.questions}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {exam.totalMarks}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {formatExamDate(exam.scheduledDate)}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          getExamStatusColor(exam.status)
                        )}>
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onView(exam)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            title="Preview"
                          >
                            <Icon name="visibility" className="text-lg" />
                          </button>
                          
                          {((currentTeacherId && exam.teacherId === currentTeacherId) || 
                            (authorizedSubjects && exam.subjects && exam.subjects.some(sub => authorizedSubjects.has(sub.toLowerCase())))) && (
                            <button
                              onClick={() => onEdit(exam)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors"
                              title="Edit"
                            >
                              <Icon name="edit" className="text-lg" />
                            </button>
                          )}
                          <ExamActions
                            exam={exam}
                            onView={() => onView(exam)}
                            onEdit={() => onEdit(exam)}
                            onDelete={() => onDelete(exam)}
                            onDuplicate={() => onDuplicate(exam)}
                            onExport={() => onExport(exam)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
        </table>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 px-6">
      <Icon name="quiz" className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        No Exams or Subject Papers Yet
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Click &apos;Create New Exam/Subject Paper&apos; to get started.
      </p>
    </div>
  )
}