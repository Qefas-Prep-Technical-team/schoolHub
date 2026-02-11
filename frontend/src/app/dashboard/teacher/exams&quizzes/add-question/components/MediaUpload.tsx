'use client';

import { useState } from 'react';
import { Image, Upload, X } from 'lucide-react';

export default function MediaUpload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-base font-medium text-gray-900 dark:text-gray-200 pb-2">
        Media (Optional)
      </label>
      
      {previewUrl ? (
        <div className="relative rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
              {uploadedFile?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(uploadedFile?.size || 0) / 1024} KB
            </p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-10 cursor-pointer hover:border-primary transition-colors"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="p-3 rounded-full bg-primary/10">
            <Image className="text-primary w-8 h-8" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-gray-900 dark:text-gray-200 text-base font-bold">
              Attach Image/Media
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal text-center">
              Drag & drop or click to browse
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Supports JPG, PNG, GIF up to 5MB
          </p>
        </div>
      )}
      
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}