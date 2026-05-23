import Button from '../components/ui/Button'
import { Loader2 } from 'lucide-react'

interface TimetableToolbarProps {
  currentWeek: string
  onPreviousWeek: () => void
  onNextWeek: () => void
  onAddClass: () => void
  onPrint: () => void
  isExporting?: boolean
}

export default function TimetableToolbar({ 
  currentWeek, 
  onPreviousWeek, 
  onNextWeek, 
  onAddClass,
  onPrint,
  isExporting
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
          icon={isExporting ? undefined : "print"}
          onClick={onPrint}
          disabled={isExporting}
        >
          {isExporting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Generating PDF...
            </span>
          ) : (
            "Download Timetable"
          )}
        </Button>
        <Button 
          variant="primary" 
          icon="add"
          onClick={onAddClass}
        >
          Add Period
        </Button>
      </div>
    </div>
  )
}

