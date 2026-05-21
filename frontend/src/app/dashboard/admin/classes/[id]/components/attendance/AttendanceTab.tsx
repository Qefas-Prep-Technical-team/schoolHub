/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, Plus } from 'lucide-react';
import AttendanceSummaryCard from './components/AttendanceSummaryCard';
import AttendanceCalendar from './components/AttendanceCalendar';
import AttendanceTable from './components/AttendanceTable';
import AttendanceModal from './components/AttendanceModal';
import AttendanceModeModal from './components/AttendanceModeModal';
import AttendanceSwipeModal from './components/AttendanceSwipeModal';
import { 
  AttendanceRecord, 
  AttendanceSummary, 
  CalendarDay,
  MonthlyAttendance 
} from './components/types';

// Mock data
const mockStudents = [
  { id: '1', name: 'Jane Doe', code: '102345' },
  { id: '2', name: 'John Smith', code: '102346' },
  { id: '3', name: 'Emily White', code: '102347' },
  { id: '4', name: 'Michael Brown', code: '102348' },
  { id: '5', name: 'Jessica Jones', code: '102349' },
  { id: '6', name: 'David Wilson', code: '102350' },
  { id: '7', name: 'Sarah Miller', code: '102351' },
  { id: '8', name: 'Robert Taylor', code: '102352' },
  { id: '9', name: 'Lisa Anderson', code: '102353' },
  { id: '10', name: 'Thomas Moore', code: '102354' }
];

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Jane Doe',
    studentCode: '102345',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'present',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:30:00Z'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'John Smith',
    studentCode: '102346',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'absent',
    comment: 'Feeling unwell',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:30:00Z'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Emily White',
    studentCode: '102347',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'present',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:30:00Z'
  },
  {
    id: '4',
    studentId: '4',
    studentName: 'Michael Brown',
    studentCode: '102348',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'late',
    comment: '5 mins, traffic',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:35:00Z'
  },
  {
    id: '5',
    studentId: '5',
    studentName: 'Jessica Jones',
    studentCode: '102349',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'present',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:30:00Z'
  }
];

const mockMonthlySummary: AttendanceSummary = {
  date: '2023-10',
  totalStudents: 10,
  present: 1240,
  absent: 58,
  late: 12,
  excused: 0,
  attendanceRate: 95
};

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
    return (classData?.enrollments || []).map((e: any) => ({
      id: e.student.id,
      name: e.student.name,
      code: e.student.studentCode || e.student.id.substring(0, 6)
    }));
  }, [classData]);

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
          hasAttendance: false // Simplified for now
        });
      }
      
      return days;
    };
    
    setCalendarDays(generateCalendarDays());
  }, [selectedDate]);

  const dailySummary = useMemo(() => {
    const total = attendanceRecords.length;
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
  }, [attendanceRecords, selectedDate]);



  // Removed breadcrumbItems

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

    // Compute stats for selected date from attendanceRecords
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
              letter-spacing: -0.3px;
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
              font-size: 20px;
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
              letter-spacing: 0.5px;
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
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              border: 1px solid #cbd5e1;
              text-align: left;
              padding: 10px 12px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #475569;
              letter-spacing: 0.5px;
            }
            td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              font-size: 11px;
              vertical-align: middle;
            }
            tr:nth-child(even) {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .status-badge {
              display: inline-block;
              font-weight: 800;
              font-size: 10px;
              padding: 4px 8px;
              border-radius: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              text-align: center;
              min-width: 64px;
            }
            .status-present {
              background-color: #d1fae5 !important;
              color: #065f46 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .status-absent {
              background-color: #fee2e2 !important;
              color: #991b1b !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .status-late {
              background-color: #fef3c7 !important;
              color: #92400e !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .status-excused {
              background-color: #e0f2fe !important;
              color: #075985 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .student-code {
              font-family: monospace;
              color: #64748b;
              font-weight: 600;
            }
            .empty-state {
              text-align: center;
              padding: 30px;
              color: #94a3b8;
              font-style: italic;
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
                const sStatus = rec.status || "absent";
                const sComment = rec.comment || rec.note || "-";
                const sBy = rec.submittedBy || "System";
                return `
                  <tr>
                    <td style="font-weight: 700; color: #1e293b;">${sName}</td>
                    <td class="student-code">${sCode}</td>
                    <td>
                      <span class="status-badge status-${sStatus}">${sStatus}</span>
                    </td>
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
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
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

  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    // Map records to keep status, comment, date, and studentId
    const formattedRecords = records.map(r => ({
      studentId: r.studentId,
      status: r.status,
      note: r.comment || (r as any).note || '',
      date: selectedDate.toLocaleDateString('en-CA')
    }));

    submitMutation.mutate(formattedRecords as unknown as Record<string, unknown>[], {
      onSuccess: () => {
        setShowListModal(false);
        setShowSwipeModal(false);
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Tab Sub-Header */}
      <header className="py-4 border-b border-gray-150 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-gray-900 dark:text-white text-xl font-bold">
              Class Attendance
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Manage daily attendance records, track summaries, and log status updates.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Download size={18} className="mr-2" />
              <span className="truncate">Download Report</span>
            </button>
            
            <button
              type="button"
              onClick={handleStartAttendance}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-md shadow-primary/10"
            >
              <Plus size={18} />
              <span className="truncate">Start Attendance</span>
            </button>
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
          records={attendanceRecords}
          date={selectedDate.toISOString()}
          onEdit={handleEditRecord}
          isLoading={isLoading || isFetching}
        />
      </div>

      <AttendanceModeModal 
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        onSelectList={() => {
          setShowModeModal(false);
          setShowListModal(true);
        }}
        onSelectSwipe={() => {
          setShowModeModal(false);
          setShowSwipeModal(true);
        }}
      />

      <AttendanceModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        onSave={handleSaveAttendance}
        students={students.length > 0 ? students : mockStudents}
        date={selectedDate.toLocaleDateString('en-CA')}
        initialRecords={attendanceRecords}
        isSaving={submitMutation.isPending}
      />

      <AttendanceSwipeModal
        isOpen={showSwipeModal}
        onClose={() => setShowSwipeModal(false)}
        onSave={handleSaveAttendance}
        students={students.length > 0 ? students : mockStudents}
        date={selectedDate.toISOString().split('T')[0]}
        initialRecords={attendanceRecords}
        isSaving={submitMutation.isPending}
      />
    </div>
  );
}