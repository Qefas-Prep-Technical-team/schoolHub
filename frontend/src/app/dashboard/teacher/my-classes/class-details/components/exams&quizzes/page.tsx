'use client'

import { useState, useEffect } from 'react'
import { ExamToolbar } from './components/ExamToolbar'
import { ExamTable } from './components/ExamTable'
import { Exam, ExamFilter } from './components/types'






const mockBottomNavItems = [
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
  { id: 'logout', label: 'Logout', icon: 'logout', path: '/logout' },
]

const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Mid-Term Biology Exam',
    type: 'exam',
    questions: 50,
    totalMarks: 100,
    scheduledDate: new Date('2024-10-25'),
    status: 'graded',
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-10-26'),
    classId: '1',
  },
  {
    id: '2',
    title: 'Chapter 5 Pop Quiz',
    type: 'quiz',
    questions: 10,
    totalMarks: 10,
    scheduledDate: new Date('2024-11-02'),
    status: 'scheduled',
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-20'),
    classId: '1',
  },
  {
    id: '3',
    title: 'Photosynthesis Quiz',
    type: 'quiz',
    questions: 15,
    totalMarks: 20,
    scheduledDate: new Date('2024-10-18'),
    status: 'completed',
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-10-19'),
    classId: '1',
  },
  {
    id: '4',
    title: 'Final Exam',
    type: 'exam',
    questions: 0,
    totalMarks: 150,
    scheduledDate: new Date('2024-12-15'),
    status: 'draft',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
    classId: '1',
  },
]

const tabs = [
  { id: 'students', label: 'Students' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'exams-quizzes', label: 'Exams & Quizzes', count: mockExams.length },
  { id: 'grades', label: 'Grades' },
]

const breadcrumbs = [
  { label: 'My Classes', href: '/classes' },
  { label: 'Biology - Period 3', href: '/classes/1' },
  { label: 'Exams & Quizzes', active: true },
]

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState('exams-quizzes')
  const [searchQuery, setSearchQuery] = useState('')
  const [exams, setExams] = useState<Exam[]>(mockExams)
  const [filteredExams, setFilteredExams] = useState<Exam[]>(mockExams)
  const [filters, setFilters] = useState<ExamFilter>({})

  useEffect(() => {
    let filtered = exams

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply other filters
    if (filters.type) {
      filtered = filtered.filter(exam => exam.type === filters.type)
    }

    if (filters.status) {
      filtered = filtered.filter(exam => exam.status === filters.status)
    }

    if (filters.dateRange) {
      filtered = filtered.filter(exam =>
        exam.scheduledDate >= filters.dateRange!.start &&
        exam.scheduledDate <= filters.dateRange!.end
      )
    }

    setFilteredExams(filtered)
  }, [searchQuery, exams, filters])

  const handleViewExam = (exam: Exam) => {
    console.log('View exam:', exam)
    // Navigate to exam details
  }

  const handleEditExam = (exam: Exam) => {
    console.log('Edit exam:', exam)
    // Navigate to exam editor
  }

  const handleDeleteExam = (exam: Exam) => {
    if (confirm(`Are you sure you want to delete "${exam.title}"?`)) {
      setExams(prev => prev.filter(e => e.id !== exam.id))
    }
  }

  const handleDuplicateExam = (exam: Exam) => {
    const duplicate = {
      ...exam,
      id: Math.random().toString(36).substr(2, 9),
      title: `${exam.title} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setExams(prev => [duplicate, ...prev])
  }

  const handleExportExam = (exam: Exam) => {
    console.log('Export exam:', exam)
    // Implement export logic
  }

  const handleCreateExam = () => {
    console.log('Create new exam')
    // Navigate to exam creator
  }

  const handleFilterClick = () => {
    console.log('Open filter dialog')
    // Implement filter dialog
  }

  const handleLogout = () => {
    console.log('Logout')
    // Implement logout logic
  }

  return (
    < >
      <div className="mx-auto max-w-7xl">

       

        {/* Stats Cards (Optional) */}
        {/* <ExamStats exams={exams} className="my-6" /> */}

        <ExamToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={handleFilterClick}
          filters={filters}
        />

        <ExamTable
          exams={filteredExams}
          onView={handleViewExam}
          onEdit={handleEditExam}
          onDelete={handleDeleteExam}
          onDuplicate={handleDuplicateExam}
          onExport={handleExportExam}
        />
      </div>
    </>
  )
}