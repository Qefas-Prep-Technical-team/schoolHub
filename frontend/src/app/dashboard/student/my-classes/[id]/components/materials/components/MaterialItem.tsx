// app/student/classes/[id]/materials/components/MaterialItem.tsx
import { Download, Play, FileText, Video, File, Presentation, Music, Image } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudyMaterial } from './materialsData'

interface MaterialItemProps {
  material: StudyMaterial
  viewMode: 'list' | 'grid'
}

export default function MaterialItem({ material, viewMode }: MaterialItemProps) {
  const getIconConfig = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return { icon: FileText, bgColor: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-600 dark:text-red-400' }
      case 'video':
        return { icon: Video, bgColor: 'bg-blue-100 dark:bg-blue-900/50', textColor: 'text-blue-600 dark:text-blue-400' }
      case 'document':
        return { icon: File, bgColor: 'bg-sky-100 dark:bg-sky-900/50', textColor: 'text-sky-600 dark:text-sky-400' }
      case 'slideshow':
        return { icon: Presentation, bgColor: 'bg-amber-100 dark:bg-amber-900/50', textColor: 'text-amber-600 dark:text-amber-400' }
      case 'audio':
        return { icon: Music, bgColor: 'bg-purple-100 dark:bg-purple-900/50', textColor: 'text-purple-600 dark:text-purple-400' }
      case 'image':
        return { icon: Image, bgColor: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-600 dark:text-green-400' }
    }
  }

  const getActionIcon = (type: StudyMaterial['type']) => {
    return type === 'video' ? Play : Download
  }

  const getFileExtension = (title: string) => {
    return title.split('.').pop()?.toUpperCase()
  }

  const iconConfig = getIconConfig(material.type)
  const IconComponent = iconConfig.icon
  const ActionIcon = getActionIcon(material.type)

  if (viewMode === 'grid') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-4">
          <div className={`flex items-center justify-center size-12 rounded-full ${iconConfig.bgColor}`}>
            <IconComponent className={`h-6 w-6 ${iconConfig.textColor}`} />
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
              {material.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="truncate">{material.teacher}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {material.uploadDate}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getFileExtension(material.title)}
              </span>
            </div>
          </div>
          
          <Button size="sm" variant="outline" className="w-full gap-2">
            <ActionIcon className="h-4 w-4" />
            {material.type === 'video' ? 'Play' : 'Download'}
          </Button>
        </div>
      </Card>
    )
  }

  // List View
  return (
    <div className="grid grid-cols-12 items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <div className="col-span-1 flex items-center justify-center">
        <div className={`flex items-center justify-center size-10 rounded-full ${iconConfig.bgColor}`}>
          <IconComponent className={`h-5 w-5 ${iconConfig.textColor}`} />
        </div>
      </div>
      
      <div className="col-span-11 sm:col-span-5">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {material.title}
        </p>
        {material.size && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {material.size}
          </p>
        )}
      </div>
      
      <div className="hidden sm:block sm:col-span-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {material.teacher}
        </p>
      </div>
      
      <div className="hidden sm:block sm:col-span-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {material.uploadDate}
        </p>
      </div>
      
      <div className="col-span-11 sm:col-span-1 flex justify-end">
        <Button 
          size="icon" 
          variant="ghost"
          className="size-9"
        >
          <ActionIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}