import { UploadedFile } from './types';

interface Props {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilePreviewModal({ file, isOpen, onClose }: Props) {
  if (!isOpen || !file) return null;

  const getPreviewContent = () => {
    if (file.type === 'pdf') {
      return (
        <iframe
          src={file.url}
          className="w-full h-full"
          title={file.name}
        />
      );
    }
    
    if (file.type === 'image') {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
        />
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
          {file.type === 'document' ? 'description' : 'insert_drive_file'}
        </span>
        <p className="text-lg font-semibold text-gray-600 mb-2">{file.name}</p>
        <p className="text-sm text-gray-500">{file.size}</p>
        <a
          href={file.url}
          download={file.name}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          <span className="material-symbols-outlined">download</span>
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {file.size} • {file.type.toUpperCase()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                  close
                </span>
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg h-96 overflow-hidden">
              {getPreviewContent()}
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-slate-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <a
              href={file.url}
              download={file.name}
              className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 sm:ml-3 sm:w-auto"
            >
              <span className="material-symbols-outlined">download</span>
              Download
            </a>
            <button
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 sm:mt-0 sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}