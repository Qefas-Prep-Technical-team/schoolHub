import { useState } from 'react'

interface MarkAttendanceFormProps {
    selectedDate: string
    onAttendanceSubmit: (data: { date: string; status: string }) => void
}

export default function MarkAttendanceForm({ selectedDate, onAttendanceSubmit }: MarkAttendanceFormProps) {
    const [attendanceStatus, setAttendanceStatus] = useState('present')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onAttendanceSubmit({
            date: selectedDate,
            status: attendanceStatus
        })
    }

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 h-fit">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Manually Mark Attendance
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="attendance-date"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                        Date
                    </label>
                    <input
                        id="attendance-date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {/* Handle date change if needed */ }}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-primary focus:border-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Status
                    </label>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input
                                id="status-present"
                                name="attendance-status"
                                type="radio"
                                value="present"
                                checked={attendanceStatus === 'present'}
                                onChange={(e) => setAttendanceStatus(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-600"
                            />
                            <label
                                htmlFor="status-present"
                                className="ml-3 block text-sm text-slate-700 dark:text-slate-300"
                            >
                                Present
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="status-absent"
                                name="attendance-status"
                                type="radio"
                                value="absent"
                                checked={attendanceStatus === 'absent'}
                                onChange={(e) => setAttendanceStatus(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-600"
                            />
                            <label
                                htmlFor="status-absent"
                                className="ml-3 block text-sm text-slate-700 dark:text-slate-300"
                            >
                                Absent
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="status-late"
                                name="attendance-status"
                                type="radio"
                                value="late"
                                checked={attendanceStatus === 'late'}
                                onChange={(e) => setAttendanceStatus(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-600"
                            />
                            <label
                                htmlFor="status-late"
                                className="ml-3 block text-sm text-slate-700 dark:text-slate-300"
                            >
                                Late
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal shadow-sm hover:bg-primary/90 mt-2"
                >
                    Submit Attendance
                </button>
            </form>
        </div>
    )
}