import React from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    date: string;
    status: string;
    notes?: string;
}

interface AttendanceListProps {
    records: AttendanceRecord[];
}

export default function AttendanceList({ records }: AttendanceListProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    
    const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
    const currentRecords = sortedRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Log</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total: {sortedRecords.length} records</p>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-center">#</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {currentRecords.length > 0 ? (
                            currentRecords.map((record, index) => {
                                const status = record.status?.toUpperCase();
                                let StatusIcon = CheckCircle2;
                                let statusClasses = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                                
                                if (status === 'ABSENT') {
                                    StatusIcon = XCircle;
                                    statusClasses = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                                } else if (status === 'LATE') {
                                    StatusIcon = Clock;
                                    statusClasses = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
                                }

                                return (
                                    <tr key={record.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 text-center">
                                            <span className="text-xs font-bold text-slate-400">
                                                {(currentPage - 1) * itemsPerPage + index + 1 < 10 ? `0${(currentPage - 1) * itemsPerPage + index + 1}` : (currentPage - 1) * itemsPerPage + index + 1}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {format(new Date(record.date), 'MMMM dd, yyyy')}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        {format(new Date(record.date), 'EEEE')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusClasses}`}>
                                                <StatusIcon size={12} />
                                                {status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 font-medium">
                                            {record.notes || '-'}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                                            <Calendar size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">No records found</p>
                                        <p className="text-xs text-slate-500 mt-1">There is no attendance data to display.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                    <span className="text-xs font-bold text-slate-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedRecords.length)} of {sortedRecords.length}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
