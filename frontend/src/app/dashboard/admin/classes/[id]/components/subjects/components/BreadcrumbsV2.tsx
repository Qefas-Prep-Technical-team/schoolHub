import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsV2Props {
  items: { label: string; href?: string }[];
  className?: string;
}

const BreadcrumbsV2: React.FC<BreadcrumbsV2Props> = ({ items, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 mb-6 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BreadcrumbsV2;