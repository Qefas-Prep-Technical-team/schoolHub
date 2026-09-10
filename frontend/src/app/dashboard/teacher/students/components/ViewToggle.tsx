'use client';

import { LayoutGrid, List, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export type ViewType = 'Grid View' | 'List View';

interface ViewToggleProps {
  viewType: ViewType;
  onViewChange: (type: ViewType) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewType, onViewChange }) => {
  const views: { type: ViewType; icon: LucideIcon }[] = [
    { type: 'Grid View', icon: LayoutGrid },
    { type: 'List View', icon: List },
  ];

  return (
    <div className="relative flex h-10 items-center rounded-lg bg-slate-100 dark:bg-emerald-900/40 p-1 w-full lg:w-32 border border-slate-200 dark:border-emerald-700/50">
      {views.map((view) => (
        <label
          key={view.type}
          className={`relative z-10 flex flex-1 cursor-pointer h-full items-center justify-center transition-colors duration-300 ${
            viewType === view.type
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <view.icon size={16} strokeWidth={viewType === view.type ? 2.5 : 2} />
          <input
            className="sr-only"
            name="view-toggle"
            type="radio"
            value={view.type}
            checked={viewType === view.type}
            onChange={() => onViewChange(view.type)}
          />
          
          {viewType === view.type && (
            <motion.div
              layoutId="view-toggle-active"
              className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md shadow-sm -z-10"
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            />
          )}
        </label>
      ))}
    </div>
  );
};

export default ViewToggle;
