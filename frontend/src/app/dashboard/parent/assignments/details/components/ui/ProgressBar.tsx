interface ProgressBarProps {
  value: number
  color?: 'emerald' | 'yellow' | 'red' | 'blue'
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  color = 'emerald',
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  }

  return (
    <div className="space-y-1">
      <div className={`w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden ${className}`}>
        <div
          className={`h-full rounded-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
    </div>
  )
}