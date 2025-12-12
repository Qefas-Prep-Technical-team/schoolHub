"use client"

import { useState } from 'react'

interface Question {
  id: string
  number: string
  title: string
  points: string
  isCorrect: boolean
  userAnswer?: string
  correctAnswer?: string
  hint?: string
}

export default function QuestionReview() {
  const [openQuestion, setOpenQuestion] = useState<string | null>('Q6')

  const questions: Question[] = [
    {
      id: 'Q5',
      number: 'Q5',
      title: 'Calculate the derivative of f(x) = 3x² + 5x...',
      points: '0/5 pts',
      isCorrect: false,
      userAnswer: '6x + 2',
      correctAnswer: '6x + 5',
      hint: 'Remember: The derivative of a constant (like -2) is 0. The derivative of 5x is 5.'
    },
    {
      id: 'Q6',
      number: 'Q6',
      title: 'Solve for x: 2x + 4 = 12',
      points: '5/5 pts',
      isCorrect: true,
      userAnswer: 'x = 4'
    },
    {
      id: 'Q7',
      number: 'Q7',
      title: 'What is the formula for the area of a circle?',
      points: '5/5 pts',
      isCorrect: true
    }
  ]

  const toggleQuestion = (id: string) => {
    setOpenQuestion(openQuestion === id ? null : id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Question Review
        </h3>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
            <span className="size-2 rounded-full bg-red-500"></span>
            Incorrect
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <span className="size-2 rounded-full bg-green-500"></span>
            Correct
          </span>
        </div>
      </div>

      {questions.map((question) => (
        <div
          key={question.id}
          className={`group bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-l-4 ${
            question.isCorrect 
              ? 'border-l-green-500' 
              : 'border-l-red-500'
          } border-gray-100 dark:border-gray-800 overflow-hidden`}
        >
          <button
            onClick={() => toggleQuestion(question.id)}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors w-full text-left"
          >
            <div className="flex items-center gap-4">
              <span className={`size-8 flex items-center justify-center rounded-lg ${
                question.isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              } font-bold text-sm`}>
                {question.number}
              </span>
              <span className="font-medium text-gray-900 dark:text-white text-sm md:text-base line-clamp-1">
                {question.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${
                question.isCorrect
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {question.points}
              </span>
              <span className="material-symbols-outlined text-gray-400 transition-transform group-hover:rotate-180">
                {openQuestion === question.id ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </button>

          {openQuestion === question.id && (
            <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="mt-4 space-y-3">
                <p className="text-gray-800 dark:text-gray-200 font-medium text-lg">
                  Calculate the derivative of f(x) = 3x² + 5x - 2
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {/* Student's Answer */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900/30">
                    <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wide">
                      Alex&apos;s Answer
                    </p>
                    <p className="text-red-600 dark:text-red-400 font-mono">
                      {question.userAnswer}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
                      <span className="material-symbols-outlined text-[16px]">cancel</span>
                      Incorrect
                    </div>
                  </div>

                  {/* Correct Answer */}
                  {question.correctAnswer && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-900/30">
                      <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wide">
                        Correct Answer
                      </p>
                      <p className="text-green-600 dark:text-green-400 font-mono">
                        {question.correctAnswer}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Correct Solution
                      </div>
                    </div>
                  )}
                </div>

                {/* Hint */}
                {question.hint && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 shrink-0">
                      lightbulb
                    </span>
                    <p>{question.hint}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}