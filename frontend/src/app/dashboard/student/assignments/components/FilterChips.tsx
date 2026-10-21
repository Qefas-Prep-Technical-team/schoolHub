'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterChips({ label, options, selected, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isFiltered = selected && selected !== 'All Statuses' && selected !== 'All Subjects' && selected !== 'All Dates' && selected !== 'All Departments';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 items-center gap-1.5 px-3.5 rounded-2xl border text-xs font-bold transition-all shadow-2xs",
          isFiltered
            ? "bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500/20"
            : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
        )}
      >
        <span className="truncate max-w-[120px] sm:max-w-none">
          {isFiltered ? selected : label}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 min-w-[180px] max-w-[260px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 overflow-y-auto max-h-[280px] animate-in fade-in-50 zoom-in-95 duration-150">
          {options.map((option) => {
            const isSelected = selected === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between text-left px-3.5 py-2 text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <span className="truncate">{option}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
