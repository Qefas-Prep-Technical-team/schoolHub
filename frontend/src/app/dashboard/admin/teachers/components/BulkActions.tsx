import Button from './ui/Button'
import Icon from './ui/Icon'

interface BulkActionsProps {
  selectedCount: number
  onAssignClasses: () => void
  onToggleStatus: () => void
  onDelete: () => void
}

export default function BulkActions({ 
  selectedCount, 
  onAssignClasses, 
  onToggleStatus, 
  onDelete 
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex justify-between items-center gap-2 p-4 mb-6 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 dark:border-primary/30">
      <p className="text-sm font-medium text-primary dark:text-primary-300">
        {selectedCount} selected
      </p>
      <div className="flex gap-2">
        <Button 
          variant="primary" 
          icon="assignment_add"
          onClick={onAssignClasses}
        >
          Assign Classes
        </Button>
        <button 
          onClick={onToggleStatus}
          className="p-2.5 rounded-lg text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <Icon name="toggle_off" />
        </button>
        <button 
          onClick={onDelete}
          className="p-2.5 rounded-lg text-red-500 hover:bg-red-500/10"
        >
          <Icon name="delete" />
        </button>
      </div>
    </div>
  )
}