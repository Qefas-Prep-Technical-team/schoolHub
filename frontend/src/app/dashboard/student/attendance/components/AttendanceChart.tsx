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

interface AttendanceChartProps {
    data: { label: string; present: number; late: number; absent: number }[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-80 w-full flex items-center justify-center">
                <p className="text-slate-500 font-medium">No attendance data available.</p>
            </div>
        );
    }

    return (
        <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barGap={8}>
                    <XAxis dataKey="label" stroke="#888" />
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
    );
}
