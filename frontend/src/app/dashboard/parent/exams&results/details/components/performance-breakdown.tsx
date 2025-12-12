"use client"

interface PerformanceMetric {
  category: string
  score: string
  percentage: number
  color: string
}

export default function PerformanceBreakdown() {
  const metrics: PerformanceMetric[] = [
    {
      category: 'Multiple Choice',
      score: '20/20',
      percentage: 100,
      color: 'bg-green-500'
    },
    {
      category: 'Theory / Written',
      score: '45/60',
      percentage: 75,
      color: 'bg-primary'
    },
    {
      category: 'Practical Application',
      score: '20/20',
      percentage: 100,
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Performance Breakdown
      </h3>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {metric.category}
              </span>
              <span className="text-gray-900 dark:text-white font-bold">
                {metric.score}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${metric.color}`}
                style={{ width: `${metric.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}