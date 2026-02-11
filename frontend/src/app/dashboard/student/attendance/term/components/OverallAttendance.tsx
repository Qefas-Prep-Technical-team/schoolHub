// src/components/Dashboard/OverallAttendance.tsx
import React from 'react';

const OverallAttendance: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 h-full">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Overall Attendance
            </p>
            <div className="flex flex-col items-center">
                <p className="text-8xl font-black text-primary">A</p>
                <p className="text-base font-normal text-slate-500 dark:text-slate-400">
                    Based on 98% attendance rate.
                </p>
            </div>
        </div>
    );
};

export default OverallAttendance;