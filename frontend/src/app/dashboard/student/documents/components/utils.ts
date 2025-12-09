import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file icon based on type
export function getFileIcon(type: string): string {
  const icons: Record<string, string> = {
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    txt: 'description',
    image: 'image',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    xls: 'table_chart',
    xlsx: 'table_chart',
    ppt: 'slideshow',
    pptx: 'slideshow',
    zip: 'folder_zip',
    rar: 'folder_zip',
    default: 'insert_drive_file'
  }
  return icons[type] || icons.default
}

// Get color based on file type
export function getFileColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: 'red',
    doc: 'blue',
    docx: 'blue',
    txt: 'gray',
    image: 'green',
    jpg: 'green',
    jpeg: 'green',
    png: 'green',
    gif: 'green',
    xls: 'green',
    xlsx: 'green',
    ppt: 'orange',
    pptx: 'orange',
    zip: 'purple',
    rar: 'purple',
    certificate: 'yellow',
    default: 'gray'
  }
  return colors[type] || colors.default
}