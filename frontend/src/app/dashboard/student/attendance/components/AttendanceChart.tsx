"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const data = [
    { week: "W1", present: 85, late: 5, absent: 0 },
    { week: "W2", present: 100, late: 0, absent: 0 },
    { week: "W3", present: 70, late: 0, absent: 20 },
    { week: "W4", present: 95, late: 0, absent: 0 },
    { week: "W5", present: 90, late: 10, absent: 0 },
    { week: "W6", present: 100, late: 0, absent: 0 },
    { week: "W7", present: 100, late: 0, absent: 0 },
    { week: "W8", present: 80, late: 0, absent: 20 },
];

export default function AttendanceChart() {
    return (
        <div className="rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">
                Attendance Overview
            </h3>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={8}>
                        <XAxis dataKey="week" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{
                                background: "var(--color-card-light)",
                                borderRadius: "8px",
                                border: "1px solid var(--color-border-light)",
                            }}
                        />
                        <Legend />

                        {/* stacked bars */}
                        <Bar dataKey="present" stackId="attendance" fill="#22c55e" />
                        <Bar dataKey="late" stackId="attendance" fill="#eab308" />
                        <Bar dataKey="absent" stackId="attendance" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
