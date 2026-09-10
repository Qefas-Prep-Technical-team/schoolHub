'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getGradeStatusColor, formatPosition, calculateLetterGrade, getLetterGradeColor } from './gradeUtils'
import { StudentGrade, IndividualGrade, GradeStatus } from './types'
import Image from 'next/image'
import { Icon } from '../../Icon'
import Pagination from '@/components/ui/Pagination'

interface GradeTableProps {
  grades: StudentGrade[]
  listRows?: { grade: StudentGrade, item: IndividualGrade }[]
  viewMode: 'grid' | 'list'
  onEditGrade: (grade: StudentGrade, item?: IndividualGrade, newTitle?: string, newCategory?: string) => void
  onDeleteGrade?: (item: IndividualGrade) => void
  onViewDetails: (grade: StudentGrade, item?: IndividualGrade) => void
  currentTeacherId?: string
  authorizedSubjects?: Set<string>
  className?: string
  startIndex?: number
  selectedStudentId?: string | null
  onStudentSelect?: (id: string | null) => void
}

export function GradeTable({
  grades,
  listRows = [],
  viewMode,
  onEditGrade,
  onDeleteGrade,
  onViewDetails,
  currentTeacherId,
  authorizedSubjects,
  className,
  startIndex = 0,
  selectedStudentId,
  onStudentSelect
}: GradeTableProps) {
  const [drillDownPage, setDrillDownPage] = useState(1)
  const drillDownItemsPerPage = 10

  const renderListTable = (rows: { grade: StudentGrade, item: IndividualGrade }[], showBackBtn?: boolean, localStartIndex = startIndex) => {
    return (
      <div className={cn("mt-4", className)}>
        {showBackBtn && (
          <div className="mb-4">
            <button
              onClick={() => onStudentSelect?.(null)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-lg shadow-sm"
            >
              <Icon name="arrow_back" className="text-lg" />
              Back to Students
            </button>
          </div>
        )}
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="min-w-[900px]">
            {rows.length === 0 ? (
              <EmptyState />
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6 w-12">#</th>
                    <th className="px-3 pr-10 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Student Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Subject</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Assessment Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Paper</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Score</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
                  {rows.map((row, idx) => {
                    const itemDate = row.item.updatedAt || row.item.createdAt;
                    const dateStr = itemDate ? new Date(itemDate).toLocaleDateString() : '-';
                    return (
                      <tr 
                        key={row.item.id || idx} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                        onClick={() => onViewDetails(row.grade, row.item)}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 sm:pl-6">
                          {localStartIndex + idx + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 pr-10 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(row.grade);
                            }}
                            className="flex items-center gap-3 hover:text-emerald-600 transition-colors text-left"
                          >
                            {row.grade.avatar && (
                              <Image
                                src={row.grade.avatar}
                                alt={row.grade.studentName}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            )}
                            <span>{row.grade.studentName}</span>
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {row.item.type || row.item.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {row.item.subject || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {row.item.assessmentName || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {row.item.paper || row.item.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {dateStr}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {row.item.score !== undefined ? (
                            <span className="font-medium">{row.item.score} / {row.item.maxMarks}</span>
                          ) : (
                            <span className="text-gray-400">- / {row.item.maxMarks}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            getGradeStatusColor(row.item.status as GradeStatus)
                          )}>
                            {row.item.status.charAt(0).toUpperCase() + row.item.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            {/* Show Edit/Delete if this teacher recorded this grade OR is authorized for the subject */}
                            {((currentTeacherId && row.item.teacherId === currentTeacherId) || 
                              (authorizedSubjects && row.item.subject && authorizedSubjects.has(row.item.subject.toLowerCase()))) && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditGrade(row.grade, row.item, row.item.title, row.item.category);
                                  }}
                                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-600/10 dark:hover:bg-emerald-600/20 transition-all"
                                >
                                  <Icon name="edit" className="text-base" />
                                  Edit
                                </button>
                                {onDeleteGrade && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Are you sure you want to delete this grade? This action cannot be undone.')) {
                                        onDeleteGrade(row.item);
                                      }
                                    }}
                                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:hover:bg-red-600/20 transition-all"
                                  >
                                    <Icon name="delete" className="text-base" />
                                    Delete
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return renderListTable(listRows, false)
  }

  // Grid View Drill-down
  if (selectedStudentId) {
    const selectedStudent = grades.find(g => g.id === selectedStudentId)
    if (selectedStudent && selectedStudent.individualGrades) {
      const allStudentRows = selectedStudent.individualGrades.map(ig => ({
        grade: selectedStudent,
        item: ig
      }))
      
      const totalItems = allStudentRows.length
      const totalPages = Math.ceil(totalItems / drillDownItemsPerPage)
      const currentStartIndex = (drillDownPage - 1) * drillDownItemsPerPage
      const paginatedStudentRows = allStudentRows.slice(currentStartIndex, currentStartIndex + drillDownItemsPerPage)

      return (
        <div className="flex flex-col gap-4">
          {renderListTable(paginatedStudentRows, true, currentStartIndex)}
          {totalPages > 1 && (
            <Pagination
              currentPage={drillDownPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={drillDownItemsPerPage}
              onPageChange={setDrillDownPage}
            />
          )}
        </div>
      )
    }
  }

  return (
    <div className={cn("mt-6", className)}>
      {grades.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {grades.map((grade, idx) => {
            const isGraded = grade.status === 'graded'
            const letterGrade = isGraded ? calculateLetterGrade(grade.grades.total) : '-'
            const position = grade.grades.position ? formatPosition(grade.grades.position) : '-'

            return (
              <div
                key={grade.id}
                onClick={() => onStudentSelect?.(grade.id)}
                className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 h-6 w-6 flex shrink-0 items-center justify-center rounded-md">
                        {startIndex + idx + 1}
                      </div>
                      {grade.avatar ? (
                        <Image
                          src={grade.avatar}
                          alt={grade.studentName}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Icon name="person" className="text-gray-400 text-xl" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[140px]" title={grade.studentName}>
                          {grade.studentName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          ID: {grade.studentId}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                      getGradeStatusColor(grade.status)
                    )}>
                      {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Score</span>
                      {isGraded ? (
                        <div className="flex items-baseline gap-1">
                          <span className={cn("text-2xl font-bold", getLetterGradeColor(letterGrade))}>
                            {grade.grades.total}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-medium text-gray-400">-</span>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Grade</span>
                      {isGraded ? (
                        <span className={cn(
                          "text-xl font-bold px-3 py-0.5 rounded-lg",
                          getLetterGradeColor(letterGrade).replace('text-', 'bg-').replace('dark:', 'dark:bg-'),
                          "bg-opacity-20 dark:bg-opacity-20"
                        )}>
                          {letterGrade}
                        </span>
                      ) : (
                        <span className="text-xl font-medium text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Position in Class</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {position}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10 transition-colors">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 transition-colors">
                    View {grade.individualGrades?.length || 0} Grades
                  </span>
                  <Icon name="arrow_forward" className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
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