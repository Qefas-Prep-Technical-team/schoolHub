"use client";

import React, { useState } from "react";
import { format, isSameMonth, subMonths } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

interface AttendanceRecordItem {
    date: string;
    status: string;
    note?: string;
    class?: {
        name?: string;
    };
}

const SegmentedControl = ({ records = [] }: { records?: AttendanceRecordItem[] }) => {
    const [selectedView, setSelectedView] = useState<string | null>(null);

    const getFilteredRecords = () => {
        if (!selectedView) return [];
        return records.filter(record => {
            const date = new Date(record.date);
            const now = new Date();
            if (selectedView === "This Month") return isSameMonth(date, now);
            if (selectedView === "Last Month") return isSameMonth(date, subMonths(now, 1));
            if (selectedView === "This Term") return true;
            return false;
        });
    };

    const filteredRecords = getFilteredRecords();

    return (
        <>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 self-start sm:self-auto">
                {["This Month", "Last Month", "This Term"].map((label) => (
                    <button
                        key={label}
                        onClick={() => setSelectedView(label)}
                        className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800"
                    >
                        {label}
                    </button>
                ))}
            </div>

            <Dialog open={!!selectedView} onOpenChange={(open) => !open && setSelectedView(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Calendar size={18} className="text-pink-600 dark:text-pink-400" />
                            <span>{selectedView} Attendance Registry</span>
                        </DialogTitle>
                    </DialogHeader>
                    
                    {filteredRecords.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500 text-xs sm:text-sm">
                            No attendance records found for {selectedView?.toLowerCase()}.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800 mt-4">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3">Cohort</th>
                                        <th className="px-4 py-3">Remark / Note</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium">
                                    {filteredRecords.map((record, i) => {
                                        const status = record.status?.toUpperCase();
                                        return (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                                <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                                    {format(new Date(record.date), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' :
                                                        status === 'ABSENT' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40' :
                                                        'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{record.class?.name || 'Main Class'}</td>
                                                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{record.note || '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SegmentedControl;

