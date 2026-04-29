import { ChevronDown, Filter } from "lucide-react";

interface FilterOption {
  label: string;
}

const filterOptions: FilterOption[] = [
  { label: 'Class / Grade' },
  { label: 'Gender' },
  { label: 'Performance' },
];

const FilterChips: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
        <Filter size={18} />
      </div>
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((filter) => (
          <button
            key={filter.label}
            className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-white dark:bg-slate-800/80 px-4 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-primary/30 transition-all duration-300 shadow-sm"
          >
            <span className="text-xs font-black uppercase tracking-widest">{filter.label}</span>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterChips;
