"use client"

interface ComparisonItem {
  category: string
  studentScore: number
  classAverage: number
  status: string
  statusColor: string
  barColor: string
}

export default function ComparisonChart() {
  const comparisons: ComparisonItem[] = [
    {
      category: 'Quizzes',
      studentScore: 85,
      classAverage: 70,
      status: 'Above Avg',
      statusColor: 'text-slate-900 dark:text-white',
      barColor: 'bg-primary/80'
    },
    {
      category: 'Exams',
      studentScore: 92,
      classAverage: 65,
      status: 'Excellent',
      statusColor: 'text-slate-900 dark:text-white',
      barColor: 'bg-primary'
    },
    {
      category: 'Homework',
      studentScore: 72,
      classAverage: 80,
      status: 'Needs Focus',
      statusColor: 'text-orange-500',
      barColor: 'bg-orange-400'
    }
  ]

  return (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Vs. Class Average
      </h3>
      <div className="space-y-5">
        {comparisons.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.category}
              </span>
              <span className={`font-bold ${item.statusColor}`}>
                {item.status}
              </span>
            </div>
            <div className="h-8 flex w-full bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
              {/* Marker for Class Avg */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10 opacity-50"
                style={{ left: `${item.classAverage}%` }}
              ></div>
              {/* Bar */}
              <div
                className={`h-full bar-animate ${item.barColor}`}
                style={{
                  width: `${item.studentScore}%`,
                  animationDelay: `${index * 0.2}s`
                }}
              ></div>
              <span className={`absolute right-2 top-1.5 text-xs font-bold ${
                item.barColor.includes('primary') && item.studentScore > 90
                  ? 'text-white'
                  : 'text-slate-500'
              }`}>
                {item.studentScore}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">
              Avg: {item.classAverage}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}