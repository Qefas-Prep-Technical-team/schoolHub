'use client'
import { cn } from '@/lib/utils'
import { getGradeStatusColor, formatPosition, calculateLetterGrade, getLetterGradeColor } from './gradeUtils'
import { EditGradeDialog } from './EditGradeDialog'
import { StudentGrade } from './types'
import { Icon } from '../../Icon'

interface GradeTableProps {
  grades: StudentGrade[]
  onEditGrade: (grade: StudentGrade) => void
  onViewDetails: (grade: StudentGrade) => void
  className?: string
}

export function GradeTable({
  grades,
  onEditGrade,
  onViewDetails,
  className
}: GradeTableProps) {
  const headers = [
    { key: 'student', label: 'Student Name', className: 'text-left' },
    { key: 'continuousAssessment', label: 'Continuous Assessment', className: 'text-left' },
    { key: 'exams', label: 'Exams', className: 'text-left' },
    { key: 'total', label: 'Total', className: 'text-left' },
    { key: 'position', label: 'Position', className: 'text-left' },
    { key: 'status', label: 'Status', className: 'text-left' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  return (
    <div className={cn("mt-4 flow-root", className)}>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            {grades.length === 0 ? (
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
                          header.key === 'student' && "pl-4 pr-3 sm:pl-6",
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
                  {grades.map((grade) => (
                    <GradeRow
                      key={grade.id}
                      grade={grade}
                      onEdit={onEditGrade}
                      onView={onViewDetails}
                    />
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

interface GradeRowProps {
  grade: StudentGrade
  onEdit: (grade: StudentGrade) => void
  onView: (grade: StudentGrade) => void
}

function GradeRow({ grade, onEdit, onView }: GradeRowProps) {
  const isGraded = grade.status === 'graded'
  const letterGrade = isGraded ? calculateLetterGrade(grade.grades.total) : '-'
  const position = grade.grades.position ? formatPosition(grade.grades.position) : '-'

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
        <button
          onClick={() => onView(grade)}
          className="flex items-center gap-3 hover:text-primary transition-colors text-left"
        >
          {grade.avatar && (
            <img
              src={grade.avatar}
              alt={grade.studentName}
              className="h-8 w-8 rounded-full"
            />
          )}
          <span>{grade.studentName}</span>
        </button>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
        {isGraded && grade.grades.continuousAssessment.score !== undefined ? (
          `${grade.grades.continuousAssessment.score} / ${grade.grades.continuousAssessment.total}`
        ) : (
          '-'
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
        {isGraded && grade.grades.exams.score !== undefined ? (
          `${grade.grades.exams.score} / ${grade.grades.exams.total}`
        ) : (
          '-'
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold">
        {isGraded ? (
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-gray-700 dark:text-gray-200",
              getLetterGradeColor(letterGrade)
            )}>
              {grade.grades.total}%
            </span>
            <span className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              getLetterGradeColor(letterGrade).replace('text-', 'bg-').replace('dark:', 'dark:bg-')
            )}>
              {letterGrade}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">-</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {position}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <span className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          getGradeStatusColor(grade.status)
        )}>
          {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
        </span>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <button
          onClick={() => onEdit(grade)}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
        >
          <Icon name="edit" className="text-base" />
          Edit Score
        </button>
      </td>
    </tr>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 px-6">
      <Icon name="grading" className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        No Grades Available
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Import grades or start grading assignments to see data here.
      </p>
    </div>
  )
}