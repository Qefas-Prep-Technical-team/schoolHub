"use client"

import React from 'react'
import { MessageSquareQuote, CheckCircle2, User } from 'lucide-react'
import { ExamDetailData } from './types'

interface TeacherNoteProps {
  data: ExamDetailData
}

export default function TeacherNote({ data }: TeacherNoteProps) {
  const teacherNote = data.teacherNote || {
    teacherName: 'Academic Examination Committee',
    subject: 'Official Verification',
    note: data.percentage >= 70
      ? `${data.studentName} has demonstrated strong academic understanding and diligent execution during this assessment session. Continue encouraging consistent study habits.`
      : `${data.studentName} has completed this assessment. We recommend dedicating focused revision time to the flagged concepts to ensure continuous progress.`
  }

  return (
    <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/40 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-4 sm:p-5 border border-orange-200/60 dark:border-slate-700 shadow-xs">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 font-bold">
          <User size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
            {teacherNote.teacherName}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {teacherNote.subject || 'Faculty Evaluation'}
          </p>
        </div>
      </div>

      <div className="relative pl-3 border-l-2 border-orange-400 dark:border-orange-500">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
          &ldquo;{teacherNote.note}&rdquo;
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 size={12} />
        <span>Verified Academic Record</span>
      </div>
    </div>
  )
}
