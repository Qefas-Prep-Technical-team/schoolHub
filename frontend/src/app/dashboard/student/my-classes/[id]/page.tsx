"use client"
// app/student/classes/[id]/page.tsx
import { notFound } from 'next/navigation'
import ClassHeader from './components/ClassHeader'
import Breadcrumbs from './components/Breadcrumbs'
import ClassOverview from './components/ClassOverview'
import ClassStats from './components/ClassStats'
import ClassTabs from './components/ClassTabs'
import AssignmentsTable from './components/AssignmentsTable'
import { classData } from '../components/classData'
import { TabPanel } from 'react-tabs'
import { useState } from 'react'
import MaterialsPage from './components/materials/page'


interface ClassDetailsPageProps {
  params: Promise<{ id: string }>
}

export default  function ClassDetailsPage({ params }: ClassDetailsPageProps) {
    const [activeTab, setActiveTab] = useState<'assignments' | 'materials' | 'attendance' | 'discussions'>('assignments');
//   const { id } =  params
  const id = "1"; // Replace with actual id extraction logic
  const classItem = classData.find(c => c.id === parseInt(id))
  
  if (!classItem) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ClassHeader classItem={classItem} />
      <Breadcrumbs classTitle={classItem.title} />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2 space-y-6">
          <ClassOverview 
            teacher={classItem.teacher}
            description={classItem.description}
          />
        </div>
        
        <div>
          <ClassStats 
            attendance={classItem.stats.attendance}
            assignments={classItem.stats.assignments}
            grade={classItem.stats.grade}
            lastActivity={classItem.stats.lastActivity}
          />
        </div>
      </div>
           <ClassTabs activeTab={activeTab} onTabChange={setActiveTab}>
                  <TabPanel>
                  
            <AssignmentsTable assignments={classItem.assignments} />
                  </TabPanel>
                
                  <TabPanel>
                  <MaterialsPage/>
                  </TabPanel>
                
                  <TabPanel>
                   {/* <AssignmentsPage/> */}
                  </TabPanel>
                
                  <TabPanel>
                   {/* <ExamsPage/> */}
                  </TabPanel>
                </ClassTabs>
    </div>
  )
}