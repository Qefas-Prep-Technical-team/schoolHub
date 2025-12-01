import { Day } from "./types";


interface CalendarDayProps {
  day: Day;
  isSelected: boolean;
  onClick: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ day, isSelected, onClick }) => {
  const getDayStyles = () => {
    if (day.type !== 'current-month') {
      return 'text-gray-400 dark:text-gray-600 p-2 text-sm';
    }

    if (isSelected) {
      return 'relative cursor-pointer rounded-lg p-2 text-sm text-primary dark:text-primary-300 font-bold bg-primary/10 border border-primary';
    }

    return 'relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 text-sm text-gray-900 dark:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-700';
  };

  const getStatusColor = () => {
    switch (day.status) {
      case 'present':
        return 'bg-present';
      case 'late':
        return 'bg-late';
      case 'absent':
        return 'bg-absent';
      default:
        return '';
    }
  };

  return (
    <div 
      className={getDayStyles()}
      onClick={onClick}
    >
      {day.date}
      
      {/* Status dot */}
      {day.status !== 'none' && day.type === 'current-month' && (
        <div className={`absolute bottom-1 right-1 size-2 rounded-full ${getStatusColor()}`}></div>
      )}
      
      {/* Note indicator */}
      {day.hasNote && day.type === 'current-month' && (
        <span className="material-symbols-outlined absolute top-1 right-1 text-xs text-gray-500 dark:text-gray-400">
          chat_bubble
        </span>
      )}
    </div>
  );
};

export default CalendarDay;