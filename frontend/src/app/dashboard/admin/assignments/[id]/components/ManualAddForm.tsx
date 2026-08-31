"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, X, Loader2, Save, ChevronRight, Lightbulb, AlignLeft, ListChecks, ToggleLeft, BookOpen } from "lucide-react";
import QuestionTextEditor from "../../../exams/Questions/components/QuestionTextEditor";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";

// ─── Types ───────────────────────────────────────────────────────────────────
type QType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";

const QUESTION_TYPES: { value: QType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: ListChecks,  description: "Students pick one correct option from A–D" },
  { value: "TRUE_FALSE",      label: "True / False",    icon: ToggleLeft,   description: "Students mark a statement true or false" },
  { value: "SHORT_ANSWER",    label: "Short Answer",    icon: AlignLeft,    description: "Students write a brief response" },
  { value: "ESSAY",           label: "Essay / Theory",  icon: BookOpen,     description: "Students write a detailed long-form answer" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ManualAddForm({
  assignmentId,
  onCancel,
  initialData,
}: {
  assignmentId: string;
  onCancel: () => void;
  initialData?: any;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const [type,          setType]          = useState<QType>(initialData?.type || "MULTIPLE_CHOICE");
  const [question,      setQuestion]      = useState<string>(initialData?.question || "");
  const [marks,         setMarks]         = useState<number>(initialData?.marks || 1);
  const [correctAnswer, setCorrectAnswer] = useState<string>(initialData?.correctAnswer || "A");
  const [options, setOptions] = useState({
    A: initialData?.optionA || "",
    B: initialData?.optionB || "",
    C: initialData?.optionC || "",
    D: initialData?.optionD || "",
  });
  const [images,       setImages]       = useState<string[]>(initialData?.images || []);
  const [imageLabels,  setImageLabels]  = useState<string[]>(initialData?.imageLabels || []);
  const [explanation,  setExplanation]  = useState<string>(initialData?.explanation || "");
  const [showOptLatex, setShowOptLatex] = useState(false);

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) return apiClient.patch(`/assignment/questions/${initialData.id}`, data);
      return (await apiClient.post(`/assignment/${assignmentId}/questions`, data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-detail", assignmentId] });
      toast.success(isEditing ? "Question updated!" : "Question added!");
      onCancel();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || `Failed to ${isEditing ? "update" : "add"} question`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) { toast.error("Question text is required"); return; }
    if (type === "MULTIPLE_CHOICE" && (!options.A.trim() || !options.B.trim())) {
      toast.error("At least options A and B are required");
      return;
    }
    mutation.mutate({
      type: type === "ESSAY" ? "SHORT_ANSWER" : type,
      question, marks, correctAnswer, explanation,
      ...(type === "MULTIPLE_CHOICE" ? {
        optionA: options.A, optionB: options.B, optionC: options.C, optionD: options.D,
      } : {}),
    });
  };

  const selectedTypeMeta = QUESTION_TYPES.find(t => t.value === type)!;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-0">

      {/* ── Form Header ── */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Plus size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">
              {isEditing ? "Edit Question" : "New Question"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{selectedTypeMeta.description}</p>
          </div>
        </div>
        <button type="button" onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT: Type + Question + Explanation */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Question Type Selector — segmented pill tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question Type</p>
            <div className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-0.5">
              {QUESTION_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex h-full grow items-center justify-center rounded-lg px-2 text-xs font-bold leading-normal transition-all whitespace-nowrap ${
                    type === value
                      ? "bg-white dark:bg-primary shadow-sm text-primary dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text Editor card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1">
            {/* QuestionTextEditor already renders its own label + preview toggle + FormulaToolbar */}
            <QuestionTextEditor
              questionText={question}
              onQuestionTextChange={setQuestion}
              images={images}
              imageLabels={imageLabels}
              onImagesChange={setImages}
              onImageLabelsChange={setImageLabels}
              placeholder="Type your question here… e.g. 'Solve for $x$: $x^2 + 2x + 1 = 0$'"
            />
          </div>

          {/* Explanation card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Explanation <span className="normal-case font-normal text-slate-400">(Optional)</span>
              </p>
            </div>
            <Textarea
              placeholder="Explain why the correct answer is right — shown to students after submission…"
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              className="rounded-xl min-h-[90px] resize-none text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* RIGHT: Marks + Answer Options/Correct Answer */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Marks card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marks</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMarks(m => Math.max(1, m - 1))}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-lg"
              >−</button>
              <Input
                type="number" min={1} value={marks}
                onChange={e => setMarks(parseInt(e.target.value) || 1)}
                className="text-center font-black text-lg rounded-xl h-9 border-slate-200 dark:border-slate-700"
              />
              <button type="button" onClick={() => setMarks(m => m + 1)}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-lg"
              >+</button>
            </div>
          </div>

          {/* Answer Options — Multiple Choice */}
          {type === "MULTIPLE_CHOICE" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Answer Options</p>
                <button type="button" onClick={() => setShowOptLatex(p => !p)}
                  className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                >
                  {showOptLatex ? "Hide LaTeX" : "LaTeX Preview"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 -mt-2">Click the letter to mark the correct answer.</p>

              <div className="space-y-3">
                {(["A", "B", "C", "D"] as const).map(opt => (
                  <div key={opt} className="flex gap-2.5 items-start">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(opt)}
                      className={`mt-2 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 text-xs font-black transition-all ${
                        correctAnswer === opt
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900 scale-110"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700"
                      }`}
                    >
                      {correctAnswer === opt ? <Check size={13} strokeWidth={3} /> : opt}
                    </button>
                    <div className="flex-1 space-y-1.5">
                      <Input
                        placeholder={`Option ${opt}…`}
                        value={options[opt]}
                        onChange={e => setOptions(o => ({ ...o, [opt]: e.target.value }))}
                        className={`rounded-xl text-sm h-9 border-slate-200 dark:border-slate-700 transition-all ${
                          correctAnswer === opt
                            ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 focus:ring-emerald-200"
                            : "bg-slate-50 dark:bg-slate-800/50"
                        }`}
                      />
                      {showOptLatex && options[opt]?.includes("$") && (
                        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                          <LaTeXRenderer content={options[opt]} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* True / False */}
          {type === "TRUE_FALSE" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correct Answer</p>
              <div className="flex gap-3">
                {(["TRUE", "FALSE"] as const).map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCorrectAnswer(val)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-black transition-all ${
                      correctAnswer === val
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Short Answer / Essay — model answer */}
          {(type === "SHORT_ANSWER" || type === "ESSAY") && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Model Answer / Key Points</p>
              <Textarea
                placeholder="Enter the expected answer or key points for grading…"
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                className="rounded-xl min-h-[110px] resize-none text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          {/* Submit actions */}
          <div className="flex flex-col gap-2.5 pt-1">
            <Button
              disabled={mutation.isPending}
              className="w-full rounded-xl h-11 font-black gap-2 shadow-md shadow-primary/20 text-sm"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{isEditing ? "Saving…" : "Adding…"}</>
              ) : (
                <>{isEditing ? <Save size={16} /> : <ChevronRight size={16} />}{isEditing ? "Update Question" : "Save Question"}</>
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}
              className="w-full rounded-xl h-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
