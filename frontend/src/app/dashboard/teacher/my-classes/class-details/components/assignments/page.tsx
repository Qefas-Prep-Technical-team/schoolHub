'use client'

import { useState, useEffect } from 'react'
import { AssignmentTable } from './components/AssignmentTable'
import { SearchBar } from './components/SearchBar'
import { Assignment, NavItem, User } from './components/types'

// Mock data
const mockUser: User = {
  id: '1',
  name: 'Mr. Harrison',
  role: 'Science Teacher',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwER0FJ56_TCgXMQHqPc4IjkMUQ-C6BZA2WJVHodXCKqQ6s9WY-lnFw1FS3dW8Q1zT9_HSACwABo_wiSyv29wXJvd9PSdz0fzOH2atER1-6uhYwo7QSeu0xnt3x6meaPA1yTZzvCpl8SU8eQ-beCKnZFofz-Er-vuHAW6-sUB39aBnLNMHkaPT9sA1MV2eSwiNddM90u8S879BYZyJxVfIdejxV5E5EJPG2H1lwKF-34OMw9WGYpGcS3PapZ7Q1KzAHN4BHIWQio4',
  email: 'harrison@school.edu'
}

const mockNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { id: 'my-classes', label: 'My Classes', icon: 'school', path: '/classes', active: true },
  { id: 'students', label: 'Students', icon: 'group', path: '/students' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar_today', path: '/calendar' },
  { id: 'messages', label: 'Messages', icon: 'chat_bubble', path: '/messages', badge: 3 },
]

const mockBottomNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
  { id: 'help', label: 'Help', icon: 'help', path: '/help' },
]

const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Chapter 5: Photosynthesis Lab Report',
    dueDate: new Date('2023-11-15'),
    status: 'published',
    submissions: { submitted: 22, total: 25 },
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-15'),
  },
  {
    id: '2',
    title: 'Homework: Newton\'s Laws of Motion',
    dueDate: new Date('2023-11-10'),
    status: 'closed',
    submissions: { submitted: 25, total: 25 },
    createdAt: new Date('2023-10-05'),
    updatedAt: new Date('2023-11-11'),
  },
  {
    id: '3',
    title: 'Mid-term Project Proposal',
    dueDate: new Date('2023-11-20'),
    status: 'draft',
    submissions: { submitted: 0, total: 25 },
    createdAt: new Date('2023-10-10'),
    updatedAt: new Date('2023-10-10'),
  },
  {
    id: '4',
    title: 'Final Exam Study Guide Questions',
    dueDate: new Date('2023-12-01'),
    status: 'published',
    submissions: { submitted: 5, total: 25 },
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2023-10-25'),
  },
]

const tabs = [
  { id: 'assignments', label: 'Assignments', count: 4 },
  { id: 'students', label: 'Students' },
  { id: 'grades', label: 'Grades' },
  { id: 'resources', label: 'Resources' },
]

const breadcrumbs = [
  { label: 'My Classes', href: '/classes' },
  { label: 'Grade 8 Science', href: '/classes/1' },
  { label: 'Assignments', active: true },
]

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState('assignments')
  const [searchQuery, setSearchQuery] = useState('')
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>(mockAssignments)

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