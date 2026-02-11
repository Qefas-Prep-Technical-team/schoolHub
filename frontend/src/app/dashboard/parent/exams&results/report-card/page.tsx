"use client"
import BreadcrumbActions from './components/breadcrumb-actions'
import ReportHeaderSection from './components/report-header'
import StudentInfo from './components/student-info'
import AcademicTable from './components/academic-table'
import RemarksSection from './components/remarks-section'
import ReportFooter from './components/footer'
import { useParams } from 'next/navigation'

export default function TermReportPage() {
  const params = useParams()
  const termId = params.id

  return (
 
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
       
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            <BreadcrumbActions />
            
            {/* Report Card Document */}
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
              <ReportHeaderSection />
              <StudentInfo />
              <AcademicTable />
              <RemarksSection />
              <ReportFooter />
            </div>
          </div>
        </div>
      </main>
  )
}