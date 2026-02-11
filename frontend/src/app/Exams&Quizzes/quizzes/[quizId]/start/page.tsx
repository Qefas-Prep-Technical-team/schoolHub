'use client';

import Header from './components/Header';
import QuestionCard from './components/QuestionCard';
import Timer from './components/Timer';
import QuestionNavigation from './components/QuestionNavigation';
import QuizInfo from './components/QuizInfo';
import { Card } from './components/ui/Card';
import { Quiz, Question } from './components/types';
import { useState } from 'react';

const mockQuiz: Quiz = {
    id: '1',
    title: 'Algebra Fundamentals Quiz',
    description: 'A short quiz to test your basic algebra skills.',
    duration: 20,
    subject: 'Mathematics',
    grade: 'Grade 10 - Section A',
    totalQuestions: 10,
    currentQuestion: 1,
};

const mockQuestion: Question = {
    id: 1,
    title: "Solve the following linear equation for 'x':",
    equation: "2x + 10 = 40",
    options: [
        { id: 'a', text: 'x = 10' },
        { id: 'b', text: 'x = 15', selected: true },
        { id: 'c', text: 'x = 20' },
        { id: 'd', text: 'x = 25' },
    ],
    disabled: true,
};

export default function QuizPreviewPage() {
    const [currentQuestion, setCurrentQuestion] = useState(1);

    const handleQuestionSelect = (questionNumber: number) => {
        setCurrentQuestion(questionNumber);
        // In real app, you would fetch the question data here
    };

    const handleSubmit = () => {
        // Handle quiz submission
        console.log('Quiz submitted');
    };

    const handleTimeUp = () => {
        alert('Time is up! Submitting quiz...');
        handleSubmit();
    };

    const breadcrumbs = [
        { label: 'Exams & Quizzes', href: '#' },
        { label: 'Algebra Fundamentals Quiz', href: '#' },
        { label: 'Preview' },
    ];

    return (
        <div className="p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <Header
                    title="Quiz Preview"
                    breadcrumbs={breadcrumbs}
                />

                <div className="mt-6">
                    <QuizInfo quiz={mockQuiz} />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Question Area */}
                    <div className="lg:col-span-2">
                        <QuestionCard
                            question={mockQuestion}
                            currentQuestion={currentQuestion}
                            totalQuestions={mockQuiz.totalQuestions}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <Timer duration={mockQuiz.duration} onTimeUp={handleTimeUp} />

                        <Card className="p-6">
                            <QuestionNavigation
                                totalQuestions={mockQuiz.totalQuestions}
                                currentQuestion={currentQuestion}
                                onQuestionSelect={handleQuestionSelect}
                                onSubmit={handleSubmit}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}