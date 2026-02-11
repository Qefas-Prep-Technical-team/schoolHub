"use client"

import Link from "next/link"

interface KPICard {
  title: string
  value: string
  subValue?: string
  description?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  progress?: number
  grade?: string
  hasBackgroundIcon?: boolean
}

export default function KPICards() {
  const kpis: KPICard[] = [
    {
      title: 'Score',
      value: '85',
      subValue: '/ 100',
      grade: 'Grade A',
      trend: { value: '+5% vs last', isPositive: true },
      hasBackgroundIcon: true
    },
    {
      title: 'Class Average',
      value: '72',
      subValue: '%',
      progress: 72
    },
    {
      title: 'Highest Score',
      value: '98',
      subValue: '/ 100',
      description: 'Excellent benchmark'
    },
    {
      title: 'Position',
      value: '5th',
      subValue: '/ 24',
      description: 'Top 20% of class'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Link
        href={"/dashboard/parent/exams&results/analytics"}
          key={index}
          className={`bg-surface-light dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between relative overflow-hidden ${
            kpi.hasBackgroundIcon ? 'group' : ''
          } ${index === 3 ? 'relative' : ''}`}
        >
          {/* Background Icon for first card */}
          {kpi.hasBackgroundIcon && (
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">
                school
              </span>
            </div>
          )}

          {/* Yellow glow for position card */}
          {index === 3 && (
            <div className="absolute -right-6 -top-6 bg-yellow-400/10 size-24 rounded-full blur-xl"></div>
          )}

          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
            {kpi.title}
          </p>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {kpi.value}
            </span>
            {kpi.subValue && (
              <span className="text-gray-400 text-sm">{kpi.subValue}</span>
            )}
          </div>

          {/* Additional Info */}
          {kpi.grade && (
            <div className="mt-4 flex items-center gap-2">
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-2.5 py-1 rounded-md">
                {kpi.grade}
              </span>
              {kpi.trend && (
                <span className={`text-xs ${
                  kpi.trend.isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                } flex items-center font-medium`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {kpi.trend.isPositive ? 'trending_up' : 'trending_down'}
                  </span>
                  {kpi.trend.value}
                </span>
              )}
            </div>
          )}

          {/* Progress bar */}
          {kpi.progress !== undefined && (
            <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  index === 1 ? 'bg-gray-400' : 'bg-primary'
                }`}
                style={{ width: `${kpi.progress}%` }}
              ></div>
            </div>
          )}

          {/* Description */}
          {kpi.description && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {kpi.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}