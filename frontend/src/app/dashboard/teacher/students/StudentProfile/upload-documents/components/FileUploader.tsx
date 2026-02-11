'use client';

import { useCallback } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="flex flex-col">
      <div 
        className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 px-6 py-10 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <span className="material-symbols-outlined !text-3xl text-primary">
            upload_file
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-slate-900 dark:text-white text-base font-semibold">
            Drag & drop your file here
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            or click to browse. Max file size: 10MB
          </p>
        </div>
        <label className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 dark:hover:bg-slate-700">
          <span className="truncate">Browse Files</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
          />
        </label>
      </div>
    </div>
  );
};

export default FileUploader;