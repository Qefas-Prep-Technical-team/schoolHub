// app/student/classes/[id]/components/ClassOverview.tsx
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ClassOverviewProps {
  teacher: {
    name: string
    title: string
    avatar: string
    email: string
  }
  description: string
}

export default function ClassOverview({ teacher, description }: ClassOverviewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-white shadow-sm"
              style={{ backgroundImage: `url(${teacher.avatar})` }}
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {teacher.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {teacher.title}
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Contact
          </Button>
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Course Description
          </h4>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}