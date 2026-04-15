'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AssignmentTable } from './components/AssignmentTable'
import { SearchBar } from './components/SearchBar'
import { Assignment, NavItem, User } from './components/types'
import { teacherService } from '@/lib/api/services/teacherService'
import { Loader2 } from 'lucide-react'

// ... mockUser, mockNavItems etc (keeping them for now if used elsewhere, but data should be dynamic)

export default function AssignmentsPage() {
  const params = useParams()
  const classId = params.classId as string
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-assignments', classId],
    queryFn: () => teacherService.getClassAssignments(classId),
    enabled: !!classId,
  })

  const assignments: Assignment[] = (data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    dueDate: new Date(a.dueDate),
    status: a.status as 'published' | 'draft' | 'closed',
    submissions: a.submissions,
    createdAt: new Date(a.createdAt),
    updatedAt: new Date(a.updatedAt),
  }))

  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssignments(assignments)
    } else {
      const filtered = assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAssignments(filtered)
    }
  }, [searchQuery, data]) // Re-run when data changes

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssignments(assignments)
    } else {
      const filtered = assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAssignments(filtered)
    }
  }, [searchQuery, assignments])

  const handleViewAssignment = (assignment: Assignment) => {
    console.log('View assignment:', assignment)
    // Implement view logic
  }

  const handleEditAssignment = (assignment: Assignment) => {
    console.log('Edit assignment:', assignment)
    // Implement edit logic
  }

  const handleGradeAssignment = (assignment: Assignment) => {
    console.log('Grade assignment:', assignment)
    // Implement grade logic
  }

  const handleAddAssignment = () => {
    console.log('Add new assignment')
    // Implement add assignment logic
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Loading assignments...</p>
      </div>
    );
  }

  return (
   
      <div className="max-w-7xl mx-auto">
       
   

       

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search assignments..."
        />

        <AssignmentTable
          assignments={filteredAssignments}
          onView={handleViewAssignment}
          onEdit={handleEditAssignment}
          onGrade={handleGradeAssignment}
        />
      </div>
   
  )
}