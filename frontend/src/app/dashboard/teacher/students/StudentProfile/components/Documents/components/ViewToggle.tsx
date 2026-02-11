import { ViewMode } from "./types";


interface ViewToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentMode, onModeChange }) => {
  const modes: { mode: ViewMode; icon: string; label: string }[] = [
    { mode: 'grid', icon: 'grid_view', label: 'Grid View' },
    { mode: 'list', icon: 'view_list', label: 'List View' }
  ];

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {modes.map((mode) => (
        <button
          key={mode.mode}
          className={`p-1.5 rounded-md ${
            currentMode === mode.mode
              ? 'bg-white text-primary shadow-sm dark:bg-gray-700'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
          }`}
          onClick={() => onModeChange(mode.mode)}
          aria-label={mode.label}
        >
          <span className={`material-symbols-outlined text-base ${currentMode === mode.mode ? 'fill' : ''}`}>
            {mode.icon}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;