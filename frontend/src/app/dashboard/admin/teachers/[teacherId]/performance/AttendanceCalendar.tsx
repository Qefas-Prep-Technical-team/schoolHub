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

    // Generate calendar days dynamically based on currentMonth (YYYY-MM)
    const year = parseInt(currentMonth.split('-')[0])
    const month = parseInt(currentMonth.split('-')[1]) - 1
    
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    
    const calendarDays = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        calendarDays.push(dateString)
    }

    const getStatusColor = (date: string) => {
        const record = attendance.find(a => a.date === date)
        if (!record || !record.status) return ''

        const colors: Record<string, string> = {
            present: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
            absent: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
            late: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
        }

        return colors[record.status.toLowerCase()] || ''
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
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
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
                {calendarDays.map((date, index) => {
                    const isToday = date === new Date().toISOString().split('T')[0];
                    return (
                        <div
                            key={index}
                            onClick={() => date && handleDateClick(date)}
                            className={`h-12 w-full flex flex-col items-center justify-center text-sm font-medium cursor-pointer relative ${date
                                    ? `text-slate-800 dark:text-slate-300 ${getStatusColor(date)} ${date === selectedDate ? 'ring-2 ring-primary' : 'rounded'
                                    }`
                                    : 'text-slate-400 dark:text-slate-600'
                                }`}
                        >
                            {getDayNumber(date)}
                            {isToday && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Late</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Today</span>
                </div>
            </div>
        </div>
    )
}

