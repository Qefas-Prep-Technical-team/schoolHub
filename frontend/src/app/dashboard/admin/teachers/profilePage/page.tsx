"use client"
import { useState } from 'react'
import { ProtectedAdminRoute } from '../../components/ProtectedAdminRoute'
import Breadcrumbs from './components/Breadcrumbs'
import TeacherProfileHeader from './components/TeacherProfileHeader'
import TeacherTabs from './components/TeacherTabs'
import PersonalInfoCard from './components/PersonalInfoCard'
import ProfessionalInfoCard from './components/ProfessionalInfoCard'
import StatisticsCard from './components/StatisticsCard'
import TimetableToolbar from './schedule/TimetableToolbar'
import SchedulePage from './schedule/SchedulePage'
import AcademicPerformancePage from '../../students/profilePage/components/AcademicPerformance/AcademicPerformancePage'
import PerformancePage from './performance/PerformancePage'


const mockTeacherData = {
  id: '1',
  name: 'Dr. Eleanor Vance',
  title: 'Senior Maths Teacher',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmpuwUGDmWSnAYeiA59QIA5gfVXUhS6H7pZO1WzZlqF3adpaWXJWW1LhbSfCvkLKbDk96GKyea0u9cA42tCe3p4IMPYKudGRDle-HwMoAxJhqvA47-xEunmEA4ZpF1PFdvRbgam9WJDxxORkuvsjUdjZTmhFONOGXepi9sLF9QL5Bi9nKeIeuMyduwU7uSxNLU8YH7HIm_fzDDU7O2wIE_-QHRr1q84JU28DpncIjSRBPhP6AxKFxA4GcedQumfEdEiw6CafTxKK0',
  status: 'active' as const,
  personalInfo: {
    fullName: 'Dr. Eleanor Vance',
    gender: 'Female',
    email: 'e.vance@university.edu',
    phone: '+1 (234) 567-8901',
    address: '123 University Drive, Scholarstown, ST 12345',
    highestQualification: 'Ph.D. in Mathematics',
    yearsOfExperience: '12 Years'
  },
  professionalInfo: {
    department: 'Mathematics',
    subjects: ['Algebra', 'Calculus', 'Geometry'],
    assignedClasses: ['Grade 10 - Section A', 'Grade 11 - Section B', 'Grade 12 - Section A']
  },
  statistics: {
    classPerformance: '87%',
    attendanceRate: '98%',
    upcomingClasses: '4',
    studentsTaught: '85'
  }
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'performance', label: 'Performance Reports' }
]

export default function TeacherProfilePage() {
  const [activeTab, setActiveTab] = useState('overview')

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Teachers', href: '/dashboard/admin/teachers' },
    { label: mockTeacherData.name, active: true }
  ]

  return (
    // <ProtectedAdminRoute>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} />

          <TeacherProfileHeader
            teacher={{
              name: mockTeacherData.name,
              subjects: mockTeacherData.professionalInfo.subjects,
              assignedClasses: mockTeacherData.professionalInfo.assignedClasses,
              avatar: mockTeacherData.avatar,
              status: mockTeacherData.status
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
                <PersonalInfoCard personalInfo={mockTeacherData.personalInfo} />
                <ProfessionalInfoCard professionalInfo={mockTeacherData.professionalInfo} />
              </div>

              {/* Right Column: Statistics Widgets */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <StatisticsCard statistics={mockTeacherData.statistics} />
              </div>
            </div>
          )}
          {activeTab === 'schedule' && (
            <SchedulePage />
          )}
          {activeTab === 'performance' && (
            <PerformancePage />
          )}
          {/* Add other tab content here */}
          {activeTab !== 'overview' && (
            <div className="mt-6 p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
              <p>{tabs.find(tab => tab.id === activeTab)?.label} content coming soon...</p>
            </div>
          )}
        </div>
      </main>
    // </ProtectedAdminRoute>
  )
}