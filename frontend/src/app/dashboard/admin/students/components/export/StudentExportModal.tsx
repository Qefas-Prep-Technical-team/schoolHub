'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileSpreadsheet, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportQuotaBanner } from '@/app/dashboard/admin/grades/components/export/ExportQuotaBanner';
import { getMonthlyExportUsage, incrementMonthlyExportUsage } from '@/utils/exportQuotaManager';
import { dispatchExportLeadershipNotification } from '@/lib/api/services/exportNotificationService';
import { resolveDigitalSignatures } from '@/app/dashboard/admin/grades/utils/signatureResolver';
import { generatePDF } from '@/utils/pdfGenerator';
import { adminService } from '@/lib/api/services/adminService';
import { exportStudentsToExcel, exportStudentsToCSV } from '../../utils/studentSpreadsheetExporter';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

export type StudentExportFormat = 'pdf' | 'excel' | 'csv';

interface StudentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  schoolProfile: any;
  searchTerm?: string;
  activeFilters?: Record<string, string>;
  classFilters?: Array<{ id: string; name: string }>;
  departmentsData?: any[];
  subjectsData?: any[];
  userName?: string;
  userRole?: string;
}

export function StudentExportModal({
  isOpen,
  onClose,
  schoolId,
  schoolProfile,
  searchTerm = '',
  activeFilters = {},
  classFilters = [],
  departmentsData = [],
  subjectsData = [],
  userName = 'Administrator',
  userRole = 'ADMIN',
}: StudentExportModalProps) {
  const isPaying = Boolean(
    schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== 'FREE'
  );

  const quotaContextId = schoolId || 'school_context';
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));
  const isQuotaReached = !isPaying && quota.remaining <= 0;

  const [format, setFormat] = useState<StudentExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [modalFilters, setModalFilters] = useState({
    classId: '',
    departmentId: '',
    subjectId: '',
  });

  const handleExport = async () => {
    if (isQuotaReached) {
      toast.error('Monthly export quota reached (10/10). Please upgrade for unlimited exports.');
      return;
    }

    setIsExporting(true);
    try {
      // Free users: max 10 records per rules; Pro users: comprehensive dataset
      const exportLimit = isPaying ? 5000 : 10;
      const result = await adminService.getSchoolStudents(
        schoolId,
        1,
        exportLimit,
        searchTerm,
        {
          ...activeFilters,
          ...modalFilters,
        }
      );

      const rowsData = result?.data || [];
      if (!rowsData.length) {
        toast.info('No student records found matching the chosen export criteria.');
        setIsExporting(false);
        return;
      }

      const schoolName =
        schoolProfile?.name || 'Institutional School';
      const cleanSchoolName = schoolName.replace(/\s+/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const year = new Date().getFullYear();
      const baseFileName = `${cleanSchoolName}_Student_Directory_${dateStr}_${year}`;

      const headers = ['#', 'Full Name', 'Admission No / Code', 'Class', 'Department', 'Status'];
      const rows = rowsData.map((s: any, idx: number) => [
        idx + 1,
        s.name || '—',
        s.studentCode || 'UNASSIGNED',
        `${s.classes?.[0]?.class?.name || ''} ${s.classes?.[0]?.class?.section || ''}`.trim() || '—',
        s.department?.name || 'General',
        s.verified ? 'Verified' : 'Pending',
      ]);

      if (format === 'excel') {
        const excelData = rowsData.map((s: any, idx: number) => ({
          'S/N': idx + 1,
          'Student Name': s.name || '',
          'Student Code / Admission': s.studentCode || 'UNASSIGNED',
          'Email Address': s.email || 'N/A',
          'Class Enrolled': `${s.classes?.[0]?.class?.name || ''} ${s.classes?.[0]?.class?.section || ''}`.trim() || 'Unassigned',
          'Academic Department': s.department?.name || 'General',
          'Account Status': s.verified ? 'VERIFIED' : 'PENDING',
          'Lifecycle Status': s.lifecycleStatus || 'ENROLLED',
        }));
        exportStudentsToExcel(excelData, baseFileName, 'Student Directory');
      } else if (format === 'csv') {
        exportStudentsToCSV(headers, rows, baseFileName);
      } else {
        // PDF Export
        const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);
        await generatePDF({
          title: 'Official Student Directory',
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

      // Decrement monthly quota on free tier
      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
        setQuota(getMonthlyExportUsage(quotaContextId));
      }

      // Dispatch audit notification to school leadership
      await dispatchExportLeadershipNotification({
        schoolId,
        actorName: userName,
        actorRole: userRole,
        resourceTitle: 'Student Directory Registry',
        recordCount: rowsData.length,
        format: format.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
      }).catch(() => undefined);

      toast.success(`Student directory exported successfully as ${format.toUpperCase()}`);
      onClose();
    } catch (error: any) {
      console.error('Export student error:', error);
      toast.error(error?.message || 'Failed to export student directory');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Student Directory</h2>
                {isPaying ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-500/20">
                    <Sparkles size={11} /> PRO
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Download filtered rosters in PDF, Excel, or CSV format.
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="mb-4">
            <ExportQuotaBanner
              isPaying={isPaying}
              used={quota.used}
              limit={quota.limit}
              remaining={quota.remaining}
              userRole="ADMIN"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                Choose Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all',
                    format === 'pdf'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                  )}
                >
                  <FileText size={20} className="mb-1 text-rose-500" />
                  <span>PDF Document</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Formal Layout</span>
                </button>

                <button
                  type="button"
                  disabled={!isPaying}
                  onClick={() => isPaying && setFormat('excel')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all relative',
                    !isPaying && 'opacity-50 cursor-not-allowed',
                    format === 'excel'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                  )}
                >
                  {!isPaying && (
                    <span className="absolute top-1 right-1 text-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 px-1 rounded font-bold">
                      PRO
                    </span>
                  )}
                  <FileSpreadsheet size={20} className="mb-1 text-emerald-500" />
                  <span>Excel (.xlsx)</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Full Data</span>
                </button>

                <button
                  type="button"
                  disabled={!isPaying}
                  onClick={() => isPaying && setFormat('csv')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all relative',
                    !isPaying && 'opacity-50 cursor-not-allowed',
                    format === 'csv'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                  )}
                >
                  {!isPaying && (
                    <span className="absolute top-1 right-1 text-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 px-1 rounded font-bold">
                      PRO
                    </span>
                  )}
                  <Download size={20} className="mb-1 text-indigo-500" />
                  <span>CSV Raw</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Spreadsheet</span>
                </button>
              </div>
            </div>

            {/* Scope / Filter Options */}
            <div className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Target Scope Filters
              </label>

              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">Class</label>
                <select
                  value={modalFilters.classId}
                  onChange={(e) => setModalFilters((p) => ({ ...p, classId: e.target.value }))}
                  className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Classes</option>
                  {classFilters
                    .filter((c) => c.id)
                    .map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">Department</label>
                <select
                  value={modalFilters.departmentId}
                  onChange={(e) => setModalFilters((p) => ({ ...p, departmentId: e.target.value }))}
                  className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Departments</option>
                  {departmentsData.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">Subject</label>
                <select
                  value={modalFilters.subjectId}
                  onChange={(e) => setModalFilters((p) => ({ ...p, subjectId: e.target.value }))}
                  className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Subjects</option>
                  {subjectsData.map((subj: any) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={isExporting}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Export ({format.toUpperCase()})</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

