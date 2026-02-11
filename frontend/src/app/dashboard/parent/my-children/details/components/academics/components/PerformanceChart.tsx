'use client'

const dataPoints = [
  { label: 'Aug', value: 60, title: 'Quiz 1: 60%' },
  { label: 'Sep', value: 75, title: 'Quiz 2: 75%' },
  { label: 'Oct', value: 90, title: 'Mid-term: 90%' },
  { label: 'Nov', value: 85, title: 'Quiz 3: 85%' },
  { label: 'Dec', value: 95, title: 'Final Project: 95%' },
]

export default function PerformanceChart() {
  const maxValue = Math.max(...dataPoints.map(d => d.value))

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
        Performance Trend
      </h4>
      
      <div className="bg-background-light dark:bg-background-dark rounded-xl p-4 h-48 relative flex items-end justify-between gap-2">
        {/* Mock Chart Bars */}
        {dataPoints.map((point, index) => (
          <div
            key={index}
            className="w-full bg-primary/20 rounded-t-sm relative group"
            title={point.title}
            style={{ height: `${(point.value / maxValue) * 100}%` }}
          >
            <div
              className="absolute bottom-0 w-full bg-primary rounded-t-sm"
              style={{ height: `${(point.value / maxValue) * 100}%` }}
            ></div>
          </div>
        ))}

        {/* X Axis Labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-text-secondary-light dark:text-text-secondary-dark px-1">
          {dataPoints.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark mt-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span>Alex&apos;s Score</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary/30"></div>
          <span>Class Avg</span>
        </div>
      </div>
    </div>
  )
}