'use client'


import { cn } from '@/lib/utils'
import { Icon } from '../../Icon'

interface AddAssignmentButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export function AddAssignmentButton({
  onClick,
  label = "Add New Assignment",
  className
}: AddAssignmentButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-w-[84px] cursor-pointer items-center justify-center gap-2",
        "overflow-hidden rounded-xl h-12 px-5 bg-primary text-white",
        "text-sm font-bold leading-normal tracking-[0.015em]",
        "hover:bg-primary/90 transition-colors",
        className
      )}
    >
      <Icon name="add_circle" />
      <span className="truncate">{label}</span>
    </button>
  )
}