'use client'


import { cn } from '@/lib/utils'
import { GradeStatistics as GradeStatisticsT, StudentGrade } from './types'
import { calculateClassAverage } from './gradeUtils'
import { Icon } from '../../Icon'
import { getGradeEvaluation, getGradeColorAndBg, type GradingTier } from '@/utils/gradingSystem'

interface GradeStatisticsProps {
  grades: StudentGrade[]
  className?: string
  gradingSystem?: GradingTier[]
}

export function GradeStatistics({ grades, className, gradingSystem }: GradeStatisticsProps) {
  const gradedGrades = grades.filter(g => g.status === 'graded')
  const stats: GradeStatisticsT = {
    averageScore: calculateClassAverage(gradedGrades),
    highestScore: gradedGrades.length > 0 
      ? Math.max(...gradedGrades.map(g => g.grades.total))
      : 0,
    lowestScore: gradedGrades.length > 0 
      ? Math.min(...gradedGrades.map(g => g.grades.total))
      : 0,
    passingRate: gradedGrades.length > 0
      ? Math.round((gradedGrades.filter(g => {
          const evalRes = getGradeEvaluation(g.grades.total, gradingSystem)
          return evalRes.grade !== 'F' && evalRes.grade !== 'F9'
        }).length / gradedGrades.length) * 100)
      : 0,
    gradeDistribution: calculateGradeDistribution(gradedGrades, gradingSystem)
  }

  const getScoreColors = (score: number) => {
    const evalRes = getGradeEvaluation(score, gradingSystem)
    const styling = getGradeColorAndBg(evalRes.grade)
    return {
      color: styling.color,
      bgColor: styling.bg.split(' ')[0] || 'bg-slate-50 dark:bg-slate-800'
    }
  };

  const statCards = [
    {
      label: 'Class Average',
      value: `${stats.averageScore}%`,
      icon: 'bar_chart_3',
      color: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-500/20',
      trend: '+2.5%',
    },
    {
      label: 'Highest Score',
      value: `${stats.highestScore}%`,
      icon: 'trending_up',
      color: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20',
    },
    {
      label: 'Lowest Score',
      value: `${stats.lowestScore}%`,
      icon: 'trending_down',
      color: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20',
    },
    {
      label: 'Passing Rate',
      value: `${stats.passingRate}%`,
      icon: 'check_circle',
      color: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-500/20',
    },
  ]

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6", className)}>
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                {stat.label}
              </p>
              {'trend' in stat && stat.trend && (
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span>{stat.trend as string}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">from last term</span>
                </div>
              )}
            </div>
            <div className={cn(
              "size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105",
              stat.iconBg
            )}>
              <Icon
                name={stat.icon}
                className="size-5"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

import { getEffectiveGradingSystem } from '@/utils/gradingSystem'

function calculateGradeDistribution(grades: StudentGrade[], gradingSystem?: GradingTier[]): Record<string, number> {
  const tiers = getEffectiveGradingSystem(gradingSystem)
  const distribution: Record<string, number> = {}
  tiers.forEach(t => {
    distribution[t.grade] = 0
  })
  
  grades.forEach(grade => {
    const evalRes = getGradeEvaluation(grade.grades.total, gradingSystem)
    if (distribution[evalRes.grade] !== undefined) {
      distribution[evalRes.grade]++
    } else {
      distribution[evalRes.grade] = 1
    }
  })
  
  return distribution
}