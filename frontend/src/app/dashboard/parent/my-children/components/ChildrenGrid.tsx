import React from 'react'
import ChildCard from './ChildCard'
import AddChildCard from './AddChildCard'
import { ChildSummary } from '@/lib/api/services/parentService'
import { useParentChildren } from '@/lib/api/hooks/useParentChildren'

interface Child {
  id: string
  name: string
  age: number
  grade: string
  class: string
  studentId: string
  imageUrl: string
  attendance: number
  gradeValue: string | number
  gradePercentage?: string
  status: 'active' | 'inactive'
  badge: {
    text: string
    color: 'green' | 'blue' | 'purple'
    icon: string
  }
}

export default function ChildrenGrid() {
  const { data: children = [], isLoading, isError } = useParentChildren()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[300px] bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-medium">Failed to load children. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }


  // Map backend children to frontend Child interface
  const mappedChildren: Child[] = children.map((c) => ({
    id: c.id,
    name: c.name,
    age: 0, // Age not returned from basic profile
    grade: c.stats.averageGrade > 80 ? 'A' : c.stats.averageGrade > 60 ? 'B' : 'C',
    class: c.currentClass ? `${c.currentClass.name} ${c.currentClass.section || ''}` : 'No Class Assigned',
    studentId: c.studentCode,
    imageUrl: c.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=ea580c&color=fff`,
    attendance: c.stats.attendanceRate,
    gradeValue: c.stats.averageGrade > 80 ? 'A' : c.stats.averageGrade > 60 ? 'B' : 'C',
    gradePercentage: `${c.stats.averageGrade}%`,
    status: (c.linkStatus === 'ACCEPTED' || c.linkStatus === 'active') ? 'active' : 'inactive',
    badge: {
      text: c.stats.averageGrade > 90 ? 'Top Performer' : 'Maintained',
      color: c.stats.averageGrade > 90 ? 'green' : 'blue',
      icon: c.stats.averageGrade > 90 ? 'stars' : 'trending_up',
    },
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mappedChildren.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
      <AddChildCard childrenCount={mappedChildren.length} />
    </div>
  )
}
