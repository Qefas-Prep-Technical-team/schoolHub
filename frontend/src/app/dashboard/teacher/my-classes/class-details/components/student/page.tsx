'use client'

import { useState, useEffect } from 'react'
import { Toolbar } from './components/Toolbar'
import { StudentTable } from './components/StudentTable'
import { Pagination } from './components/Pagination'
import { ClassInfo, Student } from './components/types'


// Mock data
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Liam Smith',
    studentId: '#12345',
    gender: 'male',
    status: 'active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF0auYgqqUAm1i9EbeZYuUUWkSxdw8gtl-o2UfzDqdxEpa0P1iHAwpR5fGF_CnAZjZN8dHaY7qEebnhgds1Ff50wbSqTpd6ZikHrUM0R58RnmQLPqxBhiIsSj1qkokaQVEzYE8U9CZridAa8Yd2fege5DxdkAcN_qxhlF7U9RJe0bMUAmtZ0sfZsVxtWeCytMdBk-7UC9MppxxUjYP1dtjEeDARgHQeIeY_x3JlZqEe-uOOGoBVK6-RQ3M1ZKpmYwT-5J09qe9rg0'
  },
  {
    id: '2',
    name: 'Olivia Johnson',
    studentId: '#12346',
    gender: 'female',
    status: 'active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpyi2O2h4CBa2t9lIFPn2Psj1LHku0DqNUrJbSXazplbgDcaKpaSo2FfVhBlvj82CDyjNWWhZYuGTRYVcz7-AutWjrkXGxJe1hTlAuSr8T9SZVuPzOub5S391LBKoGmKVHbtrd8MvtcdmL_1vkMEObXOJkCopedesbGID94hrG5FWRhPQsJVa62BeGW8izRFCyN7ewxQaJ1aHN3TD-3BX4jgz_xZBFVZ4GK-qjIhj--T-qtbVNWsm_g1wsxeD_f1U6c1yQtPiLfFU'
  },
  {
    id: '3',
    name: 'Noah Williams',
    studentId: '#12347',
    gender: 'male',
    status: 'suspended',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSd2rCNPBpPwhKZsknLCs7t2kfhklqjCdFJPJar8YdvECHsE_l3TQsHMkVIc9PEx8DV4XI9l9N8D_amBsMf_P9o-il_-fo0w-gBko1lc2-_KCjM_18rRDzGGXYpPpOeOYlZbeV4FJFkjAQVxEF3t8jZ22SpEhW7BOcWzm-_yu8yof-9NvB1FJ65FQplM0AQQBFHOqOJ8DwHMt9H4oyaPG_LDC5Z-_PYj18h6YCDB0hEXpYOXoBF5_WRBtMoOk5f_sOCx4yGkUDBtk'
  },
  {
    id: '4',
    name: 'Emma Brown',
    studentId: '#12348',
    gender: 'female',
    status: 'transferred',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgdQ3vBRFk2Pg99ztpSIJae7wlgmEvCscf1U3lcn9mc3HLGQ2Gl-GKkNliVj7ONeGTUVH8fQEooox4A8zxVxRqqScEL2pohanGGie9CUS4pSwEFN8tVpCkeKGiu_tvFLuiv8M1RaFM9Fpr5LsxX3ZI6tu2Gngo3vG8ygFhY7GsSn80V9rrVR09bcEHQia5wX1HsozHsBu4AGZDD9JuuFHbu7SuTKILNcq6U0D5zZ4OYTNQs6_LesK5Qi2FRa7Pq54acpJhT0Rg5xI'
  }
]

const tabs = [
  { id: 'students', label: 'Students' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'grades', label: 'Grades' },
  { id: 'attendance', label: 'Attendance' },
]

const filters = ['Status', 'Gender', 'Performance', 'Attendance']

export default function StudentsPage() {

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(mockStudents)


  const itemsPerPage = 10
  const totalItems = 25

  useEffect(() => {
    // Filter students based on search query
    if (!searchQuery.trim()) {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [searchQuery, students])

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

  return (
    <div className="relative flex h-auto min-h-screen  flex-col group/design-root overflow-x-hidden w-full">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
           

            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddStudent={handleAddStudent}
              filters={filters}
              onFilterClick={handleFilterClick}
            />

            <StudentTable
              students={filteredStudents}
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