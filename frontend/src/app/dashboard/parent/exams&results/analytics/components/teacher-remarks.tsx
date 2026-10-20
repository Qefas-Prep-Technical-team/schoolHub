"use client"

import React from 'react'
import Link from 'next/link'
import { MessageSquare, User, CheckCircle2 } from 'lucide-react'
import { SubjectAnalyticsData } from './types'

interface TeacherRemarksProps {
  data: SubjectAnalyticsData
}

export default function TeacherRemarks({ data }: TeacherRemarksProps) {
  const note = data.teacherNote || {
    teacherName: 'Academic Evaluation Faculty',
    subject: data.subjectName,
    note: data.averageScore >= 70
      ? `${data.studentName} is sustaining excellent conceptual comprehension and engagement in ${data.subjectName}. Continue reinforcing homework problem sets and practical exercises.`
      : `${data.studentName} has made steady attempts in ${data.subjectName}. Consistent weekly revision of foundational principles is advised to lift overall assessment scores.`
  }

  return (
    <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/40 dark:from-slate-800 dark:to-slate-800/80 p-5 sm:p-6 rounded-2xl border border-orange-200/60 dark:border-slate-700 shadow-xs relative overflow-hidden space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          Teacher&apos;s Evaluation Note
        </h3>
        <span className="text-[10px] font-bold text-orange-600 bg-orange-100/70 dark:bg-orange-950/60 px-2 py-0.5 rounded-md uppercase">
          Faculty
        </span>
      </div>
      
      <div className="relative pl-3 border-l-2 border-orange-400 dark:border-orange-500">
        <p className="text-xs sm:text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">
          &ldquo;{note.note}&rdquo;
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-orange-200/40 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shrink-0">
            <User size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {note.teacherName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {note.subject}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/parent/attendance"
          className="p-2 bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 text-orange-600 dark:text-orange-400 rounded-xl transition-colors shadow-xs shrink-0"
          title="Parent Communication & Records"
        >
          <MessageSquare size={16} />
        </Link>
      </div>
    </div>
  )
}
