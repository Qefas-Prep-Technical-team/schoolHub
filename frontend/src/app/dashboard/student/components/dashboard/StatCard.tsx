'use client'

import { cn } from '@/lib/utils'
import { Icon } from './Icon'
import { AttendanceChart } from './AttendanceChart'

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
  secondaryValue?: string
  link?: string
  linkText?: string
  chartData?: number[]
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  color,
  secondaryValue,
  link,
  linkText,
  chartData,
  className
}: StatCardProps) {
  const hasChart = chartData && chartData.length > 0

  return (
    <div className={cn(
      "flex flex-col gap-4 rounded-xl p-6",
      "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50",
      className
    )}>
      <div className={cn(
        "flex items-start justify-between",
        hasChart ? "text-gray-500 dark:text-gray-400" : "items-center"
      )}>
        <div className="flex flex-col">
          <p className="text-base font-medium">{title}</p>
          <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
            {value}
          </p>
          {secondaryValue && (
            <p className="text-sm font-medium leading-normal mt-1">{secondaryValue}</p>
          )}
        </div>
        <Icon name={icon} className={cn("text-2xl", color)} />
      </div>

      {hasChart && (
        <AttendanceChart data={chartData} />
      )}

      {link && (
        <a
          href={link}
          className="text-primary text-sm font-medium hover:underline mt-auto"
        >
          {linkText || 'View Details'}
        </a>
      )}
    </div>
  )
}