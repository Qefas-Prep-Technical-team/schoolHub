'use client';

import { useState } from 'react';
import { ViewType } from './types';


const ViewToggle: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>('Grid View');

  const views: { type: ViewType; icon: string }[] = [
    { type: 'Grid View', icon: 'grid_view' },
    { type: 'List View', icon: 'list' },
  ];

  return (
    <div className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
      {views.map((view) => (
        <label
          key={view.type}
          className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 ${
            viewType === view.type
              ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <span className="material-symbols-outlined">{view.icon}</span>
          <input
            className="invisible w-0"
            name="view-toggle"
            type="radio"
            value={view.type}
            checked={viewType === view.type}
            onChange={() => setViewType(view.type)}
          />
        </label>
      ))}
    </div>
  );
};

export default ViewToggle;