/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Sparkles, FileText, Loader2, Check, RefreshCw, AlertCircle, Lock, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { useFeatureAccess } from "@/lib/api/hooks/useFeatureAccess";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // 1. Check feature access for aiInsights
  const { data: hasAiAccess, isLoading: checkingAccess } = useFeatureAccess("aiInsights");

  // 2. Fetch daily AI usage stats
  const { data: aiUsage, refetch: refetchAiUsage } = useQuery({
    queryKey: ["ai-usage"],
    queryFn: async () => {
      const response = await apiClient.get("/subscription/ai-usage");
      return response.data.data as { current: number; limit: number; remaining: number };
    },
    enabled: !!hasAiAccess,
  });

  const isLimitReached = aiUsage ? aiUsage.remaining <= 0 : false;

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
      refetchAiUsage();
    },
    onError: (err: any) => {
      console.error("AI Generation error:", err);
      const status = err.response?.status;
      const message = err.response?.data?.message || "AI Generation failed";
      
      if (status === 429) {
        toast.error(message);
        setIsLimitModalOpen(true);
      } else if (status === 403) {
        toast.error("AI Insights subscription required.");
        setIsUpgradeModalOpen(true);
      } else {
        toast.error(message);
      }
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
      refetchAiUsage();
    },
    onError: (err: any) => {
      console.error("AI Parse error:", err);
      const status = err.response?.status;
      const message = err.response?.data?.message || "Text parsing failed";
      
      if (status === 429) {
        toast.error(message);
        setIsLimitModalOpen(true);
      } else if (status === 403) {
        toast.error("AI Insights subscription required.");
        setIsUpgradeModalOpen(true);
      } else {
        toast.error(message);
      }
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
    if (isLimitReached) {
      setIsLimitModalOpen(true);
      return;
    }

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

  // Loading state for feature check
  if (checkingAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium text-gray-500">Checking AI feature access...</span>
      </div>
    );
  }

  // Not Subscribed View
  if (!hasAiAccess) {
    return (
      <div className="space-y-6">
        <Card className="p-8 border-dashed border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Lock size={32} className="text-amber-500" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2">
                AI Generation Tools
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Premium
                </span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Automate question generation, parse exam text, and draft subject materials in seconds with our advanced AI assistant.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="rounded-xl px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white font-bold shadow-lg shadow-amber-500/15 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Sparkles size={16} /> Upgrade to AI Insights
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Upgrade Modal */}
        <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10" />
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-400/5 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                    <Lock size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Premium Feature</p>
                    <h2 className="text-xl font-black tracking-tight text-white">AI Insights</h2>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Unlock powerful tools that generate assignment & exam questions, analyze curriculum concepts, and parse documents automatically.
                </p>
              </div>
            </div>
            <div className="p-8 bg-white dark:bg-slate-950 space-y-6">
              <div className="space-y-3">
                {[
                  'Generate multiple choice, true/false, & short answer questions',
                  'Parse raw textbooks, transcripts, or exams directly',
                  'Save hours of prep time with direct database integration',
                  'Access high-quality customized question banks',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 flex items-center justify-center shrink-0">
                      <Sparkles size={10} className="text-amber-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => { setIsUpgradeModalOpen(false); window.location.href = '/dashboard/admin/billing'; }}
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> Upgrade Your Plan <ArrowRight size={16} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="w-full h-10 rounded-xl font-bold text-slate-500 hover:text-slate-700 text-sm"
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

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
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
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

      {isLimitReached && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3 rounded-xl flex items-start gap-2 text-xs text-red-700 dark:text-red-400 mt-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Daily AI limit reached.</span> Quota resets tomorrow.{" "}
            <button 
              onClick={() => setIsLimitModalOpen(true)}
              className="underline font-bold hover:text-red-800 dark:hover:text-red-300 ml-1"
            >
              Upgrade plan to get more.
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center gap-3 pt-4 border-t">
        <div>
          {aiUsage && (
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Clock size={13} className="text-primary" />
              <span>{aiUsage.remaining} of {aiUsage.limit} prompts left today</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
          <Button
            disabled={isGenerating}
            onClick={handleAction}
            className={`rounded-xl min-w-[160px] gap-2 shadow-lg ${isLimitReached ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/10' : 'shadow-primary/10'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {mode === 'generate' ? 'Generating...' : 'Parsing...'}
              </>
            ) : isLimitReached ? (
              <>
                <Lock size={16} />
                Limit Reached
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

      {/* Daily Limit Reached Modal */}
      <Dialog open={isLimitModalOpen} onOpenChange={setIsLimitModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-amber-500/10" />
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-red-500/5 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-red-50/10 border border-red-500/20 flex items-center justify-center">
                  <Clock size={24} className="text-red-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Limit Reached</p>
                  <h2 className="text-xl font-black tracking-tight text-white">Daily AI limit hit</h2>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                You have used all of your daily AI prompts. The quota will reset tomorrow at midnight.
              </p>
            </div>
          </div>
          <div className="p-8 bg-white dark:bg-slate-950 space-y-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Upgrade to a higher plan to get more daily prompts and run unlimited generations.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => { setIsLimitModalOpen(false); window.location.href = '/dashboard/admin/billing'; }}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Upgrade Plan <ArrowRight size={16} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsLimitModalOpen(false)}
                className="w-full h-10 rounded-xl font-bold text-slate-500 hover:text-slate-700 text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
