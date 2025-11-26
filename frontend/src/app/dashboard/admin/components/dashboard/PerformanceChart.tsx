"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { grade: "G6", avg: 80 },
    { grade: "G7", avg: 85 },
    { grade: "G8", avg: 88 },
    { grade: "G9", avg: 90 },
    { grade: "G10", avg: 84 },
];

export default function PerformanceChart() {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-medium">Class Performance Overview</h2>
                <p className="text-sm text-green-500">This Semester +3%</p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data}>
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
