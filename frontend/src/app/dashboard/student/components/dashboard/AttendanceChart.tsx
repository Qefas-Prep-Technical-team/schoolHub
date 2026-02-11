'use client'

import { cn } from '@/lib/utils'

interface AttendanceChartProps {
  data: number[]
  className?: string
}

export function AttendanceChart({ data, className }: AttendanceChartProps) {
  const days = ['M', 'T', 'W', 'T', 'F']
  const maxHeight = Math.max(...data)

  return (
    <div className={cn("flex items-end justify-between gap-2 h-10", className)}>
      {data.map((value, index) => {
        const height = maxHeight > 0 ? (value / maxHeight) * 100 : 0
        const isLow = value < 50
        
        return (
          <div
            key={index}
            className="flex-1 h-full flex flex-col justify-end items-center gap-1"
          >
            <div
              className={cn(
                "w-full rounded-full transition-all duration-300",
                isLow
                  ? "bg-red-100 dark:bg-red-900/50"
                  : "bg-green-100 dark:bg-green-900/50"
              )}
              style={{ height: `${height}%` }}
            />
            <p className="text-xs text-gray-400">{days[index]}</p>
          </div>
        )
      })}
    </div>
  )
}