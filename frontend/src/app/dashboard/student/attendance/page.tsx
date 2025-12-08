// src/app/page.tsx
import React from 'react';
import PageHeader from './components/PageHeader';
import InfoBanner from './components/InfoBanner';
import StatCard from './components/StatCard';
import AttendanceChart from './components/AttendanceChart';

export default function Home() {
    const stats: Array<React.ComponentProps<typeof StatCard>> = [
        {
            title: 'Present',
            value: '95%',
            icon: 'check_circle',
            iconColor: 'text-green-500',
            trend: {
                value: '1.2%',
                color: 'text-green-600 dark:text-green-400',
                isPositive: true,
            },
        },
        {
            title: 'Absent',
            value: '2%',
            icon: 'cancel',
            iconColor: 'text-red-500',
            trend: {
                value: '0.5%',
                color: 'text-red-600 dark:text-red-400',
                isPositive: false,
            },
        },
        {
            title: 'Late',
            value: '3%',
            icon: 'schedule',
            iconColor: 'text-yellow-500',
            trend: {
                value: '0.3%',
                color: 'text-green-600 dark:text-green-400',
                isPositive: true,
            },
        },
        {
            title: 'Total Days',
            value: '88',
            icon: 'event_available',
            iconColor: 'text-text-light-secondary dark:text-dark-secondary',
            description: 'in this term',
        },
    ];

    return (
        <div className="relative flex min-h-screen w-full">
            <main className="flex-1 p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <PageHeader />
                    <InfoBanner />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Chart Section */}
                    <AttendanceChart />
                </div>
            </main>
        </div>
    );
}