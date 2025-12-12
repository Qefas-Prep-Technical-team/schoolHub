interface ProgressBarProps {
  value: number
  color?: 'primary' | 'green' | 'yellow' | 'red'
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  color = 'primary',
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const colorClasses = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
  }

  return (
    <div className="space-y-1">
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-sec-light dark:text-text-sec-dark">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
    </div>
  )
}