import ProfileCard from './components/ProfileCard'
import MiniStats from './components/MiniStats'
import SubjectList from './components/SubjectList'
import SubjectDetail from './components/SubjectDetail'

export default function AcademicsPage() {
  return (
   
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">     
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">

            {/* Filter / Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">calendar_today</span>
                <select className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-sm font-medium focus:ring-primary focus:border-primary appearance-none cursor-pointer">
                  <option>Spring Term 2024</option>
                  <option>Fall Term 2023</option>
                  <option>Spring Term 2023</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark pointer-events-none text-[20px]">arrow_drop_down</span>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Download Report Card
                </button>
              </div>
            </div>

            {/* Split View: Subjects List & Detail Panel */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <SubjectList />
              <SubjectDetail />
            </div>
          </div>
        </div>
      </main>
   
  )
}