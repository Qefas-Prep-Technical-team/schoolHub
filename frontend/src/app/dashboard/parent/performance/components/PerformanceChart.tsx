'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { Download, Filter } from 'lucide-react';

interface PerformanceData {
    term: string;
    score: number;
}

export default function PerformanceChart() {
    const [selectedSubject, setSelectedSubject] = useState('All Subjects');

    const data: PerformanceData[] = [
        { term: 'Term 1', score: 85 },
        { term: 'Term 2', score: 88 },
        { term: 'Term 3', score: 92 },
        { term: 'Term 4', score: 90 },
    ];

    const subjects = ['All Subjects', 'Mathematics', 'Science', 'English'];

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-white">
                        Academic Performance Trend
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        Comparison over the last 3 terms
                    </p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-background-light dark:bg-gray-800 border-none rounded-lg text-sm font-medium text-text-main dark:text-white focus:ring-primary py-2 px-4 cursor-pointer"
                    >
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>

                    <button className="flex items-center gap-2 bg-background-light dark:bg-gray-800 text-text-main dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="term"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                            domain={[70, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                            formatter={(value) => [`${value}%`, 'Score']}
                            labelFormatter={(label) => `Term: ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#3670e2"
                            fill="url(#colorScore)"
                            strokeWidth={3}
                            fillOpacity={0.2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}