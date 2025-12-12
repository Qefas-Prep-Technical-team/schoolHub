import Header from './components/Header'
import ProfileHeader from './components/ProfileHeader'
import TabNavigation from './components/TabNavigation'
import UpcomingAssignments from './components/UpcomingAssignments'
import AcademicProgress from './components/AcademicProgress'
import RecentGrades from './components/RecentGrades'
import TeacherContact from './components/TeacherContact'
import NoticeBanner from './components/NoticeBanner'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200">
      <div className="layout-container flex h-full grow flex-col max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 py-6 items-center">
          <a
            href="#"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </a>
          <span className="text-slate-400 text-sm font-medium">/</span>
          <span className="text-slate-900 dark:text-white text-sm font-medium">
            Alex Johnson
          </span>
        </div>

        <ProfileHeader />

        <TabNavigation />

        {/* Dashboard Content Grid */}
       
      </div>
    </div>
  )
}