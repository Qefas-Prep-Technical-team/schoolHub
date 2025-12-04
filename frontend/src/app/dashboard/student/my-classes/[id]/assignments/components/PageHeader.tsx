// app/student/classes/[id]/assignments/components/PageHeader.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle: string
  showBackButton?: boolean
}

export default function PageHeader({ title, subtitle, showBackButton = false }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      </div>
      
      {showBackButton && (
        <Link 
          href="/student/classes" 
          className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary dark:bg-primary/20 hover:bg-primary/15 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Classes</span>
        </Link>
      )}
    </div>
  )
}