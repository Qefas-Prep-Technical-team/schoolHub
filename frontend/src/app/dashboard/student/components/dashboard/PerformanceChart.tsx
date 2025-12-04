'use client'

import { cn } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PerformanceChartProps {
  data: Array<{
    date: string
    score: number
    average: number
  }>
  className?: string
}

export function PerformanceChart({ data, className }: PerformanceChartProps) {
  return (
    <div className={cn("rounded-xl p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700", className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Performance Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Your Score"
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Class Average"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}