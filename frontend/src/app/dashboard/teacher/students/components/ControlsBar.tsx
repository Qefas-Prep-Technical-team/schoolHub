import FilterChips from "./FilterChips";
import SearchBar from "./SearchBar";

import ViewToggle from "./ViewToggle";


interface ControlsBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ControlsBar: React.FC<ControlsBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center mb-6 p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="lg:col-span-2">
        <SearchBar 
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>
      <div className="lg:col-span-2">
        <FilterChips />
      </div>
      <div className="lg:col-span-1">
        <ViewToggle />
      </div>
    </div>
  );
};


export default ControlsBar;