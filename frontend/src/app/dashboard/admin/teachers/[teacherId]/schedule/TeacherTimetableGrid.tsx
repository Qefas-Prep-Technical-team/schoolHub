import React from 'react';

export interface TeacherSubjectPeriod {
  id: string;
  name: string;
  className: string;
  room: string;
  isAssigned: boolean;
  isBreak?: boolean;
  breakLabel?: string;
}

export interface TeacherPeriod {
  id: string;
  timeSlot: string;
  subjects: {
    [key: string]: TeacherSubjectPeriod[];
  };
}

interface TeacherTimetableGridProps {
  periods: TeacherPeriod[];
  days: string[];
  onPeriodClick?: (periodId: string) => void;
  onEmptySlotClick?: (day: string, timeSlot: string) => void;
}

const TeacherTimetableGrid: React.FC<TeacherTimetableGridProps> = ({ periods, days, onPeriodClick, onEmptySlotClick }) => {
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
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="grid" style={{ 
        gridTemplateColumns: `minmax(120px, 1fr) repeat(${days.length}, minmax(200px, 1fr))` 
      }}>
        {/* Headers */}
        <div className="p-4 text-left text-slate-600 dark:text-slate-300 text-sm font-bold border-b border-r border-slate-200 dark:border-slate-800 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50">
          Period
        </div>
        {days.map((day) => {
          const isToday = day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          return (
            <div 
              key={day}
              className={`p-4 text-left text-xs font-black uppercase tracking-widest border-b border-r border-slate-200 dark:border-slate-800 last:border-r-0 flex items-center justify-between ${
                isToday ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50'
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
            <div className="p-4 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-center uppercase tracking-wider">
              {formatSlotTo12Hour(period.timeSlot)}
            </div>
            
            {days.map((day) => {
              const subjects = period.subjects[day] || [];
              const isCurrent = isCurrentTimeSlot(day, period.timeSlot);
              const isClash = subjects.length > 1;
              
              return (
                <div 
                  key={`${period.id}-${day}`}
                  className={`p-2 border-b border-r border-slate-200 dark:border-slate-800 last:border-r-0 relative transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                    isClash 
                      ? 'bg-red-50/30 dark:bg-red-950/10' 
                      : isCurrent 
                        ? (subjects.some(s => s.isAssigned) 
                            ? 'bg-green-50/30 dark:bg-green-950/10 ring-2 ring-green-500/50 z-10'
                            : 'bg-blue-50/30 dark:bg-blue-950/10 ring-2 ring-blue-500/50 z-10')
                        : ''
                  }`}
                  onClick={() => {
                    if (subjects.length > 0 && onPeriodClick) {
                        onPeriodClick(subjects[0].id);
                    } else if (onEmptySlotClick) {
                        onEmptySlotClick(day, period.timeSlot);
                    }
                  }}
                >
                  {isCurrent && !isClash && (
                    <div className={`absolute top-1 right-1 flex items-center z-20 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse ${
                      subjects.some(s => s.isAssigned) ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      Now
                    </div>
                  )}

                  {isClash && (
                    <div className="absolute top-1 right-1 flex items-center z-20 bg-red-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      Clash Detected
                    </div>
                  )}

                  {subjects.length > 0 ? (
                    <div className={`h-full min-h-[80px] flex flex-col gap-2 ${isClash ? 'p-1' : ''}`}>
                      {subjects.map((subject, idx) => (
                        <div 
                          key={subject.id || idx} 
                          className={`p-3 rounded-xl border flex flex-col justify-center h-full transition-all ${
                            isClash 
                              ? 'border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 shadow-sm'
                              : subject.isBreak
                                ? 'border-amber-200/50 dark:border-amber-900/30 bg-amber-50/70 dark:bg-amber-950/20 shadow-none items-center'
                                : subject.isAssigned
                                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                                  : 'border-dashed border-amber-300 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-950/20'
                          }`}
                        >
                          {subject.isBreak ? (
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider text-center">
                              {subject.breakLabel || "Recess / Break"}
                            </p>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className={`text-xs font-black uppercase tracking-tight ${subject.isAssigned ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-800 dark:text-white'}`}>
                                  {subject.name}
                                </p>
                                {!subject.isAssigned && !isClash && (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest">
                                    Unassigned
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-0.5">
                                <p className={`text-[10px] font-bold ${subject.isAssigned ? 'text-emerald-600 dark:text-emerald-500/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {subject.className}
                                </p>
                                <p className={`text-[9px] font-black uppercase tracking-wider self-start px-1.5 py-0.5 rounded mt-1 ${subject.isAssigned ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40' : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'}`}>
                                  {subject.room || 'TBD'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`h-full min-h-[80px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center ${
                      isCurrent 
                        ? 'border-blue-400/60 dark:border-blue-500/40' 
                        : 'border-slate-200 dark:border-slate-800'
                    }`}>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">
                        Free
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

export default TeacherTimetableGrid;
