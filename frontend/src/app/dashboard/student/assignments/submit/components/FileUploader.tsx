import { useRef } from 'react';

interface Props {
  onFileUpload: (files: File[]) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
fileInputRef: React.RefObject<HTMLInputElement | null>;


  acceptedFormats?: string;
  maxFileSize?: number;
}

export default function FileUploader({
  onFileUpload,
  onDragOver,
  onDrop,
  fileInputRef,
  acceptedFormats = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.zip',
  maxFileSize = 50 * 1024 * 1024, // 50MB in bytes
}: Props) {
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Filter files by size
      const validFiles = files.filter(file => file.size <= maxFileSize);
      
      if (validFiles.length !== files.length) {
        alert(`Some files exceed the ${maxFileSize / (1024 * 1024)}MB limit and were not uploaded.`);
      }
      
      if (validFiles.length > 0) {
        onFileUpload(validFiles);
      }
      
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#d1d8e6] dark:border-white/20 px-6 py-14 cursor-pointer"
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={handleFileSelect}
      >
        <div className="flex max-w-[480px] flex-col items-center gap-2">
          <p className="text-[#0e121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">
            Drag & drop files here or click to browse
          </p>
          <p className="text-[#506795] dark:text-white/60 text-sm font-normal leading-normal text-center">
            Supports: PDF, DOCX, JPG, MP4, ZIP. Max file size: 50MB.
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleFileSelect();
          }}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-10 px-4 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
        >
          <span className="material-symbols-outlined text-base">upload_file</span>
          <span className="truncate">Upload File</span>
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#506795] dark:text-white/60">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">info</span>
          <span>Allowed formats: {acceptedFormats}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">storage</span>
          <span>Max size: {maxFileSize / (1024 * 1024)}MB per file</span>
        </div>
      </div>
    </div>
  );
}