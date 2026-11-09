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
import { exportInquiriesToExcel, exportInquiriesToCSV } from '../utils/inquirySpreadsheetExporter';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

export type InquiryExportFormat = 'pdf' | 'excel' | 'csv';

interface InquiryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiries: any[];
  schoolProfile: any;
  schoolId: string;
}

export function InquiryExportModal({
  isOpen,
  onClose,
  inquiries,
  schoolProfile,
  schoolId,
}: InquiryExportModalProps) {
  const { user } = useAuthStore();
  const isPaying = Boolean(
    schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== 'FREE'
  );

  const quotaContextId = schoolId || 'school_context';
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));
  const isQuotaReached = !isPaying && quota.remaining <= 0;

  const [selectedFormat, setSelectedFormat] = useState<InquiryExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'RESPONDED'>('ALL');

  const handleExport = async () => {
    if (isQuotaReached) {
      toast.error('Monthly export quota reached (10/10). Please upgrade for unlimited exports.');
      return;
    }

    setIsExporting(true);
    try {
      let filtered = inquiries;
      if (statusFilter !== 'ALL') {
        filtered = inquiries.filter((iq) => iq.status?.toUpperCase() === statusFilter);
      }

      if (!filtered.length) {
        toast.info('No inquiries matching the selected filter.');
        setIsExporting(false);
        return;
      }

      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || 'Institutional School';
      const cleanSchool = schoolName.replace(/\s+/g, '_');
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const baseFileName = `${cleanSchool}_Inquiries_Report_${dateStr}`;

      const headers = ['#', 'Sender Name', 'Email', 'Phone', 'Message', 'Status', 'Date Received'];
      const rows = filtered.map((iq: any, idx: number) => [
        idx + 1,
        iq.name || 'Anonymous',
        iq.email || '—',
        iq.phone || '—',
        iq.message || '—',
        iq.status || 'UNREAD',
        format(new Date(iq.createdAt), 'yyyy-MM-dd HH:mm'),
      ]);

      if (selectedFormat === 'excel') {
        const excelData = filtered.map((iq: any, idx: number) => ({
          'S/N': idx + 1,
          'Sender Name': iq.name || 'Anonymous',
          'Email': iq.email || '',
          'Phone': iq.phone || '',
          'Inquiry Message': iq.message || '',
          'Inquiry Status': iq.status || 'UNREAD',
          'Date Received': format(new Date(iq.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        }));
        exportInquiriesToExcel(excelData, baseFileName, 'Website Inquiries');
      } else if (selectedFormat === 'csv') {
        exportInquiriesToCSV(headers, rows, baseFileName);
      } else {
        // PDF Export
        const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);
        await generatePDF({
          title: 'Public Portal Inquiries Report',
          filename: `${baseFileName}.pdf`,
          schoolProfile: {
            ...schoolProfile,
            name: schoolName,
          },
          orientation: 'landscape',
          metaData: [
            { label: 'Filter Scope', value: statusFilter === 'ALL' ? 'All Inquiries' : `${statusFilter} Inquiries` },
            { label: 'Total Inquiries', value: `${filtered.length} records` },
            { label: 'Date Generated', value: new Date().toLocaleDateString() },
          ],
          tableHeaders: [headers],
          tableData: rows.map((r) => r.map((c) => String(c))),
          signatures: isPaying
            ? {
                left: sigs.principalSigUrl ? { label: 'Head of Institution', signatureUrl: sigs.principalSigUrl } : undefined,
                right: { label: 'Public Relations / Administrative Desk' },
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
          resourceTitle: 'Public Portal Inquiries Report',
          recordCount: filtered.length,
          format: selectedFormat.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
        }).catch(() => undefined);
      }

      toast.success(`Inquiries exported successfully (${selectedFormat.toUpperCase()})`);
      onClose();
    } catch (error: any) {
      console.error('Export inquiries error:', error);
      toast.error(error?.message || 'Failed to export inquiries');
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Public Inquiries</h2>
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
                Download visitor inquiries from your school website.
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
                  <span className="text-[9px] text-gray-400 mt-0.5">Table Data</span>
                </button>
              </div>
            </div>

            {/* Inquiries Status Filter */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Filter by Inquiries Status
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['ALL', 'UNREAD', 'READ', 'RESPONDED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      'py-1.5 text-xs font-bold rounded-lg transition-all',
                      statusFilter === st
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={isExporting}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
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

