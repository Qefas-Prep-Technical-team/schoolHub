'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-wrap justify-between items-center gap-4 mb-6",
      className
    )}>
      <div className="flex flex-col">
        <h1 className="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#506795] dark:text-gray-400 text-base font-normal leading-normal mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}