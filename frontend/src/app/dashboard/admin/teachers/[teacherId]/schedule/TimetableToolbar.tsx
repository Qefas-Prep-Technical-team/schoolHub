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
        <button 
          onClick={onAddClass}
          className="flex items-center justify-center gap-2 rounded-xl h-10 px-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="truncate uppercase tracking-widest text-[11px]">Add Period</span>
        </button>
      </div>
    </div>
  )
}

