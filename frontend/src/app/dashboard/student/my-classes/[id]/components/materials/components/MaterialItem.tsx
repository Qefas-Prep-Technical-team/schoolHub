// app/student/classes/[id]/materials/components/MaterialItem.tsx
import { Download, Play, FileText, Video, File, Presentation, Music, Image, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MaterialItemProps {
  material: any
  viewMode: 'list' | 'grid'
  onPreview: (material: any) => void
}

export default function MaterialItem({ material, viewMode, onPreview }: MaterialItemProps) {
  const getIconConfig = (type: string) => {
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
      default:
        return { icon: File, bgColor: 'bg-slate-100 dark:bg-slate-900/50', textColor: 'text-slate-655 dark:text-slate-400' }
    }
  }

  const getFileExtension = (title: string) => {
    return title.split('.').pop()?.toUpperCase()
  }

  const iconConfig = getIconConfig(material.type)
  const IconComponent = iconConfig.icon

  if (viewMode === 'grid') {
    return (
      <Card 
        onClick={() => onPreview(material)}
        className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center justify-center size-12 rounded-full ${iconConfig.bgColor}`}>
              <IconComponent className={`h-6 w-6 ${iconConfig.textColor}`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {material.folder}
            </span>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
              {material.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="truncate">By {material.teacher}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {material.uploadDate}
              </span>
              <span className="text-xs text-gray-450 dark:text-gray-500 font-medium">
                {getFileExtension(material.title)}
              </span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(material);
            }}
          >
            <Eye className="h-4 w-4" />
            Preview / View Info
          </Button>
        </div>
      </Card>
    )
  }

  // List View
  return (
    <div 
      onClick={() => onPreview(material)}
      className="grid grid-cols-12 items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800/40 border border-slate-150 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
    >
      <div className="col-span-1 flex items-center justify-center">
        <div className={`flex items-center justify-center size-10 rounded-full ${iconConfig.bgColor}`}>
          <IconComponent className={`h-5 w-5 ${iconConfig.textColor}`} />
        </div>
      </div>
      
      <div className="col-span-11 sm:col-span-5">
        <p className="font-semibold text-gray-900 dark:text-white truncate">
          {material.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
            {material.folder}
          </span>
          {material.size && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {material.size}
            </span>
          )}
        </div>
      </div>
      
      <div className="hidden sm:block sm:col-span-3">
        <p className="text-sm text-gray-500 dark:text-gray-450 truncate">
          {material.teacher}
        </p>
      </div>
      
      <div className="hidden sm:block sm:col-span-2">
        <p className="text-sm text-gray-500 dark:text-gray-450">
          {material.uploadDate}
        </p>
      </div>
      
      <div className="col-span-11 sm:col-span-1 flex justify-end">
        <Button 
          size="icon" 
          variant="ghost"
          className="size-9 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(material);
          }}
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}