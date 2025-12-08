// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import PageHeader from './components/PageHeader';
import ExamDetails from './components/ExamDetails';
import QuestionCard from './components/QuestionCard';
import QuestionNavigation from './components/QuestionNavigation';

const sampleQuestions = [
    {
        id: '1',
        number: 1,
        totalQuestions: 20,
        text: 'Solve the following linear equation for \'x\':',
        equation: '2x + 10 = 40',
        options: [
            { id: 'a', text: 'x = 10' },
            { id: 'b', text: 'x = 15' },
            { id: 'c', text: 'x = 20' },
            { id: 'd', text: 'x = 25' },
        ]
    },
    {
        id: '2',
        number: 2,
        totalQuestions: 20,
        text: 'What is the solution to the equation:',
        equation: '3(x - 4) = 15',
        options: [
            { id: 'a', text: 'x = 3' },
            { id: 'b', text: 'x = 5' },
            { id: 'c', text: 'x = 9' },
            { id: 'd', text: 'x = 11' },
        ]
    },
    {
        id: '3',
        number: 3,
        totalQuestions: 20,
        text: 'Factor the quadratic expression:',
        equation: 'x² + 5x + 6',
        options: [
            { id: 'a', text: '(x + 2)(x + 3)' },
            { id: 'b', text: '(x + 1)(x + 6)' },
            { id: 'c', text: '(x + 2)(x + 4)' },
            { id: 'd', text: '(x + 3)(x + 3)' },
        ]
    }
];

export default function Home() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const currentQuestion = sampleQuestions[currentQuestionIndex];

    const handleNextQuestion = () => {
        if (currentQuestionIndex < sampleQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleQuestionSelect = (questionNumber: number) => {
        const questionIndex = questionNumber - 1;
        if (questionIndex >= 0 && questionIndex < sampleQuestions.length) {
            setCurrentQuestionIndex(questionIndex);
        }
    };

    const handleSubmit = () => {
        alert('Exam submitted successfully!');
        // In a real app, this would submit the exam
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#111827] dark:text-[#D1D5DB]">
            <div className="flex min-h-screen w-full">
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <PageHeader />
                        <ExamDetails />

                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left Content: Question */}
                            <div className="lg:col-span-2">
                                <QuestionCard
                                    {...currentQuestion}
                                    onNext={handleNextQuestion}
                                    showNextButton={true}
                                />
                            </div>

                            {/* Right Content: Navigation */}
                            <div className="lg:col-span-1">
                                <QuestionNavigation
                                    totalQuestions={20}
                                    currentQuestion={currentQuestion.number}
                                    onQuestionSelect={handleQuestionSelect}
                                    onNextQuestion={handleNextQuestion}
                                    onSubmit={handleSubmit}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}