'use client';
import CalendarDay from "./CalendarDay";
import { Day } from "./types";

interface CalendarProps {
  days: Day[];
  selectedDate?: number;
  onDayClick: (date: number) => void;
}

const Calendar: React.FC<CalendarProps> = ({ days, selectedDate, onDayClick }) => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700/60 pb-2 mb-2">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <CalendarDay
            key={index}
            day={day}
            isSelected={selectedDate === day.date && day.type === 'current-month'}
            onClick={() => onDayClick(day.date)}
          />
        ))}
      </div>
    </div>
  );
};

export default Calendar;