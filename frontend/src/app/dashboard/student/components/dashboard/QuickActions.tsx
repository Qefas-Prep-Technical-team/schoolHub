'use client'
import { cn } from '@/lib/utils'
import { Icon } from './Icon'

interface QuickAction {
  id: string
  label: string
  icon: string
  color: string
  link: string
  description?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  className?: string
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <a
            key={action.id}
            href={action.link}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl",
              "border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800/50",
              "hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10",
              "transition-all duration-200"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg mb-3",
              action.color
            )}>
              <Icon name={action.icon} className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              {action.label}
            </span>
            {action.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {action.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}