// app/student/classes/page.tsx
import { Metadata } from 'next'
import ClassesHeader from './components/ClassesHeader'
import { classesData } from './components/types'
import ClassesFilters from './components/ClassesFilters'
import ClassesGrid from './components/ClassesGrid'
import ClassesStats from './components/ClassesStats'

export const metadata: Metadata = {
  title: 'My Classes | SchoolHub',
  description: 'View and manage all your enrolled classes',
}

export default function ClassesPage() {
  const totalClasses = classesData.length
  const activeClasses = classesData.filter(c => c.status === 'active').length
  const assignmentsDue = classesData.reduce((sum, c) => sum + c.assignmentsDue, 0)
  const avgProgress = Math.round(classesData.reduce((sum, c) => sum + c.progress, 0) / totalClasses)

  return (
    <div className="container mx-auto px-4 py-8">
      <ClassesHeader />
      
      <div className="space-y-8">
        <ClassesFilters />
        <ClassesGrid classes={classesData} />
        <ClassesStats 
          totalClasses={totalClasses}
          activeClasses={activeClasses}
          assignmentsDue={assignmentsDue}
          avgProgress={avgProgress}
        />
      </div>
    </div>
  )
}