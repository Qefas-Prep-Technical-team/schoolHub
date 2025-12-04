// app/student/classes/[id]/assignments/components/AssignmentsList.tsx

import AssignmentCard from './AssignmentCard'
import { Assignment } from './assignmentsData'

interface AssignmentsListProps {
  assignments: Assignment[]
}

export default function AssignmentsList({ assignments }: AssignmentsListProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 text-5xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No assignments found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  // Sort assignments: overdue first, then by due date
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1
    if (b.status === 'overdue' && a.status !== 'overdue') return 1
    
    // Parse dates for comparison
    const dateA = new Date(a.dueDate)
    const dateB = new Date(b.dueDate)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="flex flex-col gap-4">
      {sortedAssignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  )
}