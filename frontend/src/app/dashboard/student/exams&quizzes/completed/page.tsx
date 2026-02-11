'use client';

import { useState, useMemo } from 'react';
import Breadcrumbs from './components/Breadcrumbs';
import PageHeader from './components/PageHeader';
import Filters from './components/Filters';
import AssessmentGrid from './components/AssessmentGrid';
import {
    breadcrumbs,
    typeFilters,
    subjectFilters,
    scoreFilters,
    assessments as initialAssessments,
} from './components/data';
import { Assessment } from './components/types';

export default function Home() {
    const [assessments] = useState<Assessment[]>(initialAssessments);
    const [filters, setFilters] = useState({
        type: 'all',
        subject: 'all',
        score: 'any',
    });

    // Filter assessments based on selected filters
    const filteredAssessments = useMemo(() => {
        return assessments.filter((assessment) => {
            // Type filter
            if (filters.type !== 'all') {
                // In a real app, you would have assessment.type property
                // For now, we'll filter based on status for demonstration
                if (filters.type === 'exam' && assessment.title.toLowerCase().includes('exam')) {
                    return true;
                }
                if (filters.type === 'quiz' && assessment.title.toLowerCase().includes('quiz')) {
                    return true;
                }
                if (filters.type === 'project' && assessment.title.toLowerCase().includes('project')) {
                    return true;
                }
                return false;
            }

            // Subject filter
            if (filters.subject !== 'all') {
                if (filters.subject === 'history' && assessment.subject === 'History') return true;
                if (filters.subject === 'mathematics' && assessment.subject === 'Mathematics') return true;
                if (filters.subject === 'physics' && assessment.subject === 'Physics') return true;
                if (filters.subject === 'computer-science' && assessment.subject === 'Computer Science') return true;
                return false;
            }

            // Score filter
            if (filters.score !== 'any') {
                const percentage = assessment.score.percentage;
                if (filters.score === 'excellent' && percentage >= 90) return true;
                if (filters.score === 'good' && percentage >= 80 && percentage < 90) return true;
                if (filters.score === 'average' && percentage >= 70 && percentage < 80) return true;
                if (filters.score === 'needs-work' && percentage < 70) return true;
                return false;
            }

            return true;
        });
    }, [assessments, filters]);

    const handleTypeChange = (type: string) => {
        setFilters(prev => ({ ...prev, type }));
    };

    const handleSubjectChange = (subject: string) => {
        setFilters(prev => ({ ...prev, subject }));
    };

    const handleScoreChange = (score: string) => {
        setFilters(prev => ({ ...prev, score }));
    };

    const handleReset = () => {
        setFilters({ type: 'all', subject: 'all', score: 'any' });
    };

    const handleAssessmentClick = (assessment: Assessment) => {
        console.log('Viewing breakdown for:', assessment.title);
        // In a real app, navigate to assessment details page
        // or show a modal with breakdown
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <div className="flex h-full w-full flex-1">
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-7xl">
                        <Breadcrumbs items={breadcrumbs} />
                        <PageHeader />

                        <Filters
                            typeFilters={typeFilters}
                            subjectFilters={subjectFilters}
                            scoreFilters={scoreFilters}
                            onTypeChange={handleTypeChange}
                            onSubjectChange={handleSubjectChange}
                            onScoreChange={handleScoreChange}
                            onReset={handleReset}
                        />

                        <AssessmentGrid
                            assessments={filteredAssessments}
                            onAssessmentClick={handleAssessmentClick}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}