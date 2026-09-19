"use client";

import {
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    CartesianGrid
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
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#db2777" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#db2777" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            background: "white",
                            borderRadius: "12px",
                            border: "1px solid #f1f5f9",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                        }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                    <Area 
                        type="monotone" 
                        dataKey="present" 
                        stroke="#db2777" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPresent)" 
                        name="Present" 
                    />
                    <Line type="monotone" dataKey="late" stroke="#f472b6" strokeWidth={2} dot={{ r: 4 }} name="Late" />
                    <Line type="monotone" dataKey="absent" stroke="#fbcfe8" strokeWidth={2} dot={{ r: 4 }} name="Absent" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
