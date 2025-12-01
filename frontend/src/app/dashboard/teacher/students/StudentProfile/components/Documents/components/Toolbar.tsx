'use client'
import FilterButton from './FilterButton';
import { ViewMode } from './types';
import ViewToggle from './ViewToggle';


interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ viewMode, onViewModeChange }) => {
  const filterOptions = [
    { label: 'Type', icon: 'expand_more' },
    { label: 'Class', icon: 'expand_more' },
    { label: 'Subject', icon: 'expand_more' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((filter) => (
          <FilterButton key={filter.label} option={filter} />
        ))}
      </div>
      <ViewToggle 
        currentMode={viewMode}
        onModeChange={onViewModeChange}
      />
    </div>
  );
};

export default Toolbar;