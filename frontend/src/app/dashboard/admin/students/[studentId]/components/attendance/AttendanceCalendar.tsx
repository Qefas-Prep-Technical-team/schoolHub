"use client";

import { useState, useMemo } from "react";
import { useStudentAttendance, useUpdateStudentAttendance } from "@/lib/api/hooks/useStudent";
import { useSingleClass } from "@/lib/api/hooks/useClasses";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, XCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentAttendanceDetailModal } from "@/app/dashboard/admin/classes/[id]/components/attendance/components/StudentAttendanceDetailModal";
import { AttendanceRecord, ClassSubjectItem, AttendanceStatus } from "@/app/dashboard/admin/classes/[id]/components/attendance/components/types";

interface AttendanceCalendarProps {
  studentId: string;
  themeColor?: string;
  student?: any;
  classId?: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceCalendar({ 
  studentId, 
  themeColor = "#2563eb",
  student,
  classId,
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Detail Modal State
  const [inspectRecord, setInspectRecord] = useState<AttendanceRecord | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch attendance records
  const { data: attendanceRecords, isLoading, isError } = useStudentAttendance(studentId);
  const { mutate: updateAttendance, isPending: isUpdating } = useUpdateStudentAttendance(studentId);

  // Determine active class ID for subject definitions
  const activeClassId = useMemo(() => {
    if (classId) return classId;
    if (student?.classes?.[0]?.class?.id) return student.classes[0].class.id;
    if (Array.isArray(attendanceRecords)) {
      const rec = attendanceRecords.find((r: any) => r.class?.id);
      if (rec?.class?.id) return rec.class.id;
    }
    return "";
  }, [classId, student, attendanceRecords]);

  // Fetch class info with all attached subjects
  const { data: classData } = useSingleClass(activeClassId);

  // Extract class subjects with departments
  const classSubjects = useMemo<ClassSubjectItem[]>(() => {
    if (classData?.subjects?.length) {
      return classData.subjects
        .map((cs: any) => {
          const s = cs.subject || cs;
          if (!s || !s.id) return null;
          const depts = s.departments || [];
          const departmentIds: string[] = depts
            .map((d: any) => d.departmentId || d.department?.id)
            .filter(Boolean);
          const departmentNames: string[] = depts
            .map((d: any) => d.department?.name)
            .filter(Boolean);
          return {
            id: s.id,
            name: s.name,
            code: s.code,
            departmentIds,
            departmentNames,
          };
        })
        .filter((s: ClassSubjectItem | null): s is ClassSubjectItem => s !== null);
    }

    if (student?.classes?.[0]?.class?.subjects?.length) {
      return student.classes[0].class.subjects
        .map((cs: any) => {
          const s = cs.subject || cs;
          if (!s || !s.id) return null;
          const depts = s.departments || [];
          const departmentIds: string[] = depts
            .map((d: any) => d.departmentId || d.department?.id)
            .filter(Boolean);
          const departmentNames: string[] = depts
            .map((d: any) => d.department?.name)
            .filter(Boolean);
          return {
            id: s.id,
            name: s.name,
            code: s.code,
            departmentIds,
            departmentNames,
          };
        })
        .filter((s: ClassSubjectItem | null): s is ClassSubjectItem => s !== null);
    }

    if (Array.isArray(attendanceRecords)) {
      const recWithClass = attendanceRecords.find((r: any) => r.class?.subjects?.length);
      if (recWithClass?.class?.subjects?.length) {
        return recWithClass.class.subjects
          .map((cs: any) => {
            const s = cs.subject || cs;
            if (!s || !s.id) return null;
            const depts = s.departments || [];
            const departmentIds: string[] = depts
              .map((d: any) => d.departmentId || d.department?.id)
              .filter(Boolean);
            const departmentNames: string[] = depts
              .map((d: any) => d.department?.name)
              .filter(Boolean);
            return {
              id: s.id,
              name: s.name,
              code: s.code,
              departmentIds,
              departmentNames,
            };
          })
          .filter((s: ClassSubjectItem | null): s is ClassSubjectItem => s !== null);
      }
    }

    return [];
  }, [classData, student, attendanceRecords]);

  const classNameLabel = useMemo(() => {
    return classData?.name || 
      student?.classes?.[0]?.class?.name || 
      attendanceRecords?.find((r: any) => r.class?.name)?.class?.name || 
      "Class";
  }, [classData, student, attendanceRecords]);

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
      const recordDate = record.date ? record.date.split('T')[0] : "";
      return recordDate === targetDate;
    });
  };

  const handleDayClick = (day: number) => {
    const record = getAttendanceForDate(day);
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const targetDate = `${y}-${m}-${d}`;

    if (record) {
      const rawStatus = (record.status ? record.status.toLowerCase() : 'present') as any;
      const normalizedStatus: AttendanceStatus = ['present', 'absent', 'late', 'excused'].includes(rawStatus) ? rawStatus : 'present';

      setInspectRecord({
        id: record.id || `rec-${targetDate}`,
        studentId: record.studentId || studentId,
        studentName: record.student?.name || student?.name || "Student",
        studentCode: record.student?.studentCode || student?.studentCode || "-",
        classId: record.classId || activeClassId,
        className: record.class?.name || classNameLabel,
        departmentId: record.student?.departmentId || student?.departmentId || student?.department?.id || null,
        department: record.student?.department || student?.department || null,
        status: normalizedStatus,
        comment: record.comment || (typeof record.note === 'string' && !record.note.startsWith('{') ? record.note : ""),
        date: record.date ? (typeof record.date === 'string' ? record.date.split('T')[0] : targetDate) : targetDate,
        subjects: record.subjects || {},
        submittedBy: record.submittedBy || record.recordedByName || 'Staff',
        submittedAt: record.submittedAt || record.createdAt || new Date().toISOString(),
        recordedByName: record.recordedByName,
        recordedByRole: record.recordedByRole,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    } else {
      // Create draft record for this date to inspect / log attendance
      setInspectRecord({
        id: `draft-${targetDate}`,
        studentId: studentId,
        studentName: student?.name || "Student",
        studentCode: student?.studentCode || "-",
        classId: activeClassId,
        className: classNameLabel,
        departmentId: student?.departmentId || student?.department?.id || null,
        department: student?.department || null,
        status: 'present',
        comment: '',
        date: targetDate,
        subjects: {},
        submittedBy: 'Admin',
        submittedAt: new Date().toISOString(),
        recordedByName: 'Admin',
        recordedByRole: 'ADMIN',
      });
    }
  };

  const handleSaveModal = (updatedRecord: AttendanceRecord) => {
    const dateStr = typeof updatedRecord.date === 'string' 
      ? updatedRecord.date.split('T')[0] 
      : new Date(updatedRecord.date).toLocaleDateString('en-CA');

    updateAttendance(
      { 
        date: dateStr, 
        status: updatedRecord.status, 
        note: updatedRecord.comment || '',
        subjects: updatedRecord.subjects,
      },
      {
        onSuccess: () => {
          setInspectRecord(null);
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    if (s === 'late') return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    if (s === 'absent') return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
    if (s === 'excused') return 'bg-sky-500/10 text-sky-500 border-sky-500/30';
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
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-100 dark:border-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
        <div className="flex items-center gap-4 md:gap-6 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="size-12 md:size-16 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
              <CalendarIcon className="size-6 md:size-8" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 md:gap-4">
                <button type="button" onClick={handlePrevMonth} className="hover:text-primary transition-colors p-1"><ChevronLeft size={20} className="md:size-6" /></button>
                {MONTHS[month]} {year}
                <button type="button" onClick={handleNextMonth} className="hover:text-primary transition-colors p-1"><ChevronRight size={20} className="md:size-6" /></button>
              </h2>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Monthly Attendance &bull; Click any day to inspect overall & subject breakdown
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full xl:w-auto mt-2 xl:mt-0">
          <div className="px-4 md:px-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center flex-1">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Present</p>
            <p className="text-lg md:text-xl font-black text-emerald-500">{presentCount}</p>
          </div>
          <div className="px-4 md:px-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center flex-1">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Late</p>
            <p className="text-lg md:text-xl font-black text-amber-500">{lateCount}</p>
          </div>
          <div className="px-4 md:px-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center flex-1">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Absent</p>
            <p className="text-lg md:text-xl font-black text-rose-500">{absentCount}</p>
          </div>
          <div className="px-4 md:px-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center flex-1">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rate</p>
            <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-sm">
        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 md:h-28 rounded-xl md:rounded-2xl bg-slate-50/50 dark:bg-white/[0.01] border border-transparent" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const record = getAttendanceForDate(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const subjectItems = record?.subjects ? Object.values(record.subjects) : [];
            const presentSubsCount = subjectItems.filter((s: any) => s.status === 'present').length;
            
            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={cn(
                  "h-20 md:h-28 rounded-xl md:rounded-2xl border p-2 md:p-3 flex flex-col justify-between transition-all cursor-pointer hover:shadow-lg hover:scale-[1.03] group",
                  record ? getStatusColor(record.status) : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-slate-300",
                  isToday && !record && "border-primary/50 shadow-sm"
                )}
                style={isToday && !record ? { borderColor: themeColor } : {}}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className={cn(
                    "text-xs md:text-sm font-black", 
                    record ? "opacity-90" : "text-slate-400",
                    isToday && !record && "text-slate-900 dark:text-white"
                  )}>
                    {day}
                  </span>
                  {record && getStatusDot(record.status)}
                </div>
                
                {record ? (
                  <div className="flex flex-col gap-0.5 mt-auto">
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-wider truncate">
                      {record.status}
                    </div>
                    {subjectItems.length > 0 && (
                      <div className="flex items-center gap-1 text-[8.5px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        <BookOpen size={10} className="shrink-0" />
                        <span className="truncate">
                          {presentSubsCount} / {subjectItems.length} Present
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to Log
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Detail Pop-up Modal (Overall & Subject Attendance Breakdown) */}
      <StudentAttendanceDetailModal
        isOpen={!!inspectRecord}
        onClose={() => setInspectRecord(null)}
        record={inspectRecord}
        classSubjects={classSubjects}
        classNameLabel={classNameLabel}
        onSave={handleSaveModal}
        isSaving={isUpdating}
      />
    </div>
  );
}
