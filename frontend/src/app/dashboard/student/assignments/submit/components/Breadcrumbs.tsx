import { BreadcrumbItem } from './types';
import Link from 'next/link';

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-[#506795] dark:text-white/60 text-sm font-medium leading-normal">
              /
            </span>
          )}
          {item.current ? (
            <span className="text-[#0e121b] dark:text-white/90 text-sm font-medium leading-normal">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-[#506795] dark:text-white/60 text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}