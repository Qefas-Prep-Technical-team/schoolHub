import { useState } from 'react'

interface AttendanceRecord {
    date: string
    status: 'present' | 'absent' | 'late' | null
}

interface AttendanceCalendarProps {
    attendance: AttendanceRecord[]
    currentMonth: string
    onMonthChange: (direction: 'prev' | 'next') => void
    onDateClick: (date: string) => void
}

export default function AttendanceCalendar({
    attendance,
    currentMonth,
    onMonthChange,
    onDateClick
}: AttendanceCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<string>('2024-10-30')

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Mock calendar data for October 2024
    const calendarDays = [
        null, null, // Oct 1 starts on Tuesday
        '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-05', '2024-10-06',
        '2024-10-07', '2024-10-08', '2024-10-09', '2024-10-10', '2024-10-11', '2024-10-12',
        '2024-10-13', '2024-10-14', '2024-10-15', '2024-10-16', '2024-10-17', '2024-10-18',
        '2024-10-19', '2024-10-20', '2024-10-21', '2024-10-22', '2024-10-23', '2024-10-24',
        '2024-10-25', '2024-10-26', '2024-10-27', '2024-10-28', '2024-10-29', '2024-10-30', '2024-10-31'
    ]

    const getStatusColor = (date: string) => {
        const record = attendance.find(a => a.date === date)
        if (!record || !record.status) return ''

        const colors = {
            present: 'bg-green-present/20',
            absent: 'bg-red-absent/20',
            late: 'bg-yellow-late/20'
        }

        return colors[record.status] || ''
    }

    const getDayNumber = (date: string | null) => {
        if (!date) return ''
        return new Date(date).getDate().toString()
    }

    const handleDateClick = (date: string) => {
        setSelectedDate(date)
        onDateClick(date)
    }

    return (
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{currentMonth}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onMonthChange('prev')}
                        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                    >
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                    <button
                        onClick={() => onMonthChange('next')}
                        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                    >
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                {weekDays.map(day => (
                    <div key={day} className="py-2">{day}</div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2 mt-2">
                {calendarDays.map((date, index) => (
                    <div
                        key={index}
                        onClick={() => date && handleDateClick(date)}
                        className={`h-12 w-full flex items-center justify-center text-sm font-medium cursor-pointer ${date
                                ? `text-slate-800 dark:text-slate-300 ${getStatusColor(date)} ${date === selectedDate ? 'ring-2 ring-primary' : 'rounded'
                                }`
                                : 'text-slate-400 dark:text-slate-600'
                            }`}
                    >
                        {getDayNumber(date)}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-present/30"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-absent/30"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-late/30"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Late</span>
                </div>
            </div>
        </div>
    )
}