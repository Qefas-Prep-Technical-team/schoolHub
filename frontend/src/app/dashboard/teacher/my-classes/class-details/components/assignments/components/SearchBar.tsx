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
    <div className={cn("py-6", className)}>
      <label className="flex flex-col h-12 w-full max-w-md">
        <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
          <div className="text-[#506795] dark:text-gray-400 flex bg-white dark:bg-background-dark dark:border dark:border-slate-700 items-center justify-center pl-4 rounded-l-xl border-r-0">
            <Icon name="search" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#0e121b] dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-l-0 border-gray-200 dark:border-slate-700 bg-white dark:bg-background-dark h-full placeholder:text-[#506795] dark:placeholder-gray-500 px-4 text-base font-normal leading-normal"
            placeholder={placeholder}
          />
        </div>
      </label>
    </div>
  )
}