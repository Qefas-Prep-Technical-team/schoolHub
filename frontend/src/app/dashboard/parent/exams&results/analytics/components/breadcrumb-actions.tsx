"use client"

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  isCurrent?: boolean
}

export default function BreadcrumbActions() {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '#' },
    { label: 'Exams & Results', href: '#' },
    { label: 'Mathematics', isCurrent: true },
  ]

  const handleFilterTerm = () => {
    console.log('Filter Term 2 clicked')
  }

  const handleDownloadReport = () => {
    console.log('Download Report clicked')
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900 dark:text-white font-medium">
                {item.label}
              </span>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="material-symbols-outlined text-base">
                chevron_right
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleFilterTerm}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          Filter Term 2
        </button>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm shadow-blue-500/30 transition-all"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Download Report
        </button>
      </div>
    </div>
  )
}