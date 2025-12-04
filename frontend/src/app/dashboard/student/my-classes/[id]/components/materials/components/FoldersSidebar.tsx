// app/student/classes/[id]/materials/components/FoldersSidebar.tsx
import { Folder } from 'lucide-react'

interface FoldersSidebarProps {
  folders: string[]
  selectedFolder: string
  onFolderSelect: (folder: string) => void
}

export default function FoldersSidebar({ 
  folders, 
  selectedFolder, 
  onFolderSelect 
}: FoldersSidebarProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 px-2">
        Folders
      </h2>
      
      <div className="flex flex-col gap-1">
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => onFolderSelect(folder)}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors text-left
              ${selectedFolder === folder
                ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }
            `}
          >
            <Folder className="h-5 w-5" />
            <span className="truncate">{folder}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}