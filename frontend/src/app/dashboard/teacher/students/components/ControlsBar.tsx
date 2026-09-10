import FilterChips from "./FilterChips";
import SearchBar from "./SearchBar";
import ViewToggle, { ViewType } from "./ViewToggle";

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
    <div className="flex flex-col lg:flex-row gap-4 items-center mb-6 p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/50 shadow-sm">
      <div className="flex-1 w-full lg:w-auto">
        <SearchBar 
          query={searchQuery}
          onQueryChange={onSearchChange}
        />
      </div>
      
      <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 px-2">
        <FilterChips selectedClassId={selectedClassId} onClassChange={onClassChange} />
        <div className="h-6 w-px bg-slate-200 dark:bg-emerald-900/40 hidden lg:block mx-1" />
        <ViewToggle viewType={viewType} onViewChange={onViewChange} />
      </div>
    </div>
  );
};

export default ControlsBar;
