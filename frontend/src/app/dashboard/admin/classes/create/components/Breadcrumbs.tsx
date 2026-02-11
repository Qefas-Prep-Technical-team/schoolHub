import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">
              /
            </span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;