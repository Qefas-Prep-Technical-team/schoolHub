interface AvailabilityIndicatorProps {
  message: string
  style?: React.CSSProperties
}

export default function AvailabilityIndicator({ message, style }: AvailabilityIndicatorProps) {
  return (
    <div 
      className="absolute w-full bg-red-500/10 dark:bg-red-500/20"
      style={style}
    >
      <div className="h-full p-2 flex items-center justify-center">
        <p className="text-xs text-red-500 dark:text-red-400 font-medium">{message}</p>
      </div>
    </div>
  )
}