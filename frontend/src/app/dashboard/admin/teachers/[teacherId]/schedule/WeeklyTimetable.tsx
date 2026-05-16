import { cn } from '@/lib/utils'
import { format, startOfWeek, addDays } from 'date-fns'

interface ClassSchedule {
  id: string
  course: string
  time: string
  room: string
  color: string
  day: string
  startTime: string
  duration: number // in hours
  hasConflict?: boolean
}

interface WeeklyTimetableProps {
  classes: ClassSchedule[]
  onClassClick: (classId: string) => void
  themeColor: string
  currentDate: Date
}

export default function WeeklyTimetable({ classes, onClassClick, themeColor, currentDate }: WeeklyTimetableProps) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => ({
        full: day,
        short: day.slice(0, 3),
        date: format(addDays(weekStart, i), 'dd')
    }));
    const HOURS = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];

    const matchTime = (startTime: string, hourLabel: string) => {
        const [hLabel, meridian] = hourLabel.split(' ');
        let hLabelNum = parseInt(hLabel);
        if (meridian === 'PM' && hLabelNum !== 12) hLabelNum += 12;
        if (meridian === 'AM' && hLabelNum === 12) hLabelNum = 0;

        let hStart: number;
        if (startTime.includes(' ')) {
            const [time, mod] = startTime.split(' ');
            hStart = parseInt(time.split(':')[0]);
            if (mod === 'PM' && hStart !== 12) hStart += 12;
            if (mod === 'AM' && hStart === 12) hStart = 0;
        } else {
            hStart = parseInt(startTime.split(':')[0]);
        }

        return hLabelNum === hStart;
    }

    return (
        <div className="overflow-x-auto custom-scrollbar pb-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-6 shadow-sm mt-6">
            <div className="min-w-[1000px]">
                <div className="grid grid-cols-[140px_repeat(12,1fr)] gap-3">
                    {/* Empty corner */}
                    <div className="h-12" />
                    
                    {/* Time Headers */}
                    {HOURS.map(hour => (
                        <div key={hour} className="h-12 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                            {hour}
                        </div>
                    ))}

                    {/* Day Rows */}
                    {DAYS.map((day) => (
                        <div key={day.full} className="contents group/row">
                            <div className="h-24 flex flex-col justify-center px-6 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-transparent group-hover/row:border-slate-200 dark:group-hover/row:border-white/10 transition-all">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{day.short}</span>
                                <span className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{day.date}</span>
                            </div>
                            
                            {HOURS.map((hour) => {
                                const cellClass = classes.find(c => c.day === day.full && matchTime(c.startTime, hour));

                                return (
                                    <div 
                                        key={`${day.full}-${hour}`} 
                                        onClick={() => cellClass && onClassClick(cellClass.id)}
                                        className={cn(
                                            "h-24 rounded-2xl border transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center gap-1 text-center px-1",
                                            cellClass 
                                                ? "bg-primary/5 border-primary/20 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5" 
                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                                        )}
                                        style={cellClass ? { borderColor: `${themeColor}40`, backgroundColor: `${themeColor}10`, '--primary': themeColor } as any : {}}
                                    >
                                        {cellClass ? (
                                            <>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <div className="size-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                                                    <p className="text-[9px] font-black uppercase tracking-tighter leading-none" style={{ color: themeColor }}>{cellClass.course}</p>
                                                </div>
                                                <p className="text-[8px] font-bold text-slate-600 dark:text-slate-300 uppercase leading-none">RM {cellClass.room}</p>
                                                <p className="text-[7px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{cellClass.time.split(' - ')[0]}</p>
                                                
                                                {cellClass.hasConflict && (
                                                    <div className="mt-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                                                        <p className="text-[6px] font-black text-rose-500 uppercase tracking-widest">Conflict</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="size-1 rounded-full bg-slate-200 dark:bg-white/5" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
