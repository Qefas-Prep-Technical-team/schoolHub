import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-card-light dark:bg-card-dark rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}