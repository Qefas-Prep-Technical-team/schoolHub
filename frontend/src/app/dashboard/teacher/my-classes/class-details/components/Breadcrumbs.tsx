'use client'


import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 mb-4", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-[#506795] dark:text-gray-500 text-sm font-medium leading-normal">
              /
            </span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-[#506795] dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className={cn(
              "text-sm font-medium leading-normal",
              item.active
                ? "text-[#0e121b] dark:text-gray-200"
                : "text-[#506795] dark:text-gray-400"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}