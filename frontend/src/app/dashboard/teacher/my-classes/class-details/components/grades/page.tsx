'use client'
import { useState, useEffect } from 'react'
import { GradeFilter, StudentGrade } from './components/types'
import { GradeStatistics } from './components/GradeStatistics'
import { GradeToolbar } from './components/GradeToolbar'
import { GradeTable } from './components/GradeTable'
import { EditGradeDialog } from './components/EditGradeDialog'

const mockGrades: StudentGrade[] = [
  {
    id: '1',
    studentId: '101',
    studentName: 'Amelia Anderson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b786d4d4?w=32&h=32&fit=crop&crop=face',
    grades: {
      continuousAssessment: { score: 45, total: 50, percentage: 90 },
      exams: { score: 48, total: 50, percentage: 96 },
      total: 93,
      position: 1
    },
    status: 'graded',
    lastUpdated: new Date('2024-10-28'),
  },
  {
    id: '2',
    studentId: '102',
    studentName: 'Benjamin Carter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    grades: {
      continuousAssessment: { score: 42, total: 50, percentage: 84 },
      exams: { score: 45, total: 50, percentage: 90 },
      total: 87,
      position: 2
    },
    status: 'graded',
    lastUpdated: new Date('2024-10-28'),
  },
  {
    id: '3',
    studentId: '103',
    studentName: 'Chloe Davis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
    grades: {
      continuousAssessment: { score: undefined, total: 50 },
      exams: { score: undefined, total: 50 },
      total: 0,
    },
    status: 'pending',
  },
  {
    id: '4',
    studentId: '104',
    studentName: 'Daniel Evans',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
    grades: {
      continuousAssessment: { score: 38, total: 50, percentage: 76 },
      exams: { score: 40, total: 50, percentage: 80 },
      total: 78,
      position: 3
    },
    status: 'graded',
    lastUpdated: new Date('2024-10-27'),
  },
]

export default function GradesPage() {
  const [activeTab, setActiveTab] = useState('grades')
  const [searchQuery, setSearchQuery] = useState('')
  const [grades, setGrades] = useState<StudentGrade[]>(mockGrades)
  const [filteredGrades, setFilteredGrades] = useState<StudentGrade[]>(mockGrades)
  const [filters, setFilters] = useState<GradeFilter>({})
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    let filtered = grades

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(grade =>
        grade.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(grade => grade.status === filters.status)
    }

    // Apply score filters
    if (filters.minScore !== undefined) {
      filtered = filtered.filter(grade => 
        grade.status === 'graded' && grade.grades.total >= filters.minScore!
      )
    }

    if (filters.maxScore !== undefined) {
      filtered = filtered.filter(grade =>
        grade.status === 'graded' && grade.grades.total <= filters.maxScore!
      )
    }

    setFilteredGrades(filtered)
  }, [searchQuery, grades, filters])

  const handleEditGrade = (grade: StudentGrade) => {
    setEditingGrade(grade)
    setIsEditDialogOpen(true)
  }

  const handleSaveGrade = (updatedGrade: StudentGrade) => {
    setGrades(prev => prev.map(g => 
      g.id === updatedGrade.id ? updatedGrade : g
    ))
    setIsEditDialogOpen(false)
    setEditingGrade(null)
  }

  const handleViewDetails = (grade: StudentGrade) => {
    console.log('View grade details:', grade)
    // Navigate to student grade details
  }

  const handleImportGrades = () => {
    console.log('Import grades')
    // Implement import logic
  }

  const handleExportGrades = () => {
    console.log('Export grades')
    // Implement export logic
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
    <>
      <div className="mx-auto max-w-7xl">
      
        {/* Grade Statistics */}
        <GradeStatistics grades={grades} />

        <GradeToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={handleFilterClick}
          filters={filters}
        />

        <GradeTable
          grades={filteredGrades}
          onEditGrade={handleEditGrade}
          onViewDetails={handleViewDetails}
        />

        {/* Edit Grade Dialog */}
        {editingGrade && (
          <EditGradeDialog
            grade={editingGrade}
            onSave={handleSaveGrade}
            onClose={() => {
              setIsEditDialogOpen(false)
              setEditingGrade(null)
            }}
            open={isEditDialogOpen}
          />
        )}
      </div>
    </>
  )
}