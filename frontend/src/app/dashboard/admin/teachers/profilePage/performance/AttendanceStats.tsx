interface AttendanceStatsProps {
    stats: {
        present: number
        absent: number
        late: number
        percentage: string
    }
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">Total Present</p>
                <p className="text-slate-900 dark:text-slate-200 text-3xl font-bold leading-tight">{stats.present} Days</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">Total Absent</p>
                <p className="text-slate-900 dark:text-slate-200 text-3xl font-bold leading-tight">{stats.absent} Days</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">Total Late</p>
                <p className="text-slate-900 dark:text-slate-200 text-3xl font-bold leading-tight">{stats.late} Days</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">Attendance %</p>
                <p className="text-slate-900 dark:text-slate-200 text-3xl font-bold leading-tight">{stats.percentage}</p>
            </div>
        </div>
    )
}