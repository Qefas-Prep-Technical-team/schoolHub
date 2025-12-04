'use client'

import { cn } from "@/lib/utils"
import { formatRelativeDate, getAssignmentStatusColor, getSubjectColor } from "./dashboardUtils"
import { Assignment } from "./types"


interface AssignmentsListProps {
  assignments: Assignment[]
  title?: string
  viewAllLink?: string
  className?: string
}

export function AssignmentsList({
  assignments,
  title = 'Upcoming Assignments',
  viewAllLink,
  className
}: AssignmentsListProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </a>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <span className={cn(
              "inline-flex items-center rounded-md px-2 py-1 text-sm font-medium",
              getSubjectColor(assignment.subject)
            )}>
              {assignment.subject}
            </span>
            
            <div className="flex-grow">
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {assignment.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatRelativeDate(assignment.dueDate)}
              </p>
            </div>
            
            <div className="w-full sm:w-auto flex items-center gap-4">
              <span className={cn(
                "text-sm font-medium",
                getAssignmentStatusColor(assignment.status)
              )}>
                {assignment.status.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
              
              <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}