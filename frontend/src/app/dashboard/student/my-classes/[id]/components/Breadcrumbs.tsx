// app/student/classes/[id]/components/Breadcrumbs.tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbsProps {
  classTitle: string
}

export default function Breadcrumbs({ classTitle }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      <Link 
        href="/student/dashboard" 
        className="hover:text-primary transition-colors"
      >
        Dashboard
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link 
        href="/student/classes" 
        className="hover:text-primary transition-colors"
      >
        Classes
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
        {classTitle}
      </span>
    </nav>
  )
}