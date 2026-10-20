"use client"

import React, { useState, useMemo } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Lightbulb, 
  MessageSquare,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react'
import { ExamDetailData } from './types'
import Pagination from '@/components/ui/Pagination'

interface QuestionReviewProps {
  data: ExamDetailData
}

export default function QuestionReview({ data }: QuestionReviewProps) {
  const [selectedPaper, setSelectedPaper] = useState<string>('ALL')
  const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null)

  const itemsPerPage = 10
  const questions = data.questions || []

  // Extract distinct subject papers from the questions
  const distinctPapers = useMemo(() => {
    const list: string[] = []
    for (const q of questions) {
      if (q.subjectName && !list.includes(q.subjectName)) {
        list.push(q.subjectName)
      }
    }
    return list
  }, [questions])

  // Subject paper filtering
  const paperFilteredQuestions = useMemo(() => {
    if (selectedPaper === 'ALL') return questions
    return questions.filter(q => q.subjectName === selectedPaper)
  }, [questions, selectedPaper])

  // Correctness filtering
  const filteredQuestions = useMemo(() => {
    return paperFilteredQuestions.filter(q => {
      if (filter === 'CORRECT') return q.isCorrect === true
      if (filter === 'INCORRECT') return q.isCorrect === false
      return true
    })
  }, [paperFilteredQuestions, filter])

  // Counts based on active paper selection
  const totalInSelectedPaper = paperFilteredQuestions.length
  const correctCount = paperFilteredQuestions.filter(q => q.isCorrect === true).length
  const incorrectCount = paperFilteredQuestions.filter(q => q.isCorrect === false).length

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredQuestions.slice(start, start + itemsPerPage)
  }, [filteredQuestions, currentPage, itemsPerPage])

  const handleSelectPaper = (paper: string) => {
    setSelectedPaper(paper)
    setCurrentPage(1)
    setOpenQuestionId(null)
  }

  const handleSelectFilter = (f: 'ALL' | 'CORRECT' | 'INCORRECT') => {
    setFilter(f)
    setCurrentPage(1)
    setOpenQuestionId(null)
  }

  const toggleQuestion = (id: string) => {
    setOpenQuestionId(prev => (prev === id ? null : id))
  }

  // Active Subject Summary (if a specific paper is selected)
  const activeSubjectDetail = useMemo(() => {
    if (selectedPaper === 'ALL') return null
    return data.subjects.find(s => s.name.toLowerCase() === selectedPaper.toLowerCase()) || null
  }, [selectedPaper, data.subjects])

  // Fallback for non-CBT / offline written assessments
  if (questions.length === 0) {
    const subjects = data.subjects.length > 0 ? data.subjects : []
    const distinctSubjectNames = subjects.map(s => s.name)

    const activeSubjects = selectedPaper === 'ALL' 
      ? subjects 
      : subjects.filter(s => s.name === selectedPaper)

    const subjectTotalPages = Math.ceil(activeSubjects.length / itemsPerPage) || 1
    const paginatedSubjects = activeSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Assessment Review & Evaluation Slips
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official terminal paper scorecards by subject paper
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-xl self-start sm:self-auto flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            Verified Evaluation
          </span>
        </div>

        {/* Subject Paper Selector Tabs (if multiple subjects exist) */}
        {distinctSubjectNames.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => {
                setSelectedPaper('ALL')
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedPaper === 'ALL'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Layers size={13} />
              <span>All Papers ({subjects.length})</span>
            </button>
            {distinctSubjectNames.map(name => (
              <button
                key={name}
                onClick={() => {
                  setSelectedPaper(name)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedPaper === name
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <BookOpen size={13} />
                <span>{name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Subject Cards */}
        <div className="space-y-3">
          {paginatedSubjects.map((sub, idx) => {
            const itemNumber = (currentPage - 1) * itemsPerPage + idx + 1
            return (
              <div 
                key={sub.id || idx}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-500/20">
                        Paper #{itemNumber}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {sub.name}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {sub.percentage}%
                      </span>
                    </div>
                    {sub.teacher && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Evaluated by: <strong className="text-slate-700 dark:text-slate-300">{sub.teacher}</strong>
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {sub.score}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      /{sub.totalMarks}
                    </span>
                  </div>
                </div>

                {sub.remarks && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                    &ldquo;{sub.remarks}&rdquo;
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {subjectTotalPages > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={subjectTotalPages}
            totalItems={activeSubjects.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            theme="orange"
          />
        ) : (
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Showing all {activeSubjects.length} {activeSubjects.length === 1 ? 'subject paper record' : 'subject paper records'}</span>
            <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              Page 1 of 1
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Question Review
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Per-question analysis, student responses, and verified solution keys
          </p>
        </div>

        {/* Correctness Filter Controls */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => handleSelectFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            All ({totalInSelectedPaper})
          </button>
          <button
            onClick={() => handleSelectFilter('CORRECT')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filter === 'CORRECT'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Correct ({correctCount})
          </button>
          <button
            onClick={() => handleSelectFilter('INCORRECT')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filter === 'INCORRECT'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <span className="size-1.5 rounded-full bg-rose-500" />
            Incorrect ({incorrectCount})
          </button>
        </div>
      </div>

      {/* Subject Paper Separation Tabs */}
      {distinctPapers.length > 1 && (
        <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {/* All Papers Tab */}
            <button
              type="button"
              onClick={() => handleSelectPaper('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedPaper === 'ALL'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Layers size={14} />
              <span>All Subject Papers</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                selectedPaper === 'ALL'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {questions.length}
              </span>
            </button>

            {/* Individual Subject Paper Tabs */}
            {distinctPapers.map(paperName => {
              const countInPaper = questions.filter(q => q.subjectName === paperName).length
              const isSelected = selectedPaper === paperName
              return (
                <button
                  key={paperName}
                  type="button"
                  onClick={() => handleSelectPaper(paperName)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>{paperName}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {countInPaper}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Paper Header Banner if a specific subject is selected */}
      {selectedPaper !== 'ALL' && activeSubjectDetail && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30 flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-orange-500" />
            <span className="text-xs sm:text-sm font-bold text-orange-950 dark:text-orange-200">
              Viewing <strong className="font-black">{selectedPaper}</strong> Question Paper
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-800 dark:text-orange-300">
            <span>Score: {activeSubjectDetail.score}/{activeSubjectDetail.totalMarks} ({activeSubjectDetail.percentage}%)</span>
            <span className="bg-orange-200/70 dark:bg-orange-900/50 px-2 py-0.5 rounded-md text-[10px]">
              {totalInSelectedPaper} Questions
            </span>
          </div>
        </div>
      )}

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center shadow-xs">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            No questions match the selected filter ({filter.toLowerCase()}) for this paper.
          </p>
          <button
            onClick={() => handleSelectFilter('ALL')}
            className="mt-3 text-xs font-bold text-orange-600 hover:underline"
          >
            Show All Questions
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedQuestions.map((q, idx) => {
            const isOpen = openQuestionId === q.id
            const isCorrect = q.isCorrect === true
            const isPending = q.isCorrect === null
            const displayItemNumber = (currentPage - 1) * itemsPerPage + idx + 1

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden shadow-xs ${
                  isCorrect 
                    ? 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800' 
                    : isPending
                    ? 'border-slate-200/80 dark:border-slate-800 hover:border-amber-300'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(q.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isCorrect 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20' 
                        : isPending
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {typeof q.number === 'number' ? `Q${q.number}` : `Q${displayItemNumber}`}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {q.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {q.subjectName && (
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.2 rounded">
                            {q.subjectName}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          Item #{displayItemNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      isCorrect 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                        : isPending
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}>
                      {q.scoreAwarded}/{q.maxMarks} pts
                    </span>
                    <div className="text-slate-400">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                {/* Collapsible Question Detail */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 space-y-3 animate-in fade-in duration-200">
                    <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-2">
                      {q.title}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Student Answer */}
                      <div className={`p-3 rounded-xl border ${
                        isCorrect 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40' 
                          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                      }`}>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                          Student&apos;s Answer
                        </span>
                        <p className={`text-xs sm:text-sm font-bold ${
                          isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                        }`}>
                          {q.userAnswer || 'No response recorded'}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              Scored Full Marks ({q.scoreAwarded}/{q.maxMarks})
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <XCircle size={13} />
                              Incorrect Answer
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Correct Answer */}
                      {q.correctAnswer && (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                            Standard Solution
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {q.correctAnswer}
                          </p>
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            Verified Answer Key
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Explanation or Teacher Note */}
                    {q.explanation && (
                      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                        <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Concept Explanation:</span>
                          <span>{q.explanation}</span>
                        </div>
                      </div>
                    )}

                    {q.reviewNote && (
                      <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                        <MessageSquare size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Teacher / Grader Feedback:</span>
                          <span>{q.reviewNote}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 10-per-page Pagination Footer */}
      {totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredQuestions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          theme="orange"
        />
      ) : filteredQuestions.length > 0 ? (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-xs">
          <span>
            Showing all <strong className="text-slate-900 dark:text-white">{filteredQuestions.length}</strong> questions {selectedPaper !== 'ALL' ? `for ${selectedPaper}` : ''}
          </span>
          <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">
            Page 1 of 1
          </span>
        </div>
      ) : null}
    </div>
  )
}
