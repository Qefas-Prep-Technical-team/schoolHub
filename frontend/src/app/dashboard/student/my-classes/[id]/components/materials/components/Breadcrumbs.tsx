// app/student/classes/[id]/materials/components/Breadcrumbs.tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbsProps {
  className: string
}

export default function Breadcrumbs({ className }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 mb-4">
      <Link 
        href="/student/dashboard" 
        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
      >
        Dashboard
      </Link>
      <ChevronRight className="h-4 w-4 text-gray-400" />
      <Link 
        href="/student/classes" 
        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
      >
        Classes
      </Link>
      <ChevronRight className="h-4 w-4 text-gray-400" />
      <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
        {className}
      </span>
    </nav>
  )
}