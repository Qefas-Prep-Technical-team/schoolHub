import FilterChips from "./FilterChips";
import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";

interface ControlsBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
}

const ControlsBar: React.FC<ControlsBarProps> = ({ searchQuery, onSearchChange, selectedClassId, onClassChange }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center mb-10 p-2 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 backdrop-blur-sm">
      <div className="flex-1 w-full lg:w-auto">
        <SearchBar 
          query={searchQuery}
          onQueryChange={onSearchChange}
        />
      </div>
      
      <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 px-4">
        <FilterChips selectedClassId={selectedClassId} onClassChange={onClassChange} />
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden lg:block mx-2" />
        <ViewToggle />
      </div>
    </div>
  );
};

export default ControlsBar;
