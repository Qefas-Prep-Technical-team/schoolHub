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

export default function AttendanceCalendar({ studentId, themeColor = "#10b981" }: AttendanceCalendarProps) {
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
    if (s === 'present') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (s === 'late') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    if (s === 'absent') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    return 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10';
  };

  const getStatusDot = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present') return <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />;
    if (s === 'late') return <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />;
    if (s === 'absent') return <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 shrink-0" />;
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
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-4 sm:p-8 space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
           {Array.from({length: 35}).map((_, i) => <Skeleton key={i} className="h-14 sm:h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center rounded-2xl sm:rounded-3xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 font-bold border border-rose-200 dark:border-rose-900/50">
        Failed to load attendance records.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch lg:items-center justify-between bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
        {/* Month Selector */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
            <CalendarIcon size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                type="button"
                onClick={handlePrevMonth} 
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Previous Month"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                {MONTHS[month]} {year}
              </h2>
              <button 
                type="button"
                onClick={handleNextMonth} 
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Next Month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monthly Attendance Record</p>
          </div>
        </div>

        {/* 2x2 Grid on Mobile, 4-Cols on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="p-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Present</p>
            <p className="text-lg sm:text-xl font-black text-emerald-500">{presentCount}</p>
          </div>
          <div className="p-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Late</p>
            <p className="text-lg sm:text-xl font-black text-amber-500">{lateCount}</p>
          </div>
          <div className="p-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Absent</p>
            <p className="text-lg sm:text-xl font-black text-rose-500">{absentCount}</p>
          </div>
          <div className="p-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rate</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm">
        {/* Days of the week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-4 text-center">
          {DAYS.map(day => (
            <div key={day} className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Day cells grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-3">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14 sm:h-20 md:h-24 rounded-xl sm:rounded-2xl bg-slate-50/40 dark:bg-white/[0.01] border border-transparent" />
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
                  "h-14 sm:h-20 md:h-24 rounded-xl sm:rounded-2xl border p-1.5 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer hover:shadow-md hover:scale-[1.02]",
                  record ? getStatusColor(record.status) : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-slate-300",
                  isToday && !record && "border-emerald-500/60 shadow-xs"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-xs sm:text-sm font-black", 
                    record ? "opacity-90" : "text-slate-400",
                    isToday && !record && "text-emerald-600 dark:text-emerald-400 font-black"
                  )}>
                    {day}
                  </span>
                  {record && getStatusDot(record.status)}
                </div>
                
                {record && (
                  <>
                    {/* Full text on tablet & desktop */}
                    <div className="hidden sm:block text-[8px] md:text-[9px] font-black uppercase tracking-wider truncate">
                      {record.status}
                    </div>
                    {/* Mini pill dot indicator on small mobile screens */}
                    <div className="sm:hidden flex justify-center">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        record.status.toLowerCase() === 'present' ? "bg-emerald-500" :
                        record.status.toLowerCase() === 'late' ? "bg-amber-500" : "bg-rose-500"
                      )} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                <CalendarIcon size={24} />
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Update Attendance
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {selectedDay && new Date(year, month, selectedDay).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveAttendance} className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger 
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                  <SelectItem value="Present" className="font-bold rounded-lg cursor-pointer py-2 text-xs sm:text-sm focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 transition-colors">Present</SelectItem>
                  <SelectItem value="Late" className="font-bold rounded-lg cursor-pointer py-2 text-xs sm:text-sm focus:bg-amber-50 dark:focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 transition-colors">Late</SelectItem>
                  <SelectItem value="Absent" className="font-bold rounded-lg cursor-pointer py-2 text-xs sm:text-sm focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-400 transition-colors">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Note (Optional)</label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none"
                placeholder="e.g. Arrived 30 mins late due to medical appointment"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-11 sm:h-12 rounded-xl text-white font-black uppercase tracking-wider text-xs bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Record"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
