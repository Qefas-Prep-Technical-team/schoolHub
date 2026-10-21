'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';

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
  onNavigateToQuestion?: (questionId: number) => void;
}

export default function QuestionViewer({
  questions,
  currentQuestion,
  selectedAnswers,
  onSelectAnswer,
  isPreview,
  onNavigateToQuestion,
}: QuestionViewerProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  const currentQuestionData = questions[currentQuestion - 1];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const isCorrect = selectedAnswer === currentQuestionData?.correctAnswer;

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      if (onNavigateToQuestion) {
        onNavigateToQuestion(currentQuestion - 1);
      } else {
        document.getElementById(`question-${currentQuestion - 1}`)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length) {
      if (onNavigateToQuestion) {
        onNavigateToQuestion(currentQuestion + 1);
      } else {
        document.getElementById(`question-${currentQuestion + 1}`)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!currentQuestionData) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-400">
        No question selected.
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div 
      id={`question-${currentQuestion}`}
      className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-6 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Question Header: Number & Answer Reveal Toggle */}
        <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-black text-xs sm:text-sm border border-emerald-100 dark:border-emerald-500/20">
              Question {currentQuestion} of {questions.length}
            </span>
          </div>
          
          {isPreview && (
            <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                showAnswer
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
              }`}
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Hide Answer</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Show Answer</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Question Text */}
        <div className="mb-5">
          <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed overflow-x-auto">
            <LaTeXRenderer content={currentQuestionData.text} />
          </div>
          
          {currentQuestionData.equation && (
            <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 text-center border border-slate-100 dark:border-slate-800 overflow-x-auto max-w-full">
              <LaTeXRenderer content={currentQuestionData.equation} className="font-mono text-sm sm:text-base text-slate-900 dark:text-white" />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2.5 sm:space-y-3">
          {currentQuestionData.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = currentQuestionData.correctAnswer === index;
            const showCorrect = (showAnswer || selectedAnswer !== undefined) && isPreview;
            const letter = optionLetters[index] || String(index + 1);
            
            let cardStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300";
            let letterBadgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";

            if (isSelected) {
              cardStyle = "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500/50";
              letterBadgeStyle = "bg-emerald-600 text-white border-emerald-600";
            }

            if (showCorrect && isCorrectOption) {
              cardStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500";
              letterBadgeStyle = "bg-emerald-600 text-white border-emerald-600";
            } else if (showCorrect && isSelected && !isCorrectOption) {
              cardStyle = "border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 ring-1 ring-rose-400";
              letterBadgeStyle = "bg-rose-500 text-white border-rose-500";
            }

            return (
              <label
                key={index}
                className={`flex items-start sm:items-center gap-3 p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${cardStyle}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  checked={isSelected}
                  onChange={() => onSelectAnswer(currentQuestion, index)}
                  disabled={(selectedAnswer !== undefined || showAnswer) && isPreview}
                  className="sr-only"
                />

                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border mt-0.5 sm:mt-0 transition-colors ${letterBadgeStyle}`}>
                  {letter}
                </span>
                
                <span className="flex-1 text-xs sm:text-sm font-medium leading-relaxed overflow-x-auto">
                  <LaTeXRenderer content={option} />
                </span>
                
                {showCorrect && isCorrectOption && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shrink-0">
                    <Check className="w-3 h-3" /> Correct
                  </span>
                )}

                {showCorrect && isSelected && !isCorrectOption && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shrink-0">
                    <X className="w-3 h-3" /> Incorrect
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {/* Feedback for Preview */}
        {isPreview && (showAnswer || selectedAnswer !== undefined) && currentQuestionData.correctAnswer !== undefined && (
          <div className={`mt-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${
            isCorrect 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}>
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`} />
            <div>
              <p className="font-bold mb-0.5">
                {isCorrect ? 'Correct! Simulation passed.' : 'Incorrect answer selected.'}
              </p>
              <p className="text-xs opacity-90 leading-relaxed">
                {isCorrect 
                  ? 'This answer would be awarded full marks in the live assessment.'
                  : `The correct option is (${optionLetters[currentQuestionData.correctAnswer]}): ${currentQuestionData.options[currentQuestionData.correctAnswer]}`
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestion <= 1}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            currentQuestion > 1
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Question</span>
          <span className="sm:hidden">Prev</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-400 sm:hidden">
          {currentQuestion}/{questions.length}
        </span>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={currentQuestion >= questions.length}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            currentQuestion < questions.length
              ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <span className="hidden sm:inline">Next Question</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
