import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  onClick?: () => void
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  onClick 
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all'
  
  const variants = {
    default: 'bg-surface-light dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-800',
    outline: 'border-2 border-primary/20 hover:border-primary/40',
    ghost: 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50',
  }

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}