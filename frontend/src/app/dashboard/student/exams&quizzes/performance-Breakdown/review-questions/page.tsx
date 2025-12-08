'use client';

import { useState, useMemo } from 'react';
import PageHeader from './components/PageHeader';
import FilterTabs from './components/FilterTabs';
import QuestionCard from './components/QuestionCard';
import NavigationFooter from './components/NavigationFooter';
import {
    quizInfo,
    filterOptions,
    questions as allQuestions,
} from './components/data';

export default function Home() {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Filter questions based on selected filter
    const filteredQuestions = useMemo(() => {
        if (selectedFilter === 'all') return allQuestions;
        return allQuestions.filter(question => question.status === selectedFilter);
    }, [selectedFilter]);

    // Get current question based on filtered list
    const currentQuestion = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];

    const handleFilterChange = (filter: 'all' | 'correct' | 'wrong' | 'unanswered') => {
        setSelectedFilter(filter);
        setCurrentQuestionIndex(0); // Reset to first question when filter changes
    };

    const handleJumpToQuestion = () => {
        // This would typically open a modal or dropdown to select a question
        const questionNumber = prompt('Enter question number (1-3):');
        if (questionNumber) {
            const index = parseInt(questionNumber) - 1;
            if (index >= 0 && index < filteredQuestions.length) {
                setCurrentQuestionIndex(index);
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < filteredQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col">
            <div className="flex h-full min-h-screen w-full">
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                        {/* Page Header */}
                        <PageHeader
                            quiz={quizInfo}
                            onJumpToQuestion={handleJumpToQuestion}
                        />

                        {/* Filter Tabs */}
                        <FilterTabs
                            filters={filterOptions}
                            onFilterChange={handleFilterChange}
                        />

                        {/* Questions List */}
                        <div className="space-y-6">
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map((question, index) => (
                                    <QuestionCard
                                        key={question.id}
                                        question={question}
                                        className={index !== currentQuestionIndex ? 'hidden' : ''}
                                    />
                                ))
                            ) : (
                                <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center dark:border-gray-700/80 dark:bg-gray-800/50">
                                    <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                        No questions found for the selected filter.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Navigation Footer */}
                        {filteredQuestions.length > 0 && (
                            <NavigationFooter
                                currentQuestion={currentQuestionIndex + 1}
                                totalQuestions={filteredQuestions.length}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}