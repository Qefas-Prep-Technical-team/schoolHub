import { FilterOption } from "./types";


interface FiltersProps {
  filters: FilterOption[];
  onFilterSelect: (filter: FilterOption) => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, onFilterSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-4 pr-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          onClick={() => onFilterSelect(filter)}
        >
          <p className="text-sm font-medium leading-normal">{filter.label}</p>
          <span className="material-symbols-outlined text-lg">{filter.icon}</span>
        </button>
      ))}
    </div>
  );
};

export default Filters;