// app/student/classes/[id]/materials/components/MaterialsList.tsx
import MaterialItem from './MaterialItem'
import { StudyMaterial } from './materialsData'

interface MaterialsListProps {
  materials: StudyMaterial[]
  viewMode: 'list' | 'grid'
  emptyMessage?: string
}

export default function MaterialsList({ 
  materials, 
  viewMode, 
  emptyMessage = "No materials found" 
}: MaterialsListProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 text-5xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or selecting a different folder
        </p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material) => (
          <MaterialItem 
            key={material.id} 
            material={material} 
            viewMode="grid"
          />
        ))}
      </div>
    )
  }

  // List View
  return (
    <div className="space-y-3">
      {/* Table Headers (Desktop only) */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <div className="col-span-1"></div>
        <div className="col-span-5">File Name</div>
        <div className="col-span-3">Teacher</div>
        <div className="col-span-2">Date Added</div>
        <div className="col-span-1"></div>
      </div>
      
      {/* Materials List */}
      <div className="space-y-2">
        {materials.map((material) => (
          <MaterialItem 
            key={material.id} 
            material={material} 
            viewMode="list"
          />
        ))}
      </div>
    </div>
  )
}