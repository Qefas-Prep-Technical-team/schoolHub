// src/app/page.tsx
import React from 'react';
import PageHeader from '../components/PageHeader';
import FilterChips from '../components/FilterChips';
import StatsCard from '../components/StatsCard';
import AttendanceChart from '../components/AttendanceChart';
import SubjectCard from '../components/SubjectCard';

export default function Home() {
    const stats: Array<React.ComponentProps<typeof StatsCard>> = [
        {
            title: 'Overall Attendance',
            value: '91%',
            trend: {
                direction: 'up',
                value: '1.5%',
                color: 'text-green-500'
            }
        },
        {
            title: 'Total Classes Missed',
            value: 12,
            trend: {
                direction: 'down',
                value: '2 from last month',
                color: 'text-red-500'
            }
        }
    ];

    const subjects: Array<React.ComponentProps<typeof SubjectCard>> = [
        {
            id: '1',
            name: 'Mathematics',
            percentage: 92,
            trend: 'up',
            trendValue: '+2%',
            color: '#3670e2',
            classesHeld: 50,
            classesAttended: 46
        },
        {
            id: '2',
            name: 'Physics',
            percentage: 85,
            trend: 'down',
            trendValue: '-5%',
            color: '#ef4444', // red-500
            classesHeld: 40,
            classesAttended: 34
        },
        {
            id: '3',
            name: 'Chemistry',
            percentage: 96,
            trend: 'up',
            trendValue: '+1%',
            color: '#3670e2',
            classesHeld: 40,
            classesAttended: 38
        }
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <div className="flex h-full w-full">
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <PageHeader />
                        <FilterChips />

                        {/* Stats Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {stats.map((stat, index) => (
                                <StatsCard key={index} {...stat} />
                            ))}
                        </div>

                        {/* Chart Section */}
                        <AttendanceChart />

                        {/* Subject Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.map((subject) => (
                                <SubjectCard key={subject.id} {...subject} />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}