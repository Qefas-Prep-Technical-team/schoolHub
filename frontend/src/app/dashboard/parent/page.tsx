import StudentHero from './components/dashboard/StudentHero'
import InsightsGrid from './components/dashboard/InsightsGrid'
import TeacherContact from './components/dashboard/TeacherContact'
import QuickAccessGrid from './components/dashboard/QuickAccessGrid'
import Announcements from './components/dashboard/Announcements'

export default function Home() {
  return (

      
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Mobile Child Selector */}
            <div className="sm:hidden">
              <select className="w-1/4 py-3 px-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl text-sm font-medium">
                <option>Emily Johnson</option>
                <option>Michael Johnson</option>
              </select>
            </div>

            <StudentHero />
            
            <InsightsGrid />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <TeacherContact />
                <QuickAccessGrid />
              </div>
              
              <div className="lg:col-span-1">
                <Announcements />
              </div>
            </div>
          </div>
        </main>
  )
}