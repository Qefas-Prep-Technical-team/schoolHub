// src/components/Dashboard/AttendanceChart.tsx
import React from 'react';

const AttendanceChart: React.FC = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

    return (
        <div className="mb-6">
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 shadow-sm">
                <p className="text-slate-800 dark:text-slate-200 text-lg font-medium leading-normal">
                    Attendance Consistency Over Time
                </p>
                <div className="flex items-baseline gap-2">
                    <p className="text-slate-900 dark:text-white tracking-tight text-4xl font-bold leading-tight truncate">
                        Avg. 91%
                    </p>
                    <div className="flex gap-1 items-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                            Last 3 Months
                        </p>
                        <p className="text-green-500 text-sm font-medium leading-normal flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-base">arrow_upward</span>
                            +2%
                        </p>
                    </div>
                </div>
                <div className="flex min-h-[220px] flex-1 flex-col gap-8 py-4">
                    {/* SVG Chart */}
                    <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="-3 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient gradientUnits="userSpaceOnUse" id="chart-gradient" x1="236" x2="236" y1="1" y2="149">
                                <stop stopColor="#3670e2" stopOpacity="0.2"></stop>
                                <stop offset="1" stopColor="#3670e2" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z" fill="url(#chart-gradient)"></path>
                        <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#3670e2" strokeLinecap="round" strokeWidth="3"></path>
                    </svg>

                    {/* Month Labels */}
                    <div className="flex justify-around">
                        {months.map((month) => (
                            <p key={month} className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-normal">
                                {month}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceChart;