import Header from './components/Header'
import StatsOverview from './components/StatsOverview'
import ExamDetail from './components/ExamDetail'
import AssessmentList from './components/AssessmentList'

export default function ExamsPage() {
  return (
        
      <main className="flex-1 flex flex-col ">
  
        
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
          {/* Page Heading & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-text-main-light dark:text-text-main-dark">
                Exams & Quizzes
              </h1>
              <p className="text-text-sec-light dark:text-text-sec-dark mt-1">
                Track Alex&apos;s progress, upcoming tests, and performance analytics.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Download All Reports
            </button>
          </div>

          <StatsOverview />

          {/* Main Content Split */}
          <div className="flex flex-col lg:flex-row gap-6">
            <ExamDetail />
            <AssessmentList />
          </div>
        </div>
      </main>
  )
}