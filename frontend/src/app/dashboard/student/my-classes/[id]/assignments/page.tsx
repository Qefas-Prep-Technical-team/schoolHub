// app/student/classes/[id]/assignments/page.tsx
import { notFound } from 'next/navigation'
import PageHeader from './components/PageHeader'
import AssignmentsLayout from './components/AssignmentsLayout'
import { assignmentsData } from './components/assignmentsData'


interface AssignmentsPageProps {
  params: Promise<{ id: string }>
}

export default async function AssignmentsPage({ params }: AssignmentsPageProps) {
  const { id } = await params
  const classInfo = assignmentsData.find(c => c.id === parseInt(id))
  
  if (!classInfo) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <PageHeader 
            title={classInfo.title}
            subtitle="Assignments"
            showBackButton={true}
          />
        </div>
        
        <AssignmentsLayout assignments={classInfo.assignments} />
      </div>
    </div>
  )
}