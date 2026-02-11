import { FilterOption } from "./types";

interface FilterButtonProps {
  option: FilterOption;
}

const FilterButton: React.FC<FilterButtonProps> = ({ option }) => {
  return (
    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white pl-3 pr-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:bg-background-dark dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800">
      <span>{option.label}</span>
      <span className="material-symbols-outlined text-base">{option.icon}</span>
    </button>
  );
};

export default FilterButton;