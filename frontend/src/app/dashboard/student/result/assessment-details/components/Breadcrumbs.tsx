import { BreadcrumbItem } from './types';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400 hover:text-primary"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-sm font-medium leading-normal text-gray-800 dark:text-gray-200">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}