'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileSpreadsheet, FileText, CheckCircle2, Lock, Users, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportQuotaBanner } from '@/app/dashboard/admin/grades/components/export/ExportQuotaBanner';
import { getMonthlyExportUsage, incrementMonthlyExportUsage } from '@/utils/exportQuotaManager';
import { ConnectedSchoolSignatureFetcher } from '@/components/signature/ConnectedSchoolSignatureFetcher';
import { dispatchExportLeadershipNotification } from '@/lib/api/services/exportNotificationService';
import { resolveDigitalSignatures } from '@/app/dashboard/admin/grades/utils/signatureResolver';
import { generatePDF } from '@/utils/pdfGenerator';
import { exportTeachersToExcel, exportTeachersToCSV } from '../../utils/teacherSpreadsheetExporter';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

export type TeacherExportDataset = 'profiles' | 'attendance';
export type TeacherExportFormat = 'pdf' | 'excel' | 'csv';

interface TeacherExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: any[];
  schoolProfile: any;
  schoolId: string;
  sessionsData?: any;
  userName?: string;
  userRole?: string;
}

export function TeacherExportModal({
  isOpen,
  onClose,
  teachers,
  schoolProfile,
  schoolId,
  sessionsData,
  userName = 'Administrator',
  userRole = 'ADMIN',
}: TeacherExportModalProps) {
  const isPaying = Boolean(
    schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== 'FREE'
  );

  const quotaContextId = schoolId || 'school_context';
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));
  const isQuotaReached = !isPaying && quota.remaining <= 0;

  const [dataset, setDataset] = useState<TeacherExportDataset>('profiles');
  const [format, setFormat] = useState<TeacherExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  // Attendance options
  const [attendanceMode, setAttendanceMode] = useState<'summary' | 'detailed'>('summary');
  const [rangeMode, setRangeMode] = useState<'custom' | 'term'>('custom');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTermPeriod, setSelectedTermPeriod] = useState<string>('');

  const schoolName = schoolProfile?.name || 'Qefas Institution';
  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();

  const handleSelectFormat = (fmt: TeacherExportFormat) => {
    if (!isPaying && fmt !== 'pdf') {
      toast.info('Excel (.xlsx) and CSV exports are available on institutional paid plans.');
      return;
    }
    setFormat(fmt);
  };

  const handleExecuteExport = async () => {
    if (isQuotaReached) {
      toast.error('Monthly export quota reached (10/10). Upgrade to institutional plan for unlimited downloads.');
      return;
    }

    setIsExporting(true);
    try {
      if (dataset === 'profiles') {
        const baseFileName = `${cleanSchool} - Teacher Profiles - ${new Date().toISOString().split('T')[0]}`;
        const headers = ['#', 'Name', 'Email', 'Faculty ID', 'Assigned Subjects', 'Assigned Classes', 'Status'];
        const rows = teachers.map((t, idx) => [
          idx + 1,
          t.name || 'Unnamed',
          t.email || '—',
          t.teacherCode || 'UNASSIGNED',
          Array.isArray(t.subjects) ? t.subjects.join(', ') : '—',
          Array.isArray(t.classes) ? t.classes.join(', ') : '—',
          (t.status || 'ACTIVE').toUpperCase(),
        ]);

        if (format === 'excel') {
          const excelData = teachers.map((t, idx) => ({
            'S/N': idx + 1,
            'Faculty Name': t.name || 'Unnamed',
            'Official Email': t.email || '—',
            'Teacher ID': t.teacherCode || 'UNASSIGNED',
            'Assigned Subjects': Array.isArray(t.subjects) ? t.subjects.join(', ') : '—',
            'Assigned Classes': Array.isArray(t.classes) ? t.classes.join(', ') : '—',
            'Account Status': (t.status || 'ACTIVE').toUpperCase(),
          }));
          exportTeachersToExcel(excelData, baseFileName, 'Faculty Profiles');
        } else if (format === 'csv') {
          exportTeachersToCSV(headers, rows, baseFileName);
        } else {
          // Formal PDF via global generator
          const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);
          await generatePDF({
            title: 'Official Faculty Directory',
            filename: `${baseFileName}.pdf`,
            schoolProfile: {
              ...schoolProfile,
              name: schoolName,
            },
            orientation: 'landscape',
            tableHeaders: [headers],
            tableData: rows.map(r => r.map(c => String(c))),
            signatures: isPaying
              ? {
                  left: sigs.principalSigUrl ? { label: 'Head of Institution', signatureUrl: sigs.principalSigUrl } : undefined,
                  right: { label: 'Authorized Administrator' },
                }
              : undefined,
          });
        }

        // Increment quota & dispatch audit
        if (!isPaying) incrementMonthlyExportUsage(quotaContextId);
        await dispatchExportLeadershipNotification({
          schoolId,
          actorName: userName,
          actorRole: userRole,
          resourceTitle: 'Faculty Directory Report',
          recordCount: teachers.length,
          format: format.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
        }).catch(() => undefined);

        toast.success(`Faculty directory exported as ${format.toUpperCase()}`);
        onClose();
      } else {
        // Attendance export
        const { adminService } = await import('@/lib/api/services/adminService');
        let start = startDate;
        let end = endDate;
        let dateLabel = startDate === endDate ? startDate : `${startDate} to ${endDate}`;

        if (rangeMode === 'term' && selectedTermPeriod) {
          const [tsStart, tsEnd, termName] = selectedTermPeriod.split('|');
          start = tsStart;
          end = tsEnd;
          dateLabel = termName;
        }

        const result = await adminService.getSchoolTeacherAttendanceByDate(schoolId, undefined, start, end);
        const rawRecords = Array.isArray(result) ? result : (result?.data || []);

        const baseFileName = `${cleanSchool} - Teacher Attendance ${attendanceMode.toUpperCase()} - ${dateLabel.replace(/\s+/g, '_')}`;

        if (attendanceMode === 'detailed') {
          const headers = ['#', 'Teacher Name', 'Teacher ID', 'Date', 'Status', 'Time In', 'Time Out', 'Remarks'];
          const rows = rawRecords.map((r: any, idx: number) => [
            idx + 1,
            r.teacher?.name || '—',
            r.teacher?.teacherCode || '—',
            new Date(r.date).toLocaleDateString(),
            (r.status || '—').toUpperCase(),
            r.timeIn || '—',
            r.timeOut || '—',
            r.remarks || '—',
          ]);

          if (format === 'excel') {
            const excelData = rawRecords.map((r: any, idx: number) => ({
              'S/N': idx + 1,
              'Faculty Name': r.teacher?.name || '—',
              'Faculty ID': r.teacher?.teacherCode || '—',
              'Date': new Date(r.date).toLocaleDateString(),
              'Attendance Status': (r.status || '—').toUpperCase(),
              'Clock In': r.timeIn || '—',
              'Clock Out': r.timeOut || '—',
              'Administrative Remarks': r.remarks || '—',
            }));
            exportTeachersToExcel(excelData, baseFileName, 'Attendance Logs');
          } else if (format === 'csv') {
            exportTeachersToCSV(headers, rows, baseFileName);
          } else {
            const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);
            await generatePDF({
              title: `Faculty Attendance Daily Logs (${dateLabel})`,
              filename: `${baseFileName}.pdf`,
              schoolProfile: {
                ...schoolProfile,
                name: schoolName,
              },
              orientation: 'landscape',
              tableHeaders: [headers],
              tableData: rows.map((r: any[]) => r.map((c: any) => String(c))),
              signatures: isPaying
                ? {
                    left: sigs.principalSigUrl ? { label: 'Head of Institution', signatureUrl: sigs.principalSigUrl } : undefined,
                    right: { label: 'Authorized Administrator' },
                  }
                : undefined,
            });
          }
        } else {
          // Summary mode
          const summaryMap: Record<string, any> = {};
          rawRecords.forEach((r: any) => {
            const tId = r.teacherId;
            if (!summaryMap[tId]) {
              summaryMap[tId] = {
                name: r.teacher?.name || '—',
                code: r.teacher?.teacherCode || '—',
                present: 0,
                absent: 0,
                late: 0,
                excused: 0,
                total: 0,
              };
            }
            summaryMap[tId].total++;
            if (r.status === 'present') summaryMap[tId].present++;
            else if (r.status === 'absent') summaryMap[tId].absent++;
            else if (r.status === 'late') summaryMap[tId].late++;
            else if (r.status === 'excused') summaryMap[tId].excused++;
          });

          const summaryList = Object.values(summaryMap);
          const headers = ['#', 'Faculty Name', 'Faculty ID', 'Present', 'Absent', 'Late', 'Excused', 'Total Days'];
          const rows = summaryList.map((s, idx) => [
            idx + 1,
            s.name,
            s.code,
            s.present,
            s.absent,
            s.late,
            s.excused,
            s.total,
          ]);

          if (format === 'excel') {
            const excelData = summaryList.map((s, idx) => ({
              'S/N': idx + 1,
              'Faculty Name': s.name,
              'Faculty ID': s.code,
              'Present Days': s.present,
              'Absent Days': s.absent,
              'Late Days': s.late,
              'Excused Days': s.excused,
              'Total Days Evaluated': s.total,
            }));
            exportTeachersToExcel(excelData, baseFileName, 'Attendance Summary');
          } else if (format === 'csv') {
            exportTeachersToCSV(headers, rows, baseFileName);
          } else {
            const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);
            await generatePDF({
              title: `Faculty Attendance Summary (${dateLabel})`,
              filename: `${baseFileName}.pdf`,
              schoolProfile: {
                ...schoolProfile,
                name: schoolName,
              },
              orientation: 'landscape',
              tableHeaders: [headers],
              tableData: rows.map((r: any[]) => r.map((c: any) => String(c))),
              signatures: isPaying
                ? {
                    left: sigs.principalSigUrl ? { label: 'Head of Institution', signatureUrl: sigs.principalSigUrl } : undefined,
                    right: { label: 'Authorized Administrator' },
                  }
                : undefined,
            });
          }
        }

        if (!isPaying) incrementMonthlyExportUsage(quotaContextId);
        await dispatchExportLeadershipNotification({
          schoolId,
          actorName: userName,
          actorRole: userRole,
          resourceTitle: `Faculty Attendance Report (${dateLabel})`,
          recordCount: rawRecords.length,
          format: format.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
        }).catch(() => undefined);

        toast.success(`Faculty attendance exported as ${format.toUpperCase()}`);
        onClose();
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to generate export file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Export Faculty Records
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate official institutional faculty lists and attendance reports
              </p>
            </div>
            <button
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quota Banner */}
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={quota.limit}
            remaining={quota.remaining}
            userRole="ADMIN"
          />

          {/* Dataset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Select Dataset
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDataset('profiles')}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5",
                  dataset === 'profiles'
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-600/20"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <Users className={cn("size-5 mt-0.5 shrink-0", dataset === 'profiles' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                <div>
                  <p className="text-xs font-bold">Faculty Profiles</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Full staff roster, subjects & classes</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDataset('attendance')}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5",
                  dataset === 'attendance'
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-600/20"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <Calendar className={cn("size-5 mt-0.5 shrink-0", dataset === 'attendance' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                <div>
                  <p className="text-xs font-bold">Attendance Records</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Daily logs & aggregate summaries</p>
                </div>
              </button>
            </div>
          </div>

          {/* Attendance Customizations */}
          {dataset === 'attendance' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Report Detail Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendanceMode('summary')}
                    className={cn(
                      "py-1.5 px-3 rounded-xl text-xs font-bold transition-all border",
                      attendanceMode === 'summary'
                        ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-600 shadow-sm"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60"
                    )}
                  >
                    Summary Counts
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceMode('detailed')}
                    className={cn(
                      "py-1.5 px-3 rounded-xl text-xs font-bold transition-all border",
                      attendanceMode === 'detailed'
                        ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-600 shadow-sm"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60"
                    )}
                  >
                    Detailed Daily Logs
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setRangeMode('custom')}
                    className={cn(
                      "py-1 text-xs font-semibold rounded-lg border",
                      rangeMode === 'custom' ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600" : "border-transparent text-slate-500"
                    )}
                  >
                    Custom Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => setRangeMode('term')}
                    className={cn(
                      "py-1 text-xs font-semibold rounded-lg border",
                      rangeMode === 'term' ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600" : "border-transparent text-slate-500"
                    )}
                  >
                    Academic Term
                  </button>
                </div>

                {rangeMode === 'term' ? (
                  <select
                    value={selectedTermPeriod}
                    onChange={(e) => setSelectedTermPeriod(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900"
                  >
                    <option value="">Select term period...</option>
                    {sessionsData?.data?.map((s: any) => (
                      <optgroup key={s.id} label={`${s.name} Academic Session`}>
                        {s.termPeriods?.map((tp: any) => (
                          <option
                            key={tp.id}
                            value={`${new Date(tp.startDate).toISOString().split('T')[0]}|${new Date(tp.endDate).toISOString().split('T')[0]}|${s.name} ${tp.term} Term`}
                          >
                            {tp.term} Term ({new Date(tp.startDate).toLocaleDateString()} - {new Date(tp.endDate).toLocaleDateString()})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Start</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-8 px-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">End</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-8 px-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Format Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Choose Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectFormat('pdf')}
                className={cn(
                  "p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1",
                  format === 'pdf'
                    ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <FileText className="size-5 text-rose-500" />
                <span className="text-xs font-bold">PDF (.pdf)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFormat('excel')}
                className={cn(
                  "p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 relative",
                  format === 'excel'
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60",
                  !isPaying && "opacity-60 cursor-not-allowed"
                )}
              >
                {!isPaying && (
                  <span className="absolute top-1 right-1 px-1 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500 text-white">PRO</span>
                )}
                <FileSpreadsheet className="size-5 text-emerald-500" />
                <span className="text-xs font-bold">Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFormat('csv')}
                className={cn(
                  "p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 relative",
                  format === 'csv'
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60",
                  !isPaying && "opacity-60 cursor-not-allowed"
                )}
              >
                {!isPaying && (
                  <span className="absolute top-1 right-1 px-1 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500 text-white">PRO</span>
                )}
                <Download className="size-5 text-blue-500" />
                <span className="text-xs font-bold">CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Leadership Signature card for paying customers */}
          {format === 'pdf' && schoolId && isPaying && (
            <ConnectedSchoolSignatureFetcher
              schoolId={schoolId}
              schoolProfile={schoolProfile}
              variant="card"
            />
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 rounded-2xl font-bold h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteExport}
              disabled={isExporting || isQuotaReached}
              className="flex-1 rounded-2xl font-bold h-11 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-500/20"
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin size-4 border-2 border-white/30 border-t-white rounded-full" />
                  Generating...
                </span>
              ) : (
                <>
                  <Download size={16} />
                  Download {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

