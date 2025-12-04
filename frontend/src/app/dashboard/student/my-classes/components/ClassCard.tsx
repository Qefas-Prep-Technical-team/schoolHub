// app/student/classes/components/ClassCard.tsx
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClassItem } from './types'
import { Progress } from './ui/progress'
import Link from 'next/link'

interface ClassCardProps {
  classItem: ClassItem
}

export default function ClassCard({ classItem }: ClassCardProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 30) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getProgressTextColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 50) return 'text-blue-600'
    if (progress >= 30) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      
      <CardContent className="pt-6 flex-grow">
        {/* Class Title */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {classItem.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {classItem.subject} / {classItem.teacher}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Progress
            </span>
            <span className={`text-sm font-bold ${getProgressTextColor(classItem.progress)}`}>
              {classItem.progress}% Complete
            </span>
          </div>
          <Progress 
            value={classItem.progress} 
            className={`h-2 ${getProgressColor(classItem.progress)}`} 
          />
        </div>

        {/* Class Info */}
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <span className="text-blue-600 dark:text-blue-400">📝</span>
            </div>
            <span className="line-clamp-1">
              {classItem.assignmentsDue === 0 
                ? 'All assignments submitted' 
                : `${classItem.assignmentsDue} Assignment${classItem.assignmentsDue > 1 ? 's' : ''} Due`
              }
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
              <span className="text-green-600 dark:text-green-400">📅</span>
            </div>
            <span className="line-clamp-1">{classItem.nextClass}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto">
        <Link className='w-full' href={`/dashboard/student/my-classes/${classItem.id}`}>

        <Button 
          className="w-full cursor-pointer" 
          variant={classItem.status === 'completed' ? 'secondary' : 'default'}
        >
          {classItem.status === 'completed' ? 'View Results' : 'View Class'}
        </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}