'use client'

import { Icon } from './Icon'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  onClick?: () => void
  className?: string
}

export function FilterChip({ label, onClick, className }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg",
        "bg-slate-200/60 dark:bg-slate-700/60 pl-4 pr-2",
        "hover:bg-slate-300/60 dark:hover:bg-slate-600/60 transition-colors",
        className
      )}
    >
      <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">
        {label}
      </p>
      <Icon name="arrow_drop_down" className="text-slate-900 dark:text-white" />
    </button>
  )
}