import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <a
              href={item.href}
              className="text-primary/80 dark:text-primary/90 text-sm font-medium leading-normal hover:text-primary"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-normal">
              /
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;