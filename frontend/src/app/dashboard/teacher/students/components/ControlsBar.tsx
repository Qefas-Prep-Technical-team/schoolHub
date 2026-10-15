import FilterChips from "./FilterChips";
import SearchBar from "./SearchBar";
import ViewToggle, { ViewType } from "./ViewToggle";
import { Users } from "lucide-react";
import { HeaderTooltip } from "@/app/dashboard/teacher/components/dashboard/HeaderTooltip";

interface ControlsBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  viewType: ViewType;
  onViewChange: (type: ViewType) => void;
}

const ControlsBar: React.FC<ControlsBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  selectedClassId, 
  onClassChange,
  viewType,
  onViewChange
}) => {
  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/50 shadow-sm space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Scholar Directory</h3>
              <HeaderTooltip content="Search scholars instantly by name or student identification code, filter by class cohort, and toggle between detailed Table and visual Grid perspectives." />
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1">Filter & Explore Enrolled Scholars</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <ViewToggle viewType={viewType} onViewChange={onViewChange} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="flex-1 w-full">
          <SearchBar 
            query={searchQuery}
            onQueryChange={onSearchChange}
          />
        </div>
        <div className="w-full sm:w-auto">
          <FilterChips selectedClassId={selectedClassId} onClassChange={onClassChange} />
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;
