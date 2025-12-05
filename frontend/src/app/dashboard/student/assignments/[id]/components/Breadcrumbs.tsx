import { BreadcrumbItem } from './types';
import Link from 'next/link';

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <div className="mb-6">
      <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
            )}
            {item.current ? (
              <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary dark:hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}