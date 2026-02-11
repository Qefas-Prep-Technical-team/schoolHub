// src/app/page.tsx
import React from 'react';
import Header from './components/Header';
import StatCard from './components/StatCard';
import SubjectTable from './components/SubjectTable';
import TrendChart from './components/TrendChart';
import InsightCard from './components/InsightCard';
import ActionButtons from './components/ActionButtons';

export default function Home() {
    const stats = [
        { title: 'Overall Average', value: '82%' },
        { title: 'Subjects Offered', value: '9' },
        { title: 'Highest Score', value: '95%', subtitle: 'Mathematics' },
        { title: 'Lowest Score', value: '68%', subtitle: 'Chemistry' },
        { title: 'Performance', value: 'Excellent' },
    ];

    const insights = [
        {
            icon: 'trending_up',
            title: 'Strong Performance',
            description: 'You performed best in Mathematics this term, showing excellent understanding of complex topics.',
            color: 'green' as const,
        },
        {
            icon: 'lightbulb',
            title: 'Area for Improvement',
            description: 'Your weakest subject is Chemistry. Try reviewing class notes and practicing more problems.',
            color: 'amber' as const,
        },
    ];

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col">
            <div className="flex h-full grow flex-col">
                <div className="flex flex-1 justify-center py-5 md:py-8 lg:py-12">
                    <div className="flex w-full max-w-6xl flex-col gap-6 px-4 md:gap-8 md:px-6">
                        <Header />

                        {/* Performance Summary Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 md:gap-6">
                            {stats.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>

                        {/* Subject Breakdown & Trend Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="lg:col-span-2">
                                <SubjectTable />
                            </div>
                            <div>
                                <TrendChart />
                            </div>
                        </div>

                        {/* Insights Section */}
                        <div className="flex flex-col gap-4">
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">
                                Academic Insights
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {insights.map((insight, index) => (
                                    <InsightCard key={index} {...insight} />
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <ActionButtons />
                    </div>
                </div>
            </div>
        </div>
    );
}