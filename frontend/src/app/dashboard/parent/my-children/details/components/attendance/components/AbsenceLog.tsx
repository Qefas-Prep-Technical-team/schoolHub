import { XCircle, Clock } from 'lucide-react'

interface AbsenceRecord {
  id: number
  date: string
  day: string
  type: 'absent' | 'late'
  reason: string
  description: string
}

const absenceRecords: AbsenceRecord[] = [
  {
    id: 1,
    date: 'Oct 13',
    day: 'Tue',
    type: 'absent',
    reason: 'Medical',
    description: 'Reported by parent: Dental appointment. Doctor\'s note submitted.',
  },
  {
    id: 2,
    date: 'Oct 04',
    day: 'Mon',
    type: 'late',
    reason: 'Transport',
    description: 'School bus delay (Route #42). Arrived 15 minutes late.',
  },
]

const typeConfig = {
  absent: {
    icon: XCircle,
    color: 'rose',
    bgColor: 'bg-rose-50 dark:bg-rose-900/10',
    borderColor: 'border-rose-100 dark:border-rose-900/20',
    textColor: 'text-rose-500',
    badgeColor: 'bg-white dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 border-rose-100 dark:border-rose-800',
  },
  late: {
    icon: Clock,
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-900/10',
    borderColor: 'border-amber-100 dark:border-amber-900/20',
    textColor: 'text-amber-500',
    badgeColor: 'bg-white dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-800',
  },
}

export default function AbsenceLog() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
          Absence Log
        </h3>
        <button className="text-primary text-xs font-bold hover:underline transition-colors">
          View All
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        {absenceRecords.map((record) => {
          const config = typeConfig[record.type]
          const Icon = config.icon
          
          return (
            <div key={record.id} className="flex gap-3">
              {/* Date Column */}
              <div className="mt-1 flex flex-col items-center gap-1 min-w-[3rem]">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {record.date}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {record.day}
                </span>
              </div>
              
              {/* Details Column */}
              <div className={`flex-1 p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`${config.textColor} size-5`} />
                    <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                      {record.type}
                    </span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${config.badgeColor}`}>
                    {record.reason}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {record.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}