'use client';

import { useState, useEffect, useMemo } from 'react';

import PageHeader from './components/PageHeader';
import AssessmentTypeToggle from './components/AssessmentTypeToggle';
import StatsCards from './components/StatsCards';
import PerformanceChart from './components/PerformanceChart';
import TimeFilter from './components/TimeFilter';
import AssessmentList from './components/AssessmentList';
import {
    statCards,
    timeFilters,
    assessments as allAssessments,
} from './components/data';

export default function Home() {
    const [assessmentType, setAssessmentType] = useState<'exams' | 'quizzes'>('exams');
    const [timeFilter, setTimeFilter] = useState('term');
    const [filteredAssessments, setFilteredAssessments] = useState(allAssessments);

    // Filter assessments by type
    useEffect(() => {
        const filtered = allAssessments.filter(assessment =>
            assessmentType === 'exams' ? assessment.type === 'exam' : assessment.type === 'quiz'
        );
        setFilteredAssessments(filtered);
    }, [assessmentType]);

    // Further filter by time if needed (this is a simplified example)
    const timeFilteredAssessments = useMemo(() => {
        // In a real app, you would filter by actual dates
        return filteredAssessments;
    }, [filteredAssessments, timeFilter]);

    return (
        <div className="flex min-h-screen">
            <main className="flex-1 p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <PageHeader />
                    <AssessmentTypeToggle onTypeChange={setAssessmentType} />

                    {/* Stats & Performance Grid */}
                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                        {/* Stats Section */}
                        <div className="xl:col-span-2">
                            <StatsCards cards={statCards} />
                        </div>

                        {/* Performance Chart */}
                        <PerformanceChart />
                    </div>

                    {/* Assessments List */}
                    <TimeFilter
                        filters={timeFilters}
                        activeFilter={timeFilter}
                        onFilterChange={setTimeFilter}
                        title={`Upcoming ${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)}`}
                    />

                    <AssessmentList assessments={timeFilteredAssessments} />
                </div>
            </main>
        </div>
    );
}