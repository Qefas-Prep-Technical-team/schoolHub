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
            <div className="h-64 sm:h-80 w-full flex items-center justify-center">
                <p className="text-zinc-400 font-medium text-xs sm:text-sm">No attendance records available for this period.</p>
            </div>
        );
    }

    return (
        <div className="h-64 sm:h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717a" strokeOpacity={0.15} />
                    <XAxis 
                        dataKey="label" 
                        stroke="#a1a1aa" 
                        axisLine={false} 
                        tickLine={false} 
                        dy={8} 
                        fontSize={11} 
                    />
                    <YAxis 
                        stroke="#a1a1aa" 
                        axisLine={false} 
                        tickLine={false} 
                        fontSize={11} 
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgb(9 9 11 / 0.95)",
                            borderColor: "rgb(39 39 42 / 0.8)",
                            borderRadius: "0.875rem",
                            color: "#ffffff",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                            fontSize: "12px",
                            padding: "8px 12px"
                        }}
                        itemStyle={{ color: "#ffffff" }}
                    />
                    <Legend 
                        iconType="circle" 
                        wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} 
                    />

                    <Area 
                        type="monotone" 
                        dataKey="present" 
                        stroke="#ec4899" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorPresent)" 
                        name="Present" 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="late" 
                        stroke="#f59e0b" 
                        strokeWidth={2} 
                        dot={{ r: 3.5, fill: "#f59e0b" }} 
                        name="Late" 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="absent" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        dot={{ r: 3.5, fill: "#ef4444" }} 
                        name="Absent" 
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

