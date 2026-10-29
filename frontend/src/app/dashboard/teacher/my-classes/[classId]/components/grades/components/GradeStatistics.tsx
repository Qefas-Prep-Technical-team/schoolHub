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
      ...getScoreColors(stats.averageScore),
      trend: '+2.5%',
    },
    {
      label: 'Highest Score',
      value: `${stats.highestScore}%`,
      icon: 'trending_up',
      ...getScoreColors(stats.highestScore),
    },
    {
      label: 'Lowest Score',
      value: `${stats.lowestScore}%`,
      icon: 'trending_down',
      ...getScoreColors(stats.lowestScore),
    },
    {
      label: 'Passing Rate',
      value: `${stats.passingRate}%`,
      icon: 'check_circle',
      ...getScoreColors(stats.passingRate),
    },
  ]

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", className)}>
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "rounded-xl p-4 border border-gray-200 dark:border-gray-800",
            stat.bgColor
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
              {'trend' in stat && stat.trend && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stat.trend as string} from last term
                </p>
              )}
            </div>
            <div className={cn(
              "p-2 rounded-lg",
              stat.bgColor.replace('bg-', 'bg-').replace('/20', '/30')
            )}>
              <Icon
                name={stat.icon}
                className={cn("h-5 w-5", stat.color)}
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