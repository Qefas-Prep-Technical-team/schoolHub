'use client'


import { cn } from '@/lib/utils'
import { Student } from './types'

interface DashboardHeaderProps {
  student: Student
  currentTerm: string
  className?: string
}

export function DashboardHeader({ student, currentTerm, className }: DashboardHeaderProps) {
  return (
    <header className={cn(
      "flex items-center justify-between whitespace-nowrap",
      "border-b border-solid border-gray-200 dark:border-gray-700",
      "px-4 md:px-10 py-3",
      className
    )}>
      {/* Logo/Brand */}
      <div className="flex items-center gap-4 text-gray-900 dark:text-white">
        <div className="size-6 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
          </svg>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
          School Platform
        </h2>
      </div>

      {/* Right section */}
      <div className="flex flex-1 justify-end items-center gap-4">
        {/* Current Term */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium text-gray-800 dark:text-gray-100">
            Current Term:
          </span>
          <span>{currentTerm}</span>
        </div>

        {/* Student Avatar */}
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{ backgroundImage: `url("${student.avatar}")` }}
          aria-label={`Avatar of ${student.name}`}
        />
      </div>
    </header>
  )
}