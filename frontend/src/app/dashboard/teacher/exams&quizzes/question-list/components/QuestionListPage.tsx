'use client';

import { useState } from 'react';
import { Question } from './types';
import Breadcrumbs from './Breadcrumbs';
import Toolbar from './Toolbar';
import QuestionList from './QuestionList';
import EmptyState from './EmptyState';
import FloatingActionButton from './FloatingActionButton';


export default function QuestionListPage() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      number: 1,
      text: 'What is the powerhouse of the cell?',
      marks: 5,
      type: 'mcq',
      status: 'saved',
      examId: 'mid-term-science',
    },
    {
      id: '2',
      number: 2,
      text: 'Explain the process of photosynthesis in detail.',
      marks: 10,
      type: 'essay',
      status: 'saved',
      examId: 'mid-term-science',
    },
    {
      id: '3',
      number: 3,
      text: 'True or False: The Earth is the third planet from the Sun.',
      marks: 2,
      type: 'true_false',
      status: 'incomplete',
      examId: 'mid-term-science',
    },
    {
      id: '4',
      number: 4,
      text: 'Calculate the force when mass is 5kg and acceleration is 10m/s².',
      marks: 8,
      type: 'calculation',
      status: 'draft',
      examId: 'mid-term-science',
    },
    {
      id: '5',
      number: 5,
      text: 'Match the following scientific terms with their definitions.',
      marks: 6,
      type: 'matching',
      status: 'saved',
      examId: 'mid-term-science',
    },
  ]);

  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions(new Set());
    } else {
      const allIds = new Set(questions.map(q => q.id));
      setSelectedQuestions(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedQuestions.size === 0) return;

    switch (bulkAction) {
      case 'delete':
        if (confirm(`Delete ${selectedQuestions.size} selected question(s)?`)) {
          setQuestions(prev => prev.filter(q => !selectedQuestions.has(q.id)));
          setSelectedQuestions(new Set());
        }
        break;
      case 'change_marks':
        const newMarks = prompt('Enter new marks for selected questions:');
        if (newMarks && !isNaN(parseInt(newMarks))) {
          setQuestions(prev => 
            prev.map(q => 
              selectedQuestions.has(q.id) 
                ? { ...q, marks: parseInt(newMarks) } 
                : q
            )
          );
        }
        break;
      case 'duplicate':
        const questionsToDuplicate = questions.filter(q => selectedQuestions.has(q.id));
        const duplicatedQuestions = questionsToDuplicate.map((q, index) => ({
          ...q,
          id: `${q.id}-copy-${index}`,
          number: questions.length + index + 1,
          status: 'draft' as const,
        }));
        setQuestions(prev => [...prev, ...duplicatedQuestions]);
        break;
    }
    
    setBulkAction('');
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  const handleEditQuestion = (questionId: string) => {
    console.log('Edit question:', questionId);
    // Navigate to edit page or open modal
  };

  const handleAddQuestion = () => {
    console.log('Add new question');
    // Navigate to create question page or open modal
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[dragIndex];
    
    // Remove dragged item
    newQuestions.splice(dragIndex, 1);
    // Insert at new position
    newQuestions.splice(hoverIndex, 0, draggedQuestion);
    
    // Update question numbers
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      number: index + 1,
    }));
    
    setQuestions(updatedQuestions);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs />
          
          <div className="mb-6">
            <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold tracking-tight">
              Mid-Term Science Exam Questions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Total: {questions.length} questions • {questions.reduce((sum, q) => sum + q.marks, 0)} total marks
            </p>
          </div>

          <Toolbar
            selectAll={selectAll}
            onSelectAll={handleSelectAll}
            bulkAction={bulkAction}
            onBulkActionChange={setBulkAction}
            onApplyBulkAction={handleBulkAction}
            selectedCount={selectedQuestions.size}
          />

          {questions.length > 0 ? (
            <QuestionList
              questions={questions}
              selectedQuestions={selectedQuestions}
              onSelectQuestion={handleSelectQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onEditQuestion={handleEditQuestion}
              onReorder={handleReorder}
            />
          ) : (
            <EmptyState onAddQuestion={handleAddQuestion} />
          )}
        </div>
      </main>

      <FloatingActionButton onClick={handleAddQuestion} />
    </div>
  );
}