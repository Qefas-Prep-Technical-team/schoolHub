'use client'


import { cn } from '@/lib/utils'
import { GradeStatistics as GradeStatisticsT, StudentGrade } from './types'
import { calculateClassAverage } from './gradeUtils'
import { Icon } from '../../Icon'


interface GradeStatisticsProps {
  grades: StudentGrade[]
  className?: string
}

export function GradeStatistics({ grades, className }: GradeStatisticsProps) {
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
      ? Math.round((gradedGrades.filter(g => g.grades.total >= 60).length / gradedGrades.length) * 100)
      : 0,
    gradeDistribution: calculateGradeDistribution(gradedGrades)
  }

  const statCards = [
    {
      label: 'Class Average',
      value: `${stats.averageScore}%`,
      icon: 'bar_chart_3',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      trend: '+2.5%',
    },
    {
      label: 'Highest Score',
      value: `${stats.highestScore}%`,
      icon: 'trending_up',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Lowest Score',
      value: `${stats.lowestScore}%`,
      icon: 'trending_down',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Passing Rate',
      value: `${stats.passingRate}%`,
      icon: 'check_circle',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
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
              {stat.trend && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stat.trend} from last term
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

function calculateGradeDistribution(grades: StudentGrade[]): Record<string, number> {
  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 }
  
  grades.forEach(grade => {
    const percentage = grade.grades.total
    if (percentage >= 90) distribution.A++
    else if (percentage >= 80) distribution.B++
    else if (percentage >= 70) distribution.C++
    else if (percentage >= 60) distribution.D++
    else distribution.F++
  })
  
  return distribution
}