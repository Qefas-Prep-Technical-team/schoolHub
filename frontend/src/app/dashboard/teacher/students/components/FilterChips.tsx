import { FilterOption } from "./types";

;

const filterOptions: FilterOption[] = [
  { label: 'Class / Grade', icon: 'expand_more' },
  { label: 'Gender', icon: 'expand_more' },
  { label: 'Performance', icon: 'expand_more' },
];

const FilterChips: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((filter) => (
        <button
          key={filter.label}
          className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-gray-800 pl-3 pr-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <p className="text-sm font-medium">{filter.label}</p>
          <span className="material-symbols-outlined text-base">{filter.icon}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterChips;