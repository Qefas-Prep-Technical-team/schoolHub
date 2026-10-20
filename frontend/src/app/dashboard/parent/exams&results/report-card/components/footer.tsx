"use client"

import React from 'react'
import { ShieldCheck, AlertCircle } from 'lucide-react'

export default function ReportFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="p-6 sm:p-8 text-center space-y-3 border-t border-slate-100 dark:border-slate-800">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Qefas Hub Continuous Academic Record</span>
      </div>

      <div className="max-w-2xl mx-auto p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-left sm:text-center text-xs text-amber-800 dark:text-amber-300 flex items-start sm:items-center justify-center gap-2">
        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> This document compiles all student learning activities, continuous assessments, and quiz records on Qefas Hub. It is <strong>not</strong> the final terminal school report card. The official school report card appears on the <strong>Final Results</strong> page.
        </p>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        © {currentYear} Qefas Hub Educational Systems • Institutional Academic Directorate
      </p>
    </div>
  )
}
