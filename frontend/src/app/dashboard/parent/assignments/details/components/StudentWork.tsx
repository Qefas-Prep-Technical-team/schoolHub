import { FileText, Download, CheckCircle } from 'lucide-react'
import { Card } from './ui/Card'
export default function StudentWork() {
  return (
    <Card>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="text-primary size-5" />
          Student Work
        </h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          <CheckCircle className="size-3" />
          Submitted On Time
        </span>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600">
              <FileText className="text-slate-700 dark:text-slate-200 size-6" />
            </div>
            <div className="flex flex-col">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                James_History_Essay_Final.pdf
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Submitted Oct 23, 2023 at 4:00 PM
              </p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 transition-colors">
            <Download className="size-5" />
          </button>
        </div>
      </div>
    </Card>
  )
}