import Button from "../../ui/Button";


interface ToolbarProps {
  month: string;
  year: number;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onDownloadReport: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  month,
  year,
  onMonthChange,
  onDownloadReport
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700/60">
      <div className="flex items-center gap-2">
        <button 
          className="flex items-center gap-2 h-10 px-4 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => onMonthChange('prev')}
        >
          <span className="material-symbols-outlined text-xl">calendar_month</span>
          <span className="text-sm font-medium">{month} {year}</span>
          <span className="material-symbols-outlined text-xl">arrow_drop_down</span>
        </button>
      </div>
      <Button 
        variant="primary" 
        icon="download"
        className="text-sm font-bold leading-normal tracking-wide"
        onClick={onDownloadReport}
      >
        Download Report
      </Button>
    </div>
  );
};

export default Toolbar;