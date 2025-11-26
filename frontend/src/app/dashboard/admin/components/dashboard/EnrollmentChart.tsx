"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "Mon", students: 200 },
    { name: "Tue", students: 300 },
    { name: "Wed", students: 250 },
    { name: "Thu", students: 400 },
    { name: "Fri", students: 350 },
    { name: "Sat", students: 500 },
    { name: "Sun", students: 450 },
];

export default function EnrollmentChart() {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-medium">Weekly Enrollment Trends</h2>
                <p className="text-sm text-green-500">Last 7 Days +12%</p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
