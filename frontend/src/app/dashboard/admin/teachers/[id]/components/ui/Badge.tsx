interface BadgeProps {
  variant: 'active' | 'inactive'
  children: string
}

export default function Badge({ variant, children }: BadgeProps) {
  const styles = {
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    inactive: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  }
  
  return (
    <div className={`flex items-center justify-center gap-1 rounded-full border-2 border-white dark:border-gray-900 px-2.5 py-1 text-xs font-medium ${styles[variant]}`}>
      <div className={`size-2 rounded-full ${variant === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span>{children}</span>
    </div>
  )
}