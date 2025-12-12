'use client'

import { useState, useCallback } from 'react'
import { UploadCloud } from 'lucide-react'

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleFiles(files)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
  }, [])

  const handleFiles = (files: FileList) => {
    // Handle file upload logic here
    console.log('Files to upload:', files)
    // You would typically upload to your backend here
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xl font-bold">File Upload</h3>
      <div
        className={`relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-primary/50 bg-primary/5'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary/5 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className={`p-4 rounded-full mb-3 group-hover:scale-110 transition-transform ${
            isDragging
              ? 'bg-primary/10 text-primary'
              : 'bg-blue-50 dark:bg-blue-900/20 text-primary'
          }`}>
            <UploadCloud className="size-10" />
          </div>
          <p className="mb-2 text-sm text-text-main-light dark:text-text-main-dark font-medium">
            <span className="font-bold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-text-sec-light dark:text-text-sec-dark">
            PDF, DOCX, JPG, MP4 or ZIP (MAX. 50MB)
          </p>
        </div>
        <input
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="dropzone-file"
          type="file"
          multiple
          accept=".pdf,.docx,.jpg,.jpeg,.png,.mp4,.zip"
          onChange={handleFileInput}
        />
      </div>
    </div>
  )
}