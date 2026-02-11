import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#1a2230] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 ${className}`}
    >
      {children}
    </div>
  )
}