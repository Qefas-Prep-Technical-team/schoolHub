'use client';

// app/student/classes/[id]/attendance/page.tsx
import { useState } from "react";
import { useParams } from 'next/navigation';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentProfile, useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendancePage() {
  const { id } = useParams() as { id: string };
  
  const { data: classData, isLoading: isClassLoading } = useSingleClass(id);
  const { data: studentProfile, isLoading: isProfileLoading } = useStudentProfile();
  
  const studentId = studentProfile?.id || '';
  const { data: allAttendanceRecords, isLoading: isAttendanceLoading, isError } = useStudentAttendance(studentId);

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const themeColor = "#2563eb"; // Standard primary color, or fetch from school settings

  // Filter records specifically for this class
  const classAttendanceRecords = Array.isArray(allAttendanceRecords) 
    ? allAttendanceRecords.filter((record: any) => record.classId === id)
    : [];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getAttendanceForDate = (day: number) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const targetDate = `${y}-${m}-${d}`;
    
    return classAttendanceRecords.find((record: any) => {
      const recordDate = record.date.split('T')[0];
      return recordDate === targetDate;
    });
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

  classAttendanceRecords.forEach((record: any) => {
    const rDate = new Date(record.date);
    if (rDate.getFullYear() === year && rDate.getMonth() === month) {
      const s = record.status.toLowerCase();
      if (s === 'present') presentCount++;
      else if (s === 'late') lateCount++;
      else if (s === 'absent') absentCount++;
    }
  });

  const totalDays = presentCount + lateCount + absentCount;
  const attendanceRate = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 0;

  if (isClassLoading || isProfileLoading || isAttendanceLoading) {
    return (
      <div className="rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-12 space-y-6 mt-4">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <div className="grid grid-cols-7 gap-4">
           {Array.from({length: 35}).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center rounded-[3.5rem] bg-red-50 dark:bg-red-950/20 text-red-600 font-bold mt-4">
        Failed to load attendance records.
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {classData?.name} {classData?.section} • Attendance
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
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
        
        <div className="grid grid-cols-7 gap-2 md:gap-4">
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
                className={cn(
                  "h-24 rounded-2xl border p-3 flex flex-col justify-between transition-all",
                  record ? getStatusColor(record.status) : "bg-slate-50/50 dark:bg-white/[0.01] border-slate-100 dark:border-white/5",
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
                  <div className="text-[9px] font-black uppercase tracking-widest mt-auto truncate" title={record.note || record.status}>
                    {record.status} {record.note && "• " + record.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Attendance Policy Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <h4 className="text-sm font-black text-primary mb-2 uppercase tracking-wide">Attendance Policy</h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Minimum 80% attendance required to pass. Late arrivals count as 0.5 absence after 15 minutes.
            </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-500 mb-2 uppercase tracking-wide">
                Good Standing
            </h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Your current attendance rate of {attendanceRate}% {attendanceRate >= 80 ? 'exceeds' : 'is below'} the minimum requirement.
            </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <h4 className="text-sm font-black text-amber-600 dark:text-amber-500 mb-2 uppercase tracking-wide">
                Late Arrivals
            </h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Consider arriving 10 minutes early to account for unexpected delays.
            </p>
        </div>
      </div>
    </div>
  );
}