'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface HeaderTooltipProps {
  content: string;
  size?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HeaderTooltip({ content, size = 13, side = 'top', className = '' }: HeaderTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button 
            type="button" 
            aria-label="More information"
            className={`inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus:outline-none shrink-0 ${className}`}
          >
            <Info size={size} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs p-3 text-xs leading-relaxed bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-200 border border-slate-700/60 shadow-2xl rounded-xl text-left z-50 font-normal normal-case tracking-normal"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
