import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbItem } from './types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex flex-wrap items-center gap-2 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {item.label}
            </span>
          )}
          
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      ))}
    </nav>
  );
}