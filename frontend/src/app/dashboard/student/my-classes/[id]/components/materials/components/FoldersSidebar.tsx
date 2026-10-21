import { Folder } from 'lucide-react';

interface FoldersSidebarProps {
  folders: string[];
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
}

export default function FoldersSidebar({ 
  folders, 
  selectedFolder, 
  onFolderSelect 
}: FoldersSidebarProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
        Folders
      </h2>
      
      <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => onFolderSelect(folder)}
            className={`
              flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold
              transition-all text-left whitespace-nowrap shrink-0 border
              ${selectedFolder === folder
                ? 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200/80 dark:border-pink-800/50 shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }
            `}
          >
            <Folder className="h-4 w-4 shrink-0" />
            <span className="truncate">{folder}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}