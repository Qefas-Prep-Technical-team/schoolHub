import { FilterOption } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface FiltersProps {
  filters: FilterOption[];
  onFilterSelect: (type: string, value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, onFilterSelect }) => {
  return (
    <div className="flex flex-wrap gap-2.5 mb-8">
      {filters.map((filter) => (
        <DropdownMenu key={filter.value}>
          <DropdownMenuTrigger asChild>
            <button
              className="group flex h-10 shrink-0 items-center justify-center gap-x-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 px-4 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-sm active:scale-95 transition-all duration-200"
            >
              <p className="text-sm font-semibold tracking-tight">{filter.label}</p>
              <ChevronDown className="h-4 w-4 text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-200 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px] rounded-xl shadow-xl border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-900 p-1.5">
            {filter.options?.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onFilterSelect(filter.value, option.value)}
                className="cursor-pointer rounded-lg focus:bg-emerald-50 focus:text-emerald-700 dark:focus:bg-emerald-900/20 dark:focus:text-emerald-400 transition-colors py-2 px-3 text-sm font-medium"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
};

export default Filters;
