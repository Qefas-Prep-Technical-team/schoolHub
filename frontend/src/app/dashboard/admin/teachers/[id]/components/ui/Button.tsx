import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  children: ReactNode
  icon?: string
}

export default function Button({ 
  variant = 'secondary', 
  size = 'md', 
  className = '',
  children,
  icon,
  ...props 
}: ButtonProps) {
  const baseStyles = 'flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg font-bold leading-normal tracking-[0.015em] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-[#343A40] dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
  }
  
  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-4 text-base'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined text-base">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </button>
  )
}