'use client';

import { X } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendances: any[];
}

export default function DetailsModal({ isOpen, onClose, attendances }: DetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Breakdown</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {attendances.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            No attendance records found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {attendances.map((record, index) => {
                                const status = record.status.toLowerCase();
                                const badgeVariant = status === 'present' ? 'success' : status === 'late' ? 'warning' : 'default';
                                
                                return (
                                    <div key={record.id || index} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            {record.remarks && (
                                                <p className="text-sm text-slate-500 mt-1">{record.remarks}</p>
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

            </div>
        </div>
    );
}
