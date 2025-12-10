import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsV3Props {
  items: { label: string; href?: string }[];
}

const BreadcrumbsV3: React.FC<BreadcrumbsV3Props> = ({ items }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight size={16} className="text-[#4f5c96] dark:text-gray-400" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-[#4f5c96] dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-[#0e101b] dark:text-white text-sm font-medium leading-normal">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BreadcrumbsV3;