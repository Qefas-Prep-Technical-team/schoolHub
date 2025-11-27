interface BadgeProps {
  variant: 'active' | 'inactive'
  children: string
}

export default function Badge({ variant, children }: BadgeProps) {
  const styles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}