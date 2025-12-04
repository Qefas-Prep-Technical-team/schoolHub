// app/student/classes/components/ClassesGrid.tsx
import ClassCard from './ClassCard'
import { ClassItem } from './types'

interface ClassesGridProps {
  classes: ClassItem[]
}

export default function ClassesGrid({ classes }: ClassesGridProps) {
  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No classes found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classItem) => (
        <ClassCard key={classItem.id} classItem={classItem} />
      ))}
    </div>
  )
}