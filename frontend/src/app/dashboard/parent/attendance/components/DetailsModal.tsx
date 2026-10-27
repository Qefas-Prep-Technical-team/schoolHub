'use client';

import { ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StatusBadge from './StatusBadge';
import { getCleanAttendance, type RawStudentAttendance } from '@/lib/attendance/attendanceRecord';

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendances: RawStudentAttendance[];
    onRecordClick?: (record: RawStudentAttendance) => void;
}

const chipStatusColor = (status: string) => {
    if (status === 'present') return 'text-emerald-600 dark:text-emerald-400';
    if (status === 'late') return 'text-amber-600 dark:text-amber-400';
    if (status === 'absent') return 'text-rose-600 dark:text-rose-400';
    return 'text-sky-600 dark:text-sky-400';
};

export default function DetailsModal({ isOpen, onClose, attendances, onRecordClick }: DetailsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 rounded-[1.75rem] overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Attendance Breakdown
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Detailed log of all verified session attendance records. Click a day to see its subject breakdown.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {attendances.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm font-semibold">
                            No attendance records found for this period.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {attendances.map((record, index) => {
                                const status = String(record.status || '').toLowerCase();
                                const badgeVariant = status === 'present' ? 'success' : status === 'late' ? 'warning' : 'default';
                                const { comment, chips } = getCleanAttendance(record);

                                return (
                                    <button
                                        type="button"
                                        key={record.id || index}
                                        onClick={() => onRecordClick?.(record)}
                                        disabled={!onRecordClick}
                                        className="group w-full text-left flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 transition-colors enabled:cursor-pointer enabled:hover:bg-orange-50/60 enabled:hover:border-orange-200 dark:enabled:hover:bg-slate-800 dark:enabled:hover:border-slate-700"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            {comment && (
                                                <p className="text-xs italic text-slate-500 dark:text-slate-400">&ldquo;{comment}&rdquo;</p>
                                            )}
                                            {chips.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {chips.map((sub) => (
                                                        <span
                                                            key={sub.subjectId}
                                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                        >
                                                            <span className="truncate max-w-[120px]">{sub.subjectName}</span>
                                                            <span className={`uppercase text-[9px] font-black ${chipStatusColor(sub.status)}`}>
                                                                {sub.status}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <StatusBadge 
                                                variant={badgeVariant} 
                                                text={status.charAt(0).toUpperCase() + status.slice(1)} 
                                                size="sm" 
                                            />
                                            {onRecordClick && (
                                                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
