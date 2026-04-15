'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Toolbar } from './components/Toolbar'
import { StudentTable } from './components/StudentTable'
import { Pagination } from './components/Pagination'
import { ClassInfo, Student } from './components/types'
import { teacherService } from '@/lib/api/services/teacherService'
import { Loader2 } from 'lucide-react'


const tabs = [
  { id: 'students', label: 'Students' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'grades', label: 'Grades' },
  { id: 'attendance', label: 'Attendance' },
]

const filtersList = ['Status', 'Gender', 'Performance', 'Attendance']

export default function StudentsPage() {
  const params = useParams()
  const classId = params.classId as string
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-students', classId, searchQuery, currentPage],
    queryFn: () => teacherService.getStudents({
      classId,
      search: searchQuery,
      page: currentPage,
      limit: itemsPerPage
    }),
    enabled: !!classId,
  })

  // Map backend student format to frontend student format if needed
  const students: Student[] = data?.students.map((s: any) => ({
    id: s.id,
    name: s.name,
    studentId: `#${s.id.slice(-5).toUpperCase()}`,
    gender: 'N/A', // Not in basic student list yet
    status: 'active',
    avatar: s.avatarUrl || 'https://images.unsplash.com/photo-1494790108755-2616b786d4d4?w=32&h=32&fit=crop&crop=face'
  })) || []

  const totalItems = data?.total || 0

  const handleViewStudent = (student: Student) => {
    console.log('View student:', student)
    // Implement view logic
  }

  const handleCallStudent = (student: Student) => {
    console.log('Call student:', student)
    // Implement call logic
  }

  const handleAddStudent = () => {
    console.log('Add student clicked')
    // Implement add student logic
  }

  const handleFilterClick = (filter: string) => {
    console.log('Filter clicked:', filter)
    // Implement filter logic
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen  flex-col group/design-root overflow-x-hidden w-full">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
           

            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddStudent={handleAddStudent}
              filters={filtersList}
              onFilterClick={handleFilterClick}
            />

            <StudentTable
              students={students}
              onView={handleViewStudent}
              onCall={handleCallStudent}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}