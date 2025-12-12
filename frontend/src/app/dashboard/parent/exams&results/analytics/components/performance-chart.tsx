"use client"

import { useState } from 'react'

interface DataPoint {
  month: string
  studentScore: number
  classAverage: number
}

export default function PerformanceChart() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const data: DataPoint[] = [
    { month: 'Sep', studentScore: 60, classAverage: 55 },
    { month: 'Oct', studentScore: 70, classAverage: 60 },
    { month: 'Nov', studentScore: 65, classAverage: 58 },
    { month: 'Dec', studentScore: 85, classAverage: 65 },
    { month: 'Jan', studentScore: 88, classAverage: 62 },
  ]

  const maxScore = 100
  const height = 64

  // Convert score to y coordinate (inverted)
  const scoreToY = (score: number) => {
    return ((maxScore - score) / maxScore) * (height - 20) + 10
  }

  // Generate path for student line
  const generateStudentPath = () => {
    const points = data.map((point, i) => {
      const x = (i / (data.length - 1)) * 400
      const y = scoreToY(point.studentScore)
      return i === 0 ? `M0,${y}` : `L${x},${y}`
    })
    return points.join(' ')
  }

  // Generate path for class average line
  const generateClassPath = () => {
    const points = data.map((point, i) => {
      const x = (i / (data.length - 1)) * 400
      const y = scoreToY(point.classAverage)
      return i === 0 ? `M0,${y}` : `L${x},${y}`
    })
    return points.join(' ')
  }

  return (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Performance Trend
        </h3>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary"></span>
            Sarah
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            Class Avg
          </div>
        </div>
      </div>

      {/* CSS Chart Container */}
      <div className="relative h-64 w-full">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400">
          {[100, 75, 50, 25, 0].map((value) => (
            <div
              key={value}
              className="flex w-full border-b border-slate-100 dark:border-slate-700/50 pb-1"
            >
              <span>{value}</span>
            </div>
          ))}
        </div>

        {/* SVG Chart */}
        <svg
          className="absolute inset-0 h-full w-full pt-2 pb-6 pl-6"
          preserveAspectRatio="none"
          viewBox="0 0 400 100"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Gradient for area fill */}
          <defs>
            <linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3670e2" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3670e2" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area under student line */}
          <path
            d={`${generateStudentPath()} L400,100 L0,100 Z`}
            fill="url(#gradientArea)"
          />

          {/* Class Average Line */}
          <path
            d={generateClassPath()}
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-600"
            strokeDasharray="4 4"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Student Line */}
          <path
            d={generateStudentPath()}
            fill="none"
            stroke="#3670e2"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data Points */}
          {data.map((point, i) => {
            const x = (i / (data.length - 1)) * 400
            const y = scoreToY(point.studentScore)
            const isHovered = hoveredPoint === i

            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3}
                fill="#3670e2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {isHovered && (
                  <title>
                    {point.month}: {point.studentScore}% (Class Avg: {point.classAverage}%)
                  </title>
                )}
              </circle>
            )
          })}
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between pl-6 text-xs text-slate-500 font-medium mt-2">
        {data.map((point) => (
          <span key={point.month}>{point.month}</span>
        ))}
      </div>
    </div>
  )
}