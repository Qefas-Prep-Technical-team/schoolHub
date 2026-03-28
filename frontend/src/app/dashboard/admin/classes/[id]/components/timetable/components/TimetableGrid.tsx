import React from 'react';
import TimetableCard from './TimetableCard';
import { Period, Subject } from './types';

interface TimetableGridProps {
  periods: Period[];
  days: string[];
  onCellClick?: (day: string, periodId: string) => void;
  onEdit?: (subjectId: string) => void;
  onDelete?: (subjectId: string) => void;
  onMarkAttendance?: (subjectId: string) => void;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({
  periods,
  days,
  onCellClick,
  onEdit,
  onDelete,
  onMarkAttendance
}) => {
  const isBreak = (timeSlot: string) => {
    return timeSlot.includes('11:00 - 12:00');
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#364563] bg-white dark:bg-[#1b2232]">
      <div className="grid" style={{ 
        gridTemplateColumns: `minmax(120px, 1fr) repeat(${days.length}, minmax(200px, 1fr))` 
      }}>
        {/* Headers */}
        <div className="p-4 text-left text-gray-600 dark:text-white text-sm font-medium leading-normal border-b border-r border-gray-200 dark:border-[#364563]">
          Period
        </div>
        {days.map((day) => (
          <div 
            key={day}
            className="p-4 text-left text-gray-600 dark:text-white text-sm font-medium leading-normal border-b border-r border-gray-200 dark:border-[#364563] last:border-r-0"
          >
            {day}
          </div>
        ))}
        
        {/* Time Slots & Cards */}
        {periods.map((period) => (
          <React.Fragment key={period.id}>
            <div className="p-4 text-gray-500 dark:text-[#95a5c6] text-sm font-normal border-b border-r border-gray-200 dark:border-[#364563]">
              {period.timeSlot}
            </div>
            
            {days.map((day) => {
              const subject = period.subjects[day];
              
              if (isBreak(period.timeSlot)) {
                return (
                  <div 
                    key={`${period.id}-${day}`}
                    className="p-2 border-b border-r border-gray-200 dark:border-[#364563] col-span-5 bg-gray-50 dark:bg-background-dark flex items-center justify-center last:border-r-0"
                  >
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Break
                    </p>
                  </div>
                );
              }
              
              return (
                <div 
                  key={`${period.id}-${day}`}
                  className="p-2 border-b border-r border-gray-200 dark:border-[#364563] group last:border-r-0"
                  onClick={() => onCellClick?.(day, period.id)}
                >
                  {subject ? (
                    <TimetableCard
                      subject={subject}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onMarkAttendance={onMarkAttendance}
                    />
                  ) : (
                    <div className="h-full min-h-[80px] rounded-lg border-2 border-dashed border-gray-300 dark:border-[#364563] hover:border-primary/50 transition-colors cursor-pointer" />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimetableGrid;