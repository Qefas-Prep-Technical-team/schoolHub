import { UploadedFile } from './types';

interface Props {
  files: UploadedFile[];
  onRemove: (fileId: string) => void;
  onPreview: (fileId: string) => void;
}

export default function UploadedFilesList({ files, onRemove, onPreview }: Props) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'document':
        return 'description';
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'archive':
        return 'folder_zip';
      default:
        return 'insert_drive_file';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[#0e121b] dark:text-white text-base font-bold">
        Uploaded Files ({files.length})
      </p>
      
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center gap-4 rounded-lg p-3 min-h-[72px] justify-between transition-colors ${
              file.status === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-background-light dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-[#0e121b] dark:text-white flex items-center justify-center rounded-lg bg-[#e8ebf3] dark:bg-white/10 shrink-0 size-12">
                <span className="material-symbols-outlined">
                  {getFileIcon(file.type)}
                </span>
              </div>
              
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[#0e121b] dark:text-white text-base font-medium leading-normal truncate">
                    {file.name}
                  </p>
                  {file.status === 'uploading' && (
                    <span className="material-symbols-outlined text-blue-500 animate-spin text-sm">
                      progress_activity
                    </span>
                  )}
                  {file.status === 'completed' && (
                    <span className="material-symbols-outlined text-green-500 text-sm">
                      check_circle
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <p className="text-[#506795] dark:text-white/60 text-sm font-normal leading-normal">
                    {file.size}
                  </p>
                  <span className="text-[#506795] dark:text-white/60">•</span>
                  <p className={`text-sm font-medium capitalize ${getStatusColor(file.status)}`}>
                    {file.status}
                  </p>
                </div>
                
                {file.error && (
                  <p className="text-red-500 text-xs mt-1">{file.error}</p>
                )}
              </div>
            </div>
            
            <div className="shrink-0 flex items-center gap-3">
              {file.status === 'completed' && (
                <button
                  onClick={() => onPreview(file.id)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#506795] dark:text-white/60 transition-colors"
                  title="Preview file"
                >
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </button>
              )}
              
              <button
                onClick={() => onRemove(file.id)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#506795] dark:text-white/60 transition-colors"
                title="Remove file"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}