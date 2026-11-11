'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getFilteredLevelSuggestions } from '@/utils/levelConstants';
import { cn } from '@/lib/utils';

interface StepAcademicLevelsProps {
  levels: string[];
  onAddLevel: (levelName: string) => Promise<void>;
  onAddAllSuggestedLevels: (suggested: string[]) => Promise<void>;
  onRemoveLevel: (levelName: string) => Promise<void>;
  addingLevelName: string | null;
  isBulkSaving: boolean;
}

export const StepAcademicLevels: React.FC<StepAcademicLevelsProps> = ({
  levels,
  onAddLevel,
  onAddAllSuggestedLevels,
  onRemoveLevel,
  addingLevelName,
  isBulkSaving,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const suggestions = getFilteredLevelSuggestions(levels);
  const filteredSuggestions = suggestions.filter((lvl) =>
    lvl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustom = async () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    await onAddLevel(trimmed);
    setCustomInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap size={16} className="text-indigo-600 dark:text-indigo-400" />
            Step 2: Configure School Academic Levels
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select from standard Nigerian levels (KG 1–2, Nursery 1–2, Primary 1–6, JSS 1–3, SSS 1–3, UTME/WAEC/NECO) or add custom levels.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0 self-start sm:self-auto">
          {levels.length} Configured
        </span>
      </div>

      {/* Configured School Levels */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" /> Your School&apos;s Active Levels ({levels.length})
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 min-h-[84px] flex flex-wrap items-center gap-2">
          {levels.length === 0 ? (
            <p className="text-xs text-slate-400 italic w-full text-center py-4">
              No levels configured yet. Click any suggestion below or type a custom level to add it to your school.
            </p>
          ) : (
            levels.map((lvl) => {
              const isBusy = addingLevelName === lvl;
              return (
                <div
                  key={lvl}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{lvl}</span>
                  <button
                    type="button"
                    disabled={isBusy || isBulkSaving}
                    onClick={() => onRemoveLevel(lvl)}
                    className="text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"
                    title={`Remove ${lvl}`}
                  >
                    {isBusy ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Custom Level Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Add a custom level (e.g. Reception, Year 7, A-Level)..."
          className="rounded-xl bg-white dark:bg-slate-900 flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustom();
            }
          }}
        />
        <Button
          type="button"
          onClick={handleAddCustom}
          disabled={!customInput.trim() || !!addingLevelName || isBulkSaving}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs h-10 px-5 flex items-center gap-1.5 shrink-0"
        >
          {addingLevelName === customInput.trim() && customInput.trim() ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add Custom Level
        </Button>
      </div>

      {/* Suggested Nigerian Levels */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Sparkles size={14} /> Suggested Nigerian Standard Levels ({filteredSuggestions.length})
          </span>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              {suggestions.length > 3 && (
                  <div className="relative flex-1 sm:w-44">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter suggestions..."
                      className="pl-8 h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-full"
                    />
                  </div>
            )}
                  {suggestions.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isBulkSaving || !!addingLevelName}
                      onClick={() => onAddAllSuggestedLevels(suggestions)}
                      className="h-8 px-3 rounded-lg text-xs font-semibold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 shrink-0"
                    >
                      {isBulkSaving ? (
                        <>
                          <Loader2 size={12} className="animate-spin mr-1.5" /> Adding All...
                        </>
                      ) : (
                        <>+ Add All ({suggestions.length})</>
                      )}
                    </Button>
                  )}
                </div>
        </div>

            {filteredSuggestions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                All standard Nigerian academic levels have been added to your school!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {filteredSuggestions.map((sug) => {
                  const isAdding = addingLevelName === sug;
                  return (
                    <button
                      key={sug}
                      type="button"
                      disabled={!!addingLevelName || isBulkSaving}
                      onClick={() => onAddLevel(sug)}
                      className={cn(
                        'group flex items-center justify-between px-3 py-2 rounded-xl text-left bg-indigo-50/50 hover:bg-indigo-100/70 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800/60 transition-all',
                        (addingLevelName || isBulkSaving) && !isAdding && 'opacity-50 cursor-not-allowed',
                        isAdding && 'ring-2 ring-indigo-500/40 bg-indigo-100/80 dark:bg-indigo-900/60 cursor-wait'
                      )}
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {sug}
                      </span>
                      <span className="size-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold group-hover:scale-105 transition-transform shrink-0">
                        {isAdding ? <Loader2 size={11} className="animate-spin" /> : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        );
};

