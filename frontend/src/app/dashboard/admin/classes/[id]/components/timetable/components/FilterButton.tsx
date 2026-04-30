'use client';

import React from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterButtonProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  label, 
  value, 
  options, 
  onChange 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm group"
        >
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}:</span>
          <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-orange-600 transition-colors">{value}</span>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 rounded-[1.2rem] p-1 border-2 border-slate-100 dark:border-white/5">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-tight cursor-pointer",
              value === option ? "bg-orange-600/10 text-orange-600" : "hover:bg-slate-50 dark:hover:bg-white/5"
            )}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterButton;