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
import { exportClassesToExcel, exportClassesToCSV } from '../../utils/classSpreadsheetExporter';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

export type ClassTeachersExportFormat = 'pdf' | 'excel' | 'csv';

interface ClassTeachersExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameStr?: string;
  teachers: any[];
  schoolProfile: any;
  schoolId: string;
}

export function ClassTeachersExportModal({
  isOpen,
  onClose,
  classNameStr = 'Class',
  teachers,
  schoolProfile,
  schoolId,
}: ClassTeachersExportModalProps) {
  const { user } = useAuthStore();
  const isPaying = Boolean(
    schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== 'FREE'
  );

  const quotaContextId = schoolId || 'school_context';
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));
  const isQuotaReached = !isPaying && quota.remaining <= 0;

  const [format, setFormat] = useState<ClassTeachersExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isQuotaReached) {
      toast.error('Monthly export quota reached (10/10). Please upgrade for unlimited exports.');
      return;
    }

    setIsExporting(true);
    try {
      if (!teachers.length) {
        toast.info('No teachers assigned to this class to export.');
        setIsExporting(false);
        return;
      }

      const schoolName = schoolProfile?.name || 'Institutional School';
      const cleanSchool = schoolName.replace(/\s+/g, '_');
      const cleanClass = classNameStr.replace(/\s+/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const year = new Date().getFullYear();
      const baseFileName = `${cleanSchool}_${cleanClass}_Faculty_Roster_${dateStr}_${year}`;

      const headers = ['#', 'Teacher Name', 'Email', 'Phone', 'Role Assignment'];
      const rows = teachers.map((ct: any, idx: number) => [
        idx + 1,
        ct.teacher?.name || '—',
        ct.teacher?.email || '—',
        ct.teacher?.phone || '—',
        ct.isLead ? 'Lead Teacher' : 'Subject Teacher',
      ]);

      if (format === 'excel') {
        const excelData = teachers.map((ct: any, idx: number) => ({
          'S/N': idx + 1,
          'Teacher Name': ct.teacher?.name || '',
          'Email': ct.teacher?.email || '',
          'Phone': ct.teacher?.phone || '',
          'Role Assignment': ct.isLead ? 'Lead Teacher' : 'Subject Teacher',
          'Class Room': classNameStr,
        }));
        exportClassesToExcel(excelData, baseFileName, 'Faculty Roster');
      } else if (format === 'csv') {
        exportClassesToCSV(headers, rows, baseFileName);
      } else {
        // PDF Export
        const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);
        await generatePDF({
          title: `Class Faculty Roster: ${classNameStr}`,
          filename: `${baseFileName}.pdf`,
          schoolProfile: {
            ...schoolProfile,
            name: schoolName,
          },
          orientation: 'portrait',
          metaData: [
            { label: 'Class Room', value: classNameStr },
            { label: 'Total Faculty', value: `${teachers.length} Teachers` },
            { label: 'Date Generated', value: new Date().toLocaleDateString() },
          ],
          tableHeaders: [headers],
          tableData: rows.map((r) => r.map((c) => String(c))),
          signatures: isPaying
            ? {
                left: sigs.principalSigUrl ? { label: 'Head of Institution', signatureUrl: sigs.principalSigUrl } : undefined,
                right: { label: 'Authorized Administrator' },
              }
            : undefined,
        });
      }

      // Quota decrement for free tier
      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
        setQuota(getMonthlyExportUsage(quotaContextId));
      }

      // Leadership audit notification
      if (schoolId) {
        await dispatchExportLeadershipNotification({
          schoolId,
          actorName: user?.name || 'Administrator',
          actorRole: user?.role || 'ADMIN',
          resourceTitle: `Class Faculty Roster (${classNameStr})`,
          recordCount: teachers.length,
          format: format.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
        }).catch(() => undefined);
      }

      toast.success(`Class faculty roster exported successfully (${format.toUpperCase()})`);
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error?.message || 'Failed to export faculty roster');
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Assigned Faculty</h2>
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
                {classNameStr} • {teachers.length} Assigned Teachers
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
                  <span className="text-[9px] text-gray-400 mt-0.5">Spreadsheet</span>
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
                  <span className="text-[9px] text-gray-400 mt-0.5">Table Data</span>
                </button>
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

