// src/components/Dashboard/Leaderboard.tsx
import React from 'react';
import { LeaderboardEntry } from './types';
import Button from './ui/Button';

const leaderboardData: LeaderboardEntry[] = [
    { position: 1, name: 'Sarah Williams', score: '97.1%', performance: 'Excellent', remarks: 'Outstanding performance' },
    { position: 2, name: 'Michael Brown', score: '95.4%', performance: 'Excellent', remarks: 'Very strong results' },
    { position: 7, name: 'Alex Johnson (You)', score: '88.2%', performance: 'Very Good', remarks: 'Great effort', isCurrentUser: true },
    { position: 8, name: 'Emily Clark', score: '87.9%', performance: 'Very Good', remarks: 'Consistent work' },
    { position: 42, name: 'Kevin Miller', score: '52.4%', performance: 'Needs Improvement', remarks: 'Needs more focus' },
];

const getPerformanceBadge = (performance: string) => {
    const badgeClasses: Record<string, string> = {
        'Excellent': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
        'Very Good': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
        'Needs Improvement': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
    };

    return badgeClasses[performance] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
};

const Leaderboard: React.FC = () => {
    return (
        <div className="bg-white dark:bg-[#1C2431] rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#0e121b] dark:text-white">
                    Class Leaderboard
                </h2>
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary" icon="download">
                        Download Class Position Report
                    </Button>
                    <Button variant="secondary">
                        View Subject Score Details
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                        <tr className="text-sm font-semibold text-[#506795] dark:text-gray-400">
                            <th className="p-3">Position</th>
                            <th className="p-3">Student Name</th>
                            <th className="p-3 text-right">Avg Score</th>
                            <th className="p-3 text-center">Performance</th>
                            <th className="p-3">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {leaderboardData.map((entry, index) => (
                            <tr
                                key={index}
                                className={`text-sm ${entry.isCurrentUser
                                        ? 'text-primary dark:text-primary-300 bg-primary/10 dark:bg-primary/20 rounded-lg'
                                        : 'text-[#0e121b] dark:text-gray-300'
                                    }`}
                            >
                                <td className="p-3 font-bold">{entry.position}</td>
                                <td className={`p-3 ${entry.isCurrentUser ? 'font-semibold' : ''}`}>
                                    {entry.name}
                                </td>
                                <td className={`p-3 text-right ${entry.isCurrentUser ? 'font-semibold' : ''}`}>
                                    {entry.score}
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceBadge(entry.performance)}`}>
                                        {entry.performance}
                                    </span>
                                </td>
                                <td className="p-3">{entry.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;