"use client"
import StatCards from './components/stat-cards'
import ExamList from './components/exam-list'
import SidebarRight from './components/sidebar-right'
import { useTheme } from 'next-themes'

export default function ExamsResultsPage() {
  const { theme } = useTheme()

  return (

      
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark relative">
   
        
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
          <StatCards />
          
          <div className="flex flex-col lg:flex-row gap-6">
            <ExamList />
            <SidebarRight />
          </div>
        </div>
      </main>
    
  )
}