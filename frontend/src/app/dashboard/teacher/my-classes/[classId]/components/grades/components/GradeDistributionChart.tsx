'use client'
import { cn } from '@/lib/utils'

interface GradeDistributionChartProps {
  distribution: Record<string, number>
  className?: string
}

export function GradeDistributionChart({ distribution, className }: GradeDistributionChartProps) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...Object.values(distribution))
  
  const colors = {
    A: 'bg-green-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
    D: 'bg-orange-500',
    F: 'bg-red-500',
  }

  return (
    <div className={cn("rounded-xl border border-gray-200 dark:border-gray-800 p-4", className)}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Grade Distribution
      </h3>
      <div className="space-y-3">
        {Object.entries(distribution).map(([grade, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
          
          return (
            <div key={grade} className="flex items-center">
              <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                {grade}
              </div>
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    {count} student{count !== 1 ? 's' : ''}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", colors[grade as keyof typeof colors])}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}