'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  equation?: string;
  options: string[];
  correctAnswer?: number;
}

interface QuestionViewerProps {
  questions: Question[];
  currentQuestion: number;
  selectedAnswers: Record<number, number>;
  onSelectAnswer: (questionId: number, answerIndex: number) => void;
  isPreview: boolean;
}

export default function QuestionViewer({
  questions,
  currentQuestion,
  selectedAnswers,
  onSelectAnswer,
  isPreview,
}: QuestionViewerProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  const currentQuestionData = questions[currentQuestion - 1];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      // Scroll to previous question
      document.getElementById(`question-${currentQuestion - 1}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length) {
      // Scroll to next question
      document.getElementById(`question-${currentQuestion + 1}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      id={`question-${currentQuestion}`}
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6"
    >
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Question {currentQuestion} of {questions.length}
        </h2>
        
        <div className="flex items-center gap-2">
          {isPreview && (
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {currentQuestionData.text}
        </p>
        
        {currentQuestionData.equation && (
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-center">
            <p className="font-mono text-lg text-gray-900 dark:text-white">
              {currentQuestionData.equation}
            </p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestionData.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectOption = currentQuestionData.correctAnswer === index;
          const showCorrect = showAnswer && isPreview;
          
          return (
            <label
              key={index}
              className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${
                showCorrect && isCorrectOption
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : ''
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                checked={isSelected}
                onChange={() => onSelectAnswer(currentQuestion, index)}
                disabled={isPreview}
                className={`h-5 w-5 border-gray-300 dark:border-gray-600 ${
                  isPreview ? 'cursor-not-allowed' : 'cursor-pointer'
                } text-primary focus:ring-primary disabled:opacity-50`}
              />
              
              <span className={`flex-1 text-base ${
                isSelected 
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {option}
              </span>
              
              {showCorrect && isCorrectOption && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Correct Answer
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Feedback for Preview */}
      {isPreview && showAnswer && currentQuestionData.correctAnswer !== undefined && (
        <div className={`mt-6 p-4 rounded-lg ${
          isCorrect 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`font-medium ${
            isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
          }`}>
            {isCorrect 
              ? 'Correct! This would earn full marks.'
              : `Incorrect. The right answer is: ${currentQuestionData.options[currentQuestionData.correctAnswer]}`
            }
          </p>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion <= 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            currentQuestion > 1
              ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Question
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentQuestion >= questions.length}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            currentQuestion < questions.length
              ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          Next Question
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}