"use client"

import React from 'react'
import { CheckCircle2, Award, User, Quote } from 'lucide-react'
import { ReportCardData } from './types'

interface RemarksSectionProps {
  data: ReportCardData
}

export default function RemarksSection({ data }: RemarksSectionProps) {
  const teacherRemark = data.classTeacherRemark || (
    data.averageScore >= 70
      ? `${data.studentName} has demonstrated admirable academic consistency and conceptual mastery this session. Excellent focus shown across examination papers.`
      : `${data.studentName} has successfully completed this evaluation cycle. Dedicated focus on foundational coursework will yield higher marks next term.`
  )

  const principalRemark = data.principalRemark || (
    data.averageScore >= 70
      ? `A highly commendable academic record. ${data.studentName} exemplifies the institutional standards of ${data.schoolName}.`
      : `Promising academic trajectory. Continuous parental encouragement and structured study schedules will ensure ongoing improvement.`
  )

  const behavioralSkills = [
    { name: 'Punctuality & Attendance', score: Math.min(5, Math.max(3, Math.round(data.attendanceRate / 20))) },
    { name: 'Classroom Participation', score: data.averageScore >= 75 ? 5 : 4 },
    { name: 'Homework & Assignment Diligence', score: data.averageScore >= 70 ? 5 : 4 },
    { name: 'Respect for Institutional Guidelines', score: 5 }
  ]

  return (
    <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Remarks Column */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-orange-500" />
            Official Faculty Remarks
          </h4>

          {/* Teacher Comment */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2 relative">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
              Form / Class Teacher&apos;s Appraisal
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              &ldquo;{teacherRemark}&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <User size={13} className="text-orange-500" />
              <span>Academic Form Master • Faculty Board</span>
            </div>
          </div>

          {/* Principal Comment */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2 relative">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Principal / Head of Institution
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              &ldquo;{principalRemark}&rdquo;
            </p>
            <div className="flex items-center gap-1.5 pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 size={13} />
              <span>Officially Endorsed by Principal&apos;s Office</span>
            </div>
          </div>
        </div>

        {/* Affective Domain & Promotion Status */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-orange-500" />
              Affective & Behavioral Assessment
            </h4>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {behavioralSkills.map((skill) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{skill.name}</span>
                    <span className="text-orange-600">{skill.score}/5</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(skill.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Institutional Verdict */}
          <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Academic Standing
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {data.promotionStatus || (data.averageScore >= 50 ? 'In Good Standing • Cleared for Advancement' : 'Requires Academic Consultation')}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase flex items-center gap-1.5 shadow-xs">
              <Award size={14} />
              <span>{data.standing}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
