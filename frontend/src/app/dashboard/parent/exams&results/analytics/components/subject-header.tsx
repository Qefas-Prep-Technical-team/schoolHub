"use client"

import React from 'react'
import { BookOpen, User, School, TrendingUp, Sparkles, Filter } from 'lucide-react'
import { SubjectAnalyticsData } from './types'

interface SubjectHeaderProps {
  data: SubjectAnalyticsData
  onSelectSubject: (subject: string) => void
}

export default function SubjectHeader({ data, onSelectSubject }: SubjectHeaderProps) {
  const isAll = data.subjectName === 'All Subjects' || data.subjectName === 'All'

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon and Subject Meta */}
        <div className="flex items-start gap-4">
          <div className="size-14 sm:size-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            {isAll ? <Sparkles size={28} /> : <BookOpen size={28} />}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                {isAll ? 'Curriculum Overview' : 'Subject Analytics'}
              </span>

              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                <TrendingUp size={12} />
                {data.averageScore >= 70 ? 'On Track' : data.averageScore >= 50 ? 'Developing' : 'Needs Focus'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {data.subjectName}
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
        </div>

        {/* Right: Subject Filter Dropdown */}
        {data.allSubjects.length > 0 && (
          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6 shrink-0 gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Filter size={11} />
              Filter Subject
            </span>
            <select
              value={data.subjectName}
              onChange={(e) => onSelectSubject(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer shadow-xs"
            >
              <option value="All Subjects">All Curriculum Subjects</option>
              {data.allSubjects.map((sub) => (
                <option key={sub} value={sub} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
