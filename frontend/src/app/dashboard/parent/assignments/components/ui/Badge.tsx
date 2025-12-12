import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
  withBorder?: boolean
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  className = '',
  withBorder = true 
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const variantClasses = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  const borderClasses = {
    default: 'border border-slate-200 dark:border-slate-700',
    primary: 'border border-primary/20',
    success: 'border border-green-200 dark:border-green-800',
    warning: 'border border-orange-200 dark:border-orange-800',
    error: 'border border-red-200 dark:border-red-800',
  }

  return (
    <span className={`
      inline-flex items-center justify-center rounded-full font-bold
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${withBorder ? borderClasses[variant] : ''}
      ${className}
    `}>
      {children}
    </span>
  )
}