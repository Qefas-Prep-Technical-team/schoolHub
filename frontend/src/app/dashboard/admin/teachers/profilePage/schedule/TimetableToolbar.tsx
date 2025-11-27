import Button from '../components/ui/Button'

interface TimetableToolbarProps {
  currentWeek: string
  onPreviousWeek: () => void
  onNextWeek: () => void
  onAddClass: () => void
  onPrint: () => void
}

export default function TimetableToolbar({ 
  currentWeek, 
  onPreviousWeek, 
  onNextWeek, 
  onAddClass,
  onPrint 
}: TimetableToolbarProps) {
  return (
    <div className="flex justify-between items-center gap-2 mb-4 p-4 bg-white dark:bg-[#191e2a] rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <button 
          onClick={onPreviousWeek}
          className="p-2 text-[#0e121b] dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="text-sm font-medium text-[#0e121b] dark:text-white whitespace-nowrap">
          {currentWeek}
        </span>
        <button 
          onClick={onNextWeek}
          className="p-2 text-[#0e121b] dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          icon="print"
          onClick={onPrint}
        >
          Print
        </Button>
        <Button 
          variant="primary" 
          icon="add"
          onClick={onAddClass}
        >
          Add Class
        </Button>
      </div>
    </div>
  )
}