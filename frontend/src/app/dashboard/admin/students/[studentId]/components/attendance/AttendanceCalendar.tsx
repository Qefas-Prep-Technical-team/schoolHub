"use client";

import { useState } from "react";
import { useStudentAttendance, useUpdateStudentAttendance } from "@/lib/api/hooks/useStudent";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AttendanceCalendarProps {
  studentId: string;
  themeColor?: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceCalendar({ studentId, themeColor = "#2563eb" }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Edit Dialog State
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<string>("Present");
  const [editNote, setEditNote] = useState<string>("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch attendance records
  const { data: attendanceRecords, isLoading, isError } = useStudentAttendance(studentId);
  const { mutate: updateAttendance, isPending: isUpdating } = useUpdateStudentAttendance(studentId);

  // Calendar logic
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getAttendanceForDate = (day: number) => {
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) return null;
    
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const targetDate = `${y}-${m}-${d}`;
    
    return attendanceRecords.find((record: any) => {
      // Prisma returns dates like "2026-06-05T00:00:00.000Z"
      // splitting at 'T' safely gives the correct database date string
      const recordDate = record.date.split('T')[0];
      return recordDate === targetDate;
    });
  };

  const handleDayClick = (day: number) => {
    const record = getAttendanceForDate(day);
    setSelectedDay(day);
    if (record) {
      setEditStatus(record.status);
      setEditNote(record.note || "");
    } else {
      setEditStatus("Present");
      setEditNote("");
    }
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDay === null) return;
    
    // Safely format YYYY-MM-DD using local time
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(selectedDay).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    updateAttendance(
      { date: dateStr, status: editStatus, note: editNote },
      {
        onSuccess: () => {
          setSelectedDay(null);
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    if (s === 'late') return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    if (s === 'absent') return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
    return 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10';
  };

  const getStatusDot = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present') return <CheckCircle2 size={12} />;
    if (s === 'late') return <AlertCircle size={12} />;
    if (s === 'absent') return <XCircle size={12} />;
    return null;
  };

  // Calculate stats for current month
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  if (Array.isArray(attendanceRecords)) {
    attendanceRecords.forEach((record: any) => {
      const rDate = new Date(record.date);
      if (rDate.getFullYear() === year && rDate.getMonth() === month) {
        const s = record.status.toLowerCase();
        if (s === 'present') presentCount++;
        else if (s === 'late') lateCount++;
        else if (s === 'absent') absentCount++;
      }
    });
  }

  const totalDays = presentCount + lateCount + absentCount;
  const attendanceRate = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 0;

  if (isLoading) {
    return (
      <div className="rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-12 space-y-6">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <div className="grid grid-cols-7 gap-4">
           {Array.from({length: 35}).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center rounded-[3.5rem] bg-red-50 dark:bg-red-950/20 text-red-600 font-bold">
        Failed to load attendance records.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center gap-6">
          <div className="size-16 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
            <CalendarIcon size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
              <button onClick={handlePrevMonth} className="hover:text-primary transition-colors"><ChevronLeft size={24}/></button>
              {MONTHS[month]} {year}
              <button onClick={handleNextMonth} className="hover:text-primary transition-colors"><ChevronRight size={24}/></button>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Monthly Attendance Overview</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center min-w-[100px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Present</p>
            <p className="text-xl font-black text-emerald-500">{presentCount}</p>
          </div>
          <div className="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center min-w-[100px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Late</p>
            <p className="text-xl font-black text-amber-500">{lateCount}</p>
          </div>
          <div className="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center min-w-[100px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Absent</p>
            <p className="text-xl font-black text-rose-500">{absentCount}</p>
          </div>
          <div className="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center min-w-[100px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rate</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01] border border-transparent" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const record = getAttendanceForDate(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={cn(
                  "h-24 rounded-2xl border p-3 flex flex-col justify-between transition-all cursor-pointer hover:shadow-md hover:scale-[1.02]",
                  record ? getStatusColor(record.status) : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-slate-300",
                  isToday && !record && "border-primary/50 shadow-sm"
                )}
                style={isToday && !record ? { borderColor: themeColor } : {}}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-sm font-black", 
                    record ? "opacity-90" : "text-slate-400",
                    isToday && !record && "text-slate-900 dark:text-white"
                  )}>
                    {day}
                  </span>
                  {record && getStatusDot(record.status)}
                </div>
                
                {record && (
                  <div className="text-[9px] font-black uppercase tracking-widest mt-auto">
                    {record.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border-none shadow-3xl">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
                <CalendarIcon size={28} />
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Update Attendance
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {selectedDay && new Date(year, month, selectedDay).toLocaleDateString()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveAttendance} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger 
                  className="w-full px-5 py-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm font-bold focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                  style={{ '--tw-ring-color': themeColor } as any}
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                  <SelectItem value="Present" className="font-bold rounded-xl cursor-pointer py-3 focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-500 transition-colors">Present</SelectItem>
                  <SelectItem value="Late" className="font-bold rounded-xl cursor-pointer py-3 focus:bg-amber-50 dark:focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-500 transition-colors">Late</SelectItem>
                  <SelectItem value="Absent" className="font-bold rounded-xl cursor-pointer py-3 focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-500 transition-colors">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note (Optional)</label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-primary transition-colors resize-none"
                style={{ '--primary': themeColor } as any}
                placeholder="e.g. Arrived 30 mins late due to traffic"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-14 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
              style={{ backgroundColor: themeColor }}
            >
              {isUpdating ? "Saving..." : "Save Record"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
