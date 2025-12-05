import { BreadcrumbItem } from './types';
import Link from 'next/link';

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {index > 0 && (
            <span className="material-symbols-outlined text-base text-gray-400 dark:text-gray-500">
              chevron_right
            </span>
          )}
          {item.current ? (
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}