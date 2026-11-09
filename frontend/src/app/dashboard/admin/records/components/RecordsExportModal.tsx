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
import { exportRecordsToExcel, exportRecordsToCSV } from '../utils/recordsSpreadsheetExporter';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

export type RecordsExportFormat = 'pdf' | 'excel' | 'csv';

interface RecordsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'subject' | 'student';
  dataToExport: any[];
  classes: any[];
  sessions: any[];
  schoolProfile: any;
  schoolId: string;
  actorRole?: 'ADMIN' | 'TEACHER';
}

export function RecordsExportModal({
  isOpen,
  onClose,
  activeTab,
  dataToExport,
  classes,
  sessions,
  schoolProfile,
  schoolId,
  actorRole,
}: RecordsExportModalProps) {
  const { user } = useAuthStore();
  const effectiveRole = actorRole || (user?.userType === 'TEACHER' ? 'TEACHER' : user?.role || 'ADMIN');
  const isPaying = Boolean(
    schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== 'FREE'
  );

  const quotaContextId = schoolId || 'school_context';
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));
  const isQuotaReached = !isPaying && quota.remaining <= 0;

  const [selectedFormat, setSelectedFormat] = useState<RecordsExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterTerm, setFilterTerm] = useState('');

  const handleExport = async () => {
    if (isQuotaReached) {
      toast.error('Monthly export quota reached (10/10). Please upgrade for unlimited exports.');
      return;
    }

    setIsExporting(true);
    try {
      let filtered = dataToExport;
      if (filterClass) {
        filtered = filtered.filter((r) => r.classId === filterClass || r.class?.id === filterClass);
      }
      if (filterSession) {
        filtered = filtered.filter((r) => r.sessionId === filterSession || r.session?.id === filterSession);
      }
      if (filterTerm) {
        filtered = filtered.filter((r) => r.term === filterTerm);
      }

      if (!filtered.length) {
        toast.info('No records matching the selected filter criteria.');
        setIsExporting(false);
        return;
      }

      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || 'Institutional School';
      const cleanSchool = schoolName.replace(/\s+/g, '_');
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const tabName = activeTab === 'subject' ? 'Subject_Marksheets' : 'Student_Termly_Results';
      const baseFileName = `${cleanSchool}_${tabName}_${dateStr}`;

      let headers: string[] = [];
      let rows: any[][] = [];

      if (activeTab === 'subject') {
        headers = ['#', 'Marksheet Name', 'Session', 'Term', 'Class', 'Subject', 'Status', 'Date Saved'];
        rows = filtered.map((res: any, index: number) => [
          index + 1,
          res.name || 'N/A',
          res.session?.name || 'N/A',
          res.term || 'N/A',
          res.class?.name || 'N/A',
          res.subject?.name || 'N/A',
          res.status || 'DRAFT',
          format(new Date(res.createdAt), 'yyyy-MM-dd'),
        ]);
      } else {
        headers = ['#', 'Student Name', 'Class', 'Session', 'Term', 'Average', 'Position', 'Status'];
        rows = filtered.map((res: any, index: number) => [
          index + 1,
          res.student?.name || 'N/A',
          res.class?.name || 'N/A',
          res.session?.name || 'N/A',
          res.term || 'N/A',
          res.averageScore ? `${res.averageScore}%` : 'N/A',
          res.position ? res.position.toString() : 'N/A',
          res.status || 'DRAFT',
        ]);
      }

      if (selectedFormat === 'excel') {
        let excelData: any[] = [];
        if (activeTab === 'subject') {
          excelData = filtered.map((res: any, index: number) => ({
            'S/N': index + 1,
            'Marksheet Name': res.name || 'N/A',
            'Academic Session': res.session?.name || 'N/A',
            'Term': res.term || 'N/A',
            'Class Room': res.class?.name || 'N/A',
            'Subject': res.subject?.name || 'N/A',
            'Status': res.status || 'DRAFT',
            'Date Created': format(new Date(res.createdAt), 'yyyy-MM-dd'),
          }));
        } else {
          excelData = filtered.map((res: any, index: number) => ({
            'S/N': index + 1,
            'Student Name': res.student?.name || 'N/A',
            'Class Room': res.class?.name || 'N/A',
            'Academic Session': res.session?.name || 'N/A',
            'Term': res.term || 'N/A',
            'Average Score': res.averageScore ? `${res.averageScore}%` : 'N/A',
            'Rank Position': res.position ? res.position.toString() : 'N/A',
            'Status': res.status || 'DRAFT',
          }));
        }
        exportRecordsToExcel(excelData, baseFileName, 'Academic Records');
      } else if (selectedFormat === 'csv') {
        exportRecordsToCSV(headers, rows, baseFileName);
      } else {
        // PDF Export
        const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);
        await generatePDF({
          title: `Official Records Report: ${activeTab === 'subject' ? 'Subject Marksheets' : 'Termly Summaries'}`,
          filename: `${baseFileName}.pdf`,
          schoolProfile: {
            ...schoolProfile,
            name: schoolName,
          },
          orientation: 'landscape',
          metaData: [
            { label: 'Record View', value: activeTab === 'subject' ? 'Subject Marksheets' : 'Termly Results' },
            { label: 'Total Records', value: `${filtered.length} entries` },
            { label: 'Date Generated', value: new Date().toLocaleDateString() },
          ],
          tableHeaders: [headers],
          tableData: rows.map((r) => r.map((c) => String(c))),
          signatures: isPaying
            ? {
              left: sigs.principalSigUrl ? { label: 'Head of Institution', signatureUrl: sigs.principalSigUrl } : undefined,
              right: { label: 'Authorized Academic Officer' },
            }
            : undefined,
        });
      }

      // Quota decrement for free users
      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
        setQuota(getMonthlyExportUsage(quotaContextId));
      }

      // Audit notification to leadership
      if (schoolId) {
        await dispatchExportLeadershipNotification({
          schoolId,
          actorName: user?.name || (effectiveRole === 'TEACHER' ? 'Assigned Teacher' : 'Administrator'),
          actorRole: effectiveRole === 'TEACHER' ? 'TEACHER' : 'ADMIN',
          resourceTitle: `Academic Records (${tabName.replace(/_/g, ' ')})`,
          recordCount: filtered.length,
          format: selectedFormat.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
        }).catch(() => undefined);
      }

      toast.success(`Academic records exported successfully (${selectedFormat.toUpperCase()})`);
      onClose();
    } catch (error: any) {
      console.error('Export records error:', error);
      toast.error(error?.message || 'Failed to export records');
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Academic Records</h2>
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
                {activeTab === 'subject' ? 'Subject Marksheets Registry' : 'Student Termly Performance Summaries'}
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
              userRole={effectiveRole === 'TEACHER' ? 'TEACHER' : 'ADMIN'}
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
                  onClick={() => setSelectedFormat('pdf')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all',
                    selectedFormat === 'pdf'
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
                  onClick={() => isPaying && setSelectedFormat('excel')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all relative',
                    !isPaying && 'opacity-50 cursor-not-allowed',
                    selectedFormat === 'excel'
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
                  onClick={() => isPaying && setSelectedFormat('csv')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all relative',
                    !isPaying && 'opacity-50 cursor-not-allowed',
                    selectedFormat === 'csv'
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

            {/* Scope / Filter Options */}
            <div className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Target Record Filters
              </label>

              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">Class</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5B5CE6]"
                >
                  <option value="">All Classes</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">Session</label>
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5B5CE6]"
                >
                  <option value="">All Sessions</option>
                  {sessions.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">Term</label>
                <select
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5B5CE6]"
                >
                  <option value="">All Terms</option>
                  <option value="FIRST">First Term</option>
                  <option value="SECOND">Second Term</option>
                  <option value="THIRD">Third Term</option>
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
                className="flex-1 rounded-xl bg-[#5B5CE6] hover:bg-[#4a4be5] text-white font-semibold flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Export ({selectedFormat.toUpperCase()})</span>
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

