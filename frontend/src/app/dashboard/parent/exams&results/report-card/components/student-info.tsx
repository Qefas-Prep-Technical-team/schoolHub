"use client"

import React from 'react'
import Image from 'next/image'
import { User, Award, CheckCircle2, TrendingUp, Calendar, BookOpen } from 'lucide-react'
import { ReportCardData } from './types'

interface StudentInfoProps {
  data: ReportCardData
}

export default function StudentInfo({ data }: StudentInfoProps) {
  return (
    <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
        {/* Student Profile Identity */}
        <div className="flex items-center gap-4">
          {data.studentImage ? (
            <div className="relative size-18 sm:size-20 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0 shadow-xs">
              <Image
                src={data.studentImage}
                alt={data.studentName}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="size-18 sm:size-20 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-200 dark:border-orange-800/40 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shrink-0 shadow-xs">
              <User size={36} />
            </div>
          )}

          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Student Record
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
              {data.studentName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Student ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{data.studentCode}</span>
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 rounded-md">
                {data.currentClass || 'General Class'}
              </span>
              <span className="px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-[11px] font-bold text-orange-600 dark:text-orange-400 rounded-md border border-orange-500/20">
                {data.session}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Academic Metric Highlights */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* 1. Average Score */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Average Score
              </span>
              <Award size={16} className="text-orange-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {data.averageScore}%
              </span>
              <span className="text-xs font-bold text-orange-600">
                Grade {data.overallGrade}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>{data.standing}</span>
            </p>
          </div>

          {/* 2. Evaluated Subjects */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Curriculum Load
              </span>
              <BookOpen size={16} className="text-orange-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {data.totalSubjects}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Subjects
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              100% Evaluated & Released
            </p>
          </div>

          {/* 3. Attendance */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Term Attendance
              </span>
              <Calendar size={16} className="text-orange-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {data.attendanceRate}%
              </span>
              <span className="text-xs font-bold text-emerald-600">
                Present
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>Regular Attendance</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
