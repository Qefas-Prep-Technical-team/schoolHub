"use client"

import React from 'react'
import { School, Info } from 'lucide-react'
import { ReportCardData } from './types'

interface ReportHeaderProps {
  data: ReportCardData
}

export default function ReportHeader({ data }: ReportHeaderProps) {
  return (
    <>
      {/* Decorative Top Accent Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

      <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          {/* School Brand & Details */}
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 shadow-xs overflow-hidden">
              {data.schoolLogo ? (
                <img
                  src={data.schoolLogo}
                  alt={data.schoolName}
                  className="size-full object-contain p-1.5"
                  onError={(e) => {
                    // fallback to schoolhub logo or hide
                    (e.target as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <School size={32} />
              )}
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {data.schoolName}
              </h2>
              {data.schoolAddress && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {data.schoolAddress}
                </p>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {data.schoolEmail ? `${data.schoolEmail} • ` : ''}Qefas Hub Student Activity Record
              </p>
            </div>
          </div>

          {/* Report Type & Date Stamp */}
          <div className="w-full sm:w-auto text-left sm:text-right">
            <div className="inline-flex sm:flex flex-col items-start sm:items-end px-4 py-2.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                <Info size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Document Classification
                </span>
              </div>
              <span className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-200 mt-0.5">
                {data.reportType || 'Qefas Hub Activity Report'}
              </span>
              <span className="text-[11px] font-semibold text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                {data.term} • {data.session} (Interim)
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
