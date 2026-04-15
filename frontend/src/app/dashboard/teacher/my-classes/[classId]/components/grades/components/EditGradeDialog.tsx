/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { StudentGrade } from './types'

interface EditGradeDialogProps {
  grade: StudentGrade
  onSave: (updatedGrade: StudentGrade) => void
  onClose: () => void
  open: boolean
}

export function EditGradeDialog({
  grade,
  onSave,
  onClose,
  open
}: EditGradeDialogProps) {
  const [continuousScore, setContinuousScore] = useState(
    grade.grades.continuousAssessment.score?.toString() || ''
  )
  const [examScore, setExamScore] = useState(
    grade.grades.exams.score?.toString() || ''
  )
  const [notes, setNotes] = useState(grade.notes || '')
  const [status, setStatus] = useState(grade.status)

  const continuousTotal = grade.grades.continuousAssessment.total
  const examTotal = grade.grades.exams.total

  const handleSave = () => {
    const updatedGrade: StudentGrade = {
      ...grade,
      grades: {
        continuousAssessment: {
          score: continuousScore ? parseFloat(continuousScore) : undefined,
          total: continuousTotal
        },
        exams: {
          score: examScore ? parseFloat(examScore) : undefined,
          total: examTotal
        },
        total: calculateTotalPercentage()
      },
      status,
      notes,
      lastUpdated: new Date()
    }
    onSave(updatedGrade)
  }

  const calculateTotalPercentage = (): number => {
    const continuous = continuousScore ? parseFloat(continuousScore) : 0
    const exam = examScore ? parseFloat(examScore) : 0
    const totalPossible = continuousTotal + examTotal
    if (totalPossible === 0) return 0
    return Math.round(((continuous + exam) / totalPossible) * 10000) / 100
  }

  const totalPercentage = calculateTotalPercentage()

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Grade - {grade.studentName}
          </Dialog.Title>
          
          <div className="mt-6 space-y-4">
            {/* Continuous Assessment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Continuous Assessment (Max: {continuousTotal})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={continuousTotal}
                  value={continuousScore}
                  onChange={(e) => setContinuousScore(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter score"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  / {continuousTotal}
                </span>
              </div>
            </div>

            {/* Exams */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exams (Max: {examTotal})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={examTotal}
                  value={examScore}
                  onChange={(e) => setExamScore(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter score"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  / {examTotal}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Percentage
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  totalPercentage >= 90 ? "text-green-600 dark:text-green-400" :
                  totalPercentage >= 70 ? "text-blue-600 dark:text-blue-400" :
                  totalPercentage >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                  "text-red-600 dark:text-red-400"
                )}>
                  {totalPercentage}%
                </span>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="graded">Graded</option>
                <option value="pending">Pending</option>
                <option value="missing">Missing</option>
                <option value="excused">Excused</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Add any notes about this grade..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}