"use client"

import React, { useState } from 'react'
import { TrendingUp, BarChart2, Calendar } from 'lucide-react'
import { SubjectAnalyticsData } from './types'

interface PerformanceChartProps {
  data: SubjectAnalyticsData
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const trendPoints = data.trendData || []

  // If insufficient trend data is logged yet
  if (trendPoints.length < 2) {
    return (
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Performance Progression
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {trendPoints.length} Record Logged
          </span>
        </div>

        <div className="h-56 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
          <div className="size-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
            <BarChart2 size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            More Longitudinal Data Needed
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            As subject teachers publish subsequent test scores and terminal papers, a continuous multi-period trajectory graph will map here automatically.
          </p>
        </div>
      </div>
    )
  }

  const maxScore = 100
  const height = 100

  const scoreToY = (score: number) => {
    return ((maxScore - Math.min(100, Math.max(0, score))) / maxScore) * (height - 25) + 12
  }

  const studentPoints = trendPoints.map((pt, i) => {
    const x = (i / (trendPoints.length - 1)) * 400
    const y = scoreToY(pt.score)
    return { x, y, ...pt }
  })

  const classPoints = trendPoints.map((pt, i) => {
    const x = (i / (trendPoints.length - 1)) * 400
    const y = scoreToY(pt.classAverage)
    return { x, y, ...pt }
  })

  const studentPath = studentPoints
    .map((pt, i) => (i === 0 ? `M${pt.x},${pt.y}` : `L${pt.x},${pt.y}`))
    .join(' ')

  const classPath = classPoints
    .map((pt, i) => (i === 0 ? `M${pt.x},${pt.y}` : `L${pt.x},${pt.y}`))
    .join(' ')

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Performance Progression
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Score history across evaluation sessions
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="size-2.5 rounded-full bg-orange-500" />
            <span>{data.studentName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>Cohort Avg ({data.classAverage}%)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative h-60 w-full pt-2">
        {/* Horizontal Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-bold text-slate-400 dark:text-slate-600">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="flex items-center gap-2 w-full border-b border-slate-100 dark:border-slate-800/80">
              <span className="w-5 text-right">{val}%</span>
              <div className="flex-1" />
            </div>
          ))}
        </div>

        {/* Scaled SVG Canvas */}
        <svg
          className="absolute inset-0 h-full w-full pl-7 pr-2"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="parentAnalyticsOrangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d={`${studentPath} L400,100 L0,100 Z`}
            fill="url(#parentAnalyticsOrangeGradient)"
          />

          {/* Class Average Line (Dashed) */}
          <path
            d={classPath}
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeDasharray="4 4"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Student Trend Line */}
          <path
            d={studentPath}
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />

          {/* Interactive Plot Nodes */}
          {studentPoints.map((pt, i) => {
            const isHovered = hoveredIndex === i
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 3.5}
                  fill="#f97316"
                  className="transition-all"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            )
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredIndex !== null && studentPoints[hoveredIndex] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs rounded-xl px-3 py-1.5 shadow-lg border border-slate-700 pointer-events-none flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">
                {studentPoints[hoveredIndex].label}
              </span>
              <span className="font-black text-orange-400">
                {studentPoints[hoveredIndex].score}%
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 block">Class Avg</span>
              <span className="font-bold text-slate-300">
                {studentPoints[hoveredIndex].classAverage}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between pl-7 pr-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
        {trendPoints.map((pt, i) => (
          <span key={i} className="truncate max-w-[70px] text-center">
            {pt.label}
          </span>
        ))}
      </div>
    </div>
  )
}
