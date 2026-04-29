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
              className="group flex h-10 shrink-0 items-center justify-center gap-x-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-95 transition-all duration-200"
            >
              <p className="text-sm font-semibold tracking-tight">{filter.label}</p>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px] rounded-xl shadow-xl border-slate-200 dark:border-slate-800 p-1.5">
            {filter.options?.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onFilterSelect(filter.value, option.value)}
                className="cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary transition-colors py-2 px-3 text-sm font-medium"
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
