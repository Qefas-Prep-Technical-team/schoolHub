"use client"

import { useState } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TermOption {
  value: string
  label: string
}

export default function BreadcrumbActions() {
  const [selectedTerm, setSelectedTerm] = useState<string>('1st Term 2023/2024')

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '#' },
    { label: 'Exams', href: '#' },
    { label: 'Term Report' }
  ]

  const termOptions: TermOption[] = [
    { value: 'term1', label: '1st Term 2023/2024' },
    { value: 'term2', label: '2nd Term 2023/2024' },
    { value: 'term3', label: '3rd Term 2022/2023' }
  ]

  const handlePrint = () => {
    console.log('Print clicked')
    // Implement print functionality
  }

  const handleDownloadPDF = () => {
    console.log('Download PDF clicked')
    // Implement PDF download
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Breadcrumb & Title */}
      <div>
        <nav className="flex text-sm text-slate-500 dark:text-slate-400 mb-1">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              {item.href ? (
                <a href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {item.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </div>
          ))}
        </nav>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Term Report Card
        </h2>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {/* Term Selector */}
        <div className="relative">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="appearance-none bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 pl-4 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm min-w-[180px]"
          >
            {termOptions.map((option) => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-lg">
            expand_more
          </span>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">print</span>
          <span className="hidden sm:inline">Print</span>
        </button>

        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  )
}