import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  variant = 'default'
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  const variantClasses = {
    default: 'bg-card-light dark:bg-card-dark border border-[#e8ebf3] dark:border-gray-800 shadow-sm',
    outline: 'border-2 border-dashed border-gray-300 dark:border-gray-700',
  }

  return (
    <div className={`rounded-xl overflow-hidden ${variantClasses[variant]} ${className}`}>
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  )
}