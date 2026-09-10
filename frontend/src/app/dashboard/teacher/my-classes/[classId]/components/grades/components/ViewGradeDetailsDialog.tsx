import { StudentGrade, IndividualGrade } from './types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getGradeStatusColor, calculateLetterGrade, getLetterGradeColor, getLetterGradeBgColor } from './gradeUtils'
import { cn } from '@/lib/utils'

interface ViewGradeDetailsDialogProps {
  grade: StudentGrade
  item?: IndividualGrade
  open: boolean
  onClose: () => void
}

export function ViewGradeDetailsDialog({ grade, item, open, onClose }: ViewGradeDetailsDialogProps) {
  if (!grade) return null

  const isIndividual = !!item
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Grade Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Student Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            {grade.avatar ? (
              <img src={grade.avatar} alt={grade.studentName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-lg">
                {grade.studentName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{grade.studentName}</h3>
              <p className="text-sm text-gray-500">Student ID: {grade.studentId}</p>
            </div>
          </div>

          {isIndividual ? (
            /* Individual Grade Info */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{item.type || item.category}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Subject</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.subject || '-'}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Assessment Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.assessmentName || '-'}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Paper</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.paper || item.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={cn("font-semibold text-lg", item.score !== undefined ? getLetterGradeColor(calculateLetterGrade(Math.round((item.score / item.maxMarks) * 100))) : "text-gray-400")}>
                      {item.score !== undefined ? `${item.score} / ${item.maxMarks}` : '-'}
                    </p>
                    {item.score !== undefined && (
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold", 
                        getLetterGradeColor(calculateLetterGrade(Math.round((item.score / item.maxMarks) * 100))),
                        getLetterGradeBgColor(calculateLetterGrade(Math.round((item.score / item.maxMarks) * 100)))
                      )}>
                        {calculateLetterGrade(Math.round((item.score / item.maxMarks) * 100))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Status</p>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1",
                    getGradeStatusColor(item.status as any)
                  )}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Timeline</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Taken/Submitted On:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Created On:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Overall Grade Info */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1 font-medium">Total Score</p>
                  <p className="text-3xl font-bold text-emerald-600">{grade.grades.total}%</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1 font-medium">Overall Status</p>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mt-2",
                    getGradeStatusColor(grade.status)
                  )}>
                    {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                  </span>
                </div>
              </div>

              {grade.notes && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Teacher Notes</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{grade.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
