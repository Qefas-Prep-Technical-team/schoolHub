// app/student/classes/[id]/assignments/components/AssignmentCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Signal, SignalMedium, SignalHigh } from 'lucide-react'
import { Assignment } from './assignmentsData'

interface AssignmentCardProps {
  assignment: Assignment
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const getStatusConfig = (status: Assignment['status']) => {
    switch (status) {
      case 'graded':
        return { 
          label: 'Graded', 
          bgColor: 'bg-green-100 dark:bg-green-900/50', 
          textColor: 'text-green-700 dark:text-green-300' 
        }
      case 'submitted':
        return { 
          label: 'Submitted', 
          bgColor: 'bg-blue-100 dark:bg-blue-900/50', 
          textColor: 'text-blue-700 dark:text-blue-300' 
        }
      case 'pending':
        return { 
          label: 'Pending', 
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', 
          textColor: 'text-yellow-700 dark:text-yellow-300' 
        }
      case 'overdue':
        return { 
          label: 'Overdue', 
          bgColor: 'bg-red-100 dark:bg-red-900/50', 
          textColor: 'text-red-700 dark:text-red-300' 
        }
    }
  }

  const getDifficultyIcon = (difficulty: Assignment['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return <Signal className="h-4 w-4" />
      case 'medium':
        return <SignalMedium className="h-4 w-4" />
      case 'hard':
        return <SignalHigh className="h-4 w-4" />
    }
  }

  const getDifficultyText = (difficulty: Assignment['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Easy'
      case 'medium': return 'Medium'
      case 'hard': return 'Hard'
    }
  }

  const getButtonText = (status: Assignment['status']) => {
    switch (status) {
      case 'graded': return 'View Grade'
      case 'submitted': return 'View Submission'
      case 'pending':
      case 'overdue': return 'Submit Assignment'
    }
  }

  const statusConfig = getStatusConfig(assignment.status)

  return (
    <Card className={`
      hover:shadow-md transition-shadow
      ${assignment.status === 'overdue' 
        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
        : 'border-gray-200 dark:border-gray-700'
      }
    `}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {assignment.title}
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Due: {assignment.dueDate}</span>
              
              <div className="hidden sm:block">•</div>
              
              <div className="flex items-center gap-1.5">
                {getDifficultyIcon(assignment.difficulty)}
                <span>{getDifficultyText(assignment.difficulty)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
            
            {assignment.isDueToday && (
              <span className="inline-flex items-center justify-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                Due Today
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end">
          <Button className="w-full sm:w-auto">
            {getButtonText(assignment.status)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}