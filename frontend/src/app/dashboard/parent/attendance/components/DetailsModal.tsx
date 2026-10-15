'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StatusBadge from './StatusBadge';

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendances: any[];
}

export default function DetailsModal({ isOpen, onClose, attendances }: DetailsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 rounded-[1.75rem] overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Attendance Breakdown
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                        Detailed log of all verified session attendance records
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
                                
                                return (
                                    <div 
                                        key={record.id || index} 
                                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            {record.remarks && (
                                                <p className="text-xs text-slate-500 mt-0.5">{record.remarks}</p>
                                            )}
                                        </div>
                                        <StatusBadge 
                                            variant={badgeVariant} 
                                            text={status.charAt(0).toUpperCase() + status.slice(1)} 
                                            size="sm" 
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
