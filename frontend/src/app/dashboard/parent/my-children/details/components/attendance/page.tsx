import StatsCards from './components/StatsCards'
import Calendar from './components/Calendar'
import TrendsChart from './components/TrendsChart'
import AbsenceLog from './components/AbsenceLog'

export default function AttendancePage() {
  return (
   
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Grade 5B
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Homeroom: Mr. Smith
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Attendance Record - Sarah Anderson
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export Report</span>
                </button>
              </div>
            </div>
            <StatsCards />
            
            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Calendar */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Calendar />
              </div>
              
              {/* Right Column: Trends & Recent */}
              <div className="flex flex-col gap-6">
                <TrendsChart />
                <AbsenceLog />
              </div>
            </div>
          </div>
        </main>
  
  )
}