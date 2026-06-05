"use client";

import React, { useState } from "react";
import { format, isSameMonth, subMonths } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SegmentedControl = ({ records = [] }: { records?: any[] }) => {
    const [selectedView, setSelectedView] = useState<string | null>(null);

    const getFilteredRecords = () => {
        if (!selectedView) return [];
        return records.filter(record => {
            const date = new Date(record.date);
            const now = new Date();
            if (selectedView === "This Month") return isSameMonth(date, now);
            if (selectedView === "Last Month") return isSameMonth(date, subMonths(now, 1));
            if (selectedView === "This Term") return true; // Term filtering could be added here if term boundaries are known
            return false;
        });
    };

    const filteredRecords = getFilteredRecords();

    return (
        <>
            <div className="w-full flex justify-center">
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                    {["This Month", "Last Month", "This Term"].map((label) => (
                        <button
                            key={label}
                            onClick={() => setSelectedView(label)}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer text-foreground hover:bg-muted"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <Dialog open={!!selectedView} onOpenChange={(open) => !open && setSelectedView(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedView} Attendance</DialogTitle>
                    </DialogHeader>
                    
                    {filteredRecords.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No attendance records found for {selectedView?.toLowerCase()}.</div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mt-4">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Class</th>
                                        <th className="px-6 py-3">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record, i) => (
                                        <tr key={i} className={`border-b dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                                {format(new Date(record.date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    record.status?.toUpperCase() === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    record.status?.toUpperCase() === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{record.class?.name || 'General'}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{record.note || '-'}</td>
                                        </tr>
                                    ))}
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
