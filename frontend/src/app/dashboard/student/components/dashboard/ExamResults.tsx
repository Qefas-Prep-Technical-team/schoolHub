'use client'

import { cn } from "@/lib/utils"
import { calculatePercentage, getSubjectColor } from "./dashboardUtils"
import { ExamResult } from "./types"
import { Icon } from "./Icon"



interface ExamResultsProps {
  results: ExamResult[]
  title?: string
  viewAllLink?: string
  className?: string
}

export function ExamResults({
  results,
  title = 'Latest Exam Results',
  viewAllLink,
  className
}: ExamResultsProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </a>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        {results.map((result) => {
          const percentage = calculatePercentage(result.score, result.total)
          const isAboveAverage = percentage > result.average
          
          return (
            <div
              key={result.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            >
              <span className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-sm font-medium",
                getSubjectColor(result.subject)
              )}>
                {result.subject}
              </span>
              
              <p className="flex-grow font-semibold text-gray-800 dark:text-gray-100">
                {result.title}
              </p>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Class Avg: {result.average}%
              </p>
              
              <div className="flex items-center gap-2">
                <p className={cn(
                  "font-bold text-lg",
                  isAboveAverage
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}>
                  {result.score}/{result.total}
                </p>
                <Icon
                  name={result.trend === 'up' ? 'trending_up' : 'trending_down'}
                  className={cn(
                    isAboveAverage
                      ? "text-green-500"
                      : "text-red-500"
                  )}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}