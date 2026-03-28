"use client";

import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Sparkles, FileText, Trash2, Edit2, GripVertical, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { examService } from "@/lib/api/services/examService";

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import ManualAddForm from "./ManualAddForm";
import AITools from "./AITools";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Question {
  id: string;
  type: string;
  question: string;
  marks: number;
  correctAnswer: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  explanation?: string;
}

export default function QuestionManager({ 
  paperId, 
  examId,
  paper 
}: { 
  paperId: string;
  examId: string;
  paper: any;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("list");
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => examService.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Question deleted successfully!");
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete question");
      setDeletingId(null);
    }
  });

  const questions = paper?.questions || [];
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  
  // Keep local state in sync when paper data updates (e.g. from React Query)
  useEffect(() => {
    if (paper?.questions) {
      setLocalQuestions(paper.questions);
    }
  }, [paper?.questions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: (reorderedIds: string[]) => 
      apiClient.patch(`/exams/${examId}/papers/${paperId}/questions/reorder`, { reorderedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Question order updated!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update order");
      // Revert local state on error to the last valid state from the server
      setLocalQuestions(paper?.questions || []);
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localQuestions.findIndex((q) => q.id === active.id);
      const newIndex = localQuestions.findIndex((q) => q.id === over.id);

      const newOrder = arrayMove(localQuestions, oldIndex, newIndex);
      setLocalQuestions(newOrder);

      // Persist to backend
      reorderMutation.mutate(newOrder.map(q => q.id));
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setActiveTab("edit");
  };

  const handleDelete = (questionId: string) => {
    setDeletingId(questionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Questions</h2>
          <p className="text-sm text-gray-500">Manage questions for this subject paper</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto scroller-none">
              {[
                { id: 'list', label: 'List', icon: FileText },
                { id: 'add', label: 'Add', icon: Plus },
                { id: 'ai', label: 'AI Tools', icon: Sparkles, color: 'text-primary' },
                ...(activeTab === 'edit' ? [{ id: 'edit', label: 'Editing', icon: Edit2 }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'edit') setEditingQuestion(null);
                  }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon size={14} className={tab.color || ''} />
                  {tab.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "list" && (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold">No questions yet</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                  Get started by adding questions manually or use our AI tools to generate them in seconds.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={() => setActiveTab("add")} variant="outline" className="rounded-xl">
                    Add Manually
                  </Button>
                  <Button onClick={() => setActiveTab("ai")} className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                    <Sparkles size={16} /> Use AI Tools
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={localQuestions.map(q => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {localQuestions.map((q: Question, idx: number) => (
                      <SortableQuestionCard 
                        key={q.id} 
                        q={q} 
                        idx={idx} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                        isDeleting={deleteQuestionMutation.isPending}
                        isPublished={paper?.status === 'PUBLISHED'}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        )}

        {activeTab === "add" && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden rounded-2xl">
               <ManualAddForm 
                 paperId={paperId} 
                 examId={examId} 
                 onCancel={() => setActiveTab("list")} 
               />
            </Card>
          </div>
        )}

        {activeTab === "edit" && editingQuestion && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden rounded-2xl">
               <ManualAddForm 
                 paperId={paperId} 
                 examId={examId} 
                 initialData={editingQuestion}
                 onCancel={() => {
                   setActiveTab("list");
                   setEditingQuestion(null);
                 }} 
               />
            </Card>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden rounded-2xl">
               <AITools 
                 paperId={paperId} 
                 examId={examId} 
                 paper={paper}
                 onCancel={() => setActiveTab("list")} 
               />
            </Card>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteQuestionMutation.mutate(deletingId)}
        isPending={deleteQuestionMutation.isPending}
      />
    </div>
  );
}

function SortableQuestionCard({ q, idx, onEdit, onDelete, isDeleting, isPublished }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id, disabled: isPublished });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-5 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group overflow-hidden ${isDragging ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2 mt-1">
            <span className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
              {idx + 1}
            </span>
            <div 
              {...attributes} 
              {...listeners} 
              className={`cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${isPublished ? 'hidden' : ''}`}
            >
              <GripVertical className="text-gray-300 group-hover:text-gray-400 transition-colors" size={16} />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">
                {q.type.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  onClick={() => onEdit(q)}
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-primary rounded-full"
                >
                  <Edit2 size={14} />
                </Button>
                <Button 
                  onClick={() => onDelete(q.id)}
                  disabled={isDeleting}
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-red-500 rounded-full"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-900 dark:text-gray-100 font-semibold mb-3 leading-relaxed">
              {q.question}
            </p>
            
            {q.type === 'MULTIPLE_CHOICE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className={`group/opt flex items-center gap-3 text-sm p-3 rounded-xl border transition-all ${q.correctAnswer === opt ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-gray-50/50 border-gray-100 text-gray-600 dark:bg-gray-900/50 dark:border-gray-800'}`}>
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${q.correctAnswer === opt ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                      {opt}
                    </span>
                    <span className="flex-1 line-clamp-1">{(q as any)[`option${opt}`]}</span>
                    {q.correctAnswer === opt && <Check className="text-emerald-500 h-4 w-4" />}
                  </div>
                ))}
              </div>
            )}

            {q.type === 'TRUE_FALSE' && (
               <div className="flex gap-4 mt-3">
                  <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${q.correctAnswer === 'TRUE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold border-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                    TRUE
                  </div>
                  <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${q.correctAnswer === 'FALSE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold border-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                    FALSE
                  </div>
               </div>
            )}
            
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                  MARKS: <span className="text-gray-900 dark:text-white font-black">{q.marks}</span>
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider flex items-center gap-1 uppercase">
                <Check size={12} /> Correct Answer: <span className="font-black underline underline-offset-4">{q.correctAnswer}</span>
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
