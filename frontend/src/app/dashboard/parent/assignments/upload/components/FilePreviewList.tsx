'use client'

import { useState } from 'react'
import { FileText, Video, X, Trash2, File } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: string
  type: 'pdf' | 'video' | 'doc' | 'image' | 'zip'
  uploadedAt: string
  progress?: number
  isUploading?: boolean
  isCompleted?: boolean
}

const initialFiles: UploadedFile[] = [
  {
    id: '1',
    name: 'Science_Fair_Report_Final_Draft.pdf',
    size: '2.4 MB',
    type: 'pdf',
    uploadedAt: 'Uploaded just now',
    isCompleted: true,
  },
  {
    id: '2',
    name: 'Experiment_Video_Log.mp4',
    size: '15.8 MB',
    type: 'video',
    uploadedAt: 'Uploading...',
    progress: 45,
    isUploading: true,
    isCompleted: false,
  },
]

const fileTypeIcons = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  video: { icon: Video, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  doc: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  image: { icon: File, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  zip: { icon: File, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
}

export default function FilePreviewList() {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles)

  const handleDelete = (id: string) => {
    setFiles(files.filter(file => file.id !== id))
  }

  const handleCancelUpload = (id: string) => {
    setFiles(files.filter(file => file.id !== id))
  }

  const handleRetryUpload = (id: string) => {
    setFiles(files.map(file => 
      file.id === id 
        ? { ...file, isUploading: true, progress: 0 }
        : file
    ))
    
    // Simulate upload progress
    setTimeout(() => {
      setFiles(files.map(file => 
        file.id === id 
          ? { ...file, isUploading: true, progress: 45 }
          : file
      ))
    }, 500)
  }

  const uploadedCount = files.filter(f => f.isCompleted).length
  const totalAllowed = 3

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
          Attached Files
        </h3>
        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-text-sec-light dark:text-text-sec-dark">
          {uploadedCount}/{totalAllowed} Uploaded
        </span>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {files.map((file) => {
          const FileIcon = fileTypeIcons[file.type].icon
          const iconColor = fileTypeIcons[file.type].color
          const iconBg = fileTypeIcons[file.type].bg

          return (
            <div
              key={file.id}
              className="group bg-card-light dark:bg-card-dark rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-3"
            >
              <div className="flex items-center gap-3">
                {/* File Icon */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                  <FileIcon className={`size-6 ${iconColor}`} />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-text-main-light dark:text-text-main-dark truncate">
                        {file.name}
                      </p>
                    </div>
                    {file.progress !== undefined && (
                      <span className="text-xs font-bold text-primary ml-2 whitespace-nowrap">
                        {file.progress}%
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-sec-light dark:text-text-sec-dark">
                      {file.size} • {file.uploadedAt}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      {file.isUploading ? (
                        <button
                          onClick={() => handleCancelUpload(file.id)}
                          className="p-1.5 rounded-full text-text-sec-light dark:text-text-sec-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 transition-colors"
                          aria-label="Cancel upload"
                          title="Cancel upload"
                        >
                          <X className="size-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-1.5 rounded-full text-text-sec-light dark:text-text-sec-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete file"
                          title="Delete file"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {file.isUploading && file.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      {file.progress < 100 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-text-sec-light dark:text-text-sec-dark">
                            Uploading...
                          </span>
                          <button
                            onClick={() => handleRetryUpload(file.id)}
                            className="text-[10px] font-medium text-primary hover:underline"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              {file.isCompleted && !file.isUploading && (
                <div className="mt-2 flex justify-end">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <span className="size-1.5 rounded-full bg-green-500"></span>
                    Ready
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Upload Limits Info */}
      <div className="text-xs text-text-sec-light dark:text-text-sec-dark mt-2">
        <p className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">info</span>
          You can upload up to {totalAllowed} files. Maximum file size: 50MB each.
        </p>
      </div>

      {/* Empty State */}
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
          <File className="size-10 text-gray-400 mb-2" />
          <p className="text-sm text-text-sec-light dark:text-text-sec-dark">
            No files uploaded yet
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Upload files using the dropzone above
          </p>
        </div>
      )}
    </div>
  )
}