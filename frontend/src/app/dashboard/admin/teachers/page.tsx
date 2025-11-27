"use client"
import { useState } from 'react'
import { ProtectedAdminRoute } from '../components/ProtectedAdminRoute'
import Header from './components/Header'
import SearchFilters from './components/SearchFilters'
import BulkActions from './components/BulkActions'
import TeacherTable from './components/TeacherTable'
import { Teacher } from './components/TeacherRow'




const mockTeachers: Teacher[] = [
  {
    id: 'TCH-001',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@school.edu',
    subjects: ['Mathematics', 'Physics'],
    assignedClasses: ['Algebra II', 'AP Physics'],
    status: 'active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2gOnLMkB1X91hN_nDIpEKk3PLFUmy47_wuOO05diVD6jUU877Y-yZBgx_6TsmqEErLuL6Wzbv6FNE7_V874TsUe047IsQYLzgzu_eyEFt1NGCnMNZlEgP1anLtd0Sd8WTzU_W65HOmJpj4zV9kmjddgv52enjRL3eJL9uydygNNILDtrTk6p2QTIKcklh6M19gpm2Q-SbuUrYGx0fbo0DHvf18QbxwJf2cJSGVcJeuhdbwjVm1P8B3OpCbPrAUnoTpnz48AEfom0'
  },
  // ... other teachers
]

export default function ManageTeachersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])

  const filteredTeachers = mockTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
    teacher.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    )
  }

  const handleSelectAll = () => {
    setSelectedTeachers(
      selectedTeachers.length === filteredTeachers.length
        ? []
        : filteredTeachers.map(teacher => teacher.id)
    )
  }

  const handleAddTeacher = () => {
    // Implement add teacher logic
    console.log('Add teacher clicked')
  }

  return (
    <ProtectedAdminRoute>
      <div className="relative flex min-h-screen w-full">
        
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Header
              title="Manage Teachers"
              description="Search, filter, and manage teacher profiles and assignments."
              action={{
                label: "Add Teacher",
                icon: "add",
                onClick: handleAddTeacher
              }}
            />

            <SearchFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <BulkActions
              selectedCount={selectedTeachers.length}
              onAssignClasses={() => console.log('Assign classes')}
              onToggleStatus={() => console.log('Toggle status')}
              onDelete={() => console.log('Delete teachers')}
            />

            <TeacherTable
              teachers={filteredTeachers}
              selectedTeachers={selectedTeachers}
              onSelectTeacher={handleTeacherSelect}
              onSelectAll={handleSelectAll}
            />
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  )
}