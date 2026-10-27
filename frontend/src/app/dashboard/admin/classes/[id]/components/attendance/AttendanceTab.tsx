/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useRouter, useParams } from 'next/navigation';
import { Download, Plus, FileText, FileSpreadsheet, Info, BookOpen, School, ChevronDown, CheckCircle2 } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AttendanceSummaryCard from './components/AttendanceSummaryCard';
import AttendanceCalendar from './components/AttendanceCalendar';
import AttendanceTable from './components/AttendanceTable';
import AttendanceModal from './components/AttendanceModal';
import AttendanceModeModal from './components/AttendanceModeModal';
import AttendanceSwipeModal from './components/AttendanceSwipeModal';
import StudentAttendanceDetailModal from './components/StudentAttendanceDetailModal';
import { 
  AttendanceRecord, 
  AttendanceSummary, 
  CalendarDay,
  ClassSubjectItem,
  MonthlyAttendance 
} from './components/types';

import { 
  useClassAttendance, 
  useClassAttendanceSummary, 
  useSubmitAttendance 
} from '@/lib/api/hooks/useClasses';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';

interface AttendanceTabProps {
  classData?: any;
}

export default function ClassAttendancePage({ classData }: AttendanceTabProps) {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const schoolId = classData?.schoolId || "";

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedScope, setSelectedScope] = useState<string>("daily");
  const [inspectRecord, setInspectRecord] = useState<AttendanceRecord | null>(null);

  const [showModeModal, setShowModeModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showSwipeModal, setShowSwipeModal] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  // Real Data Hooks
  const { data: attendanceRecords = [], isLoading, isFetching } = useClassAttendance(classId, selectedDate.toLocaleDateString('en-CA'));
  const { data: settings } = useSchoolSettings(schoolId);
  const submitMutation = useSubmitAttendance(classId);

  // Map real students from classData enrollments
  const students = useMemo(() => {
    return (classData?.enrollments || []).filter((e: any) => e?.student?.id).map((e: any) => ({
      id: e.student.id,
      name: e.student.name,
      code: e.student.studentCode || e.student.id.substring(0, 6)
    }));
  }, [classData]);

  // Extract subjects attached to this class with departments and teacher assignments
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

        const teacherIds: string[] = [];
        if (s.teacher?.id) teacherIds.push(s.teacher.id);
        if (s.teacher?.userId) teacherIds.push(s.teacher.userId);
        if (cs.teacher?.id) teacherIds.push(cs.teacher.id);
        if (cs.teacher?.userId) teacherIds.push(cs.teacher.userId);
        if (Array.isArray(s.teacherSubjects)) {
          s.teacherSubjects.forEach((ts: any) => {
            if (ts.teacher?.id) teacherIds.push(ts.teacher.id);
            if (ts.teacher?.userId) teacherIds.push(ts.teacher.userId);
            if (ts.teacherId) teacherIds.push(ts.teacherId);
          });
        }

        return {
          id: s.id,
          name: s.name,
          code: s.code,
          departmentIds,
          departmentNames,
          teacher: s.teacher ? { id: s.teacher.id, name: s.teacher.name } : (cs.teacher ? { id: cs.teacher.id, name: cs.teacher.name } : undefined),
          teacherIds: Array.from(new Set(teacherIds)),
        };
      })
      .filter((s: ClassSubjectItem | null): s is ClassSubjectItem => s !== null);
  }, [classData]);

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
    return attendanceRecords.map((rec: AttendanceRecord) => {
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

  const activeScopeLabel = useMemo(() => {
    if (selectedScope === 'daily') return 'School Arrival (Daily)';
    const sub = classSubjects.find(s => s.id === selectedScope);
    return sub ? `Subject: ${sub.name}` : 'School Arrival (Daily)';
  }, [selectedScope, classSubjects]);

  useEffect(() => {
    // Generate calendar days
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
          hasAttendance: false
        });
      }
      
      return days;
    };
    
    setCalendarDays(generateCalendarDays());
  }, [selectedDate]);

  // Scope-aware daily summary calculation
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
    if (!doc) {
      return;
    }

    const classNameVal = classData?.name || "Class Attendance";
    const schoolNameVal = settings?.schoolName || classData?.school?.name || "Academic Institution";
    const schoolLogoVal = settings?.logo || "";
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dayTotal = attendanceRecords.length;
    const dayPresent = dailySummary.present;
    const dayAbsent = dailySummary.absent;
    const dayLate = dailySummary.late;
    const dayRate = dailySummary.attendanceRate.toFixed(1);

    const isSub = selectedScope !== 'daily';
    const subTitle = isSub ? `Subject Attendance (${activeScopeLabel})` : "General School Attendance";

    const htmlContent = `
      <html>
        <head>
          <title>${classNameVal} - ${subTitle} (${selectedDate.toLocaleDateString('en-CA')})</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              line-height: 1.4;
              background-color: #ffffff;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #10b981;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .school-branding {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .school-logo {
              height: 52px;
              width: 52px;
              object-fit: contain;
              border-radius: 8px;
              border: 1px solid #cbd5e1;
            }
            .school-info h2 {
              font-size: 18px;
              font-weight: 800;
              margin: 0;
              color: #0f172a;
              text-transform: uppercase;
            }
            .school-info p {
              font-size: 11px;
              color: #64748b;
              margin: 2px 0 0 0;
              font-weight: 600;
            }
            .report-title-section {
              text-align: right;
            }
            .report-title-section h1 {
              font-size: 18px;
              font-weight: 800;
              margin: 0;
              color: #047857;
              text-transform: uppercase;
            }
            .report-title-section p {
              font-size: 11px;
              color: #475569;
              margin: 2px 0 0 0;
              font-weight: 700;
            }
            .summary-strip {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px;
            }
            .summary-card {
              text-align: center;
              border-right: 1px solid #e2e8f0;
            }
            .summary-card:last-child {
              border-right: none;
            }
            .summary-card-label {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 800;
            }
            .summary-card-value {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f1f5f9 !important;
              border: 1px solid #cbd5e1;
              text-align: left;
              padding: 10px 12px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #475569;
            }
            td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              font-size: 11px;
              vertical-align: middle;
            }
            .status-badge {
              display: inline-block;
              font-weight: 800;
              font-size: 10px;
              padding: 4px 8px;
              border-radius: 6px;
              text-transform: uppercase;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px dashed #e2e8f0;
              padding-top: 12px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="school-branding">
              ${schoolLogoVal ? `<img class="school-logo" src="${schoolLogoVal}" alt="School Logo" />` : ''}
              <div class="school-info">
                <h2>${schoolNameVal}</h2>
                <p>Class: ${classNameVal} &bull; Scope: ${activeScopeLabel}</p>
              </div>
            </div>
            <div class="report-title-section">
              <h1>${subTitle}</h1>
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
                <th style="width: 5%;">S/N</th>
                <th style="width: 25%;">Student Name</th>
                <th style="width: 15%;">Admission ID</th>
                <th style="width: 15%;">${isSub ? 'Subject Status' : 'School Status'}</th>
                <th style="width: 20%;">${isSub ? 'School Arrival' : 'Subjects Available'}</th>
                <th style="width: 20%;">Marked By</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceRecords.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 20px; color: #94a3b8;">No attendance recorded for this date.</td>
                </tr>
              ` : attendanceRecords.map((rec: any, index: number) => {
                const sName = rec.student?.name || rec.studentName || "Unknown Student";
                const sCode = rec.student?.studentCode || rec.studentCode || "-";
                const sStatus = isSub ? (rec.subjects?.[selectedScope]?.status || "unrecorded") : (rec.status || "absent");
                const sBy = rec.recordedByName || rec.submittedBy || "System";
                const secCol = isSub ? (rec.status || "-") : `${Object.keys(rec.subjects || {}).length} Logged`;
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: 700;">${sName}</td>
                    <td>${sCode}</td>
                    <td><span class="status-badge">${sStatus}</span></td>
                    <td>${secCol}</td>
                    <td>${sBy}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            Qefas Prep Hub &bull; Exported on ${new Date().toLocaleDateString()}
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
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };

    setTimeout(triggerPrint, 1000);
  };

  const handleExportCSV = () => {
    if (attendanceRecords.length === 0) {
      toast.warning("No attendance records to export");
      return;
    }

    const isSub = selectedScope !== 'daily';
    const headers = ['S/N', 'Student Name', 'Admission ID', isSub ? 'Subject Status' : 'School Status', isSub ? 'School Arrival' : 'Subject Availability', 'Comment', 'Marked By'];
    
    const rows = attendanceRecords.map((rec: any, index: number) => {
      const sStatus = isSub ? (rec.subjects?.[selectedScope]?.status || "unrecorded") : (rec.status || "absent");
      const secCol = isSub ? (rec.status || "-") : `${Object.keys(rec.subjects || {}).length} Subjects`;
      return [
        `"${index + 1}"`,
        `"${rec.student?.name || rec.studentName || "Unknown Student"}"`,
        `"${rec.student?.studentCode || rec.studentCode || "-"}"`,
        `"${sStatus}"`,
        `"${secCol}"`,
        `"${rec.comment || rec.note || "-"}"`,
        `"${rec.recordedByName || rec.submittedBy || "System"}"`
      ];
    });

    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const schoolNameVal = (globalThis as any)?.schoolProfile?.name || (globalThis as any)?.settings?.schoolName || 'School';
    const classNameVal = classData?.name || 'Class';

    const csvContent = [
      `"${schoolNameVal}"`,
      `"Class: ${classNameVal}"`,
      `"Scope: ${activeScopeLabel}"`,
      `"Date: ${formattedDate}"`,
      '',
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].filter(r => r !== '""').join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${classNameVal.replace(/\s+/g, '_')}_${activeScopeLabel.replace(/\s+/g, '_')}_Attendance_${selectedDate.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported Successfully!");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setInspectRecord(record);
  };

  const handleInspectRecord = (record: AttendanceRecord) => {
    setInspectRecord(record);
  };

  const handleSaveAttendance = (
    records: AttendanceRecord[], 
    options?: { subjectId?: string; subjectName?: string }
  ) => {
    const formattedRecords = records.map(r => ({
      studentId: r.studentId,
      status: r.status,
      note: r.comment || (r as any).note || '',
      date: selectedDate.toLocaleDateString('en-CA'),
      subjects: r.subjects || {},
    }));

    submitMutation.mutate({
      records: formattedRecords as unknown as Record<string, unknown>[],
      subjectId: options?.subjectId,
      subjectName: options?.subjectName,
    }, {
      onSuccess: () => {
        setShowListModal(false);
        setShowSwipeModal(false);
        setInspectRecord(null);
      }
    });
  };

  const handleSaveSingleRecord = (updatedRecord: AttendanceRecord) => {
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
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Tab Sub-Header */}
      <header className="py-4 border-b border-gray-150 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
                <span>Class Attendance</span>
              </h2>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Track daily school arrival and subject-period attendance for this class. Click any entry to inspect arrival verification and subject attendance breakdown.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Dual tracking: School Arrival (daily presence) & Subject Period attendance records.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
                >
                  <Download size={18} className="mr-2" />
                  <span className="truncate">Download Report</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleDownloadReport} className="cursor-pointer flex items-center gap-2">
                  <FileText size={16} className="text-rose-500" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-500" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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

        {/* Dual Tracking Scope Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Active Scope:
            </span>

            {/* School Daily Option */}
            <button
              type="button"
              onClick={() => setSelectedScope('daily')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedScope === 'daily'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-500/20 dark:bg-emerald-500 dark:text-slate-950 dark:font-black dark:border dark:border-emerald-300/40 dark:shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <School size={14} className={selectedScope === 'daily' ? 'text-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'} />
              <span>School Arrival (Daily)</span>
            </button>

            {/* Attached Subjects Switcher */}
            {classSubjects.map((sub) => {
              const isSelected = selectedScope === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedScope(sub.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 ring-2 ring-indigo-500/20 dark:bg-indigo-500 dark:text-white dark:font-black dark:border dark:border-indigo-300/40 dark:shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <BookOpen size={13} className={isSelected ? 'text-white' : 'text-indigo-500'} />
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {classSubjects.length} subjects attached to class
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
          classSubjects={classSubjects}
          onEdit={handleEditRecord}
          onInspectRecord={handleInspectRecord}
          isLoading={isLoading || isFetching}
        />
      </div>

      {/* Mode Choice Modal (List vs Swipe with Subject Selector) */}
      <AttendanceModeModal 
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        classSubjects={classSubjects}
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

      {/* List Modal */}
      <AttendanceModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        onSave={handleSaveAttendance}
        students={students}
        date={selectedDate.toLocaleDateString('en-CA')}
        initialRecords={attendanceRecords}
        classSubjects={classSubjects}
        defaultSubjectId={selectedScope}
        isSaving={submitMutation.isPending}
      />

      {/* Swipe Modal */}
      <AttendanceSwipeModal
        isOpen={showSwipeModal}
        onClose={() => setShowSwipeModal(false)}
        onSave={handleSaveAttendance}
        students={students}
        date={selectedDate.toLocaleDateString('en-CA')}
        initialRecords={attendanceRecords}
        classSubjects={classSubjects}
        defaultSubjectId={selectedScope}
        isSaving={submitMutation.isPending}
      />

      {/* Detail & Subject Inspection Pop-up Modal */}
      <StudentAttendanceDetailModal
        isOpen={!!inspectRecord}
        onClose={() => setInspectRecord(null)}
        record={inspectRecord}
        classSubjects={classSubjects}
        classNameLabel={classData?.name || "Class"}
        onSave={handleSaveSingleRecord}
        isSaving={submitMutation.isPending}
      />
    </div>
  );
}