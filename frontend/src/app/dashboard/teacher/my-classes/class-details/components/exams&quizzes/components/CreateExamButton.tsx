'use client'
import { cn } from '@/lib/utils'
import { Icon } from '../../Icon'

interface CreateExamButtonProps {
  onClick: () => void
  label?: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function CreateExamButton({
  onClick,
  label = "Create New Exam/Quiz",
  variant = 'primary',
  className
}: CreateExamButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5",
        "text-sm font-semibold shadow-sm transition-colors",
        variant === 'primary'
          ? "bg-primary text-white hover:bg-primary/90"
          : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
    >
      <Icon name="add_circle" />
      {label}
    </button>
  )
}