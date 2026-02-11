import { SubmittedFile } from './types';

interface Props {
  files: SubmittedFile[];
  onDownload: (fileId: string) => void;
}

export default function SubmittedFiles({ files, onDownload }: Props) {
  const getFileIcon = (type: string, color: string) => {
    switch (type) {
      case 'pdf':
        return {
          icon: 'picture_as_pdf',
          className: `text-${color}-500`,
        };
      case 'document':
        return {
          icon: 'description',
          className: `text-${color}-500`,
        };
      case 'image':
        return {
          icon: 'image',
          className: `text-${color}-500`,
        };
      case 'video':
        return {
          icon: 'videocam',
          className: `text-${color}-500`,
        };
      default:
        return {
          icon: 'insert_drive_file',
          className: `text-${color}-500`,
        };
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[#506795] dark:text-gray-400 text-sm font-normal leading-normal mb-3">
        Files Submitted
      </p>
      
      <ul className="space-y-2">
        {files.map((file) => {
          const icon = getFileIcon(file.type, file.iconColor);
          
          return (
            <li 
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
            >
              <span className={`material-symbols-outlined text-xl ${icon.className}`}>
                {icon.icon}
              </span>
              
              <div className="flex-1 min-w-0">
                <span className="text-[#0e121b] dark:text-white/90 text-sm font-medium leading-normal truncate block">
                  {file.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {file.size}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">•</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs capitalize">
                    {file.type}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => onDownload(file.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/20"
                title="Download file"
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                  download
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-base">info</span>
          <span>Total files: {files.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="text-sm text-primary hover:underline">
            View all files
          </button>
        </div>
      </div>
    </div>
  );
}