'use client'
import { cn } from '@/lib/utils'
import { Exam } from './types'
import { Icon } from '../../Icon'
import { formatExamDate, getExamStatusColor, getExamTypeLabel } from './examUtils'
import { ExamActions } from '../ExamActions'
import { useState, Fragment } from 'react'
import { ChevronRight, ChevronDown, FileText } from 'lucide-react'



interface ExamTableProps {
  exams: Exam[]
  onView: (exam: Exam) => void
  onEdit: (exam: Exam) => void
  onDelete: (exam: Exam) => void
  onDuplicate: (exam: Exam) => void
  onExport: (exam: Exam) => void
  onEditPaper?: (paperId: string) => void
  className?: string
  startIndex?: number
  currentTeacherId?: string
  authorizedSubjects?: Set<string>
  authorizedSubjectIds?: Set<string>
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
  authorizedSubjects,
  authorizedSubjectIds,
  onEditPaper
}: ExamTableProps) {
  const [expandedExamIds, setExpandedExamIds] = useState<Set<string>>(new Set())

  const toggleExpand = (e: React.MouseEvent, examId: string) => {
    e.stopPropagation()
    setExpandedExamIds(prev => {
      const next = new Set(prev)
      if (next.has(examId)) {
        next.delete(examId)
      } else {
        next.add(examId)
      }
      return next
    })
  }
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
                    <Fragment key={exam.id}>
                      <tr 
                        className="border-b border-slate-100 dark:border-emerald-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => onView(exam)}
                      >
                      <td className="p-4 text-xs font-black text-slate-300 dark:text-slate-600 text-center">
                        {startIndex + idx + 1}
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {exam.subjectPapers && exam.subjectPapers.length > 0 ? (
                            <button 
                              onClick={(e) => toggleExpand(e, exam.id)}
                              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"
                            >
                              {expandedExamIds.has(exam.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          ) : (
                            <span className="w-5" /> // spacer
                          )}
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
                          
                          {(() => {
                            const canEdit = !!(
                              (currentTeacherId && exam.teacherId === currentTeacherId) || 
                              exam.mySubjectPaperId ||
                              (exam.type === 'assignment' && (
                                (authorizedSubjects && exam.subjects && exam.subjects.some(
                                  sub => sub && authorizedSubjects.has(sub.toLowerCase())
                                )) ||
                                (authorizedSubjectIds && exam.subjectIds && exam.subjectIds.some(
                                  id => id && authorizedSubjectIds.has(id)
                                ))
                              ))
                            );
                            
                            return (
                              <>

                                <ExamActions
                                  exam={exam}
                                  onView={() => onView(exam)}
                                  onEdit={() => onEdit(exam)}
                                  onDelete={() => onDelete(exam)}
                                  onDuplicate={() => onDuplicate(exam)}
                                  onExport={() => onExport(exam)}
                                  canEdit={canEdit}
                                />
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                    
                    {expandedExamIds.has(exam.id) && exam.subjectPapers && exam.subjectPapers.length > 0 && (
                      <tr className="bg-slate-50/50 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-emerald-800/40">
                        <td colSpan={8} className="p-0">
                          <div className="px-16 py-4 animate-in slide-in-from-top-2 fade-in duration-200">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-emerald-400 mb-3 uppercase tracking-wider">Subject Papers</h4>
                            <div className="grid gap-3">
                              {exam.subjectPapers.map(paper => {
                                const isMySubject = (
                                  (paper.subjectId && authorizedSubjectIds?.has(paper.subjectId))
                                );

                                return (
                                <div key={paper.id} className={cn("flex items-center justify-between rounded-xl p-3 shadow-sm hover:shadow transition-shadow border", isMySubject ? "bg-emerald-50/30 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" : "bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/50")}>
                                  <div className="flex items-center gap-3">
                                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", isMySubject ? "bg-emerald-200 dark:bg-emerald-800/60" : "bg-emerald-100 dark:bg-emerald-900/40")}>
                                      <FileText className={cn("text-emerald-600 dark:text-emerald-400", isMySubject && "text-emerald-700 dark:text-emerald-300")} size={16} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                          {paper.subjectName && paper.subjectName !== paper.title 
                                            ? `${paper.subjectName} : ${paper.title}` 
                                            : paper.title}
                                        </p>
                                        {isMySubject && (
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400">
                                            Your Subject
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-700/50">
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{paper.questionsCount || 0}</p>
                                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-[1px]">Questions</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-700/50">
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{paper.totalMarks || 0}</p>
                                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-[1px]">Marks</p>
                                    </div>
                                    {(isMySubject || (currentTeacherId && exam.teacherId === currentTeacherId)) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (onEditPaper) {
                                            onEditPaper(paper.id);
                                          } else {
                                            onEdit(exam);
                                          }
                                        }}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-full transition-colors ml-2"
                                        title="Edit Paper"
                                      >
                                        <Icon name="edit" className="text-lg" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )})}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
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