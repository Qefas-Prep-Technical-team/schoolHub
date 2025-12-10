import React from 'react';

interface InfoItem {
  label: string;
  value: string;
  highlight?: boolean;
  isLink?: boolean;
  href?: string;
}

interface InfoGridProps {
  items: InfoItem[];
  columns?: 1 | 2 | 3;
}

const InfoGrid: React.FC<InfoGridProps> = ({ items, columns = 2 }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-y-4 gap-x-6`}>
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-1">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">
            {item.label}
          </p>
          {item.isLink ? (
            <a
              href={item.href}
              className="text-primary dark:text-primary/90 text-sm font-medium hover:underline"
            >
              {item.value}
            </a>
          ) : (
            <p className={`text-sm ${item.highlight ? 'font-bold' : 'font-medium'} ${
              item.highlight ? 'text-slate-800 dark:text-slate-200' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default InfoGrid;