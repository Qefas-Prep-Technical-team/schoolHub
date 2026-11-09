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
import { exportRecordsToExcel, exportRecordsToCSV } from '../../utils/recordsSpreadsheetExporter';
import { getGradeEvaluation } from '@/utils/gradingSystem';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

export type EntrySheetExportFormat = 'pdf' | 'excel' | 'csv';

interface ResultEntryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  filteredStudents: any[];
  schoolProfile: any;
  schoolId: string;
}

export function ResultEntryExportModal({
  isOpen,
  onClose,
  config,
  filteredStudents,
  schoolProfile,
  schoolId,
}: ResultEntryExportModalProps) {
  const { user } = useAuthStore();
  const isPaying = Boolean(
    schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== 'FREE'
  );

  const quotaContextId = schoolId || 'school_context';
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));
  const isQuotaReached = !isPaying && quota.remaining <= 0;

  const [selectedFormat, setSelectedFormat] = useState<EntrySheetExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isQuotaReached) {
      toast.error('Monthly export quota reached (10/10). Please upgrade for unlimited exports.');
      return;
    }

    setIsExporting(true);
    try {
      if (!filteredStudents.length) {
        toast.info('No student scores to export in this marksheet.');
        setIsExporting(false);
        return;
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || 'Institutional School';
      const cleanSchool = schoolName.replace(/\s+/g, '_');
      const subjectName = config?.subject?.name || 'Subject';
      const className = config?.class?.name || 'Class';
      const baseFileName = `${cleanSchool}_Marksheet_${subjectName.replace(/\s+/g, '_')}_${className.replace(/\s+/g, '_')}_${dateStr}`;

      const getOrdinalSuffix = (i: number) => {
        const j = i % 10,
          k = i % 100;
        if (j === 1 && k !== 11) return i + 'st';
        if (j === 2 && k !== 12) return i + 'nd';
        if (j === 3 && k !== 13) return i + 'rd';
        return i + 'th';
      };

      // Standard Competition Ranking calculation
      const scoresWithIds = filteredStudents.map((s) => {
        const total =
          (parseFloat(s.assignment) || 0) +
          (parseFloat(s.quiz) || 0) +
          (parseFloat(s.ca) || 0) +
          (parseFloat(s.exam) || 0);
        return { id: s.id, total };
      });
      scoresWithIds.sort((a, b) => b.total - a.total);

      const positionMap = new Map<string, string>();
      let currentRank = 1;
      for (let i = 0; i < scoresWithIds.length; i++) {
        if (i > 0 && scoresWithIds[i].total < scoresWithIds[i - 1].total) {
          currentRank = i + 1;
        }
        positionMap.set(scoresWithIds[i].id, getOrdinalSuffix(currentRank));
      }

      const headers = [
        '#',
        'Student Name',
        'Admission ID',
        `Assignment (${config?.assignmentMax ?? 10})`,
        `Quiz (${config?.quizMax ?? 10})`,
        `CA (${config?.caMax ?? 20})`,
        `Exam (${config?.examMax ?? 60})`,
        'Total (100)',
        'Grade',
        'Rank Position',
      ];

      const rows = filteredStudents.map((st: any, idx: number) => {
        const total =
          (parseFloat(st.assignment) || 0) +
          (parseFloat(st.quiz) || 0) +
          (parseFloat(st.ca) || 0) +
          (parseFloat(st.exam) || 0);
        const evalGrade = getGradeEvaluation(total, schoolProfile?.gradingSystem).grade;
        return [
          idx + 1,
          st.name || '—',
          st.studentCode || 'N/A',
          st.assignment !== '' ? st.assignment : '—',
          st.quiz !== '' ? st.quiz : '—',
          st.ca !== '' ? st.ca : '—',
          st.exam !== '' ? st.exam : '—',
          total.toFixed(1),
          evalGrade,
          positionMap.get(st.id) || '—',
        ];
      });

      if (selectedFormat === 'excel') {
        const excelData = filteredStudents.map((st: any, idx: number) => {
          const total =
            (parseFloat(st.assignment) || 0) +
            (parseFloat(st.quiz) || 0) +
            (parseFloat(st.ca) || 0) +
            (parseFloat(st.exam) || 0);
          const evalGrade = getGradeEvaluation(total, schoolProfile?.gradingSystem).grade;
          return {
            'S/N': idx + 1,
            'Student Name': st.name || '',
            'Admission ID': st.studentCode || 'N/A',
            'Assignment': st.assignment,
            'Quiz': st.quiz,
            'Continuous Assessment': st.ca,
            'Examination': st.exam,
            'Total Score': total.toFixed(1),
            'Grade': evalGrade,
            'Rank Position': positionMap.get(st.id) || '—',
          };
        });
        exportRecordsToExcel(excelData, baseFileName, 'Marksheet');
      } else if (selectedFormat === 'csv') {
        exportRecordsToCSV(headers, rows, baseFileName);
      } else {
        // PDF Export
        const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);
        await generatePDF({
          title: `Official Marksheet: ${config?.name || subjectName}`,
          filename: `${baseFileName}.pdf`,
          schoolProfile: {
            ...schoolProfile,
            name: schoolName,
          },
          orientation: 'landscape',
          metaData: [
            { label: 'Subject', value: subjectName },
            { label: 'Class', value: className },
            { label: 'Academic Session', value: config?.session?.name || 'N/A' },
            { label: 'Term', value: config?.term || 'N/A' },
            { label: 'Total Candidates', value: `${filteredStudents.length} Students` },
          ],
          tableHeaders: [headers],
          tableData: rows.map((r) => r.map((c) => String(c))),
          signatures: isPaying
            ? {
              left: sigs.principalSigUrl ? { label: 'Head of Institution', signatureUrl: sigs.principalSigUrl } : undefined,
              right: { label: 'Subject Teacher / Examiner' },
            }
            : undefined,
        });
      }

      // Decrement monthly export quota on free tier
      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
        setQuota(getMonthlyExportUsage(quotaContextId));
      }

      // Dispatch audit notification to school leadership
      if (schoolId) {
        await dispatchExportLeadershipNotification({
          schoolId,
          actorName: user?.name || 'Administrator',
          actorRole: user?.role || 'ADMIN',
          resourceTitle: `Subject Marksheet (${subjectName} - ${className})`,
          recordCount: filteredStudents.length,
          format: selectedFormat.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
        }).catch(() => undefined);
      }

      toast.success(`Marksheet exported successfully (${selectedFormat.toUpperCase()})`);
      onClose();
    } catch (error: any) {
      console.error('Export marksheet error:', error);
      toast.error(error?.message || 'Failed to export marksheet');
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Official Marksheet</h2>
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
                {config?.subject?.name || 'Subject'} • {config?.class?.name || 'Class'} ({filteredStudents.length} Students)
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
                  <span className="text-[9px] text-gray-400 mt-0.5">Roster Data</span>
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
