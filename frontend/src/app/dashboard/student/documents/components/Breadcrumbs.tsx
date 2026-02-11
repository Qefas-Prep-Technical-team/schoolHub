import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="text-base font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-base font-medium text-gray-900 dark:text-white">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="text-base font-medium text-gray-500 dark:text-gray-400">
              /
            </span>
          )}
        </div>
      ))}
    </div>
  );
}