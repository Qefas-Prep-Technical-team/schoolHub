import { AlertTriangle } from 'lucide-react'

export default function NoticeBanner() {
  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800/50">
      <div className="flex items-start gap-3">
        <div className="bg-white dark:bg-red-900 p-1.5 rounded-full shadow-sm text-red-500 dark:text-red-300">
          <AlertTriangle className="size-5" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-red-800 dark:text-red-200">
            School Fees Due
          </h4>
          <p className="text-xs text-red-700 dark:text-red-300/80 mt-1">
            Tuition for Term 2 is pending. Please clear by Oct 31st to avoid late fees.
          </p>
          <button className="mt-2 text-xs font-semibold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-sm">
            Pay Now
          </button>
        </div>
      </div>
    </div>
  )
}