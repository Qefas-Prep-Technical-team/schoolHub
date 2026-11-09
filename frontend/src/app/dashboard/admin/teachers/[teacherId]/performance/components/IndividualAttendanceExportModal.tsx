import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import { resolveDigitalSignatures } from '@/app/dashboard/admin/grades/utils/signatureResolver';
import { dispatchExportLeadershipNotification } from '@/lib/api/services/exportNotificationService';
import { getMonthlyExportUsage, incrementMonthlyExportUsage } from '@/utils/exportQuotaManager';
import { generatePDF } from '@/utils/pdfGenerator';
import { ExportQuotaBanner } from '@/app/dashboard/admin/grades/components/export/ExportQuotaBanner';
import { format } from 'date-fns';

interface IndividualAttendanceExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: any;
    schoolId: string;
    currentMonthStr: string; // "yyyy-MM"
    attendanceData: any[];
    dynamicStats: {
        present: number;
        absent: number;
        late: number;
        percentage: string;
    };
}

export function IndividualAttendanceExportModal({
    isOpen,
    onClose,
    teacher,
    schoolId,
    currentMonthStr,
    attendanceData,
    dynamicStats,
}: IndividualAttendanceExportModalProps) {
    const { user } = useAuthStore();
    const { data: schoolProfile } = useSchoolProfile(schoolId);
    const { data: subUsage } = useSubscriptionUsage();

    const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [isExporting, setIsExporting] = useState(false);

    const isPaying = Boolean(
        (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== 'FREE') ||
        (subUsage?.subscriptionStatus && subUsage.subscriptionStatus.toLowerCase() === 'active' && !subUsage.isTrial)
    );

    const quotaContextId = schoolId || 'school_context';
    const quota = getMonthlyExportUsage(quotaContextId);

    const handleExport = async () => {
        if (!isPaying && quota.remaining <= 0) {
            toast.error('Monthly export quota reached (10/10). Please upgrade to export more.');
            return;
        }

        setIsExporting(true);
        try {
            const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || 'Institutional School';
            const teacherName = teacher?.name || 'Teacher';
            const teacherCode = teacher?.teacherCode || teacher?.code || 'UNASSIGNED';
            const [year, month] = currentMonthStr.split('-');
            const monthName = format(new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1), 'MMMM yyyy');

            const fileName = `${schoolName.replace(/\s+/g, '_')}-${teacherName.replace(/\s+/g, '_')}-Attendance-${monthName.replace(/\s+/g, '_')}`;

            if (selectedFormat === 'pdf') {
                const tableHeaders = [['Date', 'Day', 'Status', 'Time In', 'Time Out', 'Remarks']];
                const tableRows = attendanceData.map((record: any) => {
                    const d = new Date(record.date);
                    return [
                        format(d, 'yyyy-MM-dd'),
                        format(d, 'EEE'),
                        (record.status || 'ABSENT').toUpperCase(),
                        record.timeIn || '—',
                        record.timeOut || '—',
                        record.note || record.remarks || '—',
                    ];
                });

                const sigs = await resolveDigitalSignatures(schoolProfile, isPaying);

                await generatePDF({
                    title: `STAFF ATTENDANCE REPORT — ${monthName.toUpperCase()}`,
                    filename: `${fileName}.pdf`,
                    schoolProfile: {
                        ...schoolProfile,
                        name: schoolName,
                    },
                    metaData: [
                        { label: 'Faculty Member', value: teacherName },
                        { label: 'Faculty ID', value: teacherCode },
                        { label: 'Academic Period', value: monthName },
                        { label: 'Attendance Mastery', value: dynamicStats.percentage },
                        { label: 'Present Days', value: `${dynamicStats.present} days` },
                        { label: 'Absent Days', value: `${dynamicStats.absent} days` },
                    ],
                    tableHeaders,
                    tableData: tableRows,
                    signatures: isPaying
                        ? {
                            left: sigs.principalSigUrl ? { label: 'Head of Institution', signatureUrl: sigs.principalSigUrl } : undefined,
                            right: { label: 'Authorized Administrator' },
                        }
                        : undefined,
                });
            } else if (selectedFormat === 'excel') {
                const { utils, writeFile } = await import('xlsx');
                const wb = utils.book_new();

                const summaryData = [
                    ['INSTITUTIONAL STAFF ATTENDANCE RECORD'],
                    ['Institution:', schoolName],
                    ['Teacher Name:', teacherName],
                    ['Faculty ID:', teacherCode],
                    ['Period:', monthName],
                    ['Attendance Rate:', dynamicStats.percentage],
                    ['Present Days:', dynamicStats.present],
                    ['Absent Days:', dynamicStats.absent],
                    ['Late Days:', dynamicStats.late],
                    [],
                    ['Date', 'Day', 'Status', 'Time In', 'Time Out', 'Remarks']
                ];

                const logData = attendanceData.map((record: any) => {
                    const d = new Date(record.date);
                    return [
                        format(d, 'yyyy-MM-dd'),
                        format(d, 'EEE'),
                        (record.status || 'absent').toUpperCase(),
                        record.timeIn || 'N/A',
                        record.timeOut || 'N/A',
                        record.note || record.remarks || ''
                    ];
                });

                const ws = utils.aoa_to_sheet([...summaryData, ...logData]);
                utils.book_append_sheet(wb, ws, 'Attendance Logs');
                writeFile(wb, `${fileName}.xlsx`);
            } else {
                // CSV export
                const headers = ['Date', 'Day', 'Status', 'Time In', 'Time Out', 'Remarks'];
                const rows = attendanceData.map((record: any) => {
                    const d = new Date(record.date);
                    return [
                        format(d, 'yyyy-MM-dd'),
                        format(d, 'EEE'),
                        record.status || '',
                        record.timeIn || '',
                        record.timeOut || '',
                        (record.note || record.remarks || '').replace(/"/g, '""')
                    ];
                });

                const csvContent = [
                    headers.join(','),
                    ...rows.map((r: string[]) => r.map((c: string) => `"${c}"`).join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${fileName}.csv`;
                link.click();
            }

            // Quota decrement for free tier
            if (!isPaying) {
                incrementMonthlyExportUsage(quotaContextId);
            }

            // Dispatch leadership notification
            if (schoolId) {
                await dispatchExportLeadershipNotification({
                    schoolId,
                    actorName: user?.name || 'Administrator',
                    actorRole: user?.role || 'ADMIN',
                    resourceTitle: `Monthly Attendance Log (${teacherName} - ${monthName})`,
                    recordCount: attendanceData.length,
                    format: selectedFormat.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
                }).catch(() => undefined);
            }

            toast.success(`Attendance report exported successfully (${selectedFormat.toUpperCase()})`);
            onClose();
        } catch (error: any) {
            console.error('Export error:', error);
            toast.error(error.message || 'Failed to export report');
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
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Teacher Attendance</h2>
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
                                {teacher?.name} • {format(new Date(currentMonthStr + '-01'), 'MMMM yyyy')}
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
                                        "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all",
                                        selectedFormat === 'pdf'
                                            ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm"
                                            : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
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
                                        "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all relative",
                                        !isPaying && "opacity-50 cursor-not-allowed",
                                        selectedFormat === 'excel'
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                            : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
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
                                        "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all relative",
                                        !isPaying && "opacity-50 cursor-not-allowed",
                                        selectedFormat === 'csv'
                                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                            : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
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

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Records to export:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{attendanceData.length} records</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Attendance mastery:</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dynamicStats.percentage}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Digital Signatures:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {isPaying ? 'Leadership Endorsed' : 'Standard Dash Line'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl"
                                onClick={onClose}
                                disabled={isExporting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2"
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
