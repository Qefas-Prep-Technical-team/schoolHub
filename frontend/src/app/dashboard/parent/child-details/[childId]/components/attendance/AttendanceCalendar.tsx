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
  childId: string;
  themeColor?: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceCalendar({ childId, themeColor = "#2563eb" }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());



  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch attendance records
  const { data: attendanceRecords, isLoading, isError } = useStudentAttendance(childId);
  const { mutate: updateAttendance, isPending: isUpdating } = useUpdateStudentAttendance(childId);

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
    // Disabled editing for parents
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

    </div>
  );
}
