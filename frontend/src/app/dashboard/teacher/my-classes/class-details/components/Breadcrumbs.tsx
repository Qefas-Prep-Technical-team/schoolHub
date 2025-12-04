import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  className?: string;
}

export default function Breadcrumbs({ className = '' }: BreadcrumbsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Link
        href="/dashboard"
        className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
      >
        Dashboard
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <Link
        href="/classes"
        className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
      >
        My Classes
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        JSS 2A
      </span>
    </div>
  );
}