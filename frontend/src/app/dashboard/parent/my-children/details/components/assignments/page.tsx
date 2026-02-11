import Header from './components/Header'
import FilterBar from './components/FilterBar'
import AssignmentList from './components/AssignmentList'
import AssignmentDetail from './components/AssignmentDetail'

export default function AssignmentsPage() {
  return (
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-text-muted font-medium">
              <a href="#" className="hover:text-primary transition-colors">Home</a>
              <span className="material-symbols-outlined text-base mx-1">chevron_right</span>
              <a href="#" className="hover:text-primary transition-colors">Child Dashboard</a>
              <span className="material-symbols-outlined text-base mx-1">chevron_right</span>
              <span className="text-text-main dark:text-white">Assignments</span>
            </div>

            {/* Page Header & Filters */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-main dark:text-white tracking-tight mb-2">
                    Assignments
                  </h2>
                  <p className="text-text-muted">Track upcoming work, submissions, and grades for Alex.</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-xl">download</span>
                    <span className="hidden sm:inline">Export Report</span>
                  </button>
                </div>
              </div>
              
              <FilterBar />
            </div>

            {/* Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
              <AssignmentList />
              <AssignmentDetail />
            </div>
          </div>
        </main>
  )
}