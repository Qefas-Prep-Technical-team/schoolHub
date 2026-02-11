'use client'

import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface WelcomeBannerProps {
  studentName: string
  date?: Date
  className?: string
}

export function WelcomeBanner({ 
  studentName, 
  date = new Date(), 
  className 
}: WelcomeBannerProps) {
  const formattedDate = format(date, 'EEEE, d MMMM yyyy')

  return (
    <div className={cn("flex flex-wrap justify-between gap-4 p-4 md:p-6", className)}>
      <div className="flex min-w-72 flex-col gap-2">
        <h1 className="text-gray-900 dark:text-white text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
          Welcome back, {studentName}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
          {formattedDate}
        </p>
      </div>
    </div>
  )
}