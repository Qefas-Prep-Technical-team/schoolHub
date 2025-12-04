// app/student/classes/[id]/assignments/components/AssignmentsLayout.tsx
'use client'

import { useState } from 'react'
import SidebarFilters from './SidebarFilters'
import PageHeader from './PageHeader'
import SearchAndSort from './SearchAndSort'
import AssignmentsList from './AssignmentsList'
import { Assignment } from './assignmentsData'


interface AssignmentsLayoutProps {
  assignments: Assignment[]
}

export default function AssignmentsLayout({ assignments }: AssignmentsLayoutProps) {
  const [filteredAssignments, setFilteredAssignments] = useState(assignments)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredAssignments(assignments)
      return
    }
    
    const filtered = assignments.filter(assignment =>
      assignment.title.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredAssignments(filtered)
  }

  const handleClearFilters = () => {
    setFilteredAssignments(assignments)
    setSearchQuery('')
  }

  return (
    <div className="flex gap-8">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col gap-6">
        <PageHeader
          title="History 101"
          subtitle="Assignments"
          showBackButton={true}
        />
        
        <SidebarFilters 
          assignments={assignments}
          onFilterChange={setFilteredAssignments}
          onClearFilters={handleClearFilters}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6">
        <SearchAndSort 
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onClearFilters={handleClearFilters}
        />
        
        <AssignmentsList assignments={filteredAssignments} />
      </main>
    </div>
  )
}