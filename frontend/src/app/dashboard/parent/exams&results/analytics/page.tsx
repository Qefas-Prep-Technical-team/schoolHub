"use client"
import BreadcrumbActions from './components/breadcrumb-actions'
import SubjectHeader from './components/subject-header'
import KPICards from './components/kpi-cards'
import PerformanceChart from './components/performance-chart'
import AssessmentsTable from './components/assessments-table'
import ComparisonChart from './components/comparison-chart'
import TopicAnalysis from './components/topic-analysis'
import TeacherRemarks from './components/teacher-remarks'
import { useParams } from 'next/navigation'

export default function SubjectAnalyticsPage() {
  const params = useParams()
  const subjectId = params.subject

  return (  
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BreadcrumbActions />
        <SubjectHeader />
        <KPICards />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Performance & Assessments */}
          <div className="lg:col-span-2 space-y-6">
            <PerformanceChart />
            <AssessmentsTable />
          </div>
          
          {/* Right Column: Comparison & Feedback */}
          <div className="space-y-6">
            <ComparisonChart />
            <TopicAnalysis />
            <TeacherRemarks />
          </div>
        </div>
      </main>
  )
}