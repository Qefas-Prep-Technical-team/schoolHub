'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
    { day: 'Mon', students: 96, teachers: 92 },
    { day: 'Tue', students: 98, teachers: 94 },
    { day: 'Wed', students: 94, teachers: 90 },
    { day: 'Thu', students: 97, teachers: 93 },
    { day: 'Fri', students: 95, teachers: 88 },
    { day: 'Sat', students: 65, teachers: 60 },
    { day: 'Today', students: 94, teachers: 88 },
];

export default function AttendanceChart() {
    const [activeLine, setActiveLine] = useState<'students' | 'teachers' | 'both'>('both');

    return (
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight">
                        Attendance Trends
                    </h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
                        Comparing Student vs Teacher presence over last 7 days
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveLine(activeLine === 'students' ? 'both' : 'students')}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${activeLine === 'students' || activeLine === 'both'
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark'
                            }`}
                    >
                        <div className="size-2 rounded-full bg-primary" />
                        <span className="text-xs font-medium">Students</span>
                    </button>

                    <button
                        onClick={() => setActiveLine(activeLine === 'teachers' ? 'both' : 'teachers')}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${activeLine === 'teachers' || activeLine === 'both'
                                ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark'
                            }`}
                    >
                        <div className="size-2 rounded-full bg-orange-400" />
                        <span className="text-xs font-medium">Teachers</span>
                    </button>
                </div>
            </div>

            <div className="relative w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" vertical={false} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            domain={[60, 100]}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            formatter={(value) => [`${value}%`, 'Attendance']}
                            labelFormatter={(label) => `Day: ${label}`}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Legend />

                        {/* Students Line */}
                        {(activeLine === 'students' || activeLine === 'both') && (
                            <Line
                                type="monotone"
                                dataKey="students"
                                stroke="#3670e2"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                                activeDot={{ r: 6 }}
                                name="Students"
                            />
                        )}

                        {/* Teachers Line */}
                        {(activeLine === 'teachers' || activeLine === 'both') && (
                            <Line
                                type="monotone"
                                dataKey="teachers"
                                stroke="#fb923c"
                                strokeWidth={3}
                                strokeDasharray="6 4"
                                dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                                activeDot={{ r: 6 }}
                                name="Teachers"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="flex justify-between mt-4 px-2">
                {data.map((item, index) => (
                    <span
                        key={index}
                        className={`text-xs ${item.day === 'Today'
                                ? 'font-bold text-text-primary-light dark:text-text-primary-dark'
                                : 'text-text-secondary-light dark:text-text-secondary-dark'
                            }`}
                    >
                        {item.day}
                    </span>
                ))}
            </div>

            {/* Insight */}
            <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Student attendance improved by 2.1% this week
                        </p>
                    </div>
                    <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        View Detailed Report
                    </button>
                </div>
            </div>
        </div>
    );
}