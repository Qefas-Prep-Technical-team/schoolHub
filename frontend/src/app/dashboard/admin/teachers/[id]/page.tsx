"use client"
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTeacherDetails } from '@/lib/api/hooks/useAdmin'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import TeacherBreadcrumbs from './components/TeacherBreadcrumbs'
import TeacherProfileHeader from './components/TeacherProfileHeader'
import TeacherTabs from './components/TeacherTabs'
import PersonalInfoCard from './components/PersonalInfoCard'
import ProfessionalInfoCard from './components/ProfessionalInfoCard'
import StatisticsCard from './components/StatisticsCard'
import SchedulePage from './schedule/SchedulePage'
import PerformancePage from './performance/PerformancePage'
import { Loader2 } from 'lucide-react'
import { EditTeacherModal } from '../components/EditTeacherModal'


const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'performance', label: 'Performance Reports' }
]

export default function TeacherProfilePage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const currentSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ""
  const teacherId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : ''
  const { data: teacher, isLoading, error } = useTeacherDetails(teacherId)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Loading teacher profile...</p>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 font-medium">Failed to load teacher profile</p>
      </div>
    )
  }

  // Transform real data to match component expectations
  const teacherData = {
    id: teacher.id,
    name: teacher.name,
    title: teacher.title || 'Teacher',
    avatar: teacher.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teacher.name)}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40&fontWeight=900`,
    status: teacher.verified ? 'active' as const : 'pending' as const,
    isClaimed: teacher.isClaimed,
    primarySchoolId: teacher.primarySchoolId,
    personalInfo: {
      fullName: teacher.name,
      gender: teacher.gender || 'Not specified',
      email: teacher.email,
      phone: teacher.phone || 'Not provided',
      address: teacher.address || 'Not provided',
      highestQualification: teacher.highestQualification || 'Not specified',
      yearsOfExperience: teacher.yearsOfExperience ? `${teacher.yearsOfExperience} Years` : 'Not specified'
    },
    professionalInfo: {
      department: teacher.department?.name || 'General',
      subjects: teacher.teacherSubjects?.map((ts: any) => ts.subject.name) || [],
      assignedClasses: teacher.classTeachers?.map((ct: any) => ct.class.name) || []
    },
    statistics: {
      classPerformance: '0%', // Mocked for now until we have analytics
      attendanceRate: '0%',
      upcomingClasses: teacher.classTeachers?.length.toString() || '0',
      studentsTaught: '0'
    }
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Teachers', href: '/dashboard/admin/teachers' },
    { label: teacherData.name, active: true }
  ]

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <TeacherBreadcrumbs items={breadcrumbItems} />

        <TeacherProfileHeader
          teacher={{
            name: teacherData.name,
            subjects: teacherData.professionalInfo.subjects,
            assignedClasses: teacherData.professionalInfo.assignedClasses,
            avatar: teacherData.avatar,
            status: teacherData.status,
            isClaimed: teacherData.isClaimed,
            primarySchoolId: teacherData.primarySchoolId,
            currentSchoolId: currentSchoolId
          }}
          onEdit={() => setIsEditModalOpen(true)}
        />

        <TeacherTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <PersonalInfoCard personalInfo={teacherData.personalInfo} />
              <ProfessionalInfoCard professionalInfo={teacherData.professionalInfo} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
              <StatisticsCard statistics={teacherData.statistics} />
            </div>
          </div>
        )}
        {activeTab === 'schedule' && (
          <SchedulePage teacher={teacher} teacherId={teacherId} />
        )}
        {activeTab === 'performance' && (
          <PerformancePage />
        )}
        {activeTab !== 'overview' && activeTab !== 'schedule' && activeTab !== 'performance' && (
          <div className="mt-6 p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
            <p>{tabs.find(tab => tab.id === activeTab)?.label} content coming soon...</p>
          </div>
        )}
      </div>

      <EditTeacherModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        primaryColor="#2563eb"
        teacher={{
          id: teacherData.id,
          name: teacherData.name,
          gender: (teacher as any).gender,
          department: (teacher as any).department
        }}
      />
    </main>
  )
}

