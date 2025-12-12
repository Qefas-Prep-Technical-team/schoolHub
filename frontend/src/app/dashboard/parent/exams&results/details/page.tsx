"use client"

import PageHeader from './components/page-header'
import KPICards from './components/kpi-cards'
import PerformanceBreakdown from './components/performance-breakdown'
import QuestionReview from './components/question-review'
import ParentTools from './components/parent-tools'
import StrengthsWeaknesses from './components/strengths-weaknesses'
import TeacherNote from './components/teacher-note'
import { useParams } from 'next/navigation'

export default function ExamDetailsPage() {
  const params = useParams()
  const examId = params.id

  return (
 
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <PageHeader />
            <KPICards />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Performance & Review */}
              <div className="lg:col-span-2 space-y-6">
                <PerformanceBreakdown />
                <QuestionReview />
              </div>
              
              {/* Right Column: Insights & Tools */}
              <div className="space-y-6">
                <ParentTools />
                <StrengthsWeaknesses />
                <TeacherNote />
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}