import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  progress?: number
  trend?: string
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  progress,
  trend,
  className = '',
}: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    error: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
    info: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  }

  return (
    <div className={`bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </span>
            {trend && (
              <span className="text-xs font-medium text-emerald-500">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                color === 'primary' ? 'bg-primary' : 
                color === 'success' ? 'bg-emerald-500' :
                color === 'warning' ? 'bg-amber-500' :
                color === 'error' ? 'bg-rose-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}