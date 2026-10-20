"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, School, User, Sparkles, BookOpen } from 'lucide-react'
import { ExamDetailData } from './types'
import { ChildSummary } from '@/lib/api/services/parentService'

interface PageHeaderProps {
  data: ExamDetailData
  childrenList: ChildSummary[]
  selectedChildId: string
  onSelectChild: (id: string) => void
}

export default function PageHeader({
  data,
  childrenList,
  selectedChildId,
  onSelectChild,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          href="/dashboard/parent/exams&results"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group"
        >
          <div className="size-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center group-hover:border-orange-300 group-hover:bg-orange-50 dark:group-hover:bg-slate-700 shadow-xs transition-all">
            <ArrowLeft size={16} className="text-slate-500 group-hover:text-orange-600 dark:text-slate-300 dark:group-hover:text-orange-400 transition-colors" />
          </div>
          <span>Back to Exams & Results</span>
        </Link>

        {/* Child Switcher */}
        {childrenList.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-1.5 flex items-center shadow-xs">
            <div className="flex items-center gap-1.5 px-2 text-slate-400">
              <User size={14} className="text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Student
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <select
              value={selectedChildId}
              onChange={(e) => onSelectChild(e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer py-1 pr-7 pl-2"
            >
              {childrenList.map((child) => (
                <option key={child.id} value={child.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Title Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} />
                {data.category || 'EXAMINATION'}
              </span>

              {data.term && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg">
                  {data.term}
                </span>
              )}

              {data.papersCount > 0 && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <BookOpen size={11} />
                  {data.papersCount} {data.papersCount === 1 ? 'Paper' : 'Papers'}
                </span>
              )}

              <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 ml-auto md:ml-0 font-medium">
                <Calendar size={13} className="text-slate-400" />
                {data.date}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {data.title}
            </h1>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <User size={13} className="text-slate-400" />
                {data.studentName}
              </span>
              <span>•</span>
              <span>ID: <strong className="text-slate-700 dark:text-slate-300">{data.studentCode}</strong></span>
              {data.currentClass && (
                <>
                  <span>•</span>
                  <span>Class: <strong className="text-slate-700 dark:text-slate-300">{data.currentClass}</strong></span>
                </>
              )}
              {data.schoolName && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <School size={12} className="text-slate-400" />
                    {data.schoolName}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Summary Pill */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Overall Result
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
                {data.percentage}%
              </span>
              <span className="text-xs font-bold text-slate-400">
                ({data.score}/{data.totalScore})
              </span>
            </div>
            <div className="mt-1">
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                Grade {data.grade}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
