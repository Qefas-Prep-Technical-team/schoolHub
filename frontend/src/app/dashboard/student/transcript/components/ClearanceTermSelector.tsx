import React from "react";
import { cn } from "@/lib/utils";
import { GraduationCap, Check } from "lucide-react";

interface ClearanceTermSelectorProps {
  selectedTerm: string;
  onSelectTerm: (term: string) => void;
}

export function ClearanceTermSelector({
  selectedTerm,
  onSelectTerm,
}: ClearanceTermSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
        <GraduationCap size={14} className="text-blue-600" /> 2. Select Academic Term <span className="text-rose-500">*</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: "FIRST", label: "1st Term" },
          { value: "SECOND", label: "2nd Term" },
          { value: "THIRD", label: "3rd Term" },
        ].map((termOpt) => {
          const isSelected = selectedTerm === termOpt.value;
          return (
            <button
              key={termOpt.value}
              type="button"
              onClick={() => onSelectTerm(termOpt.value)}
              className={cn(
                "h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800",
              )}
            >
              {isSelected && <Check size={13} />}
              <span>{termOpt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

