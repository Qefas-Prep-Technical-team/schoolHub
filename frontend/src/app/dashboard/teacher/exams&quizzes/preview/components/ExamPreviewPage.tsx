'use client';

import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import QuestionViewer from './QuestionViewer';
import ExamInfo from './ExamInfo';
import Breadcrumbs from './Breadcrumbs';
import ExamSidebar from './ExamSidebar';


export default function ExamPreviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(59 * 60 + 59); // 59:59 in seconds
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  const totalQuestions = 20;
  const examData = {
    title: 'Algebra Fundamentals',
    class: 'Grade 10 - Section A',
    duration: 60,
    subject: 'Mathematics',
    totalQuestions: 20,
  };

  const questions = Array.from({ length: totalQuestions }, (_, i) => ({
    id: i + 1,
    text: i === 0 
      ? 'Solve the following linear equation for \'x\':'
      : `Question ${i + 1} text will appear here...`,
    equation: i === 0 ? '2x + 10 = 40' : undefined,
    options: i === 0 
      ? ['x = 10', 'x = 15', 'x = 20', 'x = 25']
      : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: i === 0 ? 1 : undefined, // Index of correct answer
  }));

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (questionId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
    
    if (!answeredQuestions.has(questionId)) {
      setAnsweredQuestions(prev => new Set(prev).add(questionId));
    }
  };

  const handleNavigateToQuestion = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
    // Scroll to question
    document.getElementById(`question-${questionNumber}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClosePreview = () => {
    if (window.confirm('Are you sure you want to close the preview?')) {
      window.history.back();
    }
  };

  const handleSubmitExam = () => {
    if (window.confirm('Submit exam? This is just a preview, so no data will be saved.')) {
      alert('Exam submitted successfully! (Preview mode)');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="p-4 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Exam Preview: {examData.title}
              </h1>
              <button
                onClick={handleClosePreview}
                className="flex items-center justify-center h-10 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
              >
                <X className="w-4 h-4 mr-2" />
                Close Preview
              </button>
            </div>
            
            <Breadcrumbs />
          </div>

          {/* Exam Info */}
          <div className="mt-6">
            <ExamInfo examData={examData} />
          </div>

          {/* Main Content */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Viewer */}
            <div className="lg:col-span-2">
              <QuestionViewer
                questions={questions}
                currentQuestion={currentQuestion}
                selectedAnswers={selectedAnswers}
                onSelectAnswer={handleSelectAnswer}
                isPreview={true}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ExamSidebar
                timeRemaining={formatTime(timeRemaining)}
                totalQuestions={totalQuestions}
                currentQuestion={currentQuestion}
                answeredQuestions={answeredQuestions}
                onNavigateToQuestion={handleNavigateToQuestion}
                onSubmitExam={handleSubmitExam}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}