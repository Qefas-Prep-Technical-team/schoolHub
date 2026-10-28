'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, Plus, BookOpen, School, Sparkles, CheckCircle2 } from 'lucide-react';
import { PremiumExportButton } from '@/components/ui/PremiumExportButton';
import AttendanceSummaryCard from '@/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceSummaryCard';
import AttendanceCalendar from '@/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceCalendar';
import AttendanceTable from '@/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceTable';
import AttendanceModal from '@/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceModal';
import AttendanceModeModal from '@/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceModeModal';
import AttendanceSwipeModal from '@/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceSwipeModal';
import { 
  AttendanceRecord, 
  CalendarDay,
  ClassSubjectItem
} from '@/app/dashboard/admin/classes/[id]/components/attendance/components/types';

import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/lib/api/services/teacherService';
import StudentAttendanceDetailModal from '@/app/dashboard/admin/classes/[id]/components/attendance/components/StudentAttendanceDetailModal';
import { 
  useClassAttendance, 
  useSubmitAttendance,
  useSingleClass
} from '@/lib/api/hooks/useClasses';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useTeacherProfile, useTeacherSubjects } from '@/lib/api/hooks/useTeacher';
import { TabSkeleton } from '../TabSkeleton';

export default function TeacherAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  
  const { user } = useAuthStore();
  const schoolId = (user as any)?.school?.id || user?.schools?.[0]?.schoolId || "";

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedScope, setSelectedScope] = useState<string>('daily');
  const [hasInitializedScope, setHasInitializedScope] = useState<boolean>(false);
  const [inspectRecord, setInspectRecord] = useState<AttendanceRecord | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showSwipeModal, setShowSwipeModal] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  // Real Data Hooks
  const { data: classData } = useSingleClass(classId);
  const { data: attendanceRecords = [], isLoading, isFetching } = useClassAttendance(classId, selectedDate.toLocaleDateString('en-CA'));
  const { data: settings } = useSchoolSettings(schoolId);
  const { data: teacherProfile } = useTeacherProfile();
  const { data: teacherAssignedSubjectsList = [] } = useTeacherSubjects(schoolId);
  const { data: classDetailData } = useQuery({
    queryKey: ['class-detail', classId],
    queryFn: () => teacherService.getClassDetail(classId),
    staleTime: 1000 * 60 * 10,
    enabled: !!classId,
  });
  const submitMutation = useSubmitAttendance(classId);

  // Subject IDs this teacher teaches in this class from classDetail API
  const teacherSubjectIdsFromClass = useMemo<string[]>(() => {
    const fromClassInfo = (classDetailData as any)?.classInfo?.teacherSubjectIds;
    if (Array.isArray(fromClassInfo) && fromClassInfo.length > 0) return fromClassInfo;
    const direct = (classDetailData as any)?.teacherSubjectIds;
    if (Array.isArray(direct) && direct.length > 0) return direct;
    return [];
  }, [classDetailData]);

  // Check if subject is assigned to this teacher
  const isSubjectAssignedToTeacher = useCallback((s: any, cs?: any): boolean => {
    if (teacherSubjectIdsFromClass.includes(s.id)) return true;

    const teacherIds = [
      user?.id, 
      teacherProfile?.id, 
      (teacherProfile as any)?.userId
    ].filter(Boolean) as string[];

    if (s.teacherId && teacherIds.includes(s.teacherId)) return true;
    if (s.teacher?.id && teacherIds.includes(s.teacher?.id)) return true;
    if (s.teacher?.userId && teacherIds.includes(s.teacher?.userId)) return true;

    if (cs?.teacherId && teacherIds.includes(cs.teacherId)) return true;
    if (cs?.teacher?.id && teacherIds.includes(cs.teacher?.id)) return true;
    if (cs?.teacher?.userId && teacherIds.includes(cs.teacher?.userId)) return true;

    if (Array.isArray(s.teacherSubjects)) {
      if (s.teacherSubjects.some((ts: any) => 
        teacherIds.includes(ts.teacherId) || 
        teacherIds.includes(ts.teacher?.id) || 
        teacherIds.includes(ts.teacher?.userId)
      )) {
        return true;
      }
    }

    if (teacherAssignedSubjectsList.some((tas: any) => (
      tas.id === s.id || 
      tas.subjectId === s.id || 
      tas.subject?.id === s.id
    ))) {
      return true;
    }

    return false;
  }, [user?.id, teacherProfile?.id, (teacherProfile as any)?.userId, teacherAssignedSubjectsList, teacherSubjectIdsFromClass]);

  // Extract subjects attached to this class with departmental metadata & teacher assignment
  const classSubjects = useMemo<ClassSubjectItem[]>(() => {
    if (!classData?.subjects) return [];
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

        const isAssigned = isSubjectAssignedToTeacher(s, cs);

        return {
          id: s.id,
          name: s.name,
          code: s.code,
          departmentIds,
          departmentNames,
          teacher: s.teacher ? { id: s.teacher.id, name: s.teacher.name } : undefined,
          isAssignedToTeacher: isAssigned,
        };
      })
      .filter((s: ClassSubjectItem | null): s is ClassSubjectItem => s !== null);
  }, [classData, isSubjectAssignedToTeacher]);

  // Subjects in this class that the logged in teacher teaches
  const teacherClassSubjects = useMemo(() => {
    return classSubjects.filter((s) => s.isAssignedToTeacher);
  }, [classSubjects]);

  // STRICT REQUIREMENT: Restrict attendance strictly to the teacher's assigned subjects
  // Never show or allow attendance tracking for other teachers' subjects
  const effectiveClassSubjects = useMemo(() => {
    if (teacherClassSubjects.length > 0) {
      return teacherClassSubjects;
    }
    return classSubjects;
  }, [teacherClassSubjects, classSubjects]);

  // Auto-focus on teacher's assigned subject as soon as subjects resolve
  useEffect(() => {
    if (!hasInitializedScope && effectiveClassSubjects.length > 0) {
      setSelectedScope(effectiveClassSubjects[0].id);
      setHasInitializedScope(true);
    }
  }, [effectiveClassSubjects, hasInitializedScope]);

  // Ensure selectedScope is always focused on a teacher assigned subject
  useEffect(() => {
    if (effectiveClassSubjects.length > 0) {
      const exists = effectiveClassSubjects.some(s => s.id === selectedScope);
      if (!exists && selectedScope !== 'daily') {
        setSelectedScope(effectiveClassSubjects[0].id);
      }
    }
  }, [effectiveClassSubjects, selectedScope]);

  const activeScopeLabel = useMemo(() => {
    if (selectedScope === 'daily') return 'School Arrival (Daily)';
    const sub = effectiveClassSubjects.find(s => s.id === selectedScope) || classSubjects.find(s => s.id === selectedScope);
    return sub ? `Subject: ${sub.name}` : 'Subject Attendance';
  }, [selectedScope, effectiveClassSubjects, classSubjects]);

  // Build lookup map for student departments from classData enrollments
  const studentDeptMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code?: string }>();
    (classData?.enrollments || []).forEach((e: any) => {
      if (e?.student?.id && e.student.department) {
        map.set(e.student.id, {
          id: e.student.department.id,
          name: e.student.department.name,
          code: e.student.department.code,
        });
      }
    });
    return map;
  }, [classData]);

  // Enrich attendance records with student department info
  const enrichedAttendanceRecords = useMemo(() => {
    return attendanceRecords.map((rec: any) => {
      const studentId = rec.studentId || rec.student?.id;
      const deptFromEnrollment = studentId ? studentDeptMap.get(studentId) : undefined;
      const studentDept = rec.student?.department || deptFromEnrollment || null;
      const studentDeptId = rec.student?.departmentId || studentDept?.id || null;

      return {
        ...rec,
        departmentId: studentDeptId,
        department: studentDept,
        student: rec.student ? {
          ...rec.student,
          departmentId: studentDeptId,
          department: studentDept,
        } : undefined,
      };
    });
  }, [attendanceRecords, studentDeptMap]);

  // Fetch students for this class
  const { data: studentsData } = useQuery({
      queryKey: ['class-students', classId],
      queryFn: () => teacherService.getStudents({ classId, page: 1, limit: 500 }),
      enabled: !!classId,
      staleTime: 1000 * 60 * 5,
  });

  const students = useMemo(() => {
    return (studentsData?.students || []).map((s: any, idx: number) => ({
        id: s.id,
        name: s.name,
        code: s.studentCode || `00${idx + 1}`
    }));
  }, [studentsData]);

  // Calendar generation effect — must be before any early return
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days: CalendarDay[] = [];
      const firstDayOfWeek = firstDay.getDay();
      
      // Pad previous month
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month, -i),
          isCurrentMonth: false,
          hasAttendance: false
        });
      }
      
      // Current month
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        days.push({
          date,
          isCurrentMonth: true,
          hasAttendance: false // Simplified for now
        });
      }
      
      return days;
    };
    
    setCalendarDays(generateCalendarDays());
  }, [selectedDate]);

  const dailySummary = useMemo(() => {
    const total = attendanceRecords.length;
    if (selectedScope !== 'daily') {
      let present = 0;
      let absent = 0;
      let late = 0;
      let excused = 0;

      attendanceRecords.forEach((r: any) => {
        const subStatus = r.subjects?.[selectedScope]?.status;
        if (subStatus === 'present') present++;
        else if (subStatus === 'absent') absent++;
        else if (subStatus === 'late') late++;
        else if (subStatus === 'excused') excused++;
        else {
          if (r.status === 'absent') absent++;
        }
      });

      return {
        date: selectedDate.toLocaleDateString('en-CA'),
        totalStudents: total,
        present,
        absent,
        late,
        excused,
        attendanceRate: total > 0 ? (present / total) * 100 : 0
      };
    }

    const present = attendanceRecords.filter((r: any) => r.status === 'present').length;
    const absent = attendanceRecords.filter((r: any) => r.status === 'absent').length;
    const late = attendanceRecords.filter((r: any) => r.status === 'late').length;
    const excused = attendanceRecords.filter((r: any) => r.status === 'excused').length;
    
    return {
      date: selectedDate.toLocaleDateString('en-CA'),
      totalStudents: total,
      present,
      absent,
      late,
      excused,
      attendanceRate: total > 0 ? (present / total) * 100 : (attendanceRecords.length > 0 ? 100 : 0)
    };
  }, [attendanceRecords, selectedDate, selectedScope]);

  // Early return only on first initial mount before class metadata has loaded
  if (!classData && isLoading) {
    return <TabSkeleton tabId="attendance" />;
  }

  const handleStartAttendance = () => {
    setShowModeModal(true);
  };

  const handleDownloadReport = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const currentSub = effectiveClassSubjects.find(s => s.id === selectedScope);
    const classNameVal = currentSub 
      ? `${classData?.name || "Class"} - ${currentSub.name}`
      : (classData?.name || "Class Attendance");
    const schoolNameVal = settings?.schoolName || "Academic Institution";
    const schoolLogoVal = settings?.logo || "";
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dayTotal = attendanceRecords.length;
    const dayPresent = attendanceRecords.filter((r: any) => r.status === 'present').length;
    const dayAbsent = attendanceRecords.filter((r: any) => r.status === 'absent').length;
    const dayLate = attendanceRecords.filter((r: any) => r.status === 'late').length;
    const dayRate = dayTotal > 0 ? ((dayPresent / dayTotal) * 100).toFixed(1) : "100.0";

    const htmlContent = `
      <html>
        <head>
          <title>${classNameVal} - Attendance Report (${selectedDate.toLocaleDateString('en-CA')})</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 0; line-height: 1.4; background-color: #ffffff; }
            .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; }
            .school-branding { display: flex; align-items: center; gap: 12px; }
            .school-logo { height: 52px; width: 52px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1; }
            .school-info h2 { font-size: 18px; font-weight: 800; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: -0.3px; }
            .school-info p { font-size: 11px; color: #64748b; margin: 2px 0 0 0; font-weight: 600; }
            .report-title-section { text-align: right; }
            .report-title-section h1 { font-size: 20px; font-weight: 800; margin: 0; color: #047857; text-transform: uppercase; }
            .report-title-section p { font-size: 11px; color: #475569; margin: 2px 0 0 0; font-weight: 700; }
            .summary-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
            .summary-card { text-align: center; border-right: 1px solid #e2e8f0; }
            .summary-card:last-child { border-right: none; }
            .summary-card-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
            .summary-card-value { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; border: 1px solid #cbd5e1; text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
            td { border: 1px solid #e2e8f0; padding: 10px 12px; font-size: 11px; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .status-badge { display: inline-block; font-weight: 800; font-size: 10px; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; min-width: 64px; }
            .status-present { background-color: #d1fae5 !important; color: #065f46 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .status-absent { background-color: #fee2e2 !important; color: #991b1b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .status-late { background-color: #fef3c7 !important; color: #92400e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .status-excused { background-color: #e0f2fe !important; color: #075985 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .student-code { font-family: monospace; color: #64748b; font-weight: 600; }
            .empty-state { text-align: center; padding: 30px; color: #94a3b8; font-style: italic; }
            .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="school-branding">
              ${schoolLogoVal ? `<img class="school-logo" src="${schoolLogoVal}" alt="School Logo" />` : ''}
              <div class="school-info">
                <h2>${schoolNameVal}</h2>
                <p>Class: ${classNameVal}</p>
              </div>
            </div>
            <div class="report-title-section">
              <h1>Attendance Report</h1>
              <p>${formattedDate}</p>
            </div>
          </div>

          <div class="summary-strip">
            <div class="summary-card">
              <div class="summary-card-label">Attendance Rate</div>
              <div class="summary-card-value" style="color: #047857;">${dayRate}%</div>
            </div>
            <div class="summary-card">
              <div class="summary-card-label">Total Present</div>
              <div class="summary-card-value">${dayPresent} / ${dayTotal}</div>
            </div>
            <div class="summary-card">
              <div class="summary-card-label">Total Absent</div>
              <div class="summary-card-value" style="color: #b91c1c;">${dayAbsent}</div>
            </div>
            <div class="summary-card">
              <div class="summary-card-label">Total Late</div>
              <div class="summary-card-value" style="color: #d97706;">${dayLate}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Student Name</th>
                <th style="width: 15%;">Admission ID</th>
                <th style="width: 15%;">Status</th>
                <th style="width: 25%;">Comment / Note</th>
                <th style="width: 20%;">Marked By</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceRecords.length === 0 ? `
                <tr>
                  <td colspan="5" class="empty-state">No attendance recorded for this date.</td>
                </tr>
              ` : attendanceRecords.map((rec: any) => {
                const sName = rec.student?.name || rec.studentName || "Unknown Student";
                const sCode = rec.student?.studentCode || rec.studentCode || "-";
                const isSub = selectedScope !== 'daily';
                const sStatus = isSub ? (rec.subjects?.[selectedScope]?.status || "unrecorded") : (rec.status || "absent");
                const sComment = rec.comment || rec.note || "-";
                const sBy = (isSub && rec.subjects?.[selectedScope]?.recordedByName) 
                  ? rec.subjects[selectedScope].recordedByName 
                  : (rec.recordedByName || rec.submittedBy || "System");
                return `
                  <tr>
                    <td style="font-weight: 700; color: #1e293b;">${sName}</td>
                    <td class="student-code">${sCode}</td>
                    <td><span class="status-badge status-${sStatus}">${sStatus}</span></td>
                    <td>${sComment}</td>
                    <td style="color: #475569;">${sBy}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            Qefas Prep Hub Attendance Log Suite &bull; Exported on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;

    doc.write(htmlContent);
    doc.close();

    const triggerPrint = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      setTimeout(() => { document.body.removeChild(iframe); }, 1000);
    };

    const img = doc.querySelector('.school-logo') as HTMLImageElement | null;
    if (img && !img.complete) {
      img.onload = triggerPrint;
      img.onerror = triggerPrint;
      setTimeout(triggerPrint, 3000);
    } else {
      setTimeout(triggerPrint, 1000);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setShowListModal(true);
  };

  const handleSaveAttendance = (
    records: AttendanceRecord[],
    options?: { subjectId?: string; subjectName?: string }
  ) => {
    const targetSubjectId = options?.subjectId || (selectedScope !== 'daily' ? selectedScope : effectiveClassSubjects[0]?.id);
    const targetSubject = targetSubjectId ? effectiveClassSubjects.find(s => s.id === targetSubjectId) : undefined;

    const formattedRecords = records.map(r => ({
      studentId: r.studentId,
      status: r.status,
      note: r.comment || (r as any).note || '',
      date: selectedDate.toLocaleDateString('en-CA'),
      recordedByName: user?.name,
      recordedByRole: 'TEACHER',
    }));

    submitMutation.mutate({
      records: formattedRecords as unknown as Record<string, unknown>[],
      subjectId: targetSubjectId,
      subjectName: targetSubject?.name || options?.subjectName,
    }, {
      onSuccess: () => {
        setShowListModal(false);
        setShowSwipeModal(false);
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Tab Sub-Header */}
      <header className="py-4 border-b border-gray-150 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                Class Attendance
              </h2>
              {effectiveClassSubjects.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                  <Sparkles size={11} className="text-emerald-500" />
                  <span>
                    {effectiveClassSubjects.length === 1 
                      ? `Focused on: ${effectiveClassSubjects[0].name}`
                      : 'Focused on Your Assigned Subjects'}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {effectiveClassSubjects.length === 1 
                ? `Recording and tracking student attendance for ${effectiveClassSubjects[0].name}.`
                : 'Recording and tracking student attendance for your assigned subject periods.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <PremiumExportButton
              onExport={handleDownloadReport}
              label="Download Report"
              icon={<Download size={16} className="mr-2" />}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-emerald-700/50"
            />
            
            <button
              type="button"
              onClick={handleStartAttendance}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 dark:font-black gap-2 text-sm font-bold transition-all duration-300 shadow-sm shadow-emerald-600/25 dark:shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:-translate-y-0.5"
            >
              <Plus size={16} className="dark:text-slate-950 stroke-[2.5]" />
              <span className="truncate">Take Attendance</span>
            </button>
          </div>
        </div>

        {/* Assigned Subjects Scope Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Active Scope:
            </span>

            {/* Teacher's Assigned Subjects ONLY */}
            {effectiveClassSubjects.map((sub) => {
              const isSelected = selectedScope === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedScope(sub.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-500/20 dark:bg-emerald-500 dark:text-slate-950 dark:font-black dark:border dark:border-emerald-300/40 dark:shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  }`}
                >
                  <BookOpen size={13} className={isSelected ? 'text-white dark:text-slate-950' : 'text-emerald-600 dark:text-emerald-400'} />
                  <span>{sub.name}</span>
                  {sub.isAssignedToTeacher && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                      isSelected 
                        ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950' 
                        : 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      Assigned Subject
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {effectiveClassSubjects.length === 1 
              ? `Assigned Subject: ${effectiveClassSubjects[0].name}`
              : `${effectiveClassSubjects.length} subjects assigned to you`}
          </div>
        </div>
      </header>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AttendanceSummaryCard 
            summary={dailySummary}
            selectedDate={selectedDate.toISOString()}
            isLoading={isLoading || isFetching}
          />
          
          <AttendanceCalendar 
            days={calendarDays}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
        
        {/* Right Column - Attendance Table */}
        <AttendanceTable 
          records={enrichedAttendanceRecords}
          date={selectedDate.toISOString()}
          selectedScope={selectedScope}
          selectedScopeLabel={activeScopeLabel}
          classSubjects={effectiveClassSubjects}
          onEdit={handleEditRecord}
          onInspectRecord={(rec) => setInspectRecord(rec)}
          isLoading={isLoading || isFetching}
        />
      </div>

      <AttendanceModeModal 
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        classSubjects={effectiveClassSubjects}
        initialSubjectId={selectedScope}
        onSelectList={(targetSubjectId) => {
          setSelectedScope(targetSubjectId);
          setShowModeModal(false);
          setShowListModal(true);
        }}
        onSelectSwipe={(targetSubjectId) => {
          setSelectedScope(targetSubjectId);
          setShowModeModal(false);
          setShowSwipeModal(true);
        }}
      />

      <AttendanceModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        onSave={handleSaveAttendance}
        students={students}
        date={selectedDate.toLocaleDateString('en-CA')}
        initialRecords={enrichedAttendanceRecords}
        classSubjects={effectiveClassSubjects}
        defaultSubjectId={selectedScope}
        isSaving={submitMutation.isPending}
      />

      <AttendanceSwipeModal
        isOpen={showSwipeModal}
        onClose={() => setShowSwipeModal(false)}
        onSave={handleSaveAttendance}
        students={students}
        date={selectedDate.toISOString().split('T')[0]}
        initialRecords={enrichedAttendanceRecords}
        classSubjects={effectiveClassSubjects}
        defaultSubjectId={selectedScope}
        isSaving={submitMutation.isPending}
      />

      <StudentAttendanceDetailModal
        isOpen={!!inspectRecord}
        onClose={() => setInspectRecord(null)}
        record={inspectRecord}
        classSubjects={effectiveClassSubjects}
        classNameLabel={classData?.name || "Class"}
        onSave={(updatedRecord) => {
          const formattedRecord = {
            studentId: updatedRecord.studentId,
            status: updatedRecord.status,
            note: updatedRecord.comment || updatedRecord.note || '',
            date: selectedDate.toLocaleDateString('en-CA'),
            subjects: updatedRecord.subjects || {},
          };

          submitMutation.mutate({
            records: [formattedRecord] as unknown as Record<string, unknown>[],
          }, {
            onSuccess: () => {
              setInspectRecord(null);
            }
          });
        }}
        isSaving={submitMutation.isPending}
      />
    </div>
  );
}
