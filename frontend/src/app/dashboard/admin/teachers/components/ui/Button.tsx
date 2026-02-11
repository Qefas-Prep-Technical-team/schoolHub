import { ButtonHTMLAttributes, ReactNode } from 'react'
import Icon from './Icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  icon?: string
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '',
  children,
  icon,
  ...props 
}: ButtonProps) {
  const baseStyles = 'flex items-center justify-center overflow-hidden rounded-lg font-bold leading-normal tracking-[0.015em] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-neutral-100 hover:bg-primary/90',
    secondary: 'bg-neutral-800 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-800 hover:opacity-90',
    ghost: 'bg-neutral-200 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-700'
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-4 text-base'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} className="text-lg" />}
      <span className="truncate">{children}</span>
    </button>
  )
}