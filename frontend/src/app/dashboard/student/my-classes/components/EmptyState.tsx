// app/student/classes/components/EmptyState.tsx
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
}

export default function EmptyState({ 
  title = "No classes found", 
  description = "Try adjusting your search or filters",
  actionText = "Clear filters",
  onAction 
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Search className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
        {description}
      </p>
      {onAction && (
        <Button onClick={onAction} variant="outline">
          {actionText}
        </Button>
      )}
    </div>
  )
}