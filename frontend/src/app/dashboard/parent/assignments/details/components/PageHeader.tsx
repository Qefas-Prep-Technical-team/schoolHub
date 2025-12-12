import { User } from 'lucide-react'

export default function PageHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            History 101
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <User className="size-4" />
            Mr. Anderson
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
          History Essay: The Industrial Revolution
        </h1>
      </div>

      {/* Status Badge (Desktop) */}
      <div className="hidden md:flex flex-col items-end gap-2">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-200 dark:border-emerald-800">
          <span className="material-symbols-outlined icon-fill text-lg">
            check_circle
          </span>
          Graded
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: Oct 25, 2023
        </span>
      </div>
    </div>
  )
}