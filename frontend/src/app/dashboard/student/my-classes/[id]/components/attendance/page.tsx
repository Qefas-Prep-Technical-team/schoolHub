'use client';

// app/student/classes/[id]/attendance/page.tsx
import { useState, useMemo } from "react";
import { useParams } from 'next/navigation';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentProfile, useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, XCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import StudentAttendanceDetailModal from "@/app/dashboard/admin/classes/[id]/components/attendance/components/StudentAttendanceDetailModal";
import { AttendanceRecord, ClassSubjectItem, AttendanceStatus } from "@/app/dashboard/admin/classes/[id]/components/attendance/components/types";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseAttendanceNoteAndSubjects(
  rawNote?: string | null,
  existingSubjects?: Record<string, unknown> | null
): { comment: string; subjects: Record<string, unknown> } {
  let comment = '';
  let subjects: Record<string, unknown> = { ...(existingSubjects || {}) };

  if (!rawNote || typeof rawNote !== 'string') {
    return { comment: '', subjects };
  }

  let text = rawNote.trim();

  while (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        if (parsed.subjects && typeof parsed.subjects === 'object') {
          subjects = { ...subjects, ...parsed.subjects };
        }
        if (typeof parsed.comment === 'string') {
          text = parsed.comment.trim();
          continue;
        } else if (typeof parsed.note === 'string') {
          text = parsed.note.trim();
          continue;
        }
      }
      text = '';
      break;
    } catch {
      break;
    }
  }

  comment = text;
  return { comment, subjects };
}

interface RawAttendanceItem {
  id?: string;
  date: string;
  status: string;
  note?: string;
  notes?: string;
  comment?: string;
  classId?: string;
  class?: {
    id?: string;
    name?: string;
    subjects?: unknown[];
  };
  student?: {
    id?: string;
    name?: string;
    studentCode?: string;
    departmentId?: string | null;
    department?: {
      id: string;
      name: string;
      code?: string;
    } | null;
  };
  studentId?: string;
  recordedByName?: string;
  recordedByRole?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  subjects?: Record<string, unknown>;
}

export default function AttendancePage() {
  const { id } = useParams() as { id: string };
  
  const { data: classData, isLoading: isClassLoading } = useSingleClass(id);
  const { data: studentProfile, isLoading: isProfileLoading } = useStudentProfile();
  
  const studentId = studentProfile?.id || '';
  const { data: allAttendanceRecords, isLoading: isAttendanceLoading, isError } = useStudentAttendance(studentId);

  const [currentDate, setCurrentDate] = useState(new Date());

  // Detail Modal Preview State
  const [inspectRecord, setInspectRecord] = useState<AttendanceRecord | null>(null);
  const [modalSubjects, setModalSubjects] = useState<ClassSubjectItem[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const themeColor = "#2563eb"; // Standard primary color, or fetch from school settings

  // Filter records specifically for this class
  const classAttendanceRecords = useMemo<RawAttendanceItem[]>(() => {
    if (!Array.isArray(allAttendanceRecords)) return [];
    return (allAttendanceRecords as RawAttendanceItem[]).filter(
      (record) => record.classId === id || record.class?.id === id
    );
  }, [allAttendanceRecords, id]);

  // Extract class subjects from classData
  const classSubjects = useMemo<ClassSubjectItem[]>(() => {
    if (classData?.subjects?.length) {
      return classData.subjects
        .map((csItem: unknown) => {
          const cs = csItem as {
            id?: string;
            name?: string;
            code?: string;
            subject?: {
              id: string;
              name: string;
              code?: string;
              departments?: Array<{ departmentId?: string; department?: { id?: string; name?: string } }>;
            };
            departments?: Array<{ departmentId?: string; department?: { id?: string; name?: string } }>;
          };
          const s = cs.subject || cs;
          if (!s || !s.id || !s.name) return null;
          const depts = s.departments || [];
          const departmentIds: string[] = depts
            .map((d) => d.departmentId || d.department?.id)
            .filter((deptId): deptId is string => Boolean(deptId));
          const departmentNames: string[] = depts
            .map((d) => d.department?.name)
            .filter((name): name is string => Boolean(name));
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
    return [];
  }, [classData]);

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
    
    return classAttendanceRecords.find((record) => {
      const recordDate = record.date ? record.date.split('T')[0] : '';
      return recordDate === targetDate;
    });
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (s === 'late') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    if (s === 'absent') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    if (s === 'excused') return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
    return 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10';
  };

  const getStatusDot = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present') return <CheckCircle2 size={12} className="text-emerald-500" />;
    if (s === 'late') return <AlertCircle size={12} className="text-amber-500" />;
    if (s === 'absent') return <XCircle size={12} className="text-rose-500" />;
    if (s === 'excused') return <CheckCircle2 size={12} className="text-sky-500" />;
    return null;
  };

  // Calculate stats for current month
  const { presentCount, lateCount, absentCount, totalDays, attendanceRate } = useMemo(() => {
    let p = 0;
    let l = 0;
    let a = 0;

    classAttendanceRecords.forEach((record) => {
      const rDate = new Date(record.date);
      if (rDate.getFullYear() === year && rDate.getMonth() === month) {
        const s = (record.status || '').toLowerCase();
        if (s === 'present') p++;
        else if (s === 'late') l++;
        else if (s === 'absent') a++;
      }
    });

    const tot = p + l + a;
    const rate = tot > 0 ? Math.round(((p + l) / tot) * 100) : 0;
    return {
      presentCount: p,
      lateCount: l,
      absentCount: a,
      totalDays: tot,
      attendanceRate: rate,
    };
  }, [classAttendanceRecords, year, month]);

  const handleOpenDetailModal = (record: RawAttendanceItem, day: number) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const targetDate = `${y}-${m}-${d}`;

    const { comment: cleanComment, subjects: parsedSubjects } = parseAttendanceNoteAndSubjects(
      record.note || record.notes || record.comment,
      record.subjects
    );

    const rawStatus = (record.status ? record.status.toLowerCase() : 'present');
    const normalizedStatus: AttendanceStatus = ['present', 'absent', 'late', 'excused'].includes(rawStatus)
      ? (rawStatus as AttendanceStatus)
      : 'present';

    // Build subject list combining class subjects and recorded subjects
    const subjectsMap = new Map<string, ClassSubjectItem>();
    classSubjects.forEach((s) => subjectsMap.set(s.id, s));

    Object.values(parsedSubjects).forEach((subItem: unknown) => {
      const sub = subItem as { subjectId?: string; subjectName?: string; subjectCode?: string };
      if (sub?.subjectId && !subjectsMap.has(sub.subjectId)) {
        subjectsMap.set(sub.subjectId, {
          id: sub.subjectId,
          name: sub.subjectName || "Subject",
          code: sub.subjectCode || "",
          departmentIds: [],
          departmentNames: [],
        });
      }
    });

    const combinedSubjects = Array.from(subjectsMap.values());
    const dateFormatted = record.date ? (typeof record.date === 'string' ? record.date.split('T')[0] : targetDate) : targetDate;

    setModalSubjects(combinedSubjects);
    setInspectRecord({
      id: record.id || `rec-${targetDate}`,
      studentId: record.studentId || studentId,
      studentName: record.student?.name || studentProfile?.name || 'Student',
      studentCode: record.student?.studentCode || studentProfile?.studentCode || '-',
      classId: record.classId || id,
      className: record.class?.name || classData?.name || 'Class',
      departmentId: record.student?.departmentId || studentProfile?.departmentId || null,
      department: record.student?.department || (studentProfile as { department?: { id: string; name: string; code?: string } })?.department || null,
      status: normalizedStatus,
      comment: cleanComment,
      note: cleanComment,
      date: dateFormatted,
      subjects: parsedSubjects as AttendanceRecord['subjects'],
      submittedBy: record.submittedBy || record.recordedByName || 'Staff',
      submittedAt: record.submittedAt || record.createdAt || new Date().toISOString(),
      recordedByName: record.recordedByName,
      recordedByRole: record.recordedByRole,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  };

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
              <button onClick={handlePrevMonth} className="hover:text-primary transition-colors cursor-pointer"><ChevronLeft size={24}/></button>
              {MONTHS[month]} {year}
              <button onClick={handleNextMonth} className="hover:text-primary transition-colors cursor-pointer"><ChevronRight size={24}/></button>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {classData?.name} {classData?.section} • Attendance Log • Click any recorded date to preview breakdown
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
            
            const { comment: cleanComment, subjects: parsedSubjects } = record
              ? parseAttendanceNoteAndSubjects(record.note || record.notes || record.comment, record.subjects)
              : { comment: '', subjects: {} };
            const subjectCount = Object.keys(parsedSubjects).length;

            return (
              <div 
                key={day} 
                onClick={() => {
                  if (record) {
                    handleOpenDetailModal(record, day);
                  }
                }}
                className={cn(
                  "h-24 rounded-2xl border p-3 flex flex-col justify-between transition-all select-none",
                  record 
                    ? `${getStatusColor(record.status)} cursor-pointer hover:scale-[1.03] active:scale-95 hover:shadow-md group` 
                    : "bg-slate-50/50 dark:bg-white/[0.01] border-slate-100 dark:border-white/5",
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
                  <div className="flex items-center gap-1">
                    {record && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                        <Eye size={12} />
                      </span>
                    )}
                    {record && getStatusDot(record.status)}
                  </div>
                </div>
                
                {record && (
                  <div className="text-[9px] font-black uppercase tracking-widest mt-auto truncate" title={cleanComment || record.status}>
                    {record.status} {cleanComment ? `• ${cleanComment}` : subjectCount > 0 ? `• ${subjectCount} Subj` : ''}
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

      {/* Attendance Preview Modal for Student */}
      <StudentAttendanceDetailModal
        isOpen={!!inspectRecord}
        onClose={() => setInspectRecord(null)}
        record={inspectRecord}
        classSubjects={modalSubjects}
        classNameLabel={inspectRecord?.className || classData?.name || "Class"}
        readOnly={true}
      />
    </div>
  );
}