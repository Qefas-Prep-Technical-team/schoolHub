
import OverviewWidgets from './components/OverviewWidgets'
import FilterToolbar from './components/FilterToolbar'
import AssignmentCard from './components/AssignmentCard'
import Pagination from './components/Pagination'

export default function ParentAssignmentsPage() {
  return (
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
    
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            {/* Page Heading & Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Assignments Overview
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage and track Sarah&apos;s academic progress
                  </p>
                </div>
                
                {/* Child Selector */}
                <div className="relative w-full sm:w-64">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                    Viewing Child
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white dark:bg-surface-dark border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 pl-11 pr-10 focus:ring-primary focus:border-primary font-medium cursor-pointer shadow-sm">
                      <option value="sarah">Sarah Ross (10th Grade)</option>
                      <option value="mike">Mike Ross (8th Grade)</option>
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                      face
                    </span>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <button className="flex items-center gap-2 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm ml-auto lg:ml-0">
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>Download Report</span>
              </button>
            </div>

            <OverviewWidgets />
            <FilterToolbar />
            
            {/* Assignments List */}
            <div className="grid grid-cols-1 gap-4">
              <AssignmentCard
                id="1"
                subject="Mathematics"
                teacher="Mr. Anderson"
                title="Algebra II: Quadratic Equations"
                status="late"
                dueDate="Oct 20 (2 days ago)"
                icon="calculate"
              />
              
              <AssignmentCard
                id="2"
                subject="Chemistry"
                teacher="Ms. Frizzle"
                title="Lab Report: Chemical Reactions"
                status="urgent"
                dueDate="Tomorrow, 11:59 PM"
                icon="science"
              />
              
              <AssignmentCard
                id="3"
                subject="English Lit"
                teacher="Mr. Keating"
                title='Essay: Themes in "The Great Gatsby"'
                status="pending"
                dueDate="Oct 28 (5 days left)"
                icon="book_2"
              />
              
              <AssignmentCard
                id="4"
                subject="History"
                teacher="Mrs. Johnson"
                title="World War II Timeline Project"
                status="graded"
                dueDate="Submitted Oct 15"
                score="92/100"
                icon="public"
              />
            </div>

            <Pagination />
          </div>
        </div>
      </main>
  )
}