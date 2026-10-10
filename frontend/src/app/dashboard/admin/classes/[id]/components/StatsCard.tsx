import React from 'react';
import { Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface StatsCardProps {
  title: string;
  value: string | React.ReactNode;
  className?: string;
  isLoading?: boolean;
  info?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, className = '', isLoading, info }) => {
  return (
    <div className={`flex flex-col gap-2 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm ${className}`}>
      {isLoading ? (
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mt-1"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-normal">
              {title}
            </p>
            {info && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={14} className="opacity-70 hover:opacity-100" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    <p>{info}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
            {value}
          </div>
        </>
      )}
    </div>
  );
};

export default StatsCard;