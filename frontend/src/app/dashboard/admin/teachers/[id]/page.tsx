"use client"
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ProtectedAdminRoute } from '../../components/ProtectedAdminRoute'
import Breadcrumbs from './components/Breadcrumbs'
import TeacherProfileHeader from './components/TeacherProfileHeader'
import TeacherTabs from './components/TeacherTabs'
import PersonalInfoCard from './components/PersonalInfoCard'
import ProfessionalInfoCard from './components/ProfessionalInfoCard'
import StatisticsCard from './components/StatisticsCard'
import SchedulePage from './schedule/SchedulePage'
import PerformancePage from './performance/PerformancePage'
import { apiClient } from '@/lib/api/client'
import { Skeleton } from '@/components/ui/skeleton'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'performance', label: 'Performance Reports' }
]

export default function TeacherProfilePage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: teacherData, isLoading, error } = useQuery({
    queryKey: ['admin-teacher', id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/teachers/${id}`)
      return response.data.data
    },
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="flex-1 p-8 space-y-8 animate-pulse">
        <Skeleton className="h-4 w-64 rounded" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !teacherData) {
    return (
      <div className="flex-1 p-8 text-center text-red-500">
        <h2 className="text-2xl font-bold">Error loading teacher profile</h2>
        <p>Please try again later or contact support.</p>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Teachers', href: '/dashboard/admin/teachers' },
    { label: teacherData.name, active: true }
  ]

  return (
    <ProtectedAdminRoute>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} />

          <TeacherProfileHeader
            teacher={{
              name: teacherData.name,
              subjects: teacherData.professionalInfo.subjects,
              assignedClasses: teacherData.professionalInfo.assignedClasses,
              avatar: teacherData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherData.name)}&background=random`,
              status: teacherData.status
            }}
          />

          <TeacherTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Left Column: Info Cards */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <PersonalInfoCard personalInfo={teacherData.personalInfo} />
                <ProfessionalInfoCard 
                  teacherId={teacherData.id}
                  professionalInfo={teacherData.professionalInfo} 
                />
              </div>

              {/* Right Column: Statistics Widgets */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <StatisticsCard statistics={teacherData.statistics} />
              </div>
            </div>
          )}
          {activeTab === 'schedule' && (
            <SchedulePage />
          )}
          {activeTab === 'performance' && (
            <PerformancePage />
          )}
        </div>
      </main>
    </ProtectedAdminRoute>
  )
}
