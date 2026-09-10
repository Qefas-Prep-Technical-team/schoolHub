'use client'


import { cn } from '@/lib/utils'
import { Icon } from '../../Icon'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = "Search...", className }: SearchBarProps) {
  return (
    <div className={cn("py-4 mb-4", className)}>
      <div className="relative group w-full max-w-md">
        <Icon 
          name="search" 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors text-[20px]" 
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pl-11 pr-4 bg-white dark:bg-emerald-950/60 rounded-xl border border-slate-200/80 dark:border-emerald-800/50 focus:outline-none focus:border-emerald-600/50 focus:ring-4 focus:ring-emerald-600/10 text-sm font-semibold text-slate-900 dark:text-white transition-all placeholder:text-slate-400 placeholder:font-normal shadow-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}