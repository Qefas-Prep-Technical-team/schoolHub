/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { GripVertical, Edit2, Trash2, CheckCircle, Clock, FileText } from 'lucide-react';
;
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from './types';

interface QuestionListProps {
  questions: Question[];
  selectedQuestions: Set<string>;
  onSelectQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onEditQuestion: (questionId: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const QuestionCard = ({
  question,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  isDragging,
  attributes,
  listeners,
  setNodeRef,
  style,
}: {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isDragging?: boolean;
  attributes?: any;
  listeners?: any;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}) => {
  const getTypeColor = (type: Question['type']) => {
    switch (type) {
      case 'mcq':
        return { bg: 'bg-blue-50 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' };
      case 'essay':
        return { bg: 'bg-purple-50 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400' };
      case 'true_false':
        return { bg: 'bg-teal-50 dark:bg-teal-900/50', text: 'text-teal-600 dark:text-teal-400' };
      case 'calculation':
        return { bg: 'bg-orange-50 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400' };
      case 'matching':
        return { bg: 'bg-indigo-50 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const getStatusIcon = (status: Question['status']) => {
    switch (status) {
      case 'saved':
        return { icon: CheckCircle, color: 'text-green-500' };
      case 'incomplete':
        return { icon: Clock, color: 'text-orange-500' };
      case 'draft':
        return { icon: FileText, color: 'text-yellow-500' };
      default:
        return { icon: CheckCircle, color: 'text-gray-500' };
    }
  };

  const getStatusText = (status: Question['status']) => {
    switch (status) {
      case 'saved':
        return 'Saved';
      case 'incomplete':
        return 'Incomplete';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  const typeConfig = getTypeColor(question.type);
  const statusConfig = getStatusIcon(question.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 bg-white dark:bg-gray-900/50 rounded-xl border ${
        isDragging
          ? 'border-primary shadow-lg'
          : 'border-gray-200 dark:border-gray-800 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-700'
      } transition-all`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-600" />
      </div>
      
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 bg-transparent text-primary focus:ring-primary/50 dark:bg-gray-800 dark:checked:bg-primary transition-colors cursor-pointer"
      />
      
      <span className="font-bold text-gray-800 dark:text-gray-100 min-w-[24px]">
        {question.number}.
      </span>
      
      <p className="flex-1 text-gray-700 dark:text-gray-300 truncate">
        {question.text}
      </p>
      
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
          {question.marks} Marks
        </span>
        
        <span className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap ${typeConfig.bg} ${typeConfig.text}`}>
          {question.type.toUpperCase()}
        </span>
        
        <div className="flex items-center gap-1.5">
          <statusConfig.icon className={`w-3 h-3 ${statusConfig.color}`} />
          <span className={`text-xs font-medium whitespace-nowrap ${
            question.status === 'saved' ? 'text-green-600 dark:text-green-400' :
            question.status === 'incomplete' ? 'text-orange-600 dark:text-orange-400' :
            'text-yellow-600 dark:text-yellow-400'
          }`}>
            {getStatusText(question.status)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="Edit question"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SortableQuestionCard = ({
  question,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <QuestionCard
      question={question}
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onEdit={onEdit}
      isDragging={isDragging}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
    />
  );
};

export default function QuestionList({
  questions,
  selectedQuestions,
  onSelectQuestion,
  onDeleteQuestion,
  onEditQuestion,
  onReorder,
}: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {questions.map((question) => (
            <SortableQuestionCard
              key={question.id}
              question={question}
              isSelected={selectedQuestions.has(question.id)}
              onSelect={() => onSelectQuestion(question.id)}
              onDelete={() => onDeleteQuestion(question.id)}
              onEdit={() => onEditQuestion(question.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}