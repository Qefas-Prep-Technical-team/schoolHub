/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, FileText, Loader2, Check, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";

interface AIQuestion {
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  question: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctAnswer: string;
  explanation: string | null;
  marks: number;
}

export default function AITools({
  paperId,
  examId,
  paper,
  onCancel
}: {
  paperId: string;
  examId: string;
  paper: any;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"generate" | "parse">("generate");
  const [prompt, setPrompt] = useState("");
  const [rawText, setRawText] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [previewQuestions, setPreviewQuestions] = useState<AIQuestion[]>([]);

  // Mutation to generate questions
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/exams/ai/generate", {
        prompt,
        subjectName: paper.title,
        examTitle: paper.exam?.title,
        questionCount
      });
      return response.data.data.questions;
    },
    onSuccess: (data) => {
      setPreviewQuestions(data);
      toast.success("Questions generated!");
    },
    onError: (err: any) => {
      console.error("AI Generation error:", err);
      toast.error("AI Generation failed");
    }
  });

  // Mutation to parse text
  const parseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/exams/ai/parse-text", {
        rawText,
        subjectName: paper.title,
        examTitle: paper.exam?.title
      });
      return response.data.data.questions;
    },
    onSuccess: (data) => {
      setPreviewQuestions(data);
      toast.success("Text parsed successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Text parsing failed");
    }
  });

  // Mutation to add previewed questions to the paper
  const addQuestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/exams/${examId}/papers/${paperId}/questions/ai`, {
        questions: previewQuestions
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success(`${previewQuestions.length} questions added to paper!`);
      onCancel();
    },
    onError: (err: any) => {
      console.error("Failed to add questions:", err);
      toast.error(err.response?.data?.message || "Failed to add questions");
    }
  });

  const isGenerating = generateMutation.isPending || parseMutation.isPending;

  const handleAction = () => {
    if (mode === "generate") {
      if (!prompt.trim()) {
        toast.error("Please enter a prompt");
        return;
      }
      generateMutation.mutate();
    } else {
      if (!rawText.trim()) {
        toast.error("Please paste some exam text");
        return;
      }
      parseMutation.mutate();
    }
  };

  if (previewQuestions.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Review Generated Questions ({previewQuestions.length})</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewQuestions([])} className="rounded-xl">
              <RefreshCw size={14} className="mr-2" /> Start Over
            </Button>
            <Button
              onClick={() => addQuestionsMutation.mutate()}
              disabled={addQuestionsMutation.isPending}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            >
              {addQuestionsMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check size={16} className="mr-2" />}
              Add to Paper
            </Button>
          </div>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          {previewQuestions.map((q, idx) => (
            <Card key={idx} className="p-4 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {q.type}
                </span>
                <span className="text-xs font-bold text-gray-400">{q.marks} pts</span>
              </div>
              <div className="text-sm font-medium mb-3">
                <LaTeXRenderer content={q.question} />
              </div>
              {q.type === 'MULTIPLE_CHOICE' && (
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div key={opt} className={`p-1.5 rounded border ${(q as any)[`option${opt}`] ? 'bg-white dark:bg-gray-800 flex items-center gap-2' : 'opacity-50'} ${q.correctAnswer === opt ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-100 dark:border-gray-700'}`}>
                      <span className="font-bold mr-1 shrink-0">{opt}:</span> 
                      <LaTeXRenderer content={(q as any)[`option${opt}`] || 'N/A'} className="text-[10px]" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full mb-6">
        <button
          onClick={() => setMode("generate")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "generate"
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Sparkles size={16} /> Generate with AI
        </button>
        <button
          onClick={() => setMode("parse")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "parse"
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <FileText size={16} /> Parse Raw Text
        </button>
      </div>

      {mode === "generate" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Describe the questions you need</Label>
              <Textarea
                placeholder="e.g. Generate 5 difficult algebra questions focusing on quadratic equations for grade 10 students."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                  className="rounded-xl"
                  max={50}
                />
              </div>
              <div className="flex items-end">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-2 rounded-xl flex items-start gap-2 text-[10px] text-amber-700 dark:text-amber-400">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  AI may take up to 30 seconds to generate high-quality questions.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "parse" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paste Exam Text</Label>
              <Textarea
                placeholder="Paste the raw text of an existing exam here. AI will identify questions, options, and answers."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="min-h-[200px] rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary/20"
              />
            </div>
            <p className="text-[11px] text-gray-500 italic">
              Best results are achieved when text is clear and follows a standard pattern.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button
          disabled={isGenerating}
          onClick={handleAction}
          className="rounded-xl min-w-[160px] gap-2 shadow-lg shadow-primary/10"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {mode === 'generate' ? 'Generating...' : 'Parsing...'}
            </>
          ) : (
            <>
              {mode === 'generate' ? <Sparkles size={16} /> : <FileText size={16} />}
              {mode === 'generate' ? 'Generate Questions' : 'Start Parsing'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
