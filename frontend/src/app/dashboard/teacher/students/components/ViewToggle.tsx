'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';

type ViewType = 'Grid View' | 'List View';

const ViewToggle: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>('Grid View');

  const views: { type: ViewType; icon: any }[] = [
    { type: 'Grid View', icon: LayoutGrid },
    { type: 'List View', icon: List },
  ];

  return (
    <div className="relative flex h-12 items-center rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 shadow-inner w-full lg:w-32">
      {views.map((view) => (
        <label
          key={view.type}
          className={`relative z-10 flex flex-1 cursor-pointer h-full items-center justify-center transition-colors duration-300 ${
            viewType === view.type
              ? 'text-primary dark:text-white'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <view.icon size={18} strokeWidth={viewType === view.type ? 2.5 : 2} />
          <input
            className="sr-only"
            name="view-toggle"
            type="radio"
            value={view.type}
            checked={viewType === view.type}
            onChange={() => setViewType(view.type)}
          />
          
          {viewType === view.type && (
            <motion.div
              layoutId="view-toggle-active"
              className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-md -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </label>
      ))}
    </div>
  );
};

export default ViewToggle;
