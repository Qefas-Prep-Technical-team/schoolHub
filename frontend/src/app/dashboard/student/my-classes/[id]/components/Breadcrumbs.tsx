import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  classTitle: string;
}

export default function Breadcrumbs({ classTitle }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 py-1">
      <Link 
        href="/dashboard/student"
        className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
      >
        Dashboard
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <Link 
        href="/dashboard/student/my-classes"
        className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
      >
        Classes
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-900 dark:text-white font-bold truncate max-w-[150px] sm:max-w-xs">
        {classTitle}
      </span>
    </nav>
  );
}