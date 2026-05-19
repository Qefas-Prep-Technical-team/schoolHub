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
  const formatTo12Hour = (timeStr: string): string => {
    if (!timeStr) return "";
    const cleanStr = timeStr.trim();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return timeStr;
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatSlotTo12Hour = (slotStr: string): string => {
    if (!slotStr || !slotStr.includes(" - ")) return slotStr;
    const [start, end] = slotStr.split(" - ");
    return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
  };

  const isCurrentTimeSlot = (dayName: string, slotStr: string): boolean => {
    if (!slotStr || !slotStr.includes(" - ")) return false;
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (dayName.toLowerCase() !== today.toLowerCase()) return false;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [start, end] = slotStr.split(" - ");
    const parseTimeToMinutes = (t: string) => {
      const match = t.trim().match(/^(\d{1,2}):(\d{2})/);
      if (!match) return -1;
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    };
    
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);
    
    if (startMinutes === -1 || endMinutes === -1) return false;
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
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
        {days.map((day) => {
          const isToday = day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          return (
            <div 
              key={day}
              className={`p-4 text-left text-sm font-medium leading-normal border-b border-r border-gray-200 dark:border-[#364563] last:border-r-0 flex items-center justify-between ${
                isToday ? 'text-primary font-bold bg-blue-50/20 dark:bg-blue-950/10' : 'text-gray-600 dark:text-white'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse block" />
              )}
            </div>
          );
        })}
        
        {/* Time Slots & Cards */}
        {periods.map((period) => (
          <React.Fragment key={period.id}>
            <div className="p-4 flex items-center justify-center text-gray-500 dark:text-[#95a5c6] text-xs font-bold border-b border-r border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10 text-center">
              {formatSlotTo12Hour(period.timeSlot)}
            </div>
            
            {days.map((day) => {
              const subject = period.subjects[day];
              const isCurrent = isCurrentTimeSlot(day, period.timeSlot);
              
              return (
                <div 
                  key={`${period.id}-${day}`}
                  className={`p-2 border-b border-r border-gray-200 dark:border-[#364563] group last:border-r-0 cursor-pointer transition-all duration-300 relative ${
                    isCurrent 
                      ? 'bg-blue-50/30 dark:bg-blue-950/10 ring-2 ring-blue-500/80 dark:ring-blue-400/80 z-10' 
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/10'
                  }`}
                  onClick={() => onCellClick?.(day, period.id)}
                >
                  {isCurrent && (
                    <div className="absolute top-1 right-1 flex items-center gap-1 z-20 bg-blue-500 text-white text-[8px] font-black uppercase px-1 rounded animate-pulse">
                      Now
                    </div>
                  )}
                  {subject ? (
                    subject.isBreak ? (
                      <div className="h-full min-h-[80px] p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex flex-col items-center justify-center transition-all hover:scale-[1.02] hover:shadow-sm">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider text-center">
                          {subject.breakLabel || "Recess / Break"}
                        </p>
                      </div>
                    ) : (
                      <TimetableCard
                        subject={subject}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMarkAttendance={onMarkAttendance}
                      />
                    )
                  ) : (
                    <div className={`h-full min-h-[80px] rounded-lg border-2 border-dashed transition-colors flex items-center justify-center ${
                      isCurrent 
                        ? 'border-blue-400/60 dark:border-blue-500/40 hover:border-blue-500' 
                        : 'border-gray-300 dark:border-[#364563] hover:border-primary/50'
                    }`}>
                      <span className="text-[10px] text-slate-350 dark:text-slate-650 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        Add Period
                      </span>
                    </div>
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