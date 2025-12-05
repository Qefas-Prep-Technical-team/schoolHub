import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-6 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
          {item.href ? (
            <a
              href={item.href}
              className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
            >
              {item.label}
            </a>
          ) : (
            <span className="font-medium text-[#333333] dark:text-gray-200">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}