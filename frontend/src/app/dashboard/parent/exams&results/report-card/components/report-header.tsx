"use client"

interface SchoolInfo {
  name: string
  address: string
  contact: string
  email: string
}

interface ReportInfo {
  type: string
}

export default function ReportHeader() {
  const school: SchoolInfo = {
    name: 'Springfield International School',
    address: '123 Education Lane, Knowledge City',
    contact: '+1 (555) 123-4567',
    email: 'info@springfield.edu'
  }

  const report: ReportInfo = {
    type: 'End of Term Report'
  }

  return (
    <>
      {/* Top Decorative Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-primary to-purple-500"></div>
      
      <div className="p-6 lg:p-10">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-8 mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-4xl">local_library</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {school.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {school.address}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {school.email} | {school.contact}
              </p>
            </div>
          </div>
          
          <div className="text-right sm:text-left">
            <div className="inline-block px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Report Type
              </p>
              <p className="text-lg font-bold text-primary">{report.type}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}